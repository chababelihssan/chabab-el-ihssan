import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';

const Modal = ({ isOpen, onClose, title, children, heroImage, fullScreen = false }) => {
    const { t } = useLanguage();

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            const handleEsc = (e) => {
                if (e.key === 'Escape') onClose();
            };
            window.addEventListener('keydown', handleEsc);
            return () => {
                document.body.style.overflow = 'unset';
                window.removeEventListener('keydown', handleEsc);
            };
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className={`fixed inset-0 z-50 flex items-center justify-center ${fullScreen ? 'p-0' : 'p-4 sm:p-6'}`}>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-md"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{
                            scale: 1,
                            opacity: 1,
                            y: 0,
                            transition: { type: "spring", damping: 25, stiffness: 300 }
                        }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className={`relative w-full flex flex-col bg-white dark:bg-gray-900 shadow-2xl ${fullScreen ? '' : 'overflow-hidden'} ${fullScreen ? 'h-full max-w-none rounded-none overflow-y-auto overscroll-contain custom-scrollbar' : 'max-w-2xl max-h-[85vh] rounded-3xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-white/20 dark:border-gray-700/50'}`}
                    >
                        {/* Sticky close button (fullScreen only): stays visible while scrolling */}
                        {fullScreen && (
                            <div dir="ltr" className="sticky top-0 z-30 h-0 flex justify-end">
                                <button
                                    onClick={onClose}
                                    className="m-4 p-3 rounded-full bg-black/60 text-white hover:bg-red-600 hover:scale-110 transition-all backdrop-blur-md border border-white/30 shadow-lg"
                                    aria-label={t.close_modal || "Close modal"}
                                >
                                    <FaTimes className="text-xl" />
                                </button>
                            </div>
                        )}

                        {/* Header */}
                        {heroImage ? (
                            // Hero Image Mode
                            <div className={`relative flex-shrink-0 bg-gradient-to-br from-[var(--brand-navy)] to-[var(--brand-red)] ${fullScreen ? 'h-48 md:h-64' : 'h-64'}`}>
                                <img loading="lazy" decoding="async" src={heroImage} alt={title} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
                                    <h3 className={`font-bold text-white shadow-sm leading-tight ${fullScreen ? 'text-3xl md:text-5xl container mx-auto px-2 pb-4' : 'text-2xl'}`}>{title}</h3>
                                </div>
                                {!fullScreen && <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 hover:scale-110 transition-all backdrop-blur-md border border-white/20"
                                    aria-label={t.close_modal || "Close modal"}
                                >
                                    <FaTimes className="text-lg" />
                                </button>}
                            </div>
                        ) : (
                            // Standard Header Mode
                            <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200/50 dark:border-gray-700/50 flex justify-between items-center bg-white/50 dark:bg-gray-800/50">
                                <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-900 to-blue-600 dark:from-white dark:to-gray-300">
                                    {title}
                                </h3>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-full text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                                    aria-label={t.close_modal || "Close modal"}
                                >
                                    <FaTimes className="text-xl" />
                                </button>
                            </div>
                        )}

                        {/* Body with custom scrollbar */}
                        <div className={`flex-1 ${fullScreen ? 'p-6 md:p-10' : 'overflow-y-auto custom-scrollbar p-6'}`}>
                            {fullScreen ? <div className="max-w-6xl mx-auto">{children}</div> : children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default Modal;
