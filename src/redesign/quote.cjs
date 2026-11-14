(function (root, build) {
  const api = build();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.BowoneQuote = api;
})(globalThis, function () {
  "use strict";

  const integer = (n, min=0) => {
    const value = Number(n);
    return Number.isSafeInteger(value) ? Math.max(min,value) : 0;
  };
  const initial = () => ({selected:{}, quantities:{}, mode:"cursor", adjustment:0});
  const clone = s => ({selected:{...s.selected}, quantities:{...s.quantities}, mode:s.mode, adjustment:s.adjustment});
  const ledger = () => ({draft:initial(), orders:[], editIndex:-1, beforeEdit:null});
  const currency = n => new Intl.NumberFormat("ko-KR").format(n)+"원";
  const indexOf = (draft,id) => integer(draft.selected[id]);
  const selectedValue = (spec,draft,id) => spec.fields.find(field=>field.id===id)?.options[indexOf(draft,id)]?.[0] || "0";
  const kindOf = (spec,draft) => selectedValue(spec,draft,"kind");
  const tierRules = [[5,.60],[10,.45],[20,.30],[Infinity,.25]];

  function optionsFor(schema,spec,draft,field) {
    if(field.control!=="dependent") return field.options;
    const kind=kindOf(spec,draft);
    const table=schema.illustration;
    const values=field.id==="base"
      ? (kind==="concept" ? table.concept : kind==="illustration" ? table.illustration[selectedValue(spec,draft,"usage")] : [])
      : table.styles[kind];
    return [...field.options,...(values||[])];
  }
  function activeFields(spec,draft) {
    const kind=kindOf(spec,draft);
    return spec.fields.filter(field=>
      (!field.mode || field.mode===draft.mode) &&
      !(spec.key==="illust" && field.id==="usage" && kind==="concept")
    );
  }
  function selection(schema,spec,draft,field) {
    const options=optionsFor(schema,spec,draft,field);
    const i=Math.min(options.length-1,indexOf(draft,field.id));
    return {index:i,value:options[i]?.[0] ?? "0",name:options[i]?.[1] ?? ""};
  }
  function applySelection(schema,spec,draft,field,index) {
    const options=optionsFor(schema,spec,draft,field);
    if(!Number.isInteger(index) || !options[index]) return;
    if(spec.key==="illust" && field.id==="split" && options[index][0]==="no_split" && kindOf(spec,draft)!=="illustration") return;
    draft.selected[field.id]=index;
    if(field.control==="quantity") {
      const value=Number(options[index][0]);
      const free=index>0 && value===0 && !/^(없음|선택하세요)/.test(options[index][1]);
      draft.quantities[field.id]=value>0||free?1:0;
    }
    if(spec.key==="illust" && ["kind","usage"].includes(field.id)){
      draft.selected.base=0;
      draft.selected.style=0;
      if(kindOf(spec,draft)!=="illustration" && selectedValue(spec,draft,"split")==="no_split") draft.selected.split=0;
    }
  }
  function changeQuantity(schema,spec,draft,field,delta) {
    const option=selection(schema,spec,draft,field);
    if(field.control!=="fixed" && !(Number(option.value)>0)) return;
    const next=Math.max(0,integer(draft.quantities[field.id])+delta);
    if(!Number.isSafeInteger(next)) return;
    draft.quantities[field.id]=next;
    if(!next && field.control!=="fixed") draft.selected[field.id]=0;
  }
  function switchMode(spec,draft,mode) {
    if(!["cursor","illustration","game"].includes(mode) || draft.mode===mode) return;
    draft.mode=mode;
    for(const f of spec.fields){ delete draft.selected[f.id]; delete draft.quantities[f.id]; }
  }
  function peopleFee(base,count) {
    let assigned=0, units=0;
    const parts=[];
    for(const [limit,rate] of tierRules) {
      const portion=Math.max(0,Math.min(count,limit)-assigned);
      if(!portion) continue;
      assigned+=portion;
      units+=portion*rate;
      parts.push(portion+"명 × "+Math.round(rate*100)+"%");
      if(assigned>=count) break;
    }
    return {amount:Math.round(base*units), rate:parts.join(" + ")};
  }
  function calculate(schema,spec,draft) {
    const kind=kindOf(spec,draft), items=[];
    for(const field of activeFields(spec,draft)){
      const {id,label,control}=field;
      const option=selection(schema,spec,draft,field);
      const count=integer(draft.quantities[id]);
      if(control==="choice") continue;
      if(spec.key==="thumb" && id==="split"){
        if(option.value==="5000" && count) items.push({id,name:"완료 후 레이어 분할 ("+count+"명 · 기본 5,000원 + 인당 5,000원)",qty:1,amount:5000+count*5000});
        continue;
      }
      if(spec.key==="illust" && (id==="people"||id==="split")) continue;
      const unit=Number(option.value);
      const qty=control==="quantity" || control==="fixed" ? count : 1;
      const free=unit===0 && option.index>0 && !/^(없음|선택하세요)/.test(option.name);
      if(qty>0 && (unit>0 || free)) items.push({id,name:label+": "+option.name,qty,amount:unit*qty});
    }
    if(spec.key==="illust"){
      const base=items.find(x=>x.id==="base")?.amount || 0;
      const count=integer(draft.quantities.people);
      if(kind==="illustration" && base && count){
        const fee=peopleFee(base,count);
        if(fee.amount>0) items.push({id:"people",name:"추가 인원 ("+count+"명)",qty:1,...fee});
      }
      const split=selectedValue(spec,draft,"split");
      if(split==="consult") items.push({id:"split",name:"레이어 분할: 추가 부위별 분할 (별도 문의)",qty:1,amount:0});
      if(split==="no_split" && kind==="illustration" && base) {
        const character=items.filter(x=>["base","style","people"].includes(x.id)).reduce((sum,item)=>sum+item.amount,0);
        const discount=Math.round(character*.30);
        if(discount>0) items.push({id:"split",name:"레이어 분할: 분할 없이 작업 (캐릭터 작업비 30% 할인)",qty:1,amount:-discount});
      }
    }
    const adjustment=Number.isSafeInteger(draft.adjustment)?draft.adjustment:0;
    const total=items.reduce((sum,item)=>sum+item.amount,adjustment);
    return {items,adjustment,total};
  }
  function summarize(schema,spec,draft,quote) {
    const picked = id => {
      const field=spec.fields.find(f=>f.id===id);
      if(!field) return "";
      const selected=selection(schema,spec,draft,field);
      return selected.index>0?selected.name:"";
    };
    if(spec.key==="illust"){
      const count=integer(draft.quantities.people);
      return [
        ["필수 옵션",[picked("kind"),kindOf(spec,draft)==="illustration"?picked("usage"):"",picked("base"),picked("style")].filter(Boolean).join(" · ") || "선택 없음"],
        ["배경",picked("background")||"없음"],
        ["총원",(count+1)+"명"],
        ["적용 요율",[quote.items.find(it=>it.id==="people")?.rate||(count && kindOf(spec,draft)==="concept"?"별도 협의":""),quote.items.some(it=>it.id==="split"&&it.amount<0)?"분할 없음 30% 할인":""].filter(Boolean).join(" · ") || "해당 없음"],
      ];
    }
    if(spec.key==="pixel") return [["유형",({cursor:"마우스 커서",illustration:"픽셀아트 일러스트",game:"게임소스"})[draft.mode]]];
    return [];
  }
  function saveOrder(schema,spec,book,keep=false) {
    const q=calculate(schema,spec,book.draft);
    if(!Number.isSafeInteger(q.total) || q.total===0) return false;
    const snapshot=clone(book.draft);
    const order={...q,snapshot,summary:summarize(schema,spec,snapshot,q)};
    if(book.editIndex>=0) book.orders[book.editIndex]=order;
    else book.orders.push(order);
    book.draft=keep?{...clone(snapshot),adjustment:0}:{...initial(),mode:snapshot.mode};
    book.editIndex=-1;
    book.beforeEdit=null;
    return true;
  }
  function editOrder(book,index) {
    const order=book.orders[index];
    if(!order) return false;
    if(book.editIndex<0) book.beforeEdit=clone(book.draft);
    book.editIndex=index;
    book.draft=clone(order.snapshot);
    return true;
  }
  function cancelEdit(book) {
    if(book.editIndex<0) return;
    book.draft=book.beforeEdit||initial();
    book.editIndex=-1;
    book.beforeEdit=null;
  }
  function removeOrder(book,index) {
    if(!book.orders[index]) return;
    if(book.editIndex===index) cancelEdit(book);
    else if(book.editIndex>index) book.editIndex--;
    book.orders.splice(index,1);
  }
  function grandTotal(book,quote) {
    return book.orders.reduce((sum,row,i)=>i===book.editIndex?sum:sum+row.total,quote.total);
  }
  function removeItem(schema,spec,draft,id) {
    const field=spec.fields.find(f=>f.id===id);
    if(!field) return;
    applySelection(schema,spec,draft,field,0);
    draft.quantities[id]=0;
  }

  function mount(schema,spec,parent,config) {
    const book=ledger();
    const el=(tag,cls,content)=>{
      const node=document.createElement(tag);
      if(cls)node.className=cls;
      if(content!==undefined)node.textContent=content;
      return node;
    };
    const action=(name,run,cls="button button-outline")=>{
      const b=el("button",cls,name);
      b.type="button"; b.addEventListener("click",run);
      return b;
    };
    const root=el("section","quote-box");
    root.id="calc-"+spec.key;
    root.setAttribute("aria-labelledby","quote-title-"+spec.key);
    const top=el("div","quote-head");
    const heading=el("h3","","견적 계산기");
    heading.id="quote-title-"+spec.key; heading.tabIndex=-1;
    top.append(el("p","index-label","ESTIMATE / "+spec.english.toUpperCase()),heading,
      el("p","quote-muted","옵션을 선택해 예상 금액을 계산하세요. 실제 주문이나 결제는 진행되지 않습니다."));
    root.append(top);

    const fieldMap=new Map(), fields=el("div","quote-fields");
    let pixelSelect;
    if(spec.key==="pixel"){
      const lab=el("label","field");
      pixelSelect=el("select");
      for(const [id,label] of [["cursor","마우스 커서"],["illustration","픽셀아트 일러스트"],["game","게임소스"]]) pixelSelect.add(new Option(label,id));
      pixelSelect.addEventListener("change",()=>{switchMode(spec,book.draft,pixelSelect.value); render();});
      lab.append(el("span","","유형"),pixelSelect);
      fields.append(lab);
    }
    for(const field of spec.fields){
      const row=el("div","quote-field");
      row.dataset.option=field.id;
      const optionId=root.id+"-"+field.id;
      const isFixed=field.control==="fixed", isToggle=field.control==="toggle";
      const label=el(isFixed||isToggle?"span":"label","quote-label",field.label);
      label.id=optionId+"-label";
      if(!isFixed&&!isToggle) label.htmlFor=optionId;
      row.append(label);
      const input=el("div","quote-input");
      let sel, step, output, toggle;
      if(!isFixed && !isToggle){
        sel=el("select"); sel.id=optionId;
        sel.addEventListener("change",()=>{applySelection(schema,spec,book.draft,field,sel.selectedIndex); render();});
        input.append(sel);
      }
      if(isToggle){
        toggle=action("꺼짐",()=>{
          const on=indexOf(book.draft,field.id)!==0;
          applySelection(schema,spec,book.draft,field,on?0:1);
          render();
        },"quote-toggle");
        toggle.setAttribute("aria-label",field.label);
        input.append(toggle);
      }
      if(field.control==="quantity" || isFixed){
        step=el("div","quote-stepper");
        step.setAttribute("role","group"); step.setAttribute("aria-labelledby",label.id);
        const minus=action("−",()=>{changeQuantity(schema,spec,book.draft,field,-1);render();},"icon-button");
        const plus=action("+",()=>{changeQuantity(schema,spec,book.draft,field,1);render();},"icon-button");
        minus.setAttribute("aria-label",field.label+" 수량 감소");
        plus.setAttribute("aria-label",field.label+" 수량 증가");
        output=el("output","mono","0");
        output.setAttribute("aria-label",field.label+" 수량");
        step.append(minus,output,plus); input.append(step);
        if(isFixed) input.prepend(el("span","quote-muted",field.id==="people"?"기본 1인 외":"횟수"));
      }
      row.append(input);
      if(field.note) row.append(el("p","quote-muted quote-hint",field.note));
      fieldMap.set(field.id,{row,sel,step,output,toggle,signature:""});
      fields.append(row);
    }
    root.append(fields);

    const adjust=el("form","quote-adjust");
    const moneyField=el("label","field"), moneyInput=el("input");
    moneyInput.type="number"; moneyInput.step="1"; moneyInput.inputMode="numeric";
    moneyInput.placeholder="+/- 원"; moneyInput.id="extra-"+spec.key;
    moneyField.append(el("span","","직접 금액 조정"),moneyInput);
    const moneyButton=el("button","button button-outline","반영");
    moneyButton.type="submit"; adjust.append(moneyField,moneyButton);
    const status=el("p","inline-status"); status.setAttribute("role","status");
    adjust.addEventListener("submit",e=>{
      e.preventDefault();
      if(!moneyInput.value.trim() || !Number.isSafeInteger(moneyInput.valueAsNumber) || !moneyInput.valueAsNumber){ status.textContent="0이 아닌 원 단위 금액을 입력하세요."; return; }
      const n=book.draft.adjustment+moneyInput.valueAsNumber;
      if(!Number.isSafeInteger(n)){status.textContent="입력 금액이 너무 큽니다.";return;}
      book.draft.adjustment=n; moneyInput.value=""; status.textContent="금액 조정을 반영했습니다."; render();
    });
    const lines=el("ul","quote-lines");
    lines.setAttribute("aria-label","선택한 견적 옵션");
    const subtotal=el("div","quote-total");
    const total=el("output","mono","0원");
    total.setAttribute("aria-live","polite");
    subtotal.append(el("strong","","현재 예상 금액"),total);
    const buttons=el("div","quote-buttons");
    const add=action("+ 주문 추가",()=>save(false),"button button-accent");
    const keep=action("옵션 유지 추가",()=>save(true));
    const cancel=action("수정 취소",()=>{cancelEdit(book); status.textContent="수정을 취소했습니다.";render();add.focus();});
    const reset=action("초기화",()=>{
      book.draft={...initial(),mode:book.draft.mode};
      book.orders.length=0; book.editIndex=-1; book.beforeEdit=null;
      moneyInput.value=""; status.textContent="이 분야의 견적과 주문을 초기화했습니다."; render();
    },"button button-outline");
    buttons.append(add,keep,cancel,reset);
    const orders=el("div","quote-orders");
    const grand=el("div","quote-total quote-grand");
    const grandLabel=el("strong","","전체 합계"), grandOutput=el("output","mono","0원");
    grandOutput.setAttribute("aria-live","polite");
    grand.append(grandLabel,grandOutput);
    const contact=el("a","text-link","이 견적으로 상담하기 ↗");
    contact.href="#contact/"+spec.id;
    contact.addEventListener("click",()=>{
      const q=calculate(schema,spec,book.draft);
      const source=book.orders.filter((_,i)=>i!==book.editIndex);
      if(q.total!==0 || q.items.length) source.push(q);
      const text=source.map((quote,i)=>"견적 "+(i+1)+": "+currency(quote.total)+"\n"+detailText(quote)).join("\n\n");
      config.onInquire(spec.id,text ? text+"\n전체 예상 금액: "+currency(grandTotal(book,q)) : "",spec.key==="illust"?({noncommercial:"비상업용",broadcast:"방송용",commercial:"상업용"})[selectedValue(spec,book.draft,"usage")]:"");
    });
    root.append(adjust,lines,subtotal,buttons,status,orders,grand,contact);
    parent.append(root);

    function save(keepOptions) {
      const editing=book.editIndex>=0;
      if(!saveOrder(schema,spec,book,keepOptions)){status.textContent="금액이 있는 옵션을 먼저 선택하세요.";return;}
      status.textContent=editing?"주문 견적을 수정했습니다.":"주문 견적을 추가했습니다.";
      render();
    }
    function detailText(quote) {
      return [
        ...quote.items.map(it=>it.name+(it.qty>1?" ×"+it.qty:"")+(it.rate?" ["+it.rate+"]":"")+" — "+currency(it.amount)),
        ...(quote.adjustment?[ "직접 입력 — "+currency(quote.adjustment) ]:[]),
      ].join("\n");
    }
    function line(name,amount,remove,rate) {
      const li=el("li","quote-line"), label=el("span","",name);
      if(rate) label.append(el("small","quote-rate",rate));
      li.append(label,el("span","mono",currency(amount)));
      if(remove){const x=action("×",remove,"quote-remove");x.setAttribute("aria-label",name+" 항목 삭제");li.append(x);}
      return li;
    }
    function renderOrders() {
      const previouslyOpen=new Set([...orders.querySelectorAll("details[open]")].map(x=>x.dataset.index));
      orders.replaceChildren();
      if(!book.orders.length) return;
      orders.append(el("h4","","누적 주문 견적"));
      book.orders.forEach((entry,i)=>{
        const item=el("article","quote-order");
        if(book.editIndex===i)item.classList.add("editing");
        const head=el("div","quote-order-head"), name=el("strong","","주문 "+String(i+1).padStart(2,"0"));
        const edit=action("수정",()=>{
          editOrder(book,i); status.textContent=(i+1)+"번 주문을 수정 중입니다."; render();
          heading.focus({preventScroll:true}); root.scrollIntoView({block:"start",behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"});
        },"button button-outline");
        edit.setAttribute("aria-label","주문 "+(i+1)+" 수정");
        const del=action("×",()=>{removeOrder(book,i); status.textContent="주문 견적을 삭제했습니다."; render();add.focus({preventScroll:true});},"quote-remove");
        del.setAttribute("aria-label","주문 "+(i+1)+" 삭제");
        head.append(name,el("span","mono",currency(entry.total)),edit,del);
        item.append(head);
        if(entry.summary.length){
          const dl=el("dl","quote-summary");
          for(const [label,value] of entry.summary){const row=el("div");row.append(el("dt","",label),el("dd","",value));dl.append(row);}
          item.append(dl);
        }
        const details=el("details","quote-detail");
        details.dataset.index=String(i);
        details.open=previouslyOpen.has(String(i));
        const summary=el("summary","","상세 내역");
        summary.append(el("span","disclosure-mark"));
        const detail=el("ul","quote-lines");
        for(const entryItem of entry.items)detail.append(line(entryItem.name+(entryItem.qty>1?" ×"+entryItem.qty:""),entryItem.amount,null,entryItem.rate));
        if(entry.adjustment) detail.append(line("직접 입력",entry.adjustment));
        details.append(summary,detail); item.append(details); orders.append(item);
      });
    }
    function render() {
      const active=new Set(activeFields(spec,book.draft).map(f=>f.id));
      const kind=kindOf(spec,book.draft);
      if(pixelSelect)pixelSelect.value=book.draft.mode;
      for(const field of spec.fields){
        const ui=fieldMap.get(field.id);
        ui.row.hidden=!active.has(field.id);
        const option=selection(schema,spec,book.draft,field);
        if(ui.sel){
          const choices=optionsFor(schema,spec,book.draft,field);
          const signature=JSON.stringify(choices);
          if(ui.signature!==signature){
            ui.sel.replaceChildren(...choices.map(([value,name])=>new Option(name,value)));
            ui.signature=signature;
          }
          ui.sel.selectedIndex=option.index;
          if(spec.key==="illust"&&field.id==="split") ui.sel.querySelector('option[value="no_split"]').disabled=kind!=="illustration";
        }
        if(ui.output){
          const quantity=integer(book.draft.quantities[field.id]);
          const available=field.control==="fixed" || Number(option.value)>0;
          ui.output.value=String(quantity);
          ui.step.firstChild.disabled=!available||quantity===0;
          ui.step.lastChild.disabled=!available;
        }
        if(ui.toggle){ const on=option.index>0;ui.toggle.textContent=on?"켜짐":"꺼짐";ui.toggle.setAttribute("aria-pressed",String(on)); }
      }
      const q=calculate(schema,spec,book.draft);
      lines.replaceChildren();
      for(const it of q.items) lines.append(line(it.name+(it.qty>1?" ×"+it.qty:""),it.amount,()=>{removeItem(schema,spec,book.draft,it.id);render();},it.rate));
      if(q.adjustment) lines.append(line("직접 입력",q.adjustment,()=>{book.draft.adjustment=0;render();}));
      if(!lines.childElementCount)lines.append(el("li","quote-muted","옵션을 선택하면 여기에 내역이 표시됩니다."));
      total.value=currency(q.total);
      const editing=book.editIndex>=0;
      add.textContent=editing?"수정 저장":"+ 주문 추가";
      keep.textContent=editing?"수정 저장 · 옵션 유지":"옵션 유지 추가";
      cancel.hidden=!editing;
      grand.hidden=book.orders.length===0;
      grandLabel.textContent="전체 합계 · "+(book.orders.length+(editing||q.total===0?0:1))+"건";
      grandOutput.value=currency(grandTotal(book,q));
      renderOrders();
    }
    render();
    return book;
  }
  return {initial,ledger,optionsFor,activeFields,applySelection,changeQuantity,switchMode,peopleFee,calculate,saveOrder,editOrder,cancelEdit,removeOrder,grandTotal,removeItem,mount};
});
