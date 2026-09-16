/* ═══════════════════════════════════════════════════════════════════
   Référents de pôle AESH — avatars (portrait à composer ou mascotte habillable)
   Tout est dessiné en SVG : aucune image, aucune photo, rien de personnel.
   svgAvatar(a, {humeur, taille, id}) → chaîne SVG. a = {type:'portrait'|'mascotte', ...choix}
   ═══════════════════════════════════════════════════════════════════ */
export const TEINTS = ['#f8dcc4', '#f1c9a8', '#e0aa82', '#c98b62', '#a66a44', '#7a4a2e', '#5a3421', '#3d2418'];
export const COULEURS_CHEVEUX = ['#1c1410', '#3a2618', '#5a3a22', '#8a4a1e', '#a0622c', '#c98a3c', '#d9a066', '#eed08a', '#8a8a8a', '#e8e8e8', '#b8323a', '#3b5fd1', '#7c3aed', '#0d9488', '#ec4899'];
export const FONDS = ['#0f766e', '#6d4bd1', '#3f7d20', '#b4530b', '#1d4ed8', '#c9444f', '#0e7490', '#b8931c', '#d14f93', '#475569', '#7c3aed', '#059669'];
export const HAUTS = ['#ffffff', '#1f2937', '#c9444f', '#1d4ed8', '#0f766e', '#f59e0b', '#7c3aed', '#ec4899', '#84cc16', '#f97316', '#64748b', '#0ea5e9'];
export const CHEVEUX = ['court', 'bouclé', 'long', 'chignon', 'frange', 'afro', 'tresses', 'rasé', 'crête', 'queue de cheval', 'mèche', 'garçonne', 'foulard', 'hijab', 'dreadlocks', 'ondulé'];
export const YEUX = ['ronds', 'rieurs', 'en amande', 'clin d’œil', 'grands', 'malicieux'];
export const IRIS = ['#2b2118', '#3b5fd1', '#3f7d20', '#8a4a1e', '#64748b'];
export const SOURCILS = ['arqués', 'droits', 'épais'];
export const NEZ = ['petit', 'rond', 'droit'];
export const BOUCHES = ['sourire', 'grand sourire', 'neutre', 'malicieux', 'rire', 'moue'];
export const PILOSITE = ['aucune', 'barbe courte', 'barbe longue', 'bouc', 'moustache', 'moustache en guidon'];
export const LUNETTES = ['aucune', 'rondes', 'carrées', 'soleil', 'demi-lunes', 'papillon', 'monocle'];
export const CHAPEAUX = ['aucun', 'bonnet', 'casquette', 'béret', 'chapeau de paille', 'bandeau', 'chapeau de fête', 'couronne de fleurs'];
export const ACCESSOIRES = ['aucun', 'boucles d’oreilles', 'écharpe', 'cravate', 'nœud papillon', 'tablier', 'casque audio', 'piercing'];
export const MOTIFS = ['uni', 'rayures', 'pois', 'capuche'];
export const OBJETS = ['aucun', 'café', 'livre', 'plante', 'clé à molette', 'sécateur', 'ballon', 'crayon', 'ordinateur', 'osier'];
export const ANIMAUX = ['renard', 'hibou', 'chat', 'panda', 'abeille', 'koala', 'grenouille', 'pingouin', 'loutre', 'hérisson', 'tortue', 'cerf', 'lapin', 'ours', 'robot', 'plante'];
export const EXPRESSIONS = ['tres-bien', 'bien', 'bof', 'fatigue', 'difficile'];

const hasard = a => a[Math.floor(Math.random() * a.length)];
const peut = p => Math.random() < p;
export function auHasard(type) {
  if (type === 'mascotte' || (!type && peut(.3))) return { type: 'mascotte', animal: hasard(ANIMAUX), fond: hasard(FONDS), lunettes: peut(.3) ? hasard(LUNETTES.slice(1, 4)) : 'aucune', chapeau: peut(.35) ? hasard(CHAPEAUX.slice(1)) : 'aucun', echarpe: peut(.3) ? hasard(HAUTS.slice(2)) : '' };
  return { type: 'portrait', forme: hasard(['rond', 'ovale', 'carré']), teint: hasard(TEINTS), cheveux: hasard(CHEVEUX), couleur: hasard(COULEURS_CHEVEUX), meche: peut(.2) ? hasard(COULEURS_CHEVEUX.slice(10)) : '',
    yeux: hasard(YEUX.slice(0, 3).concat(YEUX.slice(4))), iris: hasard(IRIS), sourcils: hasard(SOURCILS), nez: hasard(NEZ), bouche: hasard(BOUCHES.slice(0, 5)), pilosite: peut(.3) ? hasard(PILOSITE.slice(1)) : 'aucune',
    lunettes: peut(.4) ? hasard(LUNETTES.slice(1)) : 'aucune', chapeau: peut(.3) ? hasard(CHAPEAUX.slice(1)) : 'aucun', accessoire: peut(.5) ? hasard(ACCESSOIRES.slice(1)) : 'aucun',
    haut: hasard(HAUTS), motif: hasard(MOTIFS), taches: peut(.25), joues: peut(.4), objet: peut(.35) ? hasard(OBJETS.slice(1)) : 'aucun', fond: hasard(FONDS) };
}
export function normaliser(a) {
  if (!a || typeof a !== 'object') return null;
  const dans = (v, l, d) => l.includes(v) ? v : d, coul = (v, d) => /^#[0-9a-f]{6}$/i.test(String(v || '')) ? v : d;
  if (a.type === 'mascotte') return { type: 'mascotte', animal: dans(a.animal, ANIMAUX, 'renard'), fond: coul(a.fond, FONDS[0]), lunettes: dans(a.lunettes, LUNETTES, 'aucune'), chapeau: dans(a.chapeau, CHAPEAUX, 'aucun'), echarpe: coul(a.echarpe, '') };
  return { type: 'portrait', forme: dans(a.forme, ['rond', 'ovale', 'carré'], 'rond'), teint: coul(a.teint, TEINTS[2]), cheveux: dans(a.cheveux, CHEVEUX, 'court'), couleur: coul(a.couleur, COULEURS_CHEVEUX[1]), meche: coul(a.meche, ''),
    yeux: dans(a.yeux, YEUX, 'ronds'), iris: coul(a.iris, IRIS[0]), sourcils: dans(a.sourcils, SOURCILS, 'arqués'), nez: dans(a.nez, NEZ, 'petit'), bouche: dans(a.bouche, BOUCHES, 'sourire'), pilosite: dans(a.pilosite, PILOSITE, 'aucune'),
    lunettes: dans(a.lunettes, LUNETTES, 'aucune'), chapeau: dans(a.chapeau, CHAPEAUX, 'aucun'), accessoire: dans(a.accessoire, ACCESSOIRES, 'aucun'), haut: coul(a.haut, HAUTS[0]), motif: dans(a.motif, MOTIFS, 'uni'),
    taches: !!a.taches, joues: !!a.joues, objet: dans(a.objet, OBJETS, 'aucun'), fond: coul(a.fond, FONDS[0]) };
}

