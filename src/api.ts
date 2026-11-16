// Ironclad Roofing Co. — shared API handlers, web-standard Request/Response.
//
// One implementation serves both runtimes: the Cloudflare Worker entry
// (src/worker.ts, used on Whop hosting) and the local Node server (the
// main-module guard in worker.ts). `handleApi` returns null for anything
// that is not an /api/* route, so the caller can do static/SPA fallback.
//
// Behaviours are the contract the site was verified against: same status
// codes, same error strings, same JSON shapes. Do not "improve" them
// without re-verifying the client pages that depend on them.

import { unwrapWebhook } from "@whop/sdk/helpers";
import { getPlan, isCheckoutLive, PLANS } from "./lib/plans.js";
import {
	chargeInvoice,
	createInvoice,
	createLead,
	createSetupIntent,
	readWhopEnv,
	type EstimateLead,
	type WhopEnv,
} from "./lib/whop-server.js";

// In-memory records for this demo template. A production business would
// persist these (database / CRM) instead of keeping them in process memory.
const fulfilledPayments = new Map<string, unknown>();
const savedMethods = new Map<string, string>();

export function getFulfilledPayments(): Map<string, unknown> {
	return fulfilledPayments;
}

export function getSavedMethods(): Map<string, string> {
	return savedMethods;
}

function json(body: unknown, status = 200): Response {
	return new Response(JSON.stringify(body), {
		headers: { "Content-Type": "application/json" },
		status,
	});
}

async function readJsonBody(
	request: Request,
): Promise<{ ok: true; body: Record<string, unknown> } | { ok: false }> {
	let text: string;
	try {
		text = await request.text();
	} catch {
		return { ok: false };
	}
	if (!text.trim()) return { ok: true, body: {} };
	try {
		const parsed: unknown = JSON.parse(text);
		if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
			return { ok: false };
		}
		return { ok: true, body: parsed as Record<string, unknown> };
	} catch {
		return { ok: false };
	}
}

