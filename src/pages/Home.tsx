import { Link } from "react-router-dom";
import { PLANS } from "../lib/plans";
import { EstimateForm } from "../components/EstimateForm";
import { PlanCard } from "../components/PlanCard";
import { AreaMapArt } from "../components/RoofArt";

/** Hand-coded inline SVG icons — no emoji in the UI. */
function WrenchIcon() {
	return (
		<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
			<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
		</svg>
	);
}

function HouseIcon() {
	return (
		<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
			<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
			<polyline points="9 22 9 12 15 12 15 22" />
		</svg>
	);
}

function MagnifierIcon() {
	return (
		<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
			<circle cx="11" cy="11" r="8" />
			<path d="m21 21-4.3-4.3" />
		</svg>
	);
}

const TOWNS = [
	"Austin",
	"Round Rock",
	"Cedar Park",
	"Pflugerville",
	"Georgetown",
	"Leander",
	"Lakeway",
	"Bee Cave",
	"Dripping Springs",
	"Buda",
	"Kyle",
	"San Marcos",
];

const SERVICES = [
	{
		icon: <WrenchIcon />,
		name: "Roof Repair",
		text: "Leaks, missing shingles, cracked flashing, storm damage — fixed right the first time, with photos of what we found and what we did.",
	},
	{
		icon: <HouseIcon />,
		name: "Roof Replacement",
		text: "A full new roof, done in days, not weeks. Architectural shingles rated for Texas hail, installed by our own crew — never day labor.",
	},
	{
		icon: <MagnifierIcon />,
		name: "Roof Inspection",
		text: "A 21-point inspection with a written report in 24 hours. Buying a house, filing an insurance claim, or just want the truth about your roof.",
	},
];

const REVIEWS = [
	{
		name: "Marcus T.",
		place: "Round Rock, TX",
		text: "They found a leak two other companies missed, fixed it the same week, and the bill was exactly what they quoted. No surprises.",
	},
	{
		name: "Priya S.",
		place: "Cedar Park, TX",
		text: "The inspection report had photos of every problem area. I finally understood what was wrong with my roof — and what wasn't.",
	},
	{
		name: "Dan & Rosa W.",
		place: "South Austin, TX",
		text: "Full replacement in three days, yard left spotless, and the crew walked us through everything before they started.",
	},
];

