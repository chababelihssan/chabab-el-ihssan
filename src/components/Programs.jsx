import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../hooks/useData';
import { FaArrowRight, FaHandHoldingHeart, FaTimes, FaChevronLeft, FaChevronRight, FaExpand, FaImage } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Modal from './Modal';


// Image with a nice fallback (gradient + icon) if the file/URL fails to load
const SafeImg = ({ src, alt, className = '', fit = 'object-cover' }) => {
    const [failed, setFailed] = useState(false);
    if (failed || !src) {
        return (
            <div className={`flex items-center justify-center bg-gradient-to-br from-[var(--brand-navy)] to-[var(--brand-red)] text-white/60 ${className}`}>
                <FaImage className="text-4xl" />
            </div>
        );
    }
    return <img src={src} alt={alt} className={`${className} ${fit}`} loading="lazy" onError={() => setFailed(true)} />;
};

// Full-screen image viewer: big image, arrows, swipe, keyboard, thumbnails
const Lightbox = ({ items, index, onChange, onClose, getTitle, dir }) => {
    const count = items.length;
    const go = (d) => onChange((index + d + count) % count);

    useEffect(() => {
        const onKey = (e) => {
            if (['Escape', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.stopImmediatePropagation(); // don't also close the parent page
                e.preventDefault();
            }
            if (e.key === 'Escape') onClose();
            // arrows follow the visual direction (left = visually left)
            if (e.key === 'ArrowLeft') go(dir === 'rtl' ? 1 : -1);
            if (e.key === 'ArrowRight') go(dir === 'rtl' ? -1 : 1);
        };
        window.addEventListener('keydown', onKey, true);
        return () => window.removeEventListener('keydown', onKey, true);
    });

    const item = items[index];
    const arrowBtn = 'absolute top-1/2 -translate-y-1/2 z-10 p-4 rounded-full bg-white/10 hover:bg-white/30 text-white text-xl backdrop-blur-md border border-white/20 transition';

    return createPortal(
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex flex-col"
            onClick={onClose}
        >
            {/* Top bar */}
            <div dir="ltr" className="flex items-center justify-between p-4 text-white" onClick={(e) => e.stopPropagation()}>
                <span className="text-sm bg-white/10 rounded-full px-3 py-1">{index + 1} / {count}</span>
                <button onClick={onClose} className="p-3 rounded-full bg-white/10 hover:bg-red-600 transition" aria-label="Close">
                    <FaTimes className="text-xl" />
                </button>
            </div>

            {/* Image */}
            <div className="relative flex-1 min-h-0 flex items-center justify-center px-2 sm:px-16" onClick={(e) => e.stopPropagation()}>
                {count > 1 && <button dir="ltr" onClick={() => go(-1)} className={`${arrowBtn} left-2 sm:left-4`} aria-label="Previous"><FaChevronLeft /></button>}
                <AnimatePresence mode="wait">
                    <motion.img
                        key={item.id}
                        src={item.image}
                        alt={getTitle(item)}
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        drag={count > 1 ? 'x' : false}
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.4}
                        onDragEnd={(_, info) => {
                            if (info.offset.x > 80) go(-1);
                            else if (info.offset.x < -80) go(1);
                        }}
                        className="max-h-full max-w-full object-contain rounded-lg shadow-2xl select-none"
                        draggable={false}
                    />
                </AnimatePresence>
                {count > 1 && <button dir="ltr" onClick={() => go(1)} className={`${arrowBtn} right-2 sm:right-4`} aria-label="Next"><FaChevronRight /></button>}
            </div>

            {/* Caption + thumbnails */}
            <div className="p-4 text-center text-white" onClick={(e) => e.stopPropagation()} dir={dir}>
                <h4 className="text-xl md:text-2xl font-bold mb-3">{getTitle(item)}</h4>
                {count > 1 && (
                    <div dir="ltr" className="flex justify-center gap-2 overflow-x-auto pb-1">
                        {items.map((it, i) => (
                            <button
                                key={it.id}
                                onClick={() => onChange(i)}
                                className={`shrink-0 w-16 h-12 rounded-md overflow-hidden border-2 transition ${i === index ? 'border-[var(--brand-gold)] opacity-100 scale-105' : 'border-transparent opacity-50 hover:opacity-90'}`}
                                aria-label={getTitle(it)}
                            >
                                <SafeImg src={it.image} alt="" className="w-full h-full" />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>,
        document.body
    );
};

// Projets principaux : 7 catégories (unités). Un clic ouvre la catégorie
// et affiche ses sous-projets (فروع). Données : src/data/siteData.js
const Programs = () => {
    const { language, t } = useLanguage();
    const { projectCategories, getLocalizedContent } = useData();
    const [selectedId, setSelectedId] = useState(null);
    const [lightIndex, setLightIndex] = useState(null);

    const selected = projectCategories.find((c) => c.id === selectedId) || null;
    const dir = language === 'ar' ? 'rtl' : 'ltr';

    return (
        <section id="programs" className="py-16 bg-gray-50 dark:bg-gray-800 transition-colors duration-300" dir={dir}>
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="font-display text-3xl md:text-4xl text-[var(--brand-navy)] dark:text-white mb-4">
                        {t.programs_title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        {t.programs_desc}
                    </p>
                    <div className="w-24 h-1.5 rounded-full -rotate-2 bg-[var(--brand-red)] mx-auto mt-4"></div>
                </div>

                <div className="flex flex-wrap justify-center gap-8">
                    {projectCategories.map((cat) => (
                        <div
                            key={cat.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => setSelectedId(cat.id)}
                            onKeyDown={(e) => e.key === 'Enter' && setSelectedId(cat.id)}
                            className="bg-white dark:bg-gray-900 rounded-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group flex flex-col w-full md:w-[calc(50%-1rem)] lg:w-[calc(25%-1.5rem)] max-w-sm border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-xl overflow-hidden"
                        >
                            <div className="w-full aspect-[4/3] bg-gray-200 dark:bg-gray-600 relative overflow-hidden">
                                <SafeImg
                                    src={cat.image}
                                    alt={getLocalizedContent(cat.title, language)}
                                    className="w-full h-full transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5 pt-16 text-center">
                                    <h3 className="text-xl md:text-2xl font-bold text-white drop-shadow">
                                        {getLocalizedContent(cat.title, language)}
                                    </h3>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Modal
                isOpen={!!selected}
                onClose={() => { setLightIndex(null); setSelectedId(null); }}
                title={selected ? getLocalizedContent(selected.title, language) : ''}
                heroImage={selected?.image}
                fullScreen
            >
                {selected && (
                    <div dir={dir}>
                        <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-8 text-start">
                            {getLocalizedContent(selected.description, language)}
                        </p>

                        {selected.items.length > 0 && (
                            <>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-2">
                                    <FaExpand /> {selected.items.length}
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                                    {selected.items.map((item, i) => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => setLightIndex(i)}
                                            className="group text-start rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[var(--brand-red)]/40"
                                        >
                                            <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-700">
                                                <SafeImg
                                                    src={item.image}
                                                    alt={getLocalizedContent(item.title, language)}
                                                    className="w-full h-full transition-transform duration-500 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-12 text-center">
                                                    <h4 className="font-bold text-lg text-white drop-shadow">
                                                        {getLocalizedContent(item.title, language)}
                                                    </h4>
                                                </div>
                                            </div>
</button>
                                    ))}
                                </div>
                            </>
                        )}

                        <div className="flex justify-center gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                            <Link to="/donate" className="btn-brand py-2 px-6 inline-flex items-center gap-2">
                                <FaHandHoldingHeart /> {t.donate}
                            </Link>
                            <Link to="/volunteer" className="btn-brand-light py-2 px-6">{t.volunteer}</Link>
                        </div>
                    </div>
                )}
            </Modal>

            <AnimatePresence>
                {selected && lightIndex !== null && (
                    <Lightbox
                        items={selected.items}
                        index={lightIndex}
                        onChange={setLightIndex}
                        onClose={() => setLightIndex(null)}
                        getTitle={(it) => getLocalizedContent(it.title, language)}
                        dir={dir}
                    />
                )}
            </AnimatePresence>
        </section>
    );
};

export default Programs;
