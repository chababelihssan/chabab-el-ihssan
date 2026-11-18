import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { announcement } from '../data/content';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedContent } from '../utils/languageUtils';

// Bandeau d'annonce en haut du site — édité depuis /admin (« شريط الإعلان »).
const COLORS = {
    red: { bg: '#c8102e', fg: '#ffffff' },
    green: { bg: '#15803d', fg: '#ffffff' },
    gold: { bg: '#f59e0b', fg: '#1f2937' },
    dark: { bg: '#111827', fg: '#ffffff' },
};

const todayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const AnnouncementBar = () => {
    const { language } = useLanguage();
    const a = announcement || {};
    const text = getLocalizedContent(a.text, language);
    const key = `ann-closed-${text}`;
    const [closed, setClosed] = useState(() => {
        try { return sessionStorage.getItem(key) === '1'; } catch { return false; }
    });

    const expired = a.end_date && String(a.end_date).slice(0, 10) < todayStr();
    if (!a.enabled || !text || expired || closed) return null;

    const c = COLORS[a.color] || COLORS.red;
    const label = getLocalizedContent(a.button, language);
    const close = () => {
        setClosed(true);
        try { sessionStorage.setItem(key, '1'); } catch { /* ignore */ }
    };
    const linkClass = 'underline font-bold whitespace-nowrap hover:opacity-80';
    const internal = a.link && a.link.startsWith('/');

    return (
        <div role="region" aria-label="announcement" style={{ background: c.bg, color: c.fg }}
            className="relative px-10 py-2 text-center text-sm md:text-base font-semibold">
            <span>{text}</span>
            {a.link && label && (
                <>
                    {' '}
                    {internal
                        ? <Link to={a.link} className={linkClass}>{label}</Link>
                        : <a href={a.link} target="_blank" rel="noopener noreferrer" className={linkClass}>{label}</a>}
                </>
            )}
            <button type="button" onClick={close} aria-label="close"
                className="absolute top-1/2 -translate-y-1/2 end-3 w-7 h-7 rounded-full hover:bg-black/15 leading-none text-lg">
                ×
            </button>
        </div>
    );
};

export default AnnouncementBar;
