// Campagne en vedette + catégories de la galerie.
// Contenu éditable depuis /admin → src/content/campaign.json et gallery.json
import { campaign, gallery, withIds } from './content';

export const featuredCampaign = campaign;
export const galleryCategories = withIds(gallery.categories, 'cat', (c) => c.label?.fr || c.label?.ar);
