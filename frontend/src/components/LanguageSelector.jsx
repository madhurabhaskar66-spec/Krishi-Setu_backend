import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export default function LanguageSelector() {
  const { i18n } = useTranslation();

  const changeLanguage = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '8px', zIndex: 100 }}>
      <Globe size={18} color="var(--brand-primary)" />
      <select 
        value={i18n.language.substring(0, 2)} 
        onChange={changeLanguage}
        className="input-glass"
        style={{ border: 'none', background: 'transparent', outline: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
      >
        <option value="en">English</option>
        <option value="hi">हिंदी (Hindi)</option>
        <option value="kn">ಕನ್ನಡ (Kannada)</option>
        <option value="te">తెలుగు (Telugu)</option>
        <option value="ta">தமிழ் (Tamil)</option>
        <option value="ml">മലയാളം (Malayalam)</option>
      </select>
    </div>
  );
}
