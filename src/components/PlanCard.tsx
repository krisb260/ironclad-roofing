import { Link } from "react-router-dom";
import { type Plan } from "../lib/plans";

export function PlanCard({ plan, featured }: { plan: Plan; featured?: boolean }) {
	const href = plan.slug === "deposit" ? "/deposit" : `/checkout/${plan.slug}`;
	return (
		<div className={`card plan-card${featured ? " featured" : ""}`}>
			{featured ? <span className="plan-badge">Most popular</span> : null}
			<h3>{plan.name}</h3>
			<p className="price">
				{plan.priceLabel} <small>{plan.billing}</small>
			</p>
			<p>{plan.tagline}</p>
			<ul>
				{plan.features.map((f) => (
					<li key={f}>{f}</li>
				))}
			</ul>
			<Link className={`btn btn-block ${featured ? "btn-primary" : "btn-dark"}`} to={href}>
				{plan.cta}
			</Link>
		</div>
	);
}
