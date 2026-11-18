import React from 'react';

// هيكل رمادي يومض إلى أن يجهز المحتوى. استعمله بأي حجم عبر className.
export const Skeleton = ({ className = '' }) => (
    <div aria-hidden="true" className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
);

// هيكل صفحة كاملة (عنوان + بطاقات) يظهر أثناء تحميل ملف الصفحة
export const PageSkeleton = () => (
    <div className="max-w-6xl mx-auto w-full px-4 py-12" role="status" aria-busy="true">
        <Skeleton className="h-10 w-1/3 mb-3" />
        <Skeleton className="h-4 w-2/3 mb-10" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[0, 1, 2].map((i) => (
                <div key={i} className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <Skeleton className="h-48 w-full rounded-none" />
                    <div className="p-6 space-y-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-4/5" />
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export default Skeleton;
