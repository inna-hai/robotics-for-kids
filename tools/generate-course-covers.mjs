import { mkdirSync, writeFileSync } from 'node:fs';

const outDir = new URL('../assets/course-covers/', import.meta.url);
mkdirSync(outDir, { recursive: true });

const covers = [
  ['sensi-city', '#2563eb', '#06b6d4', 'city'],
  ['sisi', '#ec4899', '#8b5cf6', 'logic'],
  ['python-turtle', '#ea580c', '#facc15', 'turtle'],
  ['webcode', '#111827', '#4f46e5', 'web'],
  ['minecraft', '#16a34a', '#64748b', 'blocks'],
  ['tello-edu-grade5', '#0891b2', '#2dd4bf', 'drone'],
  ['tello-mission-lab', '#f97316', '#facc15', 'drone-grid'],
  ['drone-coding-foundations', '#1d4ed8', '#7c3aed', 'code-drone'],
  ['drone-mission-lab', '#7c3aed', '#ec4899', 'camera-drone'],
  ['drone-intelligence-lab', '#0f172a', '#38bdf8', 'data-drone'],
  ['omer-future-craftom', '#155e75', '#7c3aed', 'future-city'],
  ['craftom-school', '#14b8a6', '#22c55e', 'craftom'],
  ['venture-ai', '#7c3aed', '#06b6d4', 'ai'],
  ['mission-impossible-lab', '#111827', '#dc2626', 'mission'],
  ['money-smart-lab', '#f59e0b', '#22c55e', 'money'],
  ['lumi', '#16a34a', '#84cc16', 'nature'],
  ['pygame', '#7c3aed', '#db2777', 'gamepad'],
  ['roblox', '#0f766e', '#22c55e', 'roblox'],
  ['codequest', '#312e81', '#7c3aed', 'quest'],
  ['playcode', '#c026d3', '#f97316', 'playcode'],
  ['webmakers', '#06b6d4', '#8b5cf6', 'webmakers'],
];

