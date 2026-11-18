import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Hero from '../components/Hero';
import Mission from '../components/Mission';
import Programs from '../components/Programs';

import Impact from '../components/Impact';
import FeaturedCampaign from '../components/FeaturedCampaign';
import RamadanSection from '../components/RamadanSection';
import Branches from '../components/Branches';
import GetInvolved from '../components/GetInvolved';
import About from '../components/About';
import Testimonials from '../components/Testimonials';
import GalleryPreview from '../components/GalleryPreview';
import BeforeAfter from '../components/BeforeAfter';
import AchievementsMap from '../components/AchievementsMap';
import SocialFeed from '../components/SocialFeed';
import { motion } from 'framer-motion';

const Home = () => {
    const location = useLocation();

    useEffect(() => {
        if (location.state?.scrollTo) {
            const scroller = () => {
                const element = document.getElementById(location.state.scrollTo);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                    // Clean up state to prevent scrolling on reload? 
                    // Actually react router state persists, but usually we want it once.
                    // But it's fine for now.
                    window.history.replaceState({}, document.title);
                } else {
                    // Retry once in case of layout shift or lazy loading
                    setTimeout(() => {
                        const el = document.getElementById(location.state.scrollTo);
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                }
            };

            // Small timeout to ensure DOM is ready
            setTimeout(scroller, 100);
        }
    }, [location]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Hero />
            <RamadanSection />
            <About />
            <FeaturedCampaign />
            <Impact />
            <Mission />
            <Programs />
            <BeforeAfter />
            <AchievementsMap />
            <GalleryPreview />
            <Testimonials />
            <SocialFeed />
            <GetInvolved />
            <Branches />
        </motion.div>
    );
};

export default Home;
