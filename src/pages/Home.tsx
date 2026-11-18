import { lazy, Suspense } from "react";
import { PageShell } from "../components/PageShell";
import { MobileHome } from "../components/MobileHome";
import { PageSkeleton } from "../components/PageSkeleton";
import { useDesktop } from "../hooks/useDesktop";

/* The desktop home (cinematic hero, scroll scenes, marquee…) is a separate chunk,
   so a phone never downloads or parses it. */
const HomeDesktop = lazy(() =>
  import("./HomeDesktop").then((m) => ({ default: m.HomeDesktop })),
);

export function Home() {
  const desktop = useDesktop();
  if (!desktop) {
    return (
      <PageShell className="page-home page-home-mobile">
        <MobileHome />
      </PageShell>
    );
  }
  return (
    <Suspense fallback={<PageSkeleton variant="home" />}>
      <HomeDesktop />
    </Suspense>
  );
}
