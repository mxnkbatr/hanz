# ХАНЗ — элсэлтийн апп

React Native + Expo + TypeScript. Вэб болон Capacitor төслийг өөрчлөөгүй. Гарын үсэг, EAS, bundle ID байхгүй — Expo Go болон `npx expo start --web`.

```bash
cd native
npm install
npx expo start --web
```

Утас дээр: `npx expo start` гээд SDK 58-тай Expo Go-оор QR уншуулна.

## Өгөгдөл

`EXPO_PUBLIC_PREVIEW=1` (эсвэл Supabase түлхүүр хоосон) үед каталог, элсэлт, QPay бүгд fixture / sandbox.

| Зүйл | Preview | Түлхүүртэй, `EXPO_PUBLIC_PREVIEW=0` |
| --- | --- | --- |
| Сургалт, аялал, их сургууль | `src/data/fixtures.ts` | `courses`, `travel_packages`, `universities` (хоосон/алдаа бол fixture) |
| Элсэлт | Зөвхөн төхөөрөмж дээр | `enrollments` insert (вэбтэй адил багана). Сонгох RLS байхгүй тул «Миний элсэлт» локал хадгалалт |
| QPay | Sandbox QR, мөнгө гарахгүй | `supabase.functions.invoke("qpay")` — вэбийн `src/lib/qpay.ts`-тай адил |
| Нэвтрэх | Зочин, утас | Supabase email/нууц үг (вэбийн auth) |

Жинхэнэ үнэ: HSK 1 сар **1,800,000₮**, HSK 1–5 зургаан сар **4,800,000₮** (`src/data/content.ts` → `hskFees`). Тэтгэлгийн сургалт, байр үнэгүй гэж вэб дээр бичсэн тул тэдгээрт QPay нэхэмжлэх үүсэхгүй. Аяллын дүн вэб дээр тоогүй — fixture дээр **жишиг үнэ** гэж тэмдэглэсэн.

Холбоо барих (вэб + `src/data/content.ts`): 9990-7748, 9999-1573, surgalthanz@gmail.com, Union Building 1204.

## QPay интерфэйс

`src/services/types.ts` → `PaymentService`

- `createInvoice(draft)` → QR, дүн, банкны deep link, эсвэл `{ unavailable, reason }`
- `check(id)` → `pending | paid | failed`
- `sandboxSettle` / `sandboxFail` — зөвхөн sandbox. Бодит төлбөр биш.

Бодит горимд дүнгийн эх үүсвэр нь сервер: `supabase/functions/qpay/index.ts` доторх `PRICES` (`intensive` `m1`/`m6`, `kids` `m9`). Клиент дүн илгээхгүй.

### Сервер дээр дутуу

1. QPay merchant: `QPAY_CLIENT_ID`, `QPAY_CLIENT_SECRET`, `QPAY_INVOICE_CODE`, `QPAY_BASE_URL` (`supabase/QPAY_SETUP.md`).
2. `qpay` функцийг `--no-verify-jwt`-ээр deploy.
3. Аялал, тэтгэлгийг QPay-ээр авах бол `PRICES`-д тэдгээрийн `interest` + `plan`-ыг нэмнэ. Одоогийн функц тэдэнд `no_payment` буцаана.
4. Апп дээр `EXPO_PUBLIC_SUPABASE_URL` ба `EXPO_PUBLIC_SUPABASE_ANON_KEY` (anon түлхүүр). Service role бичиж болохгүй.
5. «Миний элсэлт»-ийг өөр төхөөрөмжөөс харах бол өөрийн мөрөө унших RLS (`auth.uid()` эсвэл утас) хэрэгтэй. Одоо public SELECT байхгүй.