const OM = '#2b2118';
const STYLE = `<style>.oe{transform-origin:center;animation:clig 6s infinite}@keyframes clig{0%,94%,100%{transform:scaleY(1)}97%{transform:scaleY(.1)}}.clin .oe{animation:clin .5s 1}@keyframes clin{50%{transform:scaleY(.1)}}@media(prefers-reduced-motion:reduce){.oe{animation:none}}</style>`;

/* ─────────── portrait ─────────── */
function portrait(a, ex) {
  const t = a.teint, c = a.couleur, ir = a.iris;
  const fonce = h => { const n = parseInt(h.slice(1), 16); return '#' + [16, 8, 0].map(s => Math.max(0, ((n >> s) & 255) - 28).toString(16).padStart(2, '0')).join(''); };
  const visage = a.forme === 'rond' ? `<circle cx="50" cy="52" r="26" fill="${t}"/>` : a.forme === 'ovale' ? `<ellipse cx="50" cy="52" rx="23" ry="28" fill="${t}"/>` : `<rect x="26" y="26" width="48" height="52" rx="16" fill="${t}"/>`;
  const oreilles = `<circle cx="25" cy="54" r="5" fill="${t}"/><circle cx="75" cy="54" r="5" fill="${t}"/>`;
  const motif = a.motif === 'rayures' ? `<path d="M22 92 L78 92 M20 98 L80 98" stroke="${fonce(a.haut)}" stroke-width="3"/>` : a.motif === 'pois' ? `<circle cx="36" cy="92" r="2" fill="${fonce(a.haut)}"/><circle cx="50" cy="96" r="2" fill="${fonce(a.haut)}"/><circle cx="64" cy="92" r="2" fill="${fonce(a.haut)}"/>` : a.motif === 'capuche' ? `<path d="M22 100 Q28 78 50 74 Q72 78 78 100Z" fill="${fonce(a.haut)}" opacity=".5"/>` : '';
  const corps = `<rect x="42" y="72" width="16" height="14" fill="${t}"/><path d="M16 100 Q50 64 84 100Z" fill="${a.haut}"/>${motif}`;
  const chev = {
    court: `<path d="M24 46 Q26 20 50 20 Q74 20 76 46 Q68 30 50 30 Q32 30 24 46Z" fill="${c}"/>`,
    'bouclé': [30, 42, 58, 70, 50, 36, 64].map((x, i) => `<circle cx="${x}" cy="${[38, 28, 28, 38, 24, 32, 32][i]}" r="9" fill="${c}"/>`).join(''),
    long: `<path d="M22 52 Q22 18 50 18 Q78 18 78 52 L80 84 L66 84 L64 46 Q50 34 36 46 L34 84 L20 84Z" fill="${c}"/>`,
    chignon: `<circle cx="50" cy="19" r="10" fill="${c}"/><path d="M24 48 Q26 24 50 24 Q74 24 76 48 Q66 32 50 32 Q34 32 24 48Z" fill="${c}"/>`,
    frange: `<path d="M24 50 Q24 20 50 20 Q76 20 76 50 L72 50 Q70 36 58 36 L42 36 Q30 36 28 50Z" fill="${c}"/>`,
    afro: `<circle cx="50" cy="40" r="34" fill="${c}"/>`,
    tresses: `<path d="M24 48 Q26 22 50 22 Q74 22 76 48 Q66 32 50 32 Q34 32 24 48Z" fill="${c}"/><path d="M26 46 Q20 70 26 90" stroke="${c}" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M74 46 Q80 70 74 90" stroke="${c}" stroke-width="7" fill="none" stroke-linecap="round"/>`,
    'rasé': `<path d="M26 44 Q28 24 50 24 Q72 24 74 44 Q64 34 50 34 Q36 34 26 44Z" fill="${c}" opacity=".45"/>`,
    'crête': `<path d="M42 30 L50 4 L58 30Z" fill="${c}"/><path d="M28 44 Q30 26 50 26 Q70 26 72 44 Q64 34 50 34 Q36 34 28 44Z" fill="${c}"/>`,
    'queue de cheval': `<path d="M24 48 Q26 22 50 22 Q74 22 76 48 Q66 32 50 32 Q34 32 24 48Z" fill="${c}"/><path d="M72 36 Q90 50 82 84" stroke="${c}" stroke-width="9" fill="none" stroke-linecap="round"/>`,
    'mèche': `<path d="M24 48 Q26 20 50 20 Q74 20 76 48 Q70 30 50 30 Q40 30 30 40 Q34 34 44 34 L26 52Z" fill="${c}"/>`,
    'garçonne': `<path d="M24 50 Q24 20 50 20 Q76 20 76 50 L70 50 Q68 34 50 32 Q36 32 34 44 L30 52Z" fill="${c}"/>`,
    foulard: `<path d="M22 50 Q22 18 50 18 Q78 18 78 50 L74 50 Q72 32 50 32 Q28 32 26 50Z" fill="#c9444f"/><path d="M70 26 L86 20 L80 36Z" fill="#c9444f"/><circle cx="34" cy="26" r="2" fill="#fff"/><circle cx="50" cy="22" r="2" fill="#fff"/><circle cx="66" cy="26" r="2" fill="#fff"/>`,
    hijab: `<path d="M18 100 Q14 40 50 16 Q86 40 82 100Z" fill="${c}"/><path d="M50 22 Q30 40 30 60 Q34 46 50 44 Q66 46 70 60 Q70 40 50 22Z" fill="${t}"/>`,
    dreadlocks: `<path d="M24 48 Q26 22 50 22 Q74 22 76 48 Q66 32 50 32 Q34 32 24 48Z" fill="${c}"/>` + [24, 30, 36, 64, 70, 76].map(x => `<path d="M${x} 42 Q${x - 2} 66 ${x} 88" stroke="${c}" stroke-width="5" fill="none" stroke-linecap="round"/>`).join(''),
    'ondulé': `<path d="M22 54 Q20 18 50 18 Q80 18 78 54 Q84 70 74 86 Q74 66 66 48 Q50 36 34 48 Q26 66 26 86 Q16 70 22 54Z" fill="${c}"/>`
  }[a.cheveux];
  const meche = a.meche && !['rasé', 'hijab', 'foulard'].includes(a.cheveux) ? `<path d="M58 22 Q66 26 70 40" stroke="${a.meche}" stroke-width="5" fill="none" stroke-linecap="round"/>` : '';
  const sourcils = { 'arqués': `<path d="M36 43 Q41 39 46 43" stroke="${c}" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M54 43 Q59 39 64 43" stroke="${c}" stroke-width="2" fill="none" stroke-linecap="round"/>`,
    droits: `<path d="M36 42 L46 42" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/><path d="M54 42 L64 42" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/>`,
    'épais': `<path d="M35 43 Q41 38 47 43" stroke="${c}" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M53 43 Q59 38 65 43" stroke="${c}" stroke-width="3.5" fill="none" stroke-linecap="round"/>` }[a.sourcils];
  const sourcilsEx = ex === 'difficile' ? `<path d="M36 41 L46 44" stroke="${c}" stroke-width="2.4" stroke-linecap="round"/><path d="M64 41 L54 44" stroke="${c}" stroke-width="2.4" stroke-linecap="round"/>` : ex === 'fatigue' ? `<path d="M36 44 L46 42" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/><path d="M64 44 L54 42" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/>` : sourcils;
  const oeil = (x, type) => ({
    ronds: `<g class="oe"><circle cx="${x}" cy="50" r="3.6" fill="#fff"/><circle cx="${x}" cy="50" r="2.6" fill="${ir}"/><circle cx="${x + 1}" cy="49" r=".9" fill="#fff"/></g>`,
    rieurs: `<path d="M${x - 4} 51 Q${x} 46 ${x + 4} 51" stroke="${OM}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`,
    'en amande': `<g class="oe"><ellipse cx="${x}" cy="50" rx="4.2" ry="2.6" fill="#fff"/><circle cx="${x}" cy="50" r="2.2" fill="${ir}"/></g>`,
    'clin d’œil': x < 50 ? `<g class="oe"><circle cx="${x}" cy="50" r="3.4" fill="#fff"/><circle cx="${x}" cy="50" r="2.4" fill="${ir}"/></g>` : `<path d="M${x - 4} 50 L${x + 4} 50" stroke="${OM}" stroke-width="2.5" stroke-linecap="round"/>`,
    grands: `<g class="oe"><circle cx="${x}" cy="50" r="4.6" fill="#fff"/><circle cx="${x}" cy="50.5" r="3.2" fill="${ir}"/><circle cx="${x + 1.2}" cy="49" r="1.1" fill="#fff"/></g>`,
    malicieux: `<g class="oe"><path d="M${x - 4} 49 Q${x} 46 ${x + 4} 49 L${x + 4} 52 L${x - 4} 52Z" fill="#fff"/><circle cx="${x}" cy="50.5" r="2.2" fill="${ir}"/></g>`,
    fatigue: `<g><path d="M${x - 4} 49 Q${x} 53 ${x + 4} 49" stroke="${OM}" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M${x - 4} 47 L${x + 4} 47" stroke="${OM}" stroke-width="1.6" stroke-linecap="round" opacity=".6"/></g>`,
    triste: `<g class="oe"><circle cx="${x}" cy="50" r="3.4" fill="#fff"/><circle cx="${x}" cy="51" r="2.4" fill="${ir}"/></g>`
  })[type];
  const yeuxType = ex === 'tres-bien' ? 'rieurs' : ex === 'fatigue' ? 'fatigue' : ex === 'difficile' ? 'triste' : a.yeux;
  const yeux = oeil(41, yeuxType) + oeil(59, yeuxType);
  const nez = { petit: `<path d="M50 54 L48 59 L52 59" stroke="${fonce(t)}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`, rond: `<circle cx="50" cy="58" r="2.4" fill="${fonce(t)}" opacity=".7"/>`, droit: `<path d="M50 52 L49 59 L52 59" stroke="${fonce(t)}" stroke-width="1.6" fill="none" stroke-linecap="round"/>` }[a.nez];
  const bo = ex === 'tres-bien' ? 'grand sourire' : ex === 'bof' ? 'neutre' : ex === 'fatigue' ? 'moue' : ex === 'difficile' ? 'triste' : ex === 'bien' ? (a.bouche === 'neutre' || a.bouche === 'moue' ? 'sourire' : a.bouche) : a.bouche;
  const bouche = {
    sourire: `<path d="M43 63 Q50 69 57 63" stroke="${OM}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
    'grand sourire': `<path d="M41 62 Q50 73 59 62Z" fill="#fff" stroke="${OM}" stroke-width="2"/>`,
    neutre: `<path d="M44 64 L56 64" stroke="${OM}" stroke-width="2.4" stroke-linecap="round"/>`,
    malicieux: `<path d="M43 64 Q52 67 58 61" stroke="${OM}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
    rire: `<path d="M41 61 Q50 75 59 61Z" fill="#7a2b2b"/><path d="M45 61 L55 61" stroke="#fff" stroke-width="2"/>`,
    moue: `<path d="M44 65 Q50 63 56 65" stroke="${OM}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
    triste: `<path d="M43 67 Q50 61 57 67" stroke="${OM}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`
  }[bo];
  const joues = a.joues || ex === 'tres-bien' ? `<circle cx="36" cy="58" r="4" fill="#f472b6" opacity=".35"/><circle cx="64" cy="58" r="4" fill="#f472b6" opacity=".35"/>` : '';
  const taches = a.taches ? [34, 38, 42, 58, 62, 66].map((x, i) => `<circle cx="${x}" cy="${57 + (i % 2) * 2}" r=".9" fill="${fonce(t)}" opacity=".6"/>`).join('') : '';
  const pil = { aucune: '', 'barbe courte': `<path d="M28 58 Q30 80 50 82 Q70 80 72 58 Q66 74 50 74 Q34 74 28 58Z" fill="${c}" opacity=".9"/>`,
    'barbe longue': `<path d="M27 56 Q26 92 50 96 Q74 92 73 56 Q66 74 50 72 Q34 74 27 56Z" fill="${c}"/>`,
    bouc: `<path d="M44 68 Q50 80 56 68 Q50 72 44 68Z" fill="${c}"/>`,
    moustache: `<path d="M40 60 Q45 56 50 60 Q55 56 60 60 Q55 63 50 61 Q45 63 40 60Z" fill="${c}"/>`,
    'moustache en guidon': `<path d="M38 58 Q44 56 50 60 Q56 56 62 58 Q64 62 60 62 Q54 60 50 62 Q46 60 40 62 Q36 62 38 58Z" fill="${c}"/>` }[a.pilosite];
  const lun = { aucune: '', rondes: `<circle cx="41" cy="50" r="7" fill="none" stroke="${OM}" stroke-width="2"/><circle cx="59" cy="50" r="7" fill="none" stroke="${OM}" stroke-width="2"/><path d="M48 50 L52 50" stroke="${OM}" stroke-width="2"/>`,
    'carrées': `<rect x="33" y="44" width="15" height="12" rx="3" fill="none" stroke="${OM}" stroke-width="2"/><rect x="52" y="44" width="15" height="12" rx="3" fill="none" stroke="${OM}" stroke-width="2"/><path d="M48 50 L52 50" stroke="${OM}" stroke-width="2"/>`,
    soleil: `<rect x="33" y="44" width="15" height="12" rx="4" fill="#1f2937" opacity=".85"/><rect x="52" y="44" width="15" height="12" rx="4" fill="#1f2937" opacity=".85"/><path d="M48 49 L52 49" stroke="#1f2937" stroke-width="2"/>`,
    'demi-lunes': `<path d="M34 51 A7 7 0 0 0 48 51Z" fill="none" stroke="${OM}" stroke-width="2"/><path d="M52 51 A7 7 0 0 0 66 51Z" fill="none" stroke="${OM}" stroke-width="2"/><path d="M48 51 L52 51" stroke="${OM}" stroke-width="2"/>`,
    papillon: `<path d="M33 46 Q41 42 48 48 Q46 57 38 56 Q33 54 33 46Z" fill="none" stroke="${OM}" stroke-width="2"/><path d="M67 46 Q59 42 52 48 Q54 57 62 56 Q67 54 67 46Z" fill="none" stroke="${OM}" stroke-width="2"/>`,
    monocle: `<circle cx="59" cy="50" r="7" fill="none" stroke="${OM}" stroke-width="2"/><path d="M64 55 Q70 66 66 78" stroke="${OM}" stroke-width="1.4" fill="none"/>` }[a.lunettes];
  const chap = { aucun: '', bonnet: `<path d="M22 44 Q24 14 50 14 Q76 14 78 44Z" fill="#c9444f"/><rect x="20" y="40" width="60" height="9" rx="4" fill="#a8323d"/><circle cx="50" cy="13" r="5" fill="#fff"/>`,
    casquette: `<path d="M24 42 Q26 16 50 16 Q74 16 76 42Z" fill="#1d4ed8"/><path d="M22 42 L90 42 L88 48 L22 46Z" fill="#1e40af"/>`,
    'béret': `<path d="M22 40 Q24 20 52 18 Q80 20 78 38 Q60 30 24 42Z" fill="#1f2937"/><circle cx="52" cy="17" r="2.5" fill="#1f2937"/>`,
    'chapeau de paille': `<path d="M26 42 Q28 18 50 18 Q72 18 74 42Z" fill="#eed08a"/><rect x="12" y="40" width="76" height="6" rx="3" fill="#e2bd66"/><rect x="26" y="34" width="48" height="6" fill="#c9444f"/>`,
    bandeau: `<rect x="24" y="30" width="52" height="7" rx="3" fill="#0ea5e9"/>`,
    'chapeau de fête': `<path d="M38 36 L50 2 L62 36Z" fill="#f59e0b"/><circle cx="50" cy="3" r="3.5" fill="#ec4899"/><path d="M42 24 L58 24" stroke="#fff" stroke-width="2"/><path d="M40 30 L60 30" stroke="#7c3aed" stroke-width="2"/>`,
    'couronne de fleurs': [26, 34, 42, 50, 58, 66, 74].map((x, i) => `<circle cx="${x}" cy="${[38, 30, 26, 24, 26, 30, 38][i]}" r="4" fill="${['#f472b6', '#f59e0b', '#fff', '#f472b6', '#f59e0b', '#fff', '#f472b6'][i]}"/>`).join('') }[a.chapeau];
  const acc = { aucun: '', 'boucles d’oreilles': `<circle cx="25" cy="61" r="2.5" fill="#f2c14e"/><circle cx="75" cy="61" r="2.5" fill="#f2c14e"/>`,
    'écharpe': `<path d="M30 82 Q50 92 70 82 L72 90 Q50 100 28 90Z" fill="#c9444f"/><path d="M62 86 L70 100 L58 100Z" fill="#a8323d"/>`,
    cravate: `<path d="M47 84 L53 84 L55 100 L45 100Z" fill="#1d4ed8"/>`, 'nœud papillon': `<path d="M40 84 L50 88 L40 92Z" fill="#c9444f"/><path d="M60 84 L50 88 L60 92Z" fill="#c9444f"/><circle cx="50" cy="88" r="2.5" fill="#8a1c1c"/>`,
    tablier: `<path d="M38 86 L62 86 L64 100 L36 100Z" fill="#94a3b8"/><path d="M42 86 L42 80 M58 86 L58 80" stroke="#94a3b8" stroke-width="2"/>`,
    'casque audio': `<path d="M24 50 Q24 22 50 22 Q76 22 76 50" stroke="#1f2937" stroke-width="4" fill="none"/><rect x="19" y="46" width="10" height="14" rx="4" fill="#1f2937"/><rect x="71" y="46" width="10" height="14" rx="4" fill="#1f2937"/>`,
    piercing: `<circle cx="47" cy="59" r="1.4" fill="#f2c14e"/>` }[a.accessoire];
  const obj = { aucun: '', 'café': `<rect x="70" y="80" width="14" height="14" rx="3" fill="#fff"/><path d="M84 84 Q92 87 84 92" stroke="#fff" stroke-width="2.5" fill="none"/><path d="M75 74 Q77 70 75 66 M80 74 Q82 70 80 66" stroke="#fff" stroke-width="1.5" fill="none" opacity=".8"/>`,
    livre: `<rect x="66" y="80" width="18" height="14" rx="2" fill="#1d4ed8"/><path d="M75 80 L75 94" stroke="#fff" stroke-width="1.5"/>`,
    plante: `<rect x="70" y="86" width="14" height="10" rx="2" fill="#b4530b"/><path d="M77 86 Q70 74 76 70 Q82 76 77 86 Q84 76 90 78 Q84 84 77 86" fill="#22c55e"/>`,
    'clé à molette': `<path d="M68 96 L82 80" stroke="#94a3b8" stroke-width="5" stroke-linecap="round"/><circle cx="84" cy="78" r="6" fill="#94a3b8"/><circle cx="84" cy="78" r="2" fill="${a.fond}"/>`,
    'sécateur': `<path d="M70 96 L80 84 M76 96 L84 86" stroke="#c9444f" stroke-width="4" stroke-linecap="round"/><path d="M80 84 L88 76 M84 86 L90 80" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/>`,
    ballon: `<circle cx="80" cy="86" r="9" fill="#fff"/><path d="M80 77 L80 95 M71 86 L89 86" stroke="#1f2937" stroke-width="1.2"/>`,
    crayon: `<path d="M68 96 L86 78" stroke="#f59e0b" stroke-width="5" stroke-linecap="round"/><path d="M86 78 L90 74" stroke="#1f2937" stroke-width="3" stroke-linecap="round"/>`,
    ordinateur: `<rect x="62" y="82" width="24" height="14" rx="2" fill="#94a3b8"/><rect x="64" y="84" width="20" height="10" fill="#0ea5e9"/>`,
    osier: [70, 74, 78, 82, 86].map(x => `<path d="M${x} 100 Q${x + 4} 84 ${x + 10} 74" stroke="#d9a066" stroke-width="2" fill="none"/>`).join('') }[a.objet];
  const derriere = ['long', 'afro', 'tresses', 'queue de cheval', 'dreadlocks', 'ondulé', 'hijab'].includes(a.cheveux);
  return `${derriere ? chev : ''}${corps}${acc.includes('écharpe') || a.accessoire === 'écharpe' ? acc : ''}${oreilles}${visage}${joues}${taches}${sourcilsEx}${yeux}${nez}${bouche}${pil}${derriere ? '' : chev}${meche}${lun}${a.accessoire !== 'écharpe' ? acc : ''}${chap}${obj}`;
}

