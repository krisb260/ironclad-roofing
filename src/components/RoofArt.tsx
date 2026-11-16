// Original SVG art: a storm-ready Austin house under a big Texas sky.
// Drawn in code — no photos, no stock art, no copied imagery.

export function RoofArt() {
	return (
		<svg
			className="hero-art"
			viewBox="0 0 520 420"
			role="img"
			aria-label="Illustration of a house with a new ironclad roof under the Texas sun"
		>
			<defs>
				<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stopColor="#1f3850" />
					<stop offset="100%" stopColor="#0f1e2e" />
				</linearGradient>
				<linearGradient id="roofGrad" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stopColor="#f59e0b" />
					<stop offset="100%" stopColor="#d97706" />
				</linearGradient>
			</defs>

			{/* sky */}
			<rect x="0" y="0" width="520" height="420" rx="18" fill="url(#sky)" />
			{/* sun */}
			<circle cx="420" cy="70" r="34" fill="#fbbf24" opacity="0.9" />
			<circle cx="420" cy="70" r="48" fill="#fbbf24" opacity="0.18" />
			{/* clouds */}
			<g fill="#ffffff" opacity="0.14">
				<ellipse cx="110" cy="70" rx="52" ry="16" />
				<ellipse cx="150" cy="58" rx="38" ry="13" />
				<ellipse cx="300" cy="110" rx="46" ry="13" />
			</g>
			{/* distant skyline */}
			<g fill="#16283c">
				<rect x="20" y="300" width="60" height="90" rx="4" />
				<rect x="96" y="320" width="44" height="70" rx="4" />
				<rect x="420" y="310" width="70" height="80" rx="4" />
			</g>
			{/* ground */}
			<rect x="0" y="368" width="520" height="52" fill="#0a1622" />
			<g stroke="#1f3850" strokeWidth="3">
				<line x1="0" y1="392" x2="520" y2="392" />
			</g>

			{/* house body */}
			<rect x="130" y="230" width="260" height="138" fill="#f4ead8" />
			<rect x="130" y="230" width="260" height="138" fill="none" stroke="#d9c8a8" strokeWidth="2" />
			{/* roof */}
			<polygon points="100,238 260,140 420,238" fill="url(#roofGrad)" />
			<polygon points="100,238 260,140 420,238" fill="none" stroke="#92400e" strokeWidth="2" />
			<g stroke="#92400e" strokeWidth="2" opacity="0.65">
				<line x1="150" y1="212" x2="370" y2="212" />
				<line x1="180" y1="192" x2="340" y2="192" />
				<line x1="212" y1="172" x2="308" y2="172" />
			</g>
			{/* chimney */}
			<rect x="330" y="150" width="26" height="52" fill="#b45309" />
			<rect x="326" y="144" width="34" height="10" fill="#92400e" />
			{/* door */}
			<rect x="238" y="296" width="44" height="72" rx="4" fill="#1f3850" />
			<circle cx="274" cy="334" r="4" fill="#f59e0b" />
			{/* windows */}
			<g fill="#bae6fd" stroke="#1f3850" strokeWidth="3">
				<rect x="158" y="268" width="48" height="48" rx="4" />
				<rect x="314" y="268" width="48" height="48" rx="4" />
			</g>
			<g stroke="#1f3850" strokeWidth="2">
				<line x1="182" y1="268" x2="182" y2="316" />
				<line x1="158" y1="292" x2="206" y2="292" />
				<line x1="338" y1="268" x2="338" y2="316" />
				<line x1="314" y1="292" x2="362" y2="292" />
			</g>
			{/* shield badge */}
			<g transform="translate(60, 300)">
				<path d="M0 0 L44 0 L44 30 L22 48 L0 30 Z" fill="#f59e0b" stroke="#92400e" strokeWidth="2" />
				<path
					d="M13 24 L20 31 L32 16"
					fill="none"
					stroke="#0f1e2e"
					strokeWidth="4"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</g>
			{/* hail dots bouncing off the roof */}
			<g fill="#e0f2fe">
				<circle cx="200" cy="120" r="5" />
				<circle cx="250" cy="96" r="4" />
				<circle cx="310" cy="118" r="5" />
			</g>
			<text x="260" y="408" textAnchor="middle" fill="#8fa1b3" fontSize="15" fontWeight="700">
				Built for Texas weather — hail, heat, and everything in between.
			</text>
		</svg>
	);
}

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
