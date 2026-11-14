/* eslint-disable @next/next/no-img-element -- Local responsive artwork uses original source paths. */

import ArtistIntro from "./ArtistIntro";

export default function AboutPage() {
  return (
    <div data-page="home">
      <section className="hero" id="home" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="index-label"><span className="label-square" aria-hidden="true"></span> MULTIMEDIA ARTIST · COMMISSION OPEN</p>
          <h1 id="hero-title"><span id="hero-title-word" data-edit-key="hero.name">BOWONE</span><span aria-hidden="true">.</span></h1>
          <p className="hero-lead" data-edit-key="hero.lead">캐릭터와 장면을 그리고,<br /> 움직임까지 만듭니다.</p>
          <p className="hero-desc" id="profile-role">Illustrator · Animator · 3D Modeler</p>
          <div className="hero-actions">
            <a className="button button-accent" href="#selected">대표작 보기 <span aria-hidden="true">↓</span></a>
            <a className="hero-secondary text-link" href="#about">소개·경력 <span aria-hidden="true">↓</span></a>
          </div>
          <div className="hero-folio"><span>ILLUSTRATION / 3D / MOTION / PIXEL</span><span aria-hidden="true">⌑</span></div>
        </div>
        <figure className="hero-figure" aria-label="대표 작품">
          <button type="button" className="hero-cover" id="hero-cover" data-feature="parallax" aria-label="PARALLAX 작품 상세 보기">
            <img id="hero-image" src="/bowone/assets/parallax-landscape.webp" alt="유리 파편과 인물의 반사가 교차하는 PARALLAX 일러스트" width="2916" height="1640" fetchPriority="high" decoding="async" />
            <span className="image-index" id="hero-image-index">01 / FEATURED</span><span className="image-open" aria-hidden="true">↗</span>
          </button>
          <figcaption className="hero-caption">
            <div id="hero-caption" aria-live="polite"><span className="index-label" id="hero-kind">ILLUSTRATION / CONCEPT ART</span><strong id="hero-name">PARALLAX</strong></div>
            <div className="hero-controls"><span className="mono" id="hero-count" aria-hidden="true">01 / 04</span><button type="button" id="hero-prev" className="icon-button" aria-label="이전 대표 작품">←</button><button type="button" id="hero-next" className="icon-button" aria-label="다음 대표 작품">→</button></div>
          </figcaption>
        </figure>
      </section>

      <ArtistIntro />

      <section className="section wrap" id="selected" aria-labelledby="selected-title">
        <div className="section-heading editorial-heading" data-arrival="">
          <div><p className="index-label">01 / SELECTED WORK</p><h2 id="selected-title">대표 작업<span>.</span></h2></div>
          <p>한 장의 일러스트부터 캐릭터 모델과 게임 화면까지. 매체마다 다른 네 가지 작업을 골랐습니다.</p>
        </div>
        <div className="featured-grid editorial-grid">
          <article className="feature-card feature-lead" data-arrival="">
            <button type="button" className="feature-media" data-feature="parallax" aria-label="PARALLAX 대표작 상세 보기"><img src="/bowone/assets/parallax-landscape.webp" alt="캐릭터와 반사된 얼굴, 유리 파편을 배치한 PARALLAX 일러스트" width="1440" height="810" loading="lazy" decoding="async" /><span className="image-index">01 / ILLUSTRATION</span><span className="image-open" aria-hidden="true">↗</span></button>
            <div className="feature-meta"><div><h3>PARALLAX</h3><p>키 비주얼과 캐릭터 컨셉아트</p></div><a href="#portfolio/illust">일러스트 <span aria-hidden="true">↗</span></a></div>
          </article>
          <article className="feature-card feature-pixel" data-arrival="" data-arrival-delay="72">
            <button type="button" className="feature-media" data-feature="pixel" aria-label="인게임 픽셀아트 상세 보기"><img src="/bowone/assets/pixel-scene.webp" alt="두 캐릭터가 대결하는 픽셀아트 게임 장면" width="1280" height="720" loading="lazy" decoding="async" /><span className="image-index">02 / GAME ART</span><span className="image-open" aria-hidden="true">↗</span></button>
            <div className="feature-meta"><div><h3>인게임 픽셀아트</h3><p>격투 게임 화면에 맞춘 픽셀 그래픽</p></div><a href="#portfolio/pixel">픽셀아트 <span aria-hidden="true">↗</span></a></div>
          </article>
          <article className="feature-card feature-model" data-arrival="">
            <button type="button" className="feature-media" data-feature="model" aria-label="3D 캐릭터 작업 상세 보기"><img src="/bowone/assets/model-unity.webp" alt="Unity 화면에서 확인한 3D 캐릭터 모델" width="1000" height="621" loading="lazy" decoding="async" /><span className="image-index">03 / 3D</span><span className="image-open" aria-hidden="true">↗</span></button>
            <div className="feature-meta"><div><h3>3D 캐릭터 작업</h3><p>Maya 모델링과 Unity 확인 화면</p></div><a href="#portfolio/3d">3D <span aria-hidden="true">↗</span></a></div>
          </article>
          <article className="feature-card feature-thumbnail" data-arrival="" data-arrival-delay="72">
            <button type="button" className="feature-media" data-feature="thumbnail" aria-label="LD 썸네일 작업 상세 보기"><img src="/bowone/assets/thumbnail-may.webp" alt="두 장면을 한 컷에 담은 조자라 LD 썸네일" width="1100" height="619" loading="lazy" decoding="async" /><span className="image-index">04 / THUMBNAIL</span><span className="image-open" aria-hidden="true">↗</span></button>
            <div className="feature-meta"><div><h3>LD 썸네일</h3><p>표정과 타이포그래피로 장면을 압축한 방송용 이미지</p></div><a href="#portfolio/thumbnail">썸네일 <span aria-hidden="true">↗</span></a></div>
          </article>
        </div>
        <div className="works-end" data-arrival=""><a className="text-link" href="#portfolio">전체 작품 보기 <span className="mono" id="home-work-count"></span><span aria-hidden="true">↗</span></a></div>
      </section>

      <section className="about-section" id="about" aria-labelledby="about-title">
        <div className="wrap about-layout">
          <div className="about-chapter" data-arrival="">
            <p className="index-label">02 / ABOUT &amp; CAREER</p>
            <h2 id="about-title">안녕하세요,<br />보원입니다<span>.</span></h2>
            <a className="text-link" href="#services">작업 분야 보기 <span aria-hidden="true">↓</span></a>
          </div>
          <div className="about-intro" data-arrival="">
            <div className="profile-identity"><span className="profile-avatar" id="profile-avatar"><span aria-hidden="true">BW</span><img id="avatarImg" alt="보원 프로필 이미지" decoding="async" loading="lazy" hidden /></span><strong id="profile-name">BOWONE</strong></div>
            <p className="profile-bio" id="profile-bio">일러스트, 애니메이션, 3D 모델링을 중심으로 다양한 디지털 콘텐츠를 제작하고 있는 멀티미디어 아티스트 보원입니다.</p>
            <dl className="about-facts"><div><dt>EDUCATION</dt><dd>한국영상대학교 게임콘텐츠전공</dd></div><div><dt>AWARD</dt><dd>2026 한국게임학회 × 넥슨게임즈 입선</dd></div></dl>
          </div>
          <div className="career" data-arrival="" data-arrival-delay="82">
            <details open><summary><span className="mono">01</span><strong>주요 외주 이력</strong><span className="disclosure-mark" aria-hidden="true"></span></summary>
              <ul className="career-list">
                <li><div><strong>벌스워크 주식회사</strong><p>마인크래프트 스킨 · 모델 · 애니메이션</p></div><span className="career-date">2022.12.01–2023.07.31</span></li>
                <li><div><strong>우마공</strong><p>10주년 기념 타이틀 배너 디자인</p></div><span className="career-date">2021.01.02–2021.01.10</span></li>
                <li><div><strong>샌드박스네트워크</strong><p>마인크래프트 스킨 모델 및 애니메이션</p></div><span className="career-date">2020.10.31–2020.12.31</span></li>
                <li><div><strong>샌드박스네트워크</strong><p>마인크래프트 모델링 및 애니메이션</p></div><span className="career-date">2020.09.04–2020.10.10</span></li>
              </ul>
            </details>
            <details><summary><span className="mono">02</span><strong>사용하는 프로그램</strong><span className="disclosure-mark" aria-hidden="true"></span></summary>
              <dl className="tools-list"><div><dt>일러스트·픽셀</dt><dd>Clip Studio Paint · Photoshop · Aseprite · ibis Paint X · Paint Tool SAI</dd></div><div><dt>애니메이션</dt><dd>Live2D Cubism · Spine · Clip Studio Paint</dd></div><div><dt>영상</dt><dd>After Effects · Premiere Pro</dd></div><div><dt>3D</dt><dd>Maya · Blender · ZBrush · Marvelous Designer · Substance Painter</dd></div><div><dt>마인크래프트</dt><dd>Blockbench · MC Skin Editor · Mine-imator · Cubik Studio</dd></div></dl>
            </details>
            <details><summary><span className="mono">03</span><strong>동부 활동</strong><span className="disclosure-mark" aria-hidden="true"></span></summary>
              <dl className="tools-list"><div><dt>진행 중</dt><dd>김루야 · 2026.01.13~<br />조아햄 · 2025.11.19~<br />배비꼬 · 2023.11.17–2024.05.19 / 2025.11.19~</dd></div><div><dt>중단·보류</dt><dd>다비 · 2025.12.08–2026.03.13 (중단)<br />이보늬 · 2025.11.19~ (보류)<br />쵸봄 · 2021.11.22–2024.05.19 (중단)</dd></div></dl>
            </details>
            <details><summary><span className="mono">04</span><strong>작업 범위</strong><span className="disclosure-mark" aria-hidden="true"></span></summary>
              <dl className="tools-list"><div><dt>일러스트</dt><dd>2D 일러스트 · 썸네일 · 방송소스 · 컨셉아트 · 디자인</dd></div><div><dt>영상</dt><dd>MV 제작 · 2D 애니메이션 · 3D 애니메이션</dd></div><div><dt>모델링</dt><dd>캐릭터 · 배경 소품 · 방송 배경</dd></div><div><dt>마인크래프트</dt><dd>스킨 · 리소스팩 · 마인크래프트 애니메이션</dd></div><div><dt>기타</dt><dd>Live2D · 픽셀아트</dd></div></dl>
            </details>
          </div>
        </div>
      </section>

      <section className="section wrap" id="services" aria-labelledby="services-title">
        <div className="section-heading editorial-heading" data-arrival=""><div><p className="index-label">03 / SERVICES</p><h2 id="services-title">작업 분야<span>.</span></h2></div><p>분야를 선택하면 관련 작품을 바로 볼 수 있습니다.</p></div>
        <div className="discipline-grid" id="discipline-grid" data-arrival=""></div>
      </section>
      <div className="wrap"><div className="cta-band"><div><p className="index-label">COMMISSIONS / CONTACT</p><h2>만들고 싶은 작업이 있나요?</h2></div><a className="button button-white" href="#commissions">의뢰 안내 보기 <span aria-hidden="true">↗</span></a></div></div>
    </div>
  );
}
