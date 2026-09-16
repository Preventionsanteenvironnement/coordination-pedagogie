/* ═══════════════════════════════════════════════════════════════════
   Référents de pôle AESH — fabrication de fichiers sans bibliothèque
   · PDF (A4 paysage, Helvetica, couleurs)   · Excel .xlsx (styles, fusions)
   ═══════════════════════════════════════════════════════════════════ */

/* ─────────────── PDF ─────────────── */
const WIN = { 0x20AC: 0x80, 0x201A: 0x82, 0x0192: 0x83, 0x201E: 0x84, 0x2026: 0x85, 0x2020: 0x86, 0x2021: 0x87, 0x02C6: 0x88, 0x2030: 0x89, 0x0160: 0x8A, 0x2039: 0x8B, 0x0152: 0x8C, 0x017D: 0x8E,
  0x2018: 0x91, 0x2019: 0x92, 0x201C: 0x93, 0x201D: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97, 0x02DC: 0x98, 0x2122: 0x99, 0x0161: 0x9A, 0x203A: 0x9B, 0x0153: 0x9C, 0x017E: 0x9E, 0x0178: 0x9F, 0x202F: 0x20, 0x00A0: 0x20, 0x2009: 0x20 };
const versWin = s => { let o = ''; for (const ch of String(s)) { const c = ch.codePointAt(0); if (c < 0x80 || (c >= 0xA0 && c <= 0xFF)) o += String.fromCharCode(c); else if (WIN[c]) o += String.fromCharCode(WIN[c]); else o += '?'; } return o; };
const echappe = s => s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
const rgb = hex => { const h = String(hex || '#000').replace('#', ''); const n = parseInt(h.length === 3 ? h.split('').map(x => x + x).join('') : h, 16); return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255].map(v => v.toFixed(3)).join(' '); };
let mesureCtx = null;
export function largeurTexte(s, taille, gras) {
  try {
    if (!mesureCtx && typeof document !== 'undefined') mesureCtx = document.createElement('canvas').getContext('2d');
    if (mesureCtx) { mesureCtx.font = `${gras ? 'bold ' : ''}100px Helvetica, Arial, sans-serif`; return mesureCtx.measureText(String(s)).width / 100 * taille; }
  } catch (e) { }
  return String(s).length * taille * (gras ? 0.56 : 0.52);
}
export function coupe(s, max, taille, gras) {
  s = String(s || '');
  if (largeurTexte(s, taille, gras) <= max) return s;
  while (s.length > 1 && largeurTexte(s + '…', taille, gras) > max) s = s.slice(0, -1);
  return s.trimEnd() + '…';
}
export function lignes(s, max, taille, gras, nbMax = 3) {
  const mots = String(s || '').split(/\s+/).filter(Boolean), out = []; let cur = '';
  mots.forEach(m => { const t = cur ? cur + ' ' + m : m; if (largeurTexte(t, taille, gras) <= max || !cur) cur = t; else { out.push(cur); cur = m; } });
  if (cur) out.push(cur);
  if (out.length > nbMax) { const r = out.slice(0, nbMax); r[nbMax - 1] = coupe(out.slice(nbMax - 1).join(' '), max, taille, gras); return r; }
  return out.map(l => coupe(l, max, taille, gras));
}

