import{r as i,g as ye,a as we,G as ae,u as W,b as q,c as ge,j as e,F as H,d as Se,e as ke,f as Ce,h as _e,L,i as re,k as Ee,l as G,O as Ie}from"./index-D8NLYhyO.js";import{p as ie}from"./pointService-Vlkwv0lb.js";import{I as ze,a as $,S as Le,A as Te,B as J,P as Ae,R as le,b as Re,c as Oe,d as Me}from"./TrophyOutlined-C7GHWXmK.js";import{M as ce,n as De}from"./newsletterServices-CqwIPhqa.js";import{L as Y}from"./Log-D5oSgyDW.js";import{p as Pe}from"./piece-CjiQvwPa.js";import{t as Fe}from"./thematicServices-efRsETaU.js";import{c as V}from"./commentServices-C63CO6H8.js";import{q as Q}from"./quizSessionService-DgMboLdd.js";const qe=(n,s,a,r)=>{var o,l,b,N;const m=[a,{code:s,...r||{}}];if((l=(o=n==null?void 0:n.services)==null?void 0:o.logger)!=null&&l.forward)return n.services.logger.forward(m,"warn","react-i18next::",!0);P(m[0])&&(m[0]=`react-i18next:: ${m[0]}`),(N=(b=n==null?void 0:n.services)==null?void 0:b.logger)!=null&&N.warn?n.services.logger.warn(...m):console!=null&&console.warn&&console.warn(...m)},de={},X=(n,s,a,r)=>{P(a)&&de[a]||(P(a)&&(de[a]=new Date),qe(n,s,a,r))},be=(n,s)=>()=>{if(n.isInitialized)s();else{const a=()=>{setTimeout(()=>{n.off("initialized",a)},0),s()};n.on("initialized",a)}},Z=(n,s,a)=>{n.loadNamespaces(s,be(n,a))},ue=(n,s,a,r)=>{if(P(a)&&(a=[a]),n.options.preload&&n.options.preload.indexOf(s)>-1)return Z(n,a,r);a.forEach(m=>{n.options.ns.indexOf(m)<0&&n.options.ns.push(m)}),n.loadLanguages(s,be(n,r))},$e=(n,s,a={})=>!s.languages||!s.languages.length?(X(s,"NO_LANGUAGES","i18n.languages were undefined or empty",{languages:s.languages}),!0):s.hasLoadedNamespace(n,{lng:a.lng,precheck:(r,m)=>{if(a.bindI18n&&a.bindI18n.indexOf("languageChanging")>-1&&r.services.backendConnector.backend&&r.isLanguageChangingTo&&!m(r.isLanguageChangingTo,n))return!1}}),P=n=>typeof n=="string",Ue=n=>typeof n=="object"&&n!==null,Be=i.createContext();class Ve{constructor(){this.usedNamespaces={}}addUsedNamespaces(s){s.forEach(a=>{this.usedNamespaces[a]||(this.usedNamespaces[a]=!0)})}getUsedNamespaces(){return Object.keys(this.usedNamespaces)}}const We=(n,s)=>{const a=i.useRef();return i.useEffect(()=>{a.current=n},[n,s]),a.current},je=(n,s,a,r)=>n.getFixedT(s,a,r),He=(n,s,a,r)=>i.useCallback(je(n,s,a,r),[n,s,a,r]),ve=(n,s={})=>{var x,_,O,z;const{i18n:a}=s,{i18n:r,defaultNS:m}=i.useContext(Be)||{},o=a||r||ye();if(o&&!o.reportNamespaces&&(o.reportNamespaces=new Ve),!o){X(o,"NO_I18NEXT_INSTANCE","useTranslation: You will need to pass in an i18next instance by using initReactI18next");const E=(v,y)=>P(y)?y:Ue(y)&&P(y.defaultValue)?y.defaultValue:Array.isArray(v)?v[v.length-1]:v,c=[E,{},!1];return c.t=E,c.i18n={},c.ready=!1,c}(x=o.options.react)!=null&&x.wait&&X(o,"DEPRECATED_OPTION","useTranslation: It seems you are still using the old wait option, you may migrate to the new useSuspense behaviour.");const l={...we(),...o.options.react,...s},{useSuspense:b,keyPrefix:N}=l;let g=m||((_=o.options)==null?void 0:_.defaultNS);g=P(g)?[g]:g||["translation"],(z=(O=o.reportNamespaces).addUsedNamespaces)==null||z.call(O,g);const t=(o.isInitialized||o.initializedStoreOnce)&&g.every(E=>$e(E,o,l)),u=He(o,s.lng||null,l.nsMode==="fallback"?g:g[0],N),w=()=>u,f=()=>je(o,s.lng||null,l.nsMode==="fallback"?g:g[0],N),[k,S]=i.useState(w);let j=g.join();s.lng&&(j=`${s.lng}${j}`);const h=We(j),d=i.useRef(!0);i.useEffect(()=>{const{bindI18n:E,bindI18nStore:c}=l;d.current=!0,!t&&!b&&(s.lng?ue(o,s.lng,g,()=>{d.current&&S(f)}):Z(o,g,()=>{d.current&&S(f)})),t&&h&&h!==j&&d.current&&S(f);const v=()=>{d.current&&S(f)};return E&&(o==null||o.on(E,v)),c&&(o==null||o.store.on(c,v)),()=>{d.current=!1,o&&E&&(E==null||E.split(" ").forEach(y=>o.off(y,v))),c&&o&&c.split(" ").forEach(y=>o.store.off(y,v))}},[o,j]),i.useEffect(()=>{d.current&&t&&S(w)},[o,N,t]);const p=[k,o,t];if(p.t=k,p.i18n=o,p.ready=t,t||!t&&!b)return p;throw new Promise(E=>{s.lng?ue(o,s.lng,g,()=>E()):Z(o,g,()=>E())})};function Ge(n){return ae({attr:{role:"img",viewBox:"0 0 24 24"},child:[{tag:"path",attr:{d:"M22.939 10.627 13.061.749a1.505 1.505 0 0 0-2.121 0l-9.879 9.878C.478 11.21 0 12.363 0 13.187v9c0 .826.675 1.5 1.5 1.5h9.227l-4.063-4.062a2.034 2.034 0 0 1-.664.113c-1.13 0-2.05-.92-2.05-2.05s.92-2.05 2.05-2.05 2.05.92 2.05 2.05c0 .233-.041.456-.113.665l3.163 3.163V9.928a2.05 2.05 0 0 1-1.15-1.84c0-1.13.92-2.05 2.05-2.05s2.05.92 2.05 2.05a2.05 2.05 0 0 1-1.15 1.84v8.127l3.146-3.146A2.051 2.051 0 0 1 18 12.239c1.13 0 2.05.92 2.05 2.05s-.92 2.05-2.05 2.05c-.25 0-.488-.047-.709-.13L12.9 20.602v3.088h9.6c.825 0 1.5-.675 1.5-1.5v-9c0-.825-.477-1.977-1.061-2.561z"},child:[]}]})(n)}function me(n){return ae({attr:{role:"img",viewBox:"0 0 24 24"},child:[{tag:"path",attr:{d:"M6.816 15.126l4.703 2.715v-5.433L6.814 9.695v5.432zm-2.025 1.168l6.73 3.882v3.82L1.481 18.206V6.616l3.31 1.91v7.769zM12 6.145L7.298 8.863 12 11.579l4.704-2.717L12 6.146zm0-2.332l5.659 3.274 3.31-1.91L12 0 1.975 5.79 5.28 7.695zm7.207 12.48v-3.947l-2.023 1.167v1.614l-4.703 2.715v.005-5.436L22.518 6.62v11.587L12.48 24v-3.817l6.727-3.887z"},child:[]}]})(n)}function Je(n){return ae({attr:{viewBox:"0 0 24 24"},child:[{tag:"path",attr:{fill:"none",strokeWidth:"2",d:"M15,17.0002864 C15,14.0000003 19,12.0005727 19,8.00028636 C19,4.00000002 16,1.00028636 12,1.00028636 C8,1.00028636 5,4.00000002 5,8.00028636 C5,12.0005727 9,14.0000003 9,17.0002864 C9,20.0005725 9,20 9,20 C9,22.0000003 10,22.9999997 12,23 C14,23.0000003 15,22.0000003 15,20 C15,20 15,20.0005725 15,17.0002864 Z M9,18 L15,18"},child:[]}]})(n)}const Qe=({openPopup:n})=>{const s=W(),{t:a,i18n:r}=ve(),m=q(),o=m.pathname==="/step",l=m.pathname==="/login",b=m.pathname==="/sign-up",N=m.pathname.startsWith("/dashboard"),g=m.pathname==="/search",{user:t}=ge(),u=!!t,[w,f]=i.useState(0);i.useEffect(()=>{const d=localStorage.getItem("lang");d&&r.changeLanguage(d)},[r]),i.useEffect(()=>{let d=!1;return(async()=>{if(t&&t.user_id)try{const x=await ie.getUserPoints(t.user_id);let _=0;x&&x.total_points!==void 0&&(_=Number(x.total_points),Number.isNaN(_)&&(_=0)),d||f(_)}catch{const x=Number(t==null?void 0:t.total_points)||0;d||f(Number.isNaN(x)?0:x)}else d||f(0)})(),()=>{d=!0}},[t]);const[k,S]=i.useState(""),j=i.useRef();i.useEffect(()=>{const p=new URLSearchParams(m.search).get("query")||"";S(p)},[m.search]);const h=d=>{d.preventDefault();const p=k.trim();s(p?`/search?query=${encodeURIComponent(p)}`:"/search")};return i.useEffect(()=>{const d=async()=>{if(t&&t.user_id)try{const p=await ie.getUserPoints(t.user_id),x=Number(p==null?void 0:p.total_points)||0;f(Number.isNaN(x)?0:x)}catch{const p=Number(t==null?void 0:t.total_points)||0;f(Number.isNaN(p)?0:p)}else f(0)};return window.addEventListener("points:updated",d),()=>window.removeEventListener("points:updated",d)},[t]),e.jsxs(e.Fragment,{children:[!o&&!N&&!b&&!l&&e.jsxs("div",{className:"position-relative z-3",children:[e.jsx("header",{style:{backgroundColor:"var(--site-bg)"},className:"header-desktop d-none d-lg-block position-sticky top-0 left-0 right-0 z-3",children:e.jsxs("div",{className:" container  d-flex align-items-center justify-content-between ",children:[e.jsxs("div",{className:"d-flex align-items-center gap-5",children:[e.jsx("nav",{className:"nav-header",children:e.jsxs("ul",{className:"d-flex align-items-center gap-5 list-unstyled m-0",children:[e.jsx("li",{children:e.jsxs("button",{onClick:()=>s("/"),className:" btn-header-custom d-flex gap-2  align-items-center text-white text-decoration-none",children:[e.jsx(Ge,{className:"p-0 m-0"})," ",a("header.home")]})}),e.jsx("li",{children:e.jsxs("button",{onClick:()=>n("thematic"),className:" btn-header-custom text-white text-decoration-none",children:[e.jsx(me,{})," ",a("header.quiz")]})})]})}),e.jsxs("form",{className:"search-bar d-flex align-items-center position-relative",onSubmit:h,role:"search","aria-label":"Recherche",children:[e.jsx("input",{type:"text",className:"search-input w-100 px-4 py-3 rounded-pill",placeholder:a("header.searchPlaceholder"),value:k,onChange:d=>S(d.target.value),ref:j,"aria-label":a("header.searchAria")}),e.jsx("button",{type:"submit",className:"search-btn position-absolute","aria-label":a("header.searchBtnAria"),children:e.jsx(H,{})})]})]}),e.jsxs("div",{style:{width:"100px"},onClick:()=>s("/"),className:"logo d-flex align-items-center justify-content-center",children:[e.jsx("img",{src:Y,className:"w-100 h-100",alt:""}),e.jsx("h1",{className:"fw-bold text-light",children:a("header.logo")})]}),e.jsxs("div",{className:"d-flex gap-3 align-items-center justify-content-center",children:[e.jsx("button",{onClick:()=>s("/terms"),className:"info-btn","aria-label":a("header.termsAria"),children:e.jsx(Je,{size:26,className:"icon p-0 m-0 text-white"})}),u&&e.jsxs("button",{className:"btn d-flex align-items-center bg-secondary text-light bg-opacity-25 rounded-pill",tabIndex:-1,"aria-label":`Vous avez ${w} points`,disabled:!0,children:[e.jsx("img",{src:Pe,width:30,className:"object-fit-cover",alt:"points"}),e.jsx("span",{className:"p-1",children:w.toLocaleString("fr-FR")})]}),u?e.jsx("button",{style:{width:"70px",height:"70px"},onClick:()=>s("/profil"),className:"rounded-5 overflow-hidden border border-white","aria-label":a("header.profile"),children:(()=>{let d="";d.endsWith("/api")&&(d=d.slice(0,-4));let p=t.avatar||t.avatar_url||"";p&&p.startsWith("/uploads/")&&(p=`${d}${p}`);const x="https://img.freepik.com/photos-premium/image-photorealiste-hyper-realiste-fond-blanc-ai-generee-par-freepik_643360-530895.jpg?semt=ais_hybrid&w=740&q=80";return e.jsx("img",{src:p&&p!==""?p:x,className:"object-fit-cover w-100",alt:"profil",onError:_=>{_.target.onerror=null,_.target.src=x}})})()}):e.jsx("button",{type:"button",onClick:()=>s("/login"),className:"rounded-5 py-2 px-3 btn-wall-custom border-0 text-white","aria-label":a("header.login"),children:a("header.login")})]})]})}),e.jsx("div",{className:"d-flex align-items-center mx-1 justify-content-center w-100",children:e.jsxs("div",{style:{height:"64px",maxWidth:"370px",zIndex:99999,paddingBottom:"env(safe-area-inset-bottom)"},className:"mobile-bottom-nav d-lg-none bg-mobile shadow-lg position-fixed bottom-0 w-100 rounded-pill m-2 mx-auto left-0 right-0 d-flex align-items-center justify-content-between px-3 gap-2",children:[e.jsx("nav",{className:"flex-grow-1",children:e.jsxs("ul",{className:"d-flex align-items-center justify-content-center gap-2 list-unstyled m-0 flex-nowrap",children:[e.jsx("li",{children:e.jsxs("button",{onClick:()=>n("thematic"),className:"btn-mb-header text-decoration-none","aria-label":a("header.quiz"),children:[e.jsx(me,{}),e.jsx("span",{className:"title-header d-none d-sm-inline",children:a("header.quiz")})]})}),e.jsx("li",{children:e.jsxs("button",{onClick:()=>s("/search"),className:"btn-mb-header text-decoration-none","aria-label":"Rechercher",children:[e.jsx(H,{}),e.jsx("span",{className:"title-header d-none d-sm-inline",children:"Rechercher"})]})})]})}),e.jsx("button",{style:{width:"72px"},onClick:()=>s("/"),className:"logo d-flex align-items-center bg-transparent border-0 justify-content-center",children:e.jsx("img",{src:Y,className:"w-100 h-100",alt:"Logo"})}),e.jsx("nav",{className:"flex-grow-1",children:e.jsxs("ul",{className:"d-flex align-items-center justify-content-center gap-2 list-unstyled m-0 flex-nowrap",children:[e.jsx("li",{children:e.jsxs("button",{onClick:()=>s("/contact"),className:"btn-mb-header text-decoration-none","aria-label":a("header.contact"),children:[e.jsx(ze,{}),e.jsx("span",{className:"title-header d-none d-sm-inline",children:a("header.contact")})]})}),e.jsx("li",{children:u?e.jsxs("button",{onClick:()=>s("/profil"),className:"btn-mb-header text-decoration-none","aria-label":a("header.profile"),children:[e.jsx(ce,{}),e.jsx("span",{className:"title-header d-none d-sm-inline",children:a("header.profile")})]}):e.jsxs("button",{onClick:()=>s("/login"),className:"btn-mb-header text-decoration-none","aria-label":a("header.login"),children:[e.jsx(ce,{}),e.jsx("span",{className:"title-header d-none d-sm-inline",children:a("header.login")})]})})]})})]})})]}),g&&e.jsx("div",{className:"container header-desktop position-fixed top-0 end-0 pb-3 d-block d-lg-none pt-4",children:e.jsxs("form",{className:"search-bar d-flex align-items-center position-relative",onSubmit:h,role:"search","aria-label":"Recherche",children:[e.jsx("input",{type:"text",className:"search-input w-100 px-4 py-3 rounded-pill",placeholder:a("header.searchPlaceholder"),value:k,onChange:d=>S(d.target.value),ref:j,"aria-label":a("header.searchAria")}),e.jsx("button",{type:"submit",className:"search-btn position-absolute","aria-label":a("header.searchBtnAria"),children:e.jsx(H,{})})]})})]})},Ye=({openPopup:n})=>{const s=localStorage.getItem("token"),a=s?JSON.parse(atob(s.split(".")[1])):null,r=a==null?void 0:a.user_id,[m,o]=i.useState(""),[l,b]=i.useState(!1),[N,g]=i.useState(""),t=q(),{t:u}=ve(),w=t.pathname==="/step",f=t.pathname==="/login",k=t.pathname==="/sign-up",S=t.pathname.startsWith("/dashboard"),j=t.pathname==="/terms",h=t.pathname==="/search",d=t.pathname==="/profil",p=async x=>{x.preventDefault(),b(!0),o("");try{await De.addNewsletter({email:N,user_id:r??null}),o("Merci pour votre inscription !"),g(""),setTimeout(()=>o(""),5e3)}catch(_){console.error("Error subscribing to newsletter:",_),(_==null?void 0:_.status)===409||/déjà abonné/i.test((_==null?void 0:_.message)||"")?o("Vous êtes déjà inscrit à la newsletter."):o("Une erreur est survenue. Veuillez réessayer."),setTimeout(()=>o(""),5e3)}finally{b(!1)}};return e.jsx(e.Fragment,{children:!w&&!d&&!h&&!S&&!f&&!k&&e.jsxs("footer",{className:"footer-funquiz rounded-5 pt-5",children:[!j&&e.jsx("div",{className:"container",children:e.jsxs("div",{className:"row g-4",children:[e.jsxs("div",{className:"col-lg-4 col-md-6",children:[e.jsx("h3",{className:"footer-title logo-title",children:u("footer.funquiz")}),e.jsx("p",{className:"mb-4",children:u("footer.description")}),e.jsxs("div",{className:"social-links mb-4",children:[e.jsx("a",{href:"#",children:e.jsx(Se,{})}),e.jsx("a",{href:"#",children:e.jsx(ke,{})}),e.jsx("a",{href:"#",children:e.jsx(Ce,{})}),e.jsx("a",{href:"#",children:e.jsx(_e,{})})]})]}),e.jsxs("div",{className:"col-lg-2 col-md-6",children:[e.jsx("h3",{className:"footer-title",children:u("footer.quick_links")}),e.jsxs("ul",{className:"footer-links d-flex flex-lg-column flex-wrap gap-2",children:[e.jsx("li",{children:e.jsx(L,{to:"/",children:u("footer.home")})}),e.jsx("li",{children:e.jsx(L,{onClick:()=>n("thematic"),children:u("footer.quiz")})}),e.jsx("li",{children:e.jsx(L,{to:"/raking",children:u("footer.ranking")})}),e.jsx("li",{children:e.jsx(L,{className:"",to:"/about",children:"À propos"})}),e.jsx("li",{children:e.jsx(L,{to:"/contact",children:u("footer.contact")})}),e.jsx("li",{children:e.jsx(L,{to:"/login",children:u("footer.login")})}),e.jsx("li",{children:e.jsx(L,{to:"/sign-up",children:u("footer.signup")})})]})]}),e.jsxs("div",{className:"col-lg-2 col-md-6",children:[e.jsx("h3",{className:"footer-title",children:u("footer.support")}),e.jsxs("ul",{className:"footer-links d-flex flex-lg-column flex-wrap gap-2",children:[e.jsx("li",{children:e.jsx(L,{to:"/terms",children:"FAQ"})}),e.jsx("li",{children:e.jsx(L,{to:"/terms",children:"Politique de confidentialité"})}),e.jsx("li",{children:e.jsx(L,{to:"/terms",children:"Conditions"})})]})]}),e.jsxs("div",{className:"col-lg-4 col-md-6 d-none d-lg-block",children:[e.jsx("h3",{className:"footer-title",children:"Newsletter"}),e.jsx("p",{className:"mb-4",children:"Recevez les derniers quiz et astuces directement dans votre boîte mail !"}),e.jsxs("div",{className:"mb-4",children:[e.jsxs("form",{onSubmit:p,className:"input-group",children:[e.jsx("input",{type:"email",className:"form-control rounded-pill m-0 newsletter-input",placeholder:"Votre email",value:N,onChange:x=>g(x.target.value),required:!0,disabled:l}),e.jsx("button",{disabled:l,className:"btn rounded-pill ms-3 btn-subscribe text-white",type:"submit",children:"S'inscrire"})]}),m&&e.jsx("div",{className:" text-light position-asolute bottom-0",children:m})]}),e.jsxs("p",{className:"small",children:["En vous inscrivant, vous acceptez notre"," ",e.jsx(L,{to:"/politique-de-confidentialite",children:"politique de confidentialité"}),"."]})]})]})}),e.jsxs("div",{className:"footer-bottom py-3",children:[e.jsx("div",{className:"container",children:e.jsxs("div",{className:"row",children:[e.jsx("div",{className:"col-md-6",children:e.jsx("p",{className:"mb-0",children:"© 2025 FunQuiz. Tous droits réservés."})}),e.jsx("div",{className:"col-md-6 text-md-end",children:e.jsxs("p",{className:"mb-0",children:["Conçu par ",e.jsx(L,{to:"/",children:"FunQuiz"})]})})]})}),e.jsx("div",{style:{height:"100px"},className:"bottom-custom"})]})]})})},Xe="/assets/10740576-DwPARsUr.jpg",Ze=()=>{const n=q(),[s,a]=i.useState(!1),[r,m]=i.useState(!1),o=n.pathname.startsWith("/dashboard");return i.useEffect(()=>{const l=sessionStorage.getItem("seenWelcomePopup");!o&&!l&&(a(!0),setTimeout(()=>m(!0)),sessionStorage.setItem("seenWelcomePopup","true"))},[o]),s?e.jsx("div",{className:"bg-dark bg-opacity-50 vh-100 w-100 position-fixed bottom-0 end-0 d-flex align-items-center justify-content-center",style:{zIndex:9999,backdropFilter:"blur(10px)"},children:e.jsxs("div",{className:`container-pop-up m-5 d-flex rounded-4 overflow-hidden ${r?"animate-in shadow-dance":""}`,style:{height:"500px",width:"800px",transition:"all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)"},children:[e.jsxs("div",{className:"imgLeft d-none d-lg-block position-relative bg-light overflow-hidden",style:{width:"1450px",position:"relative",overflow:"hidden"},children:[e.jsx("div",{className:"gradient-overlay",children:e.jsx("div",{style:{width:"270px",top:"100px",right:"100px"},className:"position-absolute overflow-hidden",children:e.jsx("img",{src:Y,className:"w-100 h-100 z-3",alt:"logo funquiz"})})}),e.jsx("img",{src:Xe,className:"w-100 h-100 object-fit-cover animate-pulse",alt:"image de fond"})]}),e.jsxs("div",{className:"container-right w-100 overflow-hidden p-5 d-flex flex-column position-relative",style:{background:"var(--bg-light)",position:"relative",zIndex:2},children:[e.jsxs("h2",{className:"logo d-flex flex-column align-items-center text-center mb-3 text-glow",children:[e.jsx("span",{className:"Logo_funquiz color-shift text-dark",children:"FunQuiz"}),e.jsx("span",{className:"sous-log"})]}),e.jsxs("p",{className:"text-secondary text-center mb-4 mt-3 fade-in-text",style:{fontSize:"13px"},children:["Prouvez votre talent, empochez des points et dominez vos amis partout !"," ",e.jsx("br",{}),e.jsx("br",{}),"Inscrivez-vous dès maintenant pour accéder à vos points, suivre votre progression et ne rien perdre de votre expérience."]}),e.jsx("button",{className:"button-popup pulse-effect",onClick:()=>a(!1),children:"Continuer"}),e.jsx("div",{className:"position-absolute start-0 end-0 bottom-0 w-100 footer-links-container",children:e.jsxs("ul",{className:"d-flex w-100 p-0 mb-3 gap-3 justify-content-center align-items-center",children:[e.jsx("li",{className:"item-popup",children:e.jsx(L,{to:"/terms",className:"link-hover-effect",children:"Confidentialité"})}),e.jsx("li",{className:"item-popup",children:e.jsx(L,{to:"/terms",className:"link-hover-effect",children:"CGU"})}),e.jsx("li",{className:"item-popup",children:e.jsx(L,{to:"/legal",className:"link-hover-effect",children:"Mentions légales"})})]})})]})]})}):null},he="G-BVLJ3MHEX3",F=10;function Ke(){const[n,s]=i.useState(!1),r=q().pathname.startsWith("/dashboard"),m=t=>{const u=t+"=",w=document.cookie.split(";");for(let f of w){for(;f.charAt(0)===" ";)f=f.substring(1);if(f.indexOf(u)===0)return f.substring(u.length)}return null},o=(t,u,w=365)=>{const f=new Date(Date.now()+w*864e5).toUTCString();document.cookie=`${t}=${u}; expires=${f}; path=/`},l=()=>{const t=m("cookieConsentDate");if(!t)return!0;const u=new Date(t);return(new Date-u)/(1e3*60*60*24)>=F},b=()=>{if(window.gtag)return;const t=document.createElement("script");t.src=`https://www.googletagmanager.com/gtag/js?id=${he}`,t.async=!0,document.head.appendChild(t),t.onload=()=>{window.dataLayer=window.dataLayer||[];function u(){window.dataLayer.push(arguments)}window.gtag=u,u("js",new Date),u("config",he)}};i.useEffect(()=>{const t=m("cookieConsent");t==="true"&&!l()?b():t==="false"&&!l()?s(!1):s(!0)},[]);const N=()=>{const t=new Date().toISOString();o("cookieConsent","true",F),o("cookieConsentDate",t,F),s(!1),b()},g=()=>{const t=new Date().toISOString();o("cookieConsent","false",F),o("cookieConsentDate",t,F),s(!1)};return!n||r?null:e.jsxs("div",{className:"alert alert-info alert-dismissible h6 fade show fixed-bottom m-0 text-center",role:"alert",style:{zIndex:9999},children:["Ce site utilise des cookies pour améliorer votre expérience. Les cookies analytiques sont utilisés uniquement avec votre consentement."," ",e.jsx("a",{href:"/politique-de-cookies",target:"_blank",rel:"noreferrer",children:"En savoir plus"}),e.jsxs("div",{className:"mt-2",children:[e.jsx("button",{className:"btn btn-primary btn-sm me-2",onClick:N,children:"Accepter"}),e.jsx("button",{className:"btn btn-outline-secondary btn-sm",onClick:g,children:"Refuser"})]})]})}function et({closePopup:n,highlightThematicId:s}){const[a,r]=i.useState([]),m=W();i.useEffect(()=>{(async()=>{try{const b=await Fe.getAllThematics();r(b)}catch(b){console.error("Erreur lors de la récupération des thématiques :",b)}})()},[]),i.useEffect(()=>{if(!s)return;const l=document.getElementById(`thematic-${s}`);l&&l.scrollIntoView({behavior:"smooth",block:"center"})},[s,a]);const o=(l,b)=>{m("/step",{state:{questions:l.questions||[],subTitle:l.title,thematicTitle:b.thematic_title}})};return e.jsx("div",{className:"backdrop-blur position-fixed bg-dark bg-opacity-50 top-0 end-0 bottom-0 start-0 h-100 w-100",style:{zIndex:1055},onClick:()=>{n==null||n()},children:e.jsx("div",{className:"position-relative w-100",children:e.jsxs("div",{style:{top:"-10px"},className:"text-dark p-5 start-0 end-0 bg-white position-absolute",onClick:l=>{l.stopPropagation()},children:[e.jsxs("div",{className:"d-flex align-items-center justify-content-between mx-5",children:[e.jsx("h2",{className:"title-selec-quiz fw-bold",children:"Toutes les thématiques"}),e.jsx("button",{onClick:l=>{l.stopPropagation(),n==null||n()},style:{color:"#0000008c"},className:"border-0 btn-close",children:"x"})]}),e.jsx("div",{className:"dropdown-menu-large w-100",children:e.jsx("div",{className:"dropdown-content w-100",children:a.map(l=>e.jsxs("div",{id:`thematic-${l.thematic_id}`,className:"dropdown-column",style:s===l.thematic_id?{backgroundColor:"rgba(179, 14, 182, 0.13)",borderRadius:"12px",padding:"12px"}:void 0,children:[e.jsx("div",{className:"image-container rounded-circle overflow-hidden mb-3",style:{width:"100px",height:"100px",display:"flex",justifyContent:"center",alignItems:"center",backgroundColor:l.color_code},children:e.jsx("img",{src:l.icon_url,loading:"lazy",decoding:"async",fetchpriority:"low",className:"rounded-circle w-100 h-100 object-fit-cover",alt:"Thematic category"})}),e.jsx("h4",{className:(s===l.thematic_id,""),children:l.thematic_title}),e.jsx("ul",{className:"list-unstyled text-start",children:Array.isArray(l.sub_thematics)&&l.sub_thematics.length>0?l.sub_thematics.map(b=>e.jsx("li",{className:"hover-custom text-start",children:e.jsx("button",{onClick:()=>{o(b,l),n==null||n()},className:"text-decoration-none bg-transparent border-0 text-primary",children:b.title})},b.sub_thematic_id)):e.jsx("li",{className:"text-muted fst-italic small",children:"Aucune sous-thématique"})})]},l.thematic_id))})})]})})})}const tt=({userId:n})=>{const s=localStorage.getItem("token"),a=s?JSON.parse(atob(s.split(".")[1])):null,r=a==null?void 0:a.user_id,m=W(),[o,l]=i.useState(""),[b,N]=i.useState(""),[g,t]=i.useState(!1),[u,w]=i.useState(!1),{closePopup:f}=re(),k=[{value:"utilite",label:"Je n'en ai plus l'utilité"},{value:"bugs",label:"Trop de bugs ou problèmes techniques"},{value:"experience",label:"Expérience utilisateur décevante"},{value:"prix",label:"Coût trop élevé"},{value:"fonctionnalites",label:"Fonctionnalités insuffisantes"},{value:"concurrence",label:"J'ai trouvé une meilleure alternative"},{value:"autre",label:"Autre raison"}],S=async j=>{if(j.preventDefault(),!!g){if(!o){alert("Veuillez sélectionner une raison.");return}w(!0);try{const h=await Ee.deleteUserSoft({user_id:r,reason:o,comment:b});alert(h.message||"Votre compte a été supprimé avec succès."),f(),m("/"),localStorage.removeItem("token"),window.location.reload()}catch(h){alert("Impossible de supprimer le compte : "+h.message)}finally{w(!1)}}};return e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"modal-backdrop"}),e.jsx("div",{className:"modal-container",children:e.jsxs("div",{className:"modal-content",children:[e.jsxs("div",{className:"modal-header",children:[e.jsx("div",{className:"header-icon",children:"⚠️"}),e.jsxs("div",{className:"header-text",children:[e.jsx("h2",{children:"Suppression de compte"}),e.jsx("p",{children:"Cette action est définitive et irréversible"})]}),e.jsx("button",{className:"close-btn",onClick:f,children:"✖️"})]}),e.jsx("div",{className:"modal-body",children:e.jsxs("div",{className:"survey-section",children:[e.jsxs("div",{className:"survey-intro",children:[e.jsx("h3",{children:"Aidez-nous à nous améliorer"}),e.jsx("p",{children:"Vos retours nous permettent d'offrir une meilleure expérience à tous nos utilisateurs."})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"Quelle est la raison principale de votre départ ?*"}),e.jsx("div",{className:"radio-group",children:k.map(j=>e.jsxs("label",{className:`radio-option ${o===j.value?"selected":""}`,children:[e.jsx("input",{type:"radio",name:"reason",value:j.value,checked:o===j.value,onChange:h=>l(h.target.value)}),e.jsx("span",{className:"radio-custom"}),e.jsx("span",{className:"radio-text",children:j.label})]},j.value))})]}),e.jsxs("div",{className:"form-group textarea-container",children:[e.jsx("label",{children:"Commentaire (optionnel)"}),e.jsx("textarea",{value:b,onChange:j=>N(j.target.value.slice(0,500)),placeholder:"Partagez vos suggestions..."}),e.jsxs("div",{className:"char-count",children:[b.length,"/500"]})]}),e.jsx("div",{className:"confirmation-section",children:e.jsxs("label",{className:"checkbox-container",children:[e.jsx("input",{type:"checkbox",checked:g,onChange:j=>t(j.target.checked)}),e.jsx("span",{className:"checkmark"}),e.jsx("span",{className:"confirmation-text",children:"Je confirme vouloir supprimer définitivement mon compte"})]})}),e.jsxs("div",{className:"actions",children:[e.jsx("button",{className:"btn btn-secondary",type:"button",onClick:f,children:"Annuler"}),e.jsx("button",{className:`btn btn-danger ${!g||u?"disabled":""}`,type:"button",disabled:!g||u,onClick:S,children:u?e.jsx("span",{className:"spinner"}):"Supprimer définitivement"})]})]})})]})}),e.jsx("style",{jsx:!0,children:`
        * {
          box-sizing: border-box;
        }

        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          z-index: 1000;
          animation: fadeIn 0.3s ease-out;
        }

        .modal-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          z-index: 1001;
          animation: slideIn 0.3s ease-out;
        }

        .modal-content {
          background: #fff;
          border-radius: 16px;
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          overflow: hidden;
          animation: scaleIn 0.3s ease-out;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        .modal-header {
          display: flex;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
          background: #fafafa;
        }

        .header-icon {
          width: 48px;
          height: 48px;
          background: #fef2f2;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 1rem;
          color: #dc2626;
        }
        .header-text {
          flex: 1;
        }
        .header-text h2 {
          margin: 0 0 0.25rem 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: #111827;
        }
        .header-text p {
          margin: 0;
          font-size: 0.875rem;
          color: #6b7280;
        }
        .close-btn {
          width: 32px;
          height: 32px;
          background: #f3f4f6;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
        }
        .close-btn:hover {
          background: #e5e7eb;
        }

        .modal-body {
          padding: 1.5rem;
          max-height: 70vh;
          overflow-y: auto;
        }

        .survey-section {
          background: #fff;
        }
        .survey-intro {
          text-align: center;
          margin-bottom: 2rem;
        }
        .survey-intro h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: #111827;
        }
        .survey-intro p {
          margin: 0;
          color: #6b7280;
          font-size: 0.875rem;
          line-height: 1.5;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }
        .radio-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .radio-option {
          display: flex;
          align-items: center;
          padding: 0.75rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .radio-option:hover {
          border-color: #d1d5db;
          background: #f9fafb;
        }
        .radio-option.selected {
          border-color: #3b82f6;
          background: #eff6ff;
        }
        .radio-option input[type='radio'] {
          display: none;
        }
        .radio-custom {
          width: 18px;
          height: 18px;
          border: 2px solid #d1d5db;
          border-radius: 50%;
          margin-right: 0.75rem;
          position: relative;
        }
        .radio-option.selected .radio-custom {
          border-color: #3b82f6;
          background: #3b82f6;
        }
        .radio-option.selected .radio-custom::after {
          content: '';
          position: absolute;
          top: 2px;
          left: 2px;
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
        }
        .radio-text {
          font-size: 0.875rem;
          color: #374151;
          font-weight: 500;
        }

        .textarea-container {
          position: relative;
        }
        .textarea-container textarea {
          width: 100%;
          min-height: 100px;
          padding: 0.75rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-family: inherit;
          font-size: 0.875rem;
          resize: vertical;
          transition: border-color 0.2s;
        }
        .textarea-container textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .textarea-container textarea::placeholder {
          color: #9ca3af;
        }
        .char-count {
          position: absolute;
          bottom: 0.5rem;
          right: 0.75rem;
          font-size: 0.75rem;
          color: #9ca3af;
          background: rgba(255, 255, 255, 0.9);
          padding: 0.125rem 0.25rem;
          border-radius: 4px;
        }

        .confirmation-section {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          padding: 1rem;
          margin: 1.5rem 0;
        }
        .checkbox-container {
          display: flex;
          align-items: center;
          cursor: pointer;
        }
        .checkbox-container input[type='checkbox'] {
          display: none;
        }
        .checkmark {
          width: 20px;
          height: 20px;
          border: 2px solid #dc2626;
          border-radius: 4px;
          margin-right: 0.5rem;
          position: relative;
        }
        .checkbox-container input[type='checkbox']:checked + .checkmark {
          background: #dc2626;
        }
        .checkbox-container input[type='checkbox']:checked + .checkmark::after {
          content: '';
          position: absolute;
          top: 2px;
          left: 6px;
          width: 4px;
          height: 8px;
          border: solid white;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }
        .confirmation-text {
          font-size: 0.875rem;
          color: #991b1b;
        }

        .actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 1.5rem;
        }
        .btn {
          flex: 1;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.2s;
        }
        .btn-secondary {
          background: #f3f4f6;
          color: #374151;
        }
        .btn-secondary:hover {
          background: #e5e7eb;
        }
        .btn-danger {
          background: #dc2626;
          color: white;
        }
        .btn-danger:hover:not(.disabled) {
          background: #b91c1c;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
        }
        .btn.disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
          box-shadow: none !important;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideIn {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes scaleIn {
          from {
            transform: scale(0.95);
          }
          to {
            transform: scale(1);
          }
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 768px) {
          .modal-container {
            padding: 0.5rem;
          }
          .modal-header {
            padding: 1rem;
          }
          .modal-body {
            padding: 1rem;
          }
          .actions {
            flex-direction: column;
          }
        }
      `})]})},st=({closePopup:n})=>{const s=localStorage.getItem("token"),a=s?JSON.parse(atob(s.split(".")[1])):null,r=a==null?void 0:a.user_id,[m,o]=i.useState(!1),[l,b]=i.useState(""),[N,g]=i.useState(null),[t,u]=i.useState([]),[w,f]=i.useState(""),[k,S]=i.useState(!1),[j,h]=i.useState(""),[d,p]=i.useState(""),x=async c=>{try{await V.deleteComment(c),u(t.filter(v=>v.comment_id!==c))}catch(v){console.error("❌ Erreur lors de la suppression :",v),h("Impossible de supprimer le commentaire. Réessayez.")}},_=async c=>{if(c.preventDefault(),!r){g("error"),f("⚠️ Vous devez être connecté pour donner un avis.");return}S(!0),h("");try{await V.createComment({user_id:r,content:l}),g("success"),b("");const v=await V.getCommentsWithUserAndQuiz();u(v)}catch(v){console.error("❌ Erreur lors de l’envoi :",v),g("error"),h("⚠️ L’envoi de votre avis a échoué. Réessayez.")}finally{S(!1)}};i.useEffect(()=>{(async()=>{try{const v=await V.getCommentsWithUserAndQuiz();u(v.sort((y,I)=>new Date(I.created_at)-new Date(y.created_at)))}catch(v){console.error("❌ Erreur lors de la récupération :",v),h("⚠️ Impossible de récupérer les commentaires.")}})()},[]);const O=()=>{if(!s){f("⚠️ Vous devez être connecté pour donner un avis.");return}f(""),o(!m)},z=t.filter(c=>{const v=d.toLowerCase();return c.content.toLowerCase().includes(v)||c.first_name.toLowerCase().includes(v)||c.name.toLowerCase().includes(v)}),E=c=>{if(!d)return c;const v=new RegExp(`(${d})`,"gi");return c.replace(v,"<mark>$1</mark>")};return e.jsx("div",{className:"opinion-backdrop",onClick:()=>{n==null||n()},children:e.jsxs("div",{className:"opinion-popup relative",onClick:c=>{c.stopPropagation()},children:[e.jsx("button",{onClick:n,className:"text-black bg-white py-2 px-3 top-0 right-0 absolute rounded-circle focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",children:"x"}),e.jsx("h1",{className:"opinion-title text-light",children:"Avis des Joueurs"}),w&&e.jsx("p",{className:"text-warning text-center mt-2",children:w}),j&&e.jsx("p",{className:"text-danger text-center mt-1",children:j}),e.jsx("div",{className:"search-container mb-3",children:e.jsx("input",{type:"text",placeholder:"Rechercher un commentaire ou un nom...",value:d,onChange:c=>p(c.target.value)})}),e.jsx("div",{className:"toggle-form-container mb-3",children:e.jsx("button",{onClick:O,className:`btn-toggle ${m?"active":""}`,children:m?"Fermer le formulaire":"Donner mon avis"})}),m&&e.jsxs("div",{className:"opinion-form mb-3",children:[e.jsx("h2",{className:"text-light",children:"Laissez votre avis"}),N==="success"&&e.jsx("div",{className:"alert alert-success",children:"✅ Merci ! Votre avis sera visible après validation."}),N==="error"&&e.jsx("div",{className:"alert alert-danger",children:"❌ Une erreur est survenue."}),e.jsxs("form",{onSubmit:_,children:[e.jsx("textarea",{className:"form-control",placeholder:"Votre avis...",value:l,onChange:c=>b(c.target.value),required:!0}),e.jsx("button",{type:"submit",className:"btn-submit",disabled:k,children:k?"Envoi en cours...":"Envoyer"})]})]}),e.jsx("div",{className:"comments-list mt-4",children:z.filter(c=>Number(c.is_approved)===1).map(c=>e.jsxs("div",{className:"comment-item",children:[c.avatar_url?e.jsx("img",{src:c.avatar_url,alt:`${c.first_name} ${c.name}`,className:"rounded-circle",style:{width:"48px",height:"48px",objectFit:"cover"}}):e.jsx("div",{className:"rounded-circle text-white fw-bold d-flex align-items-center justify-content-center",style:{width:"48px",height:"48px",fontSize:"20px",background:"linear-gradient(135deg, #667eea 0%, #764ba2 100%)"},children:c.name.charAt(0).toUpperCase()}),e.jsxs("div",{className:"comment-content",children:[e.jsxs("div",{className:"comment-header d-flex justify-content-between align-items-center",children:[e.jsxs("span",{className:"user-name text-light fs-5",children:[c.first_name," ",c.name]}),e.jsxs("div",{className:"d-flex align-items-center",children:[e.jsx("small",{className:"comment-date",children:new Date(c.created_at).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"})}),r===c.user_id&&e.jsx("button",{onClick:()=>x(c.comment_id),className:"btn btn-sm btn-danger rounded-circle  ms-2",children:"x"})]})]}),e.jsx("p",{className:"comment-text text-white",dangerouslySetInnerHTML:{__html:E(c.content)}})]})]},c.comment_id))})]})})};var nt={icon:{tag:"svg",attrs:{"fill-rule":"evenodd",viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"path",attrs:{d:"M512 64c247.4 0 448 200.6 448 448S759.4 960 512 960 64 759.4 64 512 264.6 64 512 64zm0 76c-205.4 0-372 166.6-372 372s166.6 372 372 372 372-166.6 372-372-166.6-372-372-372zm128.01 198.83c.03 0 .05.01.09.06l45.02 45.01a.2.2 0 01.05.09.12.12 0 010 .07c0 .02-.01.04-.05.08L557.25 512l127.87 127.86a.27.27 0 01.05.06v.02a.12.12 0 010 .07c0 .03-.01.05-.05.09l-45.02 45.02a.2.2 0 01-.09.05.12.12 0 01-.07 0c-.02 0-.04-.01-.08-.05L512 557.25 384.14 685.12c-.04.04-.06.05-.08.05a.12.12 0 01-.07 0c-.03 0-.05-.01-.09-.05l-45.02-45.02a.2.2 0 01-.05-.09.12.12 0 010-.07c0-.02.01-.04.06-.08L466.75 512 338.88 384.14a.27.27 0 01-.05-.06l-.01-.02a.12.12 0 010-.07c0-.03.01-.05.05-.09l45.02-45.02a.2.2 0 01.09-.05.12.12 0 01.07 0c.02 0 .04.01.08.06L512 466.75l127.86-127.86c.04-.05.06-.06.08-.06a.12.12 0 01.07 0z"}}]},name:"close-circle",theme:"outlined"};function K(){return K=Object.assign?Object.assign.bind():function(n){for(var s=1;s<arguments.length;s++){var a=arguments[s];for(var r in a)Object.prototype.hasOwnProperty.call(a,r)&&(n[r]=a[r])}return n},K.apply(this,arguments)}const at=(n,s)=>i.createElement($,K({},n,{ref:s,icon:nt})),pe=i.forwardRef(at);var rt={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"path",attrs:{d:"M834.1 469.2A347.49 347.49 0 00751.2 354l-29.1-26.7a8.09 8.09 0 00-13 3.3l-13 37.3c-8.1 23.4-23 47.3-44.1 70.8-1.4 1.5-3 1.9-4.1 2-1.1.1-2.8-.1-4.3-1.5-1.4-1.2-2.1-3-2-4.8 3.7-60.2-14.3-128.1-53.7-202C555.3 171 510 123.1 453.4 89.7l-41.3-24.3c-5.4-3.2-12.3 1-12 7.3l2.2 48c1.5 32.8-2.3 61.8-11.3 85.9-11 29.5-26.8 56.9-47 81.5a295.64 295.64 0 01-47.5 46.1 352.6 352.6 0 00-100.3 121.5A347.75 347.75 0 00160 610c0 47.2 9.3 92.9 27.7 136a349.4 349.4 0 0075.5 110.9c32.4 32 70 57.2 111.9 74.7C418.5 949.8 464.5 959 512 959s93.5-9.2 136.9-27.3A348.6 348.6 0 00760.8 857c32.4-32 57.8-69.4 75.5-110.9a344.2 344.2 0 0027.7-136c0-48.8-10-96.2-29.9-140.9zM713 808.5c-53.7 53.2-125 82.4-201 82.4s-147.3-29.2-201-82.4c-53.5-53.1-83-123.5-83-198.4 0-43.5 9.8-85.2 29.1-124 18.8-37.9 46.8-71.8 80.8-97.9a349.6 349.6 0 0058.6-56.8c25-30.5 44.6-64.5 58.2-101a240 240 0 0012.1-46.5c24.1 22.2 44.3 49 61.2 80.4 33.4 62.6 48.8 118.3 45.8 165.7a74.01 74.01 0 0024.4 59.8 73.36 73.36 0 0053.4 18.8c19.7-1 37.8-9.7 51-24.4 13.3-14.9 24.8-30.1 34.4-45.6 14 17.9 25.7 37.4 35 58.4 15.9 35.8 24 73.9 24 113.1 0 74.9-29.5 145.4-83 198.4z"}}]},name:"fire",theme:"outlined"};function ee(){return ee=Object.assign?Object.assign.bind():function(n){for(var s=1;s<arguments.length;s++){var a=arguments[s];for(var r in a)Object.prototype.hasOwnProperty.call(a,r)&&(n[r]=a[r])}return n},ee.apply(this,arguments)}const ot=(n,s)=>i.createElement($,ee({},n,{ref:s,icon:rt})),fe=i.forwardRef(ot);var it={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"path",attrs:{d:"M946.5 505L560.1 118.8l-25.9-25.9a31.5 31.5 0 00-44.4 0L77.5 505a63.9 63.9 0 00-18.8 46c.4 35.2 29.7 63.3 64.9 63.3h42.5V940h691.8V614.3h43.4c17.1 0 33.2-6.7 45.3-18.8a63.6 63.6 0 0018.7-45.3c0-17-6.7-33.1-18.8-45.2zM568 868H456V664h112v204zm217.9-325.7V868H632V640c0-22.1-17.9-40-40-40H432c-22.1 0-40 17.9-40 40v228H238.1V542.3h-96l370-369.7 23.1 23.1L882 542.3h-96.1z"}}]},name:"home",theme:"outlined"};function te(){return te=Object.assign?Object.assign.bind():function(n){for(var s=1;s<arguments.length;s++){var a=arguments[s];for(var r in a)Object.prototype.hasOwnProperty.call(a,r)&&(n[r]=a[r])}return n},te.apply(this,arguments)}const lt=(n,s)=>i.createElement($,te({},n,{ref:s,icon:it})),ct=i.forwardRef(lt);var dt={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"path",attrs:{d:"M917 211.1l-199.2 24c-6.6.8-9.4 8.9-4.7 13.6l59.3 59.3-226 226-101.8-101.7c-6.3-6.3-16.4-6.2-22.6 0L100.3 754.1a8.03 8.03 0 000 11.3l45 45.2c3.1 3.1 8.2 3.1 11.3 0L433.3 534 535 635.7c6.3 6.2 16.4 6.2 22.6 0L829 364.5l59.3 59.3a8.01 8.01 0 0013.6-4.7l24-199.2c.7-5.1-3.7-9.5-8.9-8.8z"}}]},name:"rise",theme:"outlined"};function se(){return se=Object.assign?Object.assign.bind():function(n){for(var s=1;s<arguments.length;s++){var a=arguments[s];for(var r in a)Object.prototype.hasOwnProperty.call(a,r)&&(n[r]=a[r])}return n},se.apply(this,arguments)}const ut=(n,s)=>i.createElement($,se({},n,{ref:s,icon:dt})),mt=i.forwardRef(ut);var ht={icon:{tag:"svg",attrs:{viewBox:"64 64 896 896",focusable:"false"},children:[{tag:"path",attrs:{d:"M908.1 353.1l-253.9-36.9L540.7 86.1c-3.1-6.3-8.2-11.4-14.5-14.5-15.8-7.8-35-1.3-42.9 14.5L369.8 316.2l-253.9 36.9c-7 1-13.4 4.3-18.3 9.3a32.05 32.05 0 00.6 45.3l183.7 179.1-43.4 252.9a31.95 31.95 0 0046.4 33.7L512 754l227.1 119.4c6.2 3.3 13.4 4.4 20.3 3.2 17.4-3 29.1-19.5 26.1-36.9l-43.4-252.9 183.7-179.1c5-4.9 8.3-11.3 9.3-18.3 2.7-17.5-9.5-33.7-27-36.3zM664.8 561.6l36.1 210.3L512 672.7 323.1 772l36.1-210.3-152.8-149L417.6 382 512 190.7 606.4 382l211.2 30.7-152.8 148.9z"}}]},name:"star",theme:"outlined"};function ne(){return ne=Object.assign?Object.assign.bind():function(n){for(var s=1;s<arguments.length;s++){var a=arguments[s];for(var r in a)Object.prototype.hasOwnProperty.call(a,r)&&(n[r]=a[r])}return n},ne.apply(this,arguments)}const pt=(n,s)=>i.createElement($,ne({},n,{ref:s,icon:ht})),xe=i.forwardRef(pt);function ft({closePopup:n}){const s=W(),{popupPayload:a}=re(),r=a||{},[m,o]=i.useState(!1),[l,b]=i.useState(!0),[N,g]=i.useState(""),[t,u]=i.useState(null),[w,f]=i.useState(!1),k=i.useMemo(()=>{const y=localStorage.getItem("token");if(!y)return null;try{const I=JSON.parse(atob(y.split(".")[1]));return(I==null?void 0:I.user_id)||null}catch{return null}},[]);if(i.useEffect(()=>{let y=!1;const I=(T,M=0)=>{const R=Number(T);return Number.isFinite(R)?R:M},U=async(T,M)=>{let R=0;const D=async()=>{if(!(y||R>=4)){R++;try{console.log(`🔄 Tentative de rafraîchissement ${R}/4 pour session ${T}`);const C=await Q.getSessionById(T);console.log("📥 Session reçue du serveur:",C);const A=I((C==null?void 0:C.current_score)??(C==null?void 0:C.score)),oe=I((C==null?void 0:C.total_questions)??(C==null?void 0:C.questions_count)??(C==null?void 0:C.max_score)),B=Number(C==null?void 0:C.is_completed)===1;console.log("Analyse:",{apiScore:A,apiTotal:oe,apiCompleted:B,expectedScore:I(M)}),B&&A>=I(M)?(console.log("✅ Session complète et à jour, mise à jour de l'état"),y||u(C)):(console.log(`⏳ Session pas encore à jour, réessai dans ${R*300}ms`),setTimeout(D,R*300))}catch(C){console.error("❌ Erreur lors du rafraîchissement:",C),setTimeout(D,R*300)}}};D()};return(async()=>{console.log("════════════════════════════════════════"),console.log("🎬 DÉBUT CHARGEMENT RESULT POPUP"),console.log("════════════════════════════════════════"),console.log("Payload reçu:",r);try{b(!0);const T=Number.isFinite(Number(r==null?void 0:r.score))&&Number.isFinite(Number(r==null?void 0:r.total));if(console.log("✅ Payload a score et total?",T),T){console.log("📦 Création de session synthétique depuis payload");const A={session_id:r.sessionId||null,current_score:I(r.score),correct_answers_count:I(r.score),total_questions:I(r.total),last_activity:r.playedAt||new Date().toISOString(),thematic_title:r.thematicTitle,sub_thematic_title:r.subTitle};console.log("Session synthétique créée:",A),y||(u(A),b(!1)),r.sessionId&&(console.log("🔄 Rafraîchissement depuis serveur..."),U(r.sessionId,r.score));return}if(r!=null&&r.sessionId){console.log("📥 Récupération session depuis ID:",r.sessionId);const A=await Q.getSessionById(r.sessionId);console.log("Session récupérée:",A),y||u(A);return}if(!k)throw new Error("Utilisateur non authentifié ou introuvable.");console.log("👤 Récupération sessions pour user:",k);const M=await Q.getUserSessions(k);console.log("Sessions utilisateur:",M);const R=A=>[...A].sort((B,Ne)=>new Date(Ne.last_activity)-new Date(B.last_activity))[0]||null,D=M.filter(A=>Number(A.is_completed)===1);console.log("Sessions complétées:",D);const C=R(D.length?D:M);if(console.log("Session sélectionnée:",C),!C)throw new Error("Aucune session de quiz trouvée.");y||u(C)}catch(T){console.error("❌ ERREUR lors du chargement:",T),y||g((T==null?void 0:T.message)||"Erreur lors du chargement du résultat.")}finally{y||(b(!1),console.log("════════════════════════════════════════"),console.log("🏁 FIN CHARGEMENT RESULT POPUP"),console.log("════════════════════════════════════════"))}})(),()=>{y=!0}},[r==null?void 0:r.sessionId,r==null?void 0:r.score,r==null?void 0:r.total,k]),i.useEffect(()=>{if(t){const y=Number((t==null?void 0:t.current_score)??(t==null?void 0:t.score)??0),I=Number((t==null?void 0:t.total_questions)??(t==null?void 0:t.questions_count)??(t==null?void 0:t.max_score)??0),U=I>0?y/I*100:0;console.log("🎊 Vérification confetti:",{score:y,total:I,percent:U}),U>=80&&(console.log("✨ Activation des confettis!"),f(!0),setTimeout(()=>f(!1),4e3))}},[t]),l)return G.createPortal(e.jsx("div",{className:"result-popup-overlay",children:e.jsxs("div",{className:"result-popup-loading",children:[e.jsx(Le,{size:"large"}),e.jsx("p",{className:"loading-text",children:"Calcul de vos résultats..."})]})}),document.body);const S=()=>{if(!m){o(!0);try{n()}finally{const y=typeof(r==null?void 0:r.redirectTo)=="string"?r.redirectTo:"/";s(y,{replace:!0})}}};if(N)return G.createPortal(e.jsx("div",{className:"result-popup-overlay",children:e.jsxs("div",{className:"result-popup-card result-popup-error",children:[e.jsx("div",{className:"result-popup-close",onClick:S,children:"×"}),e.jsx("div",{className:"error-icon",children:e.jsx(pe,{})}),e.jsx("h2",{className:"error-title",children:"Oups !"}),e.jsx(Te,{type:"error",message:"Impossible d'afficher le résultat",description:N,showIcon:!0}),e.jsx(J,{type:"primary",size:"large",onClick:n,style:{marginTop:24},children:"Fermer"})]})}),document.body);console.log(`
════════════════════════════════════════`),console.log("📊 CALCUL DES RÉSULTATS"),console.log("════════════════════════════════════════"),console.log("Session complète:",JSON.stringify(t,null,2));const j=Number((t==null?void 0:t.current_score)??(t==null?void 0:t.score)??0),h=Number((t==null?void 0:t.correct_answers_count)??0),d=Number((t==null?void 0:t.total_questions)??(t==null?void 0:t.questions_count)??(t==null?void 0:t.max_score)??0);console.log(`
📈 VALEURS EXTRAITES:`),console.log("-----------------------------------"),console.log("current_score (brut):",t==null?void 0:t.current_score,"| Type:",typeof(t==null?void 0:t.current_score)),console.log("score (brut):",t==null?void 0:t.score,"| Type:",typeof(t==null?void 0:t.score)),console.log("✅ SCORE FINAL:",j),console.log("-----------------------------------"),console.log("correct_answers_count (brut):",t==null?void 0:t.correct_answers_count,"| Type:",typeof(t==null?void 0:t.correct_answers_count)),console.log("✅ CORRECT FINAL:",h),console.log("-----------------------------------"),console.log("total_questions (brut):",t==null?void 0:t.total_questions,"| Type:",typeof(t==null?void 0:t.total_questions)),console.log("questions_count (brut):",t==null?void 0:t.questions_count,"| Type:",typeof(t==null?void 0:t.questions_count)),console.log("max_score (brut):",t==null?void 0:t.max_score,"| Type:",typeof(t==null?void 0:t.max_score)),console.log("✅ TOTAL FINAL:",d),console.log("-----------------------------------");const p=d>0?j/d*100:0,x=p.toFixed(1);console.log(`
🎯 CALCULS:`),console.log("Pourcentage brut:",p),console.log("Pourcentage formaté:",x+"%"),console.log("Mauvaises réponses:",d-h);const _=(t==null?void 0:t.last_activity)||(t==null?void 0:t.updated_at)||(t==null?void 0:t.created_at),O=_?new Date(_).toLocaleString("fr-FR",{dateStyle:"short",timeStyle:"short"}):"—";console.log(`
📅 DATE:`),console.log("last_activity:",t==null?void 0:t.last_activity),console.log("updated_at:",t==null?void 0:t.updated_at),console.log("created_at:",t==null?void 0:t.created_at),console.log("Date affichée:",O);let z="beginner",E="Continue comme ça !",c="#faad14",v=e.jsx(xe,{});return p>=90?(z="perfect",E="Performance exceptionnelle ! 🏆",c="#722ed1",v=e.jsx(Oe,{})):p>=80?(z="excellent",E="Excellent travail ! 🎉",c="#52c41a",v=e.jsx(le,{})):p>=60?(z="good",E="Bon résultat ! 👍",c="#1890ff",v=e.jsx(fe,{})):p>=40?(z="average",E="Pas mal, continue ! 💪",c="#faad14",v=e.jsx(xe,{})):(z="beginner",E="Tu peux faire mieux ! 🔥",c="#ff4d4f",v=e.jsx(fe,{})),console.log(`
🎨 PERFORMANCE:`),console.log("Niveau:",z),console.log("Message:",E),console.log("Couleur:",c),console.log(`
💡 DIAGNOSTIC:`),j!==h?(console.warn("⚠️ ATTENTION: score !== correct"),console.warn("Score:",j,"| Correct:",h),console.warn("Il y a probablement un problème avec correct_answers_count")):console.log("✅ score === correct, tout est cohérent"),d===0&&console.error("❌ ERREUR: total === 0, impossible de calculer le pourcentage"),console.log(`════════════════════════════════════════
`),G.createPortal(e.jsxs("div",{className:"result-popup-overlay",children:[w&&e.jsx("div",{className:"confetti-container",children:[...Array(50)].map((y,I)=>e.jsx("div",{className:"confetti",style:{left:`${Math.random()*100}%`,animationDelay:`${Math.random()*2}s`,backgroundColor:["#FFD700","#FF6B6B","#4ECDC4","#45B7D1","#FFA07A"][Math.floor(Math.random()*5)]}},I))}),e.jsxs("div",{className:`result-popup-card ${z}`,children:[e.jsxs("div",{className:"result-header",children:[e.jsx("div",{className:"result-icon",style:{color:c},children:v}),e.jsx("h2",{className:"result-title",children:"Quiz Terminé !"}),e.jsx("p",{className:"result-subtitle",style:{color:c},children:E})]}),e.jsxs("div",{className:"result-main-score",children:[e.jsx("div",{className:"progress-circle-container",children:e.jsx(Ae,{type:"circle",percent:p,format:()=>e.jsxs("div",{className:"progress-inner",children:[e.jsx("div",{className:"score-big",children:j}),e.jsx("div",{className:"score-divider",children:"/"}),e.jsx("div",{className:"score-total",children:d})]}),strokeColor:{"0%":c,"100%":z==="perfect"?"#722ed1":c},strokeWidth:8,width:200})}),e.jsxs("div",{className:"percent-badge",style:{backgroundColor:c},children:[x,"%"]})]}),e.jsxs("div",{className:"result-stats",children:[e.jsxs("div",{className:"stat-item",children:[e.jsx("div",{className:"stat-icon success",children:e.jsx(le,{})}),e.jsxs("div",{className:"stat-content",children:[e.jsx("span",{className:"stat-label text-light",children:"Bonnes réponses"}),e.jsx("span",{className:"stat-value",children:h})]})]}),e.jsxs("div",{className:"stat-item",children:[e.jsx("div",{className:"stat-icon error",children:e.jsx(pe,{})}),e.jsxs("div",{className:"stat-content",children:[e.jsx("span",{className:"stat-label text-light",children:"Mauvaises réponses"}),e.jsx("span",{className:"stat-value",children:d-h})]})]}),e.jsxs("div",{className:"stat-item",children:[e.jsx("div",{className:"stat-icon info",children:e.jsx(Re,{})}),e.jsxs("div",{className:"stat-content",children:[e.jsx("span",{className:"stat-label text-light",children:"Date"}),e.jsx("span",{className:"stat-value",children:O})]})]})]}),(t==null?void 0:t.thematic_title)&&e.jsxs("div",{className:"result-info",children:[e.jsxs("div",{className:"info-item",children:[e.jsx("span",{className:"info-label text-light",children:"Thématique"}),e.jsx("span",{className:"info-value",children:t.thematic_title})]}),(t==null?void 0:t.sub_thematic_title)&&e.jsxs("div",{className:"info-item",children:[e.jsx("span",{className:"info-label text-light",children:"Sous-thématique"}),e.jsx("span",{className:"info-value",children:t.sub_thematic_title})]})]}),e.jsxs("div",{className:"result-actions",children:[e.jsx(J,{type:"default",size:"large",icon:e.jsx(ct,{}),onClick:S,className:"action-btn secondary",children:"Accueil"}),e.jsx(J,{type:"primary",size:"large",icon:e.jsx(mt,{}),onClick:()=>{s("/raking",{replace:!0}),n()},className:"action-btn primary",children:"Classement"})]}),e.jsxs("div",{className:"result-session-id",children:["Session #",(t==null?void 0:t.session_id)||"—"]})]})]}),document.body)}function xt({closePopup:n}){const{user:s,putUserById:a}=ge(),[r,m]=i.useState(""),[o,l]=i.useState(!1),[b,N]=i.useState(""),g=u=>u.replace(/\D/g,""),t=async u=>{var f,k,S,j,h,d,p;u.preventDefault(),N("");const w=g(r);if(!w||w.length<8||w.length>20){N("Veuillez entrer un numéro valide (8 à 20 chiffres).");return}try{l(!0),await a(s.user_id,{number:w}),alert("Numéro enregistré. Vous pourrez maintenant le vérifier."),n()}catch(x){const _=(f=x==null?void 0:x.response)==null?void 0:f.status,O=(S=(k=x==null?void 0:x.response)==null?void 0:k.data)==null?void 0:S.code,z=((h=(j=x==null?void 0:x.response)==null?void 0:j.data)==null?void 0:h.message)||((p=(d=x==null?void 0:x.response)==null?void 0:d.data)==null?void 0:p.error)||(x==null?void 0:x.message);_===409||O==="NUMBER_ALREADY_IN_USE"||/Duplicate entry/i.test(z||"")?N("Ce numéro est déjà utilisé par un autre compte."):N(z||"Erreur lors de l’enregistrement.")}finally{l(!1)}};return e.jsx("div",{className:"position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center",style:{zIndex:9999,backgroundColor:"rgba(0,0,0,0.5)"},children:e.jsxs("div",{className:"shadow-lg p-4 rounded-4 bg-white",style:{width:420},children:[e.jsx("h3",{className:"mb-3",children:"Ajouter un numéro"}),e.jsx("p",{className:"text-muted mb-3",children:"Entrez votre numéro de téléphone pour lier votre compte."}),e.jsxs("form",{onSubmit:t,children:[e.jsx("input",{type:"tel",className:"form-control-custom mb-3",placeholder:"Ex: 0701234567",value:r,onChange:u=>m(g(u.target.value)),disabled:o}),b&&e.jsx("div",{className:"alert alert-danger",children:b}),e.jsxs("div",{className:"d-flex justify-content-end gap-2",children:[e.jsx("button",{type:"button",className:"btn btn-outline-secondary",onClick:n,disabled:o,children:"Annuler"}),e.jsx("button",{type:"submit",className:"btn btn-primary",disabled:o,children:o?"Enregistrement...":"Enregistrer"})]})]})]})})}function _t(){const{activePopup:n,setActivePopup:s,closePopup:a,popupPayload:r}=re(),m=q(),l=["/login","/sign-up","/reset"].some(N=>m.pathname.startsWith(N)),b={thematic:e.jsx(et,{closePopup:a,highlightThematicId:r==null?void 0:r.highlightThematicId}),deleteUser:e.jsx(tt,{closePopup:a}),opinion:e.jsx(st,{closePopup:a}),result:e.jsx(ft,{closePopup:a}),importUser:e.jsx(Me,{closePopup:a}),addNumber:e.jsx(xt,{closePopup:a})};return i.useEffect(()=>{const N=localStorage.getItem("public.site.bg"),g=localStorage.getItem("public.site.accent"),t=localStorage.getItem("public.site.text"),u=localStorage.getItem("public.site.textMuted"),w=localStorage.getItem("public.site.link"),f=localStorage.getItem("public.site.surface"),k=localStorage.getItem("public.site.border"),S=localStorage.getItem("public.site.panel"),j=h=>{if(!h)return"";if(h==="#3b82f6")return"#2563eb";if(h==="#06d47b")return"#05b868";if(h==="#ff9900")return"#c17700";if(h==="#9b34d3")return"#7e2ab5";if(!h.startsWith("#")||h.length!==7)return"";const d=Math.max(0,Math.min(255,Math.round(parseInt(h.slice(1,3),16)*.82))),p=Math.max(0,Math.min(255,Math.round(parseInt(h.slice(3,5),16)*.82))),x=Math.max(0,Math.min(255,Math.round(parseInt(h.slice(5,7),16)*.82)));return`#${d.toString(16).padStart(2,"0")}${p.toString(16).padStart(2,"0")}${x.toString(16).padStart(2,"0")}`};if(N&&document.documentElement.style.setProperty("--site-bg",N),g){document.documentElement.style.setProperty("--site-accent",g),document.documentElement.style.setProperty("--site-accent-default",g);const h=j(g);h&&document.documentElement.style.setProperty("--site-accent-default-strong",h)}t&&document.documentElement.style.setProperty("--site-text",t),u&&document.documentElement.style.setProperty("--site-text-muted",u),w&&document.documentElement.style.setProperty("--site-link",w),f&&document.documentElement.style.setProperty("--site-surface",f),k&&document.documentElement.style.setProperty("--site-border",k),S&&document.documentElement.style.setProperty("--site-panel",S),(!f||!k||!S)&&(N==="#f8fafc"||N==="#ffffff"||t==="#0b1220"?(f||document.documentElement.style.setProperty("--site-surface","#ffffff"),k||document.documentElement.style.setProperty("--site-border","rgba(0, 0, 0, 0.10)"),S||document.documentElement.style.setProperty("--site-panel","rgba(255, 255, 255, 0.85)")):(f||document.documentElement.style.setProperty("--site-surface","rgba(255, 255, 255, 0.06)"),k||document.documentElement.style.setProperty("--site-border","rgba(255, 255, 255, 0.12)"),S||document.documentElement.style.setProperty("--site-panel","rgba(0, 0, 0, 0.22)")))},[]),e.jsxs("div",{className:"bg-custom-app",children:[!l&&e.jsx(Qe,{openPopup:s}),e.jsx("main",{children:e.jsx(Ie,{})}),!l&&e.jsx(Ze,{}),!l&&e.jsx(Ke,{}),!l&&e.jsx(Ye,{openPopup:s}),n&&b[n]]})}export{_t as default};
