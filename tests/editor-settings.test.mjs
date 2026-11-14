import assert from "node:assert/strict";
import test from "node:test";
import { cleanSettings } from "../src/redesign/editable.cjs";
import { normalizeArchive, parseRoute, wrapIndex } from "../src/redesign/runtime.cjs";

test("saved copy is plain text and only approved style values survive", () => {
  const result = cleanSettings({ entries: {
    "hero.lead": { text: "<script>no execution</script>\n두 번째 줄", font: "display", color: "#C8B99A", size: 28 },
    malformed: { text: 5, font: "url(https://example.com/)", color: "red", size: 1e10 },
    "unsafe selector *": { text: "bad" },
  } });
  assert.deepEqual(result, { version: 1, entries: {
    "hero.lead": { text: "<script>no execution</script>\n두 번째 줄", font: "display", color: "#c8b99a", size: 28 },
  } });
});

test("media retain folder, types, source and immutable shared revision", () => {
  const ref = "a".repeat(40);
  const rows = normalizeArchive({"thumbnail-ld":[
    {src:"./thumbnail/sample.gif",type:"image",sharedMedia:true,sharedRef:ref},
    {src:"https://www.youtube.com/watch?v=Abcdefghijk",type:"video"},
    {src:"./thumbnail/sample.mp4",type:"video"},
  ]});
  assert.deepEqual(rows.map(row=>row.kind),["gif","youtube","video"]);
  assert.equal(rows[0].sourcePath,"thumbnail/sample.gif");
  assert.equal(rows[0].sharedRef,ref);
  assert.equal(parseRoute("#portfolio").group,"thumbnail");
  assert.equal(wrapIndex(0,-1,3),2);
});
