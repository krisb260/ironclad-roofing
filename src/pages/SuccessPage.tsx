import { Link, useSearchParams } from "react-router-dom";

/**
 * Return page for the hosted checkout. Reads `?payment=` + `?status=` from
 * the URL for DISPLAY ONLY — a visit here never confirms a sale. Fulfilment
 * happens server-side, from the `payment.succeeded` webhook.
 */
export function SuccessPage() {
	const [params] = useSearchParams();
	const status = params.get("status");
	const payment = params.get("payment");
	const setup = params.get("setup");

	if (status === "succeeded") {
		return (
			<section className="section">
				<div className="container success-hero">
					<div className="big-tick">✓</div>
					<h1>Thank you — you&rsquo;re booked in.</h1>
					<p className="lede" style={{ margin: "0 auto" }}>
						Your payment went through. We&rsquo;ll confirm your booking by email within one business day.
					</p>
					{setup ? (
						<p className="notice success" style={{ maxWidth: 560, margin: "24px auto 0" }}>
							Your card was saved (setup {setup}). Nothing else was charged — the final balance is
							billed only when the job is done.
						</p>
					) : null}
					{payment ? (
						<p className="form-note">
							Reference: <code>{payment}</code>
						</p>
					) : null}
					<p style={{ marginTop: 28 }}>
						<Link className="btn btn-dark" to="/">
							Back to the homepage
						</Link>
					</p>
				</div>
			</section>
		);
	}

	if (status === "failed") {
		return (
			<section className="section">
				<div className="container success-hero">
					<h1>That payment didn&rsquo;t go through.</h1>
					<p className="lede" style={{ margin: "0 auto" }}>
						Nothing was charged. You can try again with a different card — or call us at (512)
						555-0148 and we&rsquo;ll sort it out.
					</p>
					<p style={{ marginTop: 28 }}>
						<Link className="btn btn-primary" to="/pricing">
							Try checkout again
						</Link>
					</p>
				</div>
			</section>
		);
	}

	if (status === "canceled") {
		return (
			<section className="section">
				<div className="container success-hero">
					<h1>No problem — checkout was cancelled.</h1>
					<p className="lede" style={{ margin: "0 auto" }}>
						Nothing was charged. Your estimate request and the rest of the site are still here whenever
						you&rsquo;re ready.
					</p>
					<p style={{ marginTop: 28 }}>
						<Link className="btn btn-dark" to="/">
							Back to the homepage
						</Link>
					</p>
				</div>
			</section>
		);
	}

	return (
		<section className="section">
			<div className="container success-hero">
				<h1>Checkout</h1>
				<p className="lede" style={{ margin: "0 auto" }}>
					This page shows your payment result after checkout. If you landed here directly, head to
					pricing to start an order.
				</p>
				<p style={{ marginTop: 28 }}>
					<Link className="btn btn-primary" to="/pricing">
						See pricing
					</Link>
				</p>
			</div>
		</section>
	);
}
