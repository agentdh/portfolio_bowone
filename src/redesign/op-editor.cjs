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
    const {createPressDrag}=require("./card-sort.cjs");
    const chosen=new Set(),inboxChosen=new Set();
    let selectionMode=false,working=false;
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
    // The new editor is a cross-origin iframe: browser confirm() can be suppressed there.
    const confirmDialog=make("dialog","","bowone-op-rename bowone-op-confirm");
    confirmDialog.setAttribute("aria-labelledby","op-confirm-heading");
    const confirmHeading=make("h2");confirmHeading.id="op-confirm-heading";
    const confirmBody=make("p"),confirmActions=make("div","","form-actions");
    const confirmCancel=button("취소",()=>confirmDialog.close("cancel"));
    const confirmProceed=button("확인",()=>confirmDialog.close("confirm"));
    confirmActions.append(confirmCancel,confirmProceed);confirmDialog.append(confirmHeading,confirmBody,confirmActions);
    async function confirmAction(title,description,action){
      if(confirmDialog.open || working)return false;
      confirmHeading.textContent=title;confirmBody.textContent=description;confirmProceed.textContent=action;
      confirmDialog.returnValue="";
      return new Promise(resolve=>{
        confirmDialog.addEventListener("close",()=>resolve(confirmDialog.returnValue==="confirm"),{once:true});
        confirmDialog.showModal();confirmCancel.focus();
      });
    }
    const renameDialog=make("dialog","","bowone-op-rename");
    renameDialog.setAttribute("aria-labelledby","op-rename-heading");
    const renameForm=make("form"), renameHeading=make("h2","카드 파일명 수정");
    renameHeading.id="op-rename-heading";
    const renameInput=make("input");
    renameInput.type="text"; renameInput.required=true; renameInput.maxLength=240;
    renameInput.autocomplete="off"; renameInput.spellcheck=false;
    const cardDescription=make("textarea");cardDescription.rows=3;cardDescription.maxLength=5000;
    const cardUrl=make("input");cardUrl.type="url";cardUrl.placeholder="https://…";
    const cardNameField=label("새 파일명",renameInput),cardUrlField=label("링크 주소",cardUrl);
    const renameHelp=make("p","","bowone-op-rename-help");
    renameHelp.id="op-rename-help"; renameInput.setAttribute("aria-describedby",renameHelp.id);
    const renameStatus=make("p","","bowone-op-rename-status");
    renameStatus.setAttribute("role","status");
    const renameActions=make("div","","form-actions");
    const renameCancel=button("취소",()=>renameDialog.close());
    const renameSave=make("button","파일명 저장","button button-white");
    renameSave.type="submit";
    renameActions.append(renameCancel,renameSave);
    renameForm.append(renameHeading,cardNameField,cardUrlField,label("카드 설명",cardDescription),renameHelp,renameStatus,renameActions);
    renameDialog.append(renameForm);
    let renaming=null;
    function openRename(item){
      if(!admin || !ready || pending.size || !item || !item.opId&&!item.inboxId&&!item.newLink || renameDialog.open)return;
      const filename=item.sourcePath?.split("/").at(-1)||"";
      const suffix=filename.match(/\.[^.]+$/)?.[0]||"";
      renaming=item;
      renameInput.value=filename?(suffix?filename.slice(0,-suffix.length):filename):item.title||"";
      renameHeading.textContent=filename?"카드 파일명 수정":item.newLink?"링크 카드 추가":"링크 카드 수정";
      cardNameField.firstElementChild.textContent=filename?"새 파일명":"카드 제목";
      cardDescription.value=item.desc||"";cardUrl.value=item.url||"";
      cardUrlField.hidden=!!filename;cardUrl.required=!filename;
      renameSave.textContent=filename?"파일명 저장":item.newLink?"카드 추가":"카드 정보 저장";
      renameHelp.textContent=filename?(suffix?suffix+" 확장자는 유지됩니다. ":"")+"같은 이름이 있으면 (1), (2) 순으로 붙습니다.":item.newLink?"공통 미등록 목록에 추가됩니다. 이후 원하는 항목에 등록하세요.":"링크의 제목·설명·주소가 구버전과 신버전에 함께 저장됩니다.";
      renameStatus.textContent="";
      renameDialog.showModal();
      renameInput.focus();renameInput.select();
    }
    renameDialog.addEventListener("cancel",event=>{if(renameSave.disabled)event.preventDefault();});
    renameDialog.addEventListener("close",()=>{
      if(!renaming)return;
      const inViewer=document.querySelector("#viewer[open] .bowone-op-file-title");
      const inGrid=[...document.querySelectorAll("[data-op-card]")].find(el=>el.dataset.opCard===renaming.opId)?.querySelector(".bowone-op-file-title");
      (inViewer||inGrid)?.focus({preventScroll:true});
      renaming=null;
    });
    renameForm.addEventListener("submit",async event=>{
      event.preventDefault();
      if(!renaming || pending.size)return;
      const name=renameInput.value.trim();
      if(!name){renameStatus.textContent="새 파일명을 입력해 주세요.";renameInput.focus();return;}
      renameSave.disabled=renameCancel.disabled=renameInput.disabled=cardDescription.disabled=cardUrl.disabled=true;
      renameStatus.textContent="카드 정보 저장 중…";
      try{
        const {opId:id,inboxId,sourcePath,newLink}=renaming;
        if(await run(newLink?"addLink":"edit",{id,inboxId,sourcePath,name,title:name,desc:cardDescription.value,url:cardUrl.value},renameStatus.textContent))renameDialog.close();
        else{
          renameStatus.textContent=status.textContent;
          renameInput.disabled=false;renameInput.focus();
        }
      }finally{renameSave.disabled=renameCancel.disabled=renameInput.disabled=cardDescription.disabled=cardUrl.disabled=false;}
    });
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
    const selectionTools=make("div","","bowone-op-selection-tools");
    selectionTools.setAttribute("role","group");selectionTools.setAttribute("aria-label","카드 일괄 조작");
    const selectMode=button("카드 선택",()=>{selectionMode=!selectionMode;refreshSelection();});
    const selectCount=make("span","선택 0장");
    const selectAll=button("현재 목록 모두 선택",()=>{
      for(const el of document.querySelectorAll("#work-sections [data-op-card]"))if(el.getClientRects().length)chosen.add(el.dataset.opCard);
      refreshSelection();
    });
    const selectNone=button("선택 해제",()=>{chosen.clear();refreshSelection();});
    const recoverSelection=button("선택 카드 미등록으로",()=>recoverCards([...chosen]));
    const moveTarget=make("select");moveTarget.setAttribute("aria-label","선택 카드를 옮길 항목");
    const moveSelection=button("선택 카드 이동",()=>transferCards([...chosen],[],moveTarget.value));
    const deleteSelection=button("선택 카드 영구 삭제",()=>deleteCards([...chosen],[]));
    deleteSelection.classList.add("op-delete");
    const recoverCategory=button("현재 분야 모두 회수",async()=>{
      const ids=view.currentGroupCards();
      if(ids.length && await confirmAction("현재 분야 모두 회수","현재 분야의 "+ids.length+"개 카드를 모두 미등록으로 옮깁니다. 원본은 삭제하지 않습니다.","미등록으로 옮기기"))recoverCards(ids);
    });
    selectionTools.append(selectMode,selectCount,selectAll,selectNone,recoverSelection,moveTarget,moveSelection,deleteSelection,recoverCategory);
    selectionTools.hidden=true;bar.append(selectionTools);
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
    const newLink=button("링크 카드 추가",()=>openRename({newLink:true}));
    const tools = make("div","","bowone-op-tools"); tools.append(upload,newLink,refresh,fileInput);
    const target = make("select");
    target.setAttribute("aria-label","등록할 항목");
    const list = make("ul","","bowone-op-list");
    const inboxHeading = make("h3","미등록 카드 · Null_card");
    const inboxTools=make("div","","bowone-op-tools");
    const inboxCount=make("span","선택 0장");inboxCount.setAttribute("role","status");
    const inboxAll=button("전체 선택",()=>{inbox.forEach(row=>inboxChosen.add(row.id));refreshSelection();});
    const inboxNone=button("선택 해제",()=>{inboxChosen.clear();refreshSelection();});
    const inboxRegister=button("선택 카드 등록",()=>transferCards([],[...inboxChosen],target.value));
    const inboxDelete=button("선택 카드 삭제",()=>deleteCards([],[...inboxChosen]));inboxDelete.classList.add("op-delete");
    inboxTools.append(inboxCount,inboxAll,inboxNone,inboxRegister,inboxDelete);
    const dropZone = make("section","","bowone-op-inbox");
    dropZone.append(inboxHeading,make("p","선택 후 한 번에 등록·삭제할 수 있습니다. 파일을 섹션으로 끌어 등록하거나, 등록된 카드를 이곳으로 끌어 회수하세요."),tools,label("등록할 항목",target),inboxTools,list);
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
      recoverCards(Array.isArray(card.ids)?card.ids:[card.id]);
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
    document.body.append(renameDialog,confirmDialog);
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
        if (!admin || working || !ready) {event.preventDefault();return;}
        event.dataTransfer.effectAllowed="move";
        event.dataTransfer.setData(mime,JSON.stringify({kind,id,ids:kind==="inbox"&&inboxChosen.has(id)?[...inboxChosen]:[id]}));
        event.dataTransfer.setData("text/plain","BOWONE 카드");
      });
    }
    function refreshSelection(){
      selectionTools.hidden=!admin;
      selectMode.setAttribute("aria-pressed",String(selectionMode));
      selectCount.textContent="선택 "+chosen.size+"장";
      for(const control of [selectNone,recoverSelection,moveTarget,moveSelection,deleteSelection])control.hidden=!selectionMode&&!chosen.size;
      selectNone.disabled=recoverSelection.disabled=moveSelection.disabled=deleteSelection.disabled=working || !chosen.size || !ready;
      selectAll.disabled=selectMode.disabled=recoverCategory.disabled=moveTarget.disabled=working || !ready;
      inboxCount.textContent="선택 "+inboxChosen.size+"장";
      inboxNone.disabled=inboxRegister.disabled=inboxDelete.disabled=working || !inboxChosen.size || !ready;
      inboxAll.disabled=target.disabled=newLink.disabled=working || !ready;
      for(const row of list.querySelectorAll(".bowone-op-row")){
        const selected=inboxChosen.has(row.dataset.inboxId);
        row.classList.toggle("op-card-selected",selected);
        const check=row.querySelector('input[type="checkbox"]');if(check)check.checked=selected;
        row.querySelectorAll("input,button").forEach(control=>{control.disabled=working||!ready;});
      }
      document.documentElement.classList.toggle("op-selection-mode",admin && selectionMode);
      for(const el of document.querySelectorAll("#work-sections [data-op-card]")){
        const checked=chosen.has(el.dataset.opCard),input=el.querySelector(".bowone-op-select input");
        el.classList.toggle("op-card-selected",checked);
        if(input){input.checked=checked;input.disabled=working || !ready;}
        for(const control of el.querySelectorAll(".bowone-op-card-actions button,.bowone-op-grip"))control.disabled=working || !ready;
      }
    }
    async function transferCards(ids,inboxIds,grid,before="",after=false){
      if(working || !grid || !ids.length&&!inboxIds.length)return;
      if(await run("transfer",{ids,inboxIds,grid,before,after},(ids.length+inboxIds.length)+"개 카드를 이동하는 중…")){
        ids.forEach(id=>chosen.delete(id));inboxIds.forEach(id=>inboxChosen.delete(id));refreshSelection();
      }
    }
    async function deleteCards(ids,inboxIds){
      if(working || !ids.length&&!inboxIds.length)return;
      if(ids.length+inboxIds.length>400){status.textContent="한 번에 최대 400장까지 삭제할 수 있습니다.";return;}
      if(!await confirmAction("카드 영구 삭제","선택한 "+(ids.length+inboxIds.length)+"개 카드의 GitHub 원본 파일과 카드 기록이 함께 삭제됩니다. 링크 카드는 기록만 삭제합니다. 화면에서만 빼려면 취소 후 ‘미등록으로’를 사용하세요.","영구 삭제"))return;
      if(await run("remove",{ids,inboxIds},"원본 파일과 카드 기록 삭제 중…")){
        ids.forEach(id=>chosen.delete(id));inboxIds.forEach(id=>inboxChosen.delete(id));refreshSelection();
      }
    }
    async function recoverCards(ids){
      if(!ids.length || working)return;
      if(ids.length>400){status.textContent="한 번에 최대 400장까지 선택해 주세요.";return;}
      if(await run("recover",{ids},ids.length+"개 카드를 미등록으로 옮기는 중…")){
        ids.forEach(id=>chosen.delete(id));refreshSelection();
      }
    }
    async function reorderCards(grid,ids,before="",after=false){
      if(working || !admin || !ready)return;
      const preview=view.reorderCards(grid,ids,before,after);
      if(!preview){
        await transferCards(ids,[],grid,before,after);
        return;
      }
      if(preview.order.every((id,index)=>id===preview.previous[index]))return;
      if(!await run("arrange",{id:ids[0],ids,grid,order:preview.order},"카드 순서를 반영하는 중…"))
        view.restoreCardOrder(grid,preview.previous);
    }
    document.addEventListener("click",event=>{
      if(event.detail>0 && gesture.takeClick()){event.preventDefault();event.stopImmediatePropagation();return;}
      const card=event.target.closest("#work-sections [data-op-card]");
      if(!admin || !card || !event.target.closest(".work-media") || !(selectionMode || event.ctrlKey || event.metaKey))return;
      event.preventDefault();event.stopImmediatePropagation();
      if(working)return;
      if(chosen.has(card.dataset.opCard))chosen.delete(card.dataset.opCard);else chosen.add(card.dataset.opCard);
      refreshSelection();
    },true);
    const editor = {
      refresh:refreshSelection,
      title(el,item) {
        if(!admin || !item?.opId)return;
        const name=item.sourcePath?.split("/").at(-1)||item.title;
        const control=make("button",name,"bowone-op-file-title");
        control.type="button";
        control.title="더블클릭하여 카드 정보 수정";
        control.setAttribute("aria-label",name+(item.sourcePath?" 파일명 수정":" 카드 정보 수정"));
        control.addEventListener("dblclick",event=>{
          event.preventDefault();
          openRename(item);
        });
        control.addEventListener("click",event=>{
          if(event.detail===0 || event.pointerType==="touch")openRename(item);
        });
        el.replaceChildren(control);
      },
      card(el,item) {
        if (!admin) return;
        el.dataset.opCard=item.opId;
        el.draggable=false;
        el.querySelectorAll("img").forEach(image=>{image.draggable=false;});
        const check=make("input");check.type="checkbox";
        check.setAttribute("aria-label",(item.sourcePath?.split("/").at(-1)||item.title||"카드")+" 선택");
        check.checked=chosen.has(item.opId);
        check.addEventListener("change",()=>{if(check.checked)chosen.add(item.opId);else chosen.delete(item.opId);refreshSelection();});
        const selection=make("label","","bowone-op-select");
        selection.append(check,make("span","선택"));
        const grip=button("↕",()=>{});
        grip.classList.add("bowone-op-grip");grip.title="누른 채 끌어서 순서 이동 · 방향키로도 이동";
        grip.setAttribute("aria-label",(item.sourcePath?.split("/").at(-1)||item.title||"카드")+" 순서 이동");
        grip.addEventListener("keydown",event=>{
          if(!["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Home","End"].includes(event.key))return;
          event.preventDefault();
          const grid=el.closest(".work-grid"),rows=[...grid.children].filter(row=>row.dataset.opCard);
          const cols=getComputedStyle(grid).gridTemplateColumns.split(" ").length,at=rows.indexOf(el);
          const step=event.key==="ArrowUp"?-cols:event.key==="ArrowDown"?cols:event.key==="ArrowLeft"?-1:1;
          const target=event.key==="Home"?0:event.key==="End"?rows.length-1:Math.max(0,Math.min(rows.length-1,at+step));
          void reorderCards(grid.dataset.opGrid,[item.opId],rows[target].dataset.opCard,target>at);
        });
        el.prepend(selection,grip);
        const back=button("미등록으로",()=>recoverCards(chosen.has(item.opId)?[...chosen]:[item.opId]));
        back.classList.add("bowone-op-return");
        const actions=make("div","","bowone-op-card-actions");
        actions.append(button("수정",()=>openRename(item)),back,button("이동",()=>{
          chosen.add(item.opId);refreshSelection();moveTarget.focus();status.textContent="상단에서 옮길 항목을 고르고 ‘선택 카드 이동’을 누르세요.";
        }),button("삭제",()=>deleteCards([item.opId],[])));
        el.querySelector(".work-info")?.append(actions);
      },
    };
    let pressed=null,dragging=null,dragFrame=0;
    function clearDrag(){
      cancelAnimationFrame(dragFrame);dragFrame=0;
      dragging?.ghost.remove();dragging=null;
      if(pressed?.el.hasPointerCapture?.(pressed.pointerId))pressed.el.releasePointerCapture(pressed.pointerId);
      pressed=null;
      document.documentElement.classList.remove("op-card-dragging");
      document.querySelectorAll(".op-drag-source,.op-insert-before,.op-insert-after,.op-drop-active").forEach(el=>{
        el.classList.remove("op-drag-source","op-insert-before","op-insert-after","op-drop-active");
      });
    }
    function dropAt(point){
      const hit=document.elementFromPoint(point.x,point.y);
      const unassigned=hit?.closest(".bowone-op-inbox");
      if(unassigned)return {inbox:unassigned};
      const grid=hit?.closest("[data-op-grid]");
      if(!grid)return null;
      const card=hit.closest("[data-op-card]");
      const rect=card?.getBoundingClientRect();
      return {grid:grid.dataset.opGrid,element:grid,card,before:card?.dataset.opCard||"",after:!!rect && (point.y>rect.bottom || point.x>rect.left+rect.width/2)};
    }
    function drawDrag(){
      if(!dragging)return;
      const point=dragging.point,hit=dropAt(point);
      dragging.ghost.style.transform="translate("+Math.round(point.x+16)+"px,"+Math.round(point.y+16)+"px)";
      document.querySelectorAll(".op-insert-before,.op-insert-after,.op-drop-active").forEach(el=>el.classList.remove("op-insert-before","op-insert-after","op-drop-active"));
      if(hit?.inbox)hit.inbox.classList.add("op-drop-active");
      else if(hit?.card && !pressed.ids.includes(hit.before))hit.card.classList.add(hit.after?"op-insert-after":"op-insert-before");
      else if(hit?.element)hit.element.classList.add("op-drop-active");
      const scroll=document.elementFromPoint(point.x,point.y)?.closest(".scroll-gallery,.bowone-op-panel");
      let scrolled=false;
      if(scroll){
        const rect=scroll.getBoundingClientRect(),old=scroll.scrollTop;
        if(point.y<rect.top+48)scroll.scrollTop-=12;
        else if(point.y>rect.bottom-48)scroll.scrollTop+=12;
        scrolled=scroll.scrollTop!==old;
      }
      if(!scrolled){
        if(point.y<90)window.scrollBy(0,-12);
        else if(point.y>innerHeight-70)window.scrollBy(0,12);
      }
      dragFrame=requestAnimationFrame(drawDrag);
    }
    const gesture=createPressDrag({
      start(point){
        if(!pressed || working || !admin)return;
        pressed.el.setPointerCapture?.(point.pointerId);
        const ghost=make("div",pressed.ids.length+"장 이동","bowone-op-drag-ghost");
        document.body.append(ghost);dragging={ghost,point};
        document.documentElement.classList.add("op-card-dragging");
        document.querySelectorAll("[data-op-card]").forEach(el=>{if(pressed.ids.includes(el.dataset.opCard))el.classList.add("op-drag-source");});
        window.getSelection()?.removeAllRanges();
        dragFrame=requestAnimationFrame(drawDrag);
      },
      move(point){if(dragging)dragging.point=point;},
      drop(point){
        const destination=dropAt(point),ids=pressed?.ids||[];
        clearDrag();
        if(destination?.inbox){void recoverCards(ids);return;}
        if(destination?.grid)void reorderCards(destination.grid,ids,destination.before,destination.after);
      },
      cancel:clearDrag,
    });
    document.addEventListener("pointerdown",event=>{
      if(event.button===0)gesture.takeClick();
      if(!admin || !ready || working || document.querySelector("dialog[open]"))return;
      const el=event.target.closest("#work-sections [data-op-card]");
      if(!el || !event.target.closest(".work-media,.bowone-op-grip") || (event.pointerType==="touch" && !event.target.closest(".bowone-op-grip")))return;
      if(gesture.down(event))pressed={el,pointerId:event.pointerId,ids:chosen.has(el.dataset.opCard)?[...chosen]:[el.dataset.opCard]};
    },true);
    document.addEventListener("pointermove",event=>{if(gesture.move(event))event.preventDefault();},{passive:false,capture:true});
    document.addEventListener("pointerup",event=>{if(gesture.up(event))event.preventDefault();else if(!gesture.active)pressed=null;},true);
    document.addEventListener("pointercancel",()=>{gesture.cancel();pressed=null;},true);
    document.addEventListener("keydown",event=>{if(event.key==="Escape"){gesture.cancel();pressed=null;}});
    window.addEventListener("blur",()=>{gesture.cancel();pressed=null;});
    document.addEventListener("click",event=>{if(event.detail>0 && gesture.takeClick()){event.preventDefault();event.stopImmediatePropagation();}},true);
    document.addEventListener("dragstart",event=>{
      if(admin && event.target.closest("#work-sections [data-op-card]"))event.preventDefault();
    },true);
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
      if(card.kind==="inbox")void transferCards([],Array.isArray(card.ids)?card.ids:[card.id],grid.dataset.opGrid,before);
      else void reorderCards(grid.dataset.opGrid,Array.isArray(card.ids)?card.ids:[card.id],before);
    });
    function renderInbox() {
      list.replaceChildren();
      inboxHeading.textContent="미등록 카드 · Null_card ("+inbox.length+")";
      if (!inbox.length) {list.append(make("li","미등록 카드 없음"));return;}
      for (const item of inbox) {
        const row = make("li","","bowone-op-row");
        row.dataset.inboxId=item.id;
        const check=make("input");check.type="checkbox";check.checked=inboxChosen.has(item.id);check.setAttribute("aria-label",item.title+" 선택");
        check.addEventListener("change",()=>{if(check.checked)inboxChosen.add(item.id);else inboxChosen.delete(item.id);refreshSelection();});
        row.append(check);
        const preview=button("",()=>view.previewInbox(item,preview));preview.classList.add("bowone-op-inbox-preview");preview.setAttribute("aria-label",item.title+" 미리보기");
        if (item.preview) {
          const image=make("img"); image.alt=""; image.src=item.preview; image.loading="lazy"; image.draggable=false;
          image.addEventListener("error",()=>{image.remove();preview.textContent="보기";},{once:true}); preview.append(image);
        }else preview.textContent=item.type==="video"?"▶":"↗";
        const info=make("div","","bowone-op-inbox-info"),name=button(item.title,()=>openRename({...item,inboxId:item.id}));name.className="bowone-op-file-title";
        const actions=make("div","","bowone-op-row-actions");
        actions.append(button("등록",()=>transferCards([],inboxChosen.has(item.id)?[...inboxChosen]:[item.id],target.value)),button("수정",()=>openRename({...item,inboxId:item.id})),button("삭제",()=>deleteCards([],inboxChosen.has(item.id)?[...inboxChosen]:[item.id])));
        info.append(name,actions);row.append(preview,info);
        dragSource(row,"inbox",item.id);
        list.append(row);
      }
    }
    async function run(action,args,message) {
      if (!admin || !ready || pending.size) return false;
      const id = ++sequence;
      working=true;refreshSelection();
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
        working=false;refreshSelection();
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
        gesture.cancel();chosen.clear();inboxChosen.clear();selectionMode=false;refreshSelection();
        setOpen(false);
        if(renameDialog.open)renameDialog.close();
        if(confirmDialog.open)confirmDialog.close("cancel");
        if(wasAdmin){
          view.disableEditor();view.resetCatalog();catalogRevision=undefined;settingsRevision=undefined;
          if(!view.getPublishedCatalog().editorSettings)fields.replace(baseSettings);
          draft=false;selected="";inspector.hidden=true;
        }
        status.textContent="";
        return;
      }
      if (!wasAdmin) {
        view.enableEditor(editor);
        setOpen(matchMedia("(min-width: 1100px)").matches);
        status.textContent="문구나 카드 파일명을 더블클릭해 편집하세요.";
      }
      if (data.grids && !target.options.length) for (const [id,name] of data.grids){target.add(new Option(name,id));moveTarget.add(new Option(name,id));}
      if (Array.isArray(data.inbox) && data.inboxRevision !== inboxRevision) {
        inboxRevision=data.inboxRevision; inbox=data.inbox;
        const valid=new Set(inbox.map(row=>row.id));for(const id of inboxChosen)if(!valid.has(id))inboxChosen.delete(id);
        renderInbox();
      }
      if (data.catalog && data.catalogRevision !== catalogRevision) {
        const valid=new Set(Object.values(data.catalog.portfolio||{}).flatMap(rows=>rows.map(row=>row.opId)));
        for(const id of chosen)if(!valid.has(id))chosen.delete(id);
        catalogRevision=data.catalogRevision; view.setCatalog(data.catalog);
        fields.replace(fields.snapshot());
      }
      if (data.settings && data.settingsRevision !== settingsRevision && !draft) {
        settingsRevision=data.settingsRevision; fields.replace(data.settings);
      }
      if (!pending.size && data.error) status.textContent=data.error;
      refreshSelection();
    }
    window.addEventListener("message",receive);
    save.hidden=panelToggle.hidden=true;
    send({type:"ready"});
    const retry = setInterval(()=>{if(initialized){clearInterval(retry);return;}send({type:"ready"});},500);
    setTimeout(()=>{clearInterval(retry); if(!initialized) status.textContent="OP 연결을 확인해 주세요.";},6000);
  }
  module.exports={mount};
})();
