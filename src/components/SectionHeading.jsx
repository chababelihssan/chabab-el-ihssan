import React from 'react';

// Titre de section sobre et officiel (police simple Cairo, filet doré fin).
const SectionHeading = ({ eyebrow, title, subtitle }) => (
    <div className="max-w-3xl mx-auto text-center mb-10">
        {eyebrow && <span className="block text-sm font-semibold text-[var(--brand-red)] mb-2 font-arabic">{eyebrow}</span>}
        <h2 className="font-arabic text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{title}</h2>
        <div className="w-16 h-0.5 bg-[var(--brand-gold)] mx-auto my-4" />
        {subtitle && <p className="font-arabic text-gray-600 dark:text-gray-300 leading-relaxed">{subtitle}</p>}
    </div>
);

export default SectionHeading;
