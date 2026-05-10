export const PRICE_OPTIONS = [
    { value: 'cheap', label: 'Hemat (< Rp 50rb / org)' },
    { value: 'moderate', label: 'Menengah (Rp 50rb - 150rb / org)' },
    { value: 'expensive', label: 'Premium (> Rp 150rb / org)' }
];

export const getPriceLabel = (priceRange?: string) => {
    switch (priceRange) {
        case 'cheap': return 'Hemat';
        case 'moderate': return 'Menengah';
        case 'expensive': return 'Premium';
        default: return 'Tidak Diketahui';
    }
};
