export default function WorkViewer() {
  return (
    <>
      <dialog id="viewer" aria-labelledby="viewer-title">
          <div className="viewer-shell">
            <div className="viewer-top"><span className="index-label" id="viewer-index"></span><button type="button" className="icon-button" id="viewer-close" aria-label="작품 상세 닫기" autoFocus>×</button></div>
            <div className="viewer-media-wrap">
              <div className="viewer-stage" id="viewer-stage"></div>
              <button type="button" className="icon-button viewer-edge prev" id="viewer-prev" aria-label="이전 작품">←</button>
              <button type="button" className="icon-button viewer-edge next" id="viewer-next" aria-label="다음 작품">→</button>
            </div>
            <div className="viewer-footer">
              <div className="viewer-meta" id="viewer-meta"><h2 id="viewer-title"></h2><p id="viewer-desc" hidden></p><a className="text-link" id="viewer-pricing" href="#pricing">이 분야 가격 보기 <span aria-hidden="true">↗</span></a></div>
              <div className="viewer-actions">
                <div className="zoom-controls" id="zoom-controls" hidden aria-label="이미지 확대 도구"><button type="button" className="icon-button" id="zoom-out" aria-label="축소">−</button><button type="button" className="zoom-reset" id="zoom-reset" aria-label="확대 및 위치 초기화">100%</button><button type="button" className="icon-button" id="zoom-in" aria-label="확대">+</button></div>
                <span className="mono" id="viewer-count" aria-live="polite"></span>
              </div>
            </div>
          </div>
        </dialog>
    </>
  );
}
