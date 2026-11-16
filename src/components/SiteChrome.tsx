import { Link } from "react-router-dom";

export function SiteHeader() {
	return (
		<header className="site-header">
			<div className="container">
				<Link className="brand" to="/">
					<span className="brand-mark" aria-hidden="true">
						⌂
					</span>
					<span>
						<span className="brand-name">Ironclad Roofing Co.</span>
						<br />
						<span className="brand-sub">Austin, TX</span>
					</span>
				</Link>
				<nav className="site-nav" aria-label="Main navigation">
					<Link to="/#services">Services</Link>
					<Link to="/#areas">Service Area</Link>
					<Link to="/pricing">Pricing</Link>
					<Link to="/estimate">Free Estimate</Link>
				</nav>
				<a className="header-phone" href="tel:+15125550148">
					(512) 555-0148
				</a>
			</div>
		</header>
	);
}

export function SiteFooter() {
	return (
		<footer className="site-footer">
			<div className="container">
				<div>
					<h4>Ironclad Roofing Co.</h4>
					<p>
						Austin&rsquo;s storm-ready roofing crew. Repair, replacement and
						inspection — flat prices, honest quotes, and a roof built to take a
						hailstorm and ask for more.
					</p>
					<p>
						(512) 555-0148
						<br />
						hello@ironcladroofing.example
						<br />
						1200 Congress Ave, Austin, TX 78701
					</p>
				</div>
				<div>
					<h4>Services</h4>
					<p>
						<Link to="/#services">Roof Repair</Link>
						<br />
						<Link to="/#services">Roof Replacement</Link>
						<br />
						<Link to="/#services">Roof Inspection</Link>
						<br />
						<Link to="/pricing">Flat-Rate Tune-Up</Link>
					</p>
				</div>
				<div>
					<h4>Get started</h4>
					<p>
						<Link to="/estimate">Request an Estimate</Link>
						<br />
						<Link to="/pricing">See Pricing</Link>
						<br />
						<Link to="/deposit">Pay a Project Deposit</Link>
					</p>
				</div>
			</div>
			<div className="container">
				<p className="fineprint">
					© 2026 Ironclad Roofing Co. — demonstration template website.
					Licensed &amp; insured in the State of Texas. Financing available at
					checkout, subject to approval.
				</p>
			</div>
		</footer>
	);
}
