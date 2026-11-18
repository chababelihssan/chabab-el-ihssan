import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
// removed import { translations } from '../translations';
import settings, { social } from '../data/settings';
import { getLocalizedContent } from '../utils/languageUtils';
import { FaFacebookF, FaInstagram, FaYoutube, FaTiktok, FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock } from 'react-icons/fa';

const Footer = () => {
    const { t, language } = useLanguage();

    const navigate = useNavigate();
    const location = useLocation();

    const handleNavigation = (e, sectionId) => {
        e.preventDefault();
        if (location.pathname === '/') {
            const element = document.getElementById(sectionId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            navigate('/', { state: { scrollTo: sectionId } });
        }
    };

    return (
        <footer id="contact" className="bg-[var(--brand-navy-dark)] dark:bg-black text-white pt-12 pb-6 transition-colors duration-300 border-t-8 border-[var(--brand-gold)]">
            <div className="container mx-auto px-4">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                    <div>
                        <h3 className="font-display text-2xl mb-4">
                            {t.association_name}
                        </h3>
                        <p className="text-gray-400 mb-4">
                            {t.footer_about_desc}
                        </p>
                        <div className="flex flex-row items-center gap-4">
                            <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition p-1">
                                <FaFacebookF className="text-2xl" />
                            </a>
                            <a href={social.x} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition p-1">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-6 h-6 fill-current">
                                    <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z" />
                                </svg>
                            </a>
                            <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition p-1">
                                <FaInstagram className="text-2xl" />
                            </a>
                            <a href={social.youtube} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition p-1">
                                <FaYoutube className="text-2xl" />
                            </a>
                            <a href={social.tiktok} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition p-1">
                                <FaTiktok className="text-2xl" />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-display text-2xl mb-4">
                            {t.quick_links}
                        </h3>
                        <ul className="space-y-2">
                            <li><button onClick={(e) => handleNavigation(e, 'hero')} className="text-gray-400 hover:text-white transition text-start">{t.home}</button></li>
                            <li><button onClick={(e) => handleNavigation(e, 'about')} className="text-gray-400 hover:text-white transition text-start">{t.about}</button></li>
                            <li><button onClick={(e) => handleNavigation(e, 'programs')} className="text-gray-400 hover:text-white transition text-start">{t.programs}</button></li>
                            <li><button onClick={(e) => handleNavigation(e, 'branches')} className="text-gray-400 hover:text-white transition text-start">{t.branches}</button></li>
                            <li><Link to="/sadaqa-jariya" className="text-gray-400 hover:text-white transition">Sadaqa Jariya</Link></li>
                            <li><Link to="/gallery" className="text-gray-400 hover:text-white transition">{t.gallery}</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-display text-2xl mb-4">
                            {t.help_title}
                        </h3>
                        <ul className="space-y-2">
                            <li><Link to="/volunteer" className="text-gray-400 hover:text-white transition">{t.volunteer}</Link></li>
                            <li><Link to="/donate" className="text-gray-400 hover:text-white transition">{t.donate_money}</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-display text-2xl mb-4">
                            {t.contact_us}
                        </h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-2">
                                <FaMapMarkerAlt className="text-gray-400 mt-1" />
                                <span className="text-gray-400 break-all min-w-0">{getLocalizedContent(settings.address, language) || t.address}</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <FaPhone className="text-gray-400" />
                                <span className="text-gray-400" dir="ltr">{settings.phone_display || t.phone_number}</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <FaEnvelope className="text-gray-400" />
                                <a href={`mailto:${settings.email}`} className="text-gray-400 hover:text-white transition break-all min-w-0">{settings.email}</a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-gray-400 text-sm text-center">
                        <p>{{ ar: 'جميع الحقوق محفوظة', fr: 'Tous droits réservés', en: 'All rights reserved' }[language] || 'All rights reserved'}</p>
                        <p dir="ltr" className="mt-1">
                            {{ ar: 'المطور', fr: 'Développeur', en: 'Developer' }[language] || 'Developer'}: <span className="text-white font-semibold">Ferhat Zehani</span>
                        </p>
                    </div>
                    <div className="flex gap-6">
                        <Link to="/privacy-policy" className="text-gray-400 hover:text-white text-sm transition">{t.privacy_policy}</Link>
                        <Link to="/terms-of-use" className="text-gray-400 hover:text-white text-sm transition">{t.terms_of_use}</Link>
                        <Link to="/report-problem" className="text-gray-400 hover:text-white text-sm transition">{t.report_problem}</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