export function HomePage() {
	return (
		<>
			<section className="hero">
				<div className="container hero-grid">
					<div>
						<p className="eyebrow">Austin, TX · Roof Repair · Replacement · Inspection</p>
						<h1>
							A roof that outlasts <span className="accent">Texas weather.</span>
						</h1>
						<p className="lede">
							Ironclad Roofing Co. is Austin&rsquo;s inspection-first roofing crew. Flat prices, honest
							quotes, and a roof built to take a hailstorm and ask for more.
						</p>
						<div className="hero-cta">
							<Link className="btn btn-primary" to="/estimate">
								Get a free estimate
							</Link>
							<Link className="btn btn-outline" to="/pricing" style={{ borderColor: "#f59e0b", color: "#fbbf24" }}>
								See flat-rate pricing
							</Link>
						</div>
						<p className="hero-note">
							No pushy sales visits. No surprise charges. Just a straight answer about your roof.
						</p>
					</div>
					<figure className="hero-photo">
						<img
							src="/hero-roof.jpg"
							alt="Roofing crew tearing off old shingles on a house roof"
						/>
						<figcaption>Built for Texas weather — hail, heat, and everything in between.</figcaption>
					</figure>
				</div>
			</section>

			<div className="trust-bar">
				<div className="container">
					<div className="trust-item">
						<span className="tick">✓</span> Licensed &amp; insured
					</div>
					<div className="trust-item">
						<span className="tick">✓</span> 5-year workmanship warranty
					</div>
					<div className="trust-item">
						<span className="tick">✓</span> Flat prices, quoted upfront
					</div>
					<div className="trust-item">
						<span className="tick">✓</span> Local Austin crew
					</div>
				</div>
			</div>

			<section className="section" id="services">
				<div className="container">
					<p className="eyebrow">What we do</p>
					<h2>Three services. One standard: done right.</h2>
					<p className="lede">
						Every job starts with an inspection, ends with a walkthrough, and is backed by our
						5-year workmanship warranty.
					</p>
					<div className="grid-3" style={{ marginTop: 32 }}>
						{SERVICES.map((s) => (
							<div className="card" key={s.name}>
								<div className="icon" aria-hidden="true">
									{s.icon}
								</div>
								<h3>{s.name}</h3>
								<p>{s.text}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			<section className="section alt" id="areas">
				<div className="container area-grid">
					<div>
						<p className="eyebrow">Service area</p>
						<h2>We work all across Greater Austin.</h2>
						<p className="lede">
							From Georgetown to San Marcos, our crews are on Austin roofs every day. If you&rsquo;re
							inside the loop below, we can usually inspect within 48 hours.
						</p>
						<ul className="town-list" style={{ marginTop: 20 }}>
							{TOWNS.map((t) => (
								<li key={t}>{t}</li>
							))}
						</ul>
					</div>
					<AreaMapArt />
				</div>
			</section>

			<section className="section">
				<div className="container">
					<div className="finance-banner">
						<div>
							<h3>Financing available at checkout</h3>
							<p>
								Big jobs don&rsquo;t have to mean big upfront bills. Pay over time at checkout, with
								options like Klarna and Afterpay shown automatically when available — subject to
								approval.
							</p>
						</div>
						<Link className="btn btn-primary" to="/pricing">
							See your options
						</Link>
					</div>
				</div>
			</section>

			<section className="section alt" id="reviews">
				<div className="container">
					<p className="eyebrow">What neighbors say</p>
					<h2>Austin homeowners, in their words.</h2>
					<div className="grid-3" style={{ marginTop: 32 }}>
						{REVIEWS.map((r) => (
							<div className="card review-card" key={r.name}>
								<div className="stars" aria-label="5 out of 5 stars">
									★★★★★
								</div>
								<blockquote>&ldquo;{r.text}&rdquo;</blockquote>
								<div className="who">{r.name}</div>
								<div className="where">{r.place}</div>
								<span className="sample-tag">Sample review — demonstration</span>
							</div>
						))}
					</div>
				</div>
			</section>

			<section className="section" id="pricing">
				<div className="container">
					<p className="eyebrow">Flat-rate pricing</p>
					<h2>Know the price before we start.</h2>
					<p className="lede">
						No hourly meters running, no &ldquo;we&rsquo;ll see when we get up there.&rdquo; Pick a service,
						pay securely online, and we show up on schedule.
					</p>
					<div className="grid-3" style={{ marginTop: 24 }}>
						{PLANS.map((p) => (
							<PlanCard key={p.slug} plan={p} featured={p.slug === "tuneup"} />
						))}
					</div>
				</div>
			</section>

			<section className="section alt">
				<div className="container">
					<p className="eyebrow">How it works</p>
					<h2>From first call to finished roof, in three steps.</h2>
					<ol className="steps" style={{ marginTop: 32 }}>
						<li>
							<strong>Request an estimate.</strong>
							<br />
							Tell us what&rsquo;s going on with your roof. We reply within one business day with honest
							next steps.
						</li>
						<li>
							<strong>Book and pay online.</strong>
							<br />
							Inspection, deposit, or tune-up — pick a flat price and check out securely. Apple Pay
							and Google Pay accepted.
						</li>
						<li>
							<strong>We do the work.</strong>
							<br />
							Our crew shows up on time, finishes on schedule, and walks the roof with you before we
							leave.
						</li>
					</ol>
				</div>
			</section>

			<section className="section" id="contact">
				<div className="container contact-split">
					<div>
						<p className="eyebrow">Contact</p>
						<h2>Talk to a roofer, not a call center.</h2>
						<div className="contact-lines" style={{ marginTop: 24 }}>
							<p>
								<strong>Call or text</strong>
								<a href="tel:+15125550148">(512) 555-0148</a>
								<br />
								Mon–Sat, 7am–7pm
							</p>
							<p>
								<strong>Email</strong>
								<a href="mailto:hello@ironcladroofing.example">hello@ironcladroofing.example</a>
							</p>
							<p>
								<strong>Office</strong>
								1200 Congress Ave
								<br />
								Austin, TX 78701
							</p>
						</div>
					</div>
					<div>
						<h3 style={{ marginBottom: 16 }}>Request an estimate</h3>
						<EstimateForm compact />
					</div>
				</div>
			</section>
		</>
	);
}
