(() => {
  "use strict";

  const GROUPS = [
    ["thumbnail", "썸네일", "THUMBNAIL", [["thumbnail-ld","LD 썸네일"],["thumbnail-sd","SD 썸네일"],["thumbnail-composite","합성 썸네일"]]],
    ["illust", "일러스트", "ILLUSTRATION", [["illust-simple","심플"],["illust-line","얇은 선"],["illust-semi-painted","반무테"],["illust-cover","커버일러스트"],["illust-rough","러프퀄"],["illust-conceptart","컨셉아트"]]],
    ["3d", "3D", "3D MODELING", [["work3d-character","캐릭터"],["work3d-item","아이템"],["work3d-bg","배경"]]],
    ["live2d", "Live2D", "LIVE2D", [["live2d-work","Live2D"]]],
    ["pixel", "픽셀아트", "PIXEL ART", [["pixel-illust","픽셀아트 일러스트"],["pixel-game","게임소스"],["pixel-cursor","마우스 커서"]]],
    ["minecraft", "마인크래프트", "MINECRAFT", [["mc-skin","스킨"],["mc-model","모델링"],["mc-animation","애니메이션"],["mc-resource","리소스팩"]]],
    ["animation", "애니메이션·영상", "ANIMATION / VIDEO", [["mvAnimationGrid","MV"],["animation2DGrid","2D Animation"],["animation3DGrid","3D Animation"]]],
    ["branding", "브랜딩·채널아트", "BRANDING", [["brand-wait","방송 대기화면"],["brand-symbol","심볼 디자인"],["brand-emote","이모티콘"],["brand-poster","포스터"],["brand-etc","기타"]]],
  ].map(([id, name, english, sections]) => ({id, name, english, sections}));
  const GROUP_MAP = new Map(GROUPS.map(group => [group.id, group]));
  const SUBS = new Map(GROUPS.flatMap(group => group.sections.map(([id, label]) => [id, {id, label, group:group.id}])));
  const PUBLIC_FOLDERS = new Map(GROUPS.map((group,i)=>[group.id,["thumbnail","illustration","3d","live2d","pixelart","minecraft","animation-video","branding"][i]]));
  const FEATURES = [
    {id:"parallax", group:"illust", title:"PARALLAX", kind:"ILLUSTRATION / CONCEPT ART", hero:"parallax-landscape", alt:"유리 파편과 인물의 반사가 교차하는 PARALLAX 일러스트", pos:"60% 70%", works:[
      ["PARALLAX · 키 비주얼","illustration/PARALLAX_일러스트1.png","parallax-key","빛나는 유리 파편과 캐릭터를 한 화면에 담은 대표 일러스트입니다."],
      ["PARALLAX · 가로 일러스트","illustration/PARALLAX_일러스트2.jpg","parallax-landscape","가로 화면에 맞춰 캐릭터와 반사 이미지를 배치한 일러스트입니다."],
      ["PARALLAX · 캐릭터 컨셉아트","illustration/PARALLAX_컨셉아트.png","parallax-concept","캐릭터의 복장과 소품을 정리한 컨셉아트입니다."],
    ]},
    {id:"pixel", group:"pixel", title:"인게임 픽셀아트", kind:"PIXEL ART / GAME ART", hero:"pixel-scene", alt:"두 캐릭터가 대결하는 픽셀아트 게임 장면", pos:"50% 50%", works:[
      ["인게임 픽셀아트","pixelart/인게임_3완성.jpg","pixel-scene","캐릭터와 타격 이펙트, 전투 UI가 함께 보이는 인게임 그래픽입니다."],
    ]},
    {id:"model", group:"3d", title:"3D 캐릭터 작업", kind:"3D MODELING / CHARACTER", hero:"model-unity", alt:"Unity 화면에서 확인한 3D 캐릭터 모델", pos:"50% 46%", works:[
      ["3D 캐릭터 · Unity","3d/Unity스크린샷 (3).png","model-unity","Unity에서 확인한 캐릭터 모델입니다."],
      ["3D 캐릭터 · Maya","3d/Maya스크린샷 (8).png","model-maya","Maya 뷰포트에서 여러 방향으로 살펴본 캐릭터 모델입니다."],
    ]},
    {id:"thumbnail", group:"thumbnail", title:"LD 썸네일", kind:"THUMBNAIL / ILLUSTRATION", hero:"thumbnail-may", alt:"두 장면을 한 컷에 담은 조자라 LD 썸네일", pos:"50% 50%", works:[
      ["조자라 · LD 썸네일","thumbnail/2026-05-20.조자라.jpg","thumbnail-may","인물 표정과 문구를 좌우에 배치한 방송용 썸네일입니다."],
      ["조자라 · LD 썸네일","thumbnail/2026-03-02.조자라.jpg","thumbnail-march","인물과 장면의 대비를 살린 방송용 썸네일입니다."],
    ]},
  ];

  const DEFAULT_GROUP = "thumbnail";
  const STYLE_SECTIONS = ["illust-simple","illust-line","illust-semi-painted"];
  const DEFAULT_STYLE = "illust-semi-painted";
  const GROUP_ALIASES = {illustration:"illust",modeling:"3d",video:"animation"};
  const knownGroup = value => {
    const key = Object.hasOwn(GROUP_ALIASES,value) ? GROUP_ALIASES[value] : value;
    return GROUP_MAP.has(key) ? key : "";
  };
  const NUMBER = new Intl.NumberFormat("ko-KR");
  const YT_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be", "www.youtube-nocookie.com"]);
  const txt = v => String(v ?? "").trim();
  const number = n => NUMBER.format(n);
  const safeAbsolute = value => {
    try {
      const u = new URL(value);
      return u.protocol === "https:" && !u.username && !u.password ? u : null;
    } catch { return null; }
  };
  const internalPath = value => {
    const source = txt(value).replace(/^\.\//, "").replace(/^\/+/, "");
    if (!source || source.includes("\\") || /^[a-z][\w+.-]*:/i.test(source)) return "";
    const segments = source.split("/").map(piece => {
      try { return decodeURIComponent(piece); } catch { return piece; }
    });
    if (segments.some(piece => !piece || piece === "." || piece === ".." || /[\/\\\u0000-\u001f]/.test(piece))) return "";
    return segments.join("/");
  };
  const relativeURL = (base, path) => new URL(path.split("/").map(encodeURIComponent).join("/"), base).href;
  function parseYouTube(source, explicit) {
    if (/^[\w-]{11}$/.test(explicit || "")) return explicit;
    const u = safeAbsolute(source);
    if (!u || !YT_HOSTS.has(u.hostname)) return "";
    const segments = u.pathname.split("/").filter(Boolean);
    const id = u.hostname === "youtu.be" ? segments[0] : (u.searchParams.get("v") || (/^(shorts|embed|live)$/.test(segments[0]) ? segments[1] : ""));
    return /^[\w-]{11}$/.test(id || "") ? id : "";
  }
  function mediaType(src, explicit, youtubeId) {
    if (youtubeId) return "youtube";
    const ext = (safeAbsolute(src)?.pathname || src).toLowerCase();
    if (/\.gif$/.test(ext)) return "gif";
    if (/\.(?:mp4|webm|m4v|mov|ogv)$/.test(ext) || explicit === "video") return "video";
    if (explicit === "link" || (safeAbsolute(src) && !/\.(?:png|jpe?g|webp|avif|bmp|svg)$/.test(ext))) return "link";
    return "image";
  }
  function normalizeArchive(portfolio, showTitleByDefault = true) {
    return Object.entries(portfolio || {}).flatMap(([key, rows]) => {
      if (!Array.isArray(rows)) return [];
      const sample = rows.find(row=>row && internalPath(row.src||row.url));
      const folder = internalPath(sample?.src || sample?.url).split("/")[0];
      const category = SUBS.get(key) || {group:GROUPS.find(g=>PUBLIC_FOLDERS.get(g.id)===folder)?.id || "branding", label:key};
      return rows.flatMap((row, i) => {
        const src = txt(row?.src || row?.url);
        if (!src || (!safeAbsolute(src) && !internalPath(src))) return [];
        const youtubeId = parseYouTube(src, row.youtubeId);
        return [{
          id:key + ":" + i, sub:key, group:category.group, label:category.label, order:i + 1,
          src, thumb:txt(row.thumbnailPath || row.thumbnailSrc), kind:mediaType(src,row.type,youtubeId), youtubeId,
          opId:typeof row.opId==="string" ? row.opId : "",
          sharedMedia:row.sharedMedia===true, sharedRef:/^[a-f0-9]{40}$/i.test(row.sharedRef||"") ? row.sharedRef : "",
          sourcePath:internalPath(row.sourcePath||src),
          renamedFrom:internalPath(row.renamedFrom),
          title:txt(row.title), desc:txt(row.desc), showTitle:typeof row.showTitle==="boolean" ? row.showTitle : showTitleByDefault,
        }];
      });
    });
  }
  function featureWorkIndex(items){
    const byPath=new Map();
    for(const item of items)if(item.renamedFrom)byPath.set(item.renamedFrom,item);
    for(const item of items)if(item.sourcePath)byPath.set(item.sourcePath,item);
    return byPath;
  }
  function queryText(value) {
    return txt(value).normalize("NFKC").toLocaleLowerCase("ko-KR").replace(/[_·]+/g," ");
  }
  function filterArchive(items, group, sub, query) {
    const words = queryText(query).split(/\s+/).filter(Boolean);
    return items.filter(item => {
      if ((group && group !== "all" && item.group !== group) || (sub && item.sub !== sub)) return false;
      if (!words.length) return true;
      const indexed = queryText([item.title,item.desc,item.label,GROUP_MAP.get(item.group)?.name,GROUP_MAP.get(item.group)?.english].join(" "));
      return words.every(word => indexed.includes(word));
    });
  }
  function parseRoute(raw) {
    const [route, a, b] = txt(raw).replace(/^#/,"").split("/");
    if (["works","portfolio"].includes(route)) {
      const group = knownGroup(a) || DEFAULT_GROUP;
      const sub = b && (SUBS.get(b)?.group === group || (!SUBS.has(b) && /^[a-zA-Z0-9_-]+$/.test(b))) ? b : "";
      return {view:"works", group, sub, anchor:"portfolio"};
    }
    if (["commissions","pricing","policy","process","contact","commission","notice"].includes(route)) {
      const legacy = {commission:"commissions",notice:"policy"};
      return {view:"commissions", group:knownGroup(a), anchor:Object.hasOwn(legacy,route)?legacy[route]:route};
    }
    return {view:"home", anchor:["selected","about","services"].includes(route) ? route : route === "work" ? "selected" : "home"};
  }
  const wrapIndex = (index, delta, length) => length > 0 ? ((index + delta) % length + length) % length : 0;
  function briefText({name, reply, group, usage, deadline, desc, notes, estimate}) {
    return [
      "[BOWONE 커미션 신청 양식]",
      "이름 / 활동명: " + (txt(name) || "(입력)"),
      "회신 이메일: " + (txt(reply) || "(입력)"),
      "제작 분야: " + (GROUP_MAP.get(group)?.name || "(입력)"),
      "사용 용도: " + (txt(usage) || "(입력)"),
      "희망 마감일: " + (txt(deadline) || "(입력)"),
      "작업 내용 및 참고자료: " + (txt(desc) || "(입력)"),
      "기타 요청사항: " + (txt(notes) || "(없음)"),
      ...(estimate ? ["", "선택한 견적 (확정 금액 아님)",estimate] : []),
    ].join("\n");
  }
  function priceHash(group) { return "#pricing" + (GROUP_MAP.has(group) ? "/" + group : ""); }

  function makeArrivalMotion(reduced, Observer) {
    const shown=new WeakSet(), running=new Map();
    const easing="cubic-bezier(.22,.73,.19,1)";
    function animate(el,frames,duration,delay=0){
      if(reduced.matches || typeof el?.animate!=="function")return;
      running.get(el)?.cancel();
      const a=el.animate(frames,{duration,delay,easing,fill:"backwards"});
      running.set(el,a);
      const done=()=>{if(running.get(el)===a)running.delete(el);};
      a.addEventListener("finish",done,{once:true});
      a.addEventListener("cancel",done,{once:true});
    }
    function rise(el, delay=0, distance=26, duration=660){
      animate(el,[{opacity:.16,transform:"translateY("+distance+"px)"},{opacity:1,transform:"none"}],duration,delay);
    }
    const observer=typeof Observer==="function" ? new Observer(entries=>{
      for(const {target,isIntersecting,intersectionRatio} of entries){
        if(!isIntersecting || intersectionRatio<.1 || shown.has(target))continue;
        observer.unobserve(target);
        if(reduced.matches)continue;
        shown.add(target);
        const delay=Math.min(160,Number(target.dataset?.arrivalDelay)||0);
        rise(target,delay);
      }
    },{threshold:.12,rootMargin:"-24px 0px -32px 0px"}) : null;
    return {
      observe(elements){if(!reduced.matches && observer)for(const el of elements)if(!shown.has(el))observer.observe(el);},
      forget(elements){for(const el of elements){observer?.unobserve(el);running.get(el)?.cancel();}},
      rise,
      fade(el){animate(el,[{opacity:.42},{opacity:1}],520);},
      stop(){for(const a of running.values())a.cancel();running.clear();},
    };
  }

  function mount(quoteApi, createImageViewport) {
  const $ = id => document.getElementById(id);
  const main=$("main");
  if(!main || main.dataset.bowoneMounted==="true")return;
  main.dataset.bowoneMounted="true";
  const make = (tag, className, value) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (value !== undefined) el.textContent = value;
    return el;
  };
  const DATA = JSON.parse($("site-data").textContent);
  const sources = DATA.assetSources;
  let raw = JSON.parse($("portfolio-data").textContent);
  let editView = null;
  const contactAddress = profile => /^[^\s@?]+@[^\s@?]+\.[^\s@?]+$/.test(profile?.email||"") ? profile.email : "agentdh@naver.com";
  let email = contactAddress(raw.profile);
  let archive = normalizeArchive(raw.portfolio,DATA.showTitleByDefault!==false);
  window.portfolioData = raw.portfolio || {};
  const asset = id => /^[a-zA-Z0-9_/-]+$/.test(id||"") ? DATA.assets[id] || "" : "";
  function setTheme(theme, persist=false) {
    const light = theme === "light";
    document.documentElement.dataset.theme = light ? "light" : "dark";
    document.querySelector('meta[name="theme-color"]').content = light ? "#f5f5f2" : "#0e0e0e";
    $("theme-toggle").setAttribute("aria-pressed",String(!light));
    $("theme-toggle").title = light ? "다크 테마로 전환" : "밝은 테마로 전환";
    $("theme-label").textContent = light ? "밝음" : "다크";
    if (persist) { try { localStorage.setItem("bowone-portfolio-theme",light?"light":"dark"); } catch (_) {} }
  }
  setTheme(document.documentElement.dataset.theme);
  $("theme-toggle").addEventListener("click",()=>{
    setTheme(document.documentElement.dataset.theme==="light"?"dark":"light",true);
  });
  const dedup = values => [...new Set(values.filter(Boolean))];
  function mediaURLs(path,item) {
    const absolute = safeAbsolute(path);
    if (absolute) return [absolute.href];
    const local = internalPath(path);
    if(!local) return [];
    if(item?.sharedMedia && sources.sharedBase) {
      const base=item.sharedRef ? sources.sharedBase.replace(/\/main\/$/,"/"+item.sharedRef+"/") : sources.sharedBase;
      return dedup([relativeURL(base,local),relativeURL(sources.sharedBase,local),relativeURL(sources.base,local)]);
    }
    const online = location.protocol === "http:" || location.protocol === "https:";
    const own = online && (DATA.useLocalOriginals ?? !location.hostname.match(/^(localhost|127\.0\.0\.1|\[::1\])$/));
    return [
      ...(own ? [relativeURL(new URL("./",location.href),local)] : []),
      ...[sources.base,sources.fallbackBase,sources.sharedBase].filter(Boolean).map(base=>relativeURL(base,local)),
    ];
  }
  function imageWithFallback(img, paths, {done=()=>{}, fail=()=>{}} = {}) {
    let pos = 0;
    const cleanup=()=>{
      img.removeEventListener("error",next);
      img.removeEventListener("load",loaded);
    };
    function next() {
      if (pos < paths.length) { img.src = paths[pos++]; return; }
      cleanup();
      img.remove();
      fail();
    }
    function loaded() {
      cleanup();
      done();
    }
    img.addEventListener("error",next);
    img.addEventListener("load",loaded);
    next();
    return ()=>{cleanup();img.removeAttribute("src");};
  }
  let refreshedCatalog=false;

  function featuredCollections(){
    const byPath = featureWorkIndex(archive);
    return new Map(FEATURES.map(feature => [feature.id, feature.works.map(([title,path,preview,desc],i)=>({
      ...(byPath.get(path) || {src:path, label:feature.kind, group:feature.group, order:i+1,kind:"image"}),
      id:feature.id+":"+i, title, desc, showTitle:true, preview,
    }))]));
  }
  let featureCollections = featuredCollections();
  const state = {route:null, group:DEFAULT_GROUP, sub:"", query:"", price:DEFAULT_GROUP, hero:0, estimate:null, style:DEFAULT_STYLE, panels:new Map()};
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const arrivals=makeArrivalMotion(reducedMotion,window.IntersectionObserver);
  const observeArrival=root=>arrivals.observe(root.querySelectorAll("[data-arrival]"));
  const forgetArrival=root=>arrivals.forget(root.querySelectorAll("[data-arrival]"));
  const motionObserver = "IntersectionObserver" in window ? new IntersectionObserver(entries=>{
    for(const {target, isIntersecting} of entries){
      const clip=target.querySelector(".work-motion");
      if(!clip)continue;
      if(isIntersecting && !reducedMotion.matches && !document.hidden && !dialog.open){
        if(!clip.hasAttribute("src") && !clip.dataset.failed) clip.src=clip.dataset.motionSrc;
      }else if(clip.hasAttribute("src")){
        clip.classList.remove("is-ready");
        clip.removeAttribute("src");
      }
    }
  },{threshold:.22}) : null;
  function syncWorkMotion(){
    if(!motionObserver)return;
    motionObserver.disconnect();
    for(const img of document.querySelectorAll("#work-sections .work-motion")){
      if(reducedMotion.matches||document.hidden||dialog.open){
        img.classList.remove("is-ready");
        img.removeAttribute("src");
      }else if(!img.closest("details:not([open])") && !img.closest("[hidden]")) motionObserver.observe(img.parentElement);
      else if(img.hasAttribute("src")){
        img.classList.remove("is-ready");
        img.removeAttribute("src");
      }
    }
  }

  function linkToGroup(group, sub) {
    return "#portfolio" + (group ? "/" + group + (sub ? "/" + sub : "") : "");
  }
  function applyProfile(p) {
    if(txt(p.name)) {
      const word=$("hero-title-word");
      if(word) word.textContent=p.name;
      else $("hero-title").firstChild.nodeValue=p.name;
      $("profile-name").textContent = p.name;
    }
    if(txt(p.role)) $("profile-role").textContent = p.role;
    if(txt(p.bio)) $("profile-bio").textContent = p.bio;
    if(txt(p.commissionLinkTitle)) $("contact-discord-label").textContent = p.commissionLinkTitle;
    const discord = safeAbsolute(p.commissionLinkUrl);
    if(discord) $("contact-discord").href = discord.href;
    $("contact-email").href = "mailto:" + email;
    $("contact-email-label").textContent = email;
    $("footer-email").href = "mailto:" + email;
    let avatar = $("avatarImg");
    if(!avatar){
      avatar=make("img"); avatar.id="avatarImg"; avatar.alt="보원 프로필 이미지"; avatar.loading="lazy"; avatar.decoding="async";
      $("profile-avatar").append(avatar);
    }
    const path = internalPath(p.profileImgUrl || p.profileImgPath);
    if(path || safeAbsolute(p.profileImgUrl)){
      const options=dedup([asset(DATA.profilePreview[path]),...mediaURLs(p.profileImgUrl || p.profileImgPath)]);
      const crop=p.profileCrop;
      if(crop && [crop.x,crop.y,crop.w,crop.h].every(Number.isFinite) && crop.w>0 && crop.h>0){
        Object.assign(avatar.style,{width:100/crop.w+"%",height:100/crop.h+"%",left:-100*crop.x/crop.w+"%",top:-100*crop.y/crop.h+"%",objectFit:"fill"});
      }else avatar.removeAttribute("style");
      avatar.hidden=false;
      imageWithFallback(avatar,options,{fail:()=>$("profile-avatar").classList.add("avatar-unavailable")});
    }else avatar.hidden=true;
  }
  function renderServices() {
    $("home-work-count").textContent = number(archive.length);
    for (const [i,group] of GROUPS.entries()) {
      const link = make("a");
      link.href = linkToGroup(group.id);
      link.append(make("small","",String(i+1).padStart(2,"0")),make("strong","",group.name),make("span","service-en",group.english),make("span","service-arrow", "↗"));
      link.querySelector("strong").dataset.editKey="service:"+group.id;
      link.lastChild.setAttribute("aria-hidden","true");
      $("discipline-grid").append(link);
      $("brief-group").add(new Option(group.name,group.id));
    }
  }

  let heroRequest=0;
  function renderHero() {
    const item = FEATURES[state.hero], cover = $("hero-cover"), img = $("hero-image"), n = String(state.hero + 1).padStart(2,"0");
    const ticket=++heroRequest, source=asset(item.hero);
    const nextImage=new Image();
    const swap=()=>{
      if(ticket!==heroRequest)return;
      cover.dataset.feature = item.id;
      cover.setAttribute("aria-label",item.title + " 작품 상세 보기");
      img.src = source;
      img.alt = item.alt;
      img.style.objectPosition = item.pos;
      $("hero-image-index").textContent = n + " / FEATURED";
      $("hero-count").textContent = n + " / " + String(FEATURES.length).padStart(2,"0");
      $("hero-kind").textContent = item.kind;
      $("hero-name").textContent = item.title;
      arrivals.fade(img);
      arrivals.rise($("hero-caption"),0,8,350);
    };
    nextImage.addEventListener("load",swap,{once:true});
    nextImage.addEventListener("error",()=>{if(ticket===heroRequest) state.hero=FEATURES.findIndex(entry=>entry.id===cover.dataset.feature);},{once:true});
    nextImage.src=source;
  }
  const stepHero = delta => { state.hero = wrapIndex(state.hero,delta,FEATURES.length); renderHero(); };
  $("hero-prev").addEventListener("click",()=>stepHero(-1));
  $("hero-next").addEventListener("click",()=>stepHero(1));

  function renderGroupControls() {
    const row = $("work-groups");
    row.replaceChildren();
    for (const [i,group] of GROUPS.entries()) {
      const button = make("button");
      button.type = "button";
      button.dataset.group = group.id;
      const ord=make("span","archive-group-index",String(i+1).padStart(2,"0"));
      ord.setAttribute("aria-hidden","true");
      const tally = make("span","mono",number(archive.filter(item=>item.group===group.id).length));
      tally.setAttribute("aria-hidden","true");
      const name=make("span","archive-group-name",group.name);
      name.dataset.editKey="archive-group:"+group.id;
      button.append(ord,name,tally);
      button.addEventListener("click",()=>{
        if (state.group !== group.id || state.sub) location.hash = linkToGroup(group.id);
      });
      row.append(button);
    }
  }
  function updateSubfilters() {
    const select = $("work-sub");
    const sections = sectionsFor(state.group);
    select.replaceChildren(new Option("전체 세부 분야",""),...sections.map(([id,label])=>new Option(label,id)));
    select.disabled = sections.length<2;
    if(state.sub && !sections.some(([id])=>id===state.sub)) state.sub="";
    select.value = state.sub;
    for (const btn of $("work-groups").children) btn.setAttribute("aria-pressed",String(btn.dataset.group===state.group));
    $("works-to-pricing").href = priceHash(state.group);
    $("archive-current").textContent=GROUP_MAP.get(state.group).name;
  }
  function sectionsFor(group){
    const initial=GROUP_MAP.get(group).sections;
    const extras = [...new Map(archive.filter(item=>item.group===group&&!SUBS.has(item.sub)).map(item=>[item.sub,item.label]))];
    return [...initial,...extras];
  }
  function displayName(item) {
    return item.showTitle !== false && item.title ? item.title : item.label + " 작업 " + String(item.order).padStart(2,"0");
  }
  const kindLabel = kind => ({youtube:"YOUTUBE",video:"VIDEO",gif:"GIF",link:"LINK",image:"IMAGE"}[kind]);
  function createWorkCard(item, index, collection) {
    const card = make("article","work-card"), button = make("button","work-media");
    if(index<9 && !state.query){
      card.dataset.arrival="";
      card.dataset.arrivalDelay=String((index%3)*56);
    }
    button.type = "button";
    button.setAttribute("aria-label",(editView && item.opId && item.sourcePath ? item.sourcePath.split("/").at(-1) : displayName(item)) + " 상세 보기");
    const poster = make("span","media-placeholder");
    poster.setAttribute("aria-hidden","true");
    poster.append(make("b","",({video:"▶",youtube:"▶",gif:"▷",link:"↗"}[item.kind] || "◫")),make("span","",item.kind==="gif"?"상세에서 움직이는 작업 보기":kindLabel(item.kind)+" / "+item.label));
    button.append(poster);
    const localPoster=asset(DATA.localPreviews[item.src] || DATA.localPreviews[item.sourcePath]);
    const safeThumb=item.thumb && (internalPath(item.thumb)||item.thumb)!==(internalPath(item.src)||item.src);
    const remotePosters=safeThumb?mediaURLs(item.thumb,item):[];
    const preferPublished=!item.sharedMedia && (refreshedCatalog || DATA.useLocalOriginals===true);
    const options = dedup([
      ...(preferPublished && safeThumb ? [...remotePosters.slice(0,1),localPoster,...remotePosters.slice(1)] : [localPoster,...remotePosters]),
      ...(item.youtubeId ? ["https://i.ytimg.com/vi/" + item.youtubeId + "/hqdefault.jpg"] : []),
      ...((item.kind==="image" || item.kind==="gif") ? mediaURLs(item.src,item).slice(0,3) : []),
    ]);
    if (options.length) {
      const img = make("img");
      img.loading = "lazy"; img.decoding = "async"; img.alt = "";
      button.append(img);
      imageWithFallback(img,options,{done:()=>{
        img.classList.add("is-ready");
        poster.hidden=true;
      }});
    }
    const motion=item.kind==="gif" && asset(DATA.localMotion?.[item.sourcePath]);
    if(motion && motionObserver){
      const clip=make("img","work-motion");
      clip.alt=""; clip.decoding="async"; clip.draggable=false;
      clip.dataset.motionSrc=motion;
      clip.addEventListener("load",()=>{if(clip.hasAttribute("src"))clip.classList.add("is-ready");});
      clip.addEventListener("error",()=>{
        if(!clip.hasAttribute("src"))return;
        clip.dataset.failed="true"; clip.classList.remove("is-ready");
      });
      button.append(clip);
    }
    if (item.kind!=="image") button.append(make("span","media-badge",kindLabel(item.kind)));
    const icon = make("span","image-open","↗");
    icon.setAttribute("aria-hidden","true");
    button.append(icon);
    button.addEventListener("click",()=>openViewer(collection,index,button));
    const info = make("div","work-info");
    const detail = make("div","work-info-line");
    detail.append(make("small","",item.label),make("span","mono",String(item.order).padStart(2,"0")));
    info.append(detail);
    if (item.showTitle !== false || (editView && item.opId && item.sourcePath)){
      const title=make("h3","",displayName(item));
      editView?.title(title,item);
      info.append(title);
    }
    if(item.desc) info.append(make("p","",item.desc));
    card.append(button,info);
    if(editView && item.opId) editView.card(card,item);
    return card;
  }
  function measureGrid(grid) {
    if(!grid.isConnected || grid.children.length<=9 || !grid.clientWidth) return;
    const columns=getComputedStyle(grid).gridTemplateColumns.split(" ").length;
    const last=grid.children[Math.min(grid.children.length,columns*3)-1];
    // Use layout coordinates so arrival transforms don't change the scroll window.
    const bottom=last.offsetTop+last.offsetHeight+2;
    grid.style.setProperty("--window-height",Math.ceil(bottom)+"px");
  }
  function sectionGrid(id,label,items) {
    if(!items.length) {
      const empty=make("p","section-empty","아직 등록된 작품이 없습니다.");
      if(editView) empty.dataset.opGrid=id;
      return empty;
    }
    const grid=make("div","work-grid");
    grid.id=id;
    if(editView) grid.dataset.opGrid=id;
    if(items.length>9){
      grid.classList.add("scroll-gallery");
      grid.tabIndex=0;
      grid.setAttribute("role","region");
      grid.setAttribute("aria-label",label+" 작품 목록, 내부 스크롤");
    }
    const cards=document.createDocumentFragment();
    items.forEach((item,i)=>cards.append(createWorkCard(item,i,items)));
    grid.append(cards);
    return grid;
  }
  function collapseSection(key,title,count,defaultOpen,content,selected){
    const details=make("details","archive-section");
    details.dataset.section=key;
    const summary=make("summary","archive-summary");
    if(editView) summary.dataset.opGrid=key==="style" ? (STYLE_SECTIONS.includes(state.sub) ? state.sub : state.style) : key;
    if(!state.query)summary.dataset.arrival="";
    const heading=make("h3","",title);
    if(key!=="style")heading.dataset.editKey="archive-section:"+key;
    summary.append(heading,make("span","mono",number(count)+" WORKS"),make("span","disclosure-mark"));
    const body=make("div","archive-section-body");
    let loaded=false;
    const reveal=()=>{
      if(!loaded && details.open){ body.append(content()); loaded=true; }
      if(details.open) requestAnimationFrame(()=>body.querySelectorAll(".scroll-gallery").forEach(measureGrid));
    };
    details.open=selected|| (state.panels.get(key) ?? defaultOpen);
    details.addEventListener("toggle",()=>{
      if(!details.isConnected) return;
      state.panels.set(key,details.open);
      reveal();
      syncWorkMotion();
      if(details.open)observeArrival(body);
    });
    details.append(summary,body);
    if(details.open){body.append(content());loaded=true;}
    return details;
  }
  function makeStyleSection(items){
    const source = state.sub && STYLE_SECTIONS.includes(state.sub) ? state.sub : state.style;
    const label = id => SUBS.get(id).label;
    const counts = id => items.filter(x=>x.sub===id).length;
    const active = state.query && !counts(source) ? STYLE_SECTIONS.find(id=>counts(id)) || source : source;
    let title;
    const total=STYLE_SECTIONS.reduce((n,id)=>n+counts(id),0);
    const details=collapseSection("style","스타일 / "+label(active),total,total>0,()=>{
      const region=make("div","style-body"), controls=make("div","style-controls"), panel=make("div","style-grid-host");
      controls.setAttribute("aria-label","일러스트 스타일");
      const choose=id=>{
        title ||= details.querySelector("summary h3");
        title.textContent="스타일 / "+label(id);
        if(editView) title.parentElement.dataset.opGrid=id;
        controls.querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.style===id)));
        const subset=items.filter(x=>x.sub===id);
        forgetArrival(panel);
        panel.replaceChildren(sectionGrid(id,label(id),subset));
        syncWorkMotion();
        observeArrival(panel);
        requestAnimationFrame(()=>panel.querySelectorAll(".scroll-gallery").forEach(measureGrid));
      };
      for(const id of STYLE_SECTIONS){
        const b=make("button","button button-outline",label(id));
        b.type="button"; b.dataset.style=id;
        b.setAttribute("aria-pressed",String(id===active));
        b.addEventListener("click",()=>{
          state.style=id;
          if(state.sub) location.hash=linkToGroup("illust",id);
          else choose(id);
        });
        controls.append(b);
      }
      region.append(controls,panel);
      panel.append(sectionGrid(active,label(active),items.filter(x=>x.sub===active)));
      return region;
    },STYLE_SECTIONS.includes(state.sub));
    return details;
  }
  function renderArchive(){
    const items=filterArchive(archive,state.group,state.sub,state.query);
    const root=$("work-sections"), group=GROUP_MAP.get(state.group), display=sectionsFor(state.group).filter(([id])=>!state.sub||id===state.sub);
    forgetArrival(root);
    root.replaceChildren();
    let stylesDone=false;
    for(const [id,label] of display){
      if(state.group==="illust"&&STYLE_SECTIONS.includes(id)){
        if(!stylesDone){root.append(makeStyleSection(items));stylesDone=true;}
        continue;
      }
      const collection=items.filter(item=>item.sub===id);
      if(state.query && !collection.length)continue;
      root.append(collapseSection(id,label,collection.length,collection.length>0,()=>sectionGrid(id,label,collection),state.sub===id));
    }
    $("work-results").textContent=group.name+" · 작품 "+number(items.length)+"개";
    $("work-empty").hidden=!!items.length || !state.query;
    $("filter-reset").disabled=!state.sub&&!state.query;
    syncWorkMotion();
    observeArrival(root);
    requestAnimationFrame(()=>root.querySelectorAll(".scroll-gallery").forEach(measureGrid));
  }
  $("work-sub").addEventListener("change",()=>{
    const sub=$("work-sub").value;
    const next=linkToGroup(state.group,sub);
    if(next===location.hash){state.sub=sub;renderArchive();}
    else location.hash=next;
  });
  $("work-query").addEventListener("input",()=>{ state.query=$("work-query").value; renderArchive(); });
  function resetFilters() {
    state.query=""; $("work-query").value="";
    if(state.sub) location.hash=linkToGroup(state.group);
    else renderArchive();
  }
  $("filter-reset").addEventListener("click",resetFilters);
  $("empty-reset").addEventListener("click",()=>{ resetFilters(); $("work-query").focus(); });
  window.addEventListener("resize",()=>document.querySelectorAll("#work-sections .scroll-gallery").forEach(measureGrid));

  const finePointer = matchMedia("(pointer:fine)");
  let centeredPanel=null, centeredAt=0;
  $("work-sections").addEventListener("wheel",e=>{
    if(!finePointer.matches || e.ctrlKey || e.metaKey || e.shiftKey || reducedMotion.matches || !e.deltaY) return;
    const panel=e.target.closest(".scroll-gallery");
    if(!panel || panel.scrollHeight<=panel.clientHeight+1) return;
    const canScroll=e.deltaY>0?panel.scrollTop+panel.clientHeight<panel.scrollHeight-1:panel.scrollTop>1;
    if(!canScroll) return;
    const now=performance.now(), r=panel.getBoundingClientRect(), header=$("top").getBoundingClientRect().bottom;
    const usable=(header+window.innerHeight)/2, center=r.top+r.height/2;
    if((panel!==centeredPanel||now-centeredAt>700) && Math.abs(center-usable)>78 && (r.top<header+8||r.bottom>window.innerHeight-8)){
      centeredPanel=panel; centeredAt=now;
      window.scrollTo({top:Math.max(0,window.scrollY+center-usable),behavior:"smooth"});
    }
  },{passive:true});

  function selectPrice(id, focus=false) {
    const candidate = $("price-tab-"+id);
    if (!candidate) return;
    state.price = id;
    for (const tab of $("price-tabs").children) {
      const on = tab === candidate;
      tab.setAttribute("aria-selected",String(on));
      tab.tabIndex = on ? 0 : -1;
      $(tab.getAttribute("aria-controls")).hidden = !on;
    }
    if (focus) candidate.focus();
  }
  function renderPricing() {
    const schema=DATA.prices;
    schema.categories.forEach((price,i)=>{
      const tab = make("button","",price.label);
      tab.type="button"; tab.id="price-tab-"+price.id;
      tab.dataset.editKey="price-tab:"+price.id;
      tab.setAttribute("role","tab"); tab.setAttribute("aria-controls","price-panel-"+price.id);
      tab.addEventListener("click",()=>selectPrice(price.id));
      tab.addEventListener("keydown",e=>{
        if (!["ArrowLeft","ArrowRight","Home","End"].includes(e.key)) return;
        e.preventDefault();
        const n=e.key==="Home"?0:e.key==="End"?schema.categories.length-1:wrapIndex(i,e.key==="ArrowRight"?1:-1,schema.categories.length);
        selectPrice(schema.categories[n].id,true);
      });
      $("price-tabs").append(tab);
      const panel=make("section","price-panel");
      panel.id="price-panel-"+price.id;
      panel.setAttribute("role","tabpanel"); panel.setAttribute("aria-labelledby",tab.id);
      panel.tabIndex=0;
      const content=make("div","price-main"), head=make("div","price-panel-head");
      head.append(make("p","index-label",price.english.toUpperCase()),make("h3","",price.title));
      head.querySelector("h3").dataset.editKey="price-title:"+price.id;
      content.append(head);
      if(price.notes?.length){
        const notes=make("details","price-rule"), summary=make("summary","","계산 기준 및 추가 조건");
        summary.append(make("span","disclosure-mark")); notes.append(summary);
        for(const note of price.notes) notes.append(make("p","price-notes",note));
        content.append(notes);
      }
      const groups=make("div","price-groups");
      for(const group of price.groups){
        const column=make("div","price-group"), dl=make("dl");
        for(const [label,cost,note] of group.rows){
          const row=make("div"), name=make("dt","",label);
          if(note) name.append(make("small","",note));
          row.append(name,make("dd","",cost));
          dl.append(row);
        }
        column.append(make("h4","",group.title),dl);
        groups.append(column);
      }
      content.append(groups);
      quoteApi.mount(schema,price,panel,{onInquire(group,estimate,usage){
        state.estimate=estimate?{group, text:estimate}:null;
        $("brief-group").value=group;
        if(usage)$("brief-usage").value=usage;
        updateBrief();
      }});
      panel.append(content);
      $("price-panels").append(panel);
    });
    selectPrice(DEFAULT_GROUP);
  }

  const dialog = $("viewer"), stage = $("viewer-stage");
  const viewer = {items:[], index:0, opener:null, image:null, abortOriginal:null};
  const imageViewport = createImageViewport(stage,()=>viewer.image,percent=>{$("zoom-reset").textContent=percent;});
  function stopViewerMedia() {
    viewer.abortOriginal?.();
    viewer.abortOriginal=null;
    const video=stage.querySelector("video");
    if(video){
      video.pause();
      video.replaceChildren();
      video.removeAttribute("src");
      video.load();
    }
  }
  function openViewer(items,index,opener) {
    if (!items[index]) return;
    viewer.items=items.slice();
    viewer.index=index;
    viewer.opener=opener;
    renderViewer();
    dialog.showModal();
    arrivals.fade(dialog.querySelector(".viewer-shell"));
    document.body.classList.add("viewer-open");
    syncWorkMotion();
  }
  function createExternalLink(url,label) {
    const a=make("a","",label); a.href=url; a.target="_blank"; a.rel="noopener noreferrer"; return a;
  }
  function viewerFallback(label,url) {
    const empty=make("div","viewer-fallback");
    empty.append(make("p","",label));
    if(url) empty.append(createExternalLink(url,"작품 주소에서 열기 ↗"));
    stage.replaceChildren(empty);
  }
  function renderViewerTitle(item) {
    const title=$("viewer-title");
    title.textContent=displayName(item);
    editView?.title(title,item);
    if(viewer.image)viewer.image.alt=displayName(item);
  }
  function renderViewer() {
    const item=viewer.items[viewer.index];
    if(!item) return;
    stopViewerMedia();
    stage.replaceChildren();
    stage.classList.remove("image-mode");
    imageViewport.reset();
    viewer.image=null;
    const zoomable=item.kind==="image" || item.kind==="gif";
    $("zoom-controls").hidden=!zoomable;
    const order=String(viewer.index+1).padStart(2,"0"), total=String(viewer.items.length).padStart(2,"0");
    $("viewer-index").textContent=GROUP_MAP.get(item.group).english+" / "+kindLabel(item.kind);
    $("viewer-count").textContent=order+" / "+total;
    renderViewerTitle(item);
    $("viewer-desc").textContent=item.desc;
    $("viewer-desc").hidden=!item.desc;
    $("viewer-pricing").href=priceHash(item.group);
    for (const id of ["viewer-prev","viewer-next"]) $(id).disabled=viewer.items.length<2;
    const urls=mediaURLs(item.src,item);
    if(item.kind==="youtube"){
      const box=make("div","viewer-fallback");
      const play=make("button","button button-white","동영상 재생 ▶");
      play.type="button";
      play.addEventListener("click",()=>{
        const frame=make("iframe");
        frame.title=item.title||"YouTube 영상";
        frame.allow="autoplay; encrypted-media; picture-in-picture";
        frame.allowFullscreen=true;
        frame.src="https://www.youtube-nocookie.com/embed/"+item.youtubeId+"?autoplay=1";
        stage.replaceChildren(frame);
      });
      box.append(play,make("p","","재생하면 YouTube에 연결됩니다."));
      stage.append(box);
      $("viewer-pricing").before(createMediaLink(urls[0] || "https://www.youtube.com/watch?v="+item.youtubeId,"YouTube에서 보기"));
    } else if(item.kind==="video"){
      const video=make("video");
      video.controls=true; video.playsInline=true; video.preload="metadata";
      const local=asset(DATA.localClips[item.sourcePath]);
      const choices=dedup([...urls,local]);
      if(!choices.length) viewerFallback("영상 주소를 확인할 수 없습니다.");
      else{
        for(const src of choices){ const source=make("source"); source.src=src; video.append(source); }
        let failed=0;
        video.querySelectorAll("source").forEach(source=>source.addEventListener("error",()=>{ if(++failed===choices.length && video.isConnected) viewerFallback("영상을 불러올 수 없습니다.",urls[0]); }));
        stage.append(video);
      }
    } else if(item.kind==="link"){
      viewerFallback("외부 페이지에 있는 작업입니다.",urls[0]);
    } else {
      stage.classList.add("image-mode");
      const img=make("img","viewer-image");
      img.alt=displayName(item); img.draggable=false;
      const waiting=make("span","viewer-loading","작품 이미지 불러오는 중");
      viewer.image=img;
      stage.append(img,waiting);
      const path=item.sourcePath||internalPath(item.src);
      const preview=asset(item.preview || DATA.localFull[path]) || asset(DATA.localPreviews[item.src] || DATA.localPreviews[path]);
      let previewFailed=!preview, originalFailed=!urls.length;
      const stillOpen=()=>stage.contains(img) && viewer.image===img;
      const checkFallback=()=>{
        if(!stillOpen() || !previewFailed || !originalFailed)return;
        viewer.image=null; $("zoom-controls").hidden=true;
        viewerFallback("작품 이미지를 불러올 수 없습니다.",urls[0]);
      };
      if(preview) {
        img.addEventListener("load",()=>{
          if(!stillOpen())return;
          waiting.remove(); imageViewport.draw();
          if(originalFailed) $("viewer-index").textContent+=" / 미리보기";
        },{once:true});
        img.addEventListener("error",()=>{previewFailed=true;checkFallback();},{once:true});
        img.src=preview;
      }
      if(urls.length){
        const original=make("img","viewer-image");
        original.alt=img.alt; original.draggable=false; original.decoding="async";
        viewer.abortOriginal=imageWithFallback(original,urls,{
          done:()=>{
            if(!stillOpen())return;
            viewer.abortOriginal=null;
            img.replaceWith(original); viewer.image=original; waiting.remove(); imageViewport.draw();
          },
          fail:()=>{
            originalFailed=true;
            if(stillOpen()) viewer.abortOriginal=null;
            if(img.complete && img.naturalWidth && stillOpen()) $("viewer-index").textContent+=" / 미리보기";
            checkFallback();
          },
        });
      }
      checkFallback();
    }
    $("viewer-meta").querySelectorAll(".viewer-source").forEach((a,i,arr)=>{if(item.kind!=="youtube" || i<arr.length-1) a.remove();});
    if (zoomable) imageViewport.draw();
  }
  function createMediaLink(url,title) {
    const a=createExternalLink(url || "#",title+" ↗");
    a.className="text-link viewer-source";
    return a;
  }
  function navigateViewer(delta) {
    if(viewer.items.length<2) return;
    viewer.index=wrapIndex(viewer.index,delta,viewer.items.length);
    renderViewer();
    arrivals.fade(stage);
  }
  $("viewer-prev").addEventListener("click",()=>navigateViewer(-1));
  $("viewer-next").addEventListener("click",()=>navigateViewer(1));
  $("viewer-close").addEventListener("click",()=>dialog.close());
  $("viewer-pricing").addEventListener("click",()=>dialog.close());
  dialog.addEventListener("click",e=>{ if(e.target===dialog) dialog.close(); });
  dialog.addEventListener("keydown",e=>{
    if(["ArrowLeft","ArrowRight"].includes(e.key) && !e.target.closest("video,iframe") && viewer.items.length>1){
      e.preventDefault(); navigateViewer(e.key==="ArrowRight"?1:-1);
    }
  });
  dialog.addEventListener("close",()=>{
    document.body.classList.remove("viewer-open");
    imageViewport.reset();
    stopViewerMedia();
    stage.replaceChildren();
    $("viewer-meta").querySelectorAll(".viewer-source").forEach(a=>a.remove());
    if (viewer.opener?.isConnected && viewer.opener.getClientRects().length) viewer.opener.focus({preventScroll:true});
    viewer.items=[]; viewer.image=null;
    syncWorkMotion();
  });
  document.querySelectorAll("[data-feature]").forEach(button=>button.addEventListener("click",()=>{
    const collection=featureCollections.get(button.dataset.feature);
    if (collection?.length) openViewer(collection,0,button);
  }));

  $("zoom-reset").addEventListener("click",imageViewport.reset);
  $("zoom-in").addEventListener("click",()=>imageViewport.zoom(1.25));
  $("zoom-out").addEventListener("click",()=>imageViewport.zoom(1/1.25));
  document.addEventListener("contextmenu",e=>{
    if(editView && e.target.closest(".viewer-image")) return;
    if(!e.target.closest("input,select,textarea")) e.preventDefault();
  });
  document.addEventListener("dragstart",e=>{if(e.target.closest("img")) e.preventDefault();});

  function currentBrief() {
    return briefText({name:$("brief-name").value,reply:$("brief-reply").value,group:$("brief-group").value,usage:$("brief-usage").value,deadline:$("brief-deadline").value,desc:$("brief-desc").value,notes:$("brief-notes").value,
      estimate:$("brief-group").value===state.estimate?.group?state.estimate.text:""});
  }
  function updateBrief() {
    const kind=GROUP_MAP.get($("brief-group").value)?.name || "기타";
    $("brief-email").href="mailto:"+email+"?subject="+encodeURIComponent("[BOWONE 작업 문의] "+kind+" - "+txt($("brief-name").value))+"&body="+encodeURIComponent(currentBrief());
    $("brief-quote").hidden=$("brief-group").value!==state.estimate?.group;
    $("brief-quote-text").textContent=$("brief-quote").hidden?"":state.estimate.text;
    if(!$("copy-fallback").hidden) $("copy-text").value=currentBrief();
  }
  $("email-copy").addEventListener("click",async()=>{
    const status=$("email-copy-status");
    try {
      await navigator.clipboard.writeText(email);
      status.textContent="이메일 주소를 복사했습니다.";
    } catch {
      status.textContent="자동 복사가 제한되었습니다. 표시된 이메일 주소를 직접 복사해 주세요.";
    }
  });
  $("brief-form").addEventListener("input",updateBrief);
  $("brief-usage").addEventListener("change",()=>{ state.estimate=null; updateBrief(); });
  $("brief-remove-quote").addEventListener("click",()=>{ state.estimate=null; updateBrief(); $("brief-group").focus(); });
  $("brief-form").addEventListener("submit",e=>e.preventDefault());
  $("brief-email").addEventListener("click",e=>{
    if(!$("brief-form").reportValidity() || !txt($("brief-name").value) || txt($("brief-desc").value).length<10){
      e.preventDefault();
      $("brief-status").textContent="이름과 회신 이메일, 10자 이상의 작업 내용을 입력해 주세요.";
      return;
    }
    $("brief-status").textContent="메일 초안을 엽니다. 발송은 메일 앱에서 직접 확인해 주세요.";
  });
  $("brief-copy").addEventListener("click",async()=>{
    const text=currentBrief();
    try {
      if(!navigator.clipboard?.writeText) throw new Error("Clipboard not available");
      await navigator.clipboard.writeText(text);
      $("copy-fallback").hidden=true;
      $("brief-status").textContent="복사했습니다. Discord 또는 메일에 붙여넣으세요.";
    } catch {
      $("copy-text").value=text;
      $("copy-fallback").hidden=false;
      $("copy-text").focus();
      $("copy-text").select();
      $("brief-status").textContent="자동 복사가 제한되었습니다. 아래 내용을 직접 복사하세요.";
    }
  });

  function applyRoute({initial=false, force=false}={}) {
    const next=parseRoute(location.hash), previous=state.route;
    if(!force && previous?.hash===location.hash) return;
    state.route={...next,hash:location.hash};
    if(dialog.open) dialog.close();
    document.body.dataset.view=next.view;
    for(const page of document.querySelectorAll("[data-page]")) page.hidden=page.dataset.page!==next.view;
    for(const link of document.querySelectorAll("[data-nav]")) {
      const active=link.dataset.nav===next.view;
      if(active) link.setAttribute("aria-current","page");
      else link.removeAttribute("aria-current");
    }
    if(next.view==="works"){
      const same=previous?.view==="works" && state.group===next.group && state.sub===next.sub;
      state.group=next.group; state.sub=next.sub;
      if(!same || force || initial) {
        if(STYLE_SECTIONS.includes(state.sub)) state.style=state.sub;
        updateSubfilters(); renderArchive();
      }
    }
    if(next.view==="commissions"){
      if(next.group) selectPrice(next.group);
      else if(!previous || previous.view!=="commissions") selectPrice("thumbnail");
      if(next.anchor==="contact" && next.group){ $("brief-group").value=next.group; updateBrief(); }
    }
    if(previous?.view!==next.view)syncWorkMotion();
    const scroll = initial || force || previous?.view!==next.view || next.view!=="works";
    if(scroll) requestAnimationFrame(()=>{
      const atTop = ["home","portfolio","commissions"].includes(next.anchor);
      const behavior = reducedMotion.matches || initial || previous?.view!==next.view ? "instant" : "smooth";
      if(atTop) window.scrollTo({top:0,behavior});
      else $(next.anchor)?.scrollIntoView({block:"start",behavior});
    });
  }
  window.addEventListener("hashchange",()=>applyRoute());
  document.addEventListener("click",e=>{
    const link=e.target.closest('a[href^="#"]');
    if(!link || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const href=link.getAttribute("href");
    if(href==="#top"){
      e.preventDefault(); window.scrollTo({top:0,behavior:reducedMotion.matches?"instant":"smooth"}); return;
    }
    if(href==="#main"){
      e.preventDefault(); $("main").focus(); return;
    }
    if(href===location.hash){
      e.preventDefault(); applyRoute({force:true});
    }
  });

  const sections=[...document.querySelectorAll("#selected,#about,#services,#process,#pricing,#policy,#contact")];
  let scrollQueued=false;
  const syncSectionNav=()=>{
    scrollQueued=false;
    const limit=$("top").getBoundingClientRect().bottom+48;
    let current;
    for(const section of sections){
      if(!section.getClientRects().length) continue;
      if(!current || section.getBoundingClientRect().top<=limit) current=section.id;
    }
    for(const link of document.querySelectorAll("[data-section-link]")){
      if(link.hash==="#"+current) link.setAttribute("aria-current","location");
      else link.removeAttribute("aria-current");
    }
  };
  const scheduleSectionNav=()=>{
    if(!scrollQueued){scrollQueued=true;requestAnimationFrame(syncSectionNav);}
  };
  window.addEventListener("scroll",scheduleSectionNav,{passive:true});
  window.addEventListener("hashchange",scheduleSectionNav);
  window.addEventListener("resize",scheduleSectionNav);

  function setCatalog(next){
    if(!next || !next.portfolio || typeof next.portfolio!=="object" || Array.isArray(next.portfolio))return;
    raw=next;
    refreshedCatalog=true;
    window.portfolioData=raw.portfolio;
    archive=normalizeArchive(raw.portfolio,DATA.showTitleByDefault!==false);
    if(editView && dialog.open && viewer.items[viewer.index]?.opId){
      const active=viewer.items[viewer.index];
      const byId=new Map(archive.filter(item=>item.opId).map(item=>[item.opId,item]));
      viewer.items=viewer.items.map(item=>byId.get(item.opId)||item);
      const updated=viewer.items[viewer.index];
      if(updated.title!==active.title || updated.sourcePath!==active.sourcePath){
        if(updated.sourcePath!==active.sourcePath && (viewer.abortOriginal || !viewer.image))renderViewer();
        else renderViewerTitle(updated);
      }
    }
    featureCollections=featuredCollections();
    email=contactAddress(raw.profile);
    applyProfile(raw.profile||{});
    updateBrief();
    $("home-work-count").textContent=number(archive.length);
    renderGroupControls();
    updateSubfilters();
    if(state.route?.view==="works") renderArchive();
  }
  async function refreshPublishedData(){
    if(DATA.catalogRefresh===false || !["http:","https:"].includes(location.protocol))return;
    try{
      const response=await fetch("./portfolio.json",{credentials:"same-origin",cache:"no-cache",signal:AbortSignal.timeout(6000)});
      if(!response.ok || !response.headers.get("content-type")?.includes("json")) return;
      const next=await response.json();
      if(!next || !next.portfolio || typeof next.portfolio!=="object" || Array.isArray(next.portfolio))return;
      if(JSON.stringify(next)===JSON.stringify(raw)) return;
      setCatalog(next);
    }catch(error){console.info("저장된 작품 목록을 사용합니다.",error.message);}
  }

  applyProfile(raw.profile||{});
  reducedMotion.addEventListener("change",syncWorkMotion);
  reducedMotion.addEventListener("change",()=>{
    if(reducedMotion.matches)arrivals.stop();
    else observeArrival(main);
  });
  document.addEventListener("visibilitychange",syncWorkMotion);
  renderServices();
  renderGroupControls();
  renderPricing();
  updateBrief();
  applyRoute({initial:true});
  observeArrival(main);
  scheduleSectionNav();
  if(DATA.catalogRefresh!==false){
    if(typeof requestIdleCallback==="function")requestIdleCallback(refreshPublishedData,{timeout:2500});
    else if(document.readyState==="complete")refreshPublishedData();
    else window.addEventListener("load",refreshPublishedData,{once:true});
  }
  let published=raw;
  let restorePublishedText;
  const defaultEditorSettings=DATA.editorSettings;
  return {
    setCatalog,
    getPublishedCatalog:()=>published,
    setPublishedCatalog(next,restoreText){
      const changed=JSON.stringify(published.portfolio)!==JSON.stringify(next.portfolio) || JSON.stringify(published.profile)!==JSON.stringify(next.profile);
      published=next;
      restorePublishedText=restoreText;
      if(!editView){
        if(changed)setCatalog(next);
        restorePublishedText(next.editorSettings||defaultEditorSettings);
      }
    },
    resetCatalog:()=>{setCatalog(published);restorePublishedText?.(published.editorSettings||defaultEditorSettings);},
    enableEditor: editor=>{editView=editor; if(state.route?.view==="works")renderArchive();},
    disableEditor: ()=>{editView=null; if(state.route?.view==="works")renderArchive();},
  };
  }

  if(typeof module==="object" && module.exports) {
    module.exports={GROUPS,SUBS,normalizeArchive,featureWorkIndex,filterArchive,parseRoute,wrapIndex,mediaType,parseYouTube,briefText,internalPath,priceHash,makeArrivalMotion,mount};
  } else {
    mount(window.BowoneQuote, window.createImageViewport);
  }
})();