/* ─────────── mascottes ─────────── */
function mascotte(a, ex) {
  const yeuxM = (x1, x2, y) => ex === 'tres-bien' ? `<path d="M${x1 - 3} ${y} Q${x1} ${y - 4} ${x1 + 3} ${y}" stroke="${OM}" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M${x2 - 3} ${y} Q${x2} ${y - 4} ${x2 + 3} ${y}" stroke="${OM}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`
    : ex === 'fatigue' ? `<path d="M${x1 - 3} ${y - 1} Q${x1} ${y + 2} ${x1 + 3} ${y - 1}" stroke="${OM}" stroke-width="2.2" fill="none"/><path d="M${x2 - 3} ${y - 1} Q${x2} ${y + 2} ${x2 + 3} ${y - 1}" stroke="${OM}" stroke-width="2.2" fill="none"/>`
    : `<g class="oe"><circle cx="${x1}" cy="${y}" r="3" fill="${OM}"/><circle cx="${x2}" cy="${y}" r="3" fill="${OM}"/><circle cx="${x1 + 1}" cy="${y - 1}" r="1" fill="#fff"/><circle cx="${x2 + 1}" cy="${y - 1}" r="1" fill="#fff"/></g>`;
  const boucheM = (x, y) => ex === 'tres-bien' ? `<path d="M${x - 6} ${y} Q${x} ${y + 8} ${x + 6} ${y}Z" fill="#7a2b2b"/>` : ex === 'bof' ? `<path d="M${x - 5} ${y + 1} L${x + 5} ${y + 1}" stroke="${OM}" stroke-width="2" stroke-linecap="round"/>` : ex === 'difficile' ? `<path d="M${x - 5} ${y + 3} Q${x} ${y - 2} ${x + 5} ${y + 3}" stroke="${OM}" stroke-width="2" fill="none" stroke-linecap="round"/>` : `<path d="M${x - 5} ${y} Q${x} ${y + 5} ${x + 5} ${y}" stroke="${OM}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  const A = {
    renard: `<path d="M22 30 L38 44 L62 44 L78 30 L74 58 Q70 78 50 80 Q30 78 26 58Z" fill="#f97316"/><path d="M30 58 Q50 92 70 58 Q60 66 50 66 Q40 66 30 58Z" fill="#fff"/>${yeuxM(41, 59, 55)}<circle cx="50" cy="66" r="3" fill="${OM}"/>`,
    hibou: `<ellipse cx="50" cy="56" rx="26" ry="30" fill="#c4b5fd"/><circle cx="40" cy="50" r="10" fill="#fff"/><circle cx="60" cy="50" r="10" fill="#fff"/>${yeuxM(40, 60, 50)}<path d="M46 62 L54 62 L50 69Z" fill="#f59e0b"/><path d="M30 30 L40 42 L28 44Z" fill="#c4b5fd"/><path d="M70 30 L60 42 L72 44Z" fill="#c4b5fd"/>`,
    chat: `<path d="M26 34 L36 48 L64 48 L74 34 L74 62 Q74 82 50 82 Q26 82 26 62Z" fill="#94a3b8"/>${yeuxM(41, 59, 56)}<path d="M47 64 L53 64 L50 67Z" fill="#f472b6"/><path d="M28 66 L42 64 M28 72 L42 68 M72 66 L58 64 M72 72 L58 68" stroke="${OM}" stroke-width="1.5"/>${boucheM(50, 70)}`,
    panda: `<circle cx="32" cy="34" r="10" fill="#1f2937"/><circle cx="68" cy="34" r="10" fill="#1f2937"/><circle cx="50" cy="56" r="28" fill="#fff"/><ellipse cx="40" cy="52" rx="7" ry="9" fill="#1f2937"/><ellipse cx="60" cy="52" rx="7" ry="9" fill="#1f2937"/><g class="oe"><circle cx="41" cy="53" r="2.5" fill="#fff"/><circle cx="61" cy="53" r="2.5" fill="#fff"/></g><ellipse cx="50" cy="66" rx="4" ry="3" fill="#1f2937"/>${boucheM(50, 72)}`,
    abeille: `<ellipse cx="50" cy="58" rx="24" ry="20" fill="#facc15"/><path d="M34 46 L34 70 M46 40 L46 76 M58 40 L58 76 M70 46 L70 70" stroke="#1f2937" stroke-width="6"/><ellipse cx="34" cy="40" rx="12" ry="8" fill="#fff" opacity=".85"/><ellipse cx="66" cy="40" rx="12" ry="8" fill="#fff" opacity=".85"/><g class="oe"><circle cx="46" cy="56" r="2.5" fill="#fff"/><circle cx="56" cy="56" r="2.5" fill="#fff"/></g>`,
    koala: `<circle cx="26" cy="44" r="13" fill="#94a3b8"/><circle cx="74" cy="44" r="13" fill="#94a3b8"/><circle cx="26" cy="44" r="7" fill="#f9a8d4"/><circle cx="74" cy="44" r="7" fill="#f9a8d4"/><circle cx="50" cy="56" r="26" fill="#cbd5e1"/>${yeuxM(41, 59, 52)}<ellipse cx="50" cy="64" rx="6" ry="8" fill="#1f2937"/>`,
    grenouille: `<circle cx="36" cy="36" r="10" fill="#4ade80"/><circle cx="64" cy="36" r="10" fill="#4ade80"/><circle cx="36" cy="36" r="5" fill="#fff"/><circle cx="64" cy="36" r="5" fill="#fff"/><g class="oe"><circle cx="37" cy="36" r="2.5" fill="${OM}"/><circle cx="65" cy="36" r="2.5" fill="${OM}"/></g><ellipse cx="50" cy="60" rx="28" ry="22" fill="#4ade80"/>${boucheM(50, 62)}`,
    pingouin: `<ellipse cx="50" cy="58" rx="24" ry="30" fill="#1f2937"/><ellipse cx="50" cy="64" rx="15" ry="20" fill="#fff"/><circle cx="43" cy="46" r="3.5" fill="#fff"/><circle cx="57" cy="46" r="3.5" fill="#fff"/><g class="oe"><circle cx="43" cy="46" r="1.6" fill="${OM}"/><circle cx="57" cy="46" r="1.6" fill="${OM}"/></g><path d="M45 53 L55 53 L50 59Z" fill="#f59e0b"/>`,
    loutre: `<ellipse cx="50" cy="56" rx="26" ry="28" fill="#8a5a2b"/><circle cx="28" cy="36" r="6" fill="#8a5a2b"/><circle cx="72" cy="36" r="6" fill="#8a5a2b"/><ellipse cx="50" cy="64" rx="14" ry="12" fill="#d9a066"/>${yeuxM(41, 59, 50)}<ellipse cx="50" cy="60" rx="4" ry="3" fill="${OM}"/>${boucheM(50, 67)}`,
    'hérisson': [20, 28, 36, 44, 52, 60, 68, 76].map(x => `<path d="M${x} 50 L${x + 4} 20 L${x + 8} 50Z" fill="#5a3a22"/>`).join('') + `<ellipse cx="50" cy="62" rx="26" ry="20" fill="#d9a066"/>${yeuxM(41, 59, 58)}<circle cx="50" cy="70" r="3.5" fill="${OM}"/>`,
    tortue: `<ellipse cx="50" cy="50" rx="30" ry="24" fill="#3f7d20"/><path d="M34 40 L50 30 L66 40 L66 58 L50 68 L34 58Z" fill="#5aa832" opacity=".7"/><circle cx="50" cy="76" r="14" fill="#84cc16"/>${yeuxM(44, 56, 74)}${boucheM(50, 82)}`,
    cerf: `<path d="M30 40 L24 18 M30 40 L18 30 M30 40 L34 24 M70 40 L76 18 M70 40 L82 30 M70 40 L66 24" stroke="#8a5a2b" stroke-width="4" stroke-linecap="round"/><ellipse cx="50" cy="60" rx="24" ry="26" fill="#b98a5c"/><ellipse cx="50" cy="70" rx="10" ry="8" fill="#e8d1b5"/>${yeuxM(41, 59, 54)}<ellipse cx="50" cy="68" rx="4" ry="3" fill="${OM}"/>`,
    lapin: `<ellipse cx="38" cy="26" rx="8" ry="18" fill="#e5e7eb"/><ellipse cx="62" cy="26" rx="8" ry="18" fill="#e5e7eb"/><ellipse cx="38" cy="26" rx="4" ry="12" fill="#f9a8d4"/><ellipse cx="62" cy="26" rx="4" ry="12" fill="#f9a8d4"/><circle cx="50" cy="60" r="26" fill="#e5e7eb"/>${yeuxM(41, 59, 56)}<path d="M47 64 L53 64 L50 67Z" fill="#f472b6"/><path d="M46 68 Q50 72 54 68" stroke="${OM}" stroke-width="1.8" fill="none"/><rect x="47" y="70" width="6" height="5" fill="#fff" stroke="${OM}" stroke-width="1"/>`,
    ours: `<circle cx="28" cy="36" r="10" fill="#8a5a2b"/><circle cx="72" cy="36" r="10" fill="#8a5a2b"/><circle cx="50" cy="56" r="28" fill="#8a5a2b"/><ellipse cx="50" cy="66" rx="12" ry="9" fill="#d9a066"/>${yeuxM(41, 59, 52)}<ellipse cx="50" cy="63" rx="4" ry="3" fill="${OM}"/>${boucheM(50, 70)}`,
    robot: `<rect x="26" y="34" width="48" height="44" rx="8" fill="#94a3b8"/><rect x="47" y="20" width="6" height="14" fill="#64748b"/><circle cx="50" cy="18" r="4" fill="#f59e0b"/><rect x="32" y="44" width="36" height="16" rx="4" fill="#1f2937"/><g class="oe"><rect x="38" y="48" width="8" height="8" rx="2" fill="#22d3ee"/><rect x="54" y="48" width="8" height="8" rx="2" fill="#22d3ee"/></g>${ex === 'difficile' ? `<path d="M40 70 Q50 64 60 70" stroke="#1f2937" stroke-width="2" fill="none"/>` : `<path d="M40 66 L60 66 M44 66 L44 70 M52 66 L52 70" stroke="#1f2937" stroke-width="2"/>`}`,
    plante: `<rect x="34" y="70" width="32" height="24" rx="4" fill="#b4530b"/><rect x="30" y="66" width="40" height="8" rx="3" fill="#c9673f"/><path d="M50 70 Q34 56 40 40 Q52 50 50 70 Q56 50 68 44 Q64 60 50 70 Q50 50 44 32 Q56 44 50 70" fill="#22c55e"/>${yeuxM(45, 55, 80)}${boucheM(50, 86)}`
  }[a.animal];
  const lun = a.lunettes && a.lunettes !== 'aucune' ? { rondes: `<circle cx="41" cy="52" r="7" fill="none" stroke="${OM}" stroke-width="2"/><circle cx="59" cy="52" r="7" fill="none" stroke="${OM}" stroke-width="2"/><path d="M48 52 L52 52" stroke="${OM}" stroke-width="2"/>`,
    'carrées': `<rect x="33" y="46" width="15" height="12" rx="3" fill="none" stroke="${OM}" stroke-width="2"/><rect x="52" y="46" width="15" height="12" rx="3" fill="none" stroke="${OM}" stroke-width="2"/><path d="M48 52 L52 52" stroke="${OM}" stroke-width="2"/>`,
    soleil: `<rect x="33" y="46" width="15" height="12" rx="4" fill="#1f2937" opacity=".85"/><rect x="52" y="46" width="15" height="12" rx="4" fill="#1f2937" opacity=".85"/><path d="M48 51 L52 51" stroke="#1f2937" stroke-width="2"/>` }[a.lunettes] || '' : '';
  const chap = { aucun: '', bonnet: `<path d="M24 34 Q26 10 50 10 Q74 10 76 34Z" fill="#c9444f"/><rect x="22" y="30" width="56" height="8" rx="4" fill="#a8323d"/><circle cx="50" cy="9" r="5" fill="#fff"/>`,
    casquette: `<path d="M26 32 Q28 12 50 12 Q72 12 74 32Z" fill="#1d4ed8"/><path d="M24 32 L88 32 L86 38 L24 36Z" fill="#1e40af"/>`,
    'béret': `<path d="M24 30 Q26 12 52 10 Q78 12 76 28 Q60 22 26 32Z" fill="#1f2937"/>`,
    'chapeau de paille': `<path d="M28 32 Q30 12 50 12 Q70 12 72 32Z" fill="#eed08a"/><rect x="14" y="30" width="72" height="6" rx="3" fill="#e2bd66"/>`,
    bandeau: `<rect x="26" y="22" width="48" height="7" rx="3" fill="#0ea5e9"/>`,
    'chapeau de fête': `<path d="M38 28 L50 0 L62 28Z" fill="#f59e0b"/><circle cx="50" cy="2" r="3" fill="#ec4899"/><path d="M42 18 L58 18" stroke="#fff" stroke-width="2"/>`,
    'couronne de fleurs': [30, 40, 50, 60, 70].map((x, i) => `<circle cx="${x}" cy="${[26, 18, 16, 18, 26][i]}" r="4" fill="${['#f472b6', '#f59e0b', '#fff', '#f59e0b', '#f472b6'][i]}"/>`).join('') }[a.chapeau || 'aucun'];
  const ech = a.echarpe ? `<path d="M28 80 Q50 90 72 80 L74 88 Q50 98 26 88Z" fill="${a.echarpe}"/><path d="M64 84 L70 100 L58 100Z" fill="${a.echarpe}" opacity=".8"/>` : '';
  return A + ech + lun + chap;
}

export function svgAvatar(a, o = {}) {
  a = normaliser(a); if (!a) return '';
  const ex = EXPRESSIONS.includes(o.humeur) ? o.humeur : null;
  const corps = a.type === 'mascotte' ? mascotte(a, ex) : portrait(a, ex);
  const t = o.taille ? ` width="${o.taille}" height="${o.taille}"` : '';
  return `<svg viewBox="0 0 100 100"${t} class="avatar${o.classe ? ' ' + o.classe : ''}" role="img" aria-label="${o.label || 'avatar'}"${o.id ? ` id="${o.id}"` : ''}>${STYLE}<rect width="100" height="100" fill="${a.fond}"/>${corps}</svg>`;
}
/* Fait un clin d'œil (à appeler sur l'élément svg). */
export function clin(el) { if (!el) return; el.classList.remove('clin'); void el.getBoundingClientRect(); el.classList.add('clin'); setTimeout(() => el.classList.remove('clin'), 600); }
/* Groupes d'options pour l'atelier. */
export const OPTIONS_PORTRAIT = [['forme', 'Visage', ['rond', 'ovale', 'carré']], ['teint', 'Teint', TEINTS, 'c'], ['cheveux', 'Cheveux', CHEVEUX], ['couleur', 'Couleur des cheveux', COULEURS_CHEVEUX, 'c'], ['meche', 'Mèche', ['', ...COULEURS_CHEVEUX.slice(10)], 'c'],
  ['yeux', 'Yeux', YEUX], ['iris', 'Couleur des yeux', IRIS, 'c'], ['sourcils', 'Sourcils', SOURCILS], ['nez', 'Nez', NEZ], ['bouche', 'Bouche', BOUCHES], ['pilosite', 'Barbe', PILOSITE], ['lunettes', 'Lunettes', LUNETTES], ['chapeau', 'Chapeau', CHAPEAUX],
  ['accessoire', 'Accessoire', ACCESSOIRES], ['haut', 'Tenue', HAUTS, 'c'], ['motif', 'Motif', MOTIFS], ['objet', 'Objet', OBJETS], ['taches', 'Taches de rousseur', ['non', 'oui'], 'b'], ['joues', 'Joues rosées', ['non', 'oui'], 'b'], ['fond', 'Fond', FONDS, 'c']];
export const OPTIONS_MASCOTTE = [['animal', 'Mascotte', ANIMAUX], ['chapeau', 'Chapeau', CHAPEAUX], ['lunettes', 'Lunettes', LUNETTES.slice(0, 4)], ['echarpe', 'Écharpe', ['', ...HAUTS.slice(1)], 'c'], ['fond', 'Fond', FONDS, 'c']];
