import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

// Base configuration for standardizing SweetAlert across the app
// Adapting to the Coffee/Premium aesthetic
const themeColors = {
    primary: '#2c1e16', // Coffee
    accent: '#d97706',  // Amber
    success: '#10b981',
    danger: '#ef4444',
    background: '#ffffff',
    text: '#1f2937'
};

export const AdminSwal = MySwal.mixin({
    customClass: {
        popup: 'rounded-3xl shadow-2xl border border-neutral-100',
        title: 'text-2xl font-bold font-heading text-neutral-800',
        htmlContainer: 'text-neutral-500',
        confirmButton: 'px-6 py-3 rounded-xl font-bold text-white bg-[#2c1e16] hover:bg-[#4a342a] shadow-lg transition-transform active:scale-95 mx-2',
        cancelButton: 'px-6 py-3 rounded-xl font-bold text-neutral-500 bg-neutral-100 hover:bg-neutral-200 transition-transform active:scale-95 mx-2',
        input: 'rounded-xl border-neutral-300 focus:ring-primary focus:border-primary',
    },
    buttonsStyling: false, // vital to use customClass for buttons
    confirmButtonColor: themeColors.primary,
    cancelButtonColor: '#f3f4f6',
    background: themeColors.background,
    color: themeColors.text,
});

export const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
    },
    customClass: {
        popup: 'rounded-2xl shadow-xl border border-neutral-100 bg-white flex items-center p-4',
        title: 'text-sm font-bold text-neutral-800 ml-2'
    }
});
