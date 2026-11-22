import assert from "node:assert/strict";
import {test} from "node:test";
import runtime from "../src/redesign/runtime.cjs";

test("the illustration filter groups the three rendering styles into a single style choice",()=>{
  const choices=runtime.subfilterChoices("illust",runtime.GROUPS.find(group=>group.id==="illust").sections);
  assert.deepEqual(choices,[["style","스타일"],["illust-cover","커버일러스트"],["illust-rough","러프퀄"],["illust-conceptart","컨셉아트"]]);
});
test("the style filter includes all three styles without mixing cover or rough works",()=>{
  const rows=runtime.normalizeArchive(Object.fromEntries(["illust-simple","illust-line","illust-semi-painted","illust-cover","illust-rough"].map(sub=>[sub,[{src:"./illustration/"+sub+".png"}]])));
  assert.deepEqual(runtime.filterArchive(rows,"illust","style","").map(row=>row.sub),["illust-simple","illust-line","illust-semi-painted"]);
  assert.equal(runtime.parseRoute("#portfolio/illust/style").sub,"style");
});
