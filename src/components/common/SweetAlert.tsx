import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

// Lokali Brand Identity Palette
const brandColors = {
    dark: '#2c1e16',      // Brand Dark
    navy: '#1a1a2e',      // Brand Navy (Deep & Premium)
    terracotta: '#E8A87C', // Brand Terracotta (Warm Accent)
    cream: '#F5E6D3',     // Brand Cream (Light Surface)
    mid: '#8B5E3C'        // Brand Mid (Subtle Text)
};

export const AdminSwal = MySwal.mixin({
    customClass: {
        popup: 'rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-[#2c1e16]/5 p-8',
        title: 'text-2xl font-black font-heading text-[#2c1e16] tracking-tight',
        htmlContainer: 'text-[#8B5E3C] font-medium leading-relaxed mt-4',
        confirmButton: 'px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-[#1a1a2e] bg-[#E8A87C] hover:bg-[#2c1e16] hover:text-[#F5E6D3] shadow-xl shadow-[#E8A87C]/20 transition-all transform active:scale-95 mx-2',
        cancelButton: 'px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-[#2c1e16] bg-[#2c1e16]/5 hover:bg-[#2c1e16]/10 transition-all transform active:scale-95 mx-2',
        actions: 'mt-8',
        input: 'rounded-2xl border-[#2c1e16]/10 focus:ring-[#E8A87C] focus:border-[#E8A87C] bg-[#F5E6D3]/50 p-4 font-medium text-[#2c1e16]',
    },
    buttonsStyling: false,
    background: brandColors.cream,
    color: brandColors.dark,
    showClass: {
        popup: 'animate-fade-in-up'
    },
    hideClass: {
        popup: 'animate-fade-out-down'
    }
});

/**
 * "Flying Notification" Toast - UI/UX Pro Max Edition
 * Features: Floating center-top position, glassmorphism, brand navy theme, custom slide animations
 */
export const Toast = Swal.mixin({
    toast: true,
    position: 'top', // Center-top "Flying" position
    showConfirmButton: false,
    timer: 4000,
    timerProgressBar: true,
    background: brandColors.navy,
    color: brandColors.cream,
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
    },
    customClass: {
        popup: 'rounded-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border border-white/10 backdrop-blur-md bg-[#1a1a2e]/90 flex items-center px-6 py-4 mt-8 mx-auto max-w-[400px]',
        title: 'text-xs font-black text-[#F5E6D3] ml-3 tracking-widest uppercase',
        timerProgressBar: 'bg-[#E8A87C]', // Terracotta progress bar
    },
    showClass: {
        popup: 'animate-slide-in-down'
    },
    hideClass: {
        popup: 'animate-slide-out-up'
    }
});
