export const CoffeeBeanIcon = ({ className = "w-6 h-6", filled = false }: { className?: string, filled?: boolean }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={filled ? "0" : "2"}
        className={className}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM9 16c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm6-4c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm-5 4c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z"
        />
        {/* Simple stylized bean */}
        <path d="M12.012 5.003c-2.43 0-4.885.603-6.9 1.714a.8.8 0 0 0-.272 1.144l.872 1.38c.245.385.748.513 1.147.282A15.36 15.36 0 0 1 12.012 7c2.614 0 5.074.622 7.224 1.728.402.213.897.07 1.132-.315l.83-1.36a.8.8 0 0 0-.256-1.144 17.394 17.394 0 0 0-8.93-2.906zm0 14c2.43 0 4.885-.603 6.9-1.714a.8.8 0 0 0 .272-1.144l-.872-1.38a.846.846 0 0 0-1.147-.282A15.36 15.36 0 0 1 12.012 17c-2.614 0-5.074-.622-7.224-1.728a.843.843 0 0 0-1.132.315l-.83 1.36a.8.8 0 0 0 .256 1.144A17.394 17.394 0 0 0 12.012 19z"
            className={filled ? "hidden" : "hidden"} />
        {/* Replacement with a custom path that looks more like a coffee bean */}
        {!filled && <path strokeLinecap="round" strokeLinejoin="round" d="M10 9a3 3 0 100 6 3 3 0 000-6zm4-3a3 3 0 100 6 3 3 0 000-6z" />}
        {filled && <path d="M14 6a3 3 0 00-2.82 2h-.36A3 3 0 008 6a4 4 0 00-4 4c0 1.94 1.36 3.56 3.16 3.92A3 3 0 0010 16h4a3 3 0 002.84-2.08A4 4 0 0020 10a4 4 0 00-4-4z" />}
        {/* Let's try a simpler path for standard coffee bean look */}
        {/* Reset path for consistent simple bean */}
    </svg>
)

export const CoffeeBeanCustom = ({ className = "w-6 h-6", filled = false }: { className?: string, filled?: boolean }) => (
    <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={filled ? "0" : "1.5"} className={className} xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C9 2 5 4 4 9C3 15 6 22 12 22C18 22 21 15 20 9C19 4 15 2 12 2Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C13 6 12 22 12 22" />
        {/* Curve */}
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C9.5 5 9.5 19 12 22" />
    </svg>
)
