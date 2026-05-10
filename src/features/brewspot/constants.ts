export const CATEGORIZED_FACILITIES = {
    "Dasar": ["Wifi", "Toilet", "Parkir", "Musholla", "Indoor (AC)"],
    "Area": ["Outdoor Area", "Smoking Area", "Non-Smoking", "Ramah Hewan"],
    "Produktivitas": ["Stop Kontak", "Ruang Meeting", "Creative Hub"],
    "Layanan & Hiburan": ["QRIS / Digital Payment", "Live Music", "Area Bermain", "Ramah Disabilitas", "Dekat Transportasi Publik"]
} as const;

export const BREWSPOT_FACILITIES = Object.values(CATEGORIZED_FACILITIES).flat().sort();
