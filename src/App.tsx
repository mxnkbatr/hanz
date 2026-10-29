import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";

/* Public pages and the whole admin load on demand; Home + Layout stay in the main bundle. */
const About = lazy(() =>
  import("./pages/About").then((m) => ({ default: m.About })),
);
const Courses = lazy(() =>
  import("./pages/Courses").then((m) => ({ default: m.Courses })),
);
const CourseDetail = lazy(() =>
  import("./pages/CourseDetail").then((m) => ({ default: m.CourseDetail })),
);
const News = lazy(() =>
  import("./pages/News").then((m) => ({ default: m.News })),
);
const NewsDetail = lazy(() =>
  import("./pages/NewsDetail").then((m) => ({ default: m.NewsDetail })),
);
const University = lazy(() =>
  import("./pages/University").then((m) => ({ default: m.University })),
);
const UniversityDetail = lazy(() =>
  import("./pages/UniversityDetail").then((m) => ({
    default: m.UniversityDetail,
  })),
);
const Travel = lazy(() =>
  import("./pages/Travel").then((m) => ({ default: m.Travel })),
);
const TravelDetail = lazy(() =>
  import("./pages/TravelDetail").then((m) => ({ default: m.TravelDetail })),
);
const Enroll = lazy(() =>
  import("./pages/Enroll").then((m) => ({ default: m.Enroll })),
);
const Shop = lazy(() =>
  import("./pages/Shop").then((m) => ({ default: m.Shop })),
);
const ProductDetail = lazy(() =>
  import("./pages/ProductDetail").then((m) => ({ default: m.ProductDetail })),
);
const Translation = lazy(() =>
  import("./pages/Translation").then((m) => ({ default: m.Translation })),
);
const Contact = lazy(() =>
  import("./pages/Contact").then((m) => ({ default: m.Contact })),
);
const Profile = lazy(() =>
  import("./pages/Profile").then((m) => ({ default: m.Profile })),
);
const Auth = lazy(() =>
  import("./pages/Auth").then((m) => ({ default: m.Auth })),
);
const Quiz = lazy(() =>
  import("./pages/Quiz").then((m) => ({ default: m.Quiz })),
);
const NotFound = lazy(() =>
  import("./pages/NotFound").then((m) => ({ default: m.NotFound })),
);
const AdminLayout = lazy(() =>
  import("./pages/admin/AdminLayout").then((m) => ({ default: m.AdminLayout })),
);
const AdminDashboard = lazy(() =>
  import("./pages/admin/AdminDashboard").then((m) => ({
    default: m.AdminDashboard,
  })),
);
const AdminLeads = lazy(() =>
  import("./pages/admin/AdminLeads").then((m) => ({ default: m.AdminLeads })),
);
const AdminPages = lazy(() =>
  import("./pages/admin/AdminPages").then((m) => ({ default: m.AdminPages })),
);
const AdminPageSection = lazy(() =>
  import("./pages/admin/AdminPageSection").then((m) => ({
    default: m.AdminPageSection,
  })),
);
const AdminSettings = lazy(() =>
  import("./pages/admin/AdminSettings").then((m) => ({
    default: m.AdminSettings,
  })),
);
const AdminCollection = lazy(() =>
  import("./pages/admin/AdminCollection").then((m) => ({
    default: m.AdminCollection,
  })),
);
const AdminBranches = lazy(() =>
  import("./pages/admin/AdminBranches").then((m) => ({
    default: m.AdminBranches,
  })),
);
const AdminWindows = lazy(() =>
  import("./pages/admin/AdminWindows").then((m) => ({
    default: m.AdminWindows,
  })),
);
const AdminTranslationCms = lazy(() =>
  import("./pages/admin/AdminTranslationCms").then((m) => ({
    default: m.AdminTranslationCms,
  })),
);
const AdminKids = lazy(() =>
  import("./pages/admin/AdminKids").then((m) => ({ default: m.AdminKids })),
);
const AdminQuizCms = lazy(() =>
  import("./pages/admin/AdminQuizCms").then((m) => ({
    default: m.AdminQuizCms,
  })),
);
const AdminStaff = lazy(() =>
  import("./pages/admin/AdminStaff").then((m) => ({ default: m.AdminStaff })),
);
const AdminMedia = lazy(() =>
  import("./pages/admin/AdminMedia").then((m) => ({ default: m.AdminMedia })),
);

