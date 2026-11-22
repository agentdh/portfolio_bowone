import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const html = readFileSync(process.env.BOWONE_BUILD_HTML || ".next/server/app/index.html", "utf8");
const visibleText = (fragment) => fragment.replace(/<[^>]+>/g, "");

test("the four career panels are initially closed and appear in the requested order", () => {
  const career=html.match(/<div class="career"[^>]*>([\s\S]*?)<\/details>\s*<\/div>/)?.[1] || "";
  assert.deepEqual([...career.matchAll(/<details([^>]*)><summary>.*?<strong[^>]*>([^<]+)<\/strong>/g)].map(([, attrs, name])=>[name,attrs.includes("open")]), [
    ["작업 범위",false],["사용 프로그램",false],["주요 외주 이력",false],["동부 활동",false],
  ]);
});

test("the public profile and contact actions sit between the hero and selected works", () => {
  const intro = html.match(/<section\b[^>]*\bid="artist-intro"[\s\S]*?<\/section>/)?.[0];
  assert.ok(intro, "Missing rendered profile block");
  assert.match(html, /<\/figure>\s*<\/section>\s*<section\b[^>]*\bid="artist-intro"[\s\S]*?<\/section>\s*<section\b[^>]*\bid="selected"/);
  assert.match(intro, /BOWONE/);
  const configuredContact=JSON.parse(readFileSync("src/data/portfolio.json","utf8")).profile.commissionLinkUrl;
  assert.equal(intro.match(/<a\b[^>]*class="button button-accent"[^>]*href="([^"]+)"/)?.[1],configuredContact);
  assert.match(intro, /<button\b[^>]*\btype="button"[^>]*>[\s\S]*?agentdh@naver\.com/);
  for (const channel of ["X (Twitter)", "크레페", "아트머그", "YouTube", "Instagram"]) {
    assert.ok(intro.includes(channel), "Missing visible channel: " + channel);
  }
});

test("the guide gives visitors the full sequence, usage comparison and refund terms without expanding them", () => {
  const guide = html.match(/<div\b[^>]*\bclass="commission-guide"[\s\S]*?(?=<section\b[^>]*\bid="contact")/)?.[0];
  assert.ok(guide, "Missing rendered commission guide");
  const steps = guide.match(/<ol\b[^>]*>[\s\S]*?<\/ol>/)?.[0] || "";
  assert.deepEqual([...steps.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)].map(([, step]) => visibleText(step)),
    ["문의", "확인 및 수락", "작업 시작", "중간 점검", "작업 완료", "후불 입금", "원본 파일 전달"]);
  const usage = guide.match(/<table\b[^>]*\bclass="usage-matrix"[\s\S]*?<\/table>/)?.[0];
  assert.ok(usage && /비상업용[\s\S]*방송용[\s\S]*상업용/.test(usage), "Missing the rendered comparison");
  assert.deepEqual([...usage.matchAll(/<\/td><td>([^<]+)<\/td><\/tr>/g)].map(([,owner])=>owner),["보원","보원","보원"]);
  assert.ok(!/<details\b[^>]*>[\s\S]*?<table\b[^>]*\bclass="usage-matrix"/.test(guide), "The main usage comparison must be visible by default");
  assert.match(guide, /첫 번째 중간 점검 도중[\s\S]*?0%[\s\S]*?첫 번째 중간 점검 이후[\s\S]*?30%/);
  assert.match(visibleText(guide), /1개월[\s\S]*?최대\s*80%/);
});
