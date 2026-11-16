import { Checkout, CheckoutElement } from "@whop/elements-react";
import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { WhopElementsSafe } from "../components/WhopElementsSafe";
import { getPlan } from "../lib/plans";

/**
 * Checkout for one plan, driven by Whop's hosted Checkout handle.
 *
 * One <Checkout> handle mounts exactly one element: <CheckoutElement /> is
 * the full checkout surface — order summary, promo code, payment methods
 * AND its own express wallet row (Apple Pay / Google Pay / PayPal), so a
 * separate ExpressCheckoutElement is not needed here. (ExpressCheckoutElement
 * is the alternative for pages that want wallet buttons only.)
 *
 * There is deliberately NO <BrandingElement /> here: it is a
 * Payments-namespace element and throws ("must be used within <Payments>")
 * inside a Checkout handle. The Checkout surface renders Whop's
 * merchant-of-record notice itself. BrandingElement belongs in the
 * <Payments> handle on the deposit page, where it is mounted.
 */
export function CheckoutPage() {
	const { planSlug } = useParams();
	const plan = planSlug ? getPlan(planSlug) : undefined;
	const [completed, setCompleted] = useState<string | null>(null);

	if (!plan) {
		return <Navigate to="/pricing" replace />;
	}

	const returnUrl = `${window.location.origin}/checkout/success`;

	return (
		<>
			<div className="page-head">
				<div className="container">
					<h1>Checkout — {plan.name}</h1>
					<p>
						{plan.priceLabel} · {plan.billing}. Secure checkout by Whop — your card details never
						touch our servers.
					</p>
				</div>
			</div>
			<section className="section">
				<div className="container checkout-layout">
					<div className="checkout-box">
						<h3>Your order</h3>
						<p className="sub">Ironclad Roofing Co. · Austin, TX</p>
						<p style={{ marginTop: 16 }}>
							<strong style={{ fontSize: "1.6rem" }}>{plan.priceLabel}</strong>
						</p>
						<p>{plan.name}</p>
						<ul>
							{plan.features.map((f) => (
								<li key={f} style={{ listStyle: "none", padding: "4px 0 4px 22px", position: "relative" }}>
									<span style={{ color: "var(--green)", fontWeight: 900, left: 0, position: "absolute" }}>✓</span>
									{f}
								</li>
							))}
						</ul>
						<p className="form-note">
							Financing options (Klarna, Afterpay and similar) appear inside the checkout
							automatically when available for this purchase — subject to approval.
						</p>
						{completed ? (
							<p className="notice success">
								Payment complete — reference <strong>{completed}</strong>. We&rsquo;ll confirm your
								booking by email. (Fulfilment is confirmed by our server from the payment webhook,
								not from this page.)
							</p>
						) : null}
						<p style={{ marginTop: 20 }}>
							<Link to="/pricing">← Back to pricing</Link>
						</p>
					</div>

					<div className="checkout-box">
						<h3>Pay securely</h3>
						<p className="sub">One-press wallets, or any major card.</p>
						<WhopElementsSafe>
							<Checkout
								plan={plan.whopPlanId}
								returnUrl={returnUrl}
								onComplete={(payload) => {
									if (payload && "paymentId" in payload) {
										setCompleted(payload.paymentId);
									}
								}}
							>
								<div className="elements-frame">
									<CheckoutElement
										fallback={<div className="loading">Loading secure checkout…</div>}
									/>
								</div>
							</Checkout>
						</WhopElementsSafe>
					</div>
				</div>
			</section>
		</>
	);
}
