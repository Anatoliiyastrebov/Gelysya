// Структура данных для всех анкет
// ВАЖНО: Используются строго указанные вопросы без изменений

export type FieldType = 'text' | 'textarea' | 'radio' | 'checkbox' | 'select' | 'file' | 'number' | 'group';

export interface FieldOption {
  value: string;
  label: string;
  labelEn?: string;
  hasOther?: boolean; // Если true, при выборе этого варианта показывается текстовое поле "Другое"
}

export interface ConditionalField {
  condition: {
    fieldId: string;
    value: string; // Значение, при котором показывается поле
  };
  fields: QuestionField[];
}

// Составное поле (группа полей)
export interface GroupedField {
  id: string;
  type: 'text' | 'number';
  label: string;
  labelEn?: string;
  placeholder?: string;
  placeholderEn?: string;
  required?: boolean;
  unit?: string; // Единица измерения (кг, см, лет и т.д.)
  min?: number; // Минимальное значение для number
  max?: number; // Максимальное значение для number
}

export interface QuestionField {
  id: string;
  type: FieldType;
  label: string;
  labelEn?: string;
  placeholder?: string;
  placeholderEn?: string;
  required?: boolean;
  options?: FieldOption[];
  conditionalFields?: ConditionalField[];
  accept?: string; // Для file upload
  multiple?: boolean; // Для file upload
  min?: number; // Для number
  max?: number; // Для number
  unit?: string; // Единица измерения для числовых полей
  // Для составных полей (group)
  groupedFields?: GroupedField[];
  // Для checkbox с вариантом "Другое"
  allowOther?: boolean;
  otherLabel?: string; // Текст для поля "Другое"
  otherLabelEn?: string;
}

export interface Questionnaire {
  id: string;
  name: {
    ru: string;
    en: string;
  };
  questions: QuestionField[];
}

// Анкета: Малыши до 1 года
export const babiesQuestionnaire: Questionnaire = {
  id: 'babies',
  name: {
    ru: 'Малыши до 1 года',
    en: 'Babies up to 1 year'
  },
  questions: [
    {
      id: 'q1',
      type: 'group',
      label: 'Основная информация о ребёнке',
      labelEn: 'Basic information about the baby',
      required: true,
      groupedFields: [
        { id: 'q1_name', type: 'text', label: 'Имя', labelEn: 'First name', required: true, placeholder: 'Имя ребёнка', placeholderEn: 'Baby\'s first name' },
        { id: 'q1_surname', type: 'text', label: 'Фамилия', labelEn: 'Last name', required: true, placeholder: 'Фамилия ребёнка', placeholderEn: 'Baby\'s last name' },
        { id: 'q1_age', type: 'number', label: 'Возраст', labelEn: 'Age', required: true, placeholder: 'Возраст в месяцах', placeholderEn: 'Age in months', unit: 'месяцев', min: 0, max: 12 },
        { id: 'q1_weight', type: 'number', label: 'Вес', labelEn: 'Weight', required: true, placeholder: 'Вес', placeholderEn: 'Weight', unit: 'кг', min: 0 }
      ]
    },
    {
      id: 'q2',
      type: 'checkbox',
      label: 'Пищеварение — боли в животе, диарея, запор',
      labelEn: 'Digestion – tummy pain, diarrhea, constipation',
      required: true,
      options: [
        { value: 'none', label: 'Не беспокоит', labelEn: 'No issues' },
        { value: 'stomach_pain', label: 'Боли в животе', labelEn: 'Tummy pain' },
        { value: 'diarrhea', label: 'Диарея', labelEn: 'Diarrhea' },
        { value: 'constipation', label: 'Запор', labelEn: 'Constipation' },
        { value: 'bloating', label: 'Вздутие', labelEn: 'Bloating' },
        { value: 'other', label: 'Свой вариант', labelEn: 'Other', hasOther: true }
      ],
      allowOther: true,
      otherLabel: 'Укажите другие проблемы с пищеварением',
      otherLabelEn: 'Please describe other digestion issues'
    },
    {
      id: 'q3',
      type: 'radio',
      label: 'Потеет ли во сне',
      labelEn: 'Does the baby sweat during sleep',
      required: true,
      options: [
        { value: 'no', label: 'Нет', labelEn: 'No' },
        { value: 'sometimes', label: 'Иногда', labelEn: 'Sometimes' },
        { value: 'often', label: 'Часто', labelEn: 'Often' },
        { value: 'always', label: 'Постоянно', labelEn: 'Always' }
      ]
    },
    {
      id: 'q4',
      type: 'radio',
      label: 'Есть ли неприятный запах изо рта',
      labelEn: 'Is there an unpleasant smell from the mouth',
      required: true,
      options: [
        { value: 'yes', label: 'Да', labelEn: 'Yes' },
        { value: 'no', label: 'Нет', labelEn: 'No' }
      ]
    },
    {
      id: 'q5',
      type: 'checkbox',
      label: 'Родинки, бородавки, высыпания, экземы',
      labelEn: 'Moles, warts, rashes, eczema',
      required: true,
      options: [
        { value: 'none', label: 'Нет', labelEn: 'None' },
        { value: 'moles', label: 'Родинки', labelEn: 'Moles' },
        { value: 'warts', label: 'Бородавки', labelEn: 'Warts' },
        { value: 'rash', label: 'Высыпания', labelEn: 'Rashes' },
        { value: 'eczema', label: 'Экземы', labelEn: 'Eczema' },
        { value: 'other', label: 'Свой вариант', labelEn: 'Other', hasOther: true }
      ],
      allowOther: true,
      otherLabel: 'Укажите другие кожные проявления',
      otherLabelEn: 'Please describe other skin issues'
    },
    {
      id: 'q6',
      type: 'checkbox',
      label: 'Аллергия (цветение, животные, пыль, еда)',
      labelEn: 'Allergy (pollen, animals, dust, food)',
      required: true,
      options: [
        { value: 'none', label: 'Нет аллергии', labelEn: 'No allergy' },
        { value: 'pollen', label: 'Цветение', labelEn: 'Pollen' },
        { value: 'animals', label: 'Животные', labelEn: 'Animals' },
        { value: 'dust', label: 'Пыль', labelEn: 'Dust' },
        { value: 'food', label: 'Еда', labelEn: 'Food' },
        { value: 'other', label: 'Свой вариант', labelEn: 'Other', hasOther: true }
      ],
      allowOther: true,
      otherLabel: 'Укажите другие виды аллергии',
      otherLabelEn: 'Please describe other allergies'
    },
    {
      id: 'q7',
      type: 'number',
      label: 'Сколько воды в день пьёт ребёнок',
      labelEn: 'How much water does the baby drink per day',
      placeholder: 'Количество воды',
      placeholderEn: 'Amount of water',
      unit: 'мл',
      min: 0,
      required: true
    },
    {
      id: 'q8',
      type: 'textarea',
      label: 'Травмы, операции, удары по голове, падения, переломы',
      labelEn: 'Injuries, surgeries, head hits, falls, fractures',
      placeholder: 'Опишите, если были',
      placeholderEn: 'Describe if any',
      required: true
    },
    {
      id: 'q9',
      type: 'checkbox',
      label: 'Качество сна ребёнка',
      labelEn: 'Baby\'s sleep quality',
      required: true,
      options: [
        { value: 'good', label: 'Спит хорошо', labelEn: 'Sleeps well' },
        { value: 'hard_to_sleep', label: 'Трудно засыпает', labelEn: 'Hard to fall asleep' },
        { value: 'restless', label: 'Беспокойный сон', labelEn: 'Restless sleep' },
        { value: 'wakes_often', label: 'Часто просыпается', labelEn: 'Wakes up often' },
        { value: 'short_sleep', label: 'Спит мало', labelEn: 'Sleeps little' },
        { value: 'day_night_confusion', label: 'Путает день и ночь', labelEn: 'Confuses day and night' },
        { value: 'other', label: 'Свой вариант', labelEn: 'Other', hasOther: true }
      ],
      allowOther: true,
      otherLabel: 'Опишите особенности сна',
      otherLabelEn: 'Describe sleep features'
    },
    {
      id: 'q10',
      type: 'checkbox',
      label: 'Часто ли болеет, принимал ли антибиотики или лекарства',
      labelEn: 'Does the baby often get sick, has taken antibiotics or medicines',
      required: true,
      options: [
        { value: 'none', label: 'Не болеет, не принимал', labelEn: 'Does not get sick, has not taken' },
        { value: 'often_sick', label: 'Часто болеет', labelEn: 'Often gets sick' },
        { value: 'antibiotics', label: 'Принимал антибиотики', labelEn: 'Has taken antibiotics' },
        { value: 'medications', label: 'Принимал лекарства', labelEn: 'Has taken medicines' },
        { value: 'other', label: 'Свой вариант', labelEn: 'Other', hasOther: true }
      ],
      allowOther: true,
      otherLabel: 'Укажите дополнительную информацию',
      otherLabelEn: 'Please provide additional information'
    },
    {
      id: 'q11',
      type: 'radio',
      label: 'Как прошли роды',
      labelEn: 'How was the delivery',
      required: true,
      options: [
        { value: 'natural', label: 'Естественные', labelEn: 'Natural' },
        { value: 'cesarean', label: 'Кесарево', labelEn: 'Cesarean section' }
      ]
    },
    {
      id: 'q12',
      type: 'radio',
      label: 'Был ли у мамы токсикоз',
      labelEn: 'Did the mother have toxicosis',
      required: true,
      options: [
        { value: 'yes', label: 'Да', labelEn: 'Yes' },
        { value: 'no', label: 'Нет', labelEn: 'No' }
      ]
    },
    {
      id: 'q13',
      type: 'radio',
      label: 'Была ли у мамы аллергия',
      labelEn: 'Did the mother have allergies',
      required: true,
      options: [
        { value: 'yes', label: 'Да', labelEn: 'Yes' },
        { value: 'no', label: 'Нет', labelEn: 'No' }
      ]
    },
    {
      id: 'q14',
      type: 'radio',
      label: 'Был ли у мамы запор',
      labelEn: 'Did the mother have constipation',
      required: true,
      options: [
        { value: 'yes', label: 'Да', labelEn: 'Yes' },
        { value: 'no', label: 'Нет', labelEn: 'No' }
      ]
    },
    {
      id: 'q15',
      type: 'radio',
      label: 'Принимала ли мама антибиотики',
      labelEn: 'Did the mother take antibiotics',
      required: true,
      options: [
        { value: 'yes', label: 'Да', labelEn: 'Yes' },
        { value: 'no', label: 'Нет', labelEn: 'No' }
      ]
    },
    {
      id: 'q16',
      type: 'radio',
      label: 'Была ли анемия',
      labelEn: 'Did the mother have anemia',
      required: true,
      options: [
        { value: 'yes', label: 'Да', labelEn: 'Yes' },
        { value: 'no', label: 'Нет', labelEn: 'No' }
      ]
    },
    {
      id: 'q17',
      type: 'textarea',
      label: 'Проблемы во время беременности',
      labelEn: 'Problems during pregnancy',
      placeholder: 'Опишите, если были',
      placeholderEn: 'Describe if any',
      required: true
    },
    {
      id: 'q18',
      type: 'textarea',
      label: 'Что ещё важно знать о здоровье ребёнка',
      labelEn: 'What else is important to know about the baby’s health',
      placeholder: 'Дополнительная информация',
      placeholderEn: 'Additional information',
      required: true
    },
    {
      id: 'contact_telegram',
      type: 'text',
      label: 'Telegram для связи (укажите @username)',
      labelEn: 'Telegram for contact (enter @username)',
      placeholder: '@username',
      placeholderEn: '@username',
      required: true
    },
    {
      id: 'contact_instagram',
      type: 'text',
      label: 'Instagram для связи (укажите username без @)',
      labelEn: 'Instagram for contact (enter username without @)',
      placeholder: 'username',
      placeholderEn: 'username',
      required: false
    }
  ]
};

