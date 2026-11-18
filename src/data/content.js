// ============================================================================
//  CHARGEMENT DU CONTENU
//  Tout le contenu du site vit dans src/content/*.json.
//  Ces fichiers sont modifiés depuis l'interface /admin — pas besoin
//  de toucher au code. Ce module ne fait que les lire.
// ============================================================================

// Un fichier = une entrée (actualités, activités, témoignages).
// L'identifiant est le nom du fichier.
const fromFolder = (modules) =>
    Object.entries(modules).map(([path, data]) => ({
        id: path.split('/').pop().replace(/\.json$/, ''),
        ...data,
    }));

export const newsEntries = fromFolder(
    import.meta.glob('../content/news/*.json', { eager: true, import: 'default' })
);
export const activityEntries = fromFolder(
    import.meta.glob('../content/activities/*.json', { eager: true, import: 'default' })
);
export const testimonialEntries = fromFolder(
    import.meta.glob('../content/testimonials/*.json', { eager: true, import: 'default' })
);

// Les éléments ajoutés depuis le CMS n'ont pas forcément d'identifiant :
// on en génère un (stable) pour les clés React et les filtres.
const slugify = (v = '') => String(v).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9\u0600-\u06ff]+/g, '-').replace(/^-+|-+$/g, '');
export const withIds = (list = [], prefix = 'item', labelOf) =>
    list.map((it, i) => ({
        ...it,
        id: it.id || `${(labelOf && slugify(labelOf(it))) || prefix}-${i + 1}`,
    }));

// Fichiers uniques
import settingsJson from '../content/settings.json';
import impactJson from '../content/impact.json';
import campaignJson from '../content/campaign.json';
import galleryJson from '../content/gallery.json';
import branchesJson from '../content/branches.json';
import projectsJson from '../content/projects.json';
import mediaJson from '../content/media.json';
import announcementJson from '../content/announcement.json';
import ramadanJson from '../content/ramadan.json';

export const settings = settingsJson;
export const impact = impactJson;
export const campaign = campaignJson;
export const gallery = galleryJson;
export const branchesContent = branchesJson;
export const projects = projectsJson;
export const media = mediaJson;
export const announcement = announcementJson;
export const ramadan = ramadanJson;