/** Tab pages first, then detail pages, so a tap never waits on a chunk mid-transition. */
const PREFETCH = [
  () => import("./pages/Courses"),
  () => import("./pages/University"),
  () => import("./pages/Travel"),
  () => import("./pages/Quiz"),
  () => import("./pages/News"),
  () => import("./pages/CourseDetail"),
  () => import("./pages/UniversityDetail"),
  () => import("./pages/TravelDetail"),
  () => import("./pages/NewsDetail"),
  () => import("./pages/Shop"),
  () => import("./pages/ProductDetail"),
  () => import("./pages/About"),
  () => import("./pages/Contact"),
  () => import("./pages/Enroll"),
  () => import("./pages/Translation"),
  () => import("./pages/Profile"),
  () => import("./pages/Auth"),
];

export default function App() {
  useEffect(() => {
    // Warm every public page once the first paint is done, one per idle slot so the
    // downloads never compete with scrolling.
    const idle =
      window.requestIdleCallback ??
      ((cb: () => void) => window.setTimeout(cb, 300));
    let i = 0;
    let cancelled = false;
    const next = () => {
      if (cancelled || i >= PREFETCH.length) return;
      void PREFETCH[i++]().finally(() => idle(next));
    };
    const start = window.setTimeout(() => idle(next), 1200);
    return () => {
      cancelled = true;
      window.clearTimeout(start);
    };
  }, []);

  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="leads" element={<AdminLeads />} />
            <Route
              path="news"
              element={<AdminCollection collection="news" />}
            />
            <Route
              path="products"
              element={<AdminCollection collection="products" />}
            />
            <Route
              path="courses"
              element={<AdminCollection collection="courses" />}
            />
            <Route
              path="travel"
              element={<AdminCollection collection="travel" />}
            />
            <Route
              path="universities"
              element={<AdminCollection collection="universities" />}
            />
            <Route path="pages" element={<AdminPages />} />
            <Route
              path="pages/news"
              element={<Navigate to="/admin/news" replace />}
            />
            <Route
              path="pages/shop"
              element={<Navigate to="/admin/products" replace />}
            />
            <Route
              path="pages/courses"
              element={<Navigate to="/admin/courses" replace />}
            />
            <Route
              path="pages/travel"
              element={<Navigate to="/admin/travel" replace />}
            />
            <Route
              path="pages/university"
              element={<Navigate to="/admin/universities" replace />}
            />
            <Route path="pages/:section" element={<AdminPageSection />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="branches" element={<AdminBranches />} />
            <Route path="windows" element={<AdminWindows />} />
            <Route path="translation" element={<AdminTranslationCms />} />
            <Route path="kids" element={<AdminKids />} />
            <Route path="quiz" element={<AdminQuizCms />} />
            <Route path="staff" element={<AdminStaff />} />
            <Route path="media" element={<AdminMedia />} />
          </Route>

          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="courses" element={<Courses />} />
            <Route path="courses/:id" element={<CourseDetail />} />
            <Route path="enroll" element={<Enroll />} />
            <Route path="medee" element={<News />} />
            <Route path="medee/:id" element={<NewsDetail />} />
            <Route path="news" element={<Navigate to="/medee" replace />} />
            <Route path="news/:id" element={<NewsDetail />} />
            <Route path="university" element={<University />} />
            <Route path="university/:id" element={<UniversityDetail />} />
            <Route path="travel" element={<Travel />} />
            <Route path="travel/:id" element={<TravelDetail />} />
            <Route path="shop" element={<Shop />} />
            <Route path="shop/:id" element={<ProductDetail />} />
            <Route path="translation" element={<Translation />} />
            <Route path="contact" element={<Contact />} />
            <Route path="profile" element={<Profile />} />
            <Route path="auth" element={<Auth />} />
            <Route
              path="login"
              element={<Navigate to="/auth?mode=login" replace />}
            />
            <Route
              path="signup"
              element={<Navigate to="/auth?mode=signup" replace />}
            />
            <Route path="quiz" element={<Quiz />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
