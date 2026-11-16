import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { SiteFooter, SiteHeader } from "./components/SiteChrome";
import { CheckoutPage } from "./pages/CheckoutPage";
import { DepositPage } from "./pages/DepositPage";
import { EstimatePage } from "./pages/EstimatePage";
import { HomePage } from "./pages/Home";
import { PricingPage } from "./pages/Pricing";
import { SuccessPage } from "./pages/SuccessPage";
import "./styles.css";

function NotFound() {
	return (
		<section className="section">
			<div className="container">
				<h1>That page doesn&rsquo;t exist.</h1>
				<p>
					<a href="/">Back to the Ironclad homepage</a>
				</p>
			</div>
		</section>
	);
}

createRoot(document.getElementById("root") as HTMLElement).render(
	<StrictMode>
		<BrowserRouter>
			<SiteHeader />
			<main>
				<Routes>
					<Route path="/" element={<HomePage />} />
					<Route path="/pricing" element={<PricingPage />} />
					<Route path="/checkout/:planSlug" element={<CheckoutPage />} />
					<Route path="/checkout/success" element={<SuccessPage />} />
					<Route path="/deposit" element={<DepositPage />} />
					<Route path="/estimate" element={<EstimatePage />} />
					<Route path="*" element={<NotFound />} />
				</Routes>
			</main>
			<SiteFooter />
		</BrowserRouter>
	</StrictMode>,
);
