import { ARTIST_PROFILE } from "@/data/portfolio";

export default function PortfolioFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-top">
        <a className="footer-brand" href="#home">BOWONE<span>.</span></a>
        <nav aria-label="외부 채널">
          {ARTIST_PROFILE.socials.map(({ name, url }) => (
            <a key={url} href={url} target="_blank" rel="noopener noreferrer">{name === "X (Twitter)" ? "X" : name} <span aria-hidden="true">↗</span></a>
          ))}
          <a id="footer-email" href="mailto:agentdh@naver.com">이메일 <span aria-hidden="true">↗</span></a>
        </nav>
      </div>
      <div className="wrap footer-bottom"><span>© 2026 BOWONE. All rights reserved.</span><span>PORTFOLIO / COMMISSION</span><a href="#top" id="back-top">맨 위로 ↑</a></div>
    </footer>
  );
}
