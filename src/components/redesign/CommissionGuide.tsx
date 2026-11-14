import CopyTextButton from "./CopyTextButton";

const STEPS = ["문의", "확인 및 수락", "작업 시작", "중간 점검", "작업 완료", "후불 입금", "원본 파일 전달"];

const USES = ["개인 소장 / SNS 프로필", "방송용 커버 / 방송화면", "굿즈 / 이모티콘 제작", "2차 수정 및 사용", "저작권 소유자"];
type Permission = { label: string; tone: "yes" | "no" | "ask"; note?: string };
const YES: Permission = { label: "가능", tone: "yes" };
const NO: Permission = { label: "불가", tone: "no" };
const ASK: Permission = { label: "협의", tone: "ask" };
const POLICIES: { name: string; permissions: Permission[]; owner: string }[] = [
  { name: "비상업용", permissions: [YES, NO, NO, NO], owner: "보원" },
  { name: "방송용", permissions: [YES, YES, ASK, NO], owner: "보원" },
  { name: "상업용", permissions: [YES, YES, YES, YES], owner: "보원" },
];

const REQUEST_TEMPLATE = `[BOWONE 커미션 신청 양식]
1. 신청 타입 (일러스트 / Live2D / 3D / MV / 마인크래프트 등):
2. 사용 용도 (비상업용 / 방송용 / 상업용):
3. 캐릭터 및 작업 상세 설명 (레퍼런스 이미지 첨부):
4. 희망 마감일:
5. 기타 요청사항:`;

function PermissionMark({ label, tone, note }: Permission) {
  return (
    <>
      <span className="policy-status" data-tone={tone}>
        <span aria-hidden="true">{tone === "yes" ? "✓" : tone === "no" ? "×" : "·"}</span> {label}
      </span>
      {note && <small className="policy-cell-note">{note}</small>}
    </>
  );
}

