// Image de secours locale (aucune requête réseau) — remplace via.placeholder.com qui n'existe plus.
const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="#f6f3ec"/><path d="M200 185s-40-26-40-52a22 22 0 0 1 40-12 22 22 0 0 1 40 12c0 26-40 52-40 52z" fill="#c8102e" opacity=".35"/></svg>';
export const PLACEHOLDER = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
