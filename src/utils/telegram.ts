// Интеграция с Telegram Bot API
import { getQuestionnaireById, type QuestionField } from '../data/questionnaires';

const TELEGRAM_BOT_TOKEN = (import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '').trim();
const TELEGRAM_CHAT_ID = (import.meta.env.VITE_TELEGRAM_CHAT_ID || '').trim();

function hasTelegramConfig(): boolean {
  return Boolean(TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID);
}

type FileUploadStatus = 'uploading' | 'success' | 'error';

interface FileUploadProgressEvent {
  fieldId: string;
  fileName: string;
  status: FileUploadStatus;
}

interface SendToTelegramResult {
  success: boolean;
  error?: string;
}

interface PreparedFile {
  fieldId: string;
  file: File;
  fieldLabel: string;
  parentQuestionLabel?: string;
}

function extractFiles(value: any): File[] {
  if (!value) return [];
  if (value instanceof FileList) return Array.from(value);
  if (value instanceof File) return [value];
  if (Array.isArray(value)) return value.filter((item): item is File => item instanceof File);
  return [];
}

function isFileAnswerEmpty(value: any): boolean {
  return extractFiles(value).filter(file => file.size > 0).length === 0;
}

function collectRequiredFileFieldIds(
  fields: QuestionField[],
  formData: Record<string, any>,
  target = new Set<string>()
): Set<string> {
  fields.forEach(field => {
    if (field.type === 'file' && field.required) {
      target.add(field.id);
    }
    if (field.conditionalFields) {
      field.conditionalFields.forEach(cond => {
        const conditionValue = formData[cond.condition.fieldId];
        if (conditionValue === cond.condition.value) {
          collectRequiredFileFieldIds(cond.fields, formData, target);
        }
      });
    }
  });
  return target;
}

function getFieldContext(
  questionnaireId: string,
  fieldId: string
): { fieldLabel: string; parentQuestionLabel?: string } {
  const questionnaire = getQuestionnaireById(questionnaireId);
  if (!questionnaire) {
    return { fieldLabel: fieldId };
  }

  const findContext = (
    fields: QuestionField[],
    parentQuestionLabel?: string
  ): { fieldLabel: string; parentQuestionLabel?: string } | null => {
    for (const field of fields) {
      if (field.id === fieldId) {
        return { fieldLabel: field.label, parentQuestionLabel };
      }
      if (field.conditionalFields) {
        for (const cond of field.conditionalFields) {
          const found = findContext(cond.fields, field.label);
          if (found) return found;
        }
      }
    }
    return null;
  };

  return findContext(questionnaire.questions) || { fieldLabel: getQuestionLabel(fieldId, questionnaireId) };
}

function getQuestionNumberFromFieldId(fieldId: string): string | null {
  const match = fieldId.match(/^q(\d+)/i);
  return match?.[1] || null;
}

/**
 * Отправка файла в Telegram
 * Поддерживает все форматы файлов и правильно обрабатывает ошибки
 */
async function sendFileToTelegram(file: File, caption?: string): Promise<boolean> {
  try {
    // Проверка размера файла (Telegram лимит: 50MB для документов)
    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB в байтах
    if (file.size > MAX_FILE_SIZE) {
      console.error(`File ${file.name} is too large: ${(file.size / 1024 / 1024).toFixed(2)}MB (max: 50MB)`);
      return false;
    }
    
    // Проверка, что файл существует и не пустой
    if (!file || file.size === 0) {
      console.error(`File ${file.name} is empty or invalid`);
      return false;
    }
    
    const formData = new FormData();
    formData.append('chat_id', TELEGRAM_CHAT_ID);
    
    // Используем оригинальный файл с правильным именем и типом
    // Telegram автоматически определит тип файла по расширению
    formData.append('document', file, file.name);
    
    // Добавляем подпись, если она есть (максимум 1024 символа для Telegram)
    if (caption) {
      const truncatedCaption = caption.length > 1024 ? caption.substring(0, 1021) + '...' : caption;
      formData.append('caption', truncatedCaption);
    }
    
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument`;
    
    // Отправляем файл с таймаутом
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 минут таймаут
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const responseData = await response.json();
      
      if (!response.ok) {
        // Детальная обработка ошибок Telegram API
        if (responseData.error_code === 400) {
          console.error('Telegram API error (400): Bad Request -', responseData.description);
        } else if (responseData.error_code === 413) {
          console.error('Telegram API error (413): File too large -', responseData.description);
        } else if (responseData.error_code === 429) {
          console.error('Telegram API error (429): Rate limit exceeded -', responseData.description);
        } else {
          console.error('Telegram file upload error:', responseData);
        }
        return false;
      }
      
      if (responseData.ok && responseData.result) {
        console.log(`File sent successfully: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
        return true;
      } else {
        console.error('Unexpected response format:', responseData);
        return false;
      }
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        console.error(`Timeout while sending file ${file.name} to Telegram`);
      } else {
        throw fetchError;
      }
      return false;
    }
  } catch (error: any) {
    console.error(`Error sending file ${file.name} to Telegram:`, error);
    if (error.message) {
      console.error('Error details:', error.message);
    }
    return false;
  }
}

