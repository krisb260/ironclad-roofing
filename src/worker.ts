// Ironclad Roofing Co. — server entry, built to dist/server/index.js.
//
// This module runs in TWO places, so it has two shells around one handler:
//  - On Whop hosting it runs as a Cloudflare Worker module: the runtime
//    calls the exported `fetch(request, env)`. Static assets are served by
//    the platform from dist/client (the ASSETS binding); this handler only
//    answers /api/* and the SPA fallback to index.html.
//  - Run directly under Node (`node dist/server/index.js`, the `preview`
//    script) it starts a plain node:http server on PORT that serves
//    dist/client from disk and answers the same /api/* routes.
//
// The Company API key lives only server-side: Worker bindings (app secrets)
// win, plain process.env is the fallback. Without a key the API routes
// answer 503 "not configured" — they never pretend a payment or lead
// succeeded.

import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { handleApi, readWhopEnv, type WhopEnv } from "./api.js";

interface WorkerEnv {
	ASSETS?: { fetch: (request: Request) => Promise<Response> };
	IRONCLAD_API_KEY?: string;
	WHOP_ACCOUNT_ID?: string;
	IRONCLAD_WEBHOOK_SECRET?: string;
	WHOP_COMPANY_ID?: string;
	WHOP_API_ORIGIN?: string;
	[key: string]: unknown;
}

const CONTENT_TYPES: Record<string, string> = {
	".css": "text/css; charset=utf-8",
	".html": "text/html; charset=utf-8",
	".ico": "image/x-icon",
	".js": "text/javascript; charset=utf-8",
	".json": "application/json; charset=utf-8",
	".png": "image/png",
	".svg": "image/svg+xml",
	".txt": "text/plain; charset=utf-8",
	".webp": "image/webp",
	".woff": "font/woff",
	".woff2": "font/woff2",
};

/** Shared request handler: /api/* first, then static/SPA fallback. */
async function handleFetch(
	request: Request,
	env: WhopEnv,
	assets?: { fetch: (request: Request) => Promise<Response> },
): Promise<Response | null> {
	const api = await handleApi(request, env);
	if (api) return api;
	if (request.method !== "GET" && request.method !== "HEAD") {
		return new Response("Not found", { status: 404 });
	}
	if (assets) {
		const hit = await assets.fetch(request);
		if (hit.status !== 404) return hit;
		// SPA fallback: client-side routes resolve to index.html.
		return assets.fetch(new Request(new URL("/index.html", request.url)));
	}
	// No asset binding (local Node run) — the caller serves from disk.
	return null;
}

export default {
	async fetch(request: Request, env: WorkerEnv): Promise<Response> {
		if (new URL(request.url).pathname === "/api/debug-env") {
			return new Response(JSON.stringify({ keys: Object.keys(env), hasAssets: Boolean(env.ASSETS) }), { headers: { "Content-Type": "application/json" } });
		}
		if (new URL(request.url).pathname === "/api/debug-env") {
			return new Response(JSON.stringify({ keys: Object.keys(env), hasAssets: Boolean(env.ASSETS) }), { headers: { "Content-Type": "application/json" } });
		}
		const whopEnv = readWhopEnv({
			WHOP_ACCOUNT_ID:
				typeof env.WHOP_ACCOUNT_ID === "string" ? env.WHOP_ACCOUNT_ID : undefined,
			IRONCLAD_API_KEY:
				typeof env.IRONCLAD_API_KEY === "string" ? env.IRONCLAD_API_KEY : undefined,
			WHOP_API_ORIGIN:
				typeof env.WHOP_API_ORIGIN === "string" ? env.WHOP_API_ORIGIN : undefined,
			WHOP_COMPANY_ID:
				typeof env.WHOP_COMPANY_ID === "string" ? env.WHOP_COMPANY_ID : undefined,
			IRONCLAD_WEBHOOK_SECRET:
				typeof env.IRONCLAD_WEBHOOK_SECRET === "string"
					? env.IRONCLAD_WEBHOOK_SECRET
					: undefined,
		});
		const res = await handleFetch(request, whopEnv, env.ASSETS);
		return res ?? new Response("Not found", { status: 404 });
	},
};

// --- local Node shell (only when run directly: `node dist/server/index.js`) ---
//
// Everything below runs only inside startNodeServer(), which is only
// called when this module is the Node main module. Nothing at module top
// level touches the filesystem or import.meta.url: in the Workers runtime
// import.meta.url is not a file URL, and fileURLToPath would throw on load.

function isMainModule(): boolean {
	try {
		const argv1 = (globalThis as { process?: { argv?: string[] } }).process
			?.argv?.[1];
		if (!argv1) return false;
		return (
			path.resolve(argv1) ===
			path.resolve(fileURLToPath(import.meta.url))
		);
	} catch {
		return false;
	}
}

function clientDir(serverDir: string): string {
	const nextToServer = path.join(serverDir, "../client");
	if (fs.existsSync(nextToServer)) return nextToServer;
	return path.resolve(process.cwd(), "dist/client");
}

function serveFile(filePath: string): Response | null {
	try {
		if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) return null;
		const ext = path.extname(filePath).toLowerCase();
		return new Response(fs.readFileSync(filePath), {
			headers: {
				"Content-Type": CONTENT_TYPES[ext] ?? "application/octet-stream",
			},
			status: 200,
		});
	} catch {
		return null;
	}
}

async function startNodeServer(): Promise<void> {
	const serverDir = path.dirname(fileURLToPath(import.meta.url));
	const dir = clientDir(serverDir);
	const env = readWhopEnv();
	const port = Number(process.env.PORT ?? 3000);
	const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
		try {
			const host = req.headers.host ?? `localhost:${port}`;
			const url = new URL(req.url ?? "/", `http://${host}`);
			// Read the body for methods that carry one (the webhook needs raw bytes).
			const chunks: Buffer[] = [];
			for await (const chunk of req) chunks.push(chunk as Buffer);
			const body = chunks.length > 0 ? Buffer.concat(chunks) : undefined;
			const request = new Request(url.toString(), {
				body:
					body !== undefined && req.method !== "GET" && req.method !== "HEAD"
						? (body as unknown as BodyInit)
						: undefined,
				headers: req.headers as unknown as HeadersInit,
				method: req.method ?? "GET",
			});
			let response = await handleFetch(request, env);
			if (!response) {
				// Static file from disk, else the SPA fallback.
				const filePath = path.join(dir, decodeURIComponent(url.pathname));
				response =
					serveFile(filePath) ??
					serveFile(path.join(dir, "index.html")) ??
					new Response("Site not built yet — run npm run build first.", {
						status: 404,
					});
			}
			const headers: Record<string, string> = {};
			response.headers.forEach((value, key) => {
				headers[key] = value;
			});
			res.writeHead(response.status, headers);
			res.end(Buffer.from(await response.arrayBuffer()));
		} catch (err) {
			console.error("[server] error:", (err as Error).message);
			if (!res.headersSent) res.writeHead(500);
			res.end("Internal error");
		}
	});
	server.listen(port, () => {
		console.log(`Ironclad Roofing Co. listening on http://localhost:${port}`);
	});
}

if (isMainModule()) {
	void startNodeServer();
}