function common(a, b, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" role="img">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${a}"/>
      <stop offset="1" stop-color="${b}"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="20" stdDeviation="18" flood-color="#0f172a" flood-opacity=".25"/>
    </filter>
  </defs>
  <rect width="960" height="540" rx="42" fill="url(#bg)"/>
  <circle cx="116" cy="96" r="76" fill="#fff" opacity=".13"/>
  <circle cx="826" cy="424" r="128" fill="#fff" opacity=".12"/>
  <path d="M84 434 C210 330 328 506 470 388 C620 264 698 330 858 206" fill="none" stroke="#fff" stroke-width="18" opacity=".14" stroke-linecap="round"/>
  ${body}
</svg>
`;
}

const draw = {
  city: `<g filter="url(#shadow)" fill="#fff"><rect x="205" y="254" width="92" height="148" rx="12"/><rect x="322" y="200" width="112" height="202" rx="12"/><rect x="462" y="244" width="88" height="158" rx="12"/><rect x="585" y="170" width="130" height="232" rx="12"/></g><g fill="#0f172a" opacity=".28"><rect x="230" y="286" width="24" height="24" rx="4"/><rect x="266" y="286" width="24" height="24" rx="4"/><rect x="356" y="236" width="24" height="24" rx="4"/><rect x="392" y="236" width="24" height="24" rx="4"/><rect x="622" y="208" width="28" height="28" rx="4"/><rect x="666" y="208" width="28" height="28" rx="4"/></g><circle cx="512" cy="136" r="44" fill="#fff" opacity=".9"/><path d="M512 160v58M482 188h60" stroke="#0f172a" stroke-width="18" stroke-linecap="round" opacity=".3"/>`,
  logic: `<g fill="#fff" filter="url(#shadow)"><circle cx="316" cy="264" r="86"/><circle cx="502" cy="224" r="68"/><circle cx="636" cy="328" r="78"/></g><path d="M384 248l58-14M552 258l36 36" stroke="#fff" stroke-width="28" stroke-linecap="round" opacity=".8"/><g fill="#0f172a" opacity=".25"><circle cx="292" cy="246" r="13"/><circle cx="338" cy="246" r="13"/><path d="M286 296c28 22 60 22 88 0" fill="none" stroke="#0f172a" stroke-width="12" stroke-linecap="round"/><rect x="476" y="198" width="52" height="52" rx="10"/><path d="M608 318h56M636 290v56" stroke="#0f172a" stroke-width="16" stroke-linecap="round"/></g>`,
  turtle: `<path d="M272 360c40-104 150-154 260-112 98 38 142 104 102 146-44 46-154 36-244 24-74-10-136-12-118-58Z" fill="#fff" opacity=".92" filter="url(#shadow)"/><circle cx="668" cy="322" r="42" fill="#fff" opacity=".92"/><path d="M356 292c48 40 104 56 178 64M428 252c8 68 18 108 44 166" stroke="#0f172a" stroke-width="18" opacity=".25" stroke-linecap="round"/><path d="M218 206c56 0 92 24 112 74" stroke="#fff" stroke-width="20" opacity=".75" fill="none" stroke-linecap="round"/><path d="M198 172h124" stroke="#fff" stroke-width="18" opacity=".75" stroke-linecap="round"/>`,
  web: `<rect x="188" y="134" width="584" height="304" rx="28" fill="#fff" opacity=".94" filter="url(#shadow)"/><rect x="188" y="134" width="584" height="58" rx="28" fill="#e0f2fe"/><circle cx="232" cy="163" r="11" fill="#ef4444"/><circle cx="268" cy="163" r="11" fill="#f59e0b"/><circle cx="304" cy="163" r="11" fill="#22c55e"/><path d="M322 284l-62 54 62 54M638 284l62 54-62 54M530 260l-80 150" stroke="#0f172a" stroke-width="28" opacity=".25" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
  blocks: `<g filter="url(#shadow)"><rect x="224" y="190" width="142" height="142" rx="18" fill="#fff" opacity=".92"/><rect x="394" y="138" width="162" height="162" rx="18" fill="#fff" opacity=".85"/><rect x="584" y="230" width="132" height="132" rx="18" fill="#fff" opacity=".92"/><rect x="376" y="330" width="184" height="88" rx="18" fill="#fff" opacity=".8"/></g><g opacity=".24" fill="#0f172a"><rect x="250" y="216" width="34" height="34" rx="6"/><rect x="442" y="182" width="42" height="42" rx="6"/><rect x="626" y="268" width="34" height="34" rx="6"/></g>`,
  drone: `<path d="M374 272h212M480 214v116" stroke="#fff" stroke-width="30" stroke-linecap="round" filter="url(#shadow)"/><rect x="430" y="236" width="100" height="72" rx="22" fill="#fff"/><g fill="none" stroke="#fff" stroke-width="16"><circle cx="332" cy="272" r="52"/><circle cx="628" cy="272" r="52"/><circle cx="480" cy="172" r="52"/><circle cx="480" cy="372" r="52"/></g><path d="M216 424h528" stroke="#fff" stroke-width="10" opacity=".35" stroke-linecap="round"/>`,
  'drone-grid': `<path d="M254 190h452v230H254z" fill="#fff" opacity=".18"/><path d="M254 248h452M254 306h452M254 364h452M344 190v230M434 190v230M524 190v230M614 190v230" stroke="#fff" stroke-width="6" opacity=".35"/><path d="M316 360l110-92 126 72 104-122" stroke="#fff" stroke-width="18" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="316" cy="360" r="18" fill="#fff"/><circle cx="426" cy="268" r="18" fill="#fff"/><circle cx="552" cy="340" r="18" fill="#fff"/><circle cx="656" cy="218" r="18" fill="#fff"/>`,
  'code-drone': `<path d="M350 262h260M480 200v124" stroke="#fff" stroke-width="24" stroke-linecap="round" filter="url(#shadow)"/><rect x="432" y="226" width="96" height="72" rx="20" fill="#fff"/><circle cx="310" cy="262" r="48" fill="none" stroke="#fff" stroke-width="14"/><circle cx="650" cy="262" r="48" fill="none" stroke="#fff" stroke-width="14"/><path d="M238 388l-54-48 54-48M722 292l54 48-54 48M542 386l-124 0" stroke="#fff" stroke-width="18" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".82"/>`,
  'camera-drone': `<path d="M344 210h272M480 210v86" stroke="#fff" stroke-width="24" stroke-linecap="round"/><circle cx="304" cy="210" r="48" fill="none" stroke="#fff" stroke-width="14"/><circle cx="656" cy="210" r="48" fill="none" stroke="#fff" stroke-width="14"/><rect x="348" y="286" width="264" height="132" rx="30" fill="#fff" filter="url(#shadow)"/><circle cx="480" cy="352" r="42" fill="none" stroke="#0f172a" stroke-width="20" opacity=".25"/><rect x="384" y="260" width="80" height="44" rx="16" fill="#fff"/>`,
  'data-drone': `<path d="M342 206h276M480 206v92" stroke="#fff" stroke-width="24" stroke-linecap="round"/><rect x="428" y="226" width="104" height="72" rx="22" fill="#fff"/><circle cx="302" cy="206" r="48" fill="none" stroke="#fff" stroke-width="14"/><circle cx="658" cy="206" r="48" fill="none" stroke="#fff" stroke-width="14"/><g fill="#fff" opacity=".86"><rect x="298" y="358" width="56" height="62" rx="10"/><rect x="390" y="318" width="56" height="102" rx="10"/><rect x="482" y="338" width="56" height="82" rx="10"/><rect x="574" y="282" width="56" height="138" rx="10"/></g>`,
  'future-city': `<g fill="#fff" filter="url(#shadow)"><path d="M246 398V252l88-58 90 58v146z" opacity=".92"/><path d="M428 398V184l98-62 96 62v214z" opacity=".8"/><path d="M628 398V260l76-50 76 50v138z" opacity=".92"/></g><path d="M242 408h548" stroke="#fff" stroke-width="16" opacity=".72" stroke-linecap="round"/><circle cx="526" cy="244" r="42" fill="#0f172a" opacity=".18"/><path d="M294 282h72M472 220h108M668 294h72" stroke="#0f172a" stroke-width="14" opacity=".18" stroke-linecap="round"/>`,
  craftom: `<g filter="url(#shadow)"><rect x="250" y="292" width="142" height="106" rx="16" fill="#fff" opacity=".9"/><rect x="406" y="226" width="142" height="172" rx="16" fill="#fff" opacity=".8"/><rect x="562" y="162" width="142" height="236" rx="16" fill="#fff" opacity=".9"/></g><path d="M316 292v-62h78M472 226v-70h94M630 162v-58h76" stroke="#fff" stroke-width="18" opacity=".72" fill="none" stroke-linecap="round"/><path d="M282 326h78M438 266h78M594 206h78" stroke="#0f172a" stroke-width="16" opacity=".2" stroke-linecap="round"/>`,
  ai: `<circle cx="480" cy="270" r="106" fill="#fff" opacity=".92" filter="url(#shadow)"/><path d="M420 270h120M480 210v120M396 218l-56-46M564 218l56-46M396 322l-56 46M564 322l56 46" stroke="#0f172a" stroke-width="18" opacity=".24" stroke-linecap="round"/><g fill="#fff"><circle cx="330" cy="164" r="22"/><circle cx="630" cy="164" r="22"/><circle cx="330" cy="376" r="22"/><circle cx="630" cy="376" r="22"/></g>`,
  mission: `<path d="M478 126l60 120 132 20-96 94 24 132-120-62-118 62 22-132-94-94 132-20z" fill="#fff" opacity=".9" filter="url(#shadow)"/><path d="M286 404h384" stroke="#fff" stroke-width="16" opacity=".35" stroke-linecap="round"/><circle cx="480" cy="302" r="42" fill="#0f172a" opacity=".22"/><path d="M480 230v56" stroke="#0f172a" stroke-width="18" opacity=".24" stroke-linecap="round"/>`,
  money: `<circle cx="480" cy="272" r="132" fill="#fff" opacity=".92" filter="url(#shadow)"/><path d="M480 182v184M536 214c-26-24-98-28-112 14-22 66 126 42 104 110-14 42-90 38-126 8" stroke="#0f172a" stroke-width="24" fill="none" opacity=".25" stroke-linecap="round"/><g fill="#fff" opacity=".7"><rect x="238" y="336" width="116" height="64" rx="16"/><rect x="606" y="142" width="116" height="64" rx="16"/></g>`,
  nature: `<path d="M476 420c-18-128 38-214 138-288 24 130-22 236-138 288Z" fill="#fff" opacity=".9" filter="url(#shadow)"/><path d="M480 420c-64-92-146-114-252-76 70 98 164 126 252 76Z" fill="#fff" opacity=".72"/><path d="M478 412c36-90 80-160 136-274M266 348c80 14 146 34 214 66" stroke="#0f172a" stroke-width="16" opacity=".2" stroke-linecap="round"/><circle cx="312" cy="158" r="42" fill="#fff" opacity=".76"/>`,
  gamepad: `<path d="M286 240c28-48 112-44 194-20 82-24 166-28 194 20 22 38 52 140 12 170-42 32-98-28-146-56H420c-48 28-104 88-146 56-40-30-10-132 12-170Z" fill="#fff" opacity=".92" filter="url(#shadow)"/><path d="M356 294h68M390 260v68M574 274h2M636 326h2" stroke="#0f172a" stroke-width="24" opacity=".24" stroke-linecap="round"/>`,
  roblox: `<g filter="url(#shadow)"><rect x="300" y="150" width="360" height="280" rx="34" fill="#fff" opacity=".9" transform="rotate(-8 480 290)"/></g><rect x="428" y="238" width="96" height="96" rx="14" fill="#0f172a" opacity=".22" transform="rotate(-8 476 286)"/><path d="M264 420h430" stroke="#fff" stroke-width="18" opacity=".45" stroke-linecap="round"/>`,
  quest: `<path d="M276 398c30-112 106-178 204-206 98 28 174 94 204 206H276Z" fill="#fff" opacity=".9" filter="url(#shadow)"/><path d="M480 194v206M352 316h256" stroke="#0f172a" stroke-width="18" opacity=".2" stroke-linecap="round"/><circle cx="480" cy="144" r="44" fill="#fff" opacity=".86"/><path d="M480 122v44M458 144h44" stroke="#0f172a" stroke-width="14" opacity=".22" stroke-linecap="round"/>`,
  playcode: `<rect x="232" y="154" width="496" height="270" rx="36" fill="#fff" opacity=".92" filter="url(#shadow)"/><path d="M410 230l128 74-128 74z" fill="#0f172a" opacity=".24"/><g fill="#fff" opacity=".65"><rect x="190" y="120" width="104" height="56" rx="18"/><rect x="666" y="364" width="104" height="56" rx="18"/></g>`,
  webmakers: `<rect x="206" y="136" width="548" height="304" rx="30" fill="#fff" opacity=".92" filter="url(#shadow)"/><path d="M206 210h548" stroke="#0f172a" stroke-width="16" opacity=".15"/><rect x="254" y="254" width="156" height="112" rx="18" fill="#0f172a" opacity=".15"/><path d="M456 268h204M456 314h156M456 360h184" stroke="#0f172a" stroke-width="20" opacity=".18" stroke-linecap="round"/><circle cx="254" cy="174" r="12" fill="#ef4444"/><circle cx="292" cy="174" r="12" fill="#f59e0b"/><circle cx="330" cy="174" r="12" fill="#22c55e"/>`,
};

for (const [name, a, b, kind] of covers) {
  writeFileSync(new URL(`${name}.svg`, outDir), common(a, b, draw[kind]));
}
