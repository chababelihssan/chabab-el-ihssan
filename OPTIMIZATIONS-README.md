# Optimisations — résumé et déploiement

## ⚠️ À faire UNE FOIS avant de pousser sur GitHub (polices)
Les fichiers de polices (`.woff2`) n'ont pas pu être inclus dans ce ZIP (pas d'accès internet à la préparation).
Un petit script sans dépendance les télécharge :

```bash
node scripts/fetch-fonts.mjs      # crée public/fonts/*.woff2 (Cairo + Lalezar, licence OFL)
git add public/fonts && git commit -m "Polices arabes locales" && git push
```
Ce script est aussi lancé automatiquement par `npm run build` (hook `prebuild`) **seulement si les fichiers manquent**.
Si le téléchargement échoue, le build échoue : l'ancien site reste en ligne, jamais un site sans polices.
Une fois `public/fonts/` committé, plus aucun accès à Google n'est nécessaire.

## Ce qui a changé
| # | Changement | Fichiers |
|---|-----------|----------|
| 1 | Images externes → locales (Pexels, placehold.co, Unsplash, picsum). Le repli d'erreur utilise l'image SVG locale existante. | `About.jsx`, `GalleryPreview.jsx`, `content/projects.json` |
| 2 | Cairo + Lalezar hébergées (`/fonts`), `@font-face` en ligne, `preload` des sous-ensembles arabes, `font-display: swap`. Google Fonts supprimé du site et de `/admin`. | `index.html`, `public/admin/index.html`, `public/fonts/fonts.css`, `scripts/fetch-fonts.mjs`, `package.json` |
| 3 | Images de `/admin` (`img-<id>.ext`, noms uniques) : `Cache-Control: public, max-age=31536000, immutable`. Autres images : 5 min. Polices : 30 jours. | `public/_headers`, `public/.htaccess`, `netlify.toml` |
| 4 | Pas de listing de dossiers (`Options -Indexes`), blocage des fichiers/dossiers cachés (`.git`, `.env`, `.htaccess`…) sauf `/.well-known/`, de `cei-oauth-config.php` et de `src/`, `worker/`, `scripts/`, `node_modules/`. | `public/.htaccess` (Apache), `worker/index.js` + `wrangler.jsonc` (Cloudflare) |
| 5 | `/oauth/*.php` n'est plus servi en texte sur Cloudflare ; `.htaccess` n'est plus téléversé vers Cloudflare (`public/.assetsignore`) mais reste dans `dist/` pour le FTP/cPanel. | `public/.assetsignore`, `worker/index.js` |

## Notes Cloudflare
- Cloudflare **ignore** `.htaccess` : `Options -Indexes` y est sans objet (pas de listing de dossiers sur Cloudflare). Le blocage des fichiers cachés y est fait par le Worker (`/.*`, `/*/.*`, `/*.php` dans `run_worker_first`).
- `_headers` : Cloudflare **fusionne** les règles qui correspondent. La règle `img-*` ne chevauche donc aucune autre règle `/images/…`.
- Le panneau `/admin`, l'OAuth GitHub et les noms d'upload (`img-<id>`) sont inchangés.

## Déploiement
1. `node scripts/fetch-fonts.mjs` puis commit de `public/fonts/` (voir plus haut).
2. `git push` sur `main` → Cloudflare (et le workflow FTP) reconstruisent seuls.
3. Vérifier après déploiement :
   - `curl -I https://VOTRE-SITE/images/uploads/img-mwiy9t9e8pl.webp` → `cache-control: public, max-age=31536000, immutable`
   - `curl -I https://VOTRE-SITE/.env` et `/.git/config` → 404 (Cloudflare) ou 403 (Apache)
   - Onglet Réseau du navigateur : aucune requête vers `fonts.googleapis.com`, `pexels`, `placehold.co`.

## Si Apache renvoie une erreur 500
Votre hébergeur interdit `Options` dans `.htaccess` : supprimez la ligne `Options -Indexes`.

## Pas encore traité (à décider)
Des images de contenu pointent encore vers l'ancien site WordPress `chababelihssan.com/wp-content/…`
(`gallery.json`, `activities/*.json`, `news/…suhoor….json`, `testimonials/*.json`) et une vers `gstatic.com`
(`testimonials/temoignage-mwjol2u1y9w.json`). Hors périmètre demandé et impossible à télécharger d'ici :
si ce domaine disparaît, ces images disparaissent. Téléchargez-les puis rechargez-les via `/admin`.
