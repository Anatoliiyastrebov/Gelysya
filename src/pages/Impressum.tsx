import { Link } from 'react-router-dom';
import { t } from '../utils/i18n';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import './Impressum.css';

export const Impressum = () => {
  const { lang } = useLanguage();
  
  return (
    <div className="impressum-page">
      <header className="impressum-header">
        <Link to="/" className="logo-link">
          <img src="/logo.svg" alt="Wellness Logo" className="header-logo" />
        </Link>
        <div className="impressum-header-right">
          <LanguageSwitcher />
        </div>
      </header>
      
      <main className="impressum-content">
        <h1>{t('impressum.title', lang)}</h1>
        
        <section className="impressum-section">
          <h2>{t('impressum.owner', lang)}</h2>
          <p><strong>{t('impressum.name', lang)}</strong></p>
          <p>{t('impressum.profession', lang)}</p>
        </section>
        
        <section className="impressum-section">
          <h2>{t('impressum.contact', lang)}</h2>
          <p>{t('impressum.contactTextRu', lang)}</p>
          <p>{t('impressum.contactTextEn', lang)}</p>
        </section>
        
        <section className="impressum-section">
          <h2>{t('impressum.dataProtection', lang)}</h2>
          <p>{t('impressum.dataProtectionText', lang)}</p>
        </section>
        
        <section className="impressum-section">
          <h2>{t('impressum.dataCollection', lang)}</h2>
          <p>{t('impressum.dataCollectionText', lang)}</p>
        </section>
        
        <section className="impressum-section">
          <h2>{t('impressum.dataStorage', lang)}</h2>
          <p>{t('impressum.dataStorageText', lang)}</p>
        </section>
        
        <section className="impressum-section">
          <h2>{t('impressum.rights', lang)}</h2>
          <p>{t('impressum.rightsText', lang)}</p>
        </section>
        
      </main>
    </div>
  );
};

