import React from 'react';

const AFPDLogo = ({
    className = '',
    compact = false,
    showTitle = true,
    showSubtitle = false,
    titleClassName = '',
    subtitleClassName = '',
}) => {
    return (
        <div className={`inline-flex items-center gap-3 ${className}`}>
            <div className={`${compact ? 'h-10 w-10 rounded-xl' : 'h-12 w-12 rounded-2xl'} relative overflow-hidden bg-gradient-to-br from-fuchsia-500 via-pink-500 to-violet-700 shadow-lg shadow-fuchsia-500/30`}>
                <svg className="h-full w-full text-white" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                    <circle cx="23" cy="13" r="4.2" fill="currentColor" />
                    <path
                        d="M17.5 33.4c0-5.6 2.2-10 5.5-10s5.5 4.4 5.5 10"
                        stroke="currentColor"
                        strokeWidth="3.2"
                        strokeLinecap="round"
                    />
                    <path
                        d="M9 28.5c5.8 8.4 15.4 10.4 27.6 5.9"
                        stroke="currentColor"
                        strokeWidth="3.2"
                        strokeLinecap="round"
                    />
                    <path
                        d="M12.3 20.3c4.9 4.3 10.3 5.4 16.2 3.2"
                        stroke="currentColor"
                        strokeWidth="3.2"
                        strokeLinecap="round"
                    />
                    <rect x="33.2" y="12.2" width="4.3" height="4.3" rx="1" fill="currentColor" />
                    <rect x="37.8" y="16.9" width="3.4" height="3.4" rx="0.8" fill="currentColor" opacity="0.85" />
                    <rect x="33.2" y="21.1" width="3.4" height="3.4" rx="0.8" fill="currentColor" opacity="0.7" />
                </svg>
            </div>
            {(showTitle || showSubtitle) && (
                <div className="leading-tight">
                    {showTitle && (
                        <p className={`${compact ? 'text-xl' : 'text-2xl'} font-extrabold tracking-tight text-fuchsia-700 ${titleClassName}`}>
                            AFPD
                        </p>
                    )}
                    {showSubtitle && (
                    <p className={`text-[11px] text-fuchsia-700/80 ${subtitleClassName}`}>
                        Association des Femmes a la Pointe du Digital
                    </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default AFPDLogo;