// Анкета: Детская (1–12 лет)
export const childrenQuestionnaire: Questionnaire = {
  id: 'children',
  name: {
    ru: 'Детская анкета (1–12 лет)',
    en: 'Children\'s questionnaire (1–12 years)'
  },
  questions: [
    {
      id: 'q1',
      type: 'group',
      label: 'Основная информация о ребёнке',
      labelEn: 'Basic information about the child',
      required: true,
      groupedFields: [
        { id: 'q1_name', type: 'text', label: 'Имя', labelEn: 'First name', required: true, placeholder: 'Имя ребёнка', placeholderEn: 'Child\'s first name' },
        { id: 'q1_surname', type: 'text', label: 'Фамилия', labelEn: 'Last name', required: true, placeholder: 'Фамилия ребёнка', placeholderEn: 'Child\'s last name' },
        { id: 'q1_age', type: 'number', label: 'Возраст', labelEn: 'Age', required: true, placeholder: 'Возраст', placeholderEn: 'Age', unit: 'лет', min: 1, max: 12 },
        { id: 'q1_weight', type: 'number', label: 'Вес', labelEn: 'Weight', required: true, placeholder: 'Вес', placeholderEn: 'Weight', unit: 'кг', min: 0 }
      ]
    },
    {
      id: 'q2',
      type: 'checkbox',
      label: 'Пищеварение — боли, диарея, запор',
      required: true,
      labelEn: 'Digestion – pain, diarrhea, constipation',
      options: [
        { value: 'none', label: 'Не беспокоит', labelEn: 'No issues' },
        { value: 'stomach_pain', label: 'Боли в животе', labelEn: 'Tummy pain' },
        { value: 'diarrhea', label: 'Диарея', labelEn: 'Diarrhea' },
        { value: 'constipation', label: 'Запор', labelEn: 'Constipation' },
        { value: 'bloating', label: 'Вздутие', labelEn: 'Bloating' },
        { value: 'other', label: 'Свой вариант', labelEn: 'Other', hasOther: true }
      ],
      allowOther: true,
      otherLabel: 'Укажите другие проблемы с пищеварением',
      otherLabelEn: 'Please describe other digestion issues'
    },
    {
      id: 'q3',
      type: 'radio',
      label: 'Зубы — быстро портятся',
      labelEn: 'Teeth – decay quickly',
      required: true,
      options: [
        { value: 'yes', label: 'Да', labelEn: 'Yes' },
        { value: 'no', label: 'Нет', labelEn: 'No' }
      ]
    },
    {
      id: 'q4',
      type: 'radio',
      label: 'Потеет во сне, скрипит зубами',
      labelEn: 'Sweats during sleep, grinds teeth',
      required: true,
      options: [
        { value: 'both', label: 'И то, и другое', labelEn: 'Both' },
        { value: 'sweats', label: 'Только потеет', labelEn: 'Only sweats' },
        { value: 'teeth', label: 'Только скрипит зубами', labelEn: 'Only grinds teeth' },
        { value: 'no', label: 'Нет', labelEn: 'No' }
      ]
    },
    {
      id: 'q5',
      type: 'radio',
      label: 'Неприятный запах изо рта',
      labelEn: 'Unpleasant smell from the mouth',
      required: true,
      options: [
        { value: 'yes', label: 'Да', labelEn: 'Yes' },
        { value: 'no', label: 'Нет', labelEn: 'No' }
      ]
    },
    {
      id: 'q6',
      type: 'radio',
      label: 'Зависимость от сладкого и снеков',
      labelEn: 'Dependence on sweets and snacks',
      required: true,
      options: [
        { value: 'yes', label: 'Да', labelEn: 'Yes' },
        { value: 'no', label: 'Нет', labelEn: 'No' },
        { value: 'sometimes', label: 'Иногда', labelEn: 'Sometimes' }
      ]
    },
    {
      id: 'q7',
      type: 'checkbox',
      label: 'Родинки, бородавки, высыпания, экземы',
      labelEn: 'Moles, warts, rashes, eczema',
      required: true,
      options: [
        { value: 'none', label: 'Нет', labelEn: 'None' },
        { value: 'moles', label: 'Родинки', labelEn: 'Moles' },
        { value: 'warts', label: 'Бородавки', labelEn: 'Warts' },
        { value: 'rash', label: 'Высыпания', labelEn: 'Rashes' },
        { value: 'eczema', label: 'Экземы', labelEn: 'Eczema' },
        { value: 'other', label: 'Свой вариант', labelEn: 'Other', hasOther: true }
      ],
      allowOther: true,
      otherLabel: 'Укажите другие кожные проявления',
      otherLabelEn: 'Please describe other skin issues'
    },
    {
      id: 'q8',
      type: 'checkbox',
      label: 'Аллергия',
      labelEn: 'Allergy',
      required: true,
      options: [
        { value: 'none', label: 'Нет аллергии', labelEn: 'No allergy' },
        { value: 'pollen', label: 'Цветение', labelEn: 'Pollen' },
        { value: 'animals', label: 'Животные', labelEn: 'Animals' },
        { value: 'dust', label: 'Пыль', labelEn: 'Dust' },
        { value: 'food', label: 'Еда', labelEn: 'Food' },
        { value: 'medications', label: 'Лекарства', labelEn: 'Medicines' },
        { value: 'other', label: 'Свой вариант', labelEn: 'Other', hasOther: true }
      ],
      allowOther: true,
      otherLabel: 'Укажите другие виды аллергии',
      otherLabelEn: 'Please describe other allergies'
    },
    {
      id: 'q9',
      type: 'checkbox',
      label: 'Поведение и энергия ребёнка',
      labelEn: 'Child behavior and energy',
      required: true,
      options: [
        { value: 'no', label: 'Нет проблем', labelEn: 'No issues' },
        { value: 'hyperactive', label: 'Гиперактивность', labelEn: 'Hyperactivity' },
        { value: 'tired', label: 'Быстро устаёт', labelEn: 'Gets tired quickly' },
        { value: 'restless', label: 'Беспокойный', labelEn: 'Restless' },
        { value: 'passive', label: 'Пассивный, вялый', labelEn: 'Passive, sluggish' },
        { value: 'mood_swings', label: 'Частые перемены настроения', labelEn: 'Frequent mood swings' },
        { value: 'other', label: 'Свой вариант', labelEn: 'Other', hasOther: true }
      ],
      allowOther: true,
      otherLabel: 'Опишите поведение ребёнка',
      otherLabelEn: 'Describe the child\'s behavior'
    },
    {
      id: 'q10',
      type: 'number',
      label: 'Сколько воды пьёт в день',
      labelEn: 'How much water does the child drink per day',
      placeholder: 'Количество воды',
      placeholderEn: 'Amount of water',
      unit: 'мл',
      min: 0,
      required: true
    },
    {
      id: 'q11',
      type: 'textarea',
      label: 'Травмы, операции, падения',
      labelEn: 'Injuries, surgeries, falls',
      placeholder: 'Опишите, если были: какие травмы, операции, были ли серьёзные падения',
      placeholderEn: 'Describe if any: what injuries, surgeries, any serious falls',
      required: true
    },
    {
      id: 'q12',
      type: 'checkbox',
      label: 'Головные боли и сон',
      labelEn: 'Headaches and sleep',
      required: true,
      options: [
        { value: 'no', label: 'Нет проблем', labelEn: 'No issues' },
        { value: 'headaches', label: 'Бывают головные боли', labelEn: 'Has headaches' },
        { value: 'hard_to_sleep', label: 'Трудно засыпает', labelEn: 'Hard to fall asleep' },
        { value: 'restless_sleep', label: 'Беспокойный сон', labelEn: 'Restless sleep' },
        { value: 'wakes_often', label: 'Часто просыпается ночью', labelEn: 'Wakes up often at night' },
        { value: 'nightmares', label: 'Кошмары', labelEn: 'Nightmares' },
        { value: 'other', label: 'Свой вариант', labelEn: 'Other', hasOther: true }
      ],
      allowOther: true,
      otherLabel: 'Опишите проблему',
      otherLabelEn: 'Describe the problem'
    },
    {
      id: 'q13',
      type: 'checkbox',
      label: 'Часто ли болеет, антибиотики',
      labelEn: 'Does the child often get sick, antibiotics',
      required: true,
      options: [
        { value: 'none', label: 'Не болеет, не принимал', labelEn: 'Does not get sick, has not taken' },
        { value: 'often_sick', label: 'Часто болеет', labelEn: 'Often gets sick' },
        { value: 'antibiotics', label: 'Принимал антибиотики', labelEn: 'Has taken antibiotics' },
        { value: 'other', label: 'Свой вариант', labelEn: 'Other', hasOther: true }
      ],
      allowOther: true,
      otherLabel: 'Укажите дополнительную информацию',
      otherLabelEn: 'Please provide additional information'
    },
    {
      id: 'q14',
      type: 'textarea',
      label: 'Что ещё важно знать о здоровье ребёнка',
      labelEn: 'What else is important to know about the child’s health',
      placeholder: 'Дополнительная информация',
      placeholderEn: 'Additional information',
      required: true
    },
    {
      id: 'contact_telegram',
      type: 'text',
      label: 'Telegram для связи (укажите @username)',
      labelEn: 'Telegram for contact (enter @username)',
      placeholder: '@username',
      placeholderEn: '@username',
      required: true
    },
    {
      id: 'contact_instagram',
      type: 'text',
      label: 'Instagram для связи (укажите username без @)',
      labelEn: 'Instagram for contact (enter username without @)',
      placeholder: 'username',
      placeholderEn: 'username',
      required: false
    }
  ]
};

