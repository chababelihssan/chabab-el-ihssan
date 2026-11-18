import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../hooks/useData';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaExpand, FaSearch, FaImages, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { galleryCategories } from '../data/campaigns';
import { getLocalizedContent } from '../utils/languageUtils';
import { PLACEHOLDER } from '../utils/placeholder';

import SmartImage from '../components/SmartImage';
const GalleryPage = () => {
    const { t, language } = useLanguage();
    const { galleryImages } = useData();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeFilter = searchParams.get('cat') || 'all';
    const setActiveFilter = (id) => setSearchParams(id === 'all' ? {} : { cat: id }, { replace: true });
    const [lightIndex, setLightIndex] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const isLoading = false;

    const getCaption = (img) => {
        if (!img.caption) return '';
        if (typeof img.caption === 'string') return img.caption;
        return getLocalizedContent(img.caption, language);
    };

    const filtered = galleryImages.filter(img => {
        const matchesFilter = activeFilter === 'all' || img.category === activeFilter;
        const caption = getCaption(img).toLowerCase();
        const matchesSearch = !searchTerm || caption.includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    // Only show categories that really contain photos, with their counts
    const categories = [
        { id: 'all', label: t.gallery_filter_all, count: galleryImages.length },
        ...galleryCategories
            .map(c => ({ id: c.id, label: getLocalizedContent(c.label, language), count: galleryImages.filter(i => i.category === c.id).length }))
            .filter(c => c.count > 0),
    ];
    const categoryLabel = (id) => categories.find(c => c.id === id)?.label || '';

    const lightboxImg = lightIndex !== null ? filtered[lightIndex] : null;
    const goLight = (d) => setLightIndex(i => (i + d + filtered.length) % filtered.length);

    // Keyboard: Esc closes, arrows navigate (and lock page scroll while open)
    useEffect(() => {
        if (lightIndex === null) return;
        const onKey = (e) => {
            const rtl = language === 'ar';
            if (e.key === 'Escape') setLightIndex(null);
            if (e.key === 'ArrowLeft') goLight(rtl ? 1 : -1);
            if (e.key === 'ArrowRight') goLight(rtl ? -1 : 1);
        };
        window.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lightIndex, filtered.length, language]);

    return (
        <div className="min-h-screen bg-brand-paper transition-colors duration-300">
            {/* Hero Header */}
            <div className="relative bg-brand-grid overflow-hidden py-24 px-4 border-b-8 border-[var(--brand-red)]">
                {/* Decorative blobs */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-blue-700/30 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-500/20 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl" />
                <div className="relative container mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-flex items-center gap-2 bg-white/10 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm border border-white/20">
                            <FaImages className="text-yellow-400" />
                            {t.gallery_page_title}
                        </span>
                        <h1 className="font-display text-4xl md:text-6xl text-white mb-4 leading-tight" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                            {t.gallery_page_title}
                        </h1>
                        <p className="text-blue-200 text-lg max-w-2xl mx-auto" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                            {t.gallery_page_subtitle}
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                {/* Search + Filters */}
                <div className="flex flex-col md:flex-row items-center gap-4 mb-10" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    {/* Search */}
                    <div className="relative w-full md:max-w-xs flex-shrink-0">
                        <FaSearch className="absolute top-1/2 -translate-y-1/2 start-3 text-gray-400 text-sm" />
                        <input
                            type="text"
                            placeholder={t.search_placeholder || 'Search...'}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full ps-9 pe-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        />
                    </div>
                    {/* Filter pills */}
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                        {categories.map(c => (
                            <button
                                key={c.id}
                                onClick={() => setActiveFilter(c.id)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                                    activeFilter === c.id
                                        ? 'bg-[var(--brand-navy)] text-white border-[var(--brand-navy)] shadow-lg scale-105'
                                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-[var(--brand-red)] hover:text-[var(--brand-red)]'
                                }`}
                            >
                                {c.label} <span className="opacity-70 text-xs">({c.count})</span>
                            </button>
                        ))}
                    </div>
                    <span className="ms-auto text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap hidden md:block">
                        {filtered.length} / {galleryImages.length}
                    </span>
                </div>

                {/* Gallery Grid */}
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="w-12 h-12 border-4 border-blue-900 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-24 text-gray-500 dark:text-gray-400"
                    >
                        <FaImages className="text-6xl mx-auto mb-4 opacity-30" />
                        <p className="text-xl font-medium">{t.no_gallery_images}</p>
                    </motion.div>
                ) : (
                    <motion.div
                        layout
                        className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4"
                    >
                        <AnimatePresence>
                            {filtered.map((img, index) => (
                                <motion.div
                                    key={img.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3, delay: index * 0.03 }}
                                    className="break-inside-avoid mb-4 group relative rounded-2xl overflow-hidden shadow-md hover:shadow-2xl cursor-pointer transition-all duration-300"
                                    onClick={() => setLightIndex(index)}
                                >
                                    <SmartImage loading="lazy" decoding="async"
                                        src={img.image_url}
                                        alt={getCaption(img) || 'Gallery image'}
                                        className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        onError={e => { e.target.src = PLACEHOLDER; }}
                                    />
                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                        {getCaption(img) && (
                                            <p className="text-white text-sm font-medium leading-snug line-clamp-2" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                                                {getCaption(img)}
                                            </p>
                                        )}
                                        <div className="flex items-center justify-between mt-2">
                                            {img.category && (
                                                <span className="text-xs text-white px-2 py-0.5 rounded-full font-medium bg-[var(--brand-red)]">
                                                    {categoryLabel(img.category)}
                                                </span>
                                            )}
                                            <FaExpand className="text-white/80 ms-auto text-sm" />
                                        </div>
                                    </div>
                                    {/* Featured badge */}
                                    {img.is_featured && (
                                        <div className="absolute top-2 start-2 bg-yellow-400 text-yellow-900 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
                                            ★ {t.featured_image || 'Featured'}
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>

            {/* Lightbox with prev / next, swipe and keyboard */}
            <AnimatePresence>
                {lightboxImg && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[999] bg-black/95 flex flex-col"
                        onClick={() => setLightIndex(null)}
                    >
                        <div dir="ltr" className="flex items-center justify-between p-4 text-white" onClick={e => e.stopPropagation()}>
                            <span className="text-sm bg-white/10 rounded-full px-3 py-1">{lightIndex + 1} / {filtered.length}</span>
                            <button onClick={() => setLightIndex(null)} className="p-3 rounded-full bg-white/10 hover:bg-red-600 transition" aria-label="Close">
                                <FaTimes className="text-xl" />
                            </button>
                        </div>

                        <div className="relative flex-1 min-h-0 flex items-center justify-center px-2 sm:px-16" onClick={e => e.stopPropagation()}>
                            {filtered.length > 1 && (
                                <button dir="ltr" onClick={() => goLight(-1)} className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 p-4 rounded-full bg-white/10 hover:bg-white/30 text-white text-xl border border-white/20 transition" aria-label="Previous">
                                    <FaChevronLeft />
                                </button>
                            )}
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={lightboxImg.id}
                                    src={lightboxImg.image_url}
                                    alt={getCaption(lightboxImg)}
                                    initial={{ opacity: 0, scale: 0.96 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.18 }}
                                    drag={filtered.length > 1 ? 'x' : false}
                                    dragConstraints={{ left: 0, right: 0 }}
                                    dragElastic={0.4}
                                    onDragEnd={(_, info) => {
                                        if (info.offset.x > 80) goLight(-1);
                                        else if (info.offset.x < -80) goLight(1);
                                    }}
                                    draggable={false}
                                    className="max-h-full max-w-full object-contain rounded-lg shadow-2xl select-none"
                                    onError={e => { e.target.src = PLACEHOLDER; }}
                                />
                            </AnimatePresence>
                            {filtered.length > 1 && (
                                <button dir="ltr" onClick={() => goLight(1)} className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 p-4 rounded-full bg-white/10 hover:bg-white/30 text-white text-xl border border-white/20 transition" aria-label="Next">
                                    <FaChevronRight />
                                </button>
                            )}
                        </div>

                        <div className="p-4 text-center text-white" dir={language === 'ar' ? 'rtl' : 'ltr'} onClick={e => e.stopPropagation()}>
                            {getCaption(lightboxImg) && <p className="text-lg md:text-xl font-bold">{getCaption(lightboxImg)}</p>}
                            {lightboxImg.category && (
                                <span className="inline-block mt-2 text-xs text-white px-3 py-1 rounded-full font-medium bg-[var(--brand-red)]">
                                    {categoryLabel(lightboxImg.category)}
                                </span>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GalleryPage;
