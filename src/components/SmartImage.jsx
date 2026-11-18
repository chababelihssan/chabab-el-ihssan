import React, { useState } from 'react';

// بديل مباشر لوسم <img>: يعرض خلفية وامضة (img-skeleton) إلى أن تُحمَّل الصورة،
// ثم تظهر تدريجيًا. لا يضيف أي عنصر حول الصورة، فلا يتغيّر التخطيط.
const SmartImage = ({ className = '', onLoad, onError, ...props }) => {
    const [doneSrc, setDoneSrc] = useState(null);
    const loaded = doneSrc === props.src;

    return (
        <img
            loading="lazy"
            decoding="async"
            {...props}
            // الصورة المخزّنة في الكاش قد تكون جاهزة قبل ربط onLoad
            ref={(el) => { if (el && el.complete && el.naturalWidth > 0) setDoneSrc(props.src); }}
            onLoad={(e) => { setDoneSrc(props.src); if (onLoad) onLoad(e); }}
            onError={(e) => { setDoneSrc(props.src); if (onError) onError(e); }}
            className={`${className} ${loaded ? 'img-loaded' : 'img-skeleton'}`}
        />
    );
};

export default SmartImage;
