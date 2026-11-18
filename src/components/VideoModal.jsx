import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes } from 'react-icons/fa';

// Lecteur vidéo plein écran (fichier mp4 ou YouTube). Échap / clic dehors = fermer.
const VideoModal = ({ video, onClose }) => {
    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [onClose]);

    return createPortal(
        <div className="fixed inset-0 z-[120] bg-black/90 flex items-center justify-center p-4" onClick={onClose}>
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-3 rounded-full bg-white/10 hover:bg-red-600 text-white transition"
                aria-label="Close"
            >
                <FaTimes className="text-xl" />
            </button>
            <div className="w-full max-w-5xl aspect-video bg-black rounded-lg overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
                {video.youtubeId ? (
                    <iframe
                        className="w-full h-full"
                        src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0`}
                        title="Video"
                        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                        allowFullScreen
                    />
                ) : (
                    <video className="w-full h-full" src={video.src} poster={video.poster || undefined} controls autoPlay playsInline />
                )}
            </div>
        </div>,
        document.body
    );
};

export default VideoModal;
