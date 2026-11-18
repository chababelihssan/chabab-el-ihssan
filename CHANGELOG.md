## 11.4.0 — Fluidité perçue & contrôle qualité
- Squelettes de chargement : `Skeleton.jsx` / `PageSkeleton` (en-tête et pied de page restent visibles pendant le chargement d'une page) et `SmartImage.jsx` (image avec fond animé puis apparition en fondu) pour actualités, galerie, programmes et « À propos ».
- Transitions de page (framer-motion, désactivées si « réduire les animations »).
- Ajout de `lighthouserc.json` et `.github/workflows/lighthouse.yml` (performance, accessibilité, SEO) : sur Pull Request, chaque lundi et à la demande.

## 11.3.0 — Déploiement DZSecurity (cPanel)
- Ajout de `public/.htaccess` (réécriture SPA, compression, cache, en-têtes de sécurité) et `public/admin/.htaccess` (admin jamais mis en cache).
- Ajout de `.github/workflows/deploy-dzsecurity.yml` : à chaque push sur `main` (y compris les enregistrements de /admin), le site est compilé puis envoyé par FTP vers DZSecurity.
- Nettoyage : suppression de l'ancien dossier `admin/` dupliqué, de `public/admin/config.yml` (inutilisé), de la note parasite et de 6 images non utilisées de `public/images/uploads` (dont un document administratif personnel et des captures d'écran).
- `package.json` aligné sur la version du changelog.

## 11.2.0 — Nouveau logo
- Logo : remplacement de l'ancien logo (adresse externe chababelihssan.com) par le logo officiel (coupole, mains jointes, lauriers) : `public/images/logo.png` (emblème, fond clair), `logo-full.png` (avec texte blanc, fond sombre), `og-image.png` (partage).
- Favicon, apple-touch-icon, Open Graph, Twitter Card et JSON-LD pointent vers les nouveaux fichiers ; ajout des favicons à `/admin`.
- Page d'erreur : le logo n'est plus rogné dans un cercle.

## 11.1.0 — Audit & corrections
- Sécurité : le jeton OAuth n'est plus envoyé qu'à l'origine du site (plus de `postMessage('*')`), portée GitHub réduite à `repo`, réponses OAuth en `no-store`.
- Confidentialité : suppression d'un document administratif personnel et de captures d'écran étrangères du dossier `public/images/uploads`.
- Contenu : retrait d'une image de galerie (capture YouTube) et remplacement de l'image d'une activité (capture d'exercice).
- Nettoyage : suppression de `public/admin/config.yml` (Decap, obsolète), du dossier `admin/` dupliqué et d'une note parasite.
- Qualité : `npm run lint` sans erreur (ProgramsPage, vite.config.js), ajout de `.env.example`.

# Changelog

## 11.0.0
- لوحة التحكم: استُبدلت واجهة Decap الافتراضية بلوحة مستقلة؛ «الرئيسية» هي الصفحة الوحيدة وكل التعديلات منها.
- دخول GitHub ثم رقم سري (SHA-256، قفل بعد 5 محاولات).
- محررات كاملة بالعربية/الفرنسية/الإنجليزية لكل أقسام الموقع، رفع صور مع تصغير تلقائي، commit واحد لكل حفظ، تراجع، معاينة حيّة، وضع ليلي.
- حُذف `public/admin/config.yml` (خاص بـ Decap) وسكربت `npm run cms`. لم يتغيّر شيء في الموقع نفسه.

## v10 (v7 de l'admin)
- Page don : CCP/BaridiMob + CPA, boutons « Copier », code QR, reçu par WhatsApp, montant pré-rempli (?amount=).
- Mobile : barre « Faire un don » fixe en bas, boutons larges.
- Mode Ramadan : compte à rebours, couffin, Zakat el-Fitr (réglages dans /admin).
- Admin : interface stable (écran de chargement, plus d'ouverture automatique de « الرئيسية »), thème moderne aux couleurs de l'association.
- Admin : images converties en WebP, lot d'images avec un seul message.
- Traductions séparées (ar inclus, fr/en chargées à la demande) ; spinner traduit ; images en lazy-loading ; images de secours locales.
- Téléphone et logo lus depuis settings.json (index.html / SEO).

## v9.0.0
- Ajout de la interface d'administration `/admin` (Decap CMS) : tout le contenu est maintenant dans `src/content/*.json`.
- Chiffres « Impact », campagne en vedette, coordonnées et liens sociaux éditables sans toucher au code.
- Nouveau bloc `SocialFeed` : fil Facebook (Page Plugin) + grille Instagram (flux JSON, cache 6 h, repli manuel).
- SEO : title/description par langue, Open Graph, JSON-LD NGO, sitemap.xml + robots.txt générés au build.
- Performance : polices via <link> + preconnect, en-têtes de cache/sécurité Netlify, images inutilisées supprimées.
- Accessibilité : lien d'évitement, focus visible, prefers-reduced-motion.
- Correctif : logo/photo d'une autre association (AABV) remplacés ; `lang`/`dir` par défaut corrigés (ar/rtl).

## v8
Version fournie.

## لوحة التحكم v2 (الموقع الرئيسي لم يتغير)
- دليل مصوّر «كيف أغيّر الصور؟» يربط كل مكان في الموقع بقسمه في اللوحة.
- كل حقل صورة له تلميح: أين تظهر + المقاس المناسب.
- معاينة حيّة (أخبار، أنشطة، آراء، معرض، مشاريع، واجهة، قبل/بعد، شعار، حملة، أرقام).
- تصغير الصور تلقائياً قبل الرفع (أكبر ضلع 1600px).
- واجهة عربية، وأقسام مرتبة حسب الأكثر استعمالاً، وعناصر القوائم بعناوينها بدل «No id».
- الملفات: public/admin/{index.html, admin.js, admin.css, config.yml}

## Optimisations (images locales, polices locales, cache, sécurité)
Voir `OPTIMIZATIONS-README.md`.
