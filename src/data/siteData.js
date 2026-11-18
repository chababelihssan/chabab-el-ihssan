// ============================================================================
//  CONTENU DU SITE — Chabab El Ihssane (Kouba, Alger).
//  ⚠️ Ne modifiez plus ce fichier : le contenu est dans src/content/*.json
//  et s'édite depuis /admin (voir README).
//  Ce fichier garde les mêmes exports qu'avant pour ne rien casser.
// ============================================================================
import {
    newsEntries, activityEntries, testimonialEntries,
    gallery, branchesContent, projects, withIds,
} from './content';

const fr = (o) => o?.fr || o?.ar || o?.en || '';

export const news = newsEntries;
export const activities = activityEntries;
export const testimonials = testimonialEntries;
export const branches = withIds(branchesContent.branches, 'branch', (b) => b.name || b.city);
export const galleryImages = withIds(gallery.images, 'img');
export const projectCategories = withIds(projects.categories, 'cat', (c) => fr(c.title)).map((c) => ({
    ...c,
    items: withIds(c.items, `${c.id}-item`, (i) => fr(i.title)),
}));