export default function CommissionGuide() {
  return (
    <div className="commission-guide">
      <section className="commission-process guide-panel" id="process" aria-labelledby="process-title" data-arrival="">
        <div className="guide-heading">
          <div>
            <p className="index-label">02 / COMMISSIONS</p>
            <h2 id="process-title">작업 진행 순서<span>.</span></h2>
          </div>
          <p><strong>후불제 기본</strong><br />수정·컨펌 횟수 제한 없음. 캐릭터 디자인 대폭 변경 등은 추가금이 발생할 수 있습니다.</p>
        </div>
        <ol className="process-list" aria-label="작업 진행 순서">
          {STEPS.map((step) => <li key={step}>{step}</li>)}
        </ol>
      </section>

      <section className="guide-panel" id="policy" aria-labelledby="policy-title" data-arrival="">
        <div className="guide-heading">
          <div>
            <p className="index-label">USAGE &amp; POLICY</p>
            <h2 id="policy-title">작업물 이용 방침<span>.</span></h2>
          </div>
          <p>비상업용·방송용·상업용에 따라 사용할 수 있는 범위를 비교하세요.</p>
        </div>
        <p className="policy-scroll-hint">표를 좌우로 밀어 나머지 항목을 볼 수 있습니다.</p>
        <div className="table-scroll usage-scroll" tabIndex={0} role="region" aria-label="이용 방침 비교표">
          <table className="usage-matrix">
            <caption className="sr-only">이용 목적별 작업물 사용 범위</caption>
            <thead><tr><th scope="col">구분</th>{USES.map((label) => <th scope="col" key={label}>{label}</th>)}</tr></thead>
            <tbody>
              {POLICIES.map(({ name, permissions, owner }) => (
                <tr key={name}>
                  <th scope="row">{name}</th>
                  {permissions.map((permission, i) => <td key={USES[i]}><PermissionMark {...permission} /></td>)}
                  <td>{owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <details className="policy-detail">
          <summary><strong>이용 범위와 계약 조건 자세히 보기</strong><span className="disclosure-mark" aria-hidden="true"></span></summary>
          <dl>
            <div><dt>비상업용</dt><dd>개인 소장과 SNS 프로필(방송 플랫폼 프로필 이미지 포함)에 사용할 수 있습니다. 수익이 발생하는 방송 콘텐츠에 직접 삽입하거나 홍보에 사용하는 것은 금지합니다.</dd></div>
            <div><dt>방송용</dt><dd>제한적으로 라이선스를 허용하는 상업용으로 간주됩니다. 굿즈·이모티콘 제작은 별도 협의가 필요합니다. 보원에게 수정을 의뢰하거나 수정 여부를 확인한 뒤에만 수정 가능하며, 사전 통보 없이 개인적으로 수정할 수 없습니다.</dd></div>
            <div><dt>상업용</dt><dd>온전한 저작권 양도를 원할 경우에만 의뢰가 가능합니다. 원하는 저작재산권·2차적 저작물 작성권 등 구체적인 권리 범위를 담은 계약서를 준비해 문의하면, 검토 후 별도 계약으로 진행합니다. 저작인격권은 양도되지 않으며, 의뢰인이 자유롭게 수정하려면 이에 대한 특약이 필요합니다.</dd></div>
          </dl>
          <p>대부분의 외주 작업물은 계약상 포트폴리오로 공개할 수 없습니다.</p>
        </details>
      </section>

      <section className="guide-panel" aria-labelledby="copyright-title" data-arrival="">
        <div className="guide-heading"><div><p className="index-label">COPYRIGHT</p><h2 id="copyright-title">저작권 및 수정<span>.</span></h2></div></div>
        <p className="policy-copy">별도 계약서를 작성하지 않은 커미션 작업물의 저작권은 <strong>보원</strong>에게 있습니다.</p>
        <div className="policy-permissions">
          <div data-tone="no"><h3>금지</h3><ul><li>샘플을 캡처해 다른 커미션의 참고자료로 사용</li><li>작업물 트레이싱</li></ul></div>
          <div data-tone="yes"><h3>허용</h3><ul><li>수익 목적이 아닌 연습·공부에 이용</li></ul></div>
        </div>
        <h3 className="policy-subheading">수정 및 컨펌</h3>
        <p className="policy-copy">작업 중 수정·컨펌은 횟수 제한이 없고 원하는 수정·추가 사항을 언제든 요청할 수 있습니다. 캐릭터 디자인을 크게 변경하는 경우 등에는 추가 비용이 발생할 수 있습니다.</p>
      </section>

      <section className="guide-panel" aria-labelledby="refund-title" data-arrival="" data-arrival-delay="72">
        <div className="guide-heading"><div><p className="index-label">REFUNDS</p><h2 id="refund-title">취소·환불<span>.</span></h2></div></div>
        <p className="policy-copy">작업은 대부분 후불이며, 취소한 작업물은 사용할 수 없습니다.</p>
        <table className="refund-table">
          <caption className="sr-only">작업 취소 시점별 비용</caption>
          <thead><tr><th scope="col">취소 시점</th><th scope="col">취소금</th></tr></thead>
          <tbody>
            <tr><th scope="row">첫 번째 중간 점검 도중</th><td><strong>0%</strong> (취소금 없음)</td></tr>
            <tr><th scope="row">첫 번째 중간 점검 이후</th><td>의뢰비용의 <strong>30%</strong></td></tr>
          </tbody>
        </table>
        <ul className="policy-bullets">
          <li>원본 전달 이후에는 원칙적으로 환불되지 않습니다.</li>
          <li>상업용 작업물을 원본 전달 후 <strong>1개월</strong> 내 방송 중단 등으로 사용할 수 없게 된 경우, 폐기 및 재사용 금지를 조건으로 최대 <strong>80%</strong>까지 환불 가능합니다.</li>
        </ul>
        <p className="policy-exception"><strong>마감 지연 예외</strong> 사전 고지 없이 마감기한을 지키지 못한 경우 의뢰인의 취소 비용은 없습니다.</p>
      </section>
    </div>
  );
}

export function QuickCommissionTemplate() {
  return (
    <details className="quick-commission">
      <summary><strong>빠른 의뢰 신청 양식</strong><span className="disclosure-mark" aria-hidden="true"></span></summary>
      <p>간단히 문의하려면 양식을 복사해 Discord에 붙여넣으세요.</p>
      <pre>{REQUEST_TEMPLATE}</pre>
      <CopyTextButton text={REQUEST_TEMPLATE} label="신청 양식 복사하기" actionLabel="빠른 의뢰 신청 양식 복사" successLabel="신청 양식 복사됨" className="button button-outline" />
    </details>
  );
}
