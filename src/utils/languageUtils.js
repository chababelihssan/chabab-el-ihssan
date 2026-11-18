/**
 * Renvoie le texte dans la langue demandée.
 * Si la traduction est vide (cas fréquent quand on édite depuis le CMS),
 * on se rabat sur le français, puis l'arabe, puis l'anglais.
 * @param {string|object} contentObj - chaîne ou objet { ar, fr, en }
 * @param {string} lang - 'ar' | 'fr' | 'en'
 */
export const getLocalizedContent = (contentObj, lang = 'en') => {
    if (!contentObj) return '';
    if (typeof contentObj === 'string') return contentObj; // compatibilité
    return contentObj[lang] || contentObj.fr || contentObj.ar || contentObj.en || '';
};
