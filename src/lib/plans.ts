// The three plans this template sells. Whop plan IDs are wired in here and
// nowhere else. Real variant IDs, created 2026-11-16 under the Nonon company
// (biz_MFQ44qbVn1ONz4), product "Roofing Services" (prod_q7akRd4ipIViI).
// Checkout is live: the pages mount the Whop Elements as soon as a real id
// is set. No payment can complete until the real IDs are set.

export type PlanSlug = "inspection" | "deposit" | "tuneup";

export interface Plan {
	slug: PlanSlug;
	name: string;
	shortName: string;
	/** Price in dollars (major units). */
	price: number;
	priceLabel: string;
	billing: string;
	tagline: string;
	features: string[];
	cta: string;
	/** Whop variant id. Placeholder until the real plans are created. */
	whopPlanId: string;
}

export const PLANS: Plan[] = [
	{
		billing: "One-time payment",
		cta: "Book my inspection",
		features: [
			"Full 21-point roof inspection",
			"Photos of everything we find",
			"Written report within 24 hours",
			"Honest repair-or-replace verdict",
		],
		name: "Roof Inspection",
		price: 149,
		priceLabel: "$149",
		shortName: "Inspection",
		slug: "inspection",
		tagline: "Know exactly what your roof needs — before you spend a dollar on repairs.",
		whopPlanId: "plan_e5MEMpxf4NDhi",
	},
	{
		billing: "One-time payment · card saved for the final balance",
		cta: "Reserve my project date",
		features: [
			"Locks your spot on the crew schedule",
			"Card saved securely — nothing else charged today",
			"Deposit applies in full to your project total",
			"Free reschedule up to 7 days out",
		],
		name: "Project Deposit",
		price: 500,
		priceLabel: "$500",
		shortName: "Deposit",
		slug: "deposit",
		tagline: "Hold your build date. We save your card now and bill the rest when the job is done.",
		whopPlanId: "plan_Xh52QYcONHNgS",
	},
	{
		billing: "One-time payment · flat rate, no surprises",
		cta: "Book the tune-up",
		features: [
			"Full tune-up in a single visit",
			"Shingle, flashing and seal check",
			"Gutter and vent clearing",
			"Small fixes included on the spot",
		],
		name: "Flat-Rate Roof Tune-Up",
		price: 299,
		priceLabel: "$299",
		shortName: "Tune-Up",
		slug: "tuneup",
		tagline: "One visit, one flat price. We tighten up your whole roof before the next storm hits.",
		whopPlanId: "plan_KBDtMbnpimf1G",
	},
];

export function getPlan(slug: string): Plan | undefined {
	return PLANS.find((p) => p.slug === slug);
}

/** True only when a plan id looks like a real Whop variant id. */
export function isRealPlanId(id: string): boolean {
	return id.startsWith("plan_") && !id.endsWith("_placeholder");
}

/** True when every plan has a real Whop id — i.e. checkout is live. */
export function isCheckoutLive(): boolean {
	return PLANS.every((p) => isRealPlanId(p.whopPlanId));
}

/** Whop business id: Nonon. Never a secret. */
export const WHOP_ACCOUNT_ID = "biz_MFQ44qbVn1ONz4";

/** True when the account id has been replaced with a real `biz_…` id. */
export function isAccountConfigured(): boolean {
	return WHOP_ACCOUNT_ID.startsWith("biz_") && !WHOP_ACCOUNT_ID.endsWith("_placeholder");
}