// Анкета: Женская (28 вопросов)
export const femaleQuestionnaire: Questionnaire = {
  id: 'female',
  name: {
    ru: 'Женская анкета',
    en: 'Female questionnaire'
  },
  questions: [
    {
      id: 'q1',
      type: 'group',
      label: 'Основная информация',
      labelEn: 'Basic information',
      required: true,
      groupedFields: [
        { id: 'q1_name', type: 'text', label: 'Имя', labelEn: 'First name', required: true, placeholder: 'Имя', placeholderEn: 'First name' },
        { id: 'q1_surname', type: 'text', label: 'Фамилия', labelEn: 'Last name', required: true, placeholder: 'Фамилия', placeholderEn: 'Last name' },
        { id: 'q1_age', type: 'number', label: 'Возраст', labelEn: 'Age', required: true, placeholder: 'Возраст', placeholderEn: 'Age', unit: 'лет', min: 0 },
        { id: 'q1_weight', type: 'number', label: 'Вес', labelEn: 'Weight', required: true, placeholder: 'Вес', placeholderEn: 'Weight', unit: 'кг', min: 0 }
      ]
    },
    {
      id: 'q1_height',
      type: 'number',
      label: 'Рост',
      labelEn: 'Height',
      required: true,
      placeholder: 'Рост',
      placeholderEn: 'Height',
      unit: 'см',
      min: 0
    },
    {
      id: 'q1_weight_goal',
      type: 'text',
      label: 'Если недовольны своим весом – сколько хотите убрать или добавить',
      labelEn: 'If you are not satisfied with your weight – how many kg do you want to lose or gain',
      placeholder: 'Например: хочу убрать 5 кг или добавить 3 кг',
      placeholderEn: 'For example: I want to lose 5 kg or gain 3 kg',
      required: true
    },
    {
      id: 'q2',
      type: 'number',
      label: 'Сколько воды в день Вы пьете? (не чай, не кофе, не другие напитки, а только вода)',
      labelEn: 'How much water do you drink per day? (only pure water, not tea, coffee or other drinks)',
      required: true,
      placeholder: 'Количество воды',
      placeholderEn: 'Amount of water',
      unit: 'литров',
      min: 0
    },
    {
      id: 'q3',
      type: 'textarea',
      label: 'Был ли ковид (сколько раз) или вакцина от ковид (сколько доз)',
      labelEn: 'Have you had COVID (how many times) or a COVID vaccine (how many doses)',
      placeholder: 'Опишите подробно. Были ли осложнения после ковид: выпадение волос, проблемы сердца, суставы, потеря памяти, панические атаки, ухудшение сна и т.д.',
      placeholderEn: 'Describe in detail. Any complications after COVID: hair loss, heart problems, joints, memory loss, panic attacks, worse sleep, etc.',
      required: true
    },
    {
      id: 'q4',
      type: 'checkbox',
      label: 'Состояние волос',
      labelEn: 'Hair condition',
      required: true,
      options: [
        { value: 'satisfied', label: 'Довольна качеством', labelEn: 'Satisfied with quality' },
        { value: 'hair_loss', label: 'Сильно выпадают', labelEn: 'Severely falling out' },
        { value: 'dry', label: 'Сухие', labelEn: 'Dry' },
        { value: 'oily', label: 'Жирные', labelEn: 'Oily' },
        { value: 'brittle', label: 'Ломкие', labelEn: 'Brittle' },
        { value: 'thin', label: 'Тонкие, редеют', labelEn: 'Thin, thinning' },
        { value: 'other', label: 'Свой вариант', labelEn: 'Other', hasOther: true }
      ],
      allowOther: true,
      otherLabel: 'Опишите проблему с волосами',
      otherLabelEn: 'Describe your hair problem'
    },
    {
      id: 'q5',
      type: 'checkbox',
      label: 'Состояние зубов и дёсен',
      labelEn: 'Teeth and gums condition',
      required: true,
      options: [
        { value: 'none', label: 'Нет проблем', labelEn: 'No problems' },
        { value: 'crumbling', label: 'Быстро крошатся или портятся', labelEn: 'Crumbly or decaying quickly' },
        { value: 'bad_breath', label: 'Неприятный запах изо рта', labelEn: 'Bad breath' },
        { value: 'bleeding_gums', label: 'Кровоточат дёсны', labelEn: 'Bleeding gums' },
        { value: 'sensitive', label: 'Чувствительные зубы', labelEn: 'Sensitive teeth' },
        { value: 'other', label: 'Свой вариант', labelEn: 'Other', hasOther: true }
      ],
      allowOther: true,
      otherLabel: 'Опишите проблему с зубами',
      otherLabelEn: 'Describe your teeth problem'
    },
    {
      id: 'q6',
      type: 'checkbox',
      label: 'Пищеварительная система',
      labelEn: 'Digestive system',
      required: true,
      options: [
        { value: 'none', label: 'Не беспокоит', labelEn: 'No issues' },
        { value: 'heartburn', label: 'Изжога', labelEn: 'Heartburn' },
        { value: 'bitterness', label: 'Горечь во рту', labelEn: 'Bitterness in the mouth' },
        { value: 'bloating', label: 'Вздутие живота', labelEn: 'Bloating' },
        { value: 'heaviness', label: 'Тяжесть в желудке', labelEn: 'Heaviness in the stomach' },
        { value: 'gas', label: 'Повышенное газообразование', labelEn: 'Excessive gas' },
        { value: 'diarrhea', label: 'Диарея', labelEn: 'Diarrhea' },
        { value: 'constipation', label: 'Запор', labelEn: 'Constipation' },
        { value: 'pancreatitis', label: 'Панкреатит', labelEn: 'Pancreatitis' },
        { value: 'nausea', label: 'Тошнота', labelEn: 'Nausea' },
        { value: 'other', label: 'Свой вариант', labelEn: 'Other', hasOther: true }
      ],
      allowOther: true,
      otherLabel: 'Опишите проблему с пищеварением',
      otherLabelEn: 'Describe your digestive problem'
    },
    {
      id: 'q7',
      type: 'textarea',
      label: 'Песок или камни в желчном или почках. Если есть камни, указать размер',
      labelEn: 'Sand or stones in gallbladder or kidneys. If there are stones, indicate the size',
      placeholder: 'Опишите, если есть',
      placeholderEn: 'Describe if present, indicate size',
      required: true
    },
    {
      id: 'q8',
      type: 'textarea',
      label: 'Были ли операции (какие именно), все ли органы на месте (какой орган удален), травмы',
      labelEn: 'Have you had surgeries (which ones), are all organs in place (which organ removed), injuries',
      placeholder: 'Опишите подробно',
      placeholderEn: 'Describe in detail',
      required: true
    },
    {
      id: 'q9',
      type: 'select',
      label: 'Артериальное давление',
      labelEn: 'Blood pressure',
      required: true,
      options: [
        { value: 'normal', label: 'В норме', labelEn: 'Normal' },
        { value: 'high', label: 'Повышенное', labelEn: 'High' },
        { value: 'low', label: 'Пониженное', labelEn: 'Low' },
        { value: 'unstable', label: 'Нестабильное (скачет)', labelEn: 'Unstable (fluctuates)' }
      ],
      conditionalFields: [{
        condition: { fieldId: 'q9', value: 'high' },
        fields: [{
          id: 'q9_meds',
          type: 'radio',
          label: 'Пьете ли лекарства от давления',
          labelEn: 'Do you take blood pressure medication',
          required: true,
          options: [
            { value: 'yes', label: 'Да', labelEn: 'Yes' },
            { value: 'no', label: 'Нет', labelEn: 'No' }
          ]
        }, {
          id: 'q9_meds_duration',
          type: 'text',
          label: 'Как долго принимаете лекарства',
          labelEn: 'How long have you been taking the medication',
          placeholder: 'Например: 2 года',
          placeholderEn: 'For example: 2 years',
          required: true,
          conditionalFields: [{
            condition: { fieldId: 'q9_meds', value: 'yes' },
            fields: []
          }]
        }]
      }]
    },
    {
      id: 'q10',
      type: 'checkbox',
      label: 'Есть ли хронические или аутоиммунные заболевания',
      labelEn: 'Do you have chronic or autoimmune diseases',
      required: true,
      options: [
        { value: 'none', label: 'Нет', labelEn: 'None' },
        { value: 'diabetes', label: 'Диабет', labelEn: 'Diabetes' },
        { value: 'thyroiditis', label: 'Аутоиммунный тиреоидит', labelEn: 'Autoimmune thyroiditis' },
        { value: 'arthritis', label: 'Артрит', labelEn: 'Arthritis' },
        { value: 'psoriasis', label: 'Псориаз', labelEn: 'Psoriasis' },
        { value: 'other', label: 'Свой вариант', labelEn: 'Other', hasOther: true }
      ],
      allowOther: true,
      otherLabel: 'Укажите другие заболевания',
      otherLabelEn: 'Please list other diseases'
    },
    {
      id: 'q11',
      type: 'checkbox',
      label: 'Голова и нервная система',
      labelEn: 'Head and nervous system',
      required: true,
      options: [
        { value: 'none', label: 'Не беспокоит', labelEn: 'No issues' },
        { value: 'headaches', label: 'Головные боли', labelEn: 'Headaches' },
        { value: 'migraines', label: 'Мигрени', labelEn: 'Migraines' },
        { value: 'weather', label: 'Метеозависимость', labelEn: 'Weather sensitivity' },
        { value: 'concussion', label: 'Было сотрясение мозга', labelEn: 'Had a concussion' },
        { value: 'head_injury', label: 'Были удары по голове', labelEn: 'Had head injuries' },
        { value: 'tinnitus', label: 'Шум в ушах', labelEn: 'Tinnitus' },
        { value: 'floaters', label: 'Мушки перед глазами', labelEn: 'Floaters in vision' },
        { value: 'dizziness', label: 'Головокружения', labelEn: 'Dizziness' },
        { value: 'other', label: 'Свой вариант', labelEn: 'Other', hasOther: true }
      ],
      allowOther: true,
      otherLabel: 'Опишите другие симптомы',
      otherLabelEn: 'Describe other symptoms'
    },
    {
      id: 'q12',
      type: 'radio',
      label: 'Проблемы с кровообращением (онемение пальцев рук/ног, холодные конечности)',
      labelEn: 'Circulation problems (numbness of fingers/toes, cold extremities)',
      required: true,
      options: [
        { value: 'no', label: 'Нет', labelEn: 'No' },
        { value: 'sometimes', label: 'Иногда', labelEn: 'Sometimes' },
        { value: 'often', label: 'Часто', labelEn: 'Often' },
        { value: 'always', label: 'Постоянно', labelEn: 'Always' }
      ]
    },
    {
      id: 'q13',
      type: 'textarea',
      label: 'Варикоз (сеточка или выраженные вены), геморрой (кровоточит или нет), пигментные пятна',
      labelEn: 'Varicose veins (spider veins or pronounced veins), hemorrhoids (bleeding or not), pigment spots',
      placeholder: 'Опишите, если есть',
      placeholderEn: 'Describe if present',
      required: true
    },
    {
      id: 'q14',
      type: 'checkbox',
      label: 'Суставы',
      labelEn: 'Joints',
      required: true,
      options: [
        { value: 'none', label: 'Не беспокоит', labelEn: 'No issues' },
        { value: 'creaking', label: 'Скрипят', labelEn: 'Creaking' },
        { value: 'crunching', label: 'Хрустят', labelEn: 'Cracking' },
        { value: 'inflammation', label: 'Воспаляются', labelEn: 'Inflamed' },
        { value: 'arthrosis', label: 'Артроз', labelEn: 'Arthrosis' },
        { value: 'back_pain', label: 'Боли в спине', labelEn: 'Back pain' },
        { value: 'lower_back_pain', label: 'Боли в пояснице', labelEn: 'Lower back pain' },
        { value: 'knee_pain', label: 'Боли в коленях', labelEn: 'Knee pain' },
        { value: 'other', label: 'Свой вариант', labelEn: 'Other', hasOther: true }
      ],
      allowOther: true,
      otherLabel: 'Укажите другие проблемы с суставами',
      otherLabelEn: 'Please describe other joint issues'
    },
    {
      id: 'q15',
      type: 'textarea',
      label: 'Кисты, полипы, миомы, опухоли, грыжи',
      labelEn: 'Cysts, polyps, fibroids, tumors, hernias',
      placeholder: 'Опишите, если есть',
      placeholderEn: 'Describe if present',
      required: true
    },
    {
      id: 'q16',
      type: 'textarea',
      label: 'Герпес, папилломы, родинки, бородавки, красные точечки на коже, выделения, цистит',
      labelEn: 'Herpes, papillomas, moles, warts, red dots on the skin, discharges, cystitis',
      placeholder: 'Опишите, если есть',
      placeholderEn: 'Describe if present',
      required: true
    },
    {
      id: 'q17',
      type: 'checkbox',
      required: true,
      label: 'Женские дни',
      labelEn: 'Periods / women’s cycle',
      options: [
        { value: 'irregular', label: 'Нерегулярные', labelEn: 'Irregular' },
        { value: 'painful', label: 'Болезненные', labelEn: 'Painful' },
        { value: 'prolonged', label: 'Затяжные', labelEn: 'Prolonged' },
        { value: 'heavy_bleeding', label: 'Обильные кровотечения', labelEn: 'Heavy bleeding' },
        { value: 'menopause', label: 'Менопауза', labelEn: 'Menopause' },
        { value: 'none', label: 'Нет проблем', labelEn: 'No problems' },
        { value: 'other', label: 'Другое', labelEn: 'Other', hasOther: true }
      ],
      allowOther: true,
      otherLabel: 'Укажите дополнительную информацию',
      otherLabelEn: 'Please provide additional information'
    },
    {
      id: 'q18',
      type: 'textarea',
      label: 'Прыщи, фурункулы, акне, раздражение, розацеа, псориаз, дерматит, экзема',
      labelEn: 'Acne, boils, irritation, rosacea, psoriasis, dermatitis, eczema',
      placeholder: 'Опишите, если есть',
      placeholderEn: 'Describe if present',
      required: true
    },
    {
      id: 'q19',
      type: 'checkbox',
      label: 'Аллергические реакции',
      labelEn: 'Allergic reactions',
      required: true,
      options: [
        { value: 'none', label: 'Нет аллергии', labelEn: 'No allergies' },
        { value: 'pollen', label: 'На пыльцу растений', labelEn: 'To pollen' },
        { value: 'food', label: 'На продукты питания', labelEn: 'To food' },
        { value: 'animals', label: 'На шерсть животных', labelEn: 'To animal fur' },
        { value: 'dust', label: 'На пыль', labelEn: 'To dust' },
        { value: 'medications', label: 'На лекарства', labelEn: 'To medicines' },
        { value: 'cosmetics', label: 'На косметику', labelEn: 'To cosmetics' },
        { value: 'other', label: 'Свой вариант', labelEn: 'Other', hasOther: true }
      ],
      allowOther: true,
      otherLabel: 'Укажите на что аллергия',
      otherLabelEn: 'Specify what you are allergic to'
    },
    {
      id: 'q20',
      type: 'textarea',
      label: 'Простуды',
      labelEn: 'Colds',
      placeholder: 'Сколько раз за год простужаетесь. Пользуетесь ли антибиотиками и жаропонижающими',
      placeholderEn: 'How many times per year do you catch a cold. Do you use antibiotics and fever reducers',
      required: true
    },
    {
      id: 'q21',
      type: 'checkbox',
      label: 'Качество сна',
      labelEn: 'Sleep quality',
      required: true,
      options: [
        { value: 'no', label: 'Сплю хорошо', labelEn: 'Sleep well' },
        { value: 'hard_to_sleep', label: 'Трудно заснуть', labelEn: 'Hard to fall asleep' },
        { value: 'wake_up_often', label: 'Часто просыпаюсь ночью', labelEn: 'Wake up often at night' },
        { value: 'early_wake', label: 'Просыпаюсь слишком рано', labelEn: 'Wake up too early' },
        { value: 'snoring', label: 'Храп', labelEn: 'Snoring' },
        { value: 'nightmares', label: 'Кошмары', labelEn: 'Nightmares' },
        { value: 'other', label: 'Свой вариант', labelEn: 'Other', hasOther: true }
      ],
      allowOther: true,
      otherLabel: 'Опишите проблему со сном',
      otherLabelEn: 'Describe your sleep problem'
    },
    {
      id: 'q22',
      type: 'checkbox',
      label: 'Уровень энергии',
      labelEn: 'Energy level',
      required: true,
      options: [
        { value: 'no', label: 'Энергии достаточно', labelEn: 'Have enough energy' },
        { value: 'hard_morning', label: 'С утра сложно собраться', labelEn: 'Hard to get going in the morning' },
        { value: 'very_hard_wake', label: 'Очень тяжело просыпаться', labelEn: 'Very hard to wake up' },
        { value: 'tired_morning', label: 'Утром чувствую себя неотдохнувшей', labelEn: 'Feel not rested in the morning' },
        { value: 'need_coffee', label: 'Нужен кофе для бодрости', labelEn: 'Need coffee to feel energized' },
        { value: 'afternoon_slump', label: 'Упадок сил после обеда', labelEn: 'Afternoon energy slump' },
        { value: 'chronic_fatigue', label: 'Постоянная усталость', labelEn: 'Chronic fatigue' },
        { value: 'other', label: 'Свой вариант', labelEn: 'Other', hasOther: true }
      ],
      allowOther: true,
      otherLabel: 'Опишите проблему с энергией',
      otherLabelEn: 'Describe your energy problem'
    },
    {
      id: 'q23',
      type: 'checkbox',
      label: 'Память и концентрация',
      labelEn: 'Memory and concentration',
      required: true,
      options: [
        { value: 'no', label: 'Нет проблем', labelEn: 'No problems' },
        { value: 'slow', label: 'Замедленное мышление', labelEn: 'Slow thinking' },
        { value: 'concentration', label: 'Трудно сконцентрироваться', labelEn: 'Hard to concentrate' },
        { value: 'remember_names', label: 'Трудно вспомнить имена и события', labelEn: 'Hard to remember names and events' },
        { value: 'remember_info', label: 'Трудно запомнить новую информацию', labelEn: 'Hard to remember new information' },
        { value: 'brain_fog', label: 'Туман в голове', labelEn: 'Brain fog' },
        { value: 'other', label: 'Свой вариант', labelEn: 'Other', hasOther: true }
      ],
      allowOther: true,
      otherLabel: 'Опишите проблему с памятью',
      otherLabelEn: 'Describe your memory problem'
    },
    {
      id: 'q24',
      type: 'checkbox',
      label: 'Образ жизни и физическая активность',
      labelEn: 'Lifestyle and physical activity',
      required: true,
      options: [
        { value: 'sedentary', label: 'Сидячий образ жизни', labelEn: 'Sedentary lifestyle' },
        { value: 'regular_sport', label: 'Регулярные занятия спортом', labelEn: 'Regular sports' },
        { value: 'home_gym', label: 'Делаю гимнастику дома', labelEn: 'Do exercises at home' },
        { value: 'walking', label: 'Много хожу пешком', labelEn: 'Walk a lot' },
        { value: 'cold_water', label: 'Закаливание (холодный душ)', labelEn: 'Cold showers / hardening' },
        { value: 'stressful', label: 'Работа в стрессовых условиях', labelEn: 'Work in stressful conditions' },
        { value: 'physical_work', label: 'Физически тяжёлая работа', labelEn: 'Physically demanding work' },
        { value: 'toxic_substances', label: 'Контакт с токсичными веществами на работе', labelEn: 'Contact with toxic substances at work' },
        { value: 'other', label: 'Свой вариант', labelEn: 'Other', hasOther: true }
      ],
      allowOther: true,
      otherLabel: 'Опишите особенности вашего образа жизни',
      otherLabelEn: 'Describe your lifestyle features'
    },
    {
      id: 'q25',
      type: 'radio',
      label: 'Принимаете ли лекарства на постоянной основе (если да - напишите название, если это возможно)',
      labelEn: 'Do you take any medicines on a regular basis (if yes, write the names if possible)',
      required: true,
      options: [
        { value: 'yes', label: 'Да', labelEn: 'Yes' },
        { value: 'no', label: 'Нет', labelEn: 'No' }
      ],
      conditionalFields: [{
        condition: { fieldId: 'q25', value: 'yes' },
        fields: [{
          id: 'q25_meds',
          type: 'textarea',
          label: 'Название лекарств',
          labelEn: 'Names of medicines',
          placeholder: 'Перечислите названия лекарств, которые принимаете постоянно',
          placeholderEn: 'List the names of medicines you take regularly',
          required: true
        }]
      }]
    },
    {
      id: 'q26',
      type: 'radio',
      label: 'Есть ли у вас анализы крови за последние 2-3 месяца? УЗИ?',
      labelEn: 'Do you have blood tests from the last 2-3 months? Ultrasound (USG)?',
      required: true,
      options: [
        { value: 'yes', label: 'Да', labelEn: 'Yes' },
        { value: 'no', label: 'Нет', labelEn: 'No' }
      ],
      conditionalFields: [{
        condition: { fieldId: 'q26', value: 'yes' },
        fields: [{
          id: 'q26_files',
          type: 'file',
          label: 'Загрузите анализы (любые форматы)',
          labelEn: 'Upload tests (any file formats)',
          accept: '*',
          multiple: true,
          required: true
        }]
      }]
    },
    {
      id: 'q27',
      type: 'textarea',
      label: 'Что еще Вы хотели бы добавить о своем здоровье',
      labelEn: 'What else would you like to add about your health',
      placeholder: 'Дополнительная информация',
      placeholderEn: 'Additional information',
      required: true
    },
    {
      id: 'q28',
      type: 'textarea',
      label: 'Какой самый важный вопрос вас волнует в первую очередь',
      labelEn: 'What is the most important issue or question that worries you first of all',
      placeholder: 'Опишите главную проблему или вопрос',
      placeholderEn: 'Describe the main problem or question',
      required: true
    },
    {
      id: 'contact_telegram',
      type: 'text',
      label: 'Telegram для связи (укажите @username)',
      labelEn: 'Telegram for contact (enter @username)',
      placeholder: '@username',
      placeholderEn: '@username',
      required: true
    },
    {
      id: 'contact_instagram',
      type: 'text',
      label: 'Instagram для связи (укажите username без @)',
      labelEn: 'Instagram for contact (enter username without @)',
      placeholder: 'username',
      placeholderEn: 'username',
      required: false
    }
  ]
};

