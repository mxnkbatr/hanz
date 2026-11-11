export type LessonKind = "placement" | "daily";

export type ChoiceQ = {
  id: string;
  type: "choice";
  prompt: string;
  hanzi?: string;
  pinyin?: string;
  options: string[];
  correct: number;
};

export type ToneQ = {
  id: string;
  type: "tone";
  hanzi: string;
  syllable: string;
  options: string[];
  correct: number;
};

export type MatchQ = {
  id: string;
  type: "match";
  prompt: string;
  pairs: { left: string; right: string }[];
};

export type ListenQ = {
  id: string;
  type: "listen";
  prompt: string;
  caption: string;
  options: string[];
  correct: number;
};

export type Question = ChoiceQ | ToneQ | MatchQ | ListenQ;

export type Lesson = {
  id: string;
  kind: LessonKind;
  level: "HSK 1" | "HSK 2" | "Байршуулалт";
  title: string;
  subtitle: string;
  minutes: number;
  xp: number;
  questions: Question[];
  /** Course to open after a placement result. */
  suggest: { below40: string; below75: string; else: string };
};

const hsk1Choice: ChoiceQ[] = [
  {
    id: "h1-nihao",
    type: "choice",
    prompt: "Энэ үг юу гэсэн үг вэ?",
    hanzi: "你好",
    pinyin: "nǐ hǎo",
    options: ["Сайн байна уу", "Баяртай", "Баярлалаа", "Уучлаарай"],
    correct: 0,
  },
  {
    id: "h1-xiexie",
    type: "choice",
    prompt: "Энэ үг юу гэсэн үг вэ?",
    hanzi: "谢谢",
    pinyin: "xiè xie",
    options: ["Баяртай", "Баярлалаа", "Тийм", "Үгүй"],
    correct: 1,
  },
  {
    id: "h1-wo",
    type: "choice",
    prompt: "Энэ үг юу гэсэн үг вэ?",
    hanzi: "我",
    pinyin: "wǒ",
    options: ["Чи", "Би", "Тэр", "Бид"],
    correct: 1,
  },
  {
    id: "h1-shui",
    type: "choice",
    prompt: "Энэ үг юу гэсэн үг вэ?",
    hanzi: "水",
    pinyin: "shuǐ",
    options: ["Цай", "Ус", "Сүү", "Кофе"],
    correct: 1,
  },
  {
    id: "h1-hao",
    type: "choice",
    prompt: "Энэ үг юу гэсэн үг вэ?",
    hanzi: "好",
    pinyin: "hǎo",
    options: ["Муу", "Том", "Сайн", "Жижиг"],
    correct: 2,
  },
  {
    id: "h1-today",
    type: "choice",
    prompt: "Энэ үг юу гэсэн үг вэ?",
    hanzi: "今天",
    pinyin: "jīn tiān",
    options: ["Өнөөдөр", "Маргааш", "Өчигдөр", "Одоо"],
    correct: 0,
  },
];

const hsk2Choice: ChoiceQ[] = [
  {
    id: "h2-xuexi",
    type: "choice",
    prompt: "Энэ үг юу гэсэн үг вэ?",
    hanzi: "学习",
    pinyin: "xué xí",
    options: ["Тоглох", "Идэх", "Сурах", "Унтах"],
    correct: 2,
  },
  {
    id: "h2-zhongguo",
    type: "choice",
    prompt: "Энэ үг юу гэсэн үг вэ?",
    hanzi: "中国",
    pinyin: "zhōng guó",
    options: ["Япон", "Солонгос", "Хятад", "Монгол"],
    correct: 2,
  },
  {
    id: "h2-yiyuan",
    type: "choice",
    prompt: "Энэ үг юу гэсэн үг вэ?",
    hanzi: "医院",
    pinyin: "yī yuàn",
    options: ["Сургууль", "Эмнэлэг", "Дэлгүүр", "Банк"],
    correct: 1,
  },
  {
    id: "h2-yinwei",
    type: "choice",
    prompt: "Энэ үг юу гэсэн үг вэ?",
    hanzi: "因为",
    pinyin: "yīn wèi",
    options: ["Гэхдээ", "Тиймээс", "Учир нь", "Хэрэв"],
    correct: 2,
  },
  {
    id: "h2-pengyou",
    type: "choice",
    prompt: "Энэ үг юу гэсэн үг вэ?",
    hanzi: "朋友",
    pinyin: "péng you",
    options: ["Найз", "Гэр бүл", "Багш", "Сурагч"],
    correct: 0,
  },
];

