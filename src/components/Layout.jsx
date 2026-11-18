import React, { Suspense } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { PageSkeleton } from './Skeleton';
import Header from './Header';
import AnnouncementBar from './AnnouncementBar';
import Footer from './Footer';
import ScrollToTop from './ScrollToTop';
import { Toaster } from 'react-hot-toast';

import { useLanguage } from '../context/LanguageContext';

const Layout = () => {
    const { language } = useLanguage();
    const location = useLocation();
    const outlet = useOutlet();
    const reduce = useReducedMotion();
    const skip = { ar: 'انتقل إلى المحتوى', fr: 'Aller au contenu', en: 'Skip to content' }[language];

    return (
        <div
            className={`min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300 flex flex-col ${language === 'ar' ? 'font-arabic' : ''}`}
            dir={language === 'ar' ? 'rtl' : 'ltr'}
        >
            <a href="#main-content" className="skip-link">{skip}</a>
            <AnnouncementBar />
            <Header />
            <main id="main-content" tabIndex={-1} className="flex-grow flex flex-col w-full focus:outline-none">
                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={location.pathname}
                        className="flex-grow flex flex-col w-full"
                        initial={reduce ? false : { opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduce ? { opacity: 1 } : { opacity: 0 }}
                        transition={{ duration: 0.25 }}
                    >
                        <Suspense fallback={<PageSkeleton />}>{outlet}</Suspense>
                    </motion.div>
                </AnimatePresence>
            </main>
            <Footer />
            <ScrollToTop />
            <Toaster position="top-center" reverseOrder={false} />
        </div>
    );
};

export default Layout;
