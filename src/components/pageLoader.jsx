import React from 'react';
import { Vortex } from 'react-loader-spinner';

const SFALogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 160" width="200" height="80" style={{ marginBottom: '20px' }}>
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#0A1628', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#112240', stopOpacity: 1 }} />
      </linearGradient>
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#D4A843', stopOpacity: 1 }} />
        <stop offset="50%" style={{ stopColor: '#F0C96B', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#B8922E', stopOpacity: 1 }} />
      </linearGradient>
      <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#1A3A6B', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#0D2347', stopOpacity: 1 }} />
      </linearGradient>
      <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="1.5" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="130%">
        <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000000" floodOpacity="0.4" />
      </filter>
    </defs>
    <rect x="0" y="0" width="400" height="160" rx="16" ry="16" fill="url(#bgGrad)" filter="url(#shadow)" />
    <line x1="0" y1="40" x2="400" y2="40" stroke="#1E3A5F" strokeWidth="0.5" opacity="0.4"/>
    <line x1="0" y1="120" x2="400" y2="120" stroke="#1E3A5F" strokeWidth="0.5" opacity="0.4"/>
    <line x1="120" y1="0" x2="120" y2="160" stroke="#1E3A5F" strokeWidth="0.5" opacity="0.4"/>
    <path d="M60,22 L95,22 L110,32 L110,88 C110,108 80,124 77.5,125.5 C75,124 45,108 45,88 L45,32 Z" fill="url(#shieldGrad)" stroke="url(#goldGrad)" strokeWidth="1.5" />
    <path d="M63,30 L92,30 L104,38 L104,87 C104,103 80,117 77.5,118 C75,117 51,103 51,87 L51,38 Z" fill="none" stroke="#1E4A8A" strokeWidth="0.8" opacity="0.6" />
    <rect x="45" y="22" width="65" height="5" rx="1" fill="url(#goldGrad)" filter="url(#goldGlow)" />
    <path d="M68,55 C68,50 73,47 78,47 C83,47 88,50 88,55 C88,60 83,62 78,62 C73,62 68,65 68,70 C68,75 73,78 78,78 C83,78 88,75 88,70" fill="none" stroke="url(#goldGrad)" strokeWidth="3" strokeLinecap="round" filter="url(#goldGlow)" />
    <line x1="45" y1="133" x2="110" y2="133" stroke="url(#goldGrad)" strokeWidth="1" opacity="0.5"/>
    <text x="130" y="82" fontFamily="'Georgia', 'Times New Roman', serif" fontSize="52" fontWeight="700" letterSpacing="6" fill="url(#goldGrad)" filter="url(#goldGlow)">SFA</text>
    <rect x="130" y="91" width="230" height="1.5" rx="1" fill="url(#goldGrad)" opacity="0.6" />
    <text x="131" y="115" fontFamily="'Georgia', 'Times New Roman', serif" fontSize="18" fontWeight="400" letterSpacing="14" fill="#8AACCF">BANK</text>
    <text x="131" y="136" fontFamily="'Georgia', 'Times New Roman', serif" fontSize="8.5" fontWeight="400" letterSpacing="3.5" fill="#3D6A9A" opacity="0.9">YOUR TRUST. OUR PRIORITY.</text>
  </svg>
);

const PageLoader = ({ text = "Loading..." }) => {
  return (
    <div style={styles.container}>
      <div style={styles.logoContainer}><SFALogo /></div>
      <Vortex 
        visible={true} 
        height="80" 
        width="80" 
        ariaLabel="vortex-loading" 
        wrapperStyle={{}} 
        wrapperClass="vortex-wrapper" 
        colors={['#D4A843', '#F0C96B', '#B8922E', '#D4A843', '#F0C96B', '#B8922E']} 
      />
      {text && <p style={styles.text}>{text}</p>}
    </div> 
  );
};

const styles = {
  container: { 
    display: 'flex', 
    flexDirection: 'column', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '100vh', 
    backgroundColor: '#0A1628', 
    padding: '20px' 
  },
  logoContainer: { 
    marginBottom: '30px', 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  text: { 
    marginTop: '20px', 
    color: '#8AACCF', 
    fontFamily: "'Georgia', 'Times New Roman', serif", 
    fontSize: '16px', 
    letterSpacing: '2px' 
  },
};

export default PageLoader;
