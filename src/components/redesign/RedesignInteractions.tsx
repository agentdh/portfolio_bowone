"use client";

import { useEffect } from "react";

export default function RedesignInteractions() {
  useEffect(() => {
    let disposed = false;
    Promise.all([import("@/redesign/runtime.cjs"), import("@/redesign/quote.cjs"), import("@/redesign/editable.cjs"), import("@/redesign/image-viewport.cjs"), import("@/redesign/shared-catalog.cjs")]).then(async ([runtime, quote, editable, imageViewport, shared]) => {
      if (disposed) return;
      const view = runtime.default.mount(quote.default, imageViewport.default);
      const site = JSON.parse(document.getElementById("site-data")?.textContent || "{}");
      const fields = editable.default.mount(site.editorSettings);
      if (view && site.sharedCatalogUrl) {
        void shared.default.fetchSharedSnapshot(site.sharedCatalogUrl, view.getPublishedCatalog()).then(snapshot => {
          if (snapshot && !disposed) view.setPublishedCatalog(snapshot, fields.replace);
        }).catch(() => { /* Keep the bundled snapshot when the public data host is unavailable. */ });
      }
      if (view && window.parent !== window && new URLSearchParams(window.location.search).get("op") === "1") {
        const editor = await import("@/redesign/op-editor.cjs");
        if (!disposed) editor.default.mount(view, fields);
      }
    }).catch((error: unknown) => {
      if (disposed) return;
      console.error("BOWONE interaction setup failed", error);
      const main = document.getElementById("main");
      if (!main) return;
      const status = document.createElement("p");
      status.className = "wrap notice";
      status.setAttribute("role", "alert");
      status.textContent = "작품과 계산기를 준비하지 못했습니다. 페이지를 새로고침해 주세요.";
      main.prepend(status);
    });
    return () => { disposed = true; };
  }, []);
  return null;
}
