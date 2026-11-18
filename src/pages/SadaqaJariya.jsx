import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaTint, FaSchool, FaAmbulance, FaWater, FaHandHoldingHeart, FaListUl, FaUniversity, FaNewspaper } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import { sadaqaProjects } from '../data/media';
import { getLocalizedContent } from '../utils/languageUtils';
import SectionHeading from '../components/SectionHeading';

const ICONS = { well: FaTint, school: FaSchool, ambulance: FaAmbulance, tank: FaWater };

const L = {
    ar: {
        title: 'الصدقة الجارية والوقف',
        subtitle: 'مشاريع يدوم نفعها وأجرها بإذن الله',
        introTitle: 'ما هي الصدقة الجارية؟',
        intro: 'الصدقة الجارية عمل خيري يستمر نفعه للناس مدة طويلة، كحفر بئر أو بناء مدرسة أو تجهيز سيارة إسعاف. وقد ورد في الحديث الصحيح أنها من الأعمال التي لا ينقطع أجرها بعد وفاة الإنسان. أما الوقف فهو حبس الأصل وتسبيل منفعته في وجوه الخير.',
        projectsEyebrow: 'مجالات المساهمة',
        projectsTitle: 'مشاريع الصدقة الجارية',
        projectsSub: 'اختر المشروع الذي يناسبك وساهم في استمرار نفعه.',
        contribute: 'ساهم في هذا المشروع',
        stepsEyebrow: 'طريقة المساهمة',
        stepsTitle: 'كيف تساهم؟',
        steps: [
            { icon: FaListUl, title: 'اختر المشروع', text: 'حدّد المشروع الذي ترغب في دعمه من القائمة أعلاه.' },
            { icon: FaUniversity, title: 'تبرّع', text: 'حوّل مساهمتك عبر معلومات الحساب الموجودة في صفحة التبرع.' },
            { icon: FaNewspaper, title: 'تابع الإنجاز', text: 'نُطلعك على مآل المشاريع عبر أخبار الجمعية وصفحاتها.' },
        ],
        cta: 'تبرع الآن',
        ctaText: 'للاستفسار عن الوقف أو عن مشروع محدد، تواصل معنا وسنرد عليك.',
        contact: 'تواصل معنا',
    },
    fr: {
        title: 'Sadaqa Jariya et Waqf',
        subtitle: 'Des projets dont le bienfait et la récompense se prolongent, incha’Allah',
        introTitle: 'Qu’est-ce que la Sadaqa Jariya ?',
        intro: 'La sadaqa jariya (aumône continue) est une œuvre de bienfaisance dont l’utilité profite aux gens pendant longtemps : forer un puits, construire une école ou équiper une ambulance. Un hadith authentique la compte parmi les œuvres dont la récompense ne s’interrompt pas après la mort. Le waqf consiste à immobiliser un bien et à en affecter l’usage à des œuvres de bien.',
        projectsEyebrow: 'Domaines de contribution',
        projectsTitle: 'Projets de Sadaqa Jariya',
        projectsSub: 'Choisissez le projet qui vous convient et contribuez à sa pérennité.',
        contribute: 'Contribuer à ce projet',
        stepsEyebrow: 'Comment contribuer',
        stepsTitle: 'Comment participer ?',
        steps: [
            { icon: FaListUl, title: 'Choisissez le projet', text: 'Sélectionnez le projet que vous souhaitez soutenir dans la liste ci-dessus.' },
            { icon: FaUniversity, title: 'Faites votre don', text: 'Effectuez votre versement avec les coordonnées de la page Don.' },
            { icon: FaNewspaper, title: 'Suivez la réalisation', text: 'Nous vous informons de l’avancement via les actualités de l’association.' },
        ],
        cta: 'Faire un don',
        ctaText: 'Pour toute question sur le waqf ou sur un projet précis, contactez-nous.',
        contact: 'Nous contacter',
    },
    en: {
        title: 'Sadaqa Jariya & Waqf',
        subtitle: 'Projects whose benefit and reward continue, God willing',
        introTitle: 'What is Sadaqa Jariya?',
        intro: 'Sadaqa jariya (ongoing charity) is a good deed whose benefit reaches people for a long time, such as drilling a well, building a school or equipping an ambulance. An authentic hadith lists it among the deeds whose reward does not stop after a person’s death. Waqf means setting an asset aside and dedicating its benefit to charitable causes.',
        projectsEyebrow: 'Areas of contribution',
        projectsTitle: 'Sadaqa Jariya projects',
        projectsSub: 'Choose the project that suits you and help keep its benefit going.',
        contribute: 'Contribute to this project',
        stepsEyebrow: 'How to contribute',
        stepsTitle: 'How to take part',
        steps: [
            { icon: FaListUl, title: 'Choose a project', text: 'Pick the project you wish to support from the list above.' },
            { icon: FaUniversity, title: 'Donate', text: 'Send your contribution using the account details on the Donate page.' },
            { icon: FaNewspaper, title: 'Follow the progress', text: 'We keep you informed through the association’s news and pages.' },
        ],
        cta: 'Donate now',
        ctaText: 'For questions about waqf or a specific project, please get in touch.',
        contact: 'Contact us',
    },
};

