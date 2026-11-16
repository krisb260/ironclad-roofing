// Service-area map art, drawn in code — no copied imagery.
// The hero used to be a coded house illustration (RoofArt); it was
// replaced 2026-11-16 by a real public-domain photo, public/hero-roof.jpg.

/** Small map-style graphic of the Austin service area. */
export function AreaMapArt() {
	const towns: Array<{ name: string; x: number; y: number }> = [
		{ name: "Georgetown", x: 150, y: 42 },
		{ name: "Round Rock", x: 205, y: 96 },
		{ name: "Cedar Park", x: 120, y: 118 },
		{ name: "Leander", x: 92, y: 62 },
		{ name: "Pflugerville", x: 268, y: 120 },
		{ name: "Austin ★", x: 185, y: 168 },
		{ name: "Lakeway", x: 88, y: 196 },
		{ name: "Bee Cave", x: 118, y: 236 },
		{ name: "Dripping Springs", x: 92, y: 282 },
		{ name: "Buda", x: 200, y: 262 },
		{ name: "Kyle", x: 238, y: 296 },
		{ name: "San Marcos", x: 262, y: 330 },
	];
	return (
		<svg
			viewBox="0 0 360 380"
			role="img"
			aria-label="Map of the Austin service area"
			style={{ background: "#eef2f7", borderRadius: 14, width: "100%" }}
		>
			<g stroke="#dbe4ec" strokeWidth="1">
				{Array.from({ length: 9 }, (_, i) => (
					<line key={`v${i}`} x1={i * 45} y1="0" x2={i * 45} y2="380" />
				))}
				{Array.from({ length: 9 }, (_, i) => (
					<line key={`h${i}`} x1="0" y1={i * 47} x2="360" y2={i * 47} />
				))}
			</g>
			{/* roads */}
			<g stroke="#cbd5e1" strokeWidth="5" fill="none">
				<path d="M40 20 C120 90, 180 140, 185 168 C190 210, 220 260, 262 330" />
				<path d="M20 300 C100 260, 160 220, 185 168 C210 120, 250 90, 330 60" />
			</g>
			<circle cx="185" cy="168" r="26" fill="#f59e0b" opacity="0.25" />
			<circle cx="185" cy="168" r="10" fill="#e8730c" stroke="#fff" strokeWidth="3" />
			{towns
				.filter((t) => !t.name.includes("★"))
				.map((t) => (
					<g key={t.name}>
						<circle cx={t.x} cy={t.y} r="5" fill="#1f3850" stroke="#fff" strokeWidth="2" />
						<text x={t.x + 10} y={t.y + 4} fontSize="12.5" fontWeight="600" fill="#1a2733">
							{t.name}
						</text>
					</g>
				))}
			<text x="185" y="148" textAnchor="middle" fontSize="13" fontWeight="800" fill="#92400e">
				AUSTIN
			</text>
		</svg>
	);
}
