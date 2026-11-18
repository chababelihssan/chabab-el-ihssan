import React, { useState } from 'react';
import { useData } from '../hooks/useData';
import { useLanguage } from '../context/LanguageContext';
import { FaCalendarAlt, FaArrowRight, FaMapMarkerAlt } from 'react-icons/fa';
import Modal from '../components/Modal';
import { formatDateRange, calculateDuration } from '../utils/dateUtils';
import PageHeader from '../components/PageHeader';
import { PLACEHOLDER } from '../utils/placeholder';

import SmartImage from '../components/SmartImage';
const NewsPage = () => {
    const { news, events, getLocalizedContent } = useData();
    const { language, t } = useLanguage();
    const [selectedEvent, setSelectedEvent] = useState(null);
    return (
        <div className="bg-brand-paper min-h-screen pb-20 transition-colors duration-300">
            <PageHeader title={t.news_title} />
            <div className="container mx-auto px-4 pt-12">

                {/* News Section */}
                <div className="mb-16">
                    <h2 className="font-display text-3xl md:text-4xl text-[var(--brand-navy)] dark:text-white mb-8 border-l-4 border-yellow-500 pl-4">
                        {t.news_section_title}
                    </h2>
                    {news.length === 0 ? (
                        <div className="text-center py-10 bg-gray-100 dark:bg-gray-800 rounded-lg">
                            <p className="text-xl text-gray-500 dark:text-gray-400">
                                {t.no_news}
                            </p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {news.map((item) => {
                                return (
                                    <div key={item.id} className="bg-transparent rounded-xl flex flex-col hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden">
                                        <SmartImage loading="lazy" decoding="async"
                                            src={item.image_url || item.image || PLACEHOLDER}
                                            alt={getLocalizedContent(item.title, language)}
                                            className="h-48 w-full object-cover"
                                        />
                                        <div className="p-6 flex-1 flex flex-col">
                                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                                                <FaCalendarAlt className="mr-2" /> {formatDateRange(item.date, item.end_date, language)}
                                                {item.location && getLocalizedContent(item.location, language) && (
                                                    <span className="flex items-center ml-3">
                                                        <FaMapMarkerAlt className="mr-1" /> {getLocalizedContent(item.location, language)}
                                                    </span>
                                                )}
                                            </div>
                                            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">
                                                {getLocalizedContent(item.title, language)}
                                            </h2>
                                            <p className="text-gray-600 dark:text-gray-300 mb-4 flex-1 line-clamp-3">
                                                {getLocalizedContent(item.description, language)}
                                            </p>
                                            <div className="flex justify-end items-center mt-auto pt-4 border-t dark:border-gray-700">
                                                <button
                                                    onClick={() => setSelectedEvent(item)} // Re-using modal for reading details essentially
                                                    className="text-blue-900 dark:text-blue-300 font-semibold hover:underline flex items-center gap-2"
                                                >
                                                    {t.read_more} <FaArrowRight />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Events Section */}
                <div>
                    <h2 className="font-display text-3xl md:text-4xl text-[var(--brand-navy)] dark:text-white mb-8 border-l-4 border-blue-600 pl-4">
                        {t.events_section_title}
                    </h2>
                    {events.length === 0 ? (
                        <div className="text-center py-10 bg-gray-100 dark:bg-gray-800 rounded-lg">
                            <p className="text-xl text-gray-500 dark:text-gray-400">
                                {t.no_events}
                            </p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {events.map((item) => {
                                return (
                                    <div key={item.id} className="bg-transparent rounded-xl flex flex-col hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden">
                                        <SmartImage loading="lazy" decoding="async"
                                            src={item.image_url || item.image || PLACEHOLDER}
                                            alt={getLocalizedContent(item.title, language)}
                                            className="h-48 w-full object-cover"
                                        />
                                        <div className="p-6 flex-1 flex flex-col">
                                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                                                <FaCalendarAlt className="mr-2" />
                                                <span>{formatDateRange(item.date, item.end_date, language)}</span>
                                                {item.end_date && calculateDuration(item.date, item.end_date, t) && (
                                                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-0.5 rounded-full hidden sm:inline-block">
                                                        {calculateDuration(item.date, item.end_date, t)}
                                                    </span>
                                                )}
                                                {item.location && getLocalizedContent(item.location, language) && (
                                                    <span className="flex items-center ml-3">
                                                        <FaMapMarkerAlt className="mr-1" /> {getLocalizedContent(item.location, language)}
                                                    </span>
                                                )}
                                            </div>
                                            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">
                                                {getLocalizedContent(item.title, language)}
                                            </h2>
                                            <p className="text-gray-600 dark:text-gray-300 mb-4 flex-1 line-clamp-3">
                                                {getLocalizedContent(item.description, language)}
                                            </p>
                                            <div className="flex justify-end items-center mt-auto pt-4 border-t dark:border-gray-700">
                                                <button
                                                    onClick={() => setSelectedEvent(item)}
                                                    className="text-blue-900 dark:text-blue-300 font-semibold hover:underline flex items-center gap-2"
                                                >
                                                    {t.read_more} <FaArrowRight />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Details Modal */}
            <Modal
                isOpen={!!selectedEvent}
                onClose={() => setSelectedEvent(null)}
                title={getLocalizedContent(selectedEvent?.title, language)}
                heroImage={selectedEvent?.image_url || selectedEvent?.image}
            >
                <div className="relative">
                    <div className="flex flex-wrap items-center gap-3 text-sm mb-6">
                        <span className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-800">
                            <FaCalendarAlt />
                            <span>{formatDateRange(selectedEvent?.date, selectedEvent?.end_date, language)}</span>
                            {selectedEvent?.end_date && calculateDuration(selectedEvent.date, selectedEvent.end_date, t) && (
                                <span className="ml-2 text-xs bg-blue-200 text-blue-900 px-2 py-0.5 rounded-full border border-blue-300">
                                    {calculateDuration(selectedEvent.date, selectedEvent.end_date, t)}
                                </span>
                            )}
                        </span>
                        {selectedEvent?.location && getLocalizedContent(selectedEvent.location, language) && (
                            <span className="flex items-center gap-1.5 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-3 py-1 rounded-full border border-red-100 dark:border-red-800">
                                <FaMapMarkerAlt />
                                <span>{getLocalizedContent(selectedEvent.location, language)}</span>
                            </span>
                        )}
                    </div>
                    <div className="prose dark:prose-invert max-w-none mb-8">
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line text-lg">
                            {getLocalizedContent(selectedEvent?.description, language)}
                        </p>
                    </div>

                </div>
            </Modal>
        </div>
    );
};

export default NewsPage;
