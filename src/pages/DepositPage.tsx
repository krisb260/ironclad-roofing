import { BrandingElement, EmailElement, PaymentElement, Payments, usePayments, useWhop } from "@whop/elements-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { WhopElementsSafe } from "../components/WhopElementsSafe";
import { getPlan, WHOP_ACCOUNT_ID } from "../lib/plans";

/**
 * The $500 project deposit, done the way the task requires it:
 * 1. The buyer saves a card with the payment elements in `mode: "setup"`
 *    — nothing is charged at this step.
 * 2. The confirmation token goes to POST /api/setup-intent, which creates
 *    the setup intent server-side and returns a client_secret.
 * 3. Any pending step (e.g. 3DS) runs through handleNextAction.
 * 4. The saved method (payt_…) is what the final invoice charges later.
 */
function SaveCardButton() {
	const payments = usePayments();
	const whop = useWhop();
	const [status, setStatus] = useState<"idle" | "working" | "done" | "error">("idle");
	const [detail, setDetail] = useState("");
	const [savedMethod, setSavedMethod] = useState("");

	async function onSave() {
		if (!payments) return;
		setStatus("working");
		setDetail("");
		try {
			const token = await payments.createConfirmationToken({});
			const res = await fetch("/api/setup-intent", {
				body: JSON.stringify({ confirmation_token: token.confirmationToken }),
				headers: { "Content-Type": "application/json" },
				method: "POST",
			});
			const data = (await res.json()) as {
				client_secret?: string | null;
				error?: string;
				id?: string;
				payment_method_id?: string | null;
				status?: string;
			};
			if (!res.ok) {
				setStatus("error");
				setDetail(
					data.error === "payments_not_configured"
						? "Payments aren't connected yet — wire the Company API key at deploy time and this button will save the card for real."
						: "The setup failed. Please try another card, or call (512) 555-0148.",
				);
				return;
			}
			if (data.client_secret && whop) {
				await whop.payments.handleNextAction({ clientSecret: data.client_secret });
			}
			setSavedMethod(data.payment_method_id ?? "");
			setStatus("done");
			setDetail(
				`Card saved. Setup intent ${data.id ?? ""} is ${data.status ?? "complete"} — the final balance will be billed to this card when the job is done.`,
			);
		} catch (err) {
			setStatus("error");
			setDetail(
				(err as Error).message === "payment_request_cancelled"
					? "Card saving was cancelled — nothing was charged."
					: "Something went wrong. Please try again, or call (512) 555-0148.",
			);
		}
	}

	return (
		<div>
			<button className="btn btn-primary btn-block" type="button" onClick={onSave} disabled={!payments || status === "working"}>
				{status === "working" ? "Saving your card…" : "Save my card — $0 charged today"}
			</button>
			{status === "done" ? (
				<p className="notice success" style={{ marginTop: 16 }}>
					<strong>Card saved.</strong> {detail}
					{savedMethod ? (
						<>
							<br />
							Saved method: <code>{savedMethod}</code>
						</>
					) : null}
				</p>
			) : null}
			{status === "error" ? (
				<p className="notice error" style={{ marginTop: 16 }}>
					{detail}
				</p>
			) : null}
		</div>
	);
}

export function DepositPage() {
	const plan = getPlan("deposit");
	const configured = WHOP_ACCOUNT_ID.startsWith("biz_") && !WHOP_ACCOUNT_ID.endsWith("_placeholder");

	return (
		<>
			<div className="page-head">
				<div className="container">
					<h1>Project Deposit — $500</h1>
					<p>
						Reserve your build date. We save your card now and bill the rest when the job is done —
						$0 is charged today.
					</p>
				</div>
			</div>
			<section className="section">
				<div className="container checkout-layout">
					<div className="checkout-box">
						<h3>How the deposit works</h3>
						<ol style={{ paddingLeft: 20 }}>
							<li>
								<strong>You save a card.</strong> It&rsquo;s stored securely by Whop — we never see
								your card number.
							</li>
							<li>
								<strong>We hold your date.</strong> Your spot on the crew schedule is locked in, and
								the $500 applies in full to your project total.
							</li>
							<li>
								<strong>We bill the final balance when the job is done</strong> — automatically to
								the saved card, or by invoice if you prefer.
							</li>
						</ol>
						<p className="form-note">
							Free reschedule up to 7 days before your date. Deposit is refundable until work begins.
						</p>
						<h3 style={{ marginTop: 28 }}>What the final invoice looks like</h3>
						<p>
							When your roof is finished, we create an invoice for the remaining balance and charge
							the card you saved — or send the invoice for payment, your choice. The invoice is
							created through Whop&rsquo;s Invoices API (<code>POST /api/v1/invoices</code>) and can be
							charged to the saved method at any time.
						</p>
					</div>

					<div className="checkout-box">
						<h3>Save a card for your deposit</h3>
						<p className="sub">
							$500 deposit · card saved securely · $0 charged today · final balance billed later.
						</p>
						{!configured ? (
							<div>
								<p className="notice warn">
									<strong>Demo mode.</strong> The card-save form below is wired to the real Whop
									payment elements, but the business account isn&rsquo;t connected yet. Once the
									Company API key is set, saving a card and billing the final invoice work
									end-to-end — no code changes needed.
								</p>
								<p>
									Want a price for your roof first?{" "}
									<Link to="/estimate">Request a free estimate</Link> and we&rsquo;ll reply
									within one business day.
								</p>
							</div>
						) : (
							<WhopElementsSafe>
								<Payments
									accountId={WHOP_ACCOUNT_ID}
									mode="setup"
									currency="usd"
									returnUrl={`${window.location.origin}/deposit?setup=done`}
									setupFutureUsage="off_session"
								>
									<div className="elements-frame">
										<PaymentElement fallback={<div className="loading">Loading secure card form…</div>} />
									</div>
									<div style={{ marginTop: 14 }}>
										<EmailElement />
									</div>
									<div style={{ marginTop: 18 }}>
										<SaveCardButton />
									</div>
									<div style={{ marginTop: 18 }}>
										<BrandingElement />
									</div>
								</Payments>
							</WhopElementsSafe>
						)}
						<p className="form-note" style={{ marginTop: 16 }}>
							By saving a card you agree it may be charged for the final balance of your project,
							only after the work is complete and you&rsquo;ve seen the final invoice.
						</p>
					</div>
				</div>
			</section>
		</>
	);
}
