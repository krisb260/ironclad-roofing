import { loadWhop } from "@whop/elements";
import { WhopElements } from "@whop/elements-react";
import { useCallback, useState, type ReactNode } from "react";

/**
 * Safe wrapper around Whop's <WhopElements> provider.
 *
 * Two things the raw provider gets wrong if used naively:
 * 1. Without `onLoadError` it THROWS when the Elements SDK script fails to
 *    load (offline, blocked CDN, …) — and a throw during render unmounts
 *    the entire React tree, leaving a blank page. With onLoadError set the
 *    provider stays mounted and we show an honest in-page error + retry.
 * 2. `loadWhop()` must be called once per app, not once per render —
 *    here it is a lazy module-level singleton, created the first time a
 *    checkout/deposit page actually needs it.
 */
let elementsPromise: ReturnType<typeof loadWhop> | null = null;

function getElements() {
	if (!elementsPromise) elementsPromise = loadWhop();
	return elementsPromise;
}

export function WhopElementsSafe({ children }: { children: ReactNode }) {
	const [elements] = useState(getElements);
	const [loadError, setLoadError] = useState<Error | null>(null);
	const [retryLoad, setRetryLoad] = useState<(() => void) | null>(null);

	const onLoadError = useCallback((error: Error, retry: () => void) => {
		setLoadError(error);
		setRetryLoad(() => retry);
	}, []);

	function onRetry() {
		setLoadError(null);
		setRetryLoad(null);
		retryLoad?.();
	}

	return (
		<WhopElements elements={elements} onLoadError={onLoadError}>
			{loadError ? (
				<div className="notice error">
					<strong>Secure checkout couldn&rsquo;t load.</strong> The payment form failed to
					load ({loadError.message}). Nothing was charged. Check your connection and try
					again — card details are only ever entered inside the secure Whop form.
					<div style={{ marginTop: 14 }}>
						<button className="btn btn-primary" type="button" onClick={onRetry}>
							Try loading checkout again
						</button>
					</div>
				</div>
			) : (
				children
			)}
		</WhopElements>
	);
}
