import { useState, type FormEvent } from "react";

export type EstimatePayload = {
	name: string;
	email: string;
	phone: string;
	service: string;
	city: string;
	message: string;
};

const SERVICES = ["Roof Repair", "Roof Replacement", "Roof Inspection", "Roof Tune-Up", "Not sure yet"];

export function EstimateForm({ compact = false }: { compact?: boolean }) {
	const [form, setForm] = useState<EstimatePayload>({
		city: "",
		email: "",
		message: "",
		name: "",
		phone: "",
		service: "Roof Repair",
	});
	const [state, setState] = useState<"idle" | "sending" | "sent" | "error" | "not-configured">("idle");
	const [error, setError] = useState("");

	function set<K extends keyof EstimatePayload>(key: K, value: EstimatePayload[K]) {
		setForm((f) => ({ ...f, [key]: value }));
	}

	async function onSubmit(e: FormEvent) {
		e.preventDefault();
		setState("sending");
		setError("");
		try {
			const res = await fetch("/api/estimate", {
				body: JSON.stringify(form),
				headers: { "Content-Type": "application/json" },
				method: "POST",
			});
			const data = (await res.json()) as { error?: string; message?: string };
			if (res.ok) {
				setState("sent");
			} else if (res.status === 503 && data.error === "leads_not_configured") {
				setState("not-configured");
			} else {
				setState("error");
				setError(data.message ?? "Something went wrong sending your request. Please call us instead.");
			}
		} catch {
			setState("error");
			setError("Could not reach the server. Please call (512) 555-0148 instead.");
		}
	}

	if (state === "sent") {
		return (
			<div className="notice success" role="status">
				<strong>Request received — thank you, {form.name.split(" ")[0] || "friend"}.</strong>
				<br />
				We&rsquo;ll review your {form.service.toLowerCase()} request for {form.city || "your home"} and get
				back to you within one business day at {form.email}.
			</div>
		);
	}

	return (
		<form onSubmit={onSubmit} className={compact ? undefined : "form-card"}>
			{state === "not-configured" ? (
				<p className="notice warn">
					The form is wired, but this demo site isn&rsquo;t connected to Whop yet — your request wasn&rsquo;t
					sent. Call (512) 555-0148 and we&rsquo;ll take your details directly.
				</p>
			) : null}
			{state === "error" ? <p className="notice error">{error}</p> : null}
			<div className="form-grid">
				<div className="form-field">
					<label htmlFor="est-name">Your name</label>
					<input
						id="est-name"
						required
						value={form.name}
						onChange={(e) => set("name", e.target.value)}
						placeholder="Jordan Miller"
						autoComplete="name"
					/>
				</div>
				<div className="form-field">
					<label htmlFor="est-email">Email</label>
					<input
						id="est-email"
						type="email"
						required
						value={form.email}
						onChange={(e) => set("email", e.target.value)}
						placeholder="you@example.com"
						autoComplete="email"
					/>
				</div>
				<div className="form-field">
					<label htmlFor="est-phone">Phone (optional)</label>
					<input
						id="est-phone"
						type="tel"
						value={form.phone}
						onChange={(e) => set("phone", e.target.value)}
						placeholder="(512) 555-0000"
						autoComplete="tel"
					/>
				</div>
				<div className="form-field">
					<label htmlFor="est-service">What do you need?</label>
					<select
						id="est-service"
						value={form.service}
						onChange={(e) => set("service", e.target.value)}
					>
						{SERVICES.map((s) => (
							<option key={s} value={s}>
								{s}
							</option>
						))}
					</select>
				</div>
				<div className="form-field full">
					<label htmlFor="est-city">City / ZIP</label>
					<input
						id="est-city"
						required
						value={form.city}
						onChange={(e) => set("city", e.target.value)}
						placeholder="Austin, TX 78704"
						autoComplete="postal-code"
					/>
				</div>
				<div className="form-field full">
					<label htmlFor="est-message">Tell us about your roof</label>
					<textarea
						id="est-message"
						required
						value={form.message}
						onChange={(e) => set("message", e.target.value)}
						placeholder="e.g. Missing shingles after last week's hailstorm, small leak over the kitchen…"
					/>
				</div>
			</div>
			<div style={{ marginTop: 20 }}>
				<button className="btn btn-primary btn-block" type="submit" disabled={state === "sending"}>
					{state === "sending" ? "Sending…" : "Request my free estimate"}
				</button>
			</div>
			<p className="form-note">
				No spam, no obligation. We reply within one business day — usually much faster.
			</p>
		</form>
	);
}
