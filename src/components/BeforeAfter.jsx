import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { beforeAfterProjects } from '../data/media';
import { getLocalizedContent } from '../utils/languageUtils';
import SectionHeading from './SectionHeading';

const L = {
    ar: { eyebrow: 'أثر المشاريع', title: 'قبل وبعد', subtitle: 'شاهد الفرق الذي أحدثته مشاريعنا في الميدان.', before: 'قبل', after: 'بعد', hint: 'حرّك المنزلق للمقارنة' },
    fr: { eyebrow: 'Impact des projets', title: 'Avant et après', subtitle: 'Voyez la différence que font nos projets sur le terrain.', before: 'Avant', after: 'Après', hint: 'Faites glisser pour comparer' },
    en: { eyebrow: 'Project impact', title: 'Before and after', subtitle: 'See the difference our projects make on the ground.', before: 'Before', after: 'After', hint: 'Drag to compare' },
};

// Comparateur avant/après : un <input type="range"> invisible gère souris,
// tactile ET clavier (flèches), le reste n'est que de l'affichage.
const Slider = ({ item, lb, language }) => {
    const [pos, setPos] = useState(50);
    const title = getLocalizedContent(item.title, language);
    const beforeSrc = item.before || item.after;
    const beforeFilter = item.before ? '' : 'grayscale(1) contrast(0.9) brightness(0.75)';

    return (
        <div className="max-w-4xl mx-auto">
            <div dir="ltr" className="relative aspect-[4/3] md:aspect-[16/9] overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 shadow-md bg-gray-200 select-none">
                {/* After (full) */}
                <img loading="lazy" decoding="async" src={item.after} alt={`${title} — ${lb.after}`} className="absolute inset-0 w-full h-full object-cover" draggable={false} />
                {/* Before (clipped to the left of the handle) */}
                <img loading="lazy" decoding="async"
                    src={beforeSrc}
                    alt={`${title} — ${lb.before}`}
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ clipPath: `inset(0 ${100 - pos}% 0 0)`, filter: beforeFilter }}
                    draggable={false}
                />

                <span className="absolute top-3 left-3 bg-black/60 text-white text-xs font-semibold px-3 py-1 rounded">{lb.before}</span>
                <span className="absolute top-3 right-3 bg-black/60 text-white text-xs font-semibold px-3 py-1 rounded">{lb.after}</span>

                {/* Handle */}
                <div className="absolute inset-y-0 w-0.5 bg-white shadow pointer-events-none" style={{ left: `${pos}%` }}>
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-[var(--brand-navy)] text-sm font-bold">
                        ◂▸
                    </div>
                </div>

                <input
                    type="range" min="0" max="100" step="0.5" value={pos}
                    onChange={(e) => setPos(Number(e.target.value))}
                    aria-label={lb.hint}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
                />
            </div>
            <div className="text-center mt-4 font-arabic" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{getLocalizedContent(item.caption, language)}</p>
                <p className="text-xs text-gray-400 mt-2">{lb.hint}</p>
            </div>
        </div>
    );
};

const BeforeAfter = () => {
    const { language } = useLanguage();
    const lb = L[language] || L.en;
    const [index, setIndex] = useState(0);
    const item = beforeAfterProjects[index];
    if (!item) return null;

    return (
        <section id="before-after" dir={language === 'ar' ? 'rtl' : 'ltr'} className="py-16 bg-white dark:bg-gray-900 transition-colors duration-300">
            <div className="container mx-auto px-4">
                <SectionHeading eyebrow={lb.eyebrow} title={lb.title} subtitle={lb.subtitle} />
                {beforeAfterProjects.length > 1 && (
                    <div className="flex flex-wrap justify-center gap-2 mb-6">
                        {beforeAfterProjects.map((p, i) => (
                            <button
                                key={p.id}
                                onClick={() => setIndex(i)}
                                className={`px-4 py-1.5 rounded-md text-sm font-arabic border transition ${i === index ? 'bg-[var(--brand-navy)] text-white border-[var(--brand-navy)]' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:border-[var(--brand-navy)]'}`}
                            >
                                {getLocalizedContent(p.title, language)}
                            </button>
                        ))}
                    </div>
                )}
                <Slider key={item.id} item={item} lb={lb} language={language} />
            </div>
        </section>
    );
};

export default BeforeAfter;
