(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[405],{8312:function(e,t,n){(window.__NEXT_P=window.__NEXT_P||[]).push(["/",function(){return n(6854)}])},6854:function(e,t,n){"use strict";n.r(t),n.d(t,{AxisTypeQueryParams:function(){return _},AxisTypes:function(){return g},MarkerTypes:function(){return j},VegaAxisTypes:function(){return b},default:function(){return C}});var a=n(5893),l=n(7294),s=n(5033),i=n(4780),o=n.n(i),r=n(158);let c=e=>(e||"").replace(/"/g,"\\x22").replace(/'/g,"\\x27");function u(e){let{label:t,value:n,setColumn:l,columns:s}=e;return(0,a.jsxs)("label",{children:[t,(0,a.jsx)("div",{className:"select-wrapper",children:(0,a.jsxs)("select",{name:"".concat(t.toLowerCase(),"_column"),value:n||"",onChange:e=>l(e.target.value),children:[(0,a.jsx)("option",{value:"",children:"-- none --"}),null==s?void 0:s.map(e=>(0,a.jsx)("option",{value:e,children:e},e))]})})]})}function m(e){let{axis:t,column:n,setColumn:l,type:s,setType:i,columns:o}=e;return(0,a.jsxs)("div",{className:"filter-row",style:{display:"flex"},children:[(0,a.jsxs)("label",{children:[t.toUpperCase()," Column",(0,a.jsx)("div",{className:"select-wrapper",children:(0,a.jsx)("select",{name:"".concat(t,"_column"),value:n||"",onChange:e=>l(e.target.value),children:null==o?void 0:o.map(e=>(0,a.jsx)("option",{value:e,children:e},e))})})]}),(0,a.jsxs)("label",{children:["Type",(0,a.jsx)("div",{className:"select-wrapper",children:(0,a.jsx)("select",{name:"".concat(t,"_type"),value:s,onChange:e=>i(e.target.value),children:g.map(e=>(0,a.jsx)("option",{value:e,children:e},e))})})]})]})}function d(e){let{jsonUrl:t,markerType:n,setMarkerType:s,xColumn:i,setXColumn:o,xType:d,setXType:p,yColumn:h,setYColumn:x,yType:v,setYType:f,colorColumn:y,setColorColumn:g,sizeColumn:_,setSizeColumn:C,containerClass:N,wrapperClass:w,visDivClass:T}=e,[D,S]=(0,l.useState)(null),[k,O]=(0,l.useState)(null),E=(0,l.useRef)(null),F=(0,l.useMemo)(()=>"".concat(t).concat(/\?/.exec(t)?"&":"?","_shape=array"),[t]);(0,l.useEffect)(()=>{let e=localStorage.getItem(F),t=e?Promise.resolve(JSON.parse(e)).then(e=>(console.log("Loaded ".concat(e.length," rows from cache, for ").concat(F)),e)):fetch(F).then(e=>e.json()).then(e=>(console.log("Caching ".concat(e.length," rows from ").concat(F)),localStorage.setItem(F,JSON.stringify(e)),e));t.then(e=>{if(e.length>1){console.log("got rows:",e),S(e);let t=Object.keys(e[0]).map(t=>e.filter(e=>{var n;return(null===(n=e[t])||void 0===n?void 0:n.label)!==void 0}).length?"".concat(t,".label"):t);O(t),o(t[0]),x(t[0])}})},[F,S,O,o,x]),(0,l.useEffect)(()=>{let e=E.current;if(!e||!i||!h)return;let t=b[d],a=b[v],l=!!/, binned$/.exec(d),s=!!/, binned$/.exec(v),o="Bar"==n?"bar":"Line"==n?"line":"circle",u={x:{field:i,type:t,bin:l},y:{field:h,type:a,bin:s},tooltip:{field:"_tooltip_summary",type:"ordinal"}};y&&(u.color={field:y,type:"nominal"}),_&&(u.size={field:_,type:"quantitative"});let m=c(i),p=c(h),x="'".concat(m,": ' + datum['").concat(m,"'] + ', ").concat(p,": ' + datum['").concat(p,"']");if(y){let e=c(y);x+=" + ', ".concat(e,": ' + datum['").concat(e,"']")}if(_){let e=c(_);x+=" + ', ".concat(e,": ' + datum['").concat(e,"']")}(0,r.ZP)(e,{data:{url:F},transform:[{calculate:x,as:"_tooltip_summary"}],mark:o,encoding:u,width:"container"},{theme:"quartz",tooltip:!0})},[E.current,i,d,h,v,y,_,n]);let L=(0,l.useCallback)(e=>{e.preventDefault(),o(h),p(v),x(i),f(d)},[i,d,h,v]);return(null==k?void 0:k.length)&&(null==k?void 0:k.length)>1?(0,a.jsxs)("div",{className:N||"",children:[(0,a.jsxs)("form",{action:"",method:"GET",id:"graphForm",className:"datasette-vega",children:[(0,a.jsx)("h3",{children:"Charting options"}),(0,a.jsx)("div",{className:"filter-row radio-buttons",children:j.map(e=>(0,a.jsxs)("label",{children:[(0,a.jsx)("input",{type:"radio",name:"mark",value:e,checked:e===n,onChange:e=>s(e.target.value)}),e]},e))}),(0,a.jsx)(m,{axis:"x",column:i,setColumn:o,type:d,setType:p,columns:k}),(0,a.jsx)(m,{axis:"y",column:h,setColumn:x,type:v,setType:f,columns:k}),(0,a.jsx)("div",{className:"swap-x-y",children:(0,a.jsx)("button",{onClick:L,children:"Swap X and Y"})}),(0,a.jsxs)("div",{className:"filter-row",children:[(0,a.jsx)(u,{label:"Color",value:y,setColumn:g,columns:k}),(0,a.jsx)(u,{label:"Size",value:_,setColumn:C,columns:k})]})]}),(0,a.jsx)("div",{className:w||"",children:(0,a.jsx)("div",{className:T||"",ref:E})})]}):null}var p=n(9008),h=n.n(p),x=n(1664),v=n.n(x),f=n(8048);let y={defaultUrl:"fivethirtyeight.datasettes.com/fivethirtyeight/nba-elo~2Fnbaallelo.json",gamePtsTeamId:"/?u=fivethirtyeight.datasettes.com%2Ffivethirtyeight%2Fnba-elo~2Fnbaallelo.json&m=b&x=game_id&xt=c&y=pts&yt=n&c=team_id",ptsResult:"/?u=fivethirtyeight.datasettes.com%2Ffivethirtyeight%2Fnba-elo%7E2Fnbaallelo.json&m=s&x=opp_pts&xt=n&y=pts&yt=n&c=game_result&s=pts"},j=["Bar","Line","Scatter"],g=["Numeric","Numeric, binned","Date/time","Date/time, binned","Label","Category"],_={Numeric:"n","Numeric, binned":"nb","Date/time":"d","Date/time, binned":"db",Label:"l",Category:"c"},b={Numeric:"quantitative","Numeric, binned":"quantitative","Date/time":"temporal","Date/time, binned":"temporal",Label:"ordinal",Category:"nominal"};function C(){let e={u:(0,s.hq)(y.defaultUrl),m:(0,s.gO)("Bar",{Bar:"b",Line:"l",Scatter:"s"}),x:(0,s.ON)(),xt:(0,s.gO)("Label",_),y:(0,s.ON)(),yt:(0,s.gO)("Numeric",_),c:(0,s.ON)(),s:(0,s.ON)()},{u:[t,n],m:[i,r],x:[c,u],xt:[m,p],y:[x,j],yt:[g,b],c:[C,N],s:[w,T]}=(0,s.O5)({params:e}),D=window.location;(0,l.useEffect)(()=>{if(!D)return;let e=/\?url=(.*)/.exec(D.search);e&&n(decodeURIComponent(e[1]))},[null==D?void 0:D.search]);let S=(0,l.useMemo)(()=>/^https?:\/\//.exec(t)?t:"https://".concat(t),[t]),k=(0,l.useCallback)(e=>{e.preventDefault();let t=e.currentTarget.elements.namedItem("url"),a=t.value;n(a)},[]),O=(0,f.b)();return(0,a.jsxs)("div",{className:o().container,children:[(0,a.jsxs)(h(),{children:[(0,a.jsx)("title",{children:"Datasette-Vega"}),(0,a.jsx)("meta",{name:"description",content:"Demo of Datasette-Vega React component"}),(0,a.jsx)("link",{rel:"icon",href:"/favicon.ico"})]}),(0,a.jsxs)("main",{className:o().main,children:[(0,a.jsx)("h1",{className:o().title,children:"Datasette Vega"}),(0,a.jsx)("p",{children:"Enter the URL of the JSON version of any Datasette table:"}),(0,a.jsxs)("form",{className:o().jsonUrlForm,onSubmit:k,method:"GET",children:[(0,a.jsx)("input",{id:"jsonUrl",type:"text",name:"url",defaultValue:y.defaultUrl,style:{width:"80%",fontSize:"1.2em"}}),(0,a.jsx)("input",{type:"submit",value:"Load",style:{fontSize:"1.2em",border:"1px solid #ccc"}}),(0,a.jsxs)("p",{children:["Examples:"," ",(0,a.jsx)(v(),{href:"".concat(O).concat(y.gamePtsTeamId),children:"game_id/pts/team_id"}),","," ",(0,a.jsx)(v(),{href:"".concat(O).concat(y.ptsResult),children:"pts/opp_pts/result"})]})]}),(0,a.jsx)(d,{containerClass:o().visContainer,wrapperClass:o().visWrapper,visDivClass:o().visDiv,jsonUrl:S,markerType:i,setMarkerType:r,xColumn:c,setXColumn:u,xType:m,setXType:p,yColumn:x,setYColumn:j,yType:g,setYType:b,colorColumn:C,setColorColumn:N,sizeColumn:w,setSizeColumn:T})]})]})}},4780:function(e){e.exports={container:"Home_container__B1VFq","datasette-vega-demo":"Home_datasette-vega-demo__gChvG",jsonUrlForm:"Home_jsonUrlForm__5cCWj",visContainer:"Home_visContainer__guBIo",visWrapper:"Home_visWrapper__jie46",visDiv:"Home_visDiv__4_Zvm",main:"Home_main__3vDCl"}}},function(e){e.O(0,[662,403,774,888,179],function(){return e(e.s=8312)}),_N_E=e.O()}]);