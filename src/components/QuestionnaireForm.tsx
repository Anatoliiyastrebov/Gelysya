import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getQuestionnaireById, type Questionnaire, type QuestionField } from '../data/questionnaires';
import { t } from '../utils/i18n';
import { useLanguage } from '../context/LanguageContext';
import { sendToTelegram, exportToJSON } from '../utils/telegram';
import { LanguageSwitcher } from './LanguageSwitcher';
import './QuestionnaireForm.css';

export const QuestionnaireForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { lang } = useLanguage();
  
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (id) {
      const q = getQuestionnaireById(id);
      setQuestionnaire(q || null);
    }
  }, [id]);

  // Загружаем сохранённые данные из localStorage при загрузке анкеты
  useEffect(() => {
    if (!id) return;
    const key = `questionnaire_${id}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as { formData?: Record<string, any>; consent?: boolean };
        if (parsed.formData) {
          setFormData(parsed.formData);
        }
        if (typeof parsed.consent === 'boolean') {
          setConsent(parsed.consent);
        }
      } catch {
        // игнорируем ошибки парсинга
      }
    }
  }, [id]);

  // Сохраняем данные формы и согласие в localStorage при каждом изменении
  useEffect(() => {
    if (!id) return;
    const key = `questionnaire_${id}`;
    const payload = { formData, consent };
    try {
      localStorage.setItem(key, JSON.stringify(payload));
    } catch {
      // если localStorage недоступен, просто ничего не делаем
    }
  }, [id, formData, consent]);
  
  if (!questionnaire) {
    return (
      <div className="form-container">
        <div className="error-message">{t('common.notFound', lang)}</div>
      </div>
    );
  }
  
  // Показываем все вопросы сразу на одной странице
  const allQuestions = getAllQuestions(questionnaire.questions);
  
  const handleInputChange = (fieldId: string, value: any) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [fieldId]: value
      };
      
      // Если значение изменилось на "нет", очищаем условные поля
      if (questionnaire) {
        const allQuestions = getAllQuestions(questionnaire.questions);
        const question = allQuestions.find(q => q.id === fieldId);
        if (question?.conditionalFields) {
          question.conditionalFields.forEach(cond => {
            if (value !== cond.condition.value) {
              // Очищаем условные поля, если условие не выполнено
              cond.fields.forEach(field => {
                delete newData[field.id];
              });
            }
          });
        }
      }
      
      return newData;
    });
    
    // Очищаем ошибку для этого поля
    if (errors[fieldId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };
  
  const validateForm = (): Record<string, string> => {
    const newErrors: Record<string, string> = {};
    
    const validateQuestion = (question: QuestionField) => {
      // Для составных полей (group) проверяем каждое поле отдельно
      if (question.type === 'group' && question.groupedFields) {
        question.groupedFields.forEach(field => {
          if (field.required && !formData[field.id]) {
            newErrors[field.id] = t('common.required', lang);
          }
        });
      } else if (question.required && !formData[question.id]) {
        // Проверяем основное поле
        newErrors[question.id] = t('common.required', lang);
      }
      
      // Для checkbox с "Другое" проверяем, что если выбрано "other", то заполнено поле "other"
      if (question.type === 'checkbox' && question.allowOther) {
        const selectedValues = Array.isArray(formData[question.id]) ? formData[question.id] : [];
        if (selectedValues.includes('other') && !formData[`${question.id}_other`]) {
          newErrors[`${question.id}_other`] = t('common.required', lang);
        }
      }
      
      // Для radio с "Другое" проверяем, что если выбрано "other", то заполнено поле "other"
      if (question.type === 'radio' && question.allowOther) {
        if (formData[question.id] === 'other' && !formData[`${question.id}_other`]) {
          newErrors[`${question.id}_other`] = t('common.required', lang);
        }
      }
      
      // Валидация Telegram
      if (question.id === 'contact_telegram' && formData[question.id]) {
        if (!validateTelegram(formData[question.id])) {
          newErrors[question.id] = t('common.invalidTelegram', lang);
        }
      }
      
      // Валидация Instagram
      if (question.id === 'contact_instagram' && formData[question.id]) {
        if (!validateInstagram(formData[question.id])) {
          newErrors[question.id] = t('common.invalidInstagram', lang);
        }
      }
      
      // Проверяем условные поля, если они должны быть показаны
      if (question.conditionalFields) {
        question.conditionalFields.forEach(cond => {
          const conditionValue = formData[cond.condition.fieldId];
          if (conditionValue === cond.condition.value) {
            cond.fields.forEach(field => {
              if (field.required && !formData[field.id]) {
                newErrors[field.id] = t('common.required', lang);
              }
              // Рекурсивно проверяем вложенные условные поля
              validateQuestion(field);
            });
          }
        });
      }
    };
    
    allQuestions.forEach(validateQuestion);
    
    setErrors(newErrors);
    return newErrors;
  };
  
  // Функция для прокрутки к первой ошибке
  const scrollToFirstError = (errorKeys: string[]) => {
    if (errorKeys.length === 0) return;
    
    // Небольшая задержка, чтобы DOM обновился
    setTimeout(() => {
      for (const errorId of errorKeys) {
        const errorElement = document.getElementById(errorId) || 
                           document.querySelector(`[data-field-id="${errorId}"]`) ||
                           document.querySelector(`[name="${errorId}"]`);
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Фокусируемся на поле, если это input
          if (errorElement instanceof HTMLInputElement || 
              errorElement instanceof HTMLTextAreaElement || 
              errorElement instanceof HTMLSelectElement) {
            errorElement.focus();
          }
          break;
        }
      }
    }, 100);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!consent) {
      alert(t('common.consentRequired', lang));
      // Прокрутка к чекбоксу согласия
      const consentElement = document.getElementById('consent-checkbox');
      if (consentElement) {
        consentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    const validationErrors = validateForm();
    const errorKeys = Object.keys(validationErrors);
    
    if (errorKeys.length > 0) {
      scrollToFirstError(errorKeys);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Экспортируем в JSON
      const jsonData = exportToJSON(questionnaire.id, formData);
      console.log('Form data (JSON):', jsonData);
      
      // Отправляем в Telegram
      const success = await sendToTelegram(questionnaire.id, formData);
      
      if (success) {
        // очищаем сохранённые данные для этой анкеты
        try {
          localStorage.removeItem(`questionnaire_${questionnaire.id}`);
        } catch {
          // игнорируем ошибки
        }
        alert(t('common.success', lang));
        navigate('/');
      } else {
        alert(t('common.error', lang));
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert(t('common.error', lang));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="form-container">
      <header className="form-header">
        <Link to="/" className="logo-link">
          <img src="/logo.svg" alt="Wellness Logo" className="header-logo" />
        </Link>
        <div className="form-header-right">
          <LanguageSwitcher />
        </div>
      </header>
      
      <main className="form-content">
        <div className="form-title-section">
          <h1>{questionnaire.name[lang]}</h1>
        </div>
        
        <form className="questionnaire-form" onSubmit={handleSubmit}>
          {allQuestions.map(question => (
            <QuestionFieldComponent
              key={question.id}
              question={question}
              value={formData[question.id]}
              onChange={(value) => handleInputChange(question.id, value)}
              onFieldChange={handleInputChange}
              formData={formData}
              errors={errors}
              error={errors[question.id]}
              lang={lang}
            />
          ))}
          
          <div className="consent-section" id="consent-checkbox">
            <label className="consent-label">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                required
              />
              <span>{t('common.consent', lang)}</span>
            </label>
          </div>
          
          <div className="form-navigation">
            <button
              type="submit"
              className="nav-button submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? t('common.submitting', lang) : t('common.submit', lang)}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

// Компонент для отображения поля вопроса
interface QuestionFieldProps {
  question: QuestionField;
  value: any;
  onChange: (value: any) => void;
  onFieldChange?: (fieldId: string, value: any) => void;
  formData: Record<string, any>;
  errors?: Record<string, string>;
  error?: string;
  lang: 'ru' | 'en';
}

const QuestionFieldComponent: React.FC<QuestionFieldProps> = ({
  question,
  value,
  onChange,
  onFieldChange,
  formData,
  errors,
  error,
  lang
}) => {
  const [fileList, setFileList] = useState<File[]>([]);
  const label = (question.labelEn && lang === 'en') ? question.labelEn : question.label;
  const placeholder = (question.placeholderEn && lang === 'en') ? question.placeholderEn : question.placeholder;
  
  // Проверяем, нужно ли показывать условные поля
  const conditionalFields = question.conditionalFields?.find(cond => {
    const conditionValue = formData[cond.condition.fieldId];
    return conditionValue === cond.condition.value;
  });
  
  const showConditionalFields = !!conditionalFields;
  
  const renderField = () => {
    switch (question.type) {
      case 'text':
        const isTelegramField = question.id === 'contact_telegram';
        const isInstagramField = question.id === 'contact_instagram';
        
        return (
          <div className="text-input-wrapper">
            <input
              type="text"
              id={question.id}
              value={value || ''}
              onChange={(e) => {
                let inputValue = e.target.value;
                // Автоматически добавляем @ для Telegram
                if (isTelegramField && inputValue && !inputValue.startsWith('@')) {
                  inputValue = '@' + inputValue.replace(/^@+/, '');
                }
                // Убираем @ для Instagram
                if (isInstagramField && inputValue.startsWith('@')) {
                  inputValue = inputValue.replace(/^@+/, '');
                }
                onChange(inputValue);
              }}
              placeholder={placeholder}
              className={`form-input ${errors?.[question.id] ? 'error' : ''}`}
            />
            {isTelegramField && value && (
              <div className={`field-hint ${validateTelegram(value) ? 'hint-success' : 'hint-error'}`}>
                {validateTelegram(value) ? t('common.telegramHintOk', lang) : t('common.telegramHintBad', lang)}
              </div>
            )}
            {isInstagramField && value && (
              <div className={`field-hint ${validateInstagram(value) ? 'hint-success' : 'hint-error'}`}>
                {validateInstagram(value) ? t('common.instagramHintOk', lang) : t('common.instagramHintBad', lang)}
              </div>
            )}
          </div>
        );
      
      case 'number':
        return (
          <div className="number-input-wrapper">
            <input
              type="number"
              id={question.id}
              value={value || ''}
              onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
              placeholder={placeholder}
              className="form-input"
              min={question.min}
              max={question.max}
            />
            {question.unit && <span className="input-unit">{question.unit}</span>}
          </div>
        );
      
      case 'group':
        return (
          <div className="grouped-fields">
            {question.groupedFields?.map(field => (
              <div key={field.id} className="grouped-field">
                {(() => {
                  const fieldLabel = (field.labelEn && lang === 'en') ? field.labelEn : field.label;
                  return (
                <label htmlFor={field.id} className="grouped-field-label">
                  {fieldLabel}
                  {field.required && <span className="required">*</span>}
                </label>
                  );
                })()}
                {field.type === 'text' ? (
                  <input
                    type="text"
                    id={field.id}
                    value={formData[field.id] || ''}
                    onChange={(e) => {
                      if (onFieldChange) {
                        onFieldChange(field.id, e.target.value);
                      }
                    }}
                    placeholder={(field.placeholderEn && lang === 'en') ? field.placeholderEn : field.placeholder}
                    className={`form-input ${errors?.[field.id] ? 'error' : ''}`}
                  />
                ) : (
                  <div className="number-input-wrapper">
                    <input
                      type="number"
                      id={field.id}
                      value={formData[field.id] || ''}
                      onChange={(e) => {
                        if (onFieldChange) {
                          onFieldChange(field.id, e.target.value ? Number(e.target.value) : '');
                        }
                      }}
                      placeholder={(field.placeholderEn && lang === 'en') ? field.placeholderEn : field.placeholder}
                      className={`form-input ${errors?.[field.id] ? 'error' : ''}`}
                      min={field.unit === 'месяцев' ? 0 : field.unit === 'лет' ? 1 : 0}
                      max={field.unit === 'месяцев' ? 12 : undefined}
                    />
                    {field.unit && <span className="input-unit">{field.unit}</span>}
                  </div>
                )}
                {errors?.[field.id] && (
                  <div className="error-message">{errors[field.id]}</div>
                )}
              </div>
            ))}
          </div>
        );
      
      case 'textarea':
        return (
          <textarea
            id={question.id}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="form-textarea"
            rows={4}
          />
        );
      
      case 'radio':
        const radioOtherSelected = value === 'other';
        const radioOtherValue = formData[`${question.id}_other`] || '';
        
        return (
          <div className="radio-group">
            {question.options?.map(option => (
              <React.Fragment key={option.value}>
                <label className="radio-label">
                  <input
                    type="radio"
                    name={question.id}
                    value={option.value}
                    checked={value === option.value}
                    onChange={(e) => {
                      onChange(e.target.value);
                      // Очищаем поле "Другое" при выборе другой опции
                      if (option.value !== 'other' && onFieldChange) {
                        onFieldChange(`${question.id}_other`, '');
                      }
                    }}
                  />
                  <span>{(option.labelEn && lang === 'en') ? option.labelEn : option.label}</span>
                </label>
                {option.hasOther && radioOtherSelected && (
                  <div className="other-input-wrapper">
                    <input
                      type="text"
                      value={radioOtherValue}
                      onChange={(e) => {
                        if (onFieldChange) {
                          onFieldChange(`${question.id}_other`, e.target.value);
                        }
                      }}
                      placeholder={
                        lang === 'en'
                          ? (question.otherLabelEn || 'Please specify')
                          : (question.otherLabel || 'Уточните')
                      }
                      className={`form-input other-input ${errors?.[`${question.id}_other`] ? 'error' : ''}`}
                    />
                    {errors?.[`${question.id}_other`] && (
                      <div className="error-message">{errors[`${question.id}_other`]}</div>
                    )}
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        );
      
      case 'checkbox':
        const selectedValues = Array.isArray(value) ? value : [];
        const hasOtherSelected = selectedValues.includes('other');
        const otherValue = formData[`${question.id}_other`] || '';
        
        return (
          <div className="checkbox-group">
            {question.options?.map(option => {
              const checked = selectedValues.includes(option.value);
              return (
                <React.Fragment key={option.value}>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      value={option.value}
                      checked={checked}
                      onChange={(e) => {
                        const current = Array.isArray(value) ? value : [];
                        if (e.target.checked) {
                          onChange([...current, option.value]);
                        } else {
                          onChange(current.filter(v => v !== option.value));
                          // Очищаем поле "Другое" при снятии галочки
                          if (option.value === 'other' && onFieldChange) {
                            onFieldChange(`${question.id}_other`, '');
                          }
                        }
                      }}
                    />
                    <span>{(option.labelEn && lang === 'en') ? option.labelEn : option.label}</span>
                  </label>
                  {option.hasOther && hasOtherSelected && (
                    <div className="other-input-wrapper">
                      <input
                        type="text"
                        value={otherValue}
                        onChange={(e) => {
                          if (onFieldChange) {
                            onFieldChange(`${question.id}_other`, e.target.value);
                          }
                        }}
                        placeholder={
                          lang === 'en'
                            ? (question.otherLabelEn || 'Other (please specify)')
                            : (question.otherLabel || 'Укажите другое')
                        }
                        className={`form-input other-input ${errors?.[`${question.id}_other`] ? 'error' : ''}`}
                      />
                      {errors?.[`${question.id}_other`] && (
                        <div className="error-message">{errors[`${question.id}_other`]}</div>
                      )}
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        );
      
      case 'select':
        return (
          <select
            id={question.id}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="form-select"
          >
            <option value="">{t('common.chooseOption', lang)}</option>
            {question.options?.map(option => (
              <option key={option.value} value={option.value}>
                {(option.labelEn && lang === 'en') ? option.labelEn : option.label}
              </option>
            ))}
          </select>
        );
      
      case 'file':
        return (
          <div className="file-upload">
            <input
              type="file"
              id={question.id}
              accept={question.accept === '*' ? undefined : question.accept}
              multiple={question.multiple}
              onChange={(e) => {
                try {
                  const files = Array.from(e.target.files || []);
                  
                  // Проверяем валидность файлов
                  const validFiles = files.filter(file => {
                    if (!file || file.size === 0) {
                      console.warn(`Skipping empty or invalid file: ${file?.name || 'unknown'}`);
                      return false;
                    }
                    // Проверяем размер файла (50MB лимит Telegram)
                    const MAX_SIZE = 50 * 1024 * 1024;
                    if (file.size > MAX_SIZE) {
                      const errorMsg = t('common.fileTooLarge', lang);
                      alert(`${file.name}: ${errorMsg}`);
                      return false;
                    }
                    return true;
                  });
                  
                  setFileList(validFiles);
                  
                  // Сохраняем массив File объектов для отправки в Telegram
                  // Важно: сохраняем именно массив File объектов, а не FileList
                  onChange(validFiles.length > 0 ? validFiles : null);
                  
                  if (validFiles.length !== files.length) {
                    console.warn(`Filtered out ${files.length - validFiles.length} invalid file(s)`);
                  }
                } catch (error) {
                  console.error('Error processing files:', error);
                  setFileList([]);
                  onChange(null);
                }
              }}
              className="file-input"
            />
            <label htmlFor={question.id} className="file-label">
              <img src="/file-upload-icon.svg" alt="Upload" className="file-upload-icon" />
              <span className="file-label-text">{t('common.fileLabelText', lang)}</span>
              <span className="file-label-hint">{t('common.fileLabelHint', lang)}</span>
            </label>
            {fileList.length > 0 && (
              <div className="file-list">
                {fileList.map((file, idx) => {
                  // Определяем иконку по типу файла
                  const getFileIcon = (fileName: string) => {
                    const ext = fileName.split('.').pop()?.toLowerCase();
                    if (['pdf'].includes(ext || '')) return '📄';
                    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext || '')) return '🖼️';
                    if (['doc', 'docx'].includes(ext || '')) return '📝';
                    if (['xls', 'xlsx'].includes(ext || '')) return '📊';
                    return '📎';
                  };
                  
                  return (
                    <div key={idx} className="file-item">
                      <span className="file-item-icon">{getFileIcon(file.name)}</span>
                      <span className="file-item-name" title={file.name}>{file.name}</span>
                      <span className="file-item-size">({(file.size / 1024).toFixed(1)} KB)</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };
  
  const isContactField = question.id === 'contact_telegram' || question.id === 'contact_instagram';
  
  return (
    <div className={`question-field ${isContactField ? 'contact-field' : ''}`}>
      <label htmlFor={question.id} className="question-label">
        {label}
        {question.required && <span className="required">*</span>}
      </label>
      {renderField()}
      {error && <div className="error-message">{error}</div>}
      
      {/* Условные поля */}
      {showConditionalFields && conditionalFields && (
        <div className="conditional-fields">
          {conditionalFields.fields.map(field => {
            // Проверяем, нужно ли показывать это поле (для вложенных условий)
            const fieldConditionalFields = field.conditionalFields?.find(cond => {
              const conditionValue = formData[cond.condition.fieldId];
              return conditionValue === cond.condition.value;
            });
            
            // Если у поля есть условные поля, но условие не выполнено, не показываем его
            if (field.conditionalFields && field.conditionalFields.length > 0 && !fieldConditionalFields) {
              return null;
            }
            
            return (
              <QuestionFieldComponent
                key={field.id}
                question={field}
                value={formData[field.id]}
                onChange={(val) => {
                  if (onFieldChange) {
                    onFieldChange(field.id, val);
                  }
                }}
                onFieldChange={onFieldChange}
                formData={formData}
                errors={errors}
                error={errors?.[field.id]}
                lang={lang}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

// Валидация Telegram username
function validateTelegram(username: string): boolean {
  if (!username) return false;
  // Telegram username должен начинаться с @ и содержать только буквы, цифры и подчеркивания
  // Длина от 5 до 32 символов (без @)
  const telegramRegex = /^@[a-zA-Z0-9_]{5,32}$/;
  return telegramRegex.test(username);
}

// Валидация Instagram username
function validateInstagram(username: string): boolean {
  if (!username) return false;
  // Instagram username: только буквы, цифры, точки и подчеркивания
  // Длина от 1 до 30 символов, не может начинаться или заканчиваться точкой
  const instagramRegex = /^[a-zA-Z0-9._]{1,30}$/;
  if (!instagramRegex.test(username)) return false;
  if (username.startsWith('.') || username.endsWith('.')) return false;
  if (username.includes('..')) return false;
  return true;
}

// Рекурсивная функция для получения всех вопросов (включая условные)
function getAllQuestions(questions: QuestionField[]): QuestionField[] {
  const all: QuestionField[] = [];
  
  questions.forEach(q => {
    // Для составных полей (group) не добавляем их в список шагов,
    // так как они отображаются как одно поле
    if (q.type !== 'group') {
      all.push(q);
    } else {
      // Для group полей добавляем их как один вопрос
      all.push(q);
    }
    // Условные поля добавляем в общий список, но они будут показываться динамически
    // Здесь мы их не добавляем, чтобы не дублировать
  });
  
  return all;
}

