import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useData } from '../hooks/useData';
import { useLanguage } from '../context/LanguageContext';
import { FaCalendarAlt, FaArrowRight, FaThumbtack, FaMapMarkerAlt } from 'react-icons/fa';
import Modal from '../components/Modal';
import { formatDateRange, calculateDuration, isExpired } from '../utils/dateUtils';
import PageHeader from '../components/PageHeader';
import { PLACEHOLDER } from '../utils/placeholder';

import SmartImage from '../components/SmartImage';
const ProgramsPage = () => {
    const { programs, projects, getLocalizedContent } = useData();
    const { language, t } = useLanguage();
    const location = useLocation();

    // Generic selection state
    // Actually, to align with the pattern, let's just store the ID and Type if mostly possible, 
    // BUT we need to handle the initial navigation state which passes the full object. 
    // Better strategy: Store the 'ID' and 'Type' in state, and look it up. 
    // If navigation passes an item, we extract ID and Type from it.

    const [modalState, setModalState] = useState({ id: null, type: 'programs' });

    // Ouvre la fenêtre quand on arrive avec un élément sélectionné (ajustement pendant le rendu, sans effet)
    const [seenNav, setSeenNav] = useState(null);
    if (location.state !== seenNav) {
        setSeenNav(location.state);
        if (location.state?.selectedProgram) {
            setModalState({
                id: location.state.selectedProgram.id,
                type: location.state.type || 'programs'
            });
        }
    }

    // Derive the selected item from the global data to ensure it is always fresh (live attendees count, status)
    const selectedItem = modalState.id
        ? (modalState.type === 'projects'
            ? projects.find(p => p.id === modalState.id)
            : programs.find(p => p.id === modalState.id))
        : null;


    const renderCard = (item, type) => {
        const expired = isExpired(item.end_date || item.date);

        return (
            <div
                key={item.id}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer ${expired ? 'opacity-75 grayscale' : ''}`}
                onClick={() => setModalState({ id: item.id, type })}
            >
                <div className="relative md:w-1/3 shrink-0">
                    <SmartImage loading="lazy" decoding="async"
                        src={item.image_url || PLACEHOLDER}
                        alt={getLocalizedContent(item.title, language)}
                        className="h-64 w-full md:h-full object-cover"
                    />
                    {expired && (
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-600/90 text-white text-lg font-bold px-4 py-2 rounded shadow uppercase tracking-wider z-10 text-center w-3/4">
                            {t.expired}
                        </div>
                    )}
                </div>
                <div className="p-8 flex flex-col justify-center flex-1">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2 justify-between">
                        <div className="flex items-center">
                            <FaCalendarAlt className="mr-2" />
                            {item.date ? (
                                <>
                                    <span>{formatDateRange(item.date, item.end_date, language)}</span>
                                    {item.end_date && calculateDuration(item.date, item.end_date, t) && (
                                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-0.5 rounded-full hidden sm:inline-block">
                                            {calculateDuration(item.date, item.end_date, t)}
                                        </span>
                                    )}
                                </>
                            ) : (
                                <span>{t.ongoing || "Ongoing"}</span>
                            )}
                            {item.location && getLocalizedContent(item.location, language) && (
                                <span className="flex items-center ml-4">
                                    <FaMapMarkerAlt className="mr-1" /> {getLocalizedContent(item.location, language)}
                                </span>
                            )}
                        </div>
                        {item.is_pinned && <div className="flex items-center text-blue-600 gap-1"><FaThumbtack /> {t.pin_item || "Pinned"}</div>}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                        {getLocalizedContent(item.title, language)}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6 line-clamp-3">
                        {getLocalizedContent(item.description, language)}
                    </p>
                    <div className="flex items-center mt-auto">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setModalState({ id: item.id, type });
                            }}
                            className="inline-flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white px-6 py-2 rounded-lg transition font-medium shadow-md"
                        >
                            {t.learn_more} <FaArrowRight className={language === 'ar' ? 'rotate-180' : ''} />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-brand-paper min-h-screen pb-20 transition-colors duration-300">
            <PageHeader title={t.programs_projects_title} />
            <div className="container mx-auto px-4 pt-12">

                {/* Programs Section */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-8 border-l-4 border-blue-900 pl-4">
                        {t.programs_section_title}
                    </h2>
                    <div className="space-y-8">
                        {programs.length > 0 ? programs.map(p => renderCard(p, 'programs')) : (
                            <p className="text-gray-500 italic">{t.no_programs}</p>
                        )}
                    </div>
                </div>

                {/* Projects Section */}
                <div>
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-8 border-l-4 border-green-600 pl-4">
                        {t.projects_section_title}
                    </h2>
                    <div className="space-y-8">
                        {projects.length > 0 ? projects.map(p => renderCard(p, 'projects')) : (
                            <p className="text-gray-500 italic">{t.no_projects}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Details Modal */}
            <Modal
                isOpen={!!selectedItem}
                onClose={() => setModalState({ id: null, type: 'programs' })}
                title={getLocalizedContent(selectedItem?.title, language)}
                heroImage={selectedItem?.image_url}
            >
                {/* Modal Content - mostly same but ensuring it uses selectedItem derived from state */}
                {selectedItem && (
                    <div className="space-y-6">
                        {/* Display Description in Modal too, good for context */}
                        <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                            <p>{getLocalizedContent(selectedItem.description, language)}</p>
                        </div>

                        {/* Date and Location */}
                        <div className="flex flex-wrap gap-3 mb-4">
                            {selectedItem?.date && (
                                <div className="flex items-center gap-2 text-sm font-semibold text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                                    <FaCalendarAlt /> {formatDateRange(selectedItem.date, selectedItem.end_date, language)}
                                    {selectedItem.end_date && calculateDuration(selectedItem.date, selectedItem.end_date, t) && (
                                        <span className="ml-2 text-xs bg-blue-200 text-blue-900 px-2 py-0.5 rounded-full border border-blue-300">
                                            {calculateDuration(selectedItem.date, selectedItem.end_date, t)}
                                        </span>
                                    )}
                                </div>
                            )}
                            {selectedItem?.location && getLocalizedContent(selectedItem.location, language) && (
                                <div className="flex items-center gap-2 text-sm font-semibold text-red-800 dark:text-red-300 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                                    <FaMapMarkerAlt /> {getLocalizedContent(selectedItem.location, language)}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ProgramsPage;