/**
 * Генерация PDF-файла с анкетой
 */
async function generateQuestionnairePDF(
  questionnaireId: string,
  formData: Record<string, any>
): Promise<File> {
  // Lazy-load html2pdf to keep initial app bundle smaller.
  const { default: html2pdf } = await import('html2pdf.js');

  const questionnaireNames: Record<string, string> = {
    children: 'Анкета для подростков',
    female: 'Женская анкета',
    male: 'Мужская анкета'
  };
  
  // Получаем фамилию для имени файла
  const surname = formData['q1_surname'] || '';
  const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  // Формируем имя файла: фамилия_дата.pdf
  // Очищаем фамилию от недопустимых символов для имени файла
  const cleanSurname = surname
    .trim()
    .replace(/[<>:"/\\|?*]/g, '') // Удаляем недопустимые символы
    .replace(/\s+/g, '_') // Заменяем пробелы на подчеркивания
    || 'Анкета'; // Fallback, если фамилии нет
  
  const fileName = `${cleanSurname}_${dateStr}.pdf`;
  
  // Создаем HTML-структуру для PDF
  const htmlContent = createQuestionnaireHTML(questionnaireId, formData, questionnaireNames);
  
  // Настройки для html2pdf
  const options = {
    margin: [15, 15, 15, 15] as [number, number, number, number],
    filename: fileName,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
  };
  
  // Генерируем PDF
  const pdfBlob = await html2pdf().set(options).from(htmlContent).outputPdf('blob');
  return new File([pdfBlob], fileName, { type: 'application/pdf' });
}

/**
 * Создание HTML-структуры для PDF
 */
function createQuestionnaireHTML(
  questionnaireId: string,
  formData: Record<string, any>,
  questionnaireNames: Record<string, string>
): string {
  const dateStr = new Date().toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  // Основная информация
  const name = formData['q1_name'] || '';
  const surname = formData['q1_surname'] || '';
  const age = formData['q1_age'] || '';
  const weight = formData['q1_weight'] || '';
  const height = formData['q1_height'] || '';
  
  // Обрабатываем остальные ответы
  const processedKeys = new Set(['q1_name', 'q1_surname', 'q1_age', 'q1_weight', 'q1_height', 'contact_telegram', 'contact_instagram']);
  
  // Определяем, с какого вопроса начинать нумерацию
  let startNumberingFrom = 'q1_weight_goal';
  if (questionnaireId === 'children') {
    startNumberingFrom = 'q2';
  }
  
  let questionNumber = 0;
  let shouldNumber = false;
  
  // Получаем все вопросы анкеты в правильном порядке
  const questionnaire = getQuestionnaireById(questionnaireId);
  const orderedQuestions: { id: string; label: string }[] = [];
  
  if (questionnaire) {
    const collectQuestions = (fields: QuestionField[]) => {
      fields.forEach(field => {
        orderedQuestions.push({ id: field.id, label: field.label });
        if (field.groupedFields) {
          field.groupedFields.forEach(subField => {
            orderedQuestions.push({ id: subField.id, label: subField.label });
          });
        }
        if (field.conditionalFields) {
          field.conditionalFields.forEach(cond => {
            const conditionValue = formData[cond.condition.fieldId];
            if (conditionValue === cond.condition.value) {
              collectQuestions(cond.fields);
            }
          });
        }
      });
    };
    collectQuestions(questionnaire.questions);
  }
  
  const numberingStartIndex = orderedQuestions.findIndex(q => q.id === startNumberingFrom);
  const questionOrderMap = new Map<string, number>();
  orderedQuestions.forEach((q, index) => {
    questionOrderMap.set(q.id, index);
  });
  
  // Сортируем ответы по порядку вопросов
  const sortedEntries = Object.entries(formData)
    .filter(([key, value]) => {
      return !processedKeys.has(key) && 
             value !== null && 
             value !== undefined && 
             value !== '' &&
             !key.endsWith('_other');
    })
    .sort(([keyA], [keyB]) => {
      const orderA = questionOrderMap.get(keyA) ?? 9999;
      const orderB = questionOrderMap.get(keyB) ?? 9999;
      return orderA - orderB;
    });
  
  // Формируем HTML для вопросов и ответов
  let questionsHTML = '';
  
  for (const [key, value] of sortedEntries) {
    const questionIndex = questionOrderMap.get(key) ?? -1;
    if (questionIndex >= numberingStartIndex && numberingStartIndex !== -1) {
      shouldNumber = true;
      questionNumber++;
    }
    
    const questionLabel = getQuestionLabel(key, questionnaireId);
    const numberedLabel = shouldNumber ? `${questionNumber}. ${questionLabel}` : questionLabel;
    
    let answerHTML = '';
    
    if (Array.isArray(value)) {
      const questionnaire = getQuestionnaireById(questionnaireId);
      const question = questionnaire?.questions.find(q => q.id === key);
      
      const values = value.filter(v => v !== 'other' && v !== 'none');
      if (values.length > 0) {
        if (question?.options) {
          const optionLabels = values.map(v => {
            const option = question.options?.find(opt => opt.value === v);
            return option ? option.label : v;
          });
          answerHTML = optionLabels.map(label => `<li>${escapeHtml(label)}</li>`).join('');
        } else {
          answerHTML = values.map(v => `<li>${escapeHtml(String(v))}</li>`).join('');
        }
      }
      if (value.includes('other') && formData[`${key}_other`]) {
        answerHTML += `<li><strong>Другое:</strong> ${escapeHtml(formData[`${key}_other`])}</li>`;
      }
      if (value.includes('none')) {
        answerHTML += '<li>Не беспокоит</li>';
      }
      if (answerHTML) {
        answerHTML = `<ul style="margin: 5px 0; padding-left: 25px;">${answerHTML}</ul>`;
      }
    } else if (value instanceof FileList || (Array.isArray(value) && value.length > 0 && value[0] instanceof File)) {
      const files = value instanceof FileList ? Array.from(value) : value;
      answerHTML = `<p style="margin: 5px 0;">📎 Загружено файлов: ${files.length}</p>`;
      const filesList = Array.from(files).map((file: File, i: number) => 
        `<p style="margin: 2px 0; padding-left: 20px; font-size: 10px; color: #666;">${i + 1}. ${escapeHtml(file.name)} (${(file.size / 1024).toFixed(1)} KB)</p>`
      ).join('');
      answerHTML += filesList;
    } else {
      const questionnaire = getQuestionnaireById(questionnaireId);
      const question = questionnaire?.questions.find(q => q.id === key);
      
      if (question?.options) {
        const option = question.options.find(opt => opt.value === value);
        answerHTML = `<p style="margin: 5px 0;">${escapeHtml(option ? option.label : String(value))}</p>`;
      } else {
        answerHTML = `<p style="margin: 5px 0;">${escapeHtml(String(value))}</p>`;
      }
    }
    
    questionsHTML += `
      <div style="margin-bottom: 20px; page-break-inside: avoid;">
        <h3 style="margin: 0 0 8px 0; font-size: 13px; font-weight: bold; color: #2c3e50;">${escapeHtml(numberedLabel)}</h3>
        <div style="margin-left: 15px; color: #34495e; font-size: 12px;">
          ${answerHTML || '<p style="margin: 5px 0; color: #999; font-style: italic;">Ответ не указан</p>'}
        </div>
      </div>
    `;
  }
  
  // Контактные данные
  const telegram = formData['contact_telegram'] || '';
  const instagram = formData['contact_instagram'] || '';
  
  let contactsHTML = '';
  if (telegram) {
    contactsHTML += `<p style="margin: 5px 0;"><strong>Telegram:</strong> ${escapeHtml(telegram)}</p>`;
  }
  if (instagram) {
    contactsHTML += `<p style="margin: 5px 0;"><strong>Instagram:</strong> @${escapeHtml(instagram)}</p>`;
  }
  if (!telegram && !instagram) {
    contactsHTML = '<p style="margin: 5px 0; color: #999;">Не указаны</p>';
  }
  
  // Формируем полный HTML
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: 'Arial', 'Helvetica', sans-serif;
          font-size: 12px;
          line-height: 1.6;
          color: #2c3e50;
          padding: 0;
          margin: 0;
        }
        .header {
          text-align: center;
          margin-bottom: 25px;
          padding-bottom: 15px;
          border-bottom: 2px solid #3498db;
        }
        .header h1 {
          margin: 0 0 10px 0;
          font-size: 20px;
          color: #2c3e50;
          font-weight: bold;
        }
        .header .date {
          font-size: 11px;
          color: #7f8c8d;
        }
        .section {
          margin-bottom: 25px;
        }
        .section-title {
          font-size: 14px;
          font-weight: bold;
          color: #2c3e50;
          margin-bottom: 12px;
          padding-bottom: 5px;
          border-bottom: 1px solid #ecf0f1;
        }
        .info-item {
          margin: 5px 0;
          padding-left: 10px;
        }
        .divider {
          height: 1px;
          background: #ecf0f1;
          margin: 20px 0;
        }
        .footer {
          margin-top: 30px;
          padding-top: 15px;
          border-top: 1px solid #ecf0f1;
          text-align: center;
          font-size: 9px;
          color: #95a5a6;
          font-style: italic;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${escapeHtml(questionnaireNames[questionnaireId] || questionnaireId)}</h1>
        <div class="date">Дата заполнения: ${escapeHtml(dateStr)}</div>
      </div>
      
      ${name || surname || age || weight || height ? `
      <div class="section">
        <div class="section-title">👤 Основная информация</div>
        ${name ? `<div class="info-item"><strong>Имя:</strong> ${escapeHtml(name)}</div>` : ''}
        ${surname ? `<div class="info-item"><strong>Фамилия:</strong> ${escapeHtml(surname)}</div>` : ''}
        ${age ? `<div class="info-item"><strong>Возраст:</strong> ${escapeHtml(String(age))}</div>` : ''}
        ${weight ? `<div class="info-item"><strong>Вес:</strong> ${escapeHtml(String(weight))} кг</div>` : ''}
        ${height ? `<div class="info-item"><strong>Рост:</strong> ${escapeHtml(String(height))} см</div>` : ''}
      </div>
      <div class="divider"></div>
      ` : ''}
      
      <div class="section">
        <div class="section-title">📋 Ответы на вопросы</div>
        ${questionsHTML}
      </div>
      
      <div class="divider"></div>
      
      <div class="section">
        <div class="section-title">📞 Контактные данные для связи</div>
        ${contactsHTML}
      </div>
      
      <div class="footer">
        Анкета заполнена через сайт
      </div>
    </body>
    </html>
  `;
  
  return html;
}

/**
 * Экранирование HTML для безопасности
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Отправка данных анкеты в Telegram
 * @param questionnaireId - ID анкеты
 * @param formData - Данные формы
 * @returns Promise<boolean> - успешность отправки
 */
export async function sendToTelegram(
  questionnaireId: string,
  formData: Record<string, any>,
  onFileProgress?: (event: FileUploadProgressEvent) => void
): Promise<SendToTelegramResult> {
  if (!hasTelegramConfig()) {
    console.error(
      'Telegram is not configured. Set VITE_TELEGRAM_BOT_TOKEN and VITE_TELEGRAM_CHAT_ID in your .env file.'
    );
    return { success: false, error: 'Ошибка загрузки файла, попробуйте ещё раз' };
  }

  try {
    const questionnaire = getQuestionnaireById(questionnaireId);
    if (!questionnaire) {
      return { success: false, error: 'Ошибка загрузки файла, попробуйте ещё раз' };
    }

    const requiredFileFieldIds = collectRequiredFileFieldIds(questionnaire.questions, formData);
    for (const fieldId of requiredFileFieldIds) {
      if (isFileAnswerEmpty(formData[fieldId])) {
        return { success: false, error: 'Пожалуйста, загрузите хотя бы один файл' };
      }
    }

    const files: PreparedFile[] = [];

    for (const [key, value] of Object.entries(formData)) {
      const fieldFiles = extractFiles(value).filter(file => file.size > 0);
      if (fieldFiles.length === 0) continue;

      if (fieldFiles.length > 5) {
        return { success: false, error: 'Можно загрузить максимум 5 файлов' };
      }

      const fieldContext = getFieldContext(questionnaireId, key);
      for (const file of fieldFiles) {
        if (file.size > 50 * 1024 * 1024) {
          return { success: false, error: 'Файл слишком большой. Максимальный размер: 50MB' };
        }
        files.push({
          fieldId: key,
          file,
          fieldLabel: fieldContext.fieldLabel,
          parentQuestionLabel: fieldContext.parentQuestionLabel
        });
      }
    }

    // Сначала отправляем пользовательские файлы, чтобы не сохранять анкету при ошибке загрузки
    for (const { fieldId, file, fieldLabel, parentQuestionLabel } of files) {
      onFileProgress?.({ fieldId, fileName: file.name, status: 'uploading' });
      const questionNumber = getQuestionNumberFromFieldId(fieldId);
      const isAnalysesField = fieldId === 'q26_files';
      const contextLine = isAnalysesField
        ? '📎 Анализы (вопрос 26)'
        : parentQuestionLabel
          ? `📎 Файл к вопросу ${questionNumber ?? ''}`.trim()
          : `📎 ${fieldLabel}`;
      const fileCaption = `${contextLine}\nИмя файла: ${file.name}\nРазмер: ${(file.size / 1024).toFixed(1)} KB`;
      const fileSent = await sendFileToTelegram(file, fileCaption);
      if (!fileSent) {
        onFileProgress?.({ fieldId, fileName: file.name, status: 'error' });
        return { success: false, error: 'Ошибка загрузки файла, попробуйте ещё раз' };
      }
      onFileProgress?.({ fieldId, fileName: file.name, status: 'success' });
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    // После успешной отправки файлов отправляем основную анкету
    const message = formatQuestionnaireMessage(questionnaireId, formData);
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      })
    });

    const responseData = await response.json();
    if (!response.ok) {
      console.error('Telegram API error:', responseData);
      return { success: false, error: 'Ошибка загрузки файла, попробуйте ещё раз' };
    }

    // PDF отправляем отдельно, но его ошибка не ломает уже успешную отправку анкеты
    try {
      const pdfFile = await generateQuestionnairePDF(questionnaireId, formData);
      const pdfCaption = `📄 PDF-версия анкеты: ${pdfFile.name}`;
      const pdfSent = await sendFileToTelegram(pdfFile, pdfCaption);
      if (!pdfSent) {
        console.warn('Failed to send PDF');
      }
    } catch (error) {
      console.error('Error generating or sending PDF:', error);
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending to Telegram:', error);
    return { success: false, error: 'Ошибка загрузки файла, попробуйте ещё раз' };
  }
}

/**
 * Форматирование данных анкеты в читаемое сообщение
 */
function formatQuestionnaireMessage(
  questionnaireId: string,
  formData: Record<string, any>
): string {
  const questionnaireNames: Record<string, string> = {
    children: 'Анкета для подростков',
    female: 'Женская анкета',
    male: 'Мужская анкета'
  };
  
  let message = `<b>📋 Новая анкета: ${questionnaireNames[questionnaireId] || questionnaireId}</b>\n\n`;
  message += `<b>📅 Дата:</b> ${new Date().toLocaleString('ru-RU', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}\n\n`;
  message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
  
  // Обрабатываем составные поля (имя, фамилия, возраст, вес)
  const name = formData['q1_name'] || '';
  const surname = formData['q1_surname'] || '';
  const age = formData['q1_age'] || '';
  const weight = formData['q1_weight'] || '';
  const height = formData['q1_height'] || '';
  
  if (name || surname || age || weight) {
    message += `<b>👤 Основная информация:</b>\n`;
    if (name) message += `Имя: ${name}\n`;
    if (surname) message += `Фамилия: ${surname}\n`;
    if (age) message += `Возраст: ${age}\n`;
    if (weight) message += `Вес: ${weight} кг\n`;
    if (height) message += `Рост: ${height} см\n`;
    message += `\n`;
  }
  
  // Добавляем контактные данные в конец
  const telegram = formData['contact_telegram'] || '';
  const instagram = formData['contact_instagram'] || '';
  
  // Добавляем остальные ответы
  const processedKeys = new Set(['q1_name', 'q1_surname', 'q1_age', 'q1_weight', 'q1_height', 'contact_telegram', 'contact_instagram']);
  
  // Определяем, с какого вопроса начинать нумерацию
  // Для женской и мужской анкет - с q1_weight_goal
  // Для детских анкет - с q2 (первый вопрос после основной информации)
  let startNumberingFrom = 'q1_weight_goal';
  if (questionnaireId === 'children') {
    startNumberingFrom = 'q2';
  }
  
  let questionNumber = 0;
  let shouldNumber = false;
  
  // Получаем все вопросы анкеты в правильном порядке для нумерации
  const questionnaire = getQuestionnaireById(questionnaireId);
  const orderedQuestions: { id: string; label: string }[] = [];
  
  if (questionnaire) {
    const collectQuestions = (fields: QuestionField[]) => {
      fields.forEach(field => {
        // Добавляем основной вопрос
        orderedQuestions.push({ id: field.id, label: field.label });
        
        // Добавляем составные поля
        if (field.groupedFields) {
          field.groupedFields.forEach(subField => {
            orderedQuestions.push({ id: subField.id, label: subField.label });
          });
        }
        
        // Добавляем условные поля (они будут показаны только если условие выполнено)
        if (field.conditionalFields) {
          field.conditionalFields.forEach(cond => {
            const conditionValue = formData[cond.condition.fieldId];
            if (conditionValue === cond.condition.value) {
              collectQuestions(cond.fields);
            }
          });
        }
      });
    };
    collectQuestions(questionnaire.questions);
  }
  
  // Находим индекс вопроса, с которого начинать нумерацию
  const numberingStartIndex = orderedQuestions.findIndex(q => q.id === startNumberingFrom);
  
  // Создаем мапу для быстрого поиска порядка вопросов
  const questionOrderMap = new Map<string, number>();
  orderedQuestions.forEach((q, index) => {
    questionOrderMap.set(q.id, index);
  });
  
  // Сортируем ответы по порядку вопросов в анкете
  const sortedEntries = Object.entries(formData)
    .filter(([key, value]) => {
      return !processedKeys.has(key) && 
             value !== null && 
             value !== undefined && 
             value !== '' &&
             !key.endsWith('_other');
    })
    .sort(([keyA], [keyB]) => {
      const orderA = questionOrderMap.get(keyA) ?? 9999;
      const orderB = questionOrderMap.get(keyB) ?? 9999;
      return orderA - orderB;
    });
  
  for (const [key, value] of sortedEntries) {
    // Определяем, нужно ли нумеровать этот вопрос
    const questionIndex = questionOrderMap.get(key) ?? -1;
    if (questionIndex >= numberingStartIndex && numberingStartIndex !== -1) {
      shouldNumber = true;
      questionNumber++;
    }
    
    // Получаем вопрос из данных анкеты
    const questionLabel = getQuestionLabel(key, questionnaireId);
    const numberedLabel = shouldNumber ? `${questionNumber}. ${questionLabel}` : questionLabel;
    message += `<b>${numberedLabel}:</b>\n`;
    
    if (Array.isArray(value)) {
      // Обрабатываем checkbox значения
      const questionnaire = getQuestionnaireById(questionnaireId);
      const question = questionnaire?.questions.find(q => q.id === key);
      
      const values = value.filter(v => v !== 'other' && v !== 'none');
      if (values.length > 0) {
        // Если есть опции, используем их метки
        if (question?.options) {
          const optionLabels = values.map(v => {
            const option = question.options?.find(opt => opt.value === v);
            return option ? option.label : v;
          });
          message += optionLabels.map(v => `• ${v}`).join('\n') + '\n';
        } else {
          message += values.map(v => `• ${v}`).join('\n') + '\n';
        }
      }
      // Добавляем "Другое" если есть
      if (value.includes('other') && formData[`${key}_other`]) {
        message += `• Другое: ${formData[`${key}_other`]}\n`;
      }
      if (value.includes('none')) {
        message += `• Не беспокоит\n`;
      }
    } else if (value instanceof FileList || (Array.isArray(value) && value.length > 0 && value[0] instanceof File)) {
      // Обрабатываем файлы
      const files = value instanceof FileList ? Array.from(value) : value;
      message += `📎 Загружено файлов: ${files.length}\n`;
      for (let i = 0; i < files.length; i++) {
        const file = files[i] as File;
        message += `   ${i + 1}. ${file.name} (${(file.size / 1024).toFixed(1)} KB)\n`;
      }
    } else {
      // Обрабатываем radio и select значения
      const questionnaire = getQuestionnaireById(questionnaireId);
      const question = questionnaire?.questions.find(q => q.id === key);
      
      if (question?.options) {
        const option = question.options.find(opt => opt.value === value);
        if (option) {
          message += `${option.label}\n`;
        } else {
          message += `${value}\n`;
        }
      } else {
        message += `${value}\n`;
      }
    }
    message += `\n`;
  }
  
  message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
  message += `<b>📞 Контактные данные для связи:</b>\n`;
  if (telegram) {
    message += `💬 Telegram: ${telegram}\n`;
  }
  if (instagram) {
    message += `📷 Instagram: @${instagram}\n`;
  }
  if (!telegram && !instagram) {
    message += `Не указаны\n`;
  }
  message += `\n━━━━━━━━━━━━━━━━━━━━\n`;
  message += `<i>Анкета заполнена через сайт</i>`;
  
  return message;
}

/**
 * Получить текст вопроса по ID поля
 */
function getQuestionLabel(fieldId: string, questionnaireId: string): string {
  const questionnaire = getQuestionnaireById(questionnaireId);
  
  if (questionnaire) {
    // Ищем поле в основных вопросах
    const findField = (fields: QuestionField[]): string | null => {
      for (const field of fields) {
        if (field.id === fieldId) {
          return field.label;
        }
        // Проверяем составные поля
        if (field.groupedFields) {
          const subField = field.groupedFields.find(f => f.id === fieldId);
          if (subField) {
            return subField.label;
          }
        }
        // Проверяем условные поля
        if (field.conditionalFields) {
          for (const cond of field.conditionalFields) {
            const found = findField(cond.fields);
            if (found) return found;
          }
        }
      }
      return null;
    };
    
    const label = findField(questionnaire.questions);
    if (label) return label;
  }
  
  // Fallback: простое форматирование ID
  const label = fieldId
    .replace(/^q\d+_?/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l: string) => l.toUpperCase());
  
  return label || fieldId;
}

/**
 * Экспорт данных в JSON формат
 */
export function exportToJSON(
  questionnaireId: string,
  formData: Record<string, any>
): string {
  const data = {
    questionnaireId,
    timestamp: new Date().toISOString(),
    answers: formData
  };
  
  return JSON.stringify(data, null, 2);
}

