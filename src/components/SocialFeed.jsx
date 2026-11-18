import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { FaFacebookF, FaInstagram, FaPlay, FaImages, FaExternalLinkAlt } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import { social, socialFeed } from '../data/settings';

// ============================================================================
//  Fil d'actualité Facebook + Instagram, toujours à jour sans intervention.
//  • Facebook  : plugin officiel « Page Plugin » (iframe, aucun jeton requis).
//  • Instagram : flux JSON d'un service gratuit (ex. Behold) dont l'adresse se
//                colle dans /admin → « إعدادات الموقع ». Sans adresse, on affiche
//                les publications ajoutées à la main, sinon un bloc « Suivez-nous ».
//  Tout se règle depuis /admin : aucun code à modifier.
// ============================================================================

const L = {
    ar: {
        title: 'تابعونا على مواقع التواصل',
        desc: 'آخر منشوراتنا على فيسبوك وإنستغرام، تتحدّث تلقائيًا.',
        follow: 'تابعنا',
        openFb: 'افتح صفحتنا على فيسبوك',
        openIg: 'افتح حسابنا على إنستغرام',
        fbTitle: 'آخر منشورات فيسبوك',
        igEmpty: 'شاهدوا كل صورنا وفيديوهاتنا على إنستغرام.',
        loading: 'جاري تحميل المنشورات…',
        video: 'فيديو',
    },
    fr: {
        title: 'Suivez-nous sur les réseaux',
        desc: 'Nos dernières publications Facebook et Instagram, mises à jour automatiquement.',
        follow: 'Suivre',
        openFb: 'Ouvrir notre page Facebook',
        openIg: 'Ouvrir notre compte Instagram',
        fbTitle: 'Dernières publications Facebook',
        igEmpty: 'Retrouvez toutes nos photos et vidéos sur Instagram.',
        loading: 'Chargement des publications…',
        video: 'Vidéo',
    },
    en: {
        title: 'Follow us on social media',
        desc: 'Our latest Facebook and Instagram posts, updated automatically.',
        follow: 'Follow',
        openFb: 'Open our Facebook page',
        openIg: 'Open our Instagram account',
        fbTitle: 'Latest Facebook posts',
        igEmpty: 'See all our photos and videos on Instagram.',
        loading: 'Loading posts…',
        video: 'Video',
    },
};

const FB_LOCALE = { ar: 'ar_AR', fr: 'fr_FR', en: 'en_US' };
const IG_CACHE_KEY = 'ihssan-ig-feed-v1';
const IG_CACHE_TTL = 6 * 60 * 60 * 1000; // 6 h : économise le quota du service gratuit

const igHandle = (url) => {
    try {
        const parts = new URL(url).pathname.split('/').filter(Boolean);
        return parts[0] ? `@${parts[0]}` : '';
    } catch {
        return '';
    }
};