// Анкета: Мужская (28 вопросов)
export const maleQuestionnaire: Questionnaire = {
  id: 'male',
  name: {
    ru: 'Мужская анкета',
    en: 'Male questionnaire'
  },
  questions: [
    {
      id: 'q1',
      type: 'group',
      label: 'Основная информация',
      labelEn: 'Basic information',
      required: true,
      groupedFields: [
        { id: 'q1_name', type: 'text', label: 'Имя', labelEn: 'First name', required: true, placeholder: 'Имя', placeholderEn: 'First name' },
        { id: 'q1_surname', type: 'text', label: 'Фамилия', labelEn: 'Last name', required: true, placeholder: 'Фамилия', placeholderEn: 'Last name' },
        { id: 'q1_age', type: 'number', label: 'Возраст', labelEn: 'Age', required: true, placeholder: 'Возраст', placeholderEn: 'Age', unit: 'лет', min: 0 },
        { id: 'q1_weight', type: 'number', label: 'Вес', labelEn: 'Weight', required: true, placeholder: 'Вес', placeholderEn: 'Weight', unit: 'кг', min: 0 }
      ]
    },
    {
      id: 'q1_height',
      type: 'number',
      label: 'Рост',
      labelEn: 'Height',
      required: true,
      placeholder: 'Рост',
      placeholderEn: 'Height',
      unit: 'см',
      min: 0
    },
    {
      id: 'q1_weight_goal',
      type: 'text',
      label: 'Если недовольны своим весом – сколько хотите убрать или добавить',
      labelEn: 'If you are not satisfied with your weight – how many kg do you want to lose or gain',
      placeholder: 'Например: хочу убрать 10 кг или добавить 5 кг',
      placeholderEn: 'For example: I want to lose 10 kg or gain 5 kg',
      required: true
    },
    {
      id: 'q2',
      type: 'number',
      label: 'Сколько воды в день Вы пьете? (не чай, не кофе, не другие напитки, а только вода)',
      labelEn: 'How much water do you drink per day? (only pure water, not tea, coffee or other drinks)',
      required: true,
      placeholder: 'Количество воды',
      placeholderEn: 'Amount of water',
      unit: 'литров',
      min: 0
    },
    {
      id: 'q3',
      type: 'textarea',
      label: 'Был ли ковид (сколько раз) или вакцина от ковид (сколько доз)',
      labelEn: 'Have you had COVID (how many times) or a COVID vaccine (how many doses)',
      placeholder: 'Опишите подробно. Были ли осложнения после ковид: выпадение волос, проблемы сердца, суставы, потеря памяти, панические атаки, ухудшение сна и т.д.',
      placeholderEn: 'Describe in detail. Any complications after COVID: hair loss, heart problems, joints, memory loss, panic attacks, worse sleep, etc.',
      required: true
    },
    {
      id: 'q4',
      type: 'checkbox',
      label: 'Состояние волос',
      labelEn: 'Hair condition',
      required: true,
      options: [
        { value: 'satisfied', label: 'Доволен качеством', labelEn: 'Satisfied with quality' },
        { value: 'hair_loss', label: 'Сильно выпадают', labelEn: 'Severely falling out' },
        { value: 'balding', label: 'Облысение', labelEn: 'Balding' },
        { value: 'dry', label: 'Сухие', labelEn: 'Dry' },
        { value: 'oily', label: 'Жирные', labelEn: 'Oily' },
        { value: 'dandruff', label: 'Перхоть', labelEn: 'Dandruff' },
        { value: 'other', label: 'Свой вариант', labelEn: 'Other', hasOther: true }
      ],
      allowOther: true,
      otherLabel: 'Опишите проблему с волосами',
      otherLabelEn: 'Describe your hair problem'
    },
    {
      id: 'q5',
      type: 'checkbox',
      label: 'Состояние зубов и дёсен',
      labelEn: 'Teeth and gums condition',
      required: true,
      options: [
        { value: 'none', label: 'Нет проблем', labelEn: 'No problems' },
        { value: 'crumbling', label: 'Быстро крошатся или портятся', labelEn: 'Crumbly or decaying quickly' },
        { value: 'bad_breath', label: 'Неприятный запах изо рта', labelEn: 'Bad breath' },
        { value: 'bleeding_gums', label: 'Кровоточат дёсны', labelEn: 'Bleeding gums' },
        { value: 'sensitive', label: 'Чувствительные зубы', labelEn: 'Sensitive teeth' },
        { value: 'other', label: 'Свой вариант', labelEn: 'Other', hasOther: true }
      ],
      allowOther: true,
      otherLabel: 'Опишите проблему с зубами',
      otherLabelEn: 'Describe your teeth problem'
    },
    {
      id: 'q6',
      type: 'checkbox',
      label: 'Пищеварение',
      labelEn: 'Digestion',
      required: true,
      options: [
        { value: 'none', label: 'Не беспокоит', labelEn: 'No issues' },
        { value: 'heartburn', label: 'Изжога', labelEn: 'Heartburn' },
        { value: 'bitterness', label: 'Горечь во рту', labelEn: 'Bitterness in the mouth' },
        { value: 'bloating', label: 'Вздутие', labelEn: 'Bloating' },
        { value: 'heaviness', label: 'Тяжесть в желудке', labelEn: 'Heaviness in the stomach' },
        { value: 'gas', label: 'Газы', labelEn: 'Gas' },
        { value: 'diarrhea', label: 'Диарея', labelEn: 'Diarrhea' },
        { value: 'constipation', label: 'Запор', labelEn: 'Constipation' },
        { value: 'pancreatitis', label: 'Панкреатит', labelEn: 'Pancreatitis' },
        { value: 'other', label: 'Свой вариант', labelEn: 'Other', hasOther: true }
      ],
      allowOther: true,
      otherLabel: 'Укажите другие проблемы с пищеварением',
      otherLabelEn: 'Please describe other digestion issues'
    },
    {
      id: 'q7',
      type: 'textarea',
      label: 'Песок или камни в желчном или почках',
      labelEn: 'Sand or stones in gallbladder or kidneys',
      placeholder: 'Опишите, если есть. Укажите размер камней',
      placeholderEn: 'Describe if present. Indicate the size of stones',
      required: true
    },
    {
      id: 'q8',
      type: 'textarea',
      label: 'Операции и травмы',
      labelEn: 'Surgeries and injuries',
      placeholder: 'Опишите: какие операции были, все ли органы на месте, какие травмы',
      placeholderEn: 'Describe: what surgeries, are all organs in place, what injuries',
      required: true
    },
    {
      id: 'q9',
      type: 'select',
      label: 'Артериальное давление',
      labelEn: 'Blood pressure',
      required: true,
      options: [
        { value: 'normal', label: 'В норме', labelEn: 'Normal' },
        { value: 'high', label: 'Повышенное', labelEn: 'High' },
        { value: 'low', label: 'Пониженное', labelEn: 'Low' },
        { value: 'unstable', label: 'Нестабильное (скачет)', labelEn: 'Unstable (fluctuates)' }
      ],
      conditionalFields: [{
        condition: { fieldId: 'q9', value: 'high' },
        fields: [{
          id: 'q9_meds',
          type: 'radio',
          label: 'Принимаете ли препараты от давления',
          labelEn: 'Do you take blood pressure medication',
          required: true,
          options: [
            { value: 'yes', label: 'Да', labelEn: 'Yes' },
            { value: 'no', label: 'Нет', labelEn: 'No' }
          ]
        }, {
          id: 'q9_meds_duration',
          type: 'text',
          label: 'Как долго принимаете',
          labelEn: 'How long have you been taking them',
          placeholder: 'Например: 3 года',
          placeholderEn: 'For example: 3 years',
          required: true,
          conditionalFields: [{
            condition: { fieldId: 'q9_meds', value: 'yes' },
            fields: []
          }]
        }]
      }]
    },
    {
      id: 'q10',
      type: 'checkbox',
      label: 'Хронические или аутоиммунные заболевания',
      labelEn: 'Chronic or autoimmune diseases',
      required: true,
      options: [
        { value: 'none', label: 'Нет', labelEn: 'None' },
        { value: 'diabetes', label: 'Сахарный диабет', labelEn: 'Diabetes' },
        { value: 'thyroiditis', label: 'Аутоиммунный тиреоидит', labelEn: 'Autoimmune thyroiditis' },
        { value: 'hypothyroidism', label: 'Гипотиреоз', labelEn: 'Hypothyroidism' },
        { value: 'arthritis', label: 'Артрит', labelEn: 'Arthritis' },
        { value: 'psoriasis', label: 'Псориаз', labelEn: 'Psoriasis' },
        { value: 'asthma', label: 'Астма', labelEn: 'Asthma' },
        { value: 'other', label: 'Свой вариант', labelEn: 'Other', hasOther: true }
      ],
      allowOther: true,
      otherLabel: 'Укажите другие заболевания',
      otherLabelEn: 'Please list other diseases'
    },
    {
      id: 'q11',
      type: 'checkbox',
      label: 'Голова и нервная система',
      labelEn: 'Head and nervous system',
      required: true,
      options: [
        { value: 'none', label: 'Не беспокоит', labelEn: 'No issues' },
        { value: 'headaches', label: 'Головные боли', labelEn: 'Headaches' },
        { value: 'migraines', label: 'Мигрени', labelEn: 'Migraines' },
        { value: 'weather', label: 'Метеозависимость', labelEn: 'Weather sensitivity' },
        { value: 'concussion', label: 'Было сотрясение мозга', labelEn: 'Had a concussion' },
        { value: 'head_injury', label: 'Были удары по голове', labelEn: 'Had head injuries' },
        { value: 'tinnitus', label: 'Шум в ушах', labelEn: 'Tinnitus' },
        { value: 'floaters', label: 'Мушки перед глазами', labelEn: 'Floaters in vision' },
        { value: 'dizziness', label: 'Головокружения', labelEn: 'Dizziness' },
        { value: 'other', label: 'Свой вариант', labelEn: 'Other', hasOther: true }
      ],
      allowOther: true,
      otherLabel: 'Опишите другие симптомы',
      otherLabelEn: 'Describe other symptoms'
    },
    {
      id: 'q12',
      type: 'radio',
      label: 'Онемение пальцев рук и ног, руки-ноги холодные даже летом',
      labelEn: 'Numbness of fingers and toes, hands and feet cold even in summer',
      required: true,
      options: [
        { value: 'no', label: 'Нет', labelEn: 'No' },
        { value: 'sometimes', label: 'Иногда', labelEn: 'Sometimes' },
        { value: 'often', label: 'Часто', labelEn: 'Often' },
        { value: 'always', label: 'Постоянно', labelEn: 'Always' }
      ]
    },
    {
      id: 'q13',
      type: 'textarea',
      label: 'Варикоз (сеточка или выраженные вены), геморрой (кровоточит или нет), пигментные пятна',
      labelEn: 'Varicose veins (spider veins or pronounced veins), hemorrhoids (bleeding or not), pigment spots',
      placeholder: 'Опишите, если есть',
      placeholderEn: 'Describe if present',
      required: true
    },
    {
      id: 'q14',
      type: 'checkbox',
      label: 'Суставы',
      labelEn: 'Joints',
      required: true,
      options: [
        { value: 'none', label: 'Не беспокоит', labelEn: 'No issues' },
        { value: 'creaking', label: 'Скрипят', labelEn: 'Creaking' },
        { value: 'crunching', label: 'Хрустят', labelEn: 'Cracking' },
        { value: 'inflammation', label: 'Воспаляются', labelEn: 'Inflamed' },
        { value: 'arthrosis', label: 'Артроз', labelEn: 'Arthrosis' },
        { value: 'back_pain', label: 'Боли в спине', labelEn: 'Back pain' },
        { value: 'lower_back_pain', label: 'Боли в пояснице', labelEn: 'Lower back pain' },
        { value: 'knee_pain', label: 'Боли в коленях', labelEn: 'Knee pain' },
        { value: 'other', label: 'Свой вариант', labelEn: 'Other', hasOther: true }
      ],
      allowOther: true,
      otherLabel: 'Укажите другие проблемы с суставами',
      otherLabelEn: 'Please describe other joint issues'
    },
    {
      id: 'q15',
      type: 'textarea',
      label: 'Кисты, полипы, миомы, опухоли, грыжи',
      labelEn: 'Cysts, polyps, tumors, hernias',
      placeholder: 'Опишите, если есть',
      placeholderEn: 'Describe if present',
      required: true
    },
    {
      id: 'q16',
      type: 'textarea',
      label: 'Герпес, папилломы, родинки, бородавки, красные точечки на коже, выделения, цистит',
      labelEn: 'Herpes, papillomas, moles, warts, red dots on skin, discharges, cystitis',
      placeholder: 'Опишите, если есть',
      placeholderEn: 'Describe if present',
      required: true
    },
    {
      id: 'q17',
      type: 'textarea',
      label: 'Простатит',
      labelEn: 'Prostatitis',
      placeholder: 'Опишите, если есть проблемы',
      placeholderEn: 'Describe if you have problems',
      required: true
    },
    {
      id: 'q18',
      type: 'textarea',
      label: 'Прыщи, фурункулы, акне, раздражение, розацеа, псориаз, дерматит, экзема',
      labelEn: 'Acne, boils, irritation, rosacea, psoriasis, dermatitis, eczema',
      placeholder: 'Опишите, если есть',
      placeholderEn: 'Describe if present',
      required: true
    },
    {
      id: 'q19',
      type: 'checkbox',
      label: 'Аллергия (на пыльцу, еду, шерсть животных, пыль, лекарства)',
      labelEn: 'Allergy (to pollen, food, animal fur, dust, medicines)',
      required: true,
      options: [
        { value: 'none', label: 'Нет аллергии', labelEn: 'No allergy' },
        { value: 'pollen', label: 'Пыльца', labelEn: 'Pollen' },
        { value: 'food', label: 'Еда', labelEn: 'Food' },
        { value: 'animals', label: 'Шерсть животных', labelEn: 'Animal fur' },
        { value: 'dust', label: 'Пыль', labelEn: 'Dust' },
        { value: 'medications', label: 'Лекарства', labelEn: 'Medicines' },
        { value: 'other', label: 'Свой вариант', labelEn: 'Other', hasOther: true }
      ],
      allowOther: true,
      otherLabel: 'Укажите другие виды аллергии',
      otherLabelEn: 'Please describe other allergies'
    },
    {
      id: 'q20',
      type: 'textarea',
      label: 'Простуды',
      labelEn: 'Colds',
      placeholder: 'Сколько раз за год простужаетесь. Пользуетесь ли антибиотиками и жаропонижающими',
      placeholderEn: 'How many times per year do you catch a cold. Do you use antibiotics and fever reducers',
      required: true
    },
    {
      id: 'q21',
      type: 'checkbox',
      label: 'Качество сна',
      labelEn: 'Sleep quality',
      required: true,
      options: [
        { value: 'no', label: 'Сплю хорошо', labelEn: 'Sleep well' },
        { value: 'hard_to_sleep', label: 'Трудно заснуть', labelEn: 'Hard to fall asleep' },
        { value: 'wake_up_often', label: 'Часто просыпаюсь ночью', labelEn: 'Wake up often at night' },
        { value: 'early_wake', label: 'Просыпаюсь слишком рано', labelEn: 'Wake up too early' },
        { value: 'snoring', label: 'Храп', labelEn: 'Snoring' },
        { value: 'apnea', label: 'Апноэ (остановки дыхания)', labelEn: 'Sleep apnea' },
        { value: 'other', label: 'Свой вариант', labelEn: 'Other', hasOther: true }
      ],
      allowOther: true,
      otherLabel: 'Опишите проблему со сном',
      otherLabelEn: 'Describe your sleep problem'
    },
    {
      id: 'q22',
      type: 'checkbox',
      label: 'Уровень энергии',
      labelEn: 'Energy level',
      required: true,
      options: [
        { value: 'no', label: 'Энергии достаточно', labelEn: 'Have enough energy' },
        { value: 'hard_morning', label: 'С утра сложно собраться', labelEn: 'Hard to get going in the morning' },
        { value: 'very_hard_wake', label: 'Очень тяжело просыпаться', labelEn: 'Very hard to wake up' },
        { value: 'tired_morning', label: 'Утром чувствую себя неотдохнувшим', labelEn: 'Feel not rested in the morning' },
        { value: 'need_coffee', label: 'Нужен кофе для бодрости', labelEn: 'Need coffee to feel energized' },
        { value: 'afternoon_slump', label: 'Упадок сил после обеда', labelEn: 'Afternoon energy slump' },
        { value: 'chronic_fatigue', label: 'Постоянная усталость', labelEn: 'Chronic fatigue' },
        { value: 'other', label: 'Свой вариант', labelEn: 'Other', hasOther: true }
      ],
      allowOther: true,
      otherLabel: 'Опишите проблему с энергией',
      otherLabelEn: 'Describe your energy problem'
    },
    {
      id: 'q23',
      type: 'checkbox',
      label: 'Память и концентрация',
      labelEn: 'Memory and concentration',
      required: true,
      options: [
        { value: 'no', label: 'Нет проблем', labelEn: 'No problems' },
        { value: 'slow', label: 'Замедленное мышление', labelEn: 'Slow thinking' },
        { value: 'concentration', label: 'Трудно сконцентрироваться', labelEn: 'Hard to concentrate' },
        { value: 'remember_names', label: 'Трудно вспомнить имена и события', labelEn: 'Hard to remember names and events' },
        { value: 'remember_info', label: 'Трудно запомнить новую информацию', labelEn: 'Hard to remember new information' },
        { value: 'brain_fog', label: 'Туман в голове', labelEn: 'Brain fog' },
        { value: 'other', label: 'Свой вариант', labelEn: 'Other', hasOther: true }
      ],
      allowOther: true,
      otherLabel: 'Опишите проблему с памятью',
      otherLabelEn: 'Describe your memory problem'
    },
    {
      id: 'q24',
      type: 'checkbox',
      label: 'Образ жизни и физическая активность',
      labelEn: 'Lifestyle and physical activity',
      required: true,
      options: [
        { value: 'sedentary', label: 'Сидячий образ жизни', labelEn: 'Sedentary lifestyle' },
        { value: 'regular_sport', label: 'Регулярные занятия спортом', labelEn: 'Regular sports' },
        { value: 'home_gym', label: 'Делаю гимнастику дома', labelEn: 'Do exercises at home' },
        { value: 'walking', label: 'Много хожу пешком', labelEn: 'Walk a lot' },
        { value: 'cold_water', label: 'Закаливание (холодный душ)', labelEn: 'Cold showers / hardening' },
        { value: 'stressful', label: 'Работа в стрессовых условиях', labelEn: 'Work in stressful conditions' },
        { value: 'physical_work', label: 'Физически тяжёлая работа', labelEn: 'Physically demanding work' },
        { value: 'toxic_substances', label: 'Контакт с токсичными веществами на работе', labelEn: 'Contact with toxic substances at work' },
        { value: 'other', label: 'Свой вариант', labelEn: 'Other', hasOther: true }
      ],
      allowOther: true,
      otherLabel: 'Опишите особенности вашего образа жизни',
      otherLabelEn: 'Describe your lifestyle features'
    },
    {
      id: 'q25',
      type: 'radio',
      label: 'Принимаете ли лекарства на постоянной основе (если да - напишите название, если это возможно)',
      labelEn: 'Do you take any medicines on a regular basis (if yes, write the names if possible)',
      required: true,
      options: [
        { value: 'yes', label: 'Да', labelEn: 'Yes' },
        { value: 'no', label: 'Нет', labelEn: 'No' }
      ],
      conditionalFields: [{
        condition: { fieldId: 'q25', value: 'yes' },
        fields: [{
          id: 'q25_meds',
          type: 'textarea',
          label: 'Название лекарств',
          labelEn: 'Names of medicines',
          placeholder: 'Перечислите названия лекарств, которые принимаете постоянно',
          placeholderEn: 'List the names of medicines you take regularly',
          required: true
        }]
      }]
    },
    {
      id: 'q26',
      type: 'radio',
      label: 'Есть ли у вас анализы крови за последние 2-3 месяца? УЗИ?',
      labelEn: 'Do you have blood tests from the last 2-3 months? Ultrasound (USG)?',
      required: true,
      options: [
        { value: 'yes', label: 'Да', labelEn: 'Yes' },
        { value: 'no', label: 'Нет', labelEn: 'No' }
      ],
      conditionalFields: [{
        condition: { fieldId: 'q26', value: 'yes' },
        fields: [{
          id: 'q26_files',
          type: 'file',
          label: 'Загрузите анализы (любые форматы)',
          labelEn: 'Upload tests (any file formats)',
          accept: '*',
          multiple: true,
          required: true
        }]
      }]
    },
    {
      id: 'q27',
      type: 'textarea',
      label: 'Что еще Вы хотели бы добавить о своем здоровье',
      labelEn: 'What else would you like to add about your health',
      placeholder: 'Дополнительная информация',
      placeholderEn: 'Additional information',
      required: true
    },
    {
      id: 'q28',
      type: 'textarea',
      label: 'Какой самый важный вопрос вас волнует в первую очередь',
      labelEn: 'What is the most important issue or question that worries you first of all',
      placeholder: 'Опишите главную проблему или вопрос',
      placeholderEn: 'Describe the main problem or question',
      required: true
    },
    {
      id: 'contact_telegram',
      type: 'text',
      label: 'Telegram для связи (укажите @username)',
      labelEn: 'Telegram for contact (enter @username)',
      placeholder: '@username',
      placeholderEn: '@username',
      required: true
    },
    {
      id: 'contact_instagram',
      type: 'text',
      label: 'Instagram для связи (укажите username без @)',
      labelEn: 'Instagram for contact (enter username without @)',
      placeholder: 'username',
      placeholderEn: 'username',
      required: false
    }
  ]
};

// Экспорт всех анкет
export const allQuestionnaires: Questionnaire[] = [
  childrenQuestionnaire,
  femaleQuestionnaire,
  maleQuestionnaire
];

// Функция для получения анкеты по ID
export function getQuestionnaireById(id: string): Questionnaire | undefined {
  return allQuestionnaires.find(q => q.id === id);
}

