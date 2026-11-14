(function () {
  "use strict";
  const families = Object.freeze({
    body: "var(--body)", display: "var(--display)", mono: "var(--mono)",
    system: 'system-ui, "Malgun Gothic", sans-serif', serif: '"Noto Serif KR", Batang, Georgia, serif',
  });
  const keyPattern = /^[a-zA-Z0-9_.:-]{1,160}$/;
  const own = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
  function cleanEntry(entry) {
    const result = {};
    if (!entry || typeof entry !== "object") return result;
    if (typeof entry.text === "string" && entry.text.trim()) result.text = entry.text.slice(0, 2400);
    if (own(families, entry.font)) result.font = entry.font;
    if (typeof entry.color==="string" && /^#[0-9a-f]{6}$/i.test(entry.color)) result.color = entry.color.toLowerCase();
    if (Number.isInteger(entry.size) && entry.size >= 8 && entry.size <= 112) result.size = entry.size;
    return result;
  }
  function cleanSettings(value) {
    const entries = {};
    for (const [key, entry] of Object.entries(value?.entries || {}).slice(0, 400)) {
      if (!keyPattern.test(key) || key === "__proto__" || key === "constructor" || key === "prototype") continue;
      const cleaned = cleanEntry(entry);
      if (Object.keys(cleaned).length) entries[key] = cleaned;
    }
    return { version: 1, entries };
  }
  function readable(node) {
    return [...node.childNodes].map(child => child.nodeName === "BR" ? "\n" : child.nodeType === 3 ? child.nodeValue : readable(child)).join("").trim();
  }
  function mount(initial) {
    const nodes = new Map(), byElement = new Map();
    const eligible = "h1,h2,h3,h4,p,summary,dt,dd,th,td,li,strong,small";
    const blocked = '[aria-hidden="true"],[data-edit-ignore],#hero-caption,dialog';
    function bind(el) {
      if (el.closest(blocked) || !readable(el) || byElement.has(el)) return;
      const explicit = el.dataset.editKey;
      if (!explicit && (el.closest("[data-edit-key],#work-sections,#price-tabs,#price-panels,#discipline-grid,#work-results,#archive-current,form") || el.querySelector("a,button,input,select,textarea,img,svg,[data-edit-key]," + eligible))) return;
      const region = el.closest("[data-page]");
      if (!explicit && !region) return;
      const chain = [];
      if (!el.id && !explicit) for (let at = el; at && at !== region; at = at.parentElement) {
        if (at.id) { chain.unshift(at.id); break; }
        let n = 0;
        for (let sibling = at.previousElementSibling; sibling; sibling = sibling.previousElementSibling) if (sibling.localName === at.localName) n++;
        chain.unshift(at.localName + n);
      }
      const key = explicit || (el.id ? "id:" + el.id : region.dataset.page + ":" + chain.join("."));
      if (!keyPattern.test(key) || nodes.get(key)?.el.isConnected) return;
      nodes.set(key, { el, original: null });
      byElement.set(el, key);
      if(entries[key])paint(key,entries[key]);
    }
    let entries = {};
    function paint(key, entry) {
      const item = nodes.get(key);
      if (!item) return;
      const { el } = item;
      if (own(entry,"text")) {
        item.original ??= [...el.childNodes];
        el.textContent = entry.text;
        el.classList.add("bowone-edited-copy");
      } else if (item.original) {
        el.replaceChildren(...item.original);
        el.classList.remove("bowone-edited-copy");
        item.original = null;
      }
      if (entry.font) el.style.setProperty("--edited-font",families[entry.font]); else el.style.removeProperty("--edited-font");
      if (entry.color) el.style.setProperty("--edited-color",entry.color); else el.style.removeProperty("--edited-color");
      if (entry.size) el.style.setProperty("--edited-size",entry.size+"px"); else el.style.removeProperty("--edited-size");
      el.classList.toggle("bowone-edited-font",!!entry.font);
      el.classList.toggle("bowone-edited-color",!!entry.color);
      el.classList.toggle("bowone-edited-size",!!entry.size);
    }
    function replace(settings) {
      const next = cleanSettings(settings).entries;
      for (const key of new Set([...Object.keys(entries),...Object.keys(next)])) paint(key,next[key]||{});
      entries = next;
    }
    function set(key, entry) {
      if (!nodes.has(key)) return;
      const cleaned = cleanEntry(entry);
      if (Object.keys(cleaned).length) entries[key] = cleaned; else delete entries[key];
      paint(key,cleaned);
    }
    function find(target) {
      for (let el = target; el && el !== document.body; el = el.parentElement) {
        const key = byElement.get(el);
        if (key) return key;
      }
      return "";
    }
    function info(key) {
      const item = nodes.get(key);
      if (!item) return null;
      const source = item.original ? {childNodes:item.original} : item.el;
      return { key, defaultText: readable(source), entry: entries[key] || {} };
    }
    document.querySelectorAll("[data-edit-key],#main :is(" + eligible + ")").forEach(bind);
    replace(initial);
    new MutationObserver(records=>{
      const changed=new Set();
      for(const record of records)for(const node of record.addedNodes){
        if(node.nodeType!==1)continue;
        if(node.matches("[data-edit-key]"))changed.add(node);
        node.querySelectorAll("[data-edit-key]").forEach(el=>changed.add(el));
      }
      changed.forEach(bind);
      for(const [key,item] of nodes)if(!item.el.isConnected){nodes.delete(key);byElement.delete(item.el);}
    }).observe(document.getElementById("main"),{subtree:true,childList:true});
    return { replace, set, find, info, snapshot: () => cleanSettings({entries}) };
  }
  module.exports = { cleanEntry, cleanSettings, mount };
})();
