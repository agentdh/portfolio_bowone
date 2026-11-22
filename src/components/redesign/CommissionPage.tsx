import CommissionGuide, { QuickCommissionTemplate } from "./CommissionGuide";
import DiscordIcon from "./DiscordIcon";
import ContactChannels from "./ContactChannels";

export default function CommissionPage() {
  return (
    <div data-page="commissions" hidden>
      <section className="wrap inner-page commission-page" id="commissions" aria-labelledby="commissions-title">
        <div className="commission-contacts-top" data-arrival="">
          <ContactChannels showEmailHeading />
        </div>
        <div className="commission-masthead" data-arrival="">
          <div><p className="index-label">03 / COMMISSIONS</p><h1 id="commissions-title">작업을<br />의뢰하려면<span>.</span></h1><p>제작 범위와 사용 목적을 알려주시면 견적과 일정을 안내합니다.</p></div>
          <nav aria-label="의뢰 페이지 목차">
            <a href="#pricing" data-section-link=""><span>01</span><strong>가격 확인·계산</strong><span aria-hidden="true">↘</span></a>
            <a href="#process" data-section-link=""><span>02</span><strong>작업 순서·이용 조건</strong><span aria-hidden="true">↘</span></a>
            <a href="#contact" data-section-link=""><span>03</span><strong>의뢰서 작성·상담</strong><span aria-hidden="true">↘</span></a>
          </nav>
        </div>


        <section className="commission-block" id="pricing" aria-labelledby="pricing-title">
          <div className="section-heading editorial-heading" data-arrival=""><div><p className="index-label">01 / PRICING</p><h2 id="pricing-title">예상 비용 계산<span>.</span></h2></div><p>표시 금액은 작업 기준가입니다. 제작 범위와 이용 조건에 따라 최종 금액이 달라집니다.</p></div>
          <div className="price-tabs" id="price-tabs" role="tablist" aria-label="가격표 분야"></div>
          <div id="price-panels"></div>
        </section>

        <CommissionGuide />
      </section>

      <section className="contact-section" id="contact" aria-labelledby="contact-title">
        <div className="wrap contact-layout">
          <div className="contact-copy" data-arrival=""><p className="index-label">03 / CONTACT</p><h2 id="contact-title">작업을<br />이야기해요<span>.</span></h2><p>의뢰할 분야와 사용 용도, 원하는 일정을 알려주시면 상담이 더 수월합니다.</p><a id="contact-discord" className="button button-white" href="https://discord.gg/QGsfqz9HPC" target="_blank" rel="noopener noreferrer"><span className="discord-cta-content"><DiscordIcon /><span id="contact-discord-label">디스코드로 문의하기</span></span><span aria-hidden="true">↗</span></a><p className="contact-channel">DISCORD COMMISSION</p><a id="contact-email" className="contact-email" href="mailto:agentdh@naver.com"><span id="contact-email-label">agentdh@naver.com</span> <span aria-hidden="true">↗</span></a> <button type="button" className="text-link copy-address" id="email-copy">이메일 복사</button><p className="inline-status" id="email-copy-status" role="status"></p></div>
          <form className="brief-form" id="brief-form">
            <h3>의뢰 신청 양식</h3><p>작성한 내용을 복사해 Discord에 붙여넣거나 메일 초안으로 여세요. 이 페이지에서 자동 발송되지 않습니다.</p>
            <div className="form-row"><label className="field"><span>이름 / 활동명</span><input type="text" id="brief-name" autoComplete="name" maxLength={80} required /></label><label className="field"><span>회신받을 이메일</span><input type="email" id="brief-reply" autoComplete="email" maxLength={200} required /></label></div>
            <div className="form-row"><label className="field"><span>제작 분야</span><select id="brief-group"><option value="">선택해 주세요</option></select></label><label className="field"><span>사용 용도</span><select id="brief-usage"><option value="">선택해 주세요</option><option>비상업용</option><option>방송용</option><option>상업용</option><option>협의</option></select></label></div>
            <label className="field"><span>희망 마감일</span><input type="text" id="brief-deadline" maxLength={80} placeholder="예: 12월 말 / 일정 협의" /></label>
            <label className="field"><span>작업 내용 및 참고자료</span><textarea id="brief-desc" rows={3} minLength={10} maxLength={900} placeholder="캐릭터, 작업 범위, 참고 링크 등을 적어 주세요." required></textarea></label>
            <label className="field"><span>기타 요청사항</span><input type="text" id="brief-notes" maxLength={300} /></label>
            <details className="brief-quote" id="brief-quote" hidden><summary>첨부된 견적 내역 <span className="disclosure-mark" aria-hidden="true"></span></summary><pre id="brief-quote-text"></pre><button type="button" className="button button-outline" id="brief-remove-quote">견적 제거</button></details>
            <div className="form-actions"><button type="button" className="button button-accent" id="brief-copy">신청서 복사 <span aria-hidden="true">↗</span></button><a className="button button-outline" id="brief-email" href="mailto:agentdh@naver.com">메일 초안 열기 <span aria-hidden="true">↗</span></a></div>
            <p id="brief-status" className="inline-status" role="status"></p>
            <label className="field" id="copy-fallback" hidden><span>아래 내용을 직접 복사하세요</span><textarea readOnly rows={6} id="copy-text"></textarea></label>
            <QuickCommissionTemplate />
          </form>
        </div>
      </section>
    </div>
  );
}