export const lessons: Lesson[] = [
  {
    id: "placement",
    kind: "placement",
    level: "Байршуулалт",
    title: "Түвшин тогтоох",
    subtitle: "HSK 1–2 дээрх богино сорил. Тохирох анги руу нээнэ.",
    minutes: 4,
    xp: 40,
    suggest: { below40: "hsk1", below75: "hsk2", else: "hsk3" },
    questions: [
      hsk1Choice[0],
      hsk1Choice[3],
      {
        id: "p-tone",
        type: "tone",
        hanzi: "好",
        syllable: "hao",
        options: ["hǎo · 3-р хөг", "hāo · 1-р хөг", "háo · 2-р хөг", "hào · 4-р хөг"],
        correct: 0,
      },
      hsk2Choice[0],
      {
        id: "p-match",
        type: "match",
        prompt: "Хосыг нь олоорой",
        pairs: [
          { left: "你好", right: "Сайн байна уу" },
          { left: "谢谢", right: "Баярлалаа" },
          { left: "学习", right: "Сурах" },
          { left: "中国", right: "Хятад" },
        ],
      },
      hsk2Choice[2],
    ],
  },
  {
    id: "daily-hsk1",
    kind: "daily",
    level: "HSK 1",
    title: "Өнөөдрийн HSK 1",
    subtitle: "Сонголт, хөг, хос, сонсгол.",
    minutes: 5,
    xp: 30,
    suggest: { below40: "hsk1", below75: "hsk1", else: "hsk2" },
    questions: [
      hsk1Choice[1],
      hsk1Choice[4],
      {
        id: "d1-pinyin",
        type: "choice",
        prompt: "Зөв пиньинь аль нь вэ?",
        hanzi: "再见",
        options: ["zài jiàn", "zǎo shang", "xiè xie", "nǐ hǎo"],
        correct: 0,
      },
      {
        id: "d1-tone",
        type: "tone",
        hanzi: "吃",
        syllable: "chi",
        options: ["chī · 1-р хөг", "chí · 2-р хөг", "chǐ · 3-р хөг", "chì · 4-р хөг"],
        correct: 0,
      },
      {
        id: "d1-match",
        type: "match",
        prompt: "Үг ба утгыг холбоно уу",
        pairs: [
          { left: "我", right: "Би" },
          { left: "水", right: "Ус" },
          { left: "好", right: "Сайн" },
          { left: "今天", right: "Өнөөдөр" },
        ],
      },
      {
        id: "d1-listen",
        type: "listen",
        prompt: "Сонсоод утгыг нь сонгоно уу",
        caption: "nǐ hǎo — аудио файл холбогдоогүй, долгион нь загвар",
        options: ["Сайн байна уу", "Баяртай", "Баярлалаа", "Ус"],
        correct: 0,
      },
    ],
  },
  {
    id: "daily-hsk2",
    kind: "daily",
    level: "HSK 2",
    title: "Өнөөдрийн HSK 2",
    subtitle: "Өдөр тутмын үг, пиньинь, хос.",
    minutes: 5,
    xp: 30,
    suggest: { below40: "hsk2", below75: "hsk2", else: "hsk3" },
    questions: [
      hsk2Choice[1],
      hsk2Choice[3],
      {
        id: "d2-pinyin",
        type: "choice",
        prompt: "Зөв пиньинь аль нь вэ?",
        hanzi: "老师",
        options: ["xué sheng", "lǎo shī", "péng you", "tóng xué"],
        correct: 1,
      },
      {
        id: "d2-tone",
        type: "tone",
        hanzi: "学",
        syllable: "xue",
        options: ["xuē · 1-р хөг", "xué · 2-р хөг", "xuě · 3-р хөг", "xuè · 4-р хөг"],
        correct: 1,
      },
      {
        id: "d2-match",
        type: "match",
        prompt: "Хосыг нь олоорой",
        pairs: [
          { left: "学习", right: "Сурах" },
          { left: "医院", right: "Эмнэлэг" },
          { left: "朋友", right: "Найз" },
          { left: "因为", right: "Учир нь" },
        ],
      },
      {
        id: "d2-listen",
        type: "listen",
        prompt: "Сонсоод үгийг нь сонгоно уу",
        caption: "míng tiān — аудио файл холбогдоогүй, долгион нь загвар",
        options: ["Маргааш", "Өнөөдөр", "Өчигдөр", "Одоо"],
        correct: 0,
      },
    ],
  },
];

export function lessonById(id: string) {
  return lessons.find((l) => l.id === id);
}

export function suggestProgramId(lesson: Lesson, ratio: number) {
  if (ratio < 0.4) return lesson.suggest.below40;
  if (ratio < 0.75) return lesson.suggest.below75;
  return lesson.suggest.else;
}
