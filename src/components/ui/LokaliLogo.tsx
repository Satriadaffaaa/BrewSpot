import React from 'react';

interface LokaliLogoProps {
  variant?: 'full' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  theme?: 'dark' | 'light'; // dark means for dark backgrounds (light text), light means for light backgrounds (dark text)
  className?: string;
}

const sizeMap = {
  sm: { full: { width: 120 }, icon: { width: 32 } },
  md: { full: { width: 160 }, icon: { width: 44 } },
  lg: { full: { width: 220 }, icon: { width: 64 } },
};

export function LokaliLogo({ variant = 'full', size = 'md', theme = 'light', className = '' }: LokaliLogoProps) {
  const dims = sizeMap[size][variant];

  if (variant === 'icon') {
    return (
        <svg 
            width={dims.width} 
            viewBox="0 0 160 180" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <path d="M124 0H36C16.1177 0 0 16.1177 0 36V144C0 163.882 16.1177 180 36 180H124C143.882 180 160 163.882 160 144V36C160 16.1177 143.882 0 124 0Z" fill="#FF6B35"/>
            <path d="M80 144C109.823 144 134 119.823 134 90C134 60.1766 109.823 36 80 36C50.1766 36 26 60.1766 26 90C26 119.823 50.1766 144 80 144Z" stroke="#F0EDE8" strokeWidth="7.5"/>
            <path d="M80 36V51" stroke="#F0EDE8" strokeWidth="5" strokeLinecap="round"/>
            <path d="M80 129V144" stroke="#F0EDE8" strokeWidth="5" strokeLinecap="round"/>
            <path d="M26 90H41" stroke="#F0EDE8" strokeWidth="5" strokeLinecap="round"/>
            <path d="M119 90H134" stroke="#F0EDE8" strokeWidth="5" strokeLinecap="round"/>
            <path opacity="0.5" d="M41 52L50 61" stroke="#F0EDE8" strokeWidth="2.5" strokeLinecap="round"/>
            <path opacity="0.5" d="M110 52L119 61" stroke="#F0EDE8" strokeWidth="2.5" strokeLinecap="round"/>
            <path opacity="0.5" d="M41 128L50 119" stroke="#F0EDE8" strokeWidth="2.5" strokeLinecap="round"/>
            <path opacity="0.5" d="M110 128L119 119" stroke="#F0EDE8" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M80 60C66 60 54 72 54 86C54 103 80 122 80 122C80 122 106 103 106 86C106 72 94 60 80 60Z" fill="#0F0F1A"/>
            <path d="M80 94C85.5228 94 90 89.5228 90 84C90 78.4772 85.5228 74 80 74C74.4772 74 70 78.4772 70 84C70 89.5228 74.4772 94 80 94Z" fill="#FF6B35"/>
        </svg>
    )
  }

  // Full Logo
  const isDark = theme === 'dark';
  const mainFill = isDark ? "#F0EDE8" : "#0F0F1A";
  const innerPinFill = isDark ? "#0F0F1A" : "#F0EDE8";
  const opacityValue = isDark ? "0.45" : "0.35";

  return (
    <svg 
        width={dims.width} 
        viewBox="0 0 378 110" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <path d="M6.15669 87V21.5455H19.9955V75.5902H48.0566V87H6.15669Z" fill={mainFill}/>
        <path d="M112 99C136.301 99 156 79.3005 156 55C156 30.6995 136.301 11 112 11C87.6995 11 68 30.6995 68 55C68 79.3005 87.6995 99 112 99Z" stroke={mainFill} strokeWidth="7"/>
        <path d="M112 11V23" stroke={mainFill} strokeWidth="4" strokeLinecap="round"/>
        <path d="M112 87V99" stroke={mainFill} strokeWidth="4" strokeLinecap="round"/>
        <path d="M68 55H80" stroke={mainFill} strokeWidth="4" strokeLinecap="round"/>
        <path d="M144 55H156" stroke={mainFill} strokeWidth="4" strokeLinecap="round"/>
        <path opacity={opacityValue} d="M81 24L89 32" stroke={mainFill} strokeWidth="2" strokeLinecap="round"/>
        <path opacity={opacityValue} d="M135 24L143 32" stroke={mainFill} strokeWidth="2" strokeLinecap="round"/>
        <path opacity={opacityValue} d="M81 86L89 78" stroke={mainFill} strokeWidth="2" strokeLinecap="round"/>
        <path opacity={opacityValue} d="M135 86L143 78" stroke={mainFill} strokeWidth="2" strokeLinecap="round"/>
        <path d="M112 31C99 31 89 41 89 53C89 68 112 85 112 85C112 85 135 68 135 53C135 41 125 31 112 31Z" fill="#FF6B35"/>
        <path d="M112 61C116.971 61 121 56.9706 121 52C121 47.0294 116.971 43 112 43C107.029 43 103 47.0294 103 52C103 56.9706 107.029 61 112 61Z" fill={innerPinFill}/>
        <path d="M177.689 87V21.5455H191.528V50.4055H192.391L215.945 21.5455H232.533L208.243 50.853L232.82 87H216.265L198.335 60.0895L191.528 68.3991V87H177.689ZM251.022 87H236.192L258.788 21.5455H276.622L299.186 87H284.356L267.961 36.5028H267.449L251.022 87ZM250.095 61.272H285.123V72.0746H250.095V61.272ZM307.064 87V21.5455H320.903V75.5902H348.964V87H307.064ZM371.967 21.5455V87H358.128V21.5455H371.967Z" fill={mainFill}/>
    </svg>
  );
}
