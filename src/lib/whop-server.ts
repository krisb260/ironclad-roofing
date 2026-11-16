// Server-side Whop helpers. Every call uses plain fetch against the Whop
// REST API with the Company API key from the environment — the key never
// reaches the browser. Nothing here invents credentials: without a key the
// routes answer 503 "not configured" instead of pretending to work.

export interface WhopEnv {
	/** Company API key (IRONCLAD_API_KEY). Undefined until deploy. */
	apiKey: string | undefined;
	/** Business id, e.g. biz_… (WHOP_ACCOUNT_ID). */
	accountId: string | undefined;
	/** Webhook signing secret, e.g. ws_… (IRONCLAD_WEBHOOK_SECRET). */
	webhookSecret: string | undefined;
	/** Business id for the Legacy v2 Leads API (WHOP_COMPANY_ID). */
	companyId: string | undefined;
	/** API origin — production by default, sandbox-api.whop.com for tests. */
	apiOrigin: string;
}

/**
 * Read the Whop server config. `overrides` wins over process.env — the
 * Worker runtime passes its bindings (app secrets) as overrides, while
 * local Node runs read plain process.env.
 */
export function readWhopEnv(
	overrides?: Record<string, string | undefined>,
): WhopEnv {
	const get = (key: string): string | undefined =>
		overrides?.[key] ?? process.env[key] ?? undefined;
	return {
		accountId: get("WHOP_ACCOUNT_ID"),
		apiKey: get("IRONCLAD_API_KEY"),
		apiOrigin: get("WHOP_API_ORIGIN") || "https://api.whop.com",
		companyId: get("WHOP_COMPANY_ID"),
		webhookSecret: get("IRONCLAD_WEBHOOK_SECRET"),
	};
}

/** Dated API version the Current API expects. */
const API_VERSION_DATE = "2026-11-14-1";

async function whopFetch(
	env: WhopEnv,
	path: string,
	init: { method: string; body?: unknown },
): Promise<{ status: number; json: unknown }> {
	const res = await fetch(`${env.apiOrigin}${path}`, {
		body: init.body === undefined ? undefined : JSON.stringify(init.body),
		headers: {
			"Api-Version-Date": API_VERSION_DATE,
			Authorization: `Bearer ${env.apiKey as string}`,
			"Content-Type": "application/json",
		},
		method: init.method,
	});
	const text = await res.text();
	let json: unknown = null;
	try {
		json = text ? JSON.parse(text) : null;
	} catch {
		json = { raw: text };
	}
	return { json, status: res.status };
}

export interface SetupIntentResult {
	clientSecret: string | null;
	id: string;
	paymentMethodId: string | null;
	status: string;
}

/**
 * Create a setup intent from a confirmation token collected by the payment
 * elements in `mode: "setup"`. Saving the card charges nothing — the
 * returned payment method (`payt_…`) is what the final invoice charges.
 */
export async function createSetupIntent(
	env: WhopEnv,
	confirmationToken: string,
	returnUrl: string,
): Promise<SetupIntentResult> {
	const { status, json } = await whopFetch(env, "/api/v1/setup_intents", {
		body: {
			account_id: env.accountId,
			confirmation_token: confirmationToken,
			currency: "usd",
			return_url: returnUrl,
		},
		method: "POST",
	});
	if (status !== 201 && status !== 200) {
		throw new Error(`setup_intents failed (${status}): ${JSON.stringify(json)}`);
	}
	const body = json as Record<string, unknown>;
	return {
		clientSecret: (body.client_secret as string | null) ?? null,
		id: body.id as string,
		paymentMethodId: (body.payment_method_id as string | null) ?? null,
		status: body.status as string,
	};
}

export interface InvoiceItem {
	plan_id: string;
}

export interface InvoiceResult {
	checkoutLink: string | null;
	id: string;
	status: string;
}

