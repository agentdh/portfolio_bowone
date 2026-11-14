(function () {
  "use strict";
  const channel = "bowone-op:v1";
  const mime = "application/x-bowone-card";
  const loopback = value => /^(127\.0\.0\.1|localhost)$/.test(value);
  function parentOrigin() {
    if (window.parent === window || !document.referrer) return "";
    try {
      const ref = new URL(document.referrer);
      if (ref.origin === "https://agentdh.github.io") return ref.origin;
      if (loopback(location.hostname) && loopback(ref.hostname) && ref.protocol === location.protocol) return ref.origin;
    } catch {}
    return "";
  }
  function mount(view, fields) {
    const origin = parentOrigin();
    if (!origin) return;
    const pending = new Map();
    let sequence = 0, admin = false, ready = false, selected = "", inbox = [], initialized = false;
    let catalogRevision, settingsRevision, inboxRevision, draft = false;
    const baseSettings = fields.snapshot();
    const parent = window.parent;
    const send = data => parent.postMessage({channel,...data},origin);
    const make = (tag, text, className) => {
      const el = document.createElement(tag);
      if (text) el.textContent = text;
      if (className) el.className = className;
      return el;
    };
    const button = (text, fn) => {
      const el = make("button",text,"button button-outline");
      el.type = "button"; el.addEventListener("click",fn);
      return el;
    };
    const label = (name, input) => {
      const el = make("label","","field");
      el.append(make("span",name),input);
      return el;
    };
    const bar = make("div","","bowone-op-bar");
    const status = make("span","관리자 연결 확인 중","bowone-op-status");
    status.setAttribute("role","status");
    const login = button("관리자 로그인",()=>send({type:"command",action:"auth"}));
    const versions = button("버전 전환",()=>send({type:"command",action:"versions"}));
    const save = button("변경상태 저장",async()=>{
      if (!color.checkValidity() || !size.checkValidity()) {status.textContent="색상은 #RRGGBB, 크기는 8~112px로 입력해 주세요.";return;}
      if (await run("save",{settings:fields.snapshot()}, "변경사항 저장 중…")) {draft = false; send({type:"ready"});}
    });
    const panelToggle = button("카드 등록",()=>setOpen(panel.hidden));
    panelToggle.setAttribute("aria-controls","bowone-op-panel");
    bar.append(make("strong","관리자 패널"),login,save,panelToggle,versions,status);
    const panel = make("aside","","bowone-op-panel");
    panel.id = "bowone-op-panel"; panel.hidden = true; panel.setAttribute("aria-label","카드 등록 및 문구 편집");
    const title = make("div","","bowone-op-panel-head");
    const close = button("닫기",()=>{setOpen(false);panelToggle.focus();});
    title.append(make("h2","카드 등록"),close);
    const fileInput = make("input");
    fileInput.type = "file"; fileInput.multiple = true; fileInput.accept = "image/*,.gif,video/mp4,video/webm,video/quicktime";
    fileInput.hidden = true;
    const upload = button("여러 파일 업로드",()=>fileInput.click());
    fileInput.addEventListener("change",async()=>{
      const files = Array.from(fileInput.files || []); fileInput.value = "";
      if (files.length) await run("upload",{files},"미등록 파일 업로드 중…");
    });
    const refresh = button("새로고침",()=>run("refresh",{},"미등록 목록 확인 중…"));
    const tools = make("div","","bowone-op-tools"); tools.append(upload,refresh,fileInput);
    const target = make("select");
    const list = make("ul","","bowone-op-list");
    const inboxHeading = make("h3","미등록 카드 · Null_card");
    const dropZone = make("section","","bowone-op-inbox");
    dropZone.append(inboxHeading,make("p","파일을 섹션에 끌어놓거나 등록할 항목을 선택하세요. 등록된 카드를 여기로 끌어오면 회수됩니다."),tools,label("등록할 항목",target),list);
    const allowInboxDrop=event=>{
      if (!admin || !event.dataTransfer.types.includes(mime)) return;
      event.preventDefault(); event.dataTransfer.dropEffect="move"; dropZone.classList.add("op-drop-active");
    };
    dropZone.addEventListener("dragenter",allowInboxDrop);
    dropZone.addEventListener("dragover",allowInboxDrop);
    dropZone.addEventListener("dragleave",event=>{if(!dropZone.contains(event.relatedTarget)) dropZone.classList.remove("op-drop-active");});
    dropZone.addEventListener("drop",event=>{
      dropZone.classList.remove("op-drop-active");
      const card = dragValue(event);
      if (card?.kind !== "card") return;
      event.preventDefault(); event.stopPropagation();
      run("recover",{id:card.id},"미등록 카드로 회수 중…");
    });
    const inspector = make("section","","bowone-op-inspector");
    inspector.hidden = true;
    const entryText = make("textarea"); entryText.rows=4; entryText.maxLength=2400;
    const font = make("select");
    for (const [id,name] of [["","테마 기본"],["body","본문"],["display","제목"],["mono","고정폭"],["system","시스템 고딕"],["serif","명조"]]) font.add(new Option(name,id));
    const color = make("input"); color.type="text"; color.placeholder="#e8e4de"; color.maxLength=7; color.pattern="#[0-9A-Fa-f]{6}";
    const size = make("input"); size.type="number"; size.min="8"; size.max="112"; size.step="1"; size.placeholder="기본값";
    const clear = button("선택 문구 기본값",()=>{
      if (!selected) return;
      fields.set(selected,{}); draft = true; showField(selected); status.textContent = "저장하지 않은 문구 변경이 있습니다.";
    });
    const editTitle = make("h3","선택 문구 편집");
    const editStyles = make("div","","bowone-op-edit-styles"); editStyles.append(label("글꼴",font),label("색상 (#RRGGBB)",color),label("크기 (px)",size));
    inspector.append(editTitle,label("문구",entryText),editStyles,clear);
    for (const el of [entryText,font,color,size]) el.addEventListener("input",()=>{
      const current = fields.info(selected);
      if (!current) return;
      if (color.value && !color.validity.valid || size.value && !size.validity.valid) return;
      fields.set(selected,{text:entryText.value===current.defaultText ? undefined : entryText.value,font:font.value,color:color.value,size:size.value ? Number(size.value) : undefined});
      draft = true; status.textContent = "저장하지 않은 문구 변경이 있습니다.";
    });
    panel.append(title,inspector,dropZone);
    document.body.prepend(bar,panel);
    document.documentElement.classList.add("bowone-op-view");
    new ResizeObserver(()=>document.documentElement.style.setProperty("--op-bar-height",bar.offsetHeight+"px")).observe(bar);
    const setOpen = open => {
      panel.hidden = !open;
      panelToggle.setAttribute("aria-expanded",String(open));
    };
    function showField(key) {
      const info = fields.info(key);
      if (!info) return;
      selected = key;
      entryText.value = info.entry.text ?? info.defaultText;
      font.value = info.entry.font || ""; color.value = info.entry.color || ""; size.value = info.entry.size || "";
      inspector.hidden = false;
      setOpen(true);
    }
    document.addEventListener("dblclick",event=>{
      if (!admin || panel.contains(event.target) || bar.contains(event.target)) return;
      const key = fields.find(event.target);
      if (!key) return;
      event.preventDefault();
      window.getSelection()?.removeAllRanges();
      showField(key); entryText.focus(); entryText.select();
    });
    document.addEventListener("click",event=>{
      if(!admin || !fields.find(event.target))return;
      const link=event.target.closest("a");
      if(link && (event.detail>1 || event.target.closest("[data-edit-key]") && link.origin!==location.origin)){
        // Use keyboard activation or the neighbouring icon for an external link while editing its label.
        if(event.detail>0)event.preventDefault();
      }
    },true);
    function dragValue(event) {
      try { return JSON.parse(event.dataTransfer.getData(mime)); } catch { return null; }
    }
    function dragSource(el,kind,id) {
      el.draggable=true;
      el.addEventListener("dragstart",event=>{
        if (!admin) {event.preventDefault();return;}
        event.dataTransfer.effectAllowed="move";
        event.dataTransfer.setData(mime,JSON.stringify({kind,id}));
        event.dataTransfer.setData("text/plain","BOWONE 카드");
      });
    }
    const editor = {
      card(el,item) {
        if (!admin) return;
        el.dataset.opCard=item.opId;
        dragSource(el,"card",item.opId);
        const back=button("미등록으로",()=>run("recover",{id:item.opId},"미등록 카드로 회수 중…"));
        back.classList.add("bowone-op-return");
        el.querySelector(".work-info")?.append(back);
      },
    };
    const allowGridDrop=event=>{
      if (!admin || !event.dataTransfer.types.includes(mime)) return;
      const grid = event.target.closest("[data-op-grid]");
      if (!grid) return;
      event.preventDefault(); event.dataTransfer.dropEffect="move"; grid.classList.add("op-drop-active");
    };
    document.addEventListener("dragenter",allowGridDrop);
    document.addEventListener("dragover",allowGridDrop);
    document.addEventListener("dragleave",event=>{
      const grid = event.target.closest("[data-op-grid]");
      if (grid && !grid.contains(event.relatedTarget)) grid.classList.remove("op-drop-active");
    });
    document.addEventListener("dragend",()=>document.querySelectorAll(".op-drop-active").forEach(el=>el.classList.remove("op-drop-active")));
    document.addEventListener("drop",event=>{
      const grid = event.target.closest("[data-op-grid]");
      if (!grid) return;
      grid.classList.remove("op-drop-active");
      const card = dragValue(event);
      if (!admin || !card) return;
      event.preventDefault();
      const before = event.target.closest("[data-op-card]")?.dataset.opCard || "";
      run(card.kind==="inbox"?"assign":"arrange",{id:card.id,grid:grid.dataset.opGrid,before},"카드 이동 중…");
    });
    function renderInbox() {
      list.replaceChildren();
      inboxHeading.textContent="미등록 카드 · Null_card ("+inbox.length+")";
      if (!inbox.length) {list.append(make("li","미등록 카드 없음"));return;}
      for (const item of inbox) {
        const row = make("li","","bowone-op-row");
        if (item.preview) {
          const image=make("img"); image.alt=""; image.src=item.preview; image.loading="lazy"; image.draggable=false;
          image.addEventListener("error",()=>image.remove(),{once:true}); row.append(image);
        }
        row.append(make("span",item.title),button("등록",()=>run("assign",{id:item.id,grid:target.value},"카드 등록 중…")));
        dragSource(row,"inbox",item.id);
        list.append(row);
      }
    }
    async function run(action,args,message) {
      if (!admin || !ready || pending.size) return false;
      const id = ++sequence;
      save.disabled = upload.disabled = refresh.disabled = true;
      status.textContent = message;
      try {
        const result = await new Promise((resolve,reject)=>{
          const timer=setTimeout(()=>{pending.delete(id);reject(new Error("응답이 지연됩니다. 다시 저장하기 전에 카드 상태를 확인해 주세요."));},300000);
          pending.set(id,{resolve,reject,timer});
          send({type:"command",action,id,args});
        });
        status.textContent = result || "변경사항을 반영했습니다.";
        return true;
      } catch (error) {
        status.textContent = error.message || "변경사항을 반영하지 못했습니다.";
        return false;
      } finally {
        save.disabled = upload.disabled = refresh.disabled = !admin || !ready;
      }
    }
    function receive(event) {
      if (event.origin !== origin || event.source !== parent || event.data?.channel !== channel) return;
      const data=event.data;
      if(data.type==="progress" && pending.has(data.id)){
        status.textContent=data.message;
        return;
      }
      if (data.type==="result") {
        const request=pending.get(data.id);
        if (!request) return;
        pending.delete(data.id); clearTimeout(request.timer);
        if (data.ok) request.resolve(data.message);
        else request.reject(new Error(data.message));
        return;
      }
      if (data.type!=="state") return;
      initialized = true;
      const wasAdmin = admin;
      admin=!!data.admin; ready=!!data.ready;
      login.textContent=admin?"로그아웃":"관리자 로그인";
      save.hidden=panelToggle.hidden=!admin;
      save.disabled=upload.disabled=refresh.disabled=!admin || !ready || !!pending.size;
      if (!admin) {
        setOpen(false);
        if(wasAdmin){
          view.disableEditor();view.resetCatalog();catalogRevision=undefined;settingsRevision=undefined;
          fields.replace(baseSettings);draft=false;selected="";inspector.hidden=true;
        }
        status.textContent="";
        return;
      }
      if (!wasAdmin) {
        view.enableEditor(editor);
        setOpen(matchMedia("(min-width: 1100px)").matches);
        status.textContent="문구를 더블클릭해 편집하세요.";
      }
      if (data.grids && !target.options.length) for (const [id,name] of data.grids) target.add(new Option(name,id));
      if (Array.isArray(data.inbox) && data.inboxRevision !== inboxRevision) {
        inboxRevision=data.inboxRevision; inbox=data.inbox; renderInbox();
      }
      if (data.catalog && data.catalogRevision !== catalogRevision) {
        catalogRevision=data.catalogRevision; view.setCatalog(data.catalog);
        fields.replace(fields.snapshot());
      }
      if (data.settings && data.settingsRevision !== settingsRevision && !draft) {
        settingsRevision=data.settingsRevision; fields.replace(data.settings);
      }
      if (!pending.size && data.error) status.textContent=data.error;
    }
    window.addEventListener("message",receive);
    save.hidden=panelToggle.hidden=true;
    send({type:"ready"});
    const retry = setInterval(()=>{if(initialized){clearInterval(retry);return;}send({type:"ready"});},500);
    setTimeout(()=>{clearInterval(retry); if(!initialized) status.textContent="OP 연결을 확인해 주세요.";},6000);
  }
  module.exports={mount};
})();
