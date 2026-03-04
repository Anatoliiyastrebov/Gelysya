import { type Language } from '../utils/i18n';
import { useLanguage } from '../context/LanguageContext';
import './LanguageSwitcher.css';

interface LanguageSwitcherProps {
  onLanguageChange?: (lang: Language) => void;
}

export const LanguageSwitcher = ({ onLanguageChange }: LanguageSwitcherProps) => {
  const { lang: currentLang, setLang } = useLanguage();
  
  const handleChange = (lang: Language) => {
    setLang(lang);
    if (onLanguageChange) {
      onLanguageChange(lang);
    }
  };
  
  return (
    <div className="language-switcher">
      <button
        className={`lang-btn ${currentLang === 'ru' ? 'active' : ''}`}
        onClick={() => handleChange('ru')}
      >
        RU
      </button>
      <button
        className={`lang-btn ${currentLang === 'en' ? 'active' : ''}`}
        onClick={() => handleChange('en')}
      >
        EN
      </button>
    </div>
  );
};