const SadaqaJariya = () => {
    const { language } = useLanguage();
    const lb = L[language] || L.en;
    const dir = language === 'ar' ? 'rtl' : 'ltr';

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            dir={dir}
            className="bg-white dark:bg-gray-900 min-h-screen font-arabic transition-colors duration-300"
        >
            {/* Formal banner: plain, no decorations */}
            <header className="bg-[var(--brand-navy)] text-white border-b-4 border-[var(--brand-gold)]">
                <div className="container mx-auto px-4 py-14 md:py-20 text-center">
                    <h1 className="text-3xl md:text-5xl font-bold leading-tight">{lb.title}</h1>
                    <p className="mt-4 text-white/85 md:text-lg">{lb.subtitle}</p>
                </div>
            </header>

            {/* Intro */}
            <section className="container mx-auto px-4 py-14">
                <div className="max-w-3xl mx-auto border-s-4 border-[var(--brand-red)] ps-6">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3">{lb.introTitle}</h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-loose">{lb.intro}</p>
                </div>
            </section>

            {/* Projects */}
            <section className="bg-gray-50 dark:bg-gray-800 py-14">
                <div className="container mx-auto px-4">
                    <SectionHeading eyebrow={lb.projectsEyebrow} title={lb.projectsTitle} subtitle={lb.projectsSub} />
                    <div className="grid sm:grid-cols-2 gap-6 max-w-5xl mx-auto">
                        {sadaqaProjects.map((p) => {
                            const Icon = ICONS[p.icon] || FaHandHoldingHeart;
                            return (
                                <div key={p.id} className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 flex flex-col gap-4 shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <span className="w-12 h-12 rounded-md bg-[var(--brand-navy)] text-[var(--brand-gold)] flex items-center justify-center text-xl shrink-0">
                                            <Icon />
                                        </span>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{getLocalizedContent(p.title, language)}</h3>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed flex-1">{getLocalizedContent(p.description, language)}</p>
                                    <Link to="/donate" className="self-start text-sm font-bold text-[var(--brand-red)] hover:underline">
                                        {lb.contribute} {language === 'ar' ? '←' : '→'}
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Steps */}
            <section className="container mx-auto px-4 py-14">
                <SectionHeading eyebrow={lb.stepsEyebrow} title={lb.stepsTitle} />
                <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {lb.steps.map((s, i) => (
                        <div key={i} className="text-center px-4">
                            <div className="mx-auto mb-4 w-14 h-14 rounded-full border-2 border-[var(--brand-navy)] text-[var(--brand-navy)] dark:text-white dark:border-white flex items-center justify-center text-xl">
                                <s.icon />
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2">{i + 1}. {s.title}</h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{s.text}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Call to action */}
            <section className="bg-[var(--brand-navy-dark)] text-white py-12">
                <div className="container mx-auto px-4 text-center max-w-2xl">
                    <p className="mb-6 text-white/90">{lb.ctaText}</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link to="/donate" className="btn-brand py-3 px-8 inline-flex items-center justify-center gap-2">
                            <FaHandHoldingHeart /> {lb.cta}
                        </Link>
                        <Link to="/#contact" state={{ scrollTo: 'contact' }} className="btn-brand-light py-3 px-8 text-center">{lb.contact}</Link>
                    </div>
                </div>
            </section>
        </motion.div>
    );
};

export default SadaqaJariya;
