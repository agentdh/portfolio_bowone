import AboutPage from "@/components/redesign/AboutPage";
import CommissionPage from "@/components/redesign/CommissionPage";
import PortfolioFooter from "@/components/redesign/PortfolioFooter";
import PortfolioHeader from "@/components/redesign/PortfolioHeader";
import WorkViewer from "@/components/redesign/WorkViewer";
import WorksPage from "@/components/redesign/WorksPage";
import RedesignInteractions from "@/components/redesign/RedesignInteractions";
import catalog from "@/data/portfolio.json";
import siteAssets from "@/redesign/site-assets.json";
import pricing from "@/redesign/pricing.json";
import editorSettings from "@/redesign/editor-settings.json";

const jsonScript = (value: unknown) =>
  JSON.stringify(value).replaceAll("<", "\\u003c").replaceAll("\u2028", "\\u2028").replaceAll("\u2029", "\\u2029");

const site = {
  ...siteAssets,
  prices: pricing,
  editorSettings,
  catalogRefresh: false,
  showTitleByDefault: false,
  useLocalOriginals: process.env.VERCEL_ENV === "production" || process.env.BOWONE_LOCAL_ORIGINALS === "1",
};

export default function PortfolioPage() {
  return (
    <>
      <PortfolioHeader />
      <main id="main" tabIndex={-1}>
        <AboutPage />
        <WorksPage />
        <CommissionPage />
        <noscript><p className="wrap notice">전체 작품 탐색과 가격표를 보려면 자바스크립트를 켜 주세요. 문의: <a href={"mailto:" + catalog.profile.email}>{catalog.profile.email}</a></p></noscript>
      </main>
      <PortfolioFooter />
      <WorkViewer />
      <script type="application/json" id="portfolio-data" dangerouslySetInnerHTML={{ __html: jsonScript({ profile: catalog.profile, portfolio: catalog.portfolio }) }} />
      <script type="application/json" id="site-data" dangerouslySetInnerHTML={{ __html: jsonScript(site) }} />
      <RedesignInteractions />
    </>
  );
}
