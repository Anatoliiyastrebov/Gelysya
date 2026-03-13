// Система интернационализации для поддержки RU/EN

export type Language = 'ru' | 'en';

export interface Translations {
  [key: string]: string | Translations;
}

// Все переводы
const translations: Record<Language, Translations> = {
  ru: {
    common: {
      welcome: 'Разберёмся, что происходит с вашим организмом.',
      title: 'Короткая анкета поможет понять:',
      description: 'где теряется энергия, какие дефициты могут быть и с чего лучше начать восстановление.',
      signature: '👩‍⚕️ Разбор делает провизор и специалист по восстановлению здоровья\nГелюся Фатхинурова',
      quickInfo: '⏱ Займёт всего 1–2 минуты\n🔒 Ответы конфиденциальны',
      next: 'Далее',
      back: 'Назад',
      submit: 'Отправить',
      submitting: 'Отправка...',
      yes: 'Да',
      no: 'Нет',
      required: 'Обязательное поле',
      selectLanguage: 'Язык',
      consent: 'Я согласен(а) на обработку персональных данных',
      consentRequired: 'Необходимо согласие на обработку данных',
      success: 'Анкета успешно отправлена!',
      error: 'Произошла ошибка при отправке',
      progress: 'Прогресс',
      of: 'из',
      notFound: 'Анкета не найдена',
      chooseOption: 'Выберите...',
      fileLabelText: 'Выберите файлы',
      fileLabelHint: '(любые форматы)',
      fileTooLarge: 'Файл слишком большой. Максимальный размер: 50MB',
      invalidTelegram: 'Неверный формат Telegram. Используйте: @username',
      invalidInstagram: 'Неверный формат Instagram. Используйте: username (без @)',
      telegramHintOk: '✓ Формат правильный',
      telegramHintBad: '⚠️ Формат: @username (5-32 символа)',
      instagramHintOk: '✓ Формат правильный',
      instagramHintBad: '⚠️ Формат: username без @ (1-30 символов)'
    },
    questionnaires: {
      children: 'Анкета для подростков',
      female: 'Женская анкета',
      male: 'Мужская анкета'
    },
    impressum: {
      title: 'Политика конфиденциальности',
      content: 'Информация о владельце сайта и обработке данных',
      owner: 'Владелец сайта',
      name: 'Фатхинурова Гелюся',
      profession: 'Wellness-консультант',
      contact: 'Контактная информация',
      contactTextRu: 'Для связи используйте форму обратной связи на главной странице или email.',
      contactTextEn: 'Use the feedback form on the main page or email for contact.',
      emailLabel: 'Email',
      email: 'Zi_gul@mail.ru',
      dataProtection: 'Защита персональных данных',
      dataProtectionText: 'Мы обрабатываем ваши персональные данные в соответствии с GDPR и другими применимыми законами о защите данных. Данные используются исключительно для консультационных целей и не передаются третьим лицам. Все данные хранятся в зашифрованном виде и обрабатываются с соблюдением конфиденциальности.',
      dataCollection: 'Сбор данных',
      dataCollectionText: 'Мы собираем только те данные, которые вы добровольно предоставляете при заполнении анкет. Это включает информацию о здоровье, контактные данные и другую информацию, необходимую для предоставления консультационных услуг.',
      dataStorage: 'Хранение данных',
      dataStorageText: 'Ваши данные хранятся на защищенных серверах и обрабатываются в соответствии с требованиями безопасности. Мы принимаем все необходимые меры для защиты ваших данных от несанкционированного доступа.',
      rights: 'Ваши права',
      rightsText: 'Вы имеете право на доступ, исправление, удаление и ограничение обработки ваших персональных данных. Вы также можете отозвать свое согласие на обработку данных в любое время. Для осуществления этих прав свяжитесь с нами.',
      back: 'Вернуться на главную'
    }
  },
  en: {
    common: {
      welcome: 'Let us understand what is happening with your body.',
      title: 'A short questionnaire helps identify:',
      description: 'where energy is being lost, which deficiencies may be present, and where recovery is best to begin.',
      signature: '👩‍⚕️ Review by a pharmacist and health recovery specialist\nGelusa Fatkhinurova',
      quickInfo: '⏱ Takes only 1-2 minutes\n🔒 Your answers are confidential',
      next: 'Next',
      back: 'Back',
      submit: 'Submit',
      submitting: 'Submitting...',
      yes: 'Yes',
      no: 'No',
      required: 'Required field',
      selectLanguage: 'Language',
      consent: 'I agree to the processing of personal data',
      consentRequired: 'Consent to data processing is required',
      success: 'Questionnaire submitted successfully!',
      error: 'An error occurred while submitting',
      progress: 'Progress',
      of: 'of',
      notFound: 'Questionnaire not found',
      chooseOption: 'Select...',
      fileLabelText: 'Choose files',
      fileLabelHint: '(any formats)',
      fileTooLarge: 'File is too large. Maximum size: 50MB',
      invalidTelegram: 'Invalid Telegram format. Use: @username',
      invalidInstagram: 'Invalid Instagram format. Use: username (without @)',
      telegramHintOk: '✓ Format is correct',
      telegramHintBad: '⚠️ Format: @username (5-32 characters)',
      instagramHintOk: '✓ Format is correct',
      instagramHintBad: '⚠️ Format: username without @ (1-30 characters)'
    },
    questionnaires: {
      children: 'Teen questionnaire',
      female: 'Female questionnaire',
      male: 'Male questionnaire'
    },
    impressum: {
      title: 'Privacy Policy',
      content: 'Information about the website owner and data processing',
      owner: 'Website Owner',
      name: 'Gelusa Fatkhinurova',
      profession: 'Wellness Consultant',
      contact: 'Contact Information',
      contactTextRu: 'Use the feedback form on the main page or email for contact.',
      contactTextEn: 'Contact us through the feedback form on the main page or by email.',
      emailLabel: 'Email',
      email: 'Zi_gul@mail.ru',
      dataProtection: 'Data Protection',
      dataProtectionText: 'We process your personal data in accordance with GDPR and other applicable data protection laws. Data is used solely for consultation purposes and is not shared with third parties. All data is stored in encrypted form and processed with confidentiality.',
      dataCollection: 'Data Collection',
      dataCollectionText: 'We only collect data that you voluntarily provide when filling out questionnaires. This includes health information, contact details, and other information necessary to provide consultation services.',
      dataStorage: 'Data Storage',
      dataStorageText: 'Your data is stored on secure servers and processed in accordance with security requirements. We take all necessary measures to protect your data from unauthorized access.',
      rights: 'Your Rights',
      rightsText: 'You have the right to access, correct, delete, and restrict the processing of your personal data. You can also withdraw your consent to data processing at any time. To exercise these rights, please contact us.',
      back: 'Back to Home'
    }
  }
};

// Функция для получения перевода
export function t(key: string, lang: Language = 'ru'): string {
  const keys = key.split('.');
  let value: any = translations[lang];
  
  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) {
      // Fallback to Russian if translation not found
      value = translations.ru;
      for (const k2 of keys) {
        value = value?.[k2];
      }
      break;
    }
  }
  
  return typeof value === 'string' ? value : key;
}

// Хук для получения текущего языка из localStorage
export function getLanguage(): Language {
  const saved = localStorage.getItem('language') as Language;
  return saved || 'ru';
}

// Сохранение языка
export function setLanguage(lang: Language): void {
  localStorage.setItem('language', lang);
}

