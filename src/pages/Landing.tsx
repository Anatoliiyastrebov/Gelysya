import React from 'react';
import { Link } from 'react-router-dom';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { QuestionnaireCard } from '../components/QuestionnaireCard';
import { t } from '../utils/i18n';
import { useLanguage } from '../context/LanguageContext';
import './Landing.css';

export const Landing: React.FC = () => {
  const { lang } = useLanguage();
  
  return (
    <div className="landing">
      <header className="landing-header">
        <Link to="/" className="logo-link">
          <img src="/logo.svg" alt="Wellness Logo" className="header-logo" />
        </Link>
        <LanguageSwitcher />
      </header>
      
      <main className="landing-content">
        <div className="landing-hero">
          <h1 className="landing-title">{t('common.welcome', lang)}</h1>
          <h2 className="landing-name">{t('common.title', lang)}</h2>
          <p className="landing-description">
            {t('common.description', lang).split('\n').map((line, i) => (
              <React.Fragment key={i}>
                {line}
                {i < t('common.description', lang).split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
          <p className="landing-signature">
            {t('common.signature', lang).split('\n').map((line, i) => (
              <React.Fragment key={i}>
                {line}
                {i < t('common.signature', lang).split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
          <p className="landing-description">
            {t('common.quickInfo', lang).split('\n').map((line, i) => (
              <React.Fragment key={i}>
                {line}
                {i < t('common.quickInfo', lang).split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        </div>
        
        <div className="questionnaires-grid">
          <QuestionnaireCard questionnaireId="children" />
          <QuestionnaireCard questionnaireId="female" />
          <QuestionnaireCard questionnaireId="male" />
        </div>
      </main>
      
      <footer className="landing-footer">
        <div className="footer-links">
          <Link to="/impressum" className="impressum-link">
            {t('impressum.title', lang)}
          </Link>
          <a href={`mailto:${t('impressum.email', lang)}`} className="impressum-link">
            {t('impressum.email', lang)}
          </a>
        </div>
      </footer>
    </div>
  );
};

