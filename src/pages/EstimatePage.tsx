import { Link } from "react-router-dom";
import { EstimateForm } from "../components/EstimateForm";

export function EstimatePage() {
	return (
		<>
			<div className="page-head">
				<div className="container">
					<p style={{ margin: "0 0 10px" }}>
						<Link to="/">← Back to homepage</Link>
					</p>
					<h1>Request an Estimate</h1>
					<p>
						Tell us about your roof and we&rsquo;ll get back to you within one business day — with an
						honest answer, not a sales pitch.
					</p>
				</div>
			</div>
			<section className="section">
				<div className="container contact-split">
					<div>
						<h2>What happens next</h2>
						<ol style={{ paddingLeft: 20 }}>
							<li>
								<strong>We read your request.</strong> A real roofer reviews it — your message lands
								directly in our leads, not a generic inbox.
							</li>
							<li>
								<strong>We call or email you</strong> within one business day to ask anything
								we&rsquo;re missing.
							</li>
							<li>
								<strong>Free inspection, then a flat quote.</strong> No obligation, no pressure.
							</li>
						</ol>
						<p style={{ marginTop: 24 }}>
							Prefer to talk? Call <a href="tel:+15125550148">(512) 555-0148</a>, Mon–Sat 7am–7pm.
						</p>
					</div>
					<EstimateForm />
				</div>
			</section>
		</>
	);
}