/**
 * Create a draft invoice for the final balance, then issue/send it so the
 * saved payment method is charged. Draft creation alone charges nobody.
 */
export async function createInvoice(
	env: WhopEnv,
	input: {
		memberId: string;
		items: InvoiceItem[];
		paymentMethodId?: string;
		memo?: string;
		recipientEmails?: string[];
	},
): Promise<InvoiceResult> {
	const { status, json } = await whopFetch(env, "/api/v1/invoices", {
		body: {
			account_id: env.accountId,
			items: input.items,
			member_id: input.memberId,
			memo: input.memo,
			payment_method_id: input.paymentMethodId,
			recipient_emails: input.recipientEmails,
		},
		method: "POST",
	});
	if (status !== 201 && status !== 200) {
		throw new Error(`invoices failed (${status}): ${JSON.stringify(json)}`);
	}
	const body = json as Record<string, unknown>;
	return {
		checkoutLink: (body.checkout_link as string | null) ?? null,
		id: body.id as string,
		status: body.status as string,
	};
}

/** Charge an already-open invoice against its saved payment method. */
export async function chargeInvoice(
	env: WhopEnv,
	invoiceId: string,
): Promise<{ status: number; json: unknown }> {
	return whopFetch(env, `/api/v1/invoices/${invoiceId}/charge`, {
		method: "POST",
	});
}

export interface EstimateLead {
	email: string;
	message: string;
	name: string;
	phone?: string;
	service: string;
	city: string;
}

/**
 * Create a lead in Whop's CRM. Leads live on the Legacy v2 API — there is
 * no Current API successor — so this tries POST /api/v2/leads first.
 *
 * VERIFIED 2026-11-16: Whop's v2 leads resource answers a blanket 401
 * ("does not have permission to access this route") to Company API keys —
 * even with Manage leads granted on the key (confirmed in the dashboard),
 * and even for a plain GET /leads list call. The same blanket 401 is
 * documented by the community Whop MCP client for other v2 resources.
 * So on a 401 only, this falls back to the Current API's standard "lead"
 * conversion event (POST /v1/events), which Company API keys CAN record
 * (verified live). The event carries the requester's identity and the
 * estimate page; the free-text service/message detail has no field on a
 * conversion event, so it is only preserved by the real Leads API.
 * Any non-401 failure is a real error and is reported, not masked.
 */
export async function createLead(
	env: WhopEnv,
	lead: EstimateLead,
	origin?: string,
): Promise<{ status: number; json: unknown; via: "leads" | "events" }> {
	const res = await fetch(`${env.apiOrigin}/api/v2/leads`, {
		body: JSON.stringify({
			company_id: env.companyId ?? env.accountId,
			email: lead.email,
			metadata: {
				city: lead.city,
				message: lead.message,
				phone: lead.phone ?? "",
				service: lead.service,
			},
			name: lead.name,
			source: "website_estimate_form",
		}),
		headers: {
			Authorization: `Bearer ${env.apiKey as string}`,
			"Content-Type": "application/json",
		},
		method: "POST",
	});
	const text = await res.text();
	let json: unknown = null;
	try {
		json = text ? JSON.parse(text) : null;
	} catch {
		json = { raw: text };
	}
	if (res.status !== 401) return { json, status: res.status, via: "leads" };
	// Blanket-401 wall on the legacy resource — record the standard lead event.
	const [firstName, ...rest] = lead.name.trim().split(/\s+/);
	const event = await whopFetch(env, "/api/v1/events", {
		body: {
			account_id: env.accountId,
			action_source: "website",
			event_name: "lead",
			url: origin ? `${origin}/estimate` : undefined,
			user: {
				city: lead.city,
				email: lead.email,
				first_name: firstName,
				last_name: rest.length > 0 ? rest.join(" ") : undefined,
				name: lead.name,
				phone: lead.phone ?? undefined,
			},
		},
		method: "POST",
	});
	return { ...event, via: "events" };
}