// ---------- Facebook ---------------------------------------------------------
const FacebookCard = ({ lb, language }) => {
    const pageUrl = socialFeed.facebook_page_url || social.facebook;
    const boxRef = useRef(null);
    const inView = useInView(boxRef, { once: true, margin: '300px' });
    const [width, setWidth] = useState(500);

    useEffect(() => {
        const measure = () => {
            const w = boxRef.current?.clientWidth || 500;
            setWidth(Math.max(280, Math.min(500, Math.floor(w))));
        };
        measure();
        let timer;
        const onResize = () => { clearTimeout(timer); timer = setTimeout(measure, 400); };
        window.addEventListener('resize', onResize);
        return () => { window.removeEventListener('resize', onResize); clearTimeout(timer); };
    }, []);

    const src = `https://www.facebook.com/plugins/page.php?${new URLSearchParams({
        href: pageUrl,
        tabs: 'timeline',
        width: String(width),
        height: '560',
        small_header: 'true',
        adapt_container_width: 'true',
        hide_cover: 'false',
        show_facepile: 'false',
        locale: FB_LOCALE[language] || 'en_US',
    }).toString()}`;

    return (
        <div className="bg-white dark:bg-gray-700 rounded-2xl shadow-md border border-gray-100 dark:border-gray-600 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-600">
                <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-[#1877f2] text-white flex items-center justify-center text-lg" aria-hidden="true"><FaFacebookF /></span>
                    <h3 className="font-bold text-[var(--brand-navy)] dark:text-white">{lb.fbTitle}</h3>
                </div>
                <a href={social.facebook || pageUrl} target="_blank" rel="noopener noreferrer"
                   className="text-sm font-bold text-[var(--brand-red)] hover:underline inline-flex items-center gap-1.5">
                    {lb.follow} <FaExternalLinkAlt className="text-xs" aria-hidden="true" />
                </a>
            </div>
            <div ref={boxRef} dir="ltr" className="flex justify-center bg-gray-50 dark:bg-gray-800 min-h-[560px]">
                {inView && (
                    <iframe
                        title={lb.fbTitle}
                        src={src}
                        width={width}
                        height="560"
                        style={{ border: 'none', overflow: 'hidden', maxWidth: '100%' }}
                        scrolling="no"
                        loading="lazy"
                        allow="encrypted-media"
                        referrerPolicy="strict-origin-when-cross-origin"
                    />
                )}
            </div>
            <a href={social.facebook || pageUrl} target="_blank" rel="noopener noreferrer"
               className="px-5 py-3 text-center text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-[var(--brand-red)] border-t border-gray-100 dark:border-gray-600">
                {lb.openFb}
            </a>
        </div>
    );
};

// ---------- Instagram --------------------------------------------------------
const readCache = (url) => {
    try {
        const c = JSON.parse(localStorage.getItem(IG_CACHE_KEY) || 'null');
        return c && c.url === url ? c : null;
    } catch {
        return null;
    }
};

// Convertit la réponse du flux JSON en liste simple { id, link, image, caption, isVideo }
const normalizeBehold = (data) =>
    (data?.posts || []).slice(0, 6).map((p) => ({
        id: p.id,
        link: p.permalink,
        image: p.sizes?.medium?.mediaUrl || p.sizes?.small?.mediaUrl || p.thumbnailUrl || (p.mediaType === 'VIDEO' ? '' : p.mediaUrl),
        caption: p.caption || '',
        isVideo: p.mediaType === 'VIDEO',
    })).filter((p) => p.link && p.image);

const isFresh = (c) => !!c && Date.now() - c.time < IG_CACHE_TTL;

const useInstagramPosts = (feedUrl, manual) => {
    // État initial calculé une seule fois : cache frais → affichage immédiat, sans requête.
    const [state, setState] = useState(() => {
        if (!feedUrl) return { status: 'idle', posts: [] };
        const cached = readCache(feedUrl);
        return isFresh(cached) ? { status: 'ok', posts: cached.posts } : { status: 'loading', posts: [] };
    });

    useEffect(() => {
        if (!feedUrl) return undefined;
        const cached = readCache(feedUrl);
        if (isFresh(cached)) return undefined;
        const ctrl = new AbortController();
        fetch(feedUrl, { signal: ctrl.signal })
            .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
            .then((json) => {
                const posts = normalizeBehold(json);
                if (!posts.length) throw new Error('empty');
                try { localStorage.setItem(IG_CACHE_KEY, JSON.stringify({ url: feedUrl, time: Date.now(), posts })); } catch { /* quota */ }
                setState({ status: 'ok', posts });
            })
            .catch((err) => {
                if (err.name === 'AbortError') return;
                // En cas d'échec : dernier flux connu, sinon publications manuelles
                setState(cached ? { status: 'ok', posts: cached.posts } : { status: 'error', posts: [] });
            });
        return () => ctrl.abort();
    }, [feedUrl]);

    if (state.status === 'ok' || state.status === 'loading') return state;
    const fallback = (manual || [])
        .filter((p) => p.link && p.image)
        .slice(0, 6)
        .map((p, i) => ({ id: `m${i}`, link: p.link, image: p.image, caption: p.caption || '', isVideo: false }));
    return { status: fallback.length ? 'ok' : 'empty', posts: fallback };
};

const InstagramCard = ({ lb }) => {
    const profile = social.instagram;
    const handle = igHandle(profile).replace('@', '');
    const igEmbed = handle ? `https://www.instagram.com/${handle}/embed` : '';
    const { status, posts } = useInstagramPosts(socialFeed.instagram_feed_url, socialFeed.instagram_manual_posts);

    return (
        <div className="bg-white dark:bg-gray-700 rounded-2xl shadow-md border border-gray-100 dark:border-gray-600 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-600">
                <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--brand-gold)] via-[var(--brand-red)] to-[var(--brand-navy)] text-white flex items-center justify-center text-lg" aria-hidden="true"><FaInstagram /></span>
                    <div>
                        <h3 className="font-bold text-[var(--brand-navy)] dark:text-white leading-tight">Instagram</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400" dir="ltr">{igHandle(profile)}</p>
                    </div>
                </div>
                <a href={profile} target="_blank" rel="noopener noreferrer"
                   className="text-sm font-bold text-[var(--brand-red)] hover:underline inline-flex items-center gap-1.5">
                    {lb.follow} <FaExternalLinkAlt className="text-xs" aria-hidden="true" />
                </a>
            </div>

            <div className="p-3 flex-1 min-h-[560px] flex flex-col">
                {status === 'loading' && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2" role="status" aria-label={lb.loading}>
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="aspect-square rounded-lg bg-gray-200 dark:bg-gray-600 animate-pulse" />
                        ))}
                    </div>
                )}

                {status === 'ok' && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 sm:grid-rows-2 gap-2 flex-1">
                        {posts.map((p) => (
                            <a key={p.id} href={p.link} target="_blank" rel="noopener noreferrer"
                               className="group relative aspect-square sm:aspect-auto overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--brand-red)]">
                                <img src={p.image} alt={p.caption ? p.caption.slice(0, 120) : 'Instagram'} loading="lazy" decoding="async"
                                     className="w-full h-full object-cover transition duration-500 group-hover:scale-110" />
                                {p.isVideo && (
                                    <span className="absolute top-2 end-2 w-7 h-7 rounded-full bg-black/60 text-white text-xs flex items-center justify-center" aria-label={lb.video}>
                                        <FaPlay />
                                    </span>
                                )}
                                {p.caption && (
                                    <span className="absolute inset-0 bg-[var(--brand-navy-dark)]/80 text-white text-xs p-3 leading-snug opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition line-clamp-6 flex items-end">
                                        <span className="line-clamp-5">{p.caption}</span>
                                    </span>
                                )}
                            </a>
                        ))}
                    </div>
                )}

                {(status === 'empty' || status === 'error') && igEmbed && (
                    <iframe
                        title="Instagram"
                        src={igEmbed}
                        className="w-full flex-1 min-h-[540px] rounded-lg bg-white"
                        style={{ border: 'none' }}
                        scrolling="no"
                        loading="lazy"
                    />
                )}

                {(status === 'empty' || status === 'error') && !igEmbed && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center gap-5 px-6 py-10 rounded-xl bg-brand-paper">
                        <span className="w-20 h-20 rounded-full bg-[var(--brand-navy)] text-[var(--brand-gold)] flex items-center justify-center text-4xl shadow-lg" aria-hidden="true"><FaImages /></span>
                        <p className="text-[var(--brand-navy)] font-bold text-lg max-w-xs">{lb.igEmpty}</p>
                    </div>
                )}
            </div>

            <a href={profile} target="_blank" rel="noopener noreferrer"
               className="px-5 py-3 text-center text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-[var(--brand-red)] border-t border-gray-100 dark:border-gray-600">
                {lb.openIg}
            </a>
        </div>
    );
};

// ---------- Section ----------------------------------------------------------
const SocialFeed = () => {
    const { language } = useLanguage();
    const lb = L[language] || L.fr;
    if (socialFeed.enabled === false) return null;
    const showFb = !!(socialFeed.facebook_page_url || social.facebook);
    const showIg = !!social.instagram;
    if (!showFb && !showIg) return null;

    return (
        <section id="social" dir={language === 'ar' ? 'rtl' : 'ltr'} className="py-16 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="font-display text-3xl md:text-4xl text-[var(--brand-navy)] dark:text-gray-100 mb-4">{lb.title}</h2>
                    <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">{lb.desc}</p>
                    <div className="w-24 h-1.5 rounded-full -rotate-2 bg-[var(--brand-red)] mx-auto mt-4"></div>
                </div>
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.6 }}
                    className={`grid gap-8 ${showFb && showIg ? 'lg:grid-cols-2' : 'max-w-2xl mx-auto'}`}
                >
                    {showFb && <FacebookCard lb={lb} language={language} />}
                    {showIg && <InstagramCard lb={lb} />}
                </motion.div>
            </div>
        </section>
    );
};

export default SocialFeed;
