export default function PortfolioHeader() {
  return (
    <>
      <a className="skip-link" href="#main">본문 바로가기</a>
            <header className="site-header" id="top">
          <div className="wrap header-inner">
            <a className="wordmark" href="#home" aria-label="BOWONE 홈"><span className="brand-mark" aria-hidden="true"><svg width="27" height="27" viewBox="0 0 32 32" fill="none"><path d="M3 4h10.5c5.3 0 8 2.5 8 6.1 0 2.7-1.5 4.5-3.5 5.4 3.4.8 5.2 2.7 5.2 5.9 0 4.2-3.1 6.6-8.6 6.6H3V4Zm6 5v4.6h4.1c1.7 0 2.6-.9 2.6-2.3s-.9-2.3-2.6-2.3H9Zm0 9.2V23h5.4c1.9 0 2.8-.9 2.8-2.4s-.9-2.4-2.8-2.4H9Z" fill="currentColor"/><path d="M24 28h5l-2.5-5-2.5 5Z" fill="currentColor"/></svg></span><span>BOWONE<span className="brand-dot">.</span><small>VISUAL WORKS</small></span></a>
            <nav className="primary-nav" aria-label="주 메뉴">
              <a href="#home" data-nav="home" aria-current="page">자기소개</a>
              <a href="#portfolio" data-nav="works">포트폴리오</a>
              <a href="#commissions" data-nav="commissions">의뢰</a>
            </nav>
            <div className="header-actions">
              <button type="button" id="theme-toggle" className="theme-toggle" aria-label="다크 테마" aria-pressed="true" title="밝은 테마로 전환">
                <svg className="theme-moon" aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M20.8 14.3A8.7 8.7 0 0 1 9.7 3.2a8.9 8.9 0 1 0 11.1 11.1Z"/></svg>
                <svg className="theme-sun" aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4m0-14.2-1.4 1.4M6.3 17.7l-1.4 1.4"/></svg>
                <span id="theme-label" aria-hidden="true">다크</span>
              </button>
              <a className="button button-accent header-cta" href="#contact">프로젝트 문의 <span aria-hidden="true">↗</span></a>
            </div>
          </div>
        </header>
    </>
  );
}
