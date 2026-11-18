import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaAmbulance, FaHandHoldingHeart, FaBullhorn } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import { featuredCampaign as c } from '../data/campaigns';
import { getLocalizedContent } from '../utils/languageUtils';

const L = {
    ar: { badge: 'حملة عاجلة', endsIn: 'تنتهي الحملة بعد', d: 'يوم', h: 'ساعة', m: 'دقيقة', s: 'ثانية', raised: 'تم جمع', of: 'من أصل', reached: 'من الهدف', ended: 'انتهت الحملة — شكراً لكل المتبرعين', cur: 'دج' },
    fr: { badge: 'Campagne urgente', endsIn: 'Fin de la campagne dans', d: 'jours', h: 'heures', m: 'min', s: 'sec', raised: 'Collecté', of: 'sur', reached: "de l'objectif", ended: 'Campagne terminée — merci à tous les donateurs', cur: 'DA' },
    en: { badge: 'Urgent campaign', endsIn: 'Campaign ends in', d: 'days', h: 'hours', m: 'min', s: 'sec', raised: 'Raised', of: 'of', reached: 'of the goal', ended: 'Campaign ended — thank you to all donors', cur: 'DZD' },
};

const useCountdown = (endDate) => {
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, []);
    const diff = Math.max(0, new Date(endDate).getTime() - now);
    return {
        ended: diff === 0,
        d: Math.floor(diff / 86400000),
        h: Math.floor(diff / 3600000) % 24,
        m: Math.floor(diff / 60000) % 60,
        s: Math.floor(diff / 1000) % 60,
    };
};

const TimeBox = ({ value, label }) => (
    <div className="flex-1 min-w-[64px] rounded-xl bg-[var(--brand-navy)] text-white py-3 text-center shadow-md">
        <div className="font-display text-3xl md:text-4xl leading-none tabular-nums">{String(value).padStart(2, '0')}</div>
        <div className="mt-1 text-xs md:text-sm text-[var(--brand-gold)]">{label}</div>
    </div>
);

// Campagne en vedette : compte à rebours + barre de progression + bouton don.
const FeaturedCampaign = () => {
    const { language, t } = useLanguage();
    const lb = L[language] || L.en;
    const dir = language === 'ar' ? 'rtl' : 'ltr';
    const { ended, d, h, m, s } = useCountdown(c.endDate);
    const goal = Number(c.goal) || 0;
    const raised = Number(c.raised) || 0;
    const percent = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;
    const fmt = (n) => n.toLocaleString('en-US');

    if (c.enabled === false) return null; // campagne désactivée depuis /admin

    return (
        <section id="campaign" dir={dir} className="relative overflow-hidden bg-brand-grid py-14 md:py-20">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.6 }}
                    className="grid lg:grid-cols-5 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10"
                >
                    {/* Visual side */}
                    <div className="lg:col-span-2 bg-brand-dots relative flex flex-col items-center justify-center gap-6 py-12 px-6">
                        <span className="inline-flex items-center gap-2 bg-white text-[var(--brand-red)] font-bold text-sm px-4 py-1.5 rounded-full shadow">
                            <FaBullhorn /> {lb.badge}
                        </span>
                        <div className="relative flex items-center justify-center w-40 h-40 md:w-52 md:h-52">
                            <span className="absolute inset-0 rounded-full bg-white/25 animate-ping" />
                            <span className="absolute inset-4 rounded-full bg-white/20" />
                            <div className="relative w-full h-full rounded-full bg-white text-[var(--brand-red)] flex items-center justify-center shadow-2xl">
                                <FaAmbulance className="text-7xl md:text-8xl" />
                            </div>
                        </div>
                    </div>

                    {/* Content side */}
                    <div className="lg:col-span-3 bg-white dark:bg-gray-900 p-6 md:p-10 flex flex-col gap-6">
                        <div>
                            <h2 className="font-display text-3xl md:text-5xl text-[var(--brand-navy)] dark:text-white mb-3">
                                {getLocalizedContent(c.title, language)}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 text-base md:text-lg leading-relaxed">
                                {getLocalizedContent(c.description, language)}
                            </p>
                        </div>

                        {/* Progress */}
                        <div>
                            <div className="flex items-end justify-between gap-3 mb-2">
                                <div>
                                    <span className="font-display text-3xl md:text-4xl text-[var(--brand-red)]">{fmt(raised)}</span>
                                    <span className="text-gray-500 dark:text-gray-400 text-sm mx-1">{lb.cur}</span>
                                    <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                                        {lb.of} {fmt(goal)} {lb.cur}
                                    </div>
                                </div>
                                <div className="text-end">
                                    <span className="font-display text-3xl md:text-4xl text-[var(--brand-navy)] dark:text-white">{percent}%</span>
                                    <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">{lb.reached}</div>
                                </div>
                            </div>
                            <div className="h-5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden shadow-inner" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    whileInView={{ width: `${percent}%` }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 1.6, ease: 'easeOut' }}
                                    className="h-full rounded-full bg-gradient-to-r from-[var(--brand-red)] to-[var(--brand-gold)]"
                                />
                            </div>
                        </div>

                        {/* Countdown */}
                        {ended ? (
                            <p className="rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold text-center py-4">{lb.ended}</p>
                        ) : (
                            <div>
                                <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">{lb.endsIn}</p>
                                <div dir="ltr" className="flex gap-2 md:gap-3">
                                    <TimeBox value={d} label={lb.d} />
                                    <TimeBox value={h} label={lb.h} />
                                    <TimeBox value={m} label={lb.m} />
                                    <TimeBox value={s} label={lb.s} />
                                </div>
                            </div>
                        )}

                        <Link to="/donate" className="btn-brand py-3 px-8 text-lg text-center inline-flex items-center justify-center gap-3 self-start w-full sm:w-auto">
                            <FaHandHoldingHeart /> {t.donate}
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default FeaturedCampaign;