/** Handle an /api/* request. Returns null when the path is not an API route. */
export async function handleApi(
	request: Request,
	env: WhopEnv,
): Promise<Response | null> {
	const url = new URL(request.url);
	const path = url.pathname;
	const method = request.method;

	if (path === "/api/health" && method === "GET") {
		return json({ ok: true });
	}

	if (path === "/api/config" && method === "GET") {
		return json({
			checkoutLive: isCheckoutLive(),
			configured: Boolean(env.apiKey && env.accountId),
			plans: PLANS.map((p) => ({
				name: p.name,
				price: p.price,
				slug: p.slug,
			})),
		});
	}

	if (path === "/api/webhooks/whop" && method === "POST") {
		if (!env.webhookSecret) {
			return json({ error: "webhook_not_configured" }, 400);
		}
		// The signature covers the exact bytes sent — use the raw text.
		const raw = await request.text();
		const headers: Record<string, string> = {};
		request.headers.forEach((value, key) => {
			headers[key] = value;
		});
		let event: Record<string, unknown>;
		try {
			event = unwrapWebhook(raw, {
				headers,
				key: env.webhookSecret,
			});
		} catch (err) {
			console.error("[webhook] verification failed:", (err as Error).message);
			return json({ error: "invalid_signature" }, 400);
		}
		// Fulfilment happens ONLY here — never from a browser callback.
		const type = String(event.type ?? "");
		if (type === "payment.succeeded") {
			const payment = (event.data as Record<string, unknown> | undefined) ?? {};
			console.log("[webhook] payment.succeeded:", payment.id ?? payment);
			fulfilledPayments.set(String(payment.id ?? ""), event);
		} else if (type === "setup_intent.succeeded") {
			const si = (event.data as Record<string, unknown> | undefined) ?? {};
			console.log(
				"[webhook] setup_intent.succeeded:",
				si.id ?? si,
				"payment_method:",
				si.payment_method_id ?? "?",
			);
			savedMethods.set(
				String(si.member_id ?? ""),
				String(si.payment_method_id ?? ""),
			);
		} else {
			console.log("[webhook] ignored event:", type);
		}
		return json({ received: true });
	}

	if (path === "/api/estimate" && method === "POST") {
		const parsed = await readJsonBody(request);
		if (!parsed.ok) return json({ error: "invalid_json" }, 400);
		const body = parsed.body as Partial<EstimateLead>;
		const required = ["name", "email", "service", "city", "message"] as const;
		for (const field of required) {
			if (!body[field] || String(body[field]).trim() === "") {
				return json({ error: `missing_field:${field}` }, 400);
			}
		}
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(body.email))) {
			return json({ error: "invalid_email" }, 400);
		}
		if (!env.apiKey || (!env.companyId && !env.accountId)) {
			// Honest answer: the form is wired, the CRM is not connected yet.
			return json(
				{
					error: "leads_not_configured",
					message:
						"The estimate form is ready, but the site is not connected to Whop yet — wire the Company API key at deploy time and quote requests will land as leads.",
				},
				503,
			);
		}
		try {
			const { status, json: result, via } = await createLead(
				env,
				{
					city: String(body.city),
					email: String(body.email),
					message: String(body.message),
					name: String(body.name),
					phone: body.phone ? String(body.phone) : undefined,
					service: String(body.service),
				},
				new URL(request.url).origin,
			);
			if (status !== 201 && status !== 200) {
				console.error("[estimate] leads API failed:", status, JSON.stringify(result));
				return json({ error: "leads_failed" }, 502);
			}
			console.info("[estimate] lead recorded via", via);
			return json({ ok: true });
		} catch (err) {
			console.error("[estimate] error:", (err as Error).message);
			return json({ error: "leads_failed" }, 502);
		}
	}

	if (path === "/api/setup-intent" && method === "POST") {
		const parsed = await readJsonBody(request);
		if (!parsed.ok) return json({ error: "invalid_json" }, 400);
		const token = String(parsed.body.confirmation_token ?? "");
		if (!token) {
			return json({ error: "missing_confirmation_token" }, 400);
		}
		if (!env.apiKey || !env.accountId) {
			return json({ error: "payments_not_configured" }, 503);
		}
		try {
			const origin = new URL(request.url).origin;
			const result = await createSetupIntent(
				env,
				token,
				`${origin}/deposit?setup=done`,
			);
			return json({
				client_secret: result.clientSecret,
				id: result.id,
				payment_method_id: result.paymentMethodId,
				status: result.status,
			});
		} catch (err) {
			console.error("[setup-intent] error:", (err as Error).message);
			return json({ error: "setup_intent_failed" }, 502);
		}
	}

	if (path === "/api/invoice" && method === "POST") {
		const parsed = await readJsonBody(request);
		if (!parsed.ok) return json({ error: "invalid_json" }, 400);
		const body = parsed.body as {
			member_id?: unknown;
			plan_slug?: unknown;
			payment_method_id?: unknown;
			memo?: unknown;
			recipient_emails?: unknown;
		};
		if (!env.apiKey || !env.accountId) {
			return json({ error: "payments_not_configured" }, 503);
		}
		const plan = getPlan(String(body.plan_slug ?? ""));
		if (!plan) {
			return json({ error: "unknown_plan" }, 400);
		}
		if (!body.member_id || String(body.member_id).trim() === "") {
			return json({ error: "missing_member_id" }, 400);
		}
		try {
			const result = await createInvoice(env, {
				items: [{ plan_id: plan.whopPlanId }],
				memberId: String(body.member_id),
				memo: body.memo ? String(body.memo) : `Final balance — ${plan.name}`,
				paymentMethodId: body.payment_method_id
					? String(body.payment_method_id)
					: undefined,
				recipientEmails: Array.isArray(body.recipient_emails)
					? (body.recipient_emails as unknown[]).map(String)
					: undefined,
			});
			return json({
				checkout_link: result.checkoutLink,
				id: result.id,
				status: result.status,
			});
		} catch (err) {
			console.error("[invoice] error:", (err as Error).message);
			return json({ error: "invoice_failed" }, 502);
		}
	}

	const chargeMatch = path.match(/^\/api\/invoice\/([^/]+)\/charge$/);
	if (chargeMatch && method === "POST") {
		if (!env.apiKey || !env.accountId) {
			return json({ error: "payments_not_configured" }, 503);
		}
		try {
			const { status, json: result } = await chargeInvoice(
				env,
				decodeURIComponent(chargeMatch[1]),
			);
			return json(result, status);
		} catch (err) {
			console.error("[invoice charge] error:", (err as Error).message);
			return json({ error: "invoice_charge_failed" }, 502);
		}
	}

	return null;
}

export { readWhopEnv };
export type { WhopEnv };
