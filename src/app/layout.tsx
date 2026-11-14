import type { Metadata, Viewport } from "next";
import catalog from "@/data/portfolio.json";
import "./bowone.css";

const production = process.env.VERCEL_ENV === "production";
const productionUrl = new URL("https://portfolio-bowone.vercel.app");
const title = "BOWONE — Portfolio & Commission";
const description = "Illustrator · Animator · 3D Modeler 보원 포트폴리오 및 커미션 안내";
const profile = catalog.profile as Partial<{ ogImgPath: string; ogImgUrl: string; ogImgRawUrl: string }>;

function ogImage() {
  const source = profile.ogImgPath || profile.ogImgUrl || profile.ogImgRawUrl || "";
  if (/^https:\/\//i.test(source)) {
    try {
      const url = new URL(source);
      if (!url.username && !url.password) return url.href;
    } catch { /* Use the bundled share image. */ }
  }
  const segments = source.replace(/^\.\//, "").split("/");
  if (segments[0] === "opimage" && segments.every(segment => segment && segment !== ".." && segment !== ".")) {
    return new URL(segments.map(encodeURIComponent).join("/"), productionUrl).href;
  }
  return new URL("/bowone/assets/og-preview.jpg", productionUrl).href;
}

export const metadata: Metadata = {
  metadataBase: productionUrl,
  title,
  description,
  ...(production ? { alternates: { canonical: "/" } } : { robots: { index: false, follow: false } }),
  openGraph: { type: "website", locale: "ko_KR", title, description, images: [ogImage()], ...(production ? { url: "/" } : {}) },
  twitter: { card: "summary_large_image", title, description, images: [ogImage()] },
};

export const viewport: Viewport = { themeColor: "#0e0e0e" };

const initialTheme = 'try { if (localStorage.getItem("bowone-portfolio-theme") === "light") document.documentElement.dataset.theme = "light"; } catch (_) {}';

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: initialTheme }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
