import React from 'react';
import settings from '../data/settings';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'framer-motion';
import { FaHandPaper, FaEnvelope } from 'react-icons/fa';

const Volunteer = () => {
    const { t } = useLanguage();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-brand-paper py-20 px-4 flex flex-col items-center justify-center transition-colors duration-300"
        >
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden text-center">
                <div className="bg-brand-grid p-8 text-white relative overflow-hidden border-b-8 border-[var(--brand-red)]">
                    <FaHandPaper className="text-5xl mx-auto mb-4 relative z-10 animate-bounce-slow" />
                    <h1 className="font-display text-3xl md:text-4xl relative z-10">{t.volunteer_title}</h1>
                    <p className="text-blue-200 mt-2 relative z-10">{t.volunteer_subtitle}</p>
                </div>

                <div className="p-8 flex flex-col gap-4">
                    <a
                        href={`mailto:${settings.email}`}
                        className="w-full flex items-center justify-center gap-3 bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-lg transition shadow-sm hover:shadow-md"
                    >
                        <FaEnvelope /> {settings.email}
                    </a>
                </div>
            </div>
        </motion.div>
    );
};

export default Volunteer;
