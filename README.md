<div align="center" style="padding:24px 18px; background:radial-gradient(circle at 20% 20%, rgba(0,230,255,0.12), transparent 36%), radial-gradient(circle at 80% 10%, rgba(255,61,209,0.12), transparent 40%), linear-gradient(135deg, #0b0f14 0%, #0e1320 50%, #0b0f14 100%); border:1px solid #161b27; border-radius:14px; box-shadow:0 18px 42px rgba(0,0,0,0.32), 0 0 60px rgba(155,92,255,0.16); max-width:880px; margin: auto;">
	<h1 style="margin:0; font-family:'Orbitron','Segoe UI',sans-serif; letter-spacing:0.16em; text-transform:uppercase; color:#ecf0ff; text-shadow:0 0 14px rgba(0,230,255,0.36);">The Entropy Lab</h1>
	<p style="margin:6px 0 10px; font-family:'Poppins','Segoe UI',sans-serif; color:#cdd2ff; font-size:15px;">Omni-Game Mod Exchange • Neon-grade tools for creators</p>
	<p style="margin:0; color:#9ee8ff; font-family:'Poppins','Segoe UI',sans-serif; letter-spacing:0.04em;">Developed by Bismaya &amp; Knox</p>

	<svg width="720" height="34" viewBox="0 0 720 34" role="presentation" aria-hidden="true" style="margin-top:16px;">
		<defs>
			<linearGradient id="beam" x1="0%" y1="0%" x2="100%" y2="0%">
				<stop offset="0%" stop-color="#00e6ff" />
				<stop offset="45%" stop-color="#ff3dd1" />
				<stop offset="100%" stop-color="#9b5cff" />
			</linearGradient>
		</defs>
		<rect x="14" y="13" width="692" height="8" rx="4" fill="#0b0f14" stroke="#1c2534" />
		<rect x="14" y="13" width="138" height="8" rx="4" fill="url(#beam)">
			<animate attributeName="width" values="120;640;120" dur="5.8s" repeatCount="indefinite" />
			<animate attributeName="x" values="14;566;14" dur="5.8s" repeatCount="indefinite" />
		</rect>
	</svg>

	<p style="margin:18px 0 6px; font-family:'Poppins','Segoe UI',sans-serif; color:#cdd2ff; letter-spacing:0.08em;">Stack</p>
	<p>
		<img alt="React" src="https://img.shields.io/badge/React-19.2-00e6ff?style=for-the-badge&logo=react&logoColor=00e6ff&labelColor=0b0f14" />
		<img alt="Vite" src="https://img.shields.io/badge/Vite-6.x-ffb300?style=for-the-badge&logo=vite&logoColor=ff7b00&labelColor=0b0f14" />
		<img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.8-2f74c0?style=for-the-badge&logo=typescript&logoColor=white&labelColor=0b0f14" />
		<img alt="Firebase" src="https://img.shields.io/badge/Firebase-Auth%2FStorage-f7c52b?style=for-the-badge&logo=firebase&logoColor=ffca28&labelColor=0b0f14" />
		<img alt="AI" src="https://img.shields.io/badge/AI-Gemini%20powered-9b5cff?style=for-the-badge&logo=google&logoColor=white&labelColor=0b0f14" />
	</p>
</div>

<div align="center" style="margin:28px auto; max-width:880px;">
	<svg width="760" height="30" viewBox="0 0 760 30" role="presentation" aria-hidden="true">
		<defs>
			<linearGradient id="wave" x1="0%" y1="0%" x2="100%" y2="0%">
				<stop offset="0%" stop-color="#ff3dd1" />
				<stop offset="40%" stop-color="#9b5cff" />
				<stop offset="100%" stop-color="#00e6ff" />
			</linearGradient>
		</defs>
		<path d="M0 15 C80 5 160 25 240 15 C320 5 400 25 480 15 C560 5 640 25 720 15" fill="none" stroke="url(#wave)" stroke-width="3" stroke-linecap="round">
			<animate attributeName="d" dur="6s" repeatCount="indefinite" values="M0 15 C80 5 160 25 240 15 C320 5 400 25 480 15 C560 5 640 25 720 15; M0 15 C80 25 160 5 240 15 C320 25 400 5 480 15 C560 25 640 5 720 15; M0 15 C80 5 160 25 240 15 C320 5 400 25 480 15 C560 5 640 25 720 15" />
		</path>
	</svg>
</div>

## 🔥 What This Lab Serves
- AI-assisted mod blurbs + install snippets via `services/geminiService.ts`.
- Neon React/Vite front-end with animated hero, carousel, and toast system.
- Firebase-backed auth + admin console to publish, feature, and curate mods.
- Discovery search, tags, and filters powered by `useMods` and `constants.ts` data.
- Glassy UI kit (`components/ui/*`) with loaders, markdown renderer, and toasts.

## 🚀 Quickstart
1) Install deps
```bash
npm install
```
2) Run dev server
```bash
npm run dev
```
3) Visit `http://localhost:5173` and glow.

### Environment
Create `.env.local` (or `.env`) with your keys:
```bash
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_IMGBB_KEY=...
```

## 🛠️ Scripts
- `npm run dev` – start Vite in dev mode.
- `npm run build` – production build.
- `npm run preview` – preview the build locally.

## 🧭 Map of the Lab
- `App.tsx` – orchestrates views, toasts, downloads state, admin modal.
- `components/layout/Header.tsx` – animated neon nav with admin/login controls.
- `components/mods/*` – carousels, detail view, discovery grid, cards.
- `components/ui/*` – buttons, cards, loaders, markdown renderer, toasts.
- `hooks/useMods.ts` – fetch + local overrides; `useAuth.tsx` – Firebase auth.
- `services/geminiService.ts` – AI content generation (mock fallback included).
- `services/modService.ts` – slug helpers and mod data shaping.

## 🎨 Design DNA
- Palette: `cyber-cyan #00e6ff`, `cyber-magenta #ff3dd1`, `cyber-purple #9b5cff`, `dark-charcoal #0b0f14`.
- Motion: `logoSpin`, `logoPulse`, `logoFloat` keyframes + hover glows (`index.css`).
- Texture: glassmorphism cards with neon rims, animated dividers, soft noise backdrops.

## 🔭 Roadmap Sparks
- Rich creator profiles with badges and trust signals.
- Automated malware/telemetry scan results surfaced per mod.
- Live download stats with rolling counters and heatmaps.
- Social cards + shareable deep links for each mod.

<div align="center" style="margin:36px auto 12px; max-width:780px;">
	<svg width="720" height="14" viewBox="0 0 720 14" role="presentation" aria-hidden="true">
		<defs>
			<linearGradient id="end-glow" x1="0%" y1="0%" x2="100%" y2="0%">
				<stop offset="0%" stop-color="#ff3dd1" />
				<stop offset="100%" stop-color="#00e6ff" />
			</linearGradient>
		</defs>
		<rect x="0" y="5" width="720" height="4" rx="2" fill="url(#end-glow)">
			<animate attributeName="opacity" values="0.4;1;0.4" dur="2.4s" repeatCount="indefinite" />
		</rect>
	</svg>
	<p style="margin:12px 0 0; color:#cdd2ff; font-family:'Poppins','Segoe UI',sans-serif; letter-spacing:0.04em;">Stay luminous. Ship mods.</p>
</div>