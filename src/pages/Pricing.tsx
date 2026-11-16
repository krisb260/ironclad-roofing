import { Link } from "react-router-dom";
import { PLANS } from "../lib/plans";
import { PlanCard } from "../components/PlanCard";

export function PricingPage() {
	return (
		<>
			<div className="page-head">
				<div className="container">
					<h1>Flat-rate pricing</h1>
					<p>
						Three services, three flat prices. No hourly billing, no surprise add-ons — the price you
						see is the price you pay.
					</p>
				</div>
			</div>
			<section className="section">
				<div className="container">
					<div className="grid-3">
						{PLANS.map((p) => (
							<PlanCard key={p.slug} plan={p} featured={p.slug === "tuneup"} />
						))}
					</div>
					<div className="finance-banner" style={{ marginTop: 48 }}>
						<div>
							<h3>Need financing?</h3>
							<p>
								Pay over time at checkout with options like Klarna and Afterpay, shown automatically
								when available. Subject to approval — the choice appears right inside the secure
								checkout.
							</p>
						</div>
						<Link className="btn btn-primary" to="/estimate">
							Ask us about it
						</Link>
					</div>
					<p style={{ marginTop: 32, color: "var(--muted)" }}>
						Replacements and large repairs are quoted per project after a free inspection — the $500
						deposit reserves your build date and applies in full to your project total. Every job
						includes our 5-year workmanship warranty.
					</p>
				</div>
			</section>
		</>
	);
}
