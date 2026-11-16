import { cloudflare } from "@cloudflare/vite-plugin";
import react from "@vitejs/plugin-react";
import { whop } from "@whop/cli/vite";
import { defineConfig } from "vite";

// Single config for both environments (Vite 6 Environment API):
//  - client env: the React SPA -> dist/client (index.html + assets)
//  - ssr env ("ssr"): the Worker entry src/worker.ts -> dist/server/index.js
// The worker entry comes from wrangler.jsonc `main`. The whop() plugin
// packs dist/client + dist/server into dist/whop-build.zip for deploy.
export default defineConfig({
	environments: {
		ssr: {
			build: {
				outDir: "dist/server",
				rollupOptions: {
					output: {
						entryFileNames: "index.js",
					},
				},
			},
		},
	},
	plugins: [react(), cloudflare({ viteEnvironment: { name: "ssr" } }), whop()],
	server: {
		port: 5173,
	},
});
