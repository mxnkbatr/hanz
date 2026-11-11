/** Verified from src/data/content.ts and https://hanz-swart.vercel.app/contact (2026-11-11). */
export const academy = {
  brand: "ХАНЗ",
  brandZh: "汉兹",
  legal: "Ханз Академи",
  tagline: "Хятад хэлний академи",
  founded: "2014",
  years: "12",
  graduates: "8000+",
  graduatesValue: 8000,
  scholarshipStudents: "10000+",
  scholarshipValue: 10000,
  partners: "300+",
  partnersValue: 300,
  colleges: "70+",
  /** content.ts academy.tianjinStudents */
  tianjin: "250+",
  /** siteCopy about_body2 — partnership rights, not a campus count we operate. */
  polandUnis: "35",
  polandNote: "2026.07.22-нд Польш улсын 35 их сургуультай хамтран ажиллах эрх.",
  /** siteCopy about_body2 */
  scg: "Хятадын SCG (Study in China Global)-ийн албан ёсны эрх бүхий байгууллага.",
  phones: [
    { display: "9990-7748", raw: "99907748" },
    { display: "9999-1573", raw: "99991573" },
  ],
  email: "surgalthanz@gmail.com",
  facebook: "https://www.facebook.com/HanzAcademy",
  instagram: "https://www.instagram.com/khanzacademy/",
  whatsapp: "https://wa.me/97699907748",
  address: "СБД, 1-р хороо, Замын цагдаагийн зүүн талд, Union Building, А блок, 12 давхар, 1204",
  hours: "Даваа–Бямба · 10:00–18:00 (цайны цаг 13:00–14:00)",
  map: "https://www.google.com/maps/search/?api=1&query=Union+Building+Sukhbaatar+Ulaanbaatar",
  about:
    "2014 оноос хойш HSK1–6 сургалт, Хятадын их сургуулийн тэтгэлэг, өвөл зуны хөтөлбөрийг зохион байгуулж ирсэн. Хэлний бэлтгэлээс бакалавр, магистр хүртэл элсэлтийг эндээс эхлүүлнэ.",
  branches: [
    {
      id: "ub",
      title: "Төв салбар, Улаанбаатар",
      address: "СБД, 1-р хороо, Union Building, А блок, 12 давхар, 1204 тоот",
      phones: ["9990-7748", "9999-1573"],
    },
    {
      id: "gs",
      title: "Говьсүмбэр",
      address: "Найрамдал хотхон, 12-р байр, 1-р орц, 2 тоот",
      phones: ["9987-0840"],
    },
    {
      id: "nl",
      title: "Налайх",
      address: "Налгар худалдааны төв, 2 давхар, 2 тоот",
      phones: ["9096-3996", "9979-8438"],
    },
    {
      id: "bo",
      title: "Баян-Өлгий",
      address: "Алтай академи",
      phones: ["9587-4848"],
    },
  ],
} as const;
