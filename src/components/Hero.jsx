import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHeart, FaHandHoldingHeart, FaStar, FaHandsHelping, FaPlay } from 'react-icons/fa';
import { heroVideo, heroImage } from '../data/media';
import VideoModal from './VideoModal';

// Poster-style hero matching the 2026 Instagram identity: navy grid paper,
// torn white paper title, red accents, taped polaroid photo.
const Hero = () => {
    const { language, t } = useLanguage();
    const [playing, setPlaying] = useState(false);
    const hasVideo = !!(heroVideo.src || heroVideo.youtubeId);
    const watchLabel = { ar: 'شاهد الفيديو', fr: 'Voir la vidéo', en: 'Watch the video' }[language] || 'Watch the video';

    return (
        <section id="home" className="relative overflow-hidden bg-brand-grid text-white py-12 md:py-20">
            {/* ===== Decorative background layers ===== */}
            <div aria-hidden="true" className="absolute inset-0 pointer-events-none select-none">
                {/* Faint photo texture */}
                <img src={heroImage} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-[0.12] mix-blend-luminosity" />
                {/* Soft colour glows */}
                <div className="absolute -top-32 -start-32 w-[28rem] h-[28rem] rounded-full bg-[var(--brand-red)] opacity-40 blur-3xl" />
                <div className="absolute top-1/3 -end-40 w-[30rem] h-[30rem] rounded-full bg-[var(--brand-gold)] opacity-20 blur-3xl" />
                <div className="absolute -bottom-24 start-1/3 w-[24rem] h-[24rem] rounded-full bg-[var(--brand-navy-dark)] opacity-60 blur-3xl" />
                {/* Dark vignette on the edges */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(40,0,15,0.55)_100%)]" />
                {/* Rings */}
                <div className="absolute top-10 end-1/4 w-40 h-40 rounded-full border-4 border-dashed border-[var(--brand-gold)]/30 animate-[spin_40s_linear_infinite]" />
                <div className="absolute bottom-24 start-8 w-24 h-24 rounded-full border-4 border-white/15" />
                {/* Floating icons */}
                <motion.div animate={{ y: [0, -18, 0], rotate: [0, 8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} className="absolute top-16 start-[8%] text-[var(--brand-gold)]/40 text-5xl"><FaHeart /></motion.div>
                <motion.div animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }} className="absolute top-1/2 end-[6%] text-white/20 text-6xl"><FaHandHoldingHeart /></motion.div>
                <motion.div animate={{ y: [0, -14, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} className="absolute bottom-1/3 start-[4%] text-white/20 text-4xl"><FaHandsHelping /></motion.div>
                <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 3, repeat: Infinity }} className="absolute top-24 end-[40%] text-[var(--brand-gold)] text-xl"><FaStar /></motion.div>
                <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0.6, 0.2] }} transition={{ duration: 4, repeat: Infinity, delay: 1 }} className="absolute top-1/2 start-[45%] text-white text-sm"><FaStar /></motion.div>
                <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 3.5, repeat: Infinity, delay: 2 }} className="absolute bottom-40 end-[30%] text-[var(--brand-gold)] text-lg"><FaStar /></motion.div>
            </div>

            {/* Red dotted band, like the posters' bottom half */}
            <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/3 bg-brand-dots opacity-90 [clip-path:polygon(0_18%,8%_10%,17%_16%,26%_8%,36%_14%,47%_6%,58%_13%,69%_7%,80%_15%,90%_9%,100%_14%,100%_100%,0_100%)]" />

            <div className="container mx-auto px-4 relative flex flex-col md:flex-row items-center gap-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="md:w-1/2 w-full"
                >
                    <div className="paper-torn px-6 py-8 md:px-10 md:py-10 -rotate-1">
                        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl leading-tight text-[var(--brand-navy)]">
                            {t.hero_title}
                        </h2>
                        <p className="mt-4 text-base md:text-lg text-gray-700 font-medium">
                            {t.hero_desc}
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 mt-8">
                        <Link to="/volunteer" className="btn-brand py-3 px-7 text-center text-lg">
                            {t.join_us}
                        </Link>
                        <Link to="/donate" className="btn-brand-light py-3 px-7 text-center text-lg">
                            {t.donate}
                        </Link>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.15 }}
                    className="md:w-1/2 w-full flex justify-center"
                >
                    <figure className="brand-tape bg-white p-3 pb-10 rotate-2 shadow-2xl max-w-md w-full">
                        <div className="relative">
                            <img
                                src={heroImage}
                                alt={t.hero_title}
                                className="w-full aspect-[3/2] object-cover"
                                fetchpriority="high"
                            />
                            {hasVideo && (
                                <button
                                    type="button"
                                    onClick={() => setPlaying(true)}
                                    aria-label={watchLabel}
                                    className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/25 hover:bg-black/40 transition group"
                                >
                                    <span className="relative flex items-center justify-center w-20 h-20 rounded-full bg-[var(--brand-red)] text-white text-2xl shadow-xl group-hover:scale-110 transition">
                                        <span className="absolute inset-0 rounded-full bg-[var(--brand-red)] opacity-50 animate-ping" />
                                        <FaPlay className="relative ms-1" />
                                    </span>
                                    <span className="relative text-white text-sm font-semibold drop-shadow">{watchLabel}</span>
                                </button>
                            )}
                        </div>
                    </figure>
                </motion.div>
            </div>
            {playing && <VideoModal video={heroVideo} onClose={() => setPlaying(false)} />}
        </section>
    );
};

export default Hero;
