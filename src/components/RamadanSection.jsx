import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaMoon, FaBoxOpen, FaUsers, FaMinus, FaPlus } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import { ramadan as r } from '../data/content';

const L = {
    ar: {
        badge: 'رمضان كريم', startsIn: 'يبدأ رمضان بعد', d: 'يوم', h: 'ساعة', m: 'دقيقة', s: 'ثانية',
        dayOf: (n, total) => `نحن في اليوم ${n} من ${total} من رمضان`,
        basketTitle: 'سلة رمضان', basketDesc: 'سلة غذائية تكفي أسرة محتاجة طوال الشهر.',
        qtyBasket: 'عدد السلال', fitrTitle: 'زكاة الفطر', fitrDesc: 'أخرجها قبل صلاة العيد، ونوصلها نحن لمستحقيها.',
        qtyPersons: 'عدد الأفراد', perPerson: 'للفرد', total: 'المجموع', cur: 'دج', give: 'ساهم الآن',
        less: 'إنقاص', more: 'زيادة',
    },
    fr: {
        badge: 'Ramadan Karim', startsIn: 'Début du Ramadan dans', d: 'jours', h: 'heures', m: 'min', s: 'sec',
        dayOf: (n, total) => `Jour ${n} sur ${total} du Ramadan`,
        basketTitle: 'Couffin du Ramadan', basketDesc: 'Un panier alimentaire pour nourrir une famille démunie pendant tout le mois.',
        qtyBasket: 'Nombre de couffins', fitrTitle: 'Zakat el-Fitr', fitrDesc: "À verser avant la prière de l'Aïd ; nous la remettons à ses bénéficiaires.",
        qtyPersons: 'Nombre de personnes', perPerson: 'par personne', total: 'Total', cur: 'DA', give: 'Donner maintenant',
        less: 'Diminuer', more: 'Augmenter',
    },
    en: {
        badge: 'Ramadan Kareem', startsIn: 'Ramadan starts in', d: 'days', h: 'hours', m: 'min', s: 'sec',
        dayOf: (n, total) => `Day ${n} of ${total} of Ramadan`,
        basketTitle: 'Ramadan food basket', basketDesc: 'A food basket that feeds a family in need for the whole month.',
        qtyBasket: 'Number of baskets', fitrTitle: 'Zakat al-Fitr', fitrDesc: 'Give it before the Eid prayer; we deliver it to those who are entitled to it.',
        qtyPersons: 'Number of people', perPerson: 'per person', total: 'Total', cur: 'DZD', give: 'Give now',
        less: 'Decrease', more: 'Increase',
    },
};

const DAY = 86400000;
const TimeBox = ({ value, label }) => (
    <div className="flex-1 min-w-[64px] rounded-xl bg-white/10 text-white py-3 text-center">
        <div className="font-display text-3xl md:text-4xl leading-none tabular-nums">{String(value).padStart(2, '0')}</div>
        <div className="mt-1 text-xs md:text-sm text-[var(--brand-gold)]">{label}</div>
    </div>
);

const Stepper = ({ label, value, onChange, lb }) => (
    <div className="flex items-center justify-between gap-3">
        <span className="font-semibold text-gray-700 dark:text-gray-200">{label}</span>
        <div className="flex items-center gap-2">
            <button type="button" aria-label={lb.less} onClick={() => onChange(Math.max(1, value - 1))}
                className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 text-[var(--brand-navy)] dark:text-white flex items-center justify-center active:scale-95"><FaMinus /></button>
            <span className="w-12 text-center text-2xl font-bold tabular-nums text-gray-900 dark:text-white">{value}</span>
            <button type="button" aria-label={lb.more} onClick={() => onChange(Math.min(999, value + 1))}
                className="w-12 h-12 rounded-full bg-[var(--brand-navy)] text-white flex items-center justify-center active:scale-95"><FaPlus /></button>
        </div>
    </div>
);

const GiveCard = ({ icon, title, desc, qtyLabel, unitPrice, unitNote = '', lb }) => {
    const [qty, setQty] = useState(1);
    const total = qty * unitPrice;
    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
                <span className="text-3xl text-[var(--brand-navy)] dark:text-[var(--brand-gold)]">{icon}</span>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{title}</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300">{desc}</p>
            <div className="text-sm text-gray-500 dark:text-gray-400">{unitPrice.toLocaleString('en-US')} {lb.cur} {unitNote}</div>
            <Stepper label={qtyLabel} value={qty} onChange={setQty} lb={lb} />
            <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
                <span className="font-semibold text-gray-700 dark:text-gray-200">{lb.total}</span>
                <span className="text-2xl font-bold text-[var(--brand-red)] tabular-nums">{total.toLocaleString('en-US')} {lb.cur}</span>
            </div>
            <Link to={`/donate?amount=${total}`}
                className="min-h-[52px] rounded-xl bg-[var(--brand-red)] hover:brightness-110 text-white text-lg font-bold flex items-center justify-center transition active:scale-95">
                {lb.give}
            </Link>
        </div>
    );
};

// Mode Ramadan : visible seulement autour du mois de Ramadan (réglages dans /admin → 🌙).
const RamadanSection = () => {
    const { language } = useLanguage();
    const lb = L[language] || L.ar;
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, []);

    if (!r || r.enabled === false || !r.start_date) return null;
    const start = new Date(`${String(r.start_date).slice(0, 10)}T00:00:00`).getTime();
    if (Number.isNaN(start)) return null;
    const days = Number(r.days) || 30;
    const end = start + days * DAY;
    const before = start - now;
    if (before > (Number(r.show_days_before) || 0) * DAY || now >= end) return null;

    const dir = language === 'ar' ? 'rtl' : 'ltr';
    const started = before <= 0;
    const dayNo = Math.min(days, Math.floor((now - start) / DAY) + 1);

    return (
        <section id="ramadan" dir={dir} className="relative overflow-hidden bg-brand-grid py-12 md:py-16">
            <div className="container mx-auto px-4">
                <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.5 }}>
                    <div className="text-center text-white mb-8">
                        <span className="inline-flex items-center gap-2 bg-[var(--brand-gold)] text-[var(--brand-navy-dark)] font-bold px-4 py-1 rounded-full mb-4">
                            <FaMoon /> {lb.badge}
                        </span>
                        {started ? (
                            <p className="font-display text-2xl md:text-3xl">{lb.dayOf(dayNo, days)}</p>
                        ) : (
                            <>
                                <p className="mb-4 text-lg">{lb.startsIn}</p>
                                <div className="flex gap-2 max-w-md mx-auto">
                                    <TimeBox value={Math.floor(before / DAY)} label={lb.d} />
                                    <TimeBox value={Math.floor(before / 3600000) % 24} label={lb.h} />
                                    <TimeBox value={Math.floor(before / 60000) % 60} label={lb.m} />
                                    <TimeBox value={Math.floor(before / 1000) % 60} label={lb.s} />
                                </div>
                            </>
                        )}
                    </div>
                    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        {Number(r.basket_price) > 0 && (
                            <GiveCard icon={<FaBoxOpen />} title={lb.basketTitle} desc={lb.basketDesc} qtyLabel={lb.qtyBasket} unitPrice={Number(r.basket_price)} lb={lb} />
                        )}
                        {Number(r.fitr_amount) > 0 && (
                            <GiveCard icon={<FaUsers />} title={lb.fitrTitle} desc={lb.fitrDesc} qtyLabel={lb.qtyPersons} unitPrice={Number(r.fitr_amount)} unitNote={lb.perPerson} lb={lb} />
                        )}
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default RamadanSection;
