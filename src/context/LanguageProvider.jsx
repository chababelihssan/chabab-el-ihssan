import React, { useState, useEffect, useCallback } from 'react';
import ar from '../translations/ar'; // langue par défaut : incluse dans le bundle principal
import { LanguageContext } from './LanguageContext';

const SEO = {
    ar: {
        title: 'شباب الإحسان — جمعية ولائية بالقبة، الجزائر',
        description: 'جمعية شباب الإحسان، جمعية ولائية بالقبة (الجزائر العاصمة): قوافل الجنوب ، سقيا، ملابس العيد، وجبة السحور وغيرها. تبرّع أو تطوّع معنا.',
    },
    fr: {
        title: 'Chabab El Ihssane — Association caritative à Kouba, Alger',
        description: "Chabab El Ihssane, association caritative de Kouba (Alger) : caravanes du Grand Sud, Siqaya (eau), vêtements de l'Aïd, repas du Suhoor… Faites un don ou devenez bénévole.",
    },
    en: {
        title: 'Chabab El Ihssane — Charity in Kouba, Algiers',
        description: 'Chabab El Ihssane is a charity based in Kouba, Algiers: Great South caravans, Siqaya (water), Eid clothes, Suhoor meals and more. Donate or volunteer with us.',
    },
};

// fr / en : chargées uniquement quand le visiteur les utilise (gain ~30 Ko gzip pour les visiteurs arabes)
const loaders = {
    fr: () => import('../translations/fr'),
    en: () => import('../translations/en'),
};
const cache = { ar };
const loadLanguage = async (lang) => {
    if (cache[lang]) return cache[lang];
    const mod = await loaders[lang]();
    cache[lang] = mod.default;
    return cache[lang];
};
const savedLanguage = () => {
    const v = localStorage.getItem('language');
    return v === 'fr' || v === 'en' ? v : 'ar';
};

export const LanguageProvider = ({ children }) => {
    const [state, setState] = useState({ language: 'ar', t: ar, ready: savedLanguage() === 'ar' });
    const { language, t, ready } = state;

    const changeLanguage = useCallback((lang) => {
        loadLanguage(lang)
            .then((dict) => setState({ language: lang, t: dict, ready: true }))
            .catch(() => setState((s) => ({ ...s, ready: true }))); // réseau coupé : on garde la langue actuelle
    }, []);

    // Première visite d'un visiteur français/anglais : on charge sa langue avant d'afficher la page
    useEffect(() => {
        const saved = savedLanguage();
        if (saved !== 'ar') changeLanguage(saved);
    }, [changeLanguage]);

    useEffect(() => {
        localStorage.setItem('language', language);
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = language;
        const seo = SEO[language] || SEO.ar;
        document.title = seo.title;
        document.querySelector('meta[name="description"]')?.setAttribute('content', seo.description);
        document.querySelector('meta[property="og:title"]')?.setAttribute('content', seo.title);
        document.querySelector('meta[property="og:description"]')?.setAttribute('content', seo.description);
        // We'll handle font classes in the component or global CSS based on lang attribute
        if (language !== 'ar') {
            document.body.classList.add('latin-font');
        } else {
            document.body.classList.remove('latin-font');
        }
    }, [language]);

    if (!ready) return null;

    return (
        <LanguageContext.Provider value={{ language, changeLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};