export class PDF {
  constructor() { this.pages = []; this.W = 841.89; this.H = 595.28; }
  page() { this.ops = []; this.pages.push(this.ops); return this; }
  y(v) { return (this.H - v).toFixed(2); }
  rect(x, y, w, h, o = {}) {
    const r = Math.min(o.r || 0, w / 2, h / 2), X = x, Y = this.H - y - h, k = 0.5523 * r;
    let p;
    if (r > 0) p = `${(X + r).toFixed(2)} ${Y.toFixed(2)} m ${(X + w - r).toFixed(2)} ${Y.toFixed(2)} l ${(X + w - r + k).toFixed(2)} ${Y.toFixed(2)} ${(X + w).toFixed(2)} ${(Y + r - k).toFixed(2)} ${(X + w).toFixed(2)} ${(Y + r).toFixed(2)} c ${(X + w).toFixed(2)} ${(Y + h - r).toFixed(2)} l ${(X + w).toFixed(2)} ${(Y + h - r + k).toFixed(2)} ${(X + w - r + k).toFixed(2)} ${(Y + h).toFixed(2)} ${(X + w - r).toFixed(2)} ${(Y + h).toFixed(2)} c ${(X + r).toFixed(2)} ${(Y + h).toFixed(2)} l ${(X + r - k).toFixed(2)} ${(Y + h).toFixed(2)} ${X.toFixed(2)} ${(Y + h - r + k).toFixed(2)} ${X.toFixed(2)} ${(Y + h - r).toFixed(2)} c ${X.toFixed(2)} ${(Y + r).toFixed(2)} l ${X.toFixed(2)} ${(Y + r - k).toFixed(2)} ${(X + r - k).toFixed(2)} ${Y.toFixed(2)} ${(X + r).toFixed(2)} ${Y.toFixed(2)} c h`;
    else p = `${X.toFixed(2)} ${Y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re`;
    const op = o.fill && o.stroke ? 'B' : o.fill ? 'f' : 'S';
    this.ops.push(`q ${o.fill ? rgb(o.fill) + ' rg' : ''} ${o.stroke ? rgb(o.stroke) + ' RG ' + (o.lw || 0.6) + ' w' : ''} ${o.dash ? '[2 2] 0 d' : ''} ${p} ${op} Q`);
    return this;
  }
  line(x1, y1, x2, y2, o = {}) { this.ops.push(`q ${rgb(o.color || '#dde3ea')} RG ${o.lw || 0.5} w ${o.dash ? '[2 2] 0 d' : ''} ${x1.toFixed(2)} ${this.y(y1)} m ${x2.toFixed(2)} ${this.y(y2)} l S Q`); return this; }
  text(x, y, s, o = {}) {
    const t = o.max ? coupe(s, o.max, o.size || 10, o.bold) : String(s || ''), size = o.size || 10;
    let X = x; const w = largeurTexte(t, size, o.bold);
    if (o.align === 'center') X = x - w / 2; else if (o.align === 'right') X = x - w;
    this.ops.push(`BT /${o.bold ? 'F2' : 'F1'} ${size} Tf ${rgb(o.color || '#111827')} rg ${X.toFixed(2)} ${this.y(y)} Td (${echappe(versWin(t))}) Tj ET`);
    return this;
  }
  blob() {
    const objs = [], add = s => { objs.push(s); return objs.length; };
    const cat = add(''), pagesId = add(''), f1 = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'), f2 = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
    const kids = [];
    this.pages.forEach(ops => {
      const flux = ops.join('\n'), c = add(`<< /Length ${flux.length} >>\nstream\n${flux}\nendstream`);
      kids.push(add(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${this.W} ${this.H}] /Resources << /Font << /F1 ${f1} 0 R /F2 ${f2} 0 R >> >> /Contents ${c} 0 R >>`));
    });
    objs[cat - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
    objs[pagesId - 1] = `<< /Type /Pages /Kids [${kids.map(k => k + ' 0 R').join(' ')}] /Count ${kids.length} >>`;
    let out = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n'; const pos = [];
    objs.forEach((o, i) => { pos.push(out.length); out += `${i + 1} 0 obj\n${o}\nendobj\n`; });
    const xref = out.length;
    out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` + pos.map(p => String(p).padStart(10, '0') + ' 00000 n \n').join('');
    out += `trailer\n<< /Size ${objs.length + 1} /Root ${cat} 0 R >>\nstartxref\n${xref}\n%%EOF`;
    const u = new Uint8Array(out.length); for (let i = 0; i < out.length; i++) u[i] = out.charCodeAt(i) & 255;
    return new Blob([u], { type: 'application/pdf' });
  }
}

/* ─────────────── ZIP (stockage sans compression) ─────────────── */
const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc32 = u => { let c = 0xFFFFFFFF; for (let i = 0; i < u.length; i++) c = CRC[(c ^ u[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
export function zip(fichiers) {
  const enc = new TextEncoder(), parts = [], central = []; let off = 0;
  fichiers.forEach(f => {
    const nom = enc.encode(f.nom), data = typeof f.data === 'string' ? enc.encode(f.data) : f.data, crc = crc32(data);
    const h = new DataView(new ArrayBuffer(30));
    h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true); h.setUint16(8, 0, true);
    h.setUint16(10, 0, true); h.setUint16(12, 0x21, true); h.setUint32(14, crc, true); h.setUint32(18, data.length, true); h.setUint32(22, data.length, true);
    h.setUint16(26, nom.length, true); h.setUint16(28, 0, true);
    parts.push(new Uint8Array(h.buffer), nom, data);
    const c = new DataView(new ArrayBuffer(46));
    c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true); c.setUint16(10, 0, true);
    c.setUint16(12, 0, true); c.setUint16(14, 0x21, true); c.setUint32(16, crc, true); c.setUint32(20, data.length, true); c.setUint32(24, data.length, true);
    c.setUint16(28, nom.length, true); c.setUint32(42, off, true);
    central.push(new Uint8Array(c.buffer), nom);
    off += 30 + nom.length + data.length;
  });
  const tailleC = central.reduce((s, p) => s + p.length, 0), e = new DataView(new ArrayBuffer(22));
  e.setUint32(0, 0x06054b50, true); e.setUint16(8, fichiers.length, true); e.setUint16(10, fichiers.length, true); e.setUint32(12, tailleC, true); e.setUint32(16, off, true);
  return new Blob([...parts, ...central, new Uint8Array(e.buffer)], { type: 'application/zip' });
}

/* ─────────────── XLSX ─────────────── */
const xe = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/[ --]/g, '');
export const colonne = n => { let s = ''; n++; while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; };
/* feuilles : [{ nom, largeurs:[…], hauteurs:{ligne:pts}, lignes:[[{v, s:{fond, couleur, gras, taille, centre, bord, retour}}]], fusions:['A1:C1'] }] */
export function xlsx(feuilles) {
  const styles = [], cleStyle = s => JSON.stringify(s || {});
  const idStyle = s => { const k = cleStyle(s); let i = styles.indexOf(k); if (i < 0) { styles.push(k); i = styles.length - 1; } return i + 1; };
  const fonts = ['<font><sz val="10"/><name val="Arial"/></font>'], fills = ['<fill><patternFill patternType="none"/></fill>', '<fill><patternFill patternType="gray125"/></fill>'], borders = ['<border/>', '<border><left style="thin"><color rgb="FFD9DEE5"/></left><right style="thin"><color rgb="FFD9DEE5"/></right><top style="thin"><color rgb="FFD9DEE5"/></top><bottom style="thin"><color rgb="FFD9DEE5"/></bottom></border>'];
  const argb = h => 'FF' + String(h || '#000000').replace('#', '').toUpperCase();
  const feuillesXml = feuilles.map(f => {
    const rows = f.lignes.map((l, r) => {
      const ht = f.hauteurs && f.hauteurs[r + 1] ? ` ht="${f.hauteurs[r + 1]}" customHeight="1"` : '';
      return `<row r="${r + 1}"${ht}>` + l.map((c, k) => {
        if (c == null) return '';
        const ref = colonne(k) + (r + 1), s = c.s ? ` s="${idStyle(c.s)}"` : '';
        if (typeof c.v === 'number') return `<c r="${ref}"${s}><v>${c.v}</v></c>`;
        if (c.v == null || c.v === '') return c.s ? `<c r="${ref}"${s}/>` : '';
        return `<c r="${ref}" t="inlineStr"${s}><is><t xml:space="preserve">${xe(c.v)}</t></is></c>`;
      }).join('') + '</row>';
    }).join('');
    const cols = (f.largeurs || []).map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('');
    const merges = (f.fusions || []).length ? `<mergeCells count="${f.fusions.length}">${f.fusions.map(m => `<mergeCell ref="${m}"/>`).join('')}</mergeCells>` : '';
    const pane = f.figer ? `<sheetViews><sheetView workbookViewId="0"><pane xSplit="${f.figer[0]}" ySplit="${f.figer[1]}" topLeftCell="${colonne(f.figer[0])}${f.figer[1] + 1}" activePane="bottomRight" state="frozen"/></sheetView></sheetViews>` : '';
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">${pane}${cols ? `<cols>${cols}</cols>` : ''}<sheetData>${rows}</sheetData>${merges}<pageMargins left="0.4" right="0.4" top="0.5" bottom="0.5" header="0.2" footer="0.2"/><pageSetup orientation="landscape" paperSize="9" fitToWidth="1"/></worksheet>`;
  });
  const xfs = ['<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>'];
  styles.forEach(k => {
    const s = JSON.parse(k);
    fonts.push(`<font>${s.gras ? '<b/>' : ''}${s.italique ? '<i/>' : ''}<sz val="${s.taille || 10}"/><color rgb="${argb(s.couleur || '#111827')}"/><name val="Arial"/></font>`);
    let fillId = 0; if (s.fond) { fills.push(`<fill><patternFill patternType="solid"><fgColor rgb="${argb(s.fond)}"/><bgColor indexed="64"/></patternFill></fill>`); fillId = fills.length - 1; }
    xfs.push(`<xf numFmtId="0" fontId="${fonts.length - 1}" fillId="${fillId}" borderId="${s.bord ? 1 : 0}" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="${s.centre ? 'center' : s.droite ? 'right' : 'left'}" vertical="${s.haut ? 'top' : 'center'}" wrapText="${s.retour ? 1 : 0}"/></xf>`);
  });
  const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="${fonts.length}">${fonts.join('')}</fonts><fills count="${fills.length}">${fills.join('')}</fills><borders count="${borders.length}">${borders.join('')}</borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="${xfs.length}">${xfs.join('')}</cellXfs></styleSheet>`;
  const noms = []; feuilles.forEach(f => { let n = String(f.nom || 'Feuille').replace(/[\\/?*[\]:]/g, ' ').slice(0, 31) || 'Feuille', i = 2; const b = n; while (noms.includes(n)) n = (b.slice(0, 28) + ' ' + i++); noms.push(n); });
  const fichiers = [
    { nom: '[Content_Types].xml', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${feuilles.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}</Types>` },
    { nom: '_rels/.rels', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>` },
    { nom: 'xl/workbook.xml', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${noms.map((n, i) => `<sheet name="${xe(n)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('')}</sheets></workbook>` },
    { nom: 'xl/_rels/workbook.xml.rels', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${feuilles.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('')}<Relationship Id="rId${feuilles.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>` },
    { nom: 'xl/styles.xml', data: stylesXml },
    ...feuillesXml.map((x, i) => ({ nom: `xl/worksheets/sheet${i + 1}.xml`, data: x }))
  ];
  const b = zip(fichiers);
  return new Blob([b], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

export function telecharger(blob, nom) {
  const url = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = url; a.download = nom; a.rel = 'noopener'; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 4000);
}
