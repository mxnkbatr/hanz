import type { Lang } from "../i18n/translations";

export type QuizLevel = "hsk1" | "hsk2" | "hsk3";

export type QuizOption = {
  mn: string;
  en: string;
  zh: string;
};

export type QuizQuestion = {
  id: string;
  level: QuizLevel;
  kind: "meaning" | "pinyin";
  hanzi: string;
  pinyin: string;
  options: QuizOption[];
  correct: number;
};

export const quizLevels: {
  id: QuizLevel;
  titleKey: string;
  descKey: string;
  badge: string;
}[] = [
  {
    id: "hsk1",
    titleKey: "quiz_lvl_hsk1",
    descKey: "quiz_lvl_hsk1_d",
    badge: "HSK1",
  },
  {
    id: "hsk2",
    titleKey: "quiz_lvl_hsk2",
    descKey: "quiz_lvl_hsk2_d",
    badge: "HSK2",
  },
  {
    id: "hsk3",
    titleKey: "quiz_lvl_hsk3",
    descKey: "quiz_lvl_hsk3_d",
    badge: "HSK3",
  },
];

/** Branded HSK check — questions grouped by level. */
export const quizQuestions: QuizQuestion[] = [
  // ─── HSK1 ───
  {
    id: "h1-nihao",
    level: "hsk1",
    kind: "meaning",
    hanzi: "你好",
    pinyin: "nǐ hǎo",
    options: [
      { mn: "Сайн байна уу", en: "Hello", zh: "打招呼" },
      { mn: "Баяртай", en: "Goodbye", zh: "再见" },
      { mn: "Баярлалаа", en: "Thank you", zh: "谢谢" },
      { mn: "Уучлаарай", en: "Sorry", zh: "抱歉" },
    ],
    correct: 0,
  },
  {
    id: "h1-xiexie",
    level: "hsk1",
    kind: "meaning",
    hanzi: "谢谢",
    pinyin: "xiè xie",
    options: [
      { mn: "Баяртай", en: "Goodbye", zh: "再见" },
      { mn: "Баярлалаа", en: "Thank you", zh: "感谢" },
      { mn: "Тийм", en: "Yes", zh: "是" },
      { mn: "Үгүй", en: "No", zh: "不是" },
    ],
    correct: 1,
  },
  {
    id: "h1-zaijian",
    level: "hsk1",
    kind: "pinyin",
    hanzi: "再见",
    pinyin: "zài jiàn",
    options: [
      { mn: "zài jiàn", en: "zài jiàn", zh: "zài jiàn" },
      { mn: "zǎo shang", en: "zǎo shang", zh: "zǎo shang" },
      { mn: "xiè xie", en: "xiè xie", zh: "xiè xie" },
      { mn: "nǐ hǎo", en: "nǐ hǎo", zh: "nǐ hǎo" },
    ],
    correct: 0,
  },
  {
    id: "h1-wo",
    level: "hsk1",
    kind: "meaning",
    hanzi: "我",
    pinyin: "wǒ",
    options: [
      { mn: "Чи", en: "You", zh: "你" },
      { mn: "Би", en: "I / me", zh: "我" },
      { mn: "Тэр", en: "He / she", zh: "他/她" },
      { mn: "Бид", en: "We", zh: "我们" },
    ],
    correct: 1,
  },
  {
    id: "h1-shui",
    level: "hsk1",
    kind: "meaning",
    hanzi: "水",
    pinyin: "shuǐ",
    options: [
      { mn: "Цай", en: "Tea", zh: "茶" },
      { mn: "Ус", en: "Water", zh: "水" },
      { mn: "Сүү", en: "Milk", zh: "牛奶" },
      { mn: "Кофе", en: "Coffee", zh: "咖啡" },
    ],
    correct: 1,
  },
  {
    id: "h1-hao",
    level: "hsk1",
    kind: "meaning",
    hanzi: "好",
    pinyin: "hǎo",
    options: [
      { mn: "Муу", en: "Bad", zh: "坏" },
      { mn: "Том", en: "Big", zh: "大" },
      { mn: "Сайн", en: "Good", zh: "好" },
      { mn: "Жижиг", en: "Small", zh: "小" },
    ],
    correct: 2,
  },
  {
    id: "h1-chi",
    level: "hsk1",
    kind: "pinyin",
    hanzi: "吃",
    pinyin: "chī",
    options: [
      { mn: "hē", en: "hē", zh: "hē" },
      { mn: "chī", en: "chī", zh: "chī" },
      { mn: "kàn", en: "kàn", zh: "kàn" },
      { mn: "shuō", en: "shuō", zh: "shuō" },
    ],
    correct: 1,
  },
  {
    id: "h1-rizi",
    level: "hsk1",
    kind: "meaning",
    hanzi: "今天",
    pinyin: "jīn tiān",
    options: [
      { mn: "Өнөөдөр", en: "Today", zh: "今天" },
      { mn: "Маргааш", en: "Tomorrow", zh: "明天" },
      { mn: "Өчигдөр", en: "Yesterday", zh: "昨天" },
      { mn: "Одоо", en: "Now", zh: "现在" },
    ],
    correct: 0,
  },

  // ─── HSK2 ───
  {
    id: "h2-xuexi",
    level: "hsk2",
    kind: "meaning",
    hanzi: "学习",
    pinyin: "xué xí",
    options: [
      { mn: "Тоглох", en: "To play", zh: "玩" },
      { mn: "Идэх", en: "To eat", zh: "吃" },
      { mn: "Сурах", en: "To study", zh: "学习" },
      { mn: "Унтах", en: "To sleep", zh: "睡觉" },
    ],
    correct: 2,
  },
  {
    id: "h2-laoshi",
    level: "hsk2",
    kind: "pinyin",
    hanzi: "老师",
    pinyin: "lǎo shī",
    options: [
      { mn: "xué sheng", en: "xué sheng", zh: "xué sheng" },
      { mn: "lǎo shī", en: "lǎo shī", zh: "lǎo shī" },
      { mn: "péng you", en: "péng you", zh: "péng you" },
      { mn: "tóng xué", en: "tóng xué", zh: "tóng xué" },
    ],
    correct: 1,
  },
  {
    id: "h2-mingtian",
    level: "hsk2",
    kind: "pinyin",
    hanzi: "明天",
    pinyin: "míng tiān",
    options: [
      { mn: "jīn tiān", en: "jīn tiān", zh: "jīn tiān" },
      { mn: "zuó tiān", en: "zuó tiān", zh: "zuó tiān" },
      { mn: "míng tiān", en: "míng tiān", zh: "míng tiān" },
      { mn: "xiàn zài", en: "xiàn zài", zh: "xiàn zài" },
    ],
    correct: 2,
  },
  {
    id: "h2-zhongguo",
    level: "hsk2",
    kind: "meaning",
    hanzi: "中国",
    pinyin: "zhōng guó",
    options: [
      { mn: "Япон", en: "Japan", zh: "日本" },
      { mn: "Солонгос", en: "Korea", zh: "韩国" },
      { mn: "Хятад", en: "China", zh: "中国" },
      { mn: "Монгол", en: "Mongolia", zh: "蒙古" },
    ],
    correct: 2,
  },
  {
    id: "h2-yiyuan",
    level: "hsk2",
    kind: "meaning",
    hanzi: "医院",
    pinyin: "yī yuàn",
    options: [
      { mn: "Сургууль", en: "School", zh: "学校" },
      { mn: "Эмнэлэг", en: "Hospital", zh: "医院" },
      { mn: "Дэлгүүр", en: "Shop", zh: "商店" },
      { mn: "Банк", en: "Bank", zh: "银行" },
    ],
    correct: 1,
  },
  {
    id: "h2-yinwei",
    level: "hsk2",
    kind: "meaning",
    hanzi: "因为",
    pinyin: "yīn wèi",
    options: [
      { mn: "Гэхдээ", en: "But", zh: "但是" },
      { mn: "Тиймээс", en: "Therefore", zh: "所以" },
      { mn: "Учир нь", en: "Because", zh: "因为" },
      { mn: "Хэрэв", en: "If", zh: "如果" },
    ],
    correct: 2,
  },
  {
    id: "h2-kaishi",
    level: "hsk2",
    kind: "pinyin",
    hanzi: "开始",
    pinyin: "kāi shǐ",
    options: [
      { mn: "jié shù", en: "jié shù", zh: "jié shù" },
      { mn: "kāi shǐ", en: "kāi shǐ", zh: "kāi shǐ" },
      { mn: "jì xù", en: "jì xù", zh: "jì xù" },
      { mn: "tíng zhǐ", en: "tíng zhǐ", zh: "tíng zhǐ" },
    ],
    correct: 1,
  },
  {
    id: "h2-pengyou",
    level: "hsk2",
    kind: "meaning",
    hanzi: "朋友",
    pinyin: "péng you",
    options: [
      { mn: "Найз", en: "Friend", zh: "朋友" },
      { mn: "Гэр бүл", en: "Family", zh: "家人" },
      { mn: "Багш", en: "Teacher", zh: "老师" },
      { mn: "Сурагч", en: "Student", zh: "学生" },
    ],
    correct: 0,
  },

  // ─── HSK3 ───
  {
    id: "h3-jingli",
    level: "hsk3",
    kind: "meaning",
    hanzi: "经理",
    pinyin: "jīng lǐ",
    options: [
      { mn: "Менежер", en: "Manager", zh: "经理" },
      { mn: "Эмч", en: "Doctor", zh: "医生" },
      { mn: "Жолооч", en: "Driver", zh: "司机" },
      { mn: "Хоолчин", en: "Waiter", zh: "服务员" },
    ],
    correct: 0,
  },
  {
    id: "h3-lishi",
    level: "hsk3",
    kind: "pinyin",
    hanzi: "历史",
    pinyin: "lì shǐ",
    options: [
      { mn: "dì lǐ", en: "dì lǐ", zh: "dì lǐ" },
      { mn: "lì shǐ", en: "lì shǐ", zh: "lì shǐ" },
      { mn: "shù xué", en: "shù xué", zh: "shù xué" },
      { mn: "yīn yuè", en: "yīn yuè", zh: "yīn yuè" },
    ],
    correct: 1,
  },
  {
    id: "h3-huanjing",
    level: "hsk3",
    kind: "meaning",
    hanzi: "环境",
    pinyin: "huán jìng",
    options: [
      { mn: "Орчин", en: "Environment", zh: "环境" },
      { mn: "Агаар", en: "Air", zh: "空气" },
      { mn: "Цаг агаар", en: "Weather", zh: "天气" },
      { mn: "Байгаль", en: "Nature", zh: "自然" },
    ],
    correct: 0,
  },
  {
    id: "h3-jingyan",
    level: "hsk3",
    kind: "meaning",
    hanzi: "经验",
    pinyin: "jīng yàn",
    options: [
      { mn: "Туршлага", en: "Experience", zh: "经验" },
      { mn: "Мэдлэг", en: "Knowledge", zh: "知识" },
      { mn: "Ур чадвар", en: "Skill", zh: "技能" },
      { mn: "Санаа", en: "Idea", zh: "想法" },
    ],
    correct: 0,
  },
  {
    id: "h3-tebie",
    level: "hsk3",
    kind: "pinyin",
    hanzi: "特别",
    pinyin: "tè bié",
    options: [
      { mn: "yī bān", en: "yī bān", zh: "yī bān" },
      { mn: "tè bié", en: "tè bié", zh: "tè bié" },
      { mn: "fēi cháng", en: "fēi cháng", zh: "fēi cháng" },
      { mn: "mǎ shàng", en: "mǎ shàng", zh: "mǎ shàng" },
    ],
    correct: 1,
  },
  {
    id: "h3-wenti",
    level: "hsk3",
    kind: "meaning",
    hanzi: "问题",
    pinyin: "wèn tí",
    options: [
      { mn: "Хариулт", en: "Answer", zh: "答案" },
      { mn: "Асуулт / асуудал", en: "Question / problem", zh: "问题" },
      { mn: "Санал", en: "Suggestion", zh: "建议" },
      { mn: "Шийдэл", en: "Solution", zh: "解决办法" },
    ],
    correct: 1,
  },
  {
    id: "h3-chengji",
    level: "hsk3",
    kind: "meaning",
    hanzi: "成绩",
    pinyin: "chéng jì",
    options: [
      { mn: "Үнэ", en: "Price", zh: "价格" },
      { mn: "Дүн / амжилт", en: "Grade / result", zh: "成绩" },
      { mn: "Цаг", en: "Time", zh: "时间" },
      { mn: "Газар", en: "Place", zh: "地方" },
    ],
    correct: 1,
  },
  {
    id: "h3-jihui",
    level: "hsk3",
    kind: "pinyin",
    hanzi: "机会",
    pinyin: "jī huì",
    options: [
      { mn: "jī huì", en: "jī huì", zh: "jī huì" },
      { mn: "tiáo jiàn", en: "tiáo jiàn", zh: "tiáo jiàn" },
      { mn: "fāng fǎ", en: "fāng fǎ", zh: "fāng fǎ" },
      { mn: "mù dì", en: "mù dì", zh: "mù dì" },
    ],
    correct: 0,
  },
];

export function questionsForLevel(level: QuizLevel) {
  return quizQuestions.filter((q) => q.level === level);
}

export function optionLabel(opt: QuizOption, lang: Lang) {
  return opt[lang];
}

export function shuffleIndices(n: number) {
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
