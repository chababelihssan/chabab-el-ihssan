// Coordonnées et liens du site (éditables depuis /admin → "إعدادات الموقع").
import { settings } from './content';

export default settings;
export const social = settings.social || {};
export const socialFeed = settings.social_feed || {};
