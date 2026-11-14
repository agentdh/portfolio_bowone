export default function WorksPage() {
  return (
    <div data-page="works" hidden>
      <section className="wrap inner-page" id="portfolio" aria-labelledby="works-title">
        <div className="archive-masthead" data-arrival=""><div><p className="index-label">02 / PORTFOLIO</p><h1 id="works-title">작품 아카이브<span>.</span></h1></div><p>분야로 둘러보거나,<br />기억하는 제목으로 찾아보세요.</p></div>
        <div className="archive-layout">
          <aside className="archive-rail" aria-label="포트폴리오 탐색">
            <p className="rail-caption">분야 인덱스 <span aria-hidden="true">01—08</span></p>
            <div className="filter-row" id="work-groups" aria-label="작업 분야 선택"></div>
            <a className="text-link archive-price-link" id="works-to-pricing" href="#pricing">이 분야 견적 보기 <span aria-hidden="true">↗</span></a>
          </aside>
          <div className="archive-main">
            <div className="archive-toolbar">
              <div className="archive-heading"><h2 id="archive-current">썸네일</h2><p id="work-results" role="status" aria-live="polite"></p></div>
              <div className="filter-tools">
                <label className="field subfield" htmlFor="work-sub"><span>세부 분야</span><select id="work-sub"><option value="">전체</option></select></label>
                <label className="field searchfield" htmlFor="work-query"><span>작품 검색</span><input type="search" id="work-query" placeholder="제목, 설명 또는 분야 검색" autoComplete="off" /></label>
                <button type="button" id="filter-reset" className="button button-outline">필터 초기화</button>
              </div>
            </div>
            <div id="work-sections" className="work-sections"></div>
            <div id="work-empty" className="empty-state" hidden><p>조건에 맞는 작품이 없습니다.</p><button type="button" id="empty-reset" className="button button-outline">필터 초기화</button></div>
          </div>
        </div>
      </section>
    </div>
  );
}
