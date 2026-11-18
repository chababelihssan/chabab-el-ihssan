import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { FaUtensils, FaTshirt, FaTruckMoving, FaMoon, FaUsers, FaHeart, FaTint, FaSchool, FaAmbulance, FaHome, FaBoxOpen, FaHandHoldingHeart } from 'react-icons/fa';
import { impact } from '../data/content';
import { getLocalizedContent } from '../utils/languageUtils';

// Icônes proposées dans l'interface /admin (champ « icon »)
const ICONS = {
    meals: FaUtensils, clothes: FaTshirt, moon: FaMoon, caravan: FaTruckMoving,
    people: FaUsers, heart: FaHeart, water: FaTint, school: FaSchool,
    ambulance: FaAmbulance, home: FaHome, basket: FaBoxOpen, donation: FaHandHoldingHeart,
};

import { animate, useInView } from "framer-motion";
import { useEffect, useRef } from 'react';

const AnimatedNumber = ({ value }) => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-50px" });

    useEffect(() => {
        if (!inView) return;

        // Extract numeric part and suffix
        const numericValue = parseInt(value.toString().replace(/[^0-9]/g, ''));
        const suffix = value.toString().includes('+') ? '+' : '';

        const controls = animate(0, numericValue, {
            duration: 2.5,
            ease: "easeOut",
            onUpdate(val) {
                if (ref.current) {
                    ref.current.textContent = Math.floor(val).toLocaleString() + suffix;
                }
            }
        });

        return () => controls.stop();
    }, [inView, value]);

    return <span ref={ref}>0</span>;
};

const Impact = () => {
    const { language } = useLanguage();

    // Chiffres, textes et icônes : src/content/impact.json (éditable depuis /admin)
    const stats = (impact.stats || []).map((s) => {
        const Icon = ICONS[s.icon] || FaHeart;
        return { icon: <Icon />, number: String(s.number ?? '0'), text: getLocalizedContent(s.label, language) };
    });

    return (
        <section id="impact" className="py-16 bg-white dark:bg-gray-900 transition-colors duration-300">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="font-display text-3xl md:text-4xl text-[var(--brand-navy)] dark:text-gray-100 mb-4">
                        {getLocalizedContent(impact.title, language)}
                    </h2>
                    {impact.description && getLocalizedContent(impact.description, language) && (
                        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                            {getLocalizedContent(impact.description, language)}
                        </p>
                    )}
                    <div className="w-24 h-1.5 rounded-full -rotate-2 bg-[var(--brand-red)] mx-auto mt-4"></div>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                        <div key={index} className="relative bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl shadow-md text-center transition hover:-translate-y-1 hover:shadow-xl border-b-4 border-[var(--brand-red)] overflow-hidden">
                            <div className="mx-auto mb-5 w-16 h-16 rounded-full bg-[var(--brand-navy)] text-[var(--brand-gold)] flex items-center justify-center text-3xl shadow-lg">
                                {stat.icon}
                            </div>
                            <h3 className="font-display text-5xl mb-3 text-[var(--brand-red)] dark:text-white">
                                <AnimatedNumber value={stat.number} />
                            </h3>
                            <p className="text-gray-700 dark:text-gray-300 font-medium leading-snug">
                                {stat.text}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Impact;
