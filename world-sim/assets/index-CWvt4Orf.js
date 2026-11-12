(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))i(r);new MutationObserver(r=>{for(const s of r)if(s.type==="childList")for(const a of s.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&i(a)}).observe(document,{childList:!0,subtree:!0});function n(r){const s={};return r.integrity&&(s.integrity=r.integrity),r.referrerPolicy&&(s.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?s.credentials="include":r.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function i(r){if(r.ep)return;r.ep=!0;const s=n(r);fetch(r.href,s)}})();function Sg(t){return t&&t.__esModule&&Object.prototype.hasOwnProperty.call(t,"default")?t.default:t}var Mg={exports:{}},rc={},Eg={exports:{}},ze={};/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var to=Symbol.for("react.element"),C_=Symbol.for("react.portal"),R_=Symbol.for("react.fragment"),b_=Symbol.for("react.strict_mode"),P_=Symbol.for("react.profiler"),L_=Symbol.for("react.provider"),D_=Symbol.for("react.context"),N_=Symbol.for("react.forward_ref"),I_=Symbol.for("react.suspense"),U_=Symbol.for("react.memo"),k_=Symbol.for("react.lazy"),Xf=Symbol.iterator;function F_(t){return t===null||typeof t!="object"?null:(t=Xf&&t[Xf]||t["@@iterator"],typeof t=="function"?t:null)}var wg={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},Tg=Object.assign,Ag={};function Js(t,e,n){this.props=t,this.context=e,this.refs=Ag,this.updater=n||wg}Js.prototype.isReactComponent={};Js.prototype.setState=function(t,e){if(typeof t!="object"&&typeof t!="function"&&t!=null)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,t,e,"setState")};Js.prototype.forceUpdate=function(t){this.updater.enqueueForceUpdate(this,t,"forceUpdate")};function Cg(){}Cg.prototype=Js.prototype;function wh(t,e,n){this.props=t,this.context=e,this.refs=Ag,this.updater=n||wg}var Th=wh.prototype=new Cg;Th.constructor=wh;Tg(Th,Js.prototype);Th.isPureReactComponent=!0;var $f=Array.isArray,Rg=Object.prototype.hasOwnProperty,Ah={current:null},bg={key:!0,ref:!0,__self:!0,__source:!0};function Pg(t,e,n){var i,r={},s=null,a=null;if(e!=null)for(i in e.ref!==void 0&&(a=e.ref),e.key!==void 0&&(s=""+e.key),e)Rg.call(e,i)&&!bg.hasOwnProperty(i)&&(r[i]=e[i]);var o=arguments.length-2;if(o===1)r.children=n;else if(1<o){for(var l=Array(o),c=0;c<o;c++)l[c]=arguments[c+2];r.children=l}if(t&&t.defaultProps)for(i in o=t.defaultProps,o)r[i]===void 0&&(r[i]=o[i]);return{$$typeof:to,type:t,key:s,ref:a,props:r,_owner:Ah.current}}function O_(t,e){return{$$typeof:to,type:t.type,key:e,ref:t.ref,props:t.props,_owner:t._owner}}function Ch(t){return typeof t=="object"&&t!==null&&t.$$typeof===to}function z_(t){var e={"=":"=0",":":"=2"};return"$"+t.replace(/[=:]/g,function(n){return e[n]})}var Yf=/\/+/g;function Dc(t,e){return typeof t=="object"&&t!==null&&t.key!=null?z_(""+t.key):e.toString(36)}function il(t,e,n,i,r){var s=typeof t;(s==="undefined"||s==="boolean")&&(t=null);var a=!1;if(t===null)a=!0;else switch(s){case"string":case"number":a=!0;break;case"object":switch(t.$$typeof){case to:case C_:a=!0}}if(a)return a=t,r=r(a),t=i===""?"."+Dc(a,0):i,$f(r)?(n="",t!=null&&(n=t.replace(Yf,"$&/")+"/"),il(r,e,n,"",function(c){return c})):r!=null&&(Ch(r)&&(r=O_(r,n+(!r.key||a&&a.key===r.key?"":(""+r.key).replace(Yf,"$&/")+"/")+t)),e.push(r)),1;if(a=0,i=i===""?".":i+":",$f(t))for(var o=0;o<t.length;o++){s=t[o];var l=i+Dc(s,o);a+=il(s,e,n,l,r)}else if(l=F_(t),typeof l=="function")for(t=l.call(t),o=0;!(s=t.next()).done;)s=s.value,l=i+Dc(s,o++),a+=il(s,e,n,l,r);else if(s==="object")throw e=String(t),Error("Objects are not valid as a React child (found: "+(e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e)+"). If you meant to render a collection of children, use an array instead.");return a}function ho(t,e,n){if(t==null)return t;var i=[],r=0;return il(t,i,"","",function(s){return e.call(n,s,r++)}),i}function B_(t){if(t._status===-1){var e=t._result;e=e(),e.then(function(n){(t._status===0||t._status===-1)&&(t._status=1,t._result=n)},function(n){(t._status===0||t._status===-1)&&(t._status=2,t._result=n)}),t._status===-1&&(t._status=0,t._result=e)}if(t._status===1)return t._result.default;throw t._result}var en={current:null},rl={transition:null},H_={ReactCurrentDispatcher:en,ReactCurrentBatchConfig:rl,ReactCurrentOwner:Ah};function Lg(){throw Error("act(...) is not supported in production builds of React.")}ze.Children={map:ho,forEach:function(t,e,n){ho(t,function(){e.apply(this,arguments)},n)},count:function(t){var e=0;return ho(t,function(){e++}),e},toArray:function(t){return ho(t,function(e){return e})||[]},only:function(t){if(!Ch(t))throw Error("React.Children.only expected to receive a single React element child.");return t}};ze.Component=Js;ze.Fragment=R_;ze.Profiler=P_;ze.PureComponent=wh;ze.StrictMode=b_;ze.Suspense=I_;ze.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=H_;ze.act=Lg;ze.cloneElement=function(t,e,n){if(t==null)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+t+".");var i=Tg({},t.props),r=t.key,s=t.ref,a=t._owner;if(e!=null){if(e.ref!==void 0&&(s=e.ref,a=Ah.current),e.key!==void 0&&(r=""+e.key),t.type&&t.type.defaultProps)var o=t.type.defaultProps;for(l in e)Rg.call(e,l)&&!bg.hasOwnProperty(l)&&(i[l]=e[l]===void 0&&o!==void 0?o[l]:e[l])}var l=arguments.length-2;if(l===1)i.children=n;else if(1<l){o=Array(l);for(var c=0;c<l;c++)o[c]=arguments[c+2];i.children=o}return{$$typeof:to,type:t.type,key:r,ref:s,props:i,_owner:a}};ze.createContext=function(t){return t={$$typeof:D_,_currentValue:t,_currentValue2:t,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},t.Provider={$$typeof:L_,_context:t},t.Consumer=t};ze.createElement=Pg;ze.createFactory=function(t){var e=Pg.bind(null,t);return e.type=t,e};ze.createRef=function(){return{current:null}};ze.forwardRef=function(t){return{$$typeof:N_,render:t}};ze.isValidElement=Ch;ze.lazy=function(t){return{$$typeof:k_,_payload:{_status:-1,_result:t},_init:B_}};ze.memo=function(t,e){return{$$typeof:U_,type:t,compare:e===void 0?null:e}};ze.startTransition=function(t){var e=rl.transition;rl.transition={};try{t()}finally{rl.transition=e}};ze.unstable_act=Lg;ze.useCallback=function(t,e){return en.current.useCallback(t,e)};ze.useContext=function(t){return en.current.useContext(t)};ze.useDebugValue=function(){};ze.useDeferredValue=function(t){return en.current.useDeferredValue(t)};ze.useEffect=function(t,e){return en.current.useEffect(t,e)};ze.useId=function(){return en.current.useId()};ze.useImperativeHandle=function(t,e,n){return en.current.useImperativeHandle(t,e,n)};ze.useInsertionEffect=function(t,e){return en.current.useInsertionEffect(t,e)};ze.useLayoutEffect=function(t,e){return en.current.useLayoutEffect(t,e)};ze.useMemo=function(t,e){return en.current.useMemo(t,e)};ze.useReducer=function(t,e,n){return en.current.useReducer(t,e,n)};ze.useRef=function(t){return en.current.useRef(t)};ze.useState=function(t){return en.current.useState(t)};ze.useSyncExternalStore=function(t,e,n){return en.current.useSyncExternalStore(t,e,n)};ze.useTransition=function(){return en.current.useTransition()};ze.version="18.3.1";Eg.exports=ze;var St=Eg.exports;const V_=Sg(St);/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var G_=St,W_=Symbol.for("react.element"),j_=Symbol.for("react.fragment"),X_=Object.prototype.hasOwnProperty,$_=G_.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,Y_={key:!0,ref:!0,__self:!0,__source:!0};function Dg(t,e,n){var i,r={},s=null,a=null;n!==void 0&&(s=""+n),e.key!==void 0&&(s=""+e.key),e.ref!==void 0&&(a=e.ref);for(i in e)X_.call(e,i)&&!Y_.hasOwnProperty(i)&&(r[i]=e[i]);if(t&&t.defaultProps)for(i in e=t.defaultProps,e)r[i]===void 0&&(r[i]=e[i]);return{$$typeof:W_,type:t,key:s,ref:a,props:r,_owner:$_.current}}rc.Fragment=j_;rc.jsx=Dg;rc.jsxs=Dg;Mg.exports=rc;var M=Mg.exports,Ng={exports:{}},An={},Ig={exports:{}},Ug={};/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */(function(t){function e(L,Y){var $=L.length;L.push(Y);e:for(;0<$;){var ne=$-1>>>1,ye=L[ne];if(0<r(ye,Y))L[ne]=Y,L[$]=ye,$=ne;else break e}}function n(L){return L.length===0?null:L[0]}function i(L){if(L.length===0)return null;var Y=L[0],$=L.pop();if($!==Y){L[0]=$;e:for(var ne=0,ye=L.length,Ie=ye>>>1;ne<Ie;){var j=2*(ne+1)-1,ie=L[j],he=j+1,ce=L[he];if(0>r(ie,$))he<ye&&0>r(ce,ie)?(L[ne]=ce,L[he]=$,ne=he):(L[ne]=ie,L[j]=$,ne=j);else if(he<ye&&0>r(ce,$))L[ne]=ce,L[he]=$,ne=he;else break e}}return Y}function r(L,Y){var $=L.sortIndex-Y.sortIndex;return $!==0?$:L.id-Y.id}if(typeof performance=="object"&&typeof performance.now=="function"){var s=performance;t.unstable_now=function(){return s.now()}}else{var a=Date,o=a.now();t.unstable_now=function(){return a.now()-o}}var l=[],c=[],u=1,h=null,f=3,p=!1,_=!1,y=!1,m=typeof setTimeout=="function"?setTimeout:null,d=typeof clearTimeout=="function"?clearTimeout:null,g=typeof setImmediate<"u"?setImmediate:null;typeof navigator<"u"&&navigator.scheduling!==void 0&&navigator.scheduling.isInputPending!==void 0&&navigator.scheduling.isInputPending.bind(navigator.scheduling);function v(L){for(var Y=n(c);Y!==null;){if(Y.callback===null)i(c);else if(Y.startTime<=L)i(c),Y.sortIndex=Y.expirationTime,e(l,Y);else break;Y=n(c)}}function S(L){if(y=!1,v(L),!_)if(n(l)!==null)_=!0,z(b);else{var Y=n(c);Y!==null&&J(S,Y.startTime-L)}}function b(L,Y){_=!1,y&&(y=!1,d(P),P=-1),p=!0;var $=f;try{for(v(Y),h=n(l);h!==null&&(!(h.expirationTime>Y)||L&&!w());){var ne=h.callback;if(typeof ne=="function"){h.callback=null,f=h.priorityLevel;var ye=ne(h.expirationTime<=Y);Y=t.unstable_now(),typeof ye=="function"?h.callback=ye:h===n(l)&&i(l),v(Y)}else i(l);h=n(l)}if(h!==null)var Ie=!0;else{var j=n(c);j!==null&&J(S,j.startTime-Y),Ie=!1}return Ie}finally{h=null,f=$,p=!1}}var C=!1,A=null,P=-1,V=5,x=-1;function w(){return!(t.unstable_now()-x<V)}function O(){if(A!==null){var L=t.unstable_now();x=L;var Y=!0;try{Y=A(!0,L)}finally{Y?F():(C=!1,A=null)}}else C=!1}var F;if(typeof g=="function")F=function(){g(O)};else if(typeof MessageChannel<"u"){var W=new MessageChannel,q=W.port2;W.port1.onmessage=O,F=function(){q.postMessage(null)}}else F=function(){m(O,0)};function z(L){A=L,C||(C=!0,F())}function J(L,Y){P=m(function(){L(t.unstable_now())},Y)}t.unstable_IdlePriority=5,t.unstable_ImmediatePriority=1,t.unstable_LowPriority=4,t.unstable_NormalPriority=3,t.unstable_Profiling=null,t.unstable_UserBlockingPriority=2,t.unstable_cancelCallback=function(L){L.callback=null},t.unstable_continueExecution=function(){_||p||(_=!0,z(b))},t.unstable_forceFrameRate=function(L){0>L||125<L?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):V=0<L?Math.floor(1e3/L):5},t.unstable_getCurrentPriorityLevel=function(){return f},t.unstable_getFirstCallbackNode=function(){return n(l)},t.unstable_next=function(L){switch(f){case 1:case 2:case 3:var Y=3;break;default:Y=f}var $=f;f=Y;try{return L()}finally{f=$}},t.unstable_pauseExecution=function(){},t.unstable_requestPaint=function(){},t.unstable_runWithPriority=function(L,Y){switch(L){case 1:case 2:case 3:case 4:case 5:break;default:L=3}var $=f;f=L;try{return Y()}finally{f=$}},t.unstable_scheduleCallback=function(L,Y,$){var ne=t.unstable_now();switch(typeof $=="object"&&$!==null?($=$.delay,$=typeof $=="number"&&0<$?ne+$:ne):$=ne,L){case 1:var ye=-1;break;case 2:ye=250;break;case 5:ye=1073741823;break;case 4:ye=1e4;break;default:ye=5e3}return ye=$+ye,L={id:u++,callback:Y,priorityLevel:L,startTime:$,expirationTime:ye,sortIndex:-1},$>ne?(L.sortIndex=$,e(c,L),n(l)===null&&L===n(c)&&(y?(d(P),P=-1):y=!0,J(S,$-ne))):(L.sortIndex=ye,e(l,L),_||p||(_=!0,z(b))),L},t.unstable_shouldYield=w,t.unstable_wrapCallback=function(L){var Y=f;return function(){var $=f;f=Y;try{return L.apply(this,arguments)}finally{f=$}}}})(Ug);Ig.exports=Ug;var q_=Ig.exports;/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var K_=St,Tn=q_;function te(t){for(var e="https://reactjs.org/docs/error-decoder.html?invariant="+t,n=1;n<arguments.length;n++)e+="&args[]="+encodeURIComponent(arguments[n]);return"Minified React error #"+t+"; visit "+e+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}var kg=new Set,ka={};function Wr(t,e){Os(t,e),Os(t+"Capture",e)}function Os(t,e){for(ka[t]=e,t=0;t<e.length;t++)kg.add(e[t])}var Ai=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),Vu=Object.prototype.hasOwnProperty,Z_=/^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,qf={},Kf={};function Q_(t){return Vu.call(Kf,t)?!0:Vu.call(qf,t)?!1:Z_.test(t)?Kf[t]=!0:(qf[t]=!0,!1)}function J_(t,e,n,i){if(n!==null&&n.type===0)return!1;switch(typeof e){case"function":case"symbol":return!0;case"boolean":return i?!1:n!==null?!n.acceptsBooleans:(t=t.toLowerCase().slice(0,5),t!=="data-"&&t!=="aria-");default:return!1}}function ex(t,e,n,i){if(e===null||typeof e>"u"||J_(t,e,n,i))return!0;if(i)return!1;if(n!==null)switch(n.type){case 3:return!e;case 4:return e===!1;case 5:return isNaN(e);case 6:return isNaN(e)||1>e}return!1}function tn(t,e,n,i,r,s,a){this.acceptsBooleans=e===2||e===3||e===4,this.attributeName=i,this.attributeNamespace=r,this.mustUseProperty=n,this.propertyName=t,this.type=e,this.sanitizeURL=s,this.removeEmptyString=a}var Ht={};"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(t){Ht[t]=new tn(t,0,!1,t,null,!1,!1)});[["acceptCharset","accept-charset"],["className","class"],["htmlFor","for"],["httpEquiv","http-equiv"]].forEach(function(t){var e=t[0];Ht[e]=new tn(e,1,!1,t[1],null,!1,!1)});["contentEditable","draggable","spellCheck","value"].forEach(function(t){Ht[t]=new tn(t,2,!1,t.toLowerCase(),null,!1,!1)});["autoReverse","externalResourcesRequired","focusable","preserveAlpha"].forEach(function(t){Ht[t]=new tn(t,2,!1,t,null,!1,!1)});"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(t){Ht[t]=new tn(t,3,!1,t.toLowerCase(),null,!1,!1)});["checked","multiple","muted","selected"].forEach(function(t){Ht[t]=new tn(t,3,!0,t,null,!1,!1)});["capture","download"].forEach(function(t){Ht[t]=new tn(t,4,!1,t,null,!1,!1)});["cols","rows","size","span"].forEach(function(t){Ht[t]=new tn(t,6,!1,t,null,!1,!1)});["rowSpan","start"].forEach(function(t){Ht[t]=new tn(t,5,!1,t.toLowerCase(),null,!1,!1)});var Rh=/[\-:]([a-z])/g;function bh(t){return t[1].toUpperCase()}"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(t){var e=t.replace(Rh,bh);Ht[e]=new tn(e,1,!1,t,null,!1,!1)});"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(t){var e=t.replace(Rh,bh);Ht[e]=new tn(e,1,!1,t,"http://www.w3.org/1999/xlink",!1,!1)});["xml:base","xml:lang","xml:space"].forEach(function(t){var e=t.replace(Rh,bh);Ht[e]=new tn(e,1,!1,t,"http://www.w3.org/XML/1998/namespace",!1,!1)});["tabIndex","crossOrigin"].forEach(function(t){Ht[t]=new tn(t,1,!1,t.toLowerCase(),null,!1,!1)});Ht.xlinkHref=new tn("xlinkHref",1,!1,"xlink:href","http://www.w3.org/1999/xlink",!0,!1);["src","href","action","formAction"].forEach(function(t){Ht[t]=new tn(t,1,!1,t.toLowerCase(),null,!0,!0)});function Ph(t,e,n,i){var r=Ht.hasOwnProperty(e)?Ht[e]:null;(r!==null?r.type!==0:i||!(2<e.length)||e[0]!=="o"&&e[0]!=="O"||e[1]!=="n"&&e[1]!=="N")&&(ex(e,n,r,i)&&(n=null),i||r===null?Q_(e)&&(n===null?t.removeAttribute(e):t.setAttribute(e,""+n)):r.mustUseProperty?t[r.propertyName]=n===null?r.type===3?!1:"":n:(e=r.attributeName,i=r.attributeNamespace,n===null?t.removeAttribute(e):(r=r.type,n=r===3||r===4&&n===!0?"":""+n,i?t.setAttributeNS(i,e,n):t.setAttribute(e,n))))}var Di=K_.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,fo=Symbol.for("react.element"),fs=Symbol.for("react.portal"),ps=Symbol.for("react.fragment"),Lh=Symbol.for("react.strict_mode"),Gu=Symbol.for("react.profiler"),Fg=Symbol.for("react.provider"),Og=Symbol.for("react.context"),Dh=Symbol.for("react.forward_ref"),Wu=Symbol.for("react.suspense"),ju=Symbol.for("react.suspense_list"),Nh=Symbol.for("react.memo"),Hi=Symbol.for("react.lazy"),zg=Symbol.for("react.offscreen"),Zf=Symbol.iterator;function ra(t){return t===null||typeof t!="object"?null:(t=Zf&&t[Zf]||t["@@iterator"],typeof t=="function"?t:null)}var mt=Object.assign,Nc;function Sa(t){if(Nc===void 0)try{throw Error()}catch(n){var e=n.stack.trim().match(/\n( *(at )?)/);Nc=e&&e[1]||""}return`
`+Nc+t}var Ic=!1;function Uc(t,e){if(!t||Ic)return"";Ic=!0;var n=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{if(e)if(e=function(){throw Error()},Object.defineProperty(e.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(e,[])}catch(c){var i=c}Reflect.construct(t,[],e)}else{try{e.call()}catch(c){i=c}t.call(e.prototype)}else{try{throw Error()}catch(c){i=c}t()}}catch(c){if(c&&i&&typeof c.stack=="string"){for(var r=c.stack.split(`
`),s=i.stack.split(`
`),a=r.length-1,o=s.length-1;1<=a&&0<=o&&r[a]!==s[o];)o--;for(;1<=a&&0<=o;a--,o--)if(r[a]!==s[o]){if(a!==1||o!==1)do if(a--,o--,0>o||r[a]!==s[o]){var l=`
`+r[a].replace(" at new "," at ");return t.displayName&&l.includes("<anonymous>")&&(l=l.replace("<anonymous>",t.displayName)),l}while(1<=a&&0<=o);break}}}finally{Ic=!1,Error.prepareStackTrace=n}return(t=t?t.displayName||t.name:"")?Sa(t):""}function tx(t){switch(t.tag){case 5:return Sa(t.type);case 16:return Sa("Lazy");case 13:return Sa("Suspense");case 19:return Sa("SuspenseList");case 0:case 2:case 15:return t=Uc(t.type,!1),t;case 11:return t=Uc(t.type.render,!1),t;case 1:return t=Uc(t.type,!0),t;default:return""}}function Xu(t){if(t==null)return null;if(typeof t=="function")return t.displayName||t.name||null;if(typeof t=="string")return t;switch(t){case ps:return"Fragment";case fs:return"Portal";case Gu:return"Profiler";case Lh:return"StrictMode";case Wu:return"Suspense";case ju:return"SuspenseList"}if(typeof t=="object")switch(t.$$typeof){case Og:return(t.displayName||"Context")+".Consumer";case Fg:return(t._context.displayName||"Context")+".Provider";case Dh:var e=t.render;return t=t.displayName,t||(t=e.displayName||e.name||"",t=t!==""?"ForwardRef("+t+")":"ForwardRef"),t;case Nh:return e=t.displayName||null,e!==null?e:Xu(t.type)||"Memo";case Hi:e=t._payload,t=t._init;try{return Xu(t(e))}catch{}}return null}function nx(t){var e=t.type;switch(t.tag){case 24:return"Cache";case 9:return(e.displayName||"Context")+".Consumer";case 10:return(e._context.displayName||"Context")+".Provider";case 18:return"DehydratedFragment";case 11:return t=e.render,t=t.displayName||t.name||"",e.displayName||(t!==""?"ForwardRef("+t+")":"ForwardRef");case 7:return"Fragment";case 5:return e;case 4:return"Portal";case 3:return"Root";case 6:return"Text";case 16:return Xu(e);case 8:return e===Lh?"StrictMode":"Mode";case 22:return"Offscreen";case 12:return"Profiler";case 21:return"Scope";case 13:return"Suspense";case 19:return"SuspenseList";case 25:return"TracingMarker";case 1:case 0:case 17:case 2:case 14:case 15:if(typeof e=="function")return e.displayName||e.name||null;if(typeof e=="string")return e}return null}function or(t){switch(typeof t){case"boolean":case"number":case"string":case"undefined":return t;case"object":return t;default:return""}}function Bg(t){var e=t.type;return(t=t.nodeName)&&t.toLowerCase()==="input"&&(e==="checkbox"||e==="radio")}function ix(t){var e=Bg(t)?"checked":"value",n=Object.getOwnPropertyDescriptor(t.constructor.prototype,e),i=""+t[e];if(!t.hasOwnProperty(e)&&typeof n<"u"&&typeof n.get=="function"&&typeof n.set=="function"){var r=n.get,s=n.set;return Object.defineProperty(t,e,{configurable:!0,get:function(){return r.call(this)},set:function(a){i=""+a,s.call(this,a)}}),Object.defineProperty(t,e,{enumerable:n.enumerable}),{getValue:function(){return i},setValue:function(a){i=""+a},stopTracking:function(){t._valueTracker=null,delete t[e]}}}}function po(t){t._valueTracker||(t._valueTracker=ix(t))}function Hg(t){if(!t)return!1;var e=t._valueTracker;if(!e)return!0;var n=e.getValue(),i="";return t&&(i=Bg(t)?t.checked?"true":"false":t.value),t=i,t!==n?(e.setValue(t),!0):!1}function wl(t){if(t=t||(typeof document<"u"?document:void 0),typeof t>"u")return null;try{return t.activeElement||t.body}catch{return t.body}}function $u(t,e){var n=e.checked;return mt({},e,{defaultChecked:void 0,defaultValue:void 0,value:void 0,checked:n??t._wrapperState.initialChecked})}function Qf(t,e){var n=e.defaultValue==null?"":e.defaultValue,i=e.checked!=null?e.checked:e.defaultChecked;n=or(e.value!=null?e.value:n),t._wrapperState={initialChecked:i,initialValue:n,controlled:e.type==="checkbox"||e.type==="radio"?e.checked!=null:e.value!=null}}function Vg(t,e){e=e.checked,e!=null&&Ph(t,"checked",e,!1)}function Yu(t,e){Vg(t,e);var n=or(e.value),i=e.type;if(n!=null)i==="number"?(n===0&&t.value===""||t.value!=n)&&(t.value=""+n):t.value!==""+n&&(t.value=""+n);else if(i==="submit"||i==="reset"){t.removeAttribute("value");return}e.hasOwnProperty("value")?qu(t,e.type,n):e.hasOwnProperty("defaultValue")&&qu(t,e.type,or(e.defaultValue)),e.checked==null&&e.defaultChecked!=null&&(t.defaultChecked=!!e.defaultChecked)}function Jf(t,e,n){if(e.hasOwnProperty("value")||e.hasOwnProperty("defaultValue")){var i=e.type;if(!(i!=="submit"&&i!=="reset"||e.value!==void 0&&e.value!==null))return;e=""+t._wrapperState.initialValue,n||e===t.value||(t.value=e),t.defaultValue=e}n=t.name,n!==""&&(t.name=""),t.defaultChecked=!!t._wrapperState.initialChecked,n!==""&&(t.name=n)}function qu(t,e,n){(e!=="number"||wl(t.ownerDocument)!==t)&&(n==null?t.defaultValue=""+t._wrapperState.initialValue:t.defaultValue!==""+n&&(t.defaultValue=""+n))}var Ma=Array.isArray;function Rs(t,e,n,i){if(t=t.options,e){e={};for(var r=0;r<n.length;r++)e["$"+n[r]]=!0;for(n=0;n<t.length;n++)r=e.hasOwnProperty("$"+t[n].value),t[n].selected!==r&&(t[n].selected=r),r&&i&&(t[n].defaultSelected=!0)}else{for(n=""+or(n),e=null,r=0;r<t.length;r++){if(t[r].value===n){t[r].selected=!0,i&&(t[r].defaultSelected=!0);return}e!==null||t[r].disabled||(e=t[r])}e!==null&&(e.selected=!0)}}function Ku(t,e){if(e.dangerouslySetInnerHTML!=null)throw Error(te(91));return mt({},e,{value:void 0,defaultValue:void 0,children:""+t._wrapperState.initialValue})}function ep(t,e){var n=e.value;if(n==null){if(n=e.children,e=e.defaultValue,n!=null){if(e!=null)throw Error(te(92));if(Ma(n)){if(1<n.length)throw Error(te(93));n=n[0]}e=n}e==null&&(e=""),n=e}t._wrapperState={initialValue:or(n)}}function Gg(t,e){var n=or(e.value),i=or(e.defaultValue);n!=null&&(n=""+n,n!==t.value&&(t.value=n),e.defaultValue==null&&t.defaultValue!==n&&(t.defaultValue=n)),i!=null&&(t.defaultValue=""+i)}function tp(t){var e=t.textContent;e===t._wrapperState.initialValue&&e!==""&&e!==null&&(t.value=e)}function Wg(t){switch(t){case"svg":return"http://www.w3.org/2000/svg";case"math":return"http://www.w3.org/1998/Math/MathML";default:return"http://www.w3.org/1999/xhtml"}}function Zu(t,e){return t==null||t==="http://www.w3.org/1999/xhtml"?Wg(e):t==="http://www.w3.org/2000/svg"&&e==="foreignObject"?"http://www.w3.org/1999/xhtml":t}var mo,jg=function(t){return typeof MSApp<"u"&&MSApp.execUnsafeLocalFunction?function(e,n,i,r){MSApp.execUnsafeLocalFunction(function(){return t(e,n,i,r)})}:t}(function(t,e){if(t.namespaceURI!=="http://www.w3.org/2000/svg"||"innerHTML"in t)t.innerHTML=e;else{for(mo=mo||document.createElement("div"),mo.innerHTML="<svg>"+e.valueOf().toString()+"</svg>",e=mo.firstChild;t.firstChild;)t.removeChild(t.firstChild);for(;e.firstChild;)t.appendChild(e.firstChild)}});function Fa(t,e){if(e){var n=t.firstChild;if(n&&n===t.lastChild&&n.nodeType===3){n.nodeValue=e;return}}t.textContent=e}var Aa={animationIterationCount:!0,aspectRatio:!0,borderImageOutset:!0,borderImageSlice:!0,borderImageWidth:!0,boxFlex:!0,boxFlexGroup:!0,boxOrdinalGroup:!0,columnCount:!0,columns:!0,flex:!0,flexGrow:!0,flexPositive:!0,flexShrink:!0,flexNegative:!0,flexOrder:!0,gridArea:!0,gridRow:!0,gridRowEnd:!0,gridRowSpan:!0,gridRowStart:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnSpan:!0,gridColumnStart:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,tabSize:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeDasharray:!0,strokeDashoffset:!0,strokeMiterlimit:!0,strokeOpacity:!0,strokeWidth:!0},rx=["Webkit","ms","Moz","O"];Object.keys(Aa).forEach(function(t){rx.forEach(function(e){e=e+t.charAt(0).toUpperCase()+t.substring(1),Aa[e]=Aa[t]})});function Xg(t,e,n){return e==null||typeof e=="boolean"||e===""?"":n||typeof e!="number"||e===0||Aa.hasOwnProperty(t)&&Aa[t]?(""+e).trim():e+"px"}function $g(t,e){t=t.style;for(var n in e)if(e.hasOwnProperty(n)){var i=n.indexOf("--")===0,r=Xg(n,e[n],i);n==="float"&&(n="cssFloat"),i?t.setProperty(n,r):t[n]=r}}var sx=mt({menuitem:!0},{area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0});function Qu(t,e){if(e){if(sx[t]&&(e.children!=null||e.dangerouslySetInnerHTML!=null))throw Error(te(137,t));if(e.dangerouslySetInnerHTML!=null){if(e.children!=null)throw Error(te(60));if(typeof e.dangerouslySetInnerHTML!="object"||!("__html"in e.dangerouslySetInnerHTML))throw Error(te(61))}if(e.style!=null&&typeof e.style!="object")throw Error(te(62))}}function Ju(t,e){if(t.indexOf("-")===-1)return typeof e.is=="string";switch(t){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var ed=null;function Ih(t){return t=t.target||t.srcElement||window,t.correspondingUseElement&&(t=t.correspondingUseElement),t.nodeType===3?t.parentNode:t}var td=null,bs=null,Ps=null;function np(t){if(t=ro(t)){if(typeof td!="function")throw Error(te(280));var e=t.stateNode;e&&(e=cc(e),td(t.stateNode,t.type,e))}}function Yg(t){bs?Ps?Ps.push(t):Ps=[t]:bs=t}function qg(){if(bs){var t=bs,e=Ps;if(Ps=bs=null,np(t),e)for(t=0;t<e.length;t++)np(e[t])}}function Kg(t,e){return t(e)}function Zg(){}var kc=!1;function Qg(t,e,n){if(kc)return t(e,n);kc=!0;try{return Kg(t,e,n)}finally{kc=!1,(bs!==null||Ps!==null)&&(Zg(),qg())}}function Oa(t,e){var n=t.stateNode;if(n===null)return null;var i=cc(n);if(i===null)return null;n=i[e];e:switch(e){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(i=!i.disabled)||(t=t.type,i=!(t==="button"||t==="input"||t==="select"||t==="textarea")),t=!i;break e;default:t=!1}if(t)return null;if(n&&typeof n!="function")throw Error(te(231,e,typeof n));return n}var nd=!1;if(Ai)try{var sa={};Object.defineProperty(sa,"passive",{get:function(){nd=!0}}),window.addEventListener("test",sa,sa),window.removeEventListener("test",sa,sa)}catch{nd=!1}function ax(t,e,n,i,r,s,a,o,l){var c=Array.prototype.slice.call(arguments,3);try{e.apply(n,c)}catch(u){this.onError(u)}}var Ca=!1,Tl=null,Al=!1,id=null,ox={onError:function(t){Ca=!0,Tl=t}};function lx(t,e,n,i,r,s,a,o,l){Ca=!1,Tl=null,ax.apply(ox,arguments)}function cx(t,e,n,i,r,s,a,o,l){if(lx.apply(this,arguments),Ca){if(Ca){var c=Tl;Ca=!1,Tl=null}else throw Error(te(198));Al||(Al=!0,id=c)}}function jr(t){var e=t,n=t;if(t.alternate)for(;e.return;)e=e.return;else{t=e;do e=t,e.flags&4098&&(n=e.return),t=e.return;while(t)}return e.tag===3?n:null}function Jg(t){if(t.tag===13){var e=t.memoizedState;if(e===null&&(t=t.alternate,t!==null&&(e=t.memoizedState)),e!==null)return e.dehydrated}return null}function ip(t){if(jr(t)!==t)throw Error(te(188))}function ux(t){var e=t.alternate;if(!e){if(e=jr(t),e===null)throw Error(te(188));return e!==t?null:t}for(var n=t,i=e;;){var r=n.return;if(r===null)break;var s=r.alternate;if(s===null){if(i=r.return,i!==null){n=i;continue}break}if(r.child===s.child){for(s=r.child;s;){if(s===n)return ip(r),t;if(s===i)return ip(r),e;s=s.sibling}throw Error(te(188))}if(n.return!==i.return)n=r,i=s;else{for(var a=!1,o=r.child;o;){if(o===n){a=!0,n=r,i=s;break}if(o===i){a=!0,i=r,n=s;break}o=o.sibling}if(!a){for(o=s.child;o;){if(o===n){a=!0,n=s,i=r;break}if(o===i){a=!0,i=s,n=r;break}o=o.sibling}if(!a)throw Error(te(189))}}if(n.alternate!==i)throw Error(te(190))}if(n.tag!==3)throw Error(te(188));return n.stateNode.current===n?t:e}function e0(t){return t=ux(t),t!==null?t0(t):null}function t0(t){if(t.tag===5||t.tag===6)return t;for(t=t.child;t!==null;){var e=t0(t);if(e!==null)return e;t=t.sibling}return null}var n0=Tn.unstable_scheduleCallback,rp=Tn.unstable_cancelCallback,dx=Tn.unstable_shouldYield,hx=Tn.unstable_requestPaint,yt=Tn.unstable_now,fx=Tn.unstable_getCurrentPriorityLevel,Uh=Tn.unstable_ImmediatePriority,i0=Tn.unstable_UserBlockingPriority,Cl=Tn.unstable_NormalPriority,px=Tn.unstable_LowPriority,r0=Tn.unstable_IdlePriority,sc=null,si=null;function mx(t){if(si&&typeof si.onCommitFiberRoot=="function")try{si.onCommitFiberRoot(sc,t,void 0,(t.current.flags&128)===128)}catch{}}var $n=Math.clz32?Math.clz32:_x,gx=Math.log,vx=Math.LN2;function _x(t){return t>>>=0,t===0?32:31-(gx(t)/vx|0)|0}var go=64,vo=4194304;function Ea(t){switch(t&-t){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t&4194240;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return t&130023424;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 1073741824;default:return t}}function Rl(t,e){var n=t.pendingLanes;if(n===0)return 0;var i=0,r=t.suspendedLanes,s=t.pingedLanes,a=n&268435455;if(a!==0){var o=a&~r;o!==0?i=Ea(o):(s&=a,s!==0&&(i=Ea(s)))}else a=n&~r,a!==0?i=Ea(a):s!==0&&(i=Ea(s));if(i===0)return 0;if(e!==0&&e!==i&&!(e&r)&&(r=i&-i,s=e&-e,r>=s||r===16&&(s&4194240)!==0))return e;if(i&4&&(i|=n&16),e=t.entangledLanes,e!==0)for(t=t.entanglements,e&=i;0<e;)n=31-$n(e),r=1<<n,i|=t[n],e&=~r;return i}function xx(t,e){switch(t){case 1:case 2:case 4:return e+250;case 8:case 16:case 32:case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return e+5e3;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return-1;case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function yx(t,e){for(var n=t.suspendedLanes,i=t.pingedLanes,r=t.expirationTimes,s=t.pendingLanes;0<s;){var a=31-$n(s),o=1<<a,l=r[a];l===-1?(!(o&n)||o&i)&&(r[a]=xx(o,e)):l<=e&&(t.expiredLanes|=o),s&=~o}}function rd(t){return t=t.pendingLanes&-1073741825,t!==0?t:t&1073741824?1073741824:0}function s0(){var t=go;return go<<=1,!(go&4194240)&&(go=64),t}function Fc(t){for(var e=[],n=0;31>n;n++)e.push(t);return e}function no(t,e,n){t.pendingLanes|=e,e!==536870912&&(t.suspendedLanes=0,t.pingedLanes=0),t=t.eventTimes,e=31-$n(e),t[e]=n}function Sx(t,e){var n=t.pendingLanes&~e;t.pendingLanes=e,t.suspendedLanes=0,t.pingedLanes=0,t.expiredLanes&=e,t.mutableReadLanes&=e,t.entangledLanes&=e,e=t.entanglements;var i=t.eventTimes;for(t=t.expirationTimes;0<n;){var r=31-$n(n),s=1<<r;e[r]=0,i[r]=-1,t[r]=-1,n&=~s}}function kh(t,e){var n=t.entangledLanes|=e;for(t=t.entanglements;n;){var i=31-$n(n),r=1<<i;r&e|t[i]&e&&(t[i]|=e),n&=~r}}var tt=0;function a0(t){return t&=-t,1<t?4<t?t&268435455?16:536870912:4:1}var o0,Fh,l0,c0,u0,sd=!1,_o=[],Zi=null,Qi=null,Ji=null,za=new Map,Ba=new Map,Gi=[],Mx="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");function sp(t,e){switch(t){case"focusin":case"focusout":Zi=null;break;case"dragenter":case"dragleave":Qi=null;break;case"mouseover":case"mouseout":Ji=null;break;case"pointerover":case"pointerout":za.delete(e.pointerId);break;case"gotpointercapture":case"lostpointercapture":Ba.delete(e.pointerId)}}function aa(t,e,n,i,r,s){return t===null||t.nativeEvent!==s?(t={blockedOn:e,domEventName:n,eventSystemFlags:i,nativeEvent:s,targetContainers:[r]},e!==null&&(e=ro(e),e!==null&&Fh(e)),t):(t.eventSystemFlags|=i,e=t.targetContainers,r!==null&&e.indexOf(r)===-1&&e.push(r),t)}function Ex(t,e,n,i,r){switch(e){case"focusin":return Zi=aa(Zi,t,e,n,i,r),!0;case"dragenter":return Qi=aa(Qi,t,e,n,i,r),!0;case"mouseover":return Ji=aa(Ji,t,e,n,i,r),!0;case"pointerover":var s=r.pointerId;return za.set(s,aa(za.get(s)||null,t,e,n,i,r)),!0;case"gotpointercapture":return s=r.pointerId,Ba.set(s,aa(Ba.get(s)||null,t,e,n,i,r)),!0}return!1}function d0(t){var e=Pr(t.target);if(e!==null){var n=jr(e);if(n!==null){if(e=n.tag,e===13){if(e=Jg(n),e!==null){t.blockedOn=e,u0(t.priority,function(){l0(n)});return}}else if(e===3&&n.stateNode.current.memoizedState.isDehydrated){t.blockedOn=n.tag===3?n.stateNode.containerInfo:null;return}}}t.blockedOn=null}function sl(t){if(t.blockedOn!==null)return!1;for(var e=t.targetContainers;0<e.length;){var n=ad(t.domEventName,t.eventSystemFlags,e[0],t.nativeEvent);if(n===null){n=t.nativeEvent;var i=new n.constructor(n.type,n);ed=i,n.target.dispatchEvent(i),ed=null}else return e=ro(n),e!==null&&Fh(e),t.blockedOn=n,!1;e.shift()}return!0}function ap(t,e,n){sl(t)&&n.delete(e)}function wx(){sd=!1,Zi!==null&&sl(Zi)&&(Zi=null),Qi!==null&&sl(Qi)&&(Qi=null),Ji!==null&&sl(Ji)&&(Ji=null),za.forEach(ap),Ba.forEach(ap)}function oa(t,e){t.blockedOn===e&&(t.blockedOn=null,sd||(sd=!0,Tn.unstable_scheduleCallback(Tn.unstable_NormalPriority,wx)))}function Ha(t){function e(r){return oa(r,t)}if(0<_o.length){oa(_o[0],t);for(var n=1;n<_o.length;n++){var i=_o[n];i.blockedOn===t&&(i.blockedOn=null)}}for(Zi!==null&&oa(Zi,t),Qi!==null&&oa(Qi,t),Ji!==null&&oa(Ji,t),za.forEach(e),Ba.forEach(e),n=0;n<Gi.length;n++)i=Gi[n],i.blockedOn===t&&(i.blockedOn=null);for(;0<Gi.length&&(n=Gi[0],n.blockedOn===null);)d0(n),n.blockedOn===null&&Gi.shift()}var Ls=Di.ReactCurrentBatchConfig,bl=!0;function Tx(t,e,n,i){var r=tt,s=Ls.transition;Ls.transition=null;try{tt=1,Oh(t,e,n,i)}finally{tt=r,Ls.transition=s}}function Ax(t,e,n,i){var r=tt,s=Ls.transition;Ls.transition=null;try{tt=4,Oh(t,e,n,i)}finally{tt=r,Ls.transition=s}}function Oh(t,e,n,i){if(bl){var r=ad(t,e,n,i);if(r===null)$c(t,e,i,Pl,n),sp(t,i);else if(Ex(r,t,e,n,i))i.stopPropagation();else if(sp(t,i),e&4&&-1<Mx.indexOf(t)){for(;r!==null;){var s=ro(r);if(s!==null&&o0(s),s=ad(t,e,n,i),s===null&&$c(t,e,i,Pl,n),s===r)break;r=s}r!==null&&i.stopPropagation()}else $c(t,e,i,null,n)}}var Pl=null;function ad(t,e,n,i){if(Pl=null,t=Ih(i),t=Pr(t),t!==null)if(e=jr(t),e===null)t=null;else if(n=e.tag,n===13){if(t=Jg(e),t!==null)return t;t=null}else if(n===3){if(e.stateNode.current.memoizedState.isDehydrated)return e.tag===3?e.stateNode.containerInfo:null;t=null}else e!==t&&(t=null);return Pl=t,null}function h0(t){switch(t){case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 1;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"toggle":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 4;case"message":switch(fx()){case Uh:return 1;case i0:return 4;case Cl:case px:return 16;case r0:return 536870912;default:return 16}default:return 16}}var Xi=null,zh=null,al=null;function f0(){if(al)return al;var t,e=zh,n=e.length,i,r="value"in Xi?Xi.value:Xi.textContent,s=r.length;for(t=0;t<n&&e[t]===r[t];t++);var a=n-t;for(i=1;i<=a&&e[n-i]===r[s-i];i++);return al=r.slice(t,1<i?1-i:void 0)}function ol(t){var e=t.keyCode;return"charCode"in t?(t=t.charCode,t===0&&e===13&&(t=13)):t=e,t===10&&(t=13),32<=t||t===13?t:0}function xo(){return!0}function op(){return!1}function Cn(t){function e(n,i,r,s,a){this._reactName=n,this._targetInst=r,this.type=i,this.nativeEvent=s,this.target=a,this.currentTarget=null;for(var o in t)t.hasOwnProperty(o)&&(n=t[o],this[o]=n?n(s):s[o]);return this.isDefaultPrevented=(s.defaultPrevented!=null?s.defaultPrevented:s.returnValue===!1)?xo:op,this.isPropagationStopped=op,this}return mt(e.prototype,{preventDefault:function(){this.defaultPrevented=!0;var n=this.nativeEvent;n&&(n.preventDefault?n.preventDefault():typeof n.returnValue!="unknown"&&(n.returnValue=!1),this.isDefaultPrevented=xo)},stopPropagation:function(){var n=this.nativeEvent;n&&(n.stopPropagation?n.stopPropagation():typeof n.cancelBubble!="unknown"&&(n.cancelBubble=!0),this.isPropagationStopped=xo)},persist:function(){},isPersistent:xo}),e}var ea={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(t){return t.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},Bh=Cn(ea),io=mt({},ea,{view:0,detail:0}),Cx=Cn(io),Oc,zc,la,ac=mt({},io,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:Hh,button:0,buttons:0,relatedTarget:function(t){return t.relatedTarget===void 0?t.fromElement===t.srcElement?t.toElement:t.fromElement:t.relatedTarget},movementX:function(t){return"movementX"in t?t.movementX:(t!==la&&(la&&t.type==="mousemove"?(Oc=t.screenX-la.screenX,zc=t.screenY-la.screenY):zc=Oc=0,la=t),Oc)},movementY:function(t){return"movementY"in t?t.movementY:zc}}),lp=Cn(ac),Rx=mt({},ac,{dataTransfer:0}),bx=Cn(Rx),Px=mt({},io,{relatedTarget:0}),Bc=Cn(Px),Lx=mt({},ea,{animationName:0,elapsedTime:0,pseudoElement:0}),Dx=Cn(Lx),Nx=mt({},ea,{clipboardData:function(t){return"clipboardData"in t?t.clipboardData:window.clipboardData}}),Ix=Cn(Nx),Ux=mt({},ea,{data:0}),cp=Cn(Ux),kx={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},Fx={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},Ox={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function zx(t){var e=this.nativeEvent;return e.getModifierState?e.getModifierState(t):(t=Ox[t])?!!e[t]:!1}function Hh(){return zx}var Bx=mt({},io,{key:function(t){if(t.key){var e=kx[t.key]||t.key;if(e!=="Unidentified")return e}return t.type==="keypress"?(t=ol(t),t===13?"Enter":String.fromCharCode(t)):t.type==="keydown"||t.type==="keyup"?Fx[t.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:Hh,charCode:function(t){return t.type==="keypress"?ol(t):0},keyCode:function(t){return t.type==="keydown"||t.type==="keyup"?t.keyCode:0},which:function(t){return t.type==="keypress"?ol(t):t.type==="keydown"||t.type==="keyup"?t.keyCode:0}}),Hx=Cn(Bx),Vx=mt({},ac,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),up=Cn(Vx),Gx=mt({},io,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:Hh}),Wx=Cn(Gx),jx=mt({},ea,{propertyName:0,elapsedTime:0,pseudoElement:0}),Xx=Cn(jx),$x=mt({},ac,{deltaX:function(t){return"deltaX"in t?t.deltaX:"wheelDeltaX"in t?-t.wheelDeltaX:0},deltaY:function(t){return"deltaY"in t?t.deltaY:"wheelDeltaY"in t?-t.wheelDeltaY:"wheelDelta"in t?-t.wheelDelta:0},deltaZ:0,deltaMode:0}),Yx=Cn($x),qx=[9,13,27,32],Vh=Ai&&"CompositionEvent"in window,Ra=null;Ai&&"documentMode"in document&&(Ra=document.documentMode);var Kx=Ai&&"TextEvent"in window&&!Ra,p0=Ai&&(!Vh||Ra&&8<Ra&&11>=Ra),dp=" ",hp=!1;function m0(t,e){switch(t){case"keyup":return qx.indexOf(e.keyCode)!==-1;case"keydown":return e.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function g0(t){return t=t.detail,typeof t=="object"&&"data"in t?t.data:null}var ms=!1;function Zx(t,e){switch(t){case"compositionend":return g0(e);case"keypress":return e.which!==32?null:(hp=!0,dp);case"textInput":return t=e.data,t===dp&&hp?null:t;default:return null}}function Qx(t,e){if(ms)return t==="compositionend"||!Vh&&m0(t,e)?(t=f0(),al=zh=Xi=null,ms=!1,t):null;switch(t){case"paste":return null;case"keypress":if(!(e.ctrlKey||e.altKey||e.metaKey)||e.ctrlKey&&e.altKey){if(e.char&&1<e.char.length)return e.char;if(e.which)return String.fromCharCode(e.which)}return null;case"compositionend":return p0&&e.locale!=="ko"?null:e.data;default:return null}}var Jx={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function fp(t){var e=t&&t.nodeName&&t.nodeName.toLowerCase();return e==="input"?!!Jx[t.type]:e==="textarea"}function v0(t,e,n,i){Yg(i),e=Ll(e,"onChange"),0<e.length&&(n=new Bh("onChange","change",null,n,i),t.push({event:n,listeners:e}))}var ba=null,Va=null;function ey(t){R0(t,0)}function oc(t){var e=_s(t);if(Hg(e))return t}function ty(t,e){if(t==="change")return e}var _0=!1;if(Ai){var Hc;if(Ai){var Vc="oninput"in document;if(!Vc){var pp=document.createElement("div");pp.setAttribute("oninput","return;"),Vc=typeof pp.oninput=="function"}Hc=Vc}else Hc=!1;_0=Hc&&(!document.documentMode||9<document.documentMode)}function mp(){ba&&(ba.detachEvent("onpropertychange",x0),Va=ba=null)}function x0(t){if(t.propertyName==="value"&&oc(Va)){var e=[];v0(e,Va,t,Ih(t)),Qg(ey,e)}}function ny(t,e,n){t==="focusin"?(mp(),ba=e,Va=n,ba.attachEvent("onpropertychange",x0)):t==="focusout"&&mp()}function iy(t){if(t==="selectionchange"||t==="keyup"||t==="keydown")return oc(Va)}function ry(t,e){if(t==="click")return oc(e)}function sy(t,e){if(t==="input"||t==="change")return oc(e)}function ay(t,e){return t===e&&(t!==0||1/t===1/e)||t!==t&&e!==e}var qn=typeof Object.is=="function"?Object.is:ay;function Ga(t,e){if(qn(t,e))return!0;if(typeof t!="object"||t===null||typeof e!="object"||e===null)return!1;var n=Object.keys(t),i=Object.keys(e);if(n.length!==i.length)return!1;for(i=0;i<n.length;i++){var r=n[i];if(!Vu.call(e,r)||!qn(t[r],e[r]))return!1}return!0}function gp(t){for(;t&&t.firstChild;)t=t.firstChild;return t}function vp(t,e){var n=gp(t);t=0;for(var i;n;){if(n.nodeType===3){if(i=t+n.textContent.length,t<=e&&i>=e)return{node:n,offset:e-t};t=i}e:{for(;n;){if(n.nextSibling){n=n.nextSibling;break e}n=n.parentNode}n=void 0}n=gp(n)}}function y0(t,e){return t&&e?t===e?!0:t&&t.nodeType===3?!1:e&&e.nodeType===3?y0(t,e.parentNode):"contains"in t?t.contains(e):t.compareDocumentPosition?!!(t.compareDocumentPosition(e)&16):!1:!1}function S0(){for(var t=window,e=wl();e instanceof t.HTMLIFrameElement;){try{var n=typeof e.contentWindow.location.href=="string"}catch{n=!1}if(n)t=e.contentWindow;else break;e=wl(t.document)}return e}function Gh(t){var e=t&&t.nodeName&&t.nodeName.toLowerCase();return e&&(e==="input"&&(t.type==="text"||t.type==="search"||t.type==="tel"||t.type==="url"||t.type==="password")||e==="textarea"||t.contentEditable==="true")}function oy(t){var e=S0(),n=t.focusedElem,i=t.selectionRange;if(e!==n&&n&&n.ownerDocument&&y0(n.ownerDocument.documentElement,n)){if(i!==null&&Gh(n)){if(e=i.start,t=i.end,t===void 0&&(t=e),"selectionStart"in n)n.selectionStart=e,n.selectionEnd=Math.min(t,n.value.length);else if(t=(e=n.ownerDocument||document)&&e.defaultView||window,t.getSelection){t=t.getSelection();var r=n.textContent.length,s=Math.min(i.start,r);i=i.end===void 0?s:Math.min(i.end,r),!t.extend&&s>i&&(r=i,i=s,s=r),r=vp(n,s);var a=vp(n,i);r&&a&&(t.rangeCount!==1||t.anchorNode!==r.node||t.anchorOffset!==r.offset||t.focusNode!==a.node||t.focusOffset!==a.offset)&&(e=e.createRange(),e.setStart(r.node,r.offset),t.removeAllRanges(),s>i?(t.addRange(e),t.extend(a.node,a.offset)):(e.setEnd(a.node,a.offset),t.addRange(e)))}}for(e=[],t=n;t=t.parentNode;)t.nodeType===1&&e.push({element:t,left:t.scrollLeft,top:t.scrollTop});for(typeof n.focus=="function"&&n.focus(),n=0;n<e.length;n++)t=e[n],t.element.scrollLeft=t.left,t.element.scrollTop=t.top}}var ly=Ai&&"documentMode"in document&&11>=document.documentMode,gs=null,od=null,Pa=null,ld=!1;function _p(t,e,n){var i=n.window===n?n.document:n.nodeType===9?n:n.ownerDocument;ld||gs==null||gs!==wl(i)||(i=gs,"selectionStart"in i&&Gh(i)?i={start:i.selectionStart,end:i.selectionEnd}:(i=(i.ownerDocument&&i.ownerDocument.defaultView||window).getSelection(),i={anchorNode:i.anchorNode,anchorOffset:i.anchorOffset,focusNode:i.focusNode,focusOffset:i.focusOffset}),Pa&&Ga(Pa,i)||(Pa=i,i=Ll(od,"onSelect"),0<i.length&&(e=new Bh("onSelect","select",null,e,n),t.push({event:e,listeners:i}),e.target=gs)))}function yo(t,e){var n={};return n[t.toLowerCase()]=e.toLowerCase(),n["Webkit"+t]="webkit"+e,n["Moz"+t]="moz"+e,n}var vs={animationend:yo("Animation","AnimationEnd"),animationiteration:yo("Animation","AnimationIteration"),animationstart:yo("Animation","AnimationStart"),transitionend:yo("Transition","TransitionEnd")},Gc={},M0={};Ai&&(M0=document.createElement("div").style,"AnimationEvent"in window||(delete vs.animationend.animation,delete vs.animationiteration.animation,delete vs.animationstart.animation),"TransitionEvent"in window||delete vs.transitionend.transition);function lc(t){if(Gc[t])return Gc[t];if(!vs[t])return t;var e=vs[t],n;for(n in e)if(e.hasOwnProperty(n)&&n in M0)return Gc[t]=e[n];return t}var E0=lc("animationend"),w0=lc("animationiteration"),T0=lc("animationstart"),A0=lc("transitionend"),C0=new Map,xp="abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");function ur(t,e){C0.set(t,e),Wr(e,[t])}for(var Wc=0;Wc<xp.length;Wc++){var jc=xp[Wc],cy=jc.toLowerCase(),uy=jc[0].toUpperCase()+jc.slice(1);ur(cy,"on"+uy)}ur(E0,"onAnimationEnd");ur(w0,"onAnimationIteration");ur(T0,"onAnimationStart");ur("dblclick","onDoubleClick");ur("focusin","onFocus");ur("focusout","onBlur");ur(A0,"onTransitionEnd");Os("onMouseEnter",["mouseout","mouseover"]);Os("onMouseLeave",["mouseout","mouseover"]);Os("onPointerEnter",["pointerout","pointerover"]);Os("onPointerLeave",["pointerout","pointerover"]);Wr("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));Wr("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));Wr("onBeforeInput",["compositionend","keypress","textInput","paste"]);Wr("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));Wr("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));Wr("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var wa="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),dy=new Set("cancel close invalid load scroll toggle".split(" ").concat(wa));function yp(t,e,n){var i=t.type||"unknown-event";t.currentTarget=n,cx(i,e,void 0,t),t.currentTarget=null}function R0(t,e){e=(e&4)!==0;for(var n=0;n<t.length;n++){var i=t[n],r=i.event;i=i.listeners;e:{var s=void 0;if(e)for(var a=i.length-1;0<=a;a--){var o=i[a],l=o.instance,c=o.currentTarget;if(o=o.listener,l!==s&&r.isPropagationStopped())break e;yp(r,o,c),s=l}else for(a=0;a<i.length;a++){if(o=i[a],l=o.instance,c=o.currentTarget,o=o.listener,l!==s&&r.isPropagationStopped())break e;yp(r,o,c),s=l}}}if(Al)throw t=id,Al=!1,id=null,t}function ct(t,e){var n=e[fd];n===void 0&&(n=e[fd]=new Set);var i=t+"__bubble";n.has(i)||(b0(e,t,2,!1),n.add(i))}function Xc(t,e,n){var i=0;e&&(i|=4),b0(n,t,i,e)}var So="_reactListening"+Math.random().toString(36).slice(2);function Wa(t){if(!t[So]){t[So]=!0,kg.forEach(function(n){n!=="selectionchange"&&(dy.has(n)||Xc(n,!1,t),Xc(n,!0,t))});var e=t.nodeType===9?t:t.ownerDocument;e===null||e[So]||(e[So]=!0,Xc("selectionchange",!1,e))}}function b0(t,e,n,i){switch(h0(e)){case 1:var r=Tx;break;case 4:r=Ax;break;default:r=Oh}n=r.bind(null,e,n,t),r=void 0,!nd||e!=="touchstart"&&e!=="touchmove"&&e!=="wheel"||(r=!0),i?r!==void 0?t.addEventListener(e,n,{capture:!0,passive:r}):t.addEventListener(e,n,!0):r!==void 0?t.addEventListener(e,n,{passive:r}):t.addEventListener(e,n,!1)}function $c(t,e,n,i,r){var s=i;if(!(e&1)&&!(e&2)&&i!==null)e:for(;;){if(i===null)return;var a=i.tag;if(a===3||a===4){var o=i.stateNode.containerInfo;if(o===r||o.nodeType===8&&o.parentNode===r)break;if(a===4)for(a=i.return;a!==null;){var l=a.tag;if((l===3||l===4)&&(l=a.stateNode.containerInfo,l===r||l.nodeType===8&&l.parentNode===r))return;a=a.return}for(;o!==null;){if(a=Pr(o),a===null)return;if(l=a.tag,l===5||l===6){i=s=a;continue e}o=o.parentNode}}i=i.return}Qg(function(){var c=s,u=Ih(n),h=[];e:{var f=C0.get(t);if(f!==void 0){var p=Bh,_=t;switch(t){case"keypress":if(ol(n)===0)break e;case"keydown":case"keyup":p=Hx;break;case"focusin":_="focus",p=Bc;break;case"focusout":_="blur",p=Bc;break;case"beforeblur":case"afterblur":p=Bc;break;case"click":if(n.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":p=lp;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":p=bx;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":p=Wx;break;case E0:case w0:case T0:p=Dx;break;case A0:p=Xx;break;case"scroll":p=Cx;break;case"wheel":p=Yx;break;case"copy":case"cut":case"paste":p=Ix;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":p=up}var y=(e&4)!==0,m=!y&&t==="scroll",d=y?f!==null?f+"Capture":null:f;y=[];for(var g=c,v;g!==null;){v=g;var S=v.stateNode;if(v.tag===5&&S!==null&&(v=S,d!==null&&(S=Oa(g,d),S!=null&&y.push(ja(g,S,v)))),m)break;g=g.return}0<y.length&&(f=new p(f,_,null,n,u),h.push({event:f,listeners:y}))}}if(!(e&7)){e:{if(f=t==="mouseover"||t==="pointerover",p=t==="mouseout"||t==="pointerout",f&&n!==ed&&(_=n.relatedTarget||n.fromElement)&&(Pr(_)||_[Ci]))break e;if((p||f)&&(f=u.window===u?u:(f=u.ownerDocument)?f.defaultView||f.parentWindow:window,p?(_=n.relatedTarget||n.toElement,p=c,_=_?Pr(_):null,_!==null&&(m=jr(_),_!==m||_.tag!==5&&_.tag!==6)&&(_=null)):(p=null,_=c),p!==_)){if(y=lp,S="onMouseLeave",d="onMouseEnter",g="mouse",(t==="pointerout"||t==="pointerover")&&(y=up,S="onPointerLeave",d="onPointerEnter",g="pointer"),m=p==null?f:_s(p),v=_==null?f:_s(_),f=new y(S,g+"leave",p,n,u),f.target=m,f.relatedTarget=v,S=null,Pr(u)===c&&(y=new y(d,g+"enter",_,n,u),y.target=v,y.relatedTarget=m,S=y),m=S,p&&_)t:{for(y=p,d=_,g=0,v=y;v;v=Kr(v))g++;for(v=0,S=d;S;S=Kr(S))v++;for(;0<g-v;)y=Kr(y),g--;for(;0<v-g;)d=Kr(d),v--;for(;g--;){if(y===d||d!==null&&y===d.alternate)break t;y=Kr(y),d=Kr(d)}y=null}else y=null;p!==null&&Sp(h,f,p,y,!1),_!==null&&m!==null&&Sp(h,m,_,y,!0)}}e:{if(f=c?_s(c):window,p=f.nodeName&&f.nodeName.toLowerCase(),p==="select"||p==="input"&&f.type==="file")var b=ty;else if(fp(f))if(_0)b=sy;else{b=iy;var C=ny}else(p=f.nodeName)&&p.toLowerCase()==="input"&&(f.type==="checkbox"||f.type==="radio")&&(b=ry);if(b&&(b=b(t,c))){v0(h,b,n,u);break e}C&&C(t,f,c),t==="focusout"&&(C=f._wrapperState)&&C.controlled&&f.type==="number"&&qu(f,"number",f.value)}switch(C=c?_s(c):window,t){case"focusin":(fp(C)||C.contentEditable==="true")&&(gs=C,od=c,Pa=null);break;case"focusout":Pa=od=gs=null;break;case"mousedown":ld=!0;break;case"contextmenu":case"mouseup":case"dragend":ld=!1,_p(h,n,u);break;case"selectionchange":if(ly)break;case"keydown":case"keyup":_p(h,n,u)}var A;if(Vh)e:{switch(t){case"compositionstart":var P="onCompositionStart";break e;case"compositionend":P="onCompositionEnd";break e;case"compositionupdate":P="onCompositionUpdate";break e}P=void 0}else ms?m0(t,n)&&(P="onCompositionEnd"):t==="keydown"&&n.keyCode===229&&(P="onCompositionStart");P&&(p0&&n.locale!=="ko"&&(ms||P!=="onCompositionStart"?P==="onCompositionEnd"&&ms&&(A=f0()):(Xi=u,zh="value"in Xi?Xi.value:Xi.textContent,ms=!0)),C=Ll(c,P),0<C.length&&(P=new cp(P,t,null,n,u),h.push({event:P,listeners:C}),A?P.data=A:(A=g0(n),A!==null&&(P.data=A)))),(A=Kx?Zx(t,n):Qx(t,n))&&(c=Ll(c,"onBeforeInput"),0<c.length&&(u=new cp("onBeforeInput","beforeinput",null,n,u),h.push({event:u,listeners:c}),u.data=A))}R0(h,e)})}function ja(t,e,n){return{instance:t,listener:e,currentTarget:n}}function Ll(t,e){for(var n=e+"Capture",i=[];t!==null;){var r=t,s=r.stateNode;r.tag===5&&s!==null&&(r=s,s=Oa(t,n),s!=null&&i.unshift(ja(t,s,r)),s=Oa(t,e),s!=null&&i.push(ja(t,s,r))),t=t.return}return i}function Kr(t){if(t===null)return null;do t=t.return;while(t&&t.tag!==5);return t||null}function Sp(t,e,n,i,r){for(var s=e._reactName,a=[];n!==null&&n!==i;){var o=n,l=o.alternate,c=o.stateNode;if(l!==null&&l===i)break;o.tag===5&&c!==null&&(o=c,r?(l=Oa(n,s),l!=null&&a.unshift(ja(n,l,o))):r||(l=Oa(n,s),l!=null&&a.push(ja(n,l,o)))),n=n.return}a.length!==0&&t.push({event:e,listeners:a})}var hy=/\r\n?/g,fy=/\u0000|\uFFFD/g;function Mp(t){return(typeof t=="string"?t:""+t).replace(hy,`
`).replace(fy,"")}function Mo(t,e,n){if(e=Mp(e),Mp(t)!==e&&n)throw Error(te(425))}function Dl(){}var cd=null,ud=null;function dd(t,e){return t==="textarea"||t==="noscript"||typeof e.children=="string"||typeof e.children=="number"||typeof e.dangerouslySetInnerHTML=="object"&&e.dangerouslySetInnerHTML!==null&&e.dangerouslySetInnerHTML.__html!=null}var hd=typeof setTimeout=="function"?setTimeout:void 0,py=typeof clearTimeout=="function"?clearTimeout:void 0,Ep=typeof Promise=="function"?Promise:void 0,my=typeof queueMicrotask=="function"?queueMicrotask:typeof Ep<"u"?function(t){return Ep.resolve(null).then(t).catch(gy)}:hd;function gy(t){setTimeout(function(){throw t})}function Yc(t,e){var n=e,i=0;do{var r=n.nextSibling;if(t.removeChild(n),r&&r.nodeType===8)if(n=r.data,n==="/$"){if(i===0){t.removeChild(r),Ha(e);return}i--}else n!=="$"&&n!=="$?"&&n!=="$!"||i++;n=r}while(n);Ha(e)}function er(t){for(;t!=null;t=t.nextSibling){var e=t.nodeType;if(e===1||e===3)break;if(e===8){if(e=t.data,e==="$"||e==="$!"||e==="$?")break;if(e==="/$")return null}}return t}function wp(t){t=t.previousSibling;for(var e=0;t;){if(t.nodeType===8){var n=t.data;if(n==="$"||n==="$!"||n==="$?"){if(e===0)return t;e--}else n==="/$"&&e++}t=t.previousSibling}return null}var ta=Math.random().toString(36).slice(2),ni="__reactFiber$"+ta,Xa="__reactProps$"+ta,Ci="__reactContainer$"+ta,fd="__reactEvents$"+ta,vy="__reactListeners$"+ta,_y="__reactHandles$"+ta;function Pr(t){var e=t[ni];if(e)return e;for(var n=t.parentNode;n;){if(e=n[Ci]||n[ni]){if(n=e.alternate,e.child!==null||n!==null&&n.child!==null)for(t=wp(t);t!==null;){if(n=t[ni])return n;t=wp(t)}return e}t=n,n=t.parentNode}return null}function ro(t){return t=t[ni]||t[Ci],!t||t.tag!==5&&t.tag!==6&&t.tag!==13&&t.tag!==3?null:t}function _s(t){if(t.tag===5||t.tag===6)return t.stateNode;throw Error(te(33))}function cc(t){return t[Xa]||null}var pd=[],xs=-1;function dr(t){return{current:t}}function dt(t){0>xs||(t.current=pd[xs],pd[xs]=null,xs--)}function at(t,e){xs++,pd[xs]=t.current,t.current=e}var lr={},$t=dr(lr),dn=dr(!1),Fr=lr;function zs(t,e){var n=t.type.contextTypes;if(!n)return lr;var i=t.stateNode;if(i&&i.__reactInternalMemoizedUnmaskedChildContext===e)return i.__reactInternalMemoizedMaskedChildContext;var r={},s;for(s in n)r[s]=e[s];return i&&(t=t.stateNode,t.__reactInternalMemoizedUnmaskedChildContext=e,t.__reactInternalMemoizedMaskedChildContext=r),r}function hn(t){return t=t.childContextTypes,t!=null}function Nl(){dt(dn),dt($t)}function Tp(t,e,n){if($t.current!==lr)throw Error(te(168));at($t,e),at(dn,n)}function P0(t,e,n){var i=t.stateNode;if(e=e.childContextTypes,typeof i.getChildContext!="function")return n;i=i.getChildContext();for(var r in i)if(!(r in e))throw Error(te(108,nx(t)||"Unknown",r));return mt({},n,i)}function Il(t){return t=(t=t.stateNode)&&t.__reactInternalMemoizedMergedChildContext||lr,Fr=$t.current,at($t,t),at(dn,dn.current),!0}function Ap(t,e,n){var i=t.stateNode;if(!i)throw Error(te(169));n?(t=P0(t,e,Fr),i.__reactInternalMemoizedMergedChildContext=t,dt(dn),dt($t),at($t,t)):dt(dn),at(dn,n)}var mi=null,uc=!1,qc=!1;function L0(t){mi===null?mi=[t]:mi.push(t)}function xy(t){uc=!0,L0(t)}function hr(){if(!qc&&mi!==null){qc=!0;var t=0,e=tt;try{var n=mi;for(tt=1;t<n.length;t++){var i=n[t];do i=i(!0);while(i!==null)}mi=null,uc=!1}catch(r){throw mi!==null&&(mi=mi.slice(t+1)),n0(Uh,hr),r}finally{tt=e,qc=!1}}return null}var ys=[],Ss=0,Ul=null,kl=0,Ln=[],Dn=0,Or=null,_i=1,xi="";function wr(t,e){ys[Ss++]=kl,ys[Ss++]=Ul,Ul=t,kl=e}function D0(t,e,n){Ln[Dn++]=_i,Ln[Dn++]=xi,Ln[Dn++]=Or,Or=t;var i=_i;t=xi;var r=32-$n(i)-1;i&=~(1<<r),n+=1;var s=32-$n(e)+r;if(30<s){var a=r-r%5;s=(i&(1<<a)-1).toString(32),i>>=a,r-=a,_i=1<<32-$n(e)+r|n<<r|i,xi=s+t}else _i=1<<s|n<<r|i,xi=t}function Wh(t){t.return!==null&&(wr(t,1),D0(t,1,0))}function jh(t){for(;t===Ul;)Ul=ys[--Ss],ys[Ss]=null,kl=ys[--Ss],ys[Ss]=null;for(;t===Or;)Or=Ln[--Dn],Ln[Dn]=null,xi=Ln[--Dn],Ln[Dn]=null,_i=Ln[--Dn],Ln[Dn]=null}var wn=null,Mn=null,ht=!1,Wn=null;function N0(t,e){var n=Nn(5,null,null,0);n.elementType="DELETED",n.stateNode=e,n.return=t,e=t.deletions,e===null?(t.deletions=[n],t.flags|=16):e.push(n)}function Cp(t,e){switch(t.tag){case 5:var n=t.type;return e=e.nodeType!==1||n.toLowerCase()!==e.nodeName.toLowerCase()?null:e,e!==null?(t.stateNode=e,wn=t,Mn=er(e.firstChild),!0):!1;case 6:return e=t.pendingProps===""||e.nodeType!==3?null:e,e!==null?(t.stateNode=e,wn=t,Mn=null,!0):!1;case 13:return e=e.nodeType!==8?null:e,e!==null?(n=Or!==null?{id:_i,overflow:xi}:null,t.memoizedState={dehydrated:e,treeContext:n,retryLane:1073741824},n=Nn(18,null,null,0),n.stateNode=e,n.return=t,t.child=n,wn=t,Mn=null,!0):!1;default:return!1}}function md(t){return(t.mode&1)!==0&&(t.flags&128)===0}function gd(t){if(ht){var e=Mn;if(e){var n=e;if(!Cp(t,e)){if(md(t))throw Error(te(418));e=er(n.nextSibling);var i=wn;e&&Cp(t,e)?N0(i,n):(t.flags=t.flags&-4097|2,ht=!1,wn=t)}}else{if(md(t))throw Error(te(418));t.flags=t.flags&-4097|2,ht=!1,wn=t}}}function Rp(t){for(t=t.return;t!==null&&t.tag!==5&&t.tag!==3&&t.tag!==13;)t=t.return;wn=t}function Eo(t){if(t!==wn)return!1;if(!ht)return Rp(t),ht=!0,!1;var e;if((e=t.tag!==3)&&!(e=t.tag!==5)&&(e=t.type,e=e!=="head"&&e!=="body"&&!dd(t.type,t.memoizedProps)),e&&(e=Mn)){if(md(t))throw I0(),Error(te(418));for(;e;)N0(t,e),e=er(e.nextSibling)}if(Rp(t),t.tag===13){if(t=t.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(te(317));e:{for(t=t.nextSibling,e=0;t;){if(t.nodeType===8){var n=t.data;if(n==="/$"){if(e===0){Mn=er(t.nextSibling);break e}e--}else n!=="$"&&n!=="$!"&&n!=="$?"||e++}t=t.nextSibling}Mn=null}}else Mn=wn?er(t.stateNode.nextSibling):null;return!0}function I0(){for(var t=Mn;t;)t=er(t.nextSibling)}function Bs(){Mn=wn=null,ht=!1}function Xh(t){Wn===null?Wn=[t]:Wn.push(t)}var yy=Di.ReactCurrentBatchConfig;function ca(t,e,n){if(t=n.ref,t!==null&&typeof t!="function"&&typeof t!="object"){if(n._owner){if(n=n._owner,n){if(n.tag!==1)throw Error(te(309));var i=n.stateNode}if(!i)throw Error(te(147,t));var r=i,s=""+t;return e!==null&&e.ref!==null&&typeof e.ref=="function"&&e.ref._stringRef===s?e.ref:(e=function(a){var o=r.refs;a===null?delete o[s]:o[s]=a},e._stringRef=s,e)}if(typeof t!="string")throw Error(te(284));if(!n._owner)throw Error(te(290,t))}return t}function wo(t,e){throw t=Object.prototype.toString.call(e),Error(te(31,t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t))}function bp(t){var e=t._init;return e(t._payload)}function U0(t){function e(d,g){if(t){var v=d.deletions;v===null?(d.deletions=[g],d.flags|=16):v.push(g)}}function n(d,g){if(!t)return null;for(;g!==null;)e(d,g),g=g.sibling;return null}function i(d,g){for(d=new Map;g!==null;)g.key!==null?d.set(g.key,g):d.set(g.index,g),g=g.sibling;return d}function r(d,g){return d=rr(d,g),d.index=0,d.sibling=null,d}function s(d,g,v){return d.index=v,t?(v=d.alternate,v!==null?(v=v.index,v<g?(d.flags|=2,g):v):(d.flags|=2,g)):(d.flags|=1048576,g)}function a(d){return t&&d.alternate===null&&(d.flags|=2),d}function o(d,g,v,S){return g===null||g.tag!==6?(g=nu(v,d.mode,S),g.return=d,g):(g=r(g,v),g.return=d,g)}function l(d,g,v,S){var b=v.type;return b===ps?u(d,g,v.props.children,S,v.key):g!==null&&(g.elementType===b||typeof b=="object"&&b!==null&&b.$$typeof===Hi&&bp(b)===g.type)?(S=r(g,v.props),S.ref=ca(d,g,v),S.return=d,S):(S=pl(v.type,v.key,v.props,null,d.mode,S),S.ref=ca(d,g,v),S.return=d,S)}function c(d,g,v,S){return g===null||g.tag!==4||g.stateNode.containerInfo!==v.containerInfo||g.stateNode.implementation!==v.implementation?(g=iu(v,d.mode,S),g.return=d,g):(g=r(g,v.children||[]),g.return=d,g)}function u(d,g,v,S,b){return g===null||g.tag!==7?(g=Ur(v,d.mode,S,b),g.return=d,g):(g=r(g,v),g.return=d,g)}function h(d,g,v){if(typeof g=="string"&&g!==""||typeof g=="number")return g=nu(""+g,d.mode,v),g.return=d,g;if(typeof g=="object"&&g!==null){switch(g.$$typeof){case fo:return v=pl(g.type,g.key,g.props,null,d.mode,v),v.ref=ca(d,null,g),v.return=d,v;case fs:return g=iu(g,d.mode,v),g.return=d,g;case Hi:var S=g._init;return h(d,S(g._payload),v)}if(Ma(g)||ra(g))return g=Ur(g,d.mode,v,null),g.return=d,g;wo(d,g)}return null}function f(d,g,v,S){var b=g!==null?g.key:null;if(typeof v=="string"&&v!==""||typeof v=="number")return b!==null?null:o(d,g,""+v,S);if(typeof v=="object"&&v!==null){switch(v.$$typeof){case fo:return v.key===b?l(d,g,v,S):null;case fs:return v.key===b?c(d,g,v,S):null;case Hi:return b=v._init,f(d,g,b(v._payload),S)}if(Ma(v)||ra(v))return b!==null?null:u(d,g,v,S,null);wo(d,v)}return null}function p(d,g,v,S,b){if(typeof S=="string"&&S!==""||typeof S=="number")return d=d.get(v)||null,o(g,d,""+S,b);if(typeof S=="object"&&S!==null){switch(S.$$typeof){case fo:return d=d.get(S.key===null?v:S.key)||null,l(g,d,S,b);case fs:return d=d.get(S.key===null?v:S.key)||null,c(g,d,S,b);case Hi:var C=S._init;return p(d,g,v,C(S._payload),b)}if(Ma(S)||ra(S))return d=d.get(v)||null,u(g,d,S,b,null);wo(g,S)}return null}function _(d,g,v,S){for(var b=null,C=null,A=g,P=g=0,V=null;A!==null&&P<v.length;P++){A.index>P?(V=A,A=null):V=A.sibling;var x=f(d,A,v[P],S);if(x===null){A===null&&(A=V);break}t&&A&&x.alternate===null&&e(d,A),g=s(x,g,P),C===null?b=x:C.sibling=x,C=x,A=V}if(P===v.length)return n(d,A),ht&&wr(d,P),b;if(A===null){for(;P<v.length;P++)A=h(d,v[P],S),A!==null&&(g=s(A,g,P),C===null?b=A:C.sibling=A,C=A);return ht&&wr(d,P),b}for(A=i(d,A);P<v.length;P++)V=p(A,d,P,v[P],S),V!==null&&(t&&V.alternate!==null&&A.delete(V.key===null?P:V.key),g=s(V,g,P),C===null?b=V:C.sibling=V,C=V);return t&&A.forEach(function(w){return e(d,w)}),ht&&wr(d,P),b}function y(d,g,v,S){var b=ra(v);if(typeof b!="function")throw Error(te(150));if(v=b.call(v),v==null)throw Error(te(151));for(var C=b=null,A=g,P=g=0,V=null,x=v.next();A!==null&&!x.done;P++,x=v.next()){A.index>P?(V=A,A=null):V=A.sibling;var w=f(d,A,x.value,S);if(w===null){A===null&&(A=V);break}t&&A&&w.alternate===null&&e(d,A),g=s(w,g,P),C===null?b=w:C.sibling=w,C=w,A=V}if(x.done)return n(d,A),ht&&wr(d,P),b;if(A===null){for(;!x.done;P++,x=v.next())x=h(d,x.value,S),x!==null&&(g=s(x,g,P),C===null?b=x:C.sibling=x,C=x);return ht&&wr(d,P),b}for(A=i(d,A);!x.done;P++,x=v.next())x=p(A,d,P,x.value,S),x!==null&&(t&&x.alternate!==null&&A.delete(x.key===null?P:x.key),g=s(x,g,P),C===null?b=x:C.sibling=x,C=x);return t&&A.forEach(function(O){return e(d,O)}),ht&&wr(d,P),b}function m(d,g,v,S){if(typeof v=="object"&&v!==null&&v.type===ps&&v.key===null&&(v=v.props.children),typeof v=="object"&&v!==null){switch(v.$$typeof){case fo:e:{for(var b=v.key,C=g;C!==null;){if(C.key===b){if(b=v.type,b===ps){if(C.tag===7){n(d,C.sibling),g=r(C,v.props.children),g.return=d,d=g;break e}}else if(C.elementType===b||typeof b=="object"&&b!==null&&b.$$typeof===Hi&&bp(b)===C.type){n(d,C.sibling),g=r(C,v.props),g.ref=ca(d,C,v),g.return=d,d=g;break e}n(d,C);break}else e(d,C);C=C.sibling}v.type===ps?(g=Ur(v.props.children,d.mode,S,v.key),g.return=d,d=g):(S=pl(v.type,v.key,v.props,null,d.mode,S),S.ref=ca(d,g,v),S.return=d,d=S)}return a(d);case fs:e:{for(C=v.key;g!==null;){if(g.key===C)if(g.tag===4&&g.stateNode.containerInfo===v.containerInfo&&g.stateNode.implementation===v.implementation){n(d,g.sibling),g=r(g,v.children||[]),g.return=d,d=g;break e}else{n(d,g);break}else e(d,g);g=g.sibling}g=iu(v,d.mode,S),g.return=d,d=g}return a(d);case Hi:return C=v._init,m(d,g,C(v._payload),S)}if(Ma(v))return _(d,g,v,S);if(ra(v))return y(d,g,v,S);wo(d,v)}return typeof v=="string"&&v!==""||typeof v=="number"?(v=""+v,g!==null&&g.tag===6?(n(d,g.sibling),g=r(g,v),g.return=d,d=g):(n(d,g),g=nu(v,d.mode,S),g.return=d,d=g),a(d)):n(d,g)}return m}var Hs=U0(!0),k0=U0(!1),Fl=dr(null),Ol=null,Ms=null,$h=null;function Yh(){$h=Ms=Ol=null}function qh(t){var e=Fl.current;dt(Fl),t._currentValue=e}function vd(t,e,n){for(;t!==null;){var i=t.alternate;if((t.childLanes&e)!==e?(t.childLanes|=e,i!==null&&(i.childLanes|=e)):i!==null&&(i.childLanes&e)!==e&&(i.childLanes|=e),t===n)break;t=t.return}}function Ds(t,e){Ol=t,$h=Ms=null,t=t.dependencies,t!==null&&t.firstContext!==null&&(t.lanes&e&&(cn=!0),t.firstContext=null)}function Un(t){var e=t._currentValue;if($h!==t)if(t={context:t,memoizedValue:e,next:null},Ms===null){if(Ol===null)throw Error(te(308));Ms=t,Ol.dependencies={lanes:0,firstContext:t}}else Ms=Ms.next=t;return e}var Lr=null;function Kh(t){Lr===null?Lr=[t]:Lr.push(t)}function F0(t,e,n,i){var r=e.interleaved;return r===null?(n.next=n,Kh(e)):(n.next=r.next,r.next=n),e.interleaved=n,Ri(t,i)}function Ri(t,e){t.lanes|=e;var n=t.alternate;for(n!==null&&(n.lanes|=e),n=t,t=t.return;t!==null;)t.childLanes|=e,n=t.alternate,n!==null&&(n.childLanes|=e),n=t,t=t.return;return n.tag===3?n.stateNode:null}var Vi=!1;function Zh(t){t.updateQueue={baseState:t.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,interleaved:null,lanes:0},effects:null}}function O0(t,e){t=t.updateQueue,e.updateQueue===t&&(e.updateQueue={baseState:t.baseState,firstBaseUpdate:t.firstBaseUpdate,lastBaseUpdate:t.lastBaseUpdate,shared:t.shared,effects:t.effects})}function Ei(t,e){return{eventTime:t,lane:e,tag:0,payload:null,callback:null,next:null}}function tr(t,e,n){var i=t.updateQueue;if(i===null)return null;if(i=i.shared,je&2){var r=i.pending;return r===null?e.next=e:(e.next=r.next,r.next=e),i.pending=e,Ri(t,n)}return r=i.interleaved,r===null?(e.next=e,Kh(i)):(e.next=r.next,r.next=e),i.interleaved=e,Ri(t,n)}function ll(t,e,n){if(e=e.updateQueue,e!==null&&(e=e.shared,(n&4194240)!==0)){var i=e.lanes;i&=t.pendingLanes,n|=i,e.lanes=n,kh(t,n)}}function Pp(t,e){var n=t.updateQueue,i=t.alternate;if(i!==null&&(i=i.updateQueue,n===i)){var r=null,s=null;if(n=n.firstBaseUpdate,n!==null){do{var a={eventTime:n.eventTime,lane:n.lane,tag:n.tag,payload:n.payload,callback:n.callback,next:null};s===null?r=s=a:s=s.next=a,n=n.next}while(n!==null);s===null?r=s=e:s=s.next=e}else r=s=e;n={baseState:i.baseState,firstBaseUpdate:r,lastBaseUpdate:s,shared:i.shared,effects:i.effects},t.updateQueue=n;return}t=n.lastBaseUpdate,t===null?n.firstBaseUpdate=e:t.next=e,n.lastBaseUpdate=e}function zl(t,e,n,i){var r=t.updateQueue;Vi=!1;var s=r.firstBaseUpdate,a=r.lastBaseUpdate,o=r.shared.pending;if(o!==null){r.shared.pending=null;var l=o,c=l.next;l.next=null,a===null?s=c:a.next=c,a=l;var u=t.alternate;u!==null&&(u=u.updateQueue,o=u.lastBaseUpdate,o!==a&&(o===null?u.firstBaseUpdate=c:o.next=c,u.lastBaseUpdate=l))}if(s!==null){var h=r.baseState;a=0,u=c=l=null,o=s;do{var f=o.lane,p=o.eventTime;if((i&f)===f){u!==null&&(u=u.next={eventTime:p,lane:0,tag:o.tag,payload:o.payload,callback:o.callback,next:null});e:{var _=t,y=o;switch(f=e,p=n,y.tag){case 1:if(_=y.payload,typeof _=="function"){h=_.call(p,h,f);break e}h=_;break e;case 3:_.flags=_.flags&-65537|128;case 0:if(_=y.payload,f=typeof _=="function"?_.call(p,h,f):_,f==null)break e;h=mt({},h,f);break e;case 2:Vi=!0}}o.callback!==null&&o.lane!==0&&(t.flags|=64,f=r.effects,f===null?r.effects=[o]:f.push(o))}else p={eventTime:p,lane:f,tag:o.tag,payload:o.payload,callback:o.callback,next:null},u===null?(c=u=p,l=h):u=u.next=p,a|=f;if(o=o.next,o===null){if(o=r.shared.pending,o===null)break;f=o,o=f.next,f.next=null,r.lastBaseUpdate=f,r.shared.pending=null}}while(!0);if(u===null&&(l=h),r.baseState=l,r.firstBaseUpdate=c,r.lastBaseUpdate=u,e=r.shared.interleaved,e!==null){r=e;do a|=r.lane,r=r.next;while(r!==e)}else s===null&&(r.shared.lanes=0);Br|=a,t.lanes=a,t.memoizedState=h}}function Lp(t,e,n){if(t=e.effects,e.effects=null,t!==null)for(e=0;e<t.length;e++){var i=t[e],r=i.callback;if(r!==null){if(i.callback=null,i=n,typeof r!="function")throw Error(te(191,r));r.call(i)}}}var so={},ai=dr(so),$a=dr(so),Ya=dr(so);function Dr(t){if(t===so)throw Error(te(174));return t}function Qh(t,e){switch(at(Ya,e),at($a,t),at(ai,so),t=e.nodeType,t){case 9:case 11:e=(e=e.documentElement)?e.namespaceURI:Zu(null,"");break;default:t=t===8?e.parentNode:e,e=t.namespaceURI||null,t=t.tagName,e=Zu(e,t)}dt(ai),at(ai,e)}function Vs(){dt(ai),dt($a),dt(Ya)}function z0(t){Dr(Ya.current);var e=Dr(ai.current),n=Zu(e,t.type);e!==n&&(at($a,t),at(ai,n))}function Jh(t){$a.current===t&&(dt(ai),dt($a))}var ft=dr(0);function Bl(t){for(var e=t;e!==null;){if(e.tag===13){var n=e.memoizedState;if(n!==null&&(n=n.dehydrated,n===null||n.data==="$?"||n.data==="$!"))return e}else if(e.tag===19&&e.memoizedProps.revealOrder!==void 0){if(e.flags&128)return e}else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break;for(;e.sibling===null;){if(e.return===null||e.return===t)return null;e=e.return}e.sibling.return=e.return,e=e.sibling}return null}var Kc=[];function ef(){for(var t=0;t<Kc.length;t++)Kc[t]._workInProgressVersionPrimary=null;Kc.length=0}var cl=Di.ReactCurrentDispatcher,Zc=Di.ReactCurrentBatchConfig,zr=0,pt=null,At=null,It=null,Hl=!1,La=!1,qa=0,Sy=0;function Vt(){throw Error(te(321))}function tf(t,e){if(e===null)return!1;for(var n=0;n<e.length&&n<t.length;n++)if(!qn(t[n],e[n]))return!1;return!0}function nf(t,e,n,i,r,s){if(zr=s,pt=e,e.memoizedState=null,e.updateQueue=null,e.lanes=0,cl.current=t===null||t.memoizedState===null?Ty:Ay,t=n(i,r),La){s=0;do{if(La=!1,qa=0,25<=s)throw Error(te(301));s+=1,It=At=null,e.updateQueue=null,cl.current=Cy,t=n(i,r)}while(La)}if(cl.current=Vl,e=At!==null&&At.next!==null,zr=0,It=At=pt=null,Hl=!1,e)throw Error(te(300));return t}function rf(){var t=qa!==0;return qa=0,t}function Jn(){var t={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return It===null?pt.memoizedState=It=t:It=It.next=t,It}function kn(){if(At===null){var t=pt.alternate;t=t!==null?t.memoizedState:null}else t=At.next;var e=It===null?pt.memoizedState:It.next;if(e!==null)It=e,At=t;else{if(t===null)throw Error(te(310));At=t,t={memoizedState:At.memoizedState,baseState:At.baseState,baseQueue:At.baseQueue,queue:At.queue,next:null},It===null?pt.memoizedState=It=t:It=It.next=t}return It}function Ka(t,e){return typeof e=="function"?e(t):e}function Qc(t){var e=kn(),n=e.queue;if(n===null)throw Error(te(311));n.lastRenderedReducer=t;var i=At,r=i.baseQueue,s=n.pending;if(s!==null){if(r!==null){var a=r.next;r.next=s.next,s.next=a}i.baseQueue=r=s,n.pending=null}if(r!==null){s=r.next,i=i.baseState;var o=a=null,l=null,c=s;do{var u=c.lane;if((zr&u)===u)l!==null&&(l=l.next={lane:0,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null}),i=c.hasEagerState?c.eagerState:t(i,c.action);else{var h={lane:u,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null};l===null?(o=l=h,a=i):l=l.next=h,pt.lanes|=u,Br|=u}c=c.next}while(c!==null&&c!==s);l===null?a=i:l.next=o,qn(i,e.memoizedState)||(cn=!0),e.memoizedState=i,e.baseState=a,e.baseQueue=l,n.lastRenderedState=i}if(t=n.interleaved,t!==null){r=t;do s=r.lane,pt.lanes|=s,Br|=s,r=r.next;while(r!==t)}else r===null&&(n.lanes=0);return[e.memoizedState,n.dispatch]}function Jc(t){var e=kn(),n=e.queue;if(n===null)throw Error(te(311));n.lastRenderedReducer=t;var i=n.dispatch,r=n.pending,s=e.memoizedState;if(r!==null){n.pending=null;var a=r=r.next;do s=t(s,a.action),a=a.next;while(a!==r);qn(s,e.memoizedState)||(cn=!0),e.memoizedState=s,e.baseQueue===null&&(e.baseState=s),n.lastRenderedState=s}return[s,i]}function B0(){}function H0(t,e){var n=pt,i=kn(),r=e(),s=!qn(i.memoizedState,r);if(s&&(i.memoizedState=r,cn=!0),i=i.queue,sf(W0.bind(null,n,i,t),[t]),i.getSnapshot!==e||s||It!==null&&It.memoizedState.tag&1){if(n.flags|=2048,Za(9,G0.bind(null,n,i,r,e),void 0,null),kt===null)throw Error(te(349));zr&30||V0(n,e,r)}return r}function V0(t,e,n){t.flags|=16384,t={getSnapshot:e,value:n},e=pt.updateQueue,e===null?(e={lastEffect:null,stores:null},pt.updateQueue=e,e.stores=[t]):(n=e.stores,n===null?e.stores=[t]:n.push(t))}function G0(t,e,n,i){e.value=n,e.getSnapshot=i,j0(e)&&X0(t)}function W0(t,e,n){return n(function(){j0(e)&&X0(t)})}function j0(t){var e=t.getSnapshot;t=t.value;try{var n=e();return!qn(t,n)}catch{return!0}}function X0(t){var e=Ri(t,1);e!==null&&Yn(e,t,1,-1)}function Dp(t){var e=Jn();return typeof t=="function"&&(t=t()),e.memoizedState=e.baseState=t,t={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:Ka,lastRenderedState:t},e.queue=t,t=t.dispatch=wy.bind(null,pt,t),[e.memoizedState,t]}function Za(t,e,n,i){return t={tag:t,create:e,destroy:n,deps:i,next:null},e=pt.updateQueue,e===null?(e={lastEffect:null,stores:null},pt.updateQueue=e,e.lastEffect=t.next=t):(n=e.lastEffect,n===null?e.lastEffect=t.next=t:(i=n.next,n.next=t,t.next=i,e.lastEffect=t)),t}function $0(){return kn().memoizedState}function ul(t,e,n,i){var r=Jn();pt.flags|=t,r.memoizedState=Za(1|e,n,void 0,i===void 0?null:i)}function dc(t,e,n,i){var r=kn();i=i===void 0?null:i;var s=void 0;if(At!==null){var a=At.memoizedState;if(s=a.destroy,i!==null&&tf(i,a.deps)){r.memoizedState=Za(e,n,s,i);return}}pt.flags|=t,r.memoizedState=Za(1|e,n,s,i)}function Np(t,e){return ul(8390656,8,t,e)}function sf(t,e){return dc(2048,8,t,e)}function Y0(t,e){return dc(4,2,t,e)}function q0(t,e){return dc(4,4,t,e)}function K0(t,e){if(typeof e=="function")return t=t(),e(t),function(){e(null)};if(e!=null)return t=t(),e.current=t,function(){e.current=null}}function Z0(t,e,n){return n=n!=null?n.concat([t]):null,dc(4,4,K0.bind(null,e,t),n)}function af(){}function Q0(t,e){var n=kn();e=e===void 0?null:e;var i=n.memoizedState;return i!==null&&e!==null&&tf(e,i[1])?i[0]:(n.memoizedState=[t,e],t)}function J0(t,e){var n=kn();e=e===void 0?null:e;var i=n.memoizedState;return i!==null&&e!==null&&tf(e,i[1])?i[0]:(t=t(),n.memoizedState=[t,e],t)}function ev(t,e,n){return zr&21?(qn(n,e)||(n=s0(),pt.lanes|=n,Br|=n,t.baseState=!0),e):(t.baseState&&(t.baseState=!1,cn=!0),t.memoizedState=n)}function My(t,e){var n=tt;tt=n!==0&&4>n?n:4,t(!0);var i=Zc.transition;Zc.transition={};try{t(!1),e()}finally{tt=n,Zc.transition=i}}function tv(){return kn().memoizedState}function Ey(t,e,n){var i=ir(t);if(n={lane:i,action:n,hasEagerState:!1,eagerState:null,next:null},nv(t))iv(e,n);else if(n=F0(t,e,n,i),n!==null){var r=Zt();Yn(n,t,i,r),rv(n,e,i)}}function wy(t,e,n){var i=ir(t),r={lane:i,action:n,hasEagerState:!1,eagerState:null,next:null};if(nv(t))iv(e,r);else{var s=t.alternate;if(t.lanes===0&&(s===null||s.lanes===0)&&(s=e.lastRenderedReducer,s!==null))try{var a=e.lastRenderedState,o=s(a,n);if(r.hasEagerState=!0,r.eagerState=o,qn(o,a)){var l=e.interleaved;l===null?(r.next=r,Kh(e)):(r.next=l.next,l.next=r),e.interleaved=r;return}}catch{}finally{}n=F0(t,e,r,i),n!==null&&(r=Zt(),Yn(n,t,i,r),rv(n,e,i))}}function nv(t){var e=t.alternate;return t===pt||e!==null&&e===pt}function iv(t,e){La=Hl=!0;var n=t.pending;n===null?e.next=e:(e.next=n.next,n.next=e),t.pending=e}function rv(t,e,n){if(n&4194240){var i=e.lanes;i&=t.pendingLanes,n|=i,e.lanes=n,kh(t,n)}}var Vl={readContext:Un,useCallback:Vt,useContext:Vt,useEffect:Vt,useImperativeHandle:Vt,useInsertionEffect:Vt,useLayoutEffect:Vt,useMemo:Vt,useReducer:Vt,useRef:Vt,useState:Vt,useDebugValue:Vt,useDeferredValue:Vt,useTransition:Vt,useMutableSource:Vt,useSyncExternalStore:Vt,useId:Vt,unstable_isNewReconciler:!1},Ty={readContext:Un,useCallback:function(t,e){return Jn().memoizedState=[t,e===void 0?null:e],t},useContext:Un,useEffect:Np,useImperativeHandle:function(t,e,n){return n=n!=null?n.concat([t]):null,ul(4194308,4,K0.bind(null,e,t),n)},useLayoutEffect:function(t,e){return ul(4194308,4,t,e)},useInsertionEffect:function(t,e){return ul(4,2,t,e)},useMemo:function(t,e){var n=Jn();return e=e===void 0?null:e,t=t(),n.memoizedState=[t,e],t},useReducer:function(t,e,n){var i=Jn();return e=n!==void 0?n(e):e,i.memoizedState=i.baseState=e,t={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:t,lastRenderedState:e},i.queue=t,t=t.dispatch=Ey.bind(null,pt,t),[i.memoizedState,t]},useRef:function(t){var e=Jn();return t={current:t},e.memoizedState=t},useState:Dp,useDebugValue:af,useDeferredValue:function(t){return Jn().memoizedState=t},useTransition:function(){var t=Dp(!1),e=t[0];return t=My.bind(null,t[1]),Jn().memoizedState=t,[e,t]},useMutableSource:function(){},useSyncExternalStore:function(t,e,n){var i=pt,r=Jn();if(ht){if(n===void 0)throw Error(te(407));n=n()}else{if(n=e(),kt===null)throw Error(te(349));zr&30||V0(i,e,n)}r.memoizedState=n;var s={value:n,getSnapshot:e};return r.queue=s,Np(W0.bind(null,i,s,t),[t]),i.flags|=2048,Za(9,G0.bind(null,i,s,n,e),void 0,null),n},useId:function(){var t=Jn(),e=kt.identifierPrefix;if(ht){var n=xi,i=_i;n=(i&~(1<<32-$n(i)-1)).toString(32)+n,e=":"+e+"R"+n,n=qa++,0<n&&(e+="H"+n.toString(32)),e+=":"}else n=Sy++,e=":"+e+"r"+n.toString(32)+":";return t.memoizedState=e},unstable_isNewReconciler:!1},Ay={readContext:Un,useCallback:Q0,useContext:Un,useEffect:sf,useImperativeHandle:Z0,useInsertionEffect:Y0,useLayoutEffect:q0,useMemo:J0,useReducer:Qc,useRef:$0,useState:function(){return Qc(Ka)},useDebugValue:af,useDeferredValue:function(t){var e=kn();return ev(e,At.memoizedState,t)},useTransition:function(){var t=Qc(Ka)[0],e=kn().memoizedState;return[t,e]},useMutableSource:B0,useSyncExternalStore:H0,useId:tv,unstable_isNewReconciler:!1},Cy={readContext:Un,useCallback:Q0,useContext:Un,useEffect:sf,useImperativeHandle:Z0,useInsertionEffect:Y0,useLayoutEffect:q0,useMemo:J0,useReducer:Jc,useRef:$0,useState:function(){return Jc(Ka)},useDebugValue:af,useDeferredValue:function(t){var e=kn();return At===null?e.memoizedState=t:ev(e,At.memoizedState,t)},useTransition:function(){var t=Jc(Ka)[0],e=kn().memoizedState;return[t,e]},useMutableSource:B0,useSyncExternalStore:H0,useId:tv,unstable_isNewReconciler:!1};function Vn(t,e){if(t&&t.defaultProps){e=mt({},e),t=t.defaultProps;for(var n in t)e[n]===void 0&&(e[n]=t[n]);return e}return e}function _d(t,e,n,i){e=t.memoizedState,n=n(i,e),n=n==null?e:mt({},e,n),t.memoizedState=n,t.lanes===0&&(t.updateQueue.baseState=n)}var hc={isMounted:function(t){return(t=t._reactInternals)?jr(t)===t:!1},enqueueSetState:function(t,e,n){t=t._reactInternals;var i=Zt(),r=ir(t),s=Ei(i,r);s.payload=e,n!=null&&(s.callback=n),e=tr(t,s,r),e!==null&&(Yn(e,t,r,i),ll(e,t,r))},enqueueReplaceState:function(t,e,n){t=t._reactInternals;var i=Zt(),r=ir(t),s=Ei(i,r);s.tag=1,s.payload=e,n!=null&&(s.callback=n),e=tr(t,s,r),e!==null&&(Yn(e,t,r,i),ll(e,t,r))},enqueueForceUpdate:function(t,e){t=t._reactInternals;var n=Zt(),i=ir(t),r=Ei(n,i);r.tag=2,e!=null&&(r.callback=e),e=tr(t,r,i),e!==null&&(Yn(e,t,i,n),ll(e,t,i))}};function Ip(t,e,n,i,r,s,a){return t=t.stateNode,typeof t.shouldComponentUpdate=="function"?t.shouldComponentUpdate(i,s,a):e.prototype&&e.prototype.isPureReactComponent?!Ga(n,i)||!Ga(r,s):!0}function sv(t,e,n){var i=!1,r=lr,s=e.contextType;return typeof s=="object"&&s!==null?s=Un(s):(r=hn(e)?Fr:$t.current,i=e.contextTypes,s=(i=i!=null)?zs(t,r):lr),e=new e(n,s),t.memoizedState=e.state!==null&&e.state!==void 0?e.state:null,e.updater=hc,t.stateNode=e,e._reactInternals=t,i&&(t=t.stateNode,t.__reactInternalMemoizedUnmaskedChildContext=r,t.__reactInternalMemoizedMaskedChildContext=s),e}function Up(t,e,n,i){t=e.state,typeof e.componentWillReceiveProps=="function"&&e.componentWillReceiveProps(n,i),typeof e.UNSAFE_componentWillReceiveProps=="function"&&e.UNSAFE_componentWillReceiveProps(n,i),e.state!==t&&hc.enqueueReplaceState(e,e.state,null)}function xd(t,e,n,i){var r=t.stateNode;r.props=n,r.state=t.memoizedState,r.refs={},Zh(t);var s=e.contextType;typeof s=="object"&&s!==null?r.context=Un(s):(s=hn(e)?Fr:$t.current,r.context=zs(t,s)),r.state=t.memoizedState,s=e.getDerivedStateFromProps,typeof s=="function"&&(_d(t,e,s,n),r.state=t.memoizedState),typeof e.getDerivedStateFromProps=="function"||typeof r.getSnapshotBeforeUpdate=="function"||typeof r.UNSAFE_componentWillMount!="function"&&typeof r.componentWillMount!="function"||(e=r.state,typeof r.componentWillMount=="function"&&r.componentWillMount(),typeof r.UNSAFE_componentWillMount=="function"&&r.UNSAFE_componentWillMount(),e!==r.state&&hc.enqueueReplaceState(r,r.state,null),zl(t,n,r,i),r.state=t.memoizedState),typeof r.componentDidMount=="function"&&(t.flags|=4194308)}function Gs(t,e){try{var n="",i=e;do n+=tx(i),i=i.return;while(i);var r=n}catch(s){r=`
Error generating stack: `+s.message+`
`+s.stack}return{value:t,source:e,stack:r,digest:null}}function eu(t,e,n){return{value:t,source:null,stack:n??null,digest:e??null}}function yd(t,e){try{console.error(e.value)}catch(n){setTimeout(function(){throw n})}}var Ry=typeof WeakMap=="function"?WeakMap:Map;function av(t,e,n){n=Ei(-1,n),n.tag=3,n.payload={element:null};var i=e.value;return n.callback=function(){Wl||(Wl=!0,Pd=i),yd(t,e)},n}function ov(t,e,n){n=Ei(-1,n),n.tag=3;var i=t.type.getDerivedStateFromError;if(typeof i=="function"){var r=e.value;n.payload=function(){return i(r)},n.callback=function(){yd(t,e)}}var s=t.stateNode;return s!==null&&typeof s.componentDidCatch=="function"&&(n.callback=function(){yd(t,e),typeof i!="function"&&(nr===null?nr=new Set([this]):nr.add(this));var a=e.stack;this.componentDidCatch(e.value,{componentStack:a!==null?a:""})}),n}function kp(t,e,n){var i=t.pingCache;if(i===null){i=t.pingCache=new Ry;var r=new Set;i.set(e,r)}else r=i.get(e),r===void 0&&(r=new Set,i.set(e,r));r.has(n)||(r.add(n),t=Vy.bind(null,t,e,n),e.then(t,t))}function Fp(t){do{var e;if((e=t.tag===13)&&(e=t.memoizedState,e=e!==null?e.dehydrated!==null:!0),e)return t;t=t.return}while(t!==null);return null}function Op(t,e,n,i,r){return t.mode&1?(t.flags|=65536,t.lanes=r,t):(t===e?t.flags|=65536:(t.flags|=128,n.flags|=131072,n.flags&=-52805,n.tag===1&&(n.alternate===null?n.tag=17:(e=Ei(-1,1),e.tag=2,tr(n,e,1))),n.lanes|=1),t)}var by=Di.ReactCurrentOwner,cn=!1;function qt(t,e,n,i){e.child=t===null?k0(e,null,n,i):Hs(e,t.child,n,i)}function zp(t,e,n,i,r){n=n.render;var s=e.ref;return Ds(e,r),i=nf(t,e,n,i,s,r),n=rf(),t!==null&&!cn?(e.updateQueue=t.updateQueue,e.flags&=-2053,t.lanes&=~r,bi(t,e,r)):(ht&&n&&Wh(e),e.flags|=1,qt(t,e,i,r),e.child)}function Bp(t,e,n,i,r){if(t===null){var s=n.type;return typeof s=="function"&&!pf(s)&&s.defaultProps===void 0&&n.compare===null&&n.defaultProps===void 0?(e.tag=15,e.type=s,lv(t,e,s,i,r)):(t=pl(n.type,null,i,e,e.mode,r),t.ref=e.ref,t.return=e,e.child=t)}if(s=t.child,!(t.lanes&r)){var a=s.memoizedProps;if(n=n.compare,n=n!==null?n:Ga,n(a,i)&&t.ref===e.ref)return bi(t,e,r)}return e.flags|=1,t=rr(s,i),t.ref=e.ref,t.return=e,e.child=t}function lv(t,e,n,i,r){if(t!==null){var s=t.memoizedProps;if(Ga(s,i)&&t.ref===e.ref)if(cn=!1,e.pendingProps=i=s,(t.lanes&r)!==0)t.flags&131072&&(cn=!0);else return e.lanes=t.lanes,bi(t,e,r)}return Sd(t,e,n,i,r)}function cv(t,e,n){var i=e.pendingProps,r=i.children,s=t!==null?t.memoizedState:null;if(i.mode==="hidden")if(!(e.mode&1))e.memoizedState={baseLanes:0,cachePool:null,transitions:null},at(ws,xn),xn|=n;else{if(!(n&1073741824))return t=s!==null?s.baseLanes|n:n,e.lanes=e.childLanes=1073741824,e.memoizedState={baseLanes:t,cachePool:null,transitions:null},e.updateQueue=null,at(ws,xn),xn|=t,null;e.memoizedState={baseLanes:0,cachePool:null,transitions:null},i=s!==null?s.baseLanes:n,at(ws,xn),xn|=i}else s!==null?(i=s.baseLanes|n,e.memoizedState=null):i=n,at(ws,xn),xn|=i;return qt(t,e,r,n),e.child}function uv(t,e){var n=e.ref;(t===null&&n!==null||t!==null&&t.ref!==n)&&(e.flags|=512,e.flags|=2097152)}function Sd(t,e,n,i,r){var s=hn(n)?Fr:$t.current;return s=zs(e,s),Ds(e,r),n=nf(t,e,n,i,s,r),i=rf(),t!==null&&!cn?(e.updateQueue=t.updateQueue,e.flags&=-2053,t.lanes&=~r,bi(t,e,r)):(ht&&i&&Wh(e),e.flags|=1,qt(t,e,n,r),e.child)}function Hp(t,e,n,i,r){if(hn(n)){var s=!0;Il(e)}else s=!1;if(Ds(e,r),e.stateNode===null)dl(t,e),sv(e,n,i),xd(e,n,i,r),i=!0;else if(t===null){var a=e.stateNode,o=e.memoizedProps;a.props=o;var l=a.context,c=n.contextType;typeof c=="object"&&c!==null?c=Un(c):(c=hn(n)?Fr:$t.current,c=zs(e,c));var u=n.getDerivedStateFromProps,h=typeof u=="function"||typeof a.getSnapshotBeforeUpdate=="function";h||typeof a.UNSAFE_componentWillReceiveProps!="function"&&typeof a.componentWillReceiveProps!="function"||(o!==i||l!==c)&&Up(e,a,i,c),Vi=!1;var f=e.memoizedState;a.state=f,zl(e,i,a,r),l=e.memoizedState,o!==i||f!==l||dn.current||Vi?(typeof u=="function"&&(_d(e,n,u,i),l=e.memoizedState),(o=Vi||Ip(e,n,o,i,f,l,c))?(h||typeof a.UNSAFE_componentWillMount!="function"&&typeof a.componentWillMount!="function"||(typeof a.componentWillMount=="function"&&a.componentWillMount(),typeof a.UNSAFE_componentWillMount=="function"&&a.UNSAFE_componentWillMount()),typeof a.componentDidMount=="function"&&(e.flags|=4194308)):(typeof a.componentDidMount=="function"&&(e.flags|=4194308),e.memoizedProps=i,e.memoizedState=l),a.props=i,a.state=l,a.context=c,i=o):(typeof a.componentDidMount=="function"&&(e.flags|=4194308),i=!1)}else{a=e.stateNode,O0(t,e),o=e.memoizedProps,c=e.type===e.elementType?o:Vn(e.type,o),a.props=c,h=e.pendingProps,f=a.context,l=n.contextType,typeof l=="object"&&l!==null?l=Un(l):(l=hn(n)?Fr:$t.current,l=zs(e,l));var p=n.getDerivedStateFromProps;(u=typeof p=="function"||typeof a.getSnapshotBeforeUpdate=="function")||typeof a.UNSAFE_componentWillReceiveProps!="function"&&typeof a.componentWillReceiveProps!="function"||(o!==h||f!==l)&&Up(e,a,i,l),Vi=!1,f=e.memoizedState,a.state=f,zl(e,i,a,r);var _=e.memoizedState;o!==h||f!==_||dn.current||Vi?(typeof p=="function"&&(_d(e,n,p,i),_=e.memoizedState),(c=Vi||Ip(e,n,c,i,f,_,l)||!1)?(u||typeof a.UNSAFE_componentWillUpdate!="function"&&typeof a.componentWillUpdate!="function"||(typeof a.componentWillUpdate=="function"&&a.componentWillUpdate(i,_,l),typeof a.UNSAFE_componentWillUpdate=="function"&&a.UNSAFE_componentWillUpdate(i,_,l)),typeof a.componentDidUpdate=="function"&&(e.flags|=4),typeof a.getSnapshotBeforeUpdate=="function"&&(e.flags|=1024)):(typeof a.componentDidUpdate!="function"||o===t.memoizedProps&&f===t.memoizedState||(e.flags|=4),typeof a.getSnapshotBeforeUpdate!="function"||o===t.memoizedProps&&f===t.memoizedState||(e.flags|=1024),e.memoizedProps=i,e.memoizedState=_),a.props=i,a.state=_,a.context=l,i=c):(typeof a.componentDidUpdate!="function"||o===t.memoizedProps&&f===t.memoizedState||(e.flags|=4),typeof a.getSnapshotBeforeUpdate!="function"||o===t.memoizedProps&&f===t.memoizedState||(e.flags|=1024),i=!1)}return Md(t,e,n,i,s,r)}function Md(t,e,n,i,r,s){uv(t,e);var a=(e.flags&128)!==0;if(!i&&!a)return r&&Ap(e,n,!1),bi(t,e,s);i=e.stateNode,by.current=e;var o=a&&typeof n.getDerivedStateFromError!="function"?null:i.render();return e.flags|=1,t!==null&&a?(e.child=Hs(e,t.child,null,s),e.child=Hs(e,null,o,s)):qt(t,e,o,s),e.memoizedState=i.state,r&&Ap(e,n,!0),e.child}function dv(t){var e=t.stateNode;e.pendingContext?Tp(t,e.pendingContext,e.pendingContext!==e.context):e.context&&Tp(t,e.context,!1),Qh(t,e.containerInfo)}function Vp(t,e,n,i,r){return Bs(),Xh(r),e.flags|=256,qt(t,e,n,i),e.child}var Ed={dehydrated:null,treeContext:null,retryLane:0};function wd(t){return{baseLanes:t,cachePool:null,transitions:null}}function hv(t,e,n){var i=e.pendingProps,r=ft.current,s=!1,a=(e.flags&128)!==0,o;if((o=a)||(o=t!==null&&t.memoizedState===null?!1:(r&2)!==0),o?(s=!0,e.flags&=-129):(t===null||t.memoizedState!==null)&&(r|=1),at(ft,r&1),t===null)return gd(e),t=e.memoizedState,t!==null&&(t=t.dehydrated,t!==null)?(e.mode&1?t.data==="$!"?e.lanes=8:e.lanes=1073741824:e.lanes=1,null):(a=i.children,t=i.fallback,s?(i=e.mode,s=e.child,a={mode:"hidden",children:a},!(i&1)&&s!==null?(s.childLanes=0,s.pendingProps=a):s=mc(a,i,0,null),t=Ur(t,i,n,null),s.return=e,t.return=e,s.sibling=t,e.child=s,e.child.memoizedState=wd(n),e.memoizedState=Ed,t):of(e,a));if(r=t.memoizedState,r!==null&&(o=r.dehydrated,o!==null))return Py(t,e,a,i,o,r,n);if(s){s=i.fallback,a=e.mode,r=t.child,o=r.sibling;var l={mode:"hidden",children:i.children};return!(a&1)&&e.child!==r?(i=e.child,i.childLanes=0,i.pendingProps=l,e.deletions=null):(i=rr(r,l),i.subtreeFlags=r.subtreeFlags&14680064),o!==null?s=rr(o,s):(s=Ur(s,a,n,null),s.flags|=2),s.return=e,i.return=e,i.sibling=s,e.child=i,i=s,s=e.child,a=t.child.memoizedState,a=a===null?wd(n):{baseLanes:a.baseLanes|n,cachePool:null,transitions:a.transitions},s.memoizedState=a,s.childLanes=t.childLanes&~n,e.memoizedState=Ed,i}return s=t.child,t=s.sibling,i=rr(s,{mode:"visible",children:i.children}),!(e.mode&1)&&(i.lanes=n),i.return=e,i.sibling=null,t!==null&&(n=e.deletions,n===null?(e.deletions=[t],e.flags|=16):n.push(t)),e.child=i,e.memoizedState=null,i}function of(t,e){return e=mc({mode:"visible",children:e},t.mode,0,null),e.return=t,t.child=e}function To(t,e,n,i){return i!==null&&Xh(i),Hs(e,t.child,null,n),t=of(e,e.pendingProps.children),t.flags|=2,e.memoizedState=null,t}function Py(t,e,n,i,r,s,a){if(n)return e.flags&256?(e.flags&=-257,i=eu(Error(te(422))),To(t,e,a,i)):e.memoizedState!==null?(e.child=t.child,e.flags|=128,null):(s=i.fallback,r=e.mode,i=mc({mode:"visible",children:i.children},r,0,null),s=Ur(s,r,a,null),s.flags|=2,i.return=e,s.return=e,i.sibling=s,e.child=i,e.mode&1&&Hs(e,t.child,null,a),e.child.memoizedState=wd(a),e.memoizedState=Ed,s);if(!(e.mode&1))return To(t,e,a,null);if(r.data==="$!"){if(i=r.nextSibling&&r.nextSibling.dataset,i)var o=i.dgst;return i=o,s=Error(te(419)),i=eu(s,i,void 0),To(t,e,a,i)}if(o=(a&t.childLanes)!==0,cn||o){if(i=kt,i!==null){switch(a&-a){case 4:r=2;break;case 16:r=8;break;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:r=32;break;case 536870912:r=268435456;break;default:r=0}r=r&(i.suspendedLanes|a)?0:r,r!==0&&r!==s.retryLane&&(s.retryLane=r,Ri(t,r),Yn(i,t,r,-1))}return ff(),i=eu(Error(te(421))),To(t,e,a,i)}return r.data==="$?"?(e.flags|=128,e.child=t.child,e=Gy.bind(null,t),r._reactRetry=e,null):(t=s.treeContext,Mn=er(r.nextSibling),wn=e,ht=!0,Wn=null,t!==null&&(Ln[Dn++]=_i,Ln[Dn++]=xi,Ln[Dn++]=Or,_i=t.id,xi=t.overflow,Or=e),e=of(e,i.children),e.flags|=4096,e)}function Gp(t,e,n){t.lanes|=e;var i=t.alternate;i!==null&&(i.lanes|=e),vd(t.return,e,n)}function tu(t,e,n,i,r){var s=t.memoizedState;s===null?t.memoizedState={isBackwards:e,rendering:null,renderingStartTime:0,last:i,tail:n,tailMode:r}:(s.isBackwards=e,s.rendering=null,s.renderingStartTime=0,s.last=i,s.tail=n,s.tailMode=r)}function fv(t,e,n){var i=e.pendingProps,r=i.revealOrder,s=i.tail;if(qt(t,e,i.children,n),i=ft.current,i&2)i=i&1|2,e.flags|=128;else{if(t!==null&&t.flags&128)e:for(t=e.child;t!==null;){if(t.tag===13)t.memoizedState!==null&&Gp(t,n,e);else if(t.tag===19)Gp(t,n,e);else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break e;for(;t.sibling===null;){if(t.return===null||t.return===e)break e;t=t.return}t.sibling.return=t.return,t=t.sibling}i&=1}if(at(ft,i),!(e.mode&1))e.memoizedState=null;else switch(r){case"forwards":for(n=e.child,r=null;n!==null;)t=n.alternate,t!==null&&Bl(t)===null&&(r=n),n=n.sibling;n=r,n===null?(r=e.child,e.child=null):(r=n.sibling,n.sibling=null),tu(e,!1,r,n,s);break;case"backwards":for(n=null,r=e.child,e.child=null;r!==null;){if(t=r.alternate,t!==null&&Bl(t)===null){e.child=r;break}t=r.sibling,r.sibling=n,n=r,r=t}tu(e,!0,n,null,s);break;case"together":tu(e,!1,null,null,void 0);break;default:e.memoizedState=null}return e.child}function dl(t,e){!(e.mode&1)&&t!==null&&(t.alternate=null,e.alternate=null,e.flags|=2)}function bi(t,e,n){if(t!==null&&(e.dependencies=t.dependencies),Br|=e.lanes,!(n&e.childLanes))return null;if(t!==null&&e.child!==t.child)throw Error(te(153));if(e.child!==null){for(t=e.child,n=rr(t,t.pendingProps),e.child=n,n.return=e;t.sibling!==null;)t=t.sibling,n=n.sibling=rr(t,t.pendingProps),n.return=e;n.sibling=null}return e.child}function Ly(t,e,n){switch(e.tag){case 3:dv(e),Bs();break;case 5:z0(e);break;case 1:hn(e.type)&&Il(e);break;case 4:Qh(e,e.stateNode.containerInfo);break;case 10:var i=e.type._context,r=e.memoizedProps.value;at(Fl,i._currentValue),i._currentValue=r;break;case 13:if(i=e.memoizedState,i!==null)return i.dehydrated!==null?(at(ft,ft.current&1),e.flags|=128,null):n&e.child.childLanes?hv(t,e,n):(at(ft,ft.current&1),t=bi(t,e,n),t!==null?t.sibling:null);at(ft,ft.current&1);break;case 19:if(i=(n&e.childLanes)!==0,t.flags&128){if(i)return fv(t,e,n);e.flags|=128}if(r=e.memoizedState,r!==null&&(r.rendering=null,r.tail=null,r.lastEffect=null),at(ft,ft.current),i)break;return null;case 22:case 23:return e.lanes=0,cv(t,e,n)}return bi(t,e,n)}var pv,Td,mv,gv;pv=function(t,e){for(var n=e.child;n!==null;){if(n.tag===5||n.tag===6)t.appendChild(n.stateNode);else if(n.tag!==4&&n.child!==null){n.child.return=n,n=n.child;continue}if(n===e)break;for(;n.sibling===null;){if(n.return===null||n.return===e)return;n=n.return}n.sibling.return=n.return,n=n.sibling}};Td=function(){};mv=function(t,e,n,i){var r=t.memoizedProps;if(r!==i){t=e.stateNode,Dr(ai.current);var s=null;switch(n){case"input":r=$u(t,r),i=$u(t,i),s=[];break;case"select":r=mt({},r,{value:void 0}),i=mt({},i,{value:void 0}),s=[];break;case"textarea":r=Ku(t,r),i=Ku(t,i),s=[];break;default:typeof r.onClick!="function"&&typeof i.onClick=="function"&&(t.onclick=Dl)}Qu(n,i);var a;n=null;for(c in r)if(!i.hasOwnProperty(c)&&r.hasOwnProperty(c)&&r[c]!=null)if(c==="style"){var o=r[c];for(a in o)o.hasOwnProperty(a)&&(n||(n={}),n[a]="")}else c!=="dangerouslySetInnerHTML"&&c!=="children"&&c!=="suppressContentEditableWarning"&&c!=="suppressHydrationWarning"&&c!=="autoFocus"&&(ka.hasOwnProperty(c)?s||(s=[]):(s=s||[]).push(c,null));for(c in i){var l=i[c];if(o=r?.[c],i.hasOwnProperty(c)&&l!==o&&(l!=null||o!=null))if(c==="style")if(o){for(a in o)!o.hasOwnProperty(a)||l&&l.hasOwnProperty(a)||(n||(n={}),n[a]="");for(a in l)l.hasOwnProperty(a)&&o[a]!==l[a]&&(n||(n={}),n[a]=l[a])}else n||(s||(s=[]),s.push(c,n)),n=l;else c==="dangerouslySetInnerHTML"?(l=l?l.__html:void 0,o=o?o.__html:void 0,l!=null&&o!==l&&(s=s||[]).push(c,l)):c==="children"?typeof l!="string"&&typeof l!="number"||(s=s||[]).push(c,""+l):c!=="suppressContentEditableWarning"&&c!=="suppressHydrationWarning"&&(ka.hasOwnProperty(c)?(l!=null&&c==="onScroll"&&ct("scroll",t),s||o===l||(s=[])):(s=s||[]).push(c,l))}n&&(s=s||[]).push("style",n);var c=s;(e.updateQueue=c)&&(e.flags|=4)}};gv=function(t,e,n,i){n!==i&&(e.flags|=4)};function ua(t,e){if(!ht)switch(t.tailMode){case"hidden":e=t.tail;for(var n=null;e!==null;)e.alternate!==null&&(n=e),e=e.sibling;n===null?t.tail=null:n.sibling=null;break;case"collapsed":n=t.tail;for(var i=null;n!==null;)n.alternate!==null&&(i=n),n=n.sibling;i===null?e||t.tail===null?t.tail=null:t.tail.sibling=null:i.sibling=null}}function Gt(t){var e=t.alternate!==null&&t.alternate.child===t.child,n=0,i=0;if(e)for(var r=t.child;r!==null;)n|=r.lanes|r.childLanes,i|=r.subtreeFlags&14680064,i|=r.flags&14680064,r.return=t,r=r.sibling;else for(r=t.child;r!==null;)n|=r.lanes|r.childLanes,i|=r.subtreeFlags,i|=r.flags,r.return=t,r=r.sibling;return t.subtreeFlags|=i,t.childLanes=n,e}function Dy(t,e,n){var i=e.pendingProps;switch(jh(e),e.tag){case 2:case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return Gt(e),null;case 1:return hn(e.type)&&Nl(),Gt(e),null;case 3:return i=e.stateNode,Vs(),dt(dn),dt($t),ef(),i.pendingContext&&(i.context=i.pendingContext,i.pendingContext=null),(t===null||t.child===null)&&(Eo(e)?e.flags|=4:t===null||t.memoizedState.isDehydrated&&!(e.flags&256)||(e.flags|=1024,Wn!==null&&(Nd(Wn),Wn=null))),Td(t,e),Gt(e),null;case 5:Jh(e);var r=Dr(Ya.current);if(n=e.type,t!==null&&e.stateNode!=null)mv(t,e,n,i,r),t.ref!==e.ref&&(e.flags|=512,e.flags|=2097152);else{if(!i){if(e.stateNode===null)throw Error(te(166));return Gt(e),null}if(t=Dr(ai.current),Eo(e)){i=e.stateNode,n=e.type;var s=e.memoizedProps;switch(i[ni]=e,i[Xa]=s,t=(e.mode&1)!==0,n){case"dialog":ct("cancel",i),ct("close",i);break;case"iframe":case"object":case"embed":ct("load",i);break;case"video":case"audio":for(r=0;r<wa.length;r++)ct(wa[r],i);break;case"source":ct("error",i);break;case"img":case"image":case"link":ct("error",i),ct("load",i);break;case"details":ct("toggle",i);break;case"input":Qf(i,s),ct("invalid",i);break;case"select":i._wrapperState={wasMultiple:!!s.multiple},ct("invalid",i);break;case"textarea":ep(i,s),ct("invalid",i)}Qu(n,s),r=null;for(var a in s)if(s.hasOwnProperty(a)){var o=s[a];a==="children"?typeof o=="string"?i.textContent!==o&&(s.suppressHydrationWarning!==!0&&Mo(i.textContent,o,t),r=["children",o]):typeof o=="number"&&i.textContent!==""+o&&(s.suppressHydrationWarning!==!0&&Mo(i.textContent,o,t),r=["children",""+o]):ka.hasOwnProperty(a)&&o!=null&&a==="onScroll"&&ct("scroll",i)}switch(n){case"input":po(i),Jf(i,s,!0);break;case"textarea":po(i),tp(i);break;case"select":case"option":break;default:typeof s.onClick=="function"&&(i.onclick=Dl)}i=r,e.updateQueue=i,i!==null&&(e.flags|=4)}else{a=r.nodeType===9?r:r.ownerDocument,t==="http://www.w3.org/1999/xhtml"&&(t=Wg(n)),t==="http://www.w3.org/1999/xhtml"?n==="script"?(t=a.createElement("div"),t.innerHTML="<script><\/script>",t=t.removeChild(t.firstChild)):typeof i.is=="string"?t=a.createElement(n,{is:i.is}):(t=a.createElement(n),n==="select"&&(a=t,i.multiple?a.multiple=!0:i.size&&(a.size=i.size))):t=a.createElementNS(t,n),t[ni]=e,t[Xa]=i,pv(t,e,!1,!1),e.stateNode=t;e:{switch(a=Ju(n,i),n){case"dialog":ct("cancel",t),ct("close",t),r=i;break;case"iframe":case"object":case"embed":ct("load",t),r=i;break;case"video":case"audio":for(r=0;r<wa.length;r++)ct(wa[r],t);r=i;break;case"source":ct("error",t),r=i;break;case"img":case"image":case"link":ct("error",t),ct("load",t),r=i;break;case"details":ct("toggle",t),r=i;break;case"input":Qf(t,i),r=$u(t,i),ct("invalid",t);break;case"option":r=i;break;case"select":t._wrapperState={wasMultiple:!!i.multiple},r=mt({},i,{value:void 0}),ct("invalid",t);break;case"textarea":ep(t,i),r=Ku(t,i),ct("invalid",t);break;default:r=i}Qu(n,r),o=r;for(s in o)if(o.hasOwnProperty(s)){var l=o[s];s==="style"?$g(t,l):s==="dangerouslySetInnerHTML"?(l=l?l.__html:void 0,l!=null&&jg(t,l)):s==="children"?typeof l=="string"?(n!=="textarea"||l!=="")&&Fa(t,l):typeof l=="number"&&Fa(t,""+l):s!=="suppressContentEditableWarning"&&s!=="suppressHydrationWarning"&&s!=="autoFocus"&&(ka.hasOwnProperty(s)?l!=null&&s==="onScroll"&&ct("scroll",t):l!=null&&Ph(t,s,l,a))}switch(n){case"input":po(t),Jf(t,i,!1);break;case"textarea":po(t),tp(t);break;case"option":i.value!=null&&t.setAttribute("value",""+or(i.value));break;case"select":t.multiple=!!i.multiple,s=i.value,s!=null?Rs(t,!!i.multiple,s,!1):i.defaultValue!=null&&Rs(t,!!i.multiple,i.defaultValue,!0);break;default:typeof r.onClick=="function"&&(t.onclick=Dl)}switch(n){case"button":case"input":case"select":case"textarea":i=!!i.autoFocus;break e;case"img":i=!0;break e;default:i=!1}}i&&(e.flags|=4)}e.ref!==null&&(e.flags|=512,e.flags|=2097152)}return Gt(e),null;case 6:if(t&&e.stateNode!=null)gv(t,e,t.memoizedProps,i);else{if(typeof i!="string"&&e.stateNode===null)throw Error(te(166));if(n=Dr(Ya.current),Dr(ai.current),Eo(e)){if(i=e.stateNode,n=e.memoizedProps,i[ni]=e,(s=i.nodeValue!==n)&&(t=wn,t!==null))switch(t.tag){case 3:Mo(i.nodeValue,n,(t.mode&1)!==0);break;case 5:t.memoizedProps.suppressHydrationWarning!==!0&&Mo(i.nodeValue,n,(t.mode&1)!==0)}s&&(e.flags|=4)}else i=(n.nodeType===9?n:n.ownerDocument).createTextNode(i),i[ni]=e,e.stateNode=i}return Gt(e),null;case 13:if(dt(ft),i=e.memoizedState,t===null||t.memoizedState!==null&&t.memoizedState.dehydrated!==null){if(ht&&Mn!==null&&e.mode&1&&!(e.flags&128))I0(),Bs(),e.flags|=98560,s=!1;else if(s=Eo(e),i!==null&&i.dehydrated!==null){if(t===null){if(!s)throw Error(te(318));if(s=e.memoizedState,s=s!==null?s.dehydrated:null,!s)throw Error(te(317));s[ni]=e}else Bs(),!(e.flags&128)&&(e.memoizedState=null),e.flags|=4;Gt(e),s=!1}else Wn!==null&&(Nd(Wn),Wn=null),s=!0;if(!s)return e.flags&65536?e:null}return e.flags&128?(e.lanes=n,e):(i=i!==null,i!==(t!==null&&t.memoizedState!==null)&&i&&(e.child.flags|=8192,e.mode&1&&(t===null||ft.current&1?Rt===0&&(Rt=3):ff())),e.updateQueue!==null&&(e.flags|=4),Gt(e),null);case 4:return Vs(),Td(t,e),t===null&&Wa(e.stateNode.containerInfo),Gt(e),null;case 10:return qh(e.type._context),Gt(e),null;case 17:return hn(e.type)&&Nl(),Gt(e),null;case 19:if(dt(ft),s=e.memoizedState,s===null)return Gt(e),null;if(i=(e.flags&128)!==0,a=s.rendering,a===null)if(i)ua(s,!1);else{if(Rt!==0||t!==null&&t.flags&128)for(t=e.child;t!==null;){if(a=Bl(t),a!==null){for(e.flags|=128,ua(s,!1),i=a.updateQueue,i!==null&&(e.updateQueue=i,e.flags|=4),e.subtreeFlags=0,i=n,n=e.child;n!==null;)s=n,t=i,s.flags&=14680066,a=s.alternate,a===null?(s.childLanes=0,s.lanes=t,s.child=null,s.subtreeFlags=0,s.memoizedProps=null,s.memoizedState=null,s.updateQueue=null,s.dependencies=null,s.stateNode=null):(s.childLanes=a.childLanes,s.lanes=a.lanes,s.child=a.child,s.subtreeFlags=0,s.deletions=null,s.memoizedProps=a.memoizedProps,s.memoizedState=a.memoizedState,s.updateQueue=a.updateQueue,s.type=a.type,t=a.dependencies,s.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext}),n=n.sibling;return at(ft,ft.current&1|2),e.child}t=t.sibling}s.tail!==null&&yt()>Ws&&(e.flags|=128,i=!0,ua(s,!1),e.lanes=4194304)}else{if(!i)if(t=Bl(a),t!==null){if(e.flags|=128,i=!0,n=t.updateQueue,n!==null&&(e.updateQueue=n,e.flags|=4),ua(s,!0),s.tail===null&&s.tailMode==="hidden"&&!a.alternate&&!ht)return Gt(e),null}else 2*yt()-s.renderingStartTime>Ws&&n!==1073741824&&(e.flags|=128,i=!0,ua(s,!1),e.lanes=4194304);s.isBackwards?(a.sibling=e.child,e.child=a):(n=s.last,n!==null?n.sibling=a:e.child=a,s.last=a)}return s.tail!==null?(e=s.tail,s.rendering=e,s.tail=e.sibling,s.renderingStartTime=yt(),e.sibling=null,n=ft.current,at(ft,i?n&1|2:n&1),e):(Gt(e),null);case 22:case 23:return hf(),i=e.memoizedState!==null,t!==null&&t.memoizedState!==null!==i&&(e.flags|=8192),i&&e.mode&1?xn&1073741824&&(Gt(e),e.subtreeFlags&6&&(e.flags|=8192)):Gt(e),null;case 24:return null;case 25:return null}throw Error(te(156,e.tag))}function Ny(t,e){switch(jh(e),e.tag){case 1:return hn(e.type)&&Nl(),t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 3:return Vs(),dt(dn),dt($t),ef(),t=e.flags,t&65536&&!(t&128)?(e.flags=t&-65537|128,e):null;case 5:return Jh(e),null;case 13:if(dt(ft),t=e.memoizedState,t!==null&&t.dehydrated!==null){if(e.alternate===null)throw Error(te(340));Bs()}return t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 19:return dt(ft),null;case 4:return Vs(),null;case 10:return qh(e.type._context),null;case 22:case 23:return hf(),null;case 24:return null;default:return null}}var Ao=!1,Xt=!1,Iy=typeof WeakSet=="function"?WeakSet:Set,me=null;function Es(t,e){var n=t.ref;if(n!==null)if(typeof n=="function")try{n(null)}catch(i){vt(t,e,i)}else n.current=null}function Ad(t,e,n){try{n()}catch(i){vt(t,e,i)}}var Wp=!1;function Uy(t,e){if(cd=bl,t=S0(),Gh(t)){if("selectionStart"in t)var n={start:t.selectionStart,end:t.selectionEnd};else e:{n=(n=t.ownerDocument)&&n.defaultView||window;var i=n.getSelection&&n.getSelection();if(i&&i.rangeCount!==0){n=i.anchorNode;var r=i.anchorOffset,s=i.focusNode;i=i.focusOffset;try{n.nodeType,s.nodeType}catch{n=null;break e}var a=0,o=-1,l=-1,c=0,u=0,h=t,f=null;t:for(;;){for(var p;h!==n||r!==0&&h.nodeType!==3||(o=a+r),h!==s||i!==0&&h.nodeType!==3||(l=a+i),h.nodeType===3&&(a+=h.nodeValue.length),(p=h.firstChild)!==null;)f=h,h=p;for(;;){if(h===t)break t;if(f===n&&++c===r&&(o=a),f===s&&++u===i&&(l=a),(p=h.nextSibling)!==null)break;h=f,f=h.parentNode}h=p}n=o===-1||l===-1?null:{start:o,end:l}}else n=null}n=n||{start:0,end:0}}else n=null;for(ud={focusedElem:t,selectionRange:n},bl=!1,me=e;me!==null;)if(e=me,t=e.child,(e.subtreeFlags&1028)!==0&&t!==null)t.return=e,me=t;else for(;me!==null;){e=me;try{var _=e.alternate;if(e.flags&1024)switch(e.tag){case 0:case 11:case 15:break;case 1:if(_!==null){var y=_.memoizedProps,m=_.memoizedState,d=e.stateNode,g=d.getSnapshotBeforeUpdate(e.elementType===e.type?y:Vn(e.type,y),m);d.__reactInternalSnapshotBeforeUpdate=g}break;case 3:var v=e.stateNode.containerInfo;v.nodeType===1?v.textContent="":v.nodeType===9&&v.documentElement&&v.removeChild(v.documentElement);break;case 5:case 6:case 4:case 17:break;default:throw Error(te(163))}}catch(S){vt(e,e.return,S)}if(t=e.sibling,t!==null){t.return=e.return,me=t;break}me=e.return}return _=Wp,Wp=!1,_}function Da(t,e,n){var i=e.updateQueue;if(i=i!==null?i.lastEffect:null,i!==null){var r=i=i.next;do{if((r.tag&t)===t){var s=r.destroy;r.destroy=void 0,s!==void 0&&Ad(e,n,s)}r=r.next}while(r!==i)}}function fc(t,e){if(e=e.updateQueue,e=e!==null?e.lastEffect:null,e!==null){var n=e=e.next;do{if((n.tag&t)===t){var i=n.create;n.destroy=i()}n=n.next}while(n!==e)}}function Cd(t){var e=t.ref;if(e!==null){var n=t.stateNode;switch(t.tag){case 5:t=n;break;default:t=n}typeof e=="function"?e(t):e.current=t}}function vv(t){var e=t.alternate;e!==null&&(t.alternate=null,vv(e)),t.child=null,t.deletions=null,t.sibling=null,t.tag===5&&(e=t.stateNode,e!==null&&(delete e[ni],delete e[Xa],delete e[fd],delete e[vy],delete e[_y])),t.stateNode=null,t.return=null,t.dependencies=null,t.memoizedProps=null,t.memoizedState=null,t.pendingProps=null,t.stateNode=null,t.updateQueue=null}function _v(t){return t.tag===5||t.tag===3||t.tag===4}function jp(t){e:for(;;){for(;t.sibling===null;){if(t.return===null||_v(t.return))return null;t=t.return}for(t.sibling.return=t.return,t=t.sibling;t.tag!==5&&t.tag!==6&&t.tag!==18;){if(t.flags&2||t.child===null||t.tag===4)continue e;t.child.return=t,t=t.child}if(!(t.flags&2))return t.stateNode}}function Rd(t,e,n){var i=t.tag;if(i===5||i===6)t=t.stateNode,e?n.nodeType===8?n.parentNode.insertBefore(t,e):n.insertBefore(t,e):(n.nodeType===8?(e=n.parentNode,e.insertBefore(t,n)):(e=n,e.appendChild(t)),n=n._reactRootContainer,n!=null||e.onclick!==null||(e.onclick=Dl));else if(i!==4&&(t=t.child,t!==null))for(Rd(t,e,n),t=t.sibling;t!==null;)Rd(t,e,n),t=t.sibling}function bd(t,e,n){var i=t.tag;if(i===5||i===6)t=t.stateNode,e?n.insertBefore(t,e):n.appendChild(t);else if(i!==4&&(t=t.child,t!==null))for(bd(t,e,n),t=t.sibling;t!==null;)bd(t,e,n),t=t.sibling}var Ot=null,Gn=!1;function Ii(t,e,n){for(n=n.child;n!==null;)xv(t,e,n),n=n.sibling}function xv(t,e,n){if(si&&typeof si.onCommitFiberUnmount=="function")try{si.onCommitFiberUnmount(sc,n)}catch{}switch(n.tag){case 5:Xt||Es(n,e);case 6:var i=Ot,r=Gn;Ot=null,Ii(t,e,n),Ot=i,Gn=r,Ot!==null&&(Gn?(t=Ot,n=n.stateNode,t.nodeType===8?t.parentNode.removeChild(n):t.removeChild(n)):Ot.removeChild(n.stateNode));break;case 18:Ot!==null&&(Gn?(t=Ot,n=n.stateNode,t.nodeType===8?Yc(t.parentNode,n):t.nodeType===1&&Yc(t,n),Ha(t)):Yc(Ot,n.stateNode));break;case 4:i=Ot,r=Gn,Ot=n.stateNode.containerInfo,Gn=!0,Ii(t,e,n),Ot=i,Gn=r;break;case 0:case 11:case 14:case 15:if(!Xt&&(i=n.updateQueue,i!==null&&(i=i.lastEffect,i!==null))){r=i=i.next;do{var s=r,a=s.destroy;s=s.tag,a!==void 0&&(s&2||s&4)&&Ad(n,e,a),r=r.next}while(r!==i)}Ii(t,e,n);break;case 1:if(!Xt&&(Es(n,e),i=n.stateNode,typeof i.componentWillUnmount=="function"))try{i.props=n.memoizedProps,i.state=n.memoizedState,i.componentWillUnmount()}catch(o){vt(n,e,o)}Ii(t,e,n);break;case 21:Ii(t,e,n);break;case 22:n.mode&1?(Xt=(i=Xt)||n.memoizedState!==null,Ii(t,e,n),Xt=i):Ii(t,e,n);break;default:Ii(t,e,n)}}function Xp(t){var e=t.updateQueue;if(e!==null){t.updateQueue=null;var n=t.stateNode;n===null&&(n=t.stateNode=new Iy),e.forEach(function(i){var r=Wy.bind(null,t,i);n.has(i)||(n.add(i),i.then(r,r))})}}function On(t,e){var n=e.deletions;if(n!==null)for(var i=0;i<n.length;i++){var r=n[i];try{var s=t,a=e,o=a;e:for(;o!==null;){switch(o.tag){case 5:Ot=o.stateNode,Gn=!1;break e;case 3:Ot=o.stateNode.containerInfo,Gn=!0;break e;case 4:Ot=o.stateNode.containerInfo,Gn=!0;break e}o=o.return}if(Ot===null)throw Error(te(160));xv(s,a,r),Ot=null,Gn=!1;var l=r.alternate;l!==null&&(l.return=null),r.return=null}catch(c){vt(r,e,c)}}if(e.subtreeFlags&12854)for(e=e.child;e!==null;)yv(e,t),e=e.sibling}function yv(t,e){var n=t.alternate,i=t.flags;switch(t.tag){case 0:case 11:case 14:case 15:if(On(e,t),Zn(t),i&4){try{Da(3,t,t.return),fc(3,t)}catch(y){vt(t,t.return,y)}try{Da(5,t,t.return)}catch(y){vt(t,t.return,y)}}break;case 1:On(e,t),Zn(t),i&512&&n!==null&&Es(n,n.return);break;case 5:if(On(e,t),Zn(t),i&512&&n!==null&&Es(n,n.return),t.flags&32){var r=t.stateNode;try{Fa(r,"")}catch(y){vt(t,t.return,y)}}if(i&4&&(r=t.stateNode,r!=null)){var s=t.memoizedProps,a=n!==null?n.memoizedProps:s,o=t.type,l=t.updateQueue;if(t.updateQueue=null,l!==null)try{o==="input"&&s.type==="radio"&&s.name!=null&&Vg(r,s),Ju(o,a);var c=Ju(o,s);for(a=0;a<l.length;a+=2){var u=l[a],h=l[a+1];u==="style"?$g(r,h):u==="dangerouslySetInnerHTML"?jg(r,h):u==="children"?Fa(r,h):Ph(r,u,h,c)}switch(o){case"input":Yu(r,s);break;case"textarea":Gg(r,s);break;case"select":var f=r._wrapperState.wasMultiple;r._wrapperState.wasMultiple=!!s.multiple;var p=s.value;p!=null?Rs(r,!!s.multiple,p,!1):f!==!!s.multiple&&(s.defaultValue!=null?Rs(r,!!s.multiple,s.defaultValue,!0):Rs(r,!!s.multiple,s.multiple?[]:"",!1))}r[Xa]=s}catch(y){vt(t,t.return,y)}}break;case 6:if(On(e,t),Zn(t),i&4){if(t.stateNode===null)throw Error(te(162));r=t.stateNode,s=t.memoizedProps;try{r.nodeValue=s}catch(y){vt(t,t.return,y)}}break;case 3:if(On(e,t),Zn(t),i&4&&n!==null&&n.memoizedState.isDehydrated)try{Ha(e.containerInfo)}catch(y){vt(t,t.return,y)}break;case 4:On(e,t),Zn(t);break;case 13:On(e,t),Zn(t),r=t.child,r.flags&8192&&(s=r.memoizedState!==null,r.stateNode.isHidden=s,!s||r.alternate!==null&&r.alternate.memoizedState!==null||(uf=yt())),i&4&&Xp(t);break;case 22:if(u=n!==null&&n.memoizedState!==null,t.mode&1?(Xt=(c=Xt)||u,On(e,t),Xt=c):On(e,t),Zn(t),i&8192){if(c=t.memoizedState!==null,(t.stateNode.isHidden=c)&&!u&&t.mode&1)for(me=t,u=t.child;u!==null;){for(h=me=u;me!==null;){switch(f=me,p=f.child,f.tag){case 0:case 11:case 14:case 15:Da(4,f,f.return);break;case 1:Es(f,f.return);var _=f.stateNode;if(typeof _.componentWillUnmount=="function"){i=f,n=f.return;try{e=i,_.props=e.memoizedProps,_.state=e.memoizedState,_.componentWillUnmount()}catch(y){vt(i,n,y)}}break;case 5:Es(f,f.return);break;case 22:if(f.memoizedState!==null){Yp(h);continue}}p!==null?(p.return=f,me=p):Yp(h)}u=u.sibling}e:for(u=null,h=t;;){if(h.tag===5){if(u===null){u=h;try{r=h.stateNode,c?(s=r.style,typeof s.setProperty=="function"?s.setProperty("display","none","important"):s.display="none"):(o=h.stateNode,l=h.memoizedProps.style,a=l!=null&&l.hasOwnProperty("display")?l.display:null,o.style.display=Xg("display",a))}catch(y){vt(t,t.return,y)}}}else if(h.tag===6){if(u===null)try{h.stateNode.nodeValue=c?"":h.memoizedProps}catch(y){vt(t,t.return,y)}}else if((h.tag!==22&&h.tag!==23||h.memoizedState===null||h===t)&&h.child!==null){h.child.return=h,h=h.child;continue}if(h===t)break e;for(;h.sibling===null;){if(h.return===null||h.return===t)break e;u===h&&(u=null),h=h.return}u===h&&(u=null),h.sibling.return=h.return,h=h.sibling}}break;case 19:On(e,t),Zn(t),i&4&&Xp(t);break;case 21:break;default:On(e,t),Zn(t)}}function Zn(t){var e=t.flags;if(e&2){try{e:{for(var n=t.return;n!==null;){if(_v(n)){var i=n;break e}n=n.return}throw Error(te(160))}switch(i.tag){case 5:var r=i.stateNode;i.flags&32&&(Fa(r,""),i.flags&=-33);var s=jp(t);bd(t,s,r);break;case 3:case 4:var a=i.stateNode.containerInfo,o=jp(t);Rd(t,o,a);break;default:throw Error(te(161))}}catch(l){vt(t,t.return,l)}t.flags&=-3}e&4096&&(t.flags&=-4097)}function ky(t,e,n){me=t,Sv(t)}function Sv(t,e,n){for(var i=(t.mode&1)!==0;me!==null;){var r=me,s=r.child;if(r.tag===22&&i){var a=r.memoizedState!==null||Ao;if(!a){var o=r.alternate,l=o!==null&&o.memoizedState!==null||Xt;o=Ao;var c=Xt;if(Ao=a,(Xt=l)&&!c)for(me=r;me!==null;)a=me,l=a.child,a.tag===22&&a.memoizedState!==null?qp(r):l!==null?(l.return=a,me=l):qp(r);for(;s!==null;)me=s,Sv(s),s=s.sibling;me=r,Ao=o,Xt=c}$p(t)}else r.subtreeFlags&8772&&s!==null?(s.return=r,me=s):$p(t)}}function $p(t){for(;me!==null;){var e=me;if(e.flags&8772){var n=e.alternate;try{if(e.flags&8772)switch(e.tag){case 0:case 11:case 15:Xt||fc(5,e);break;case 1:var i=e.stateNode;if(e.flags&4&&!Xt)if(n===null)i.componentDidMount();else{var r=e.elementType===e.type?n.memoizedProps:Vn(e.type,n.memoizedProps);i.componentDidUpdate(r,n.memoizedState,i.__reactInternalSnapshotBeforeUpdate)}var s=e.updateQueue;s!==null&&Lp(e,s,i);break;case 3:var a=e.updateQueue;if(a!==null){if(n=null,e.child!==null)switch(e.child.tag){case 5:n=e.child.stateNode;break;case 1:n=e.child.stateNode}Lp(e,a,n)}break;case 5:var o=e.stateNode;if(n===null&&e.flags&4){n=o;var l=e.memoizedProps;switch(e.type){case"button":case"input":case"select":case"textarea":l.autoFocus&&n.focus();break;case"img":l.src&&(n.src=l.src)}}break;case 6:break;case 4:break;case 12:break;case 13:if(e.memoizedState===null){var c=e.alternate;if(c!==null){var u=c.memoizedState;if(u!==null){var h=u.dehydrated;h!==null&&Ha(h)}}}break;case 19:case 17:case 21:case 22:case 23:case 25:break;default:throw Error(te(163))}Xt||e.flags&512&&Cd(e)}catch(f){vt(e,e.return,f)}}if(e===t){me=null;break}if(n=e.sibling,n!==null){n.return=e.return,me=n;break}me=e.return}}function Yp(t){for(;me!==null;){var e=me;if(e===t){me=null;break}var n=e.sibling;if(n!==null){n.return=e.return,me=n;break}me=e.return}}function qp(t){for(;me!==null;){var e=me;try{switch(e.tag){case 0:case 11:case 15:var n=e.return;try{fc(4,e)}catch(l){vt(e,n,l)}break;case 1:var i=e.stateNode;if(typeof i.componentDidMount=="function"){var r=e.return;try{i.componentDidMount()}catch(l){vt(e,r,l)}}var s=e.return;try{Cd(e)}catch(l){vt(e,s,l)}break;case 5:var a=e.return;try{Cd(e)}catch(l){vt(e,a,l)}}}catch(l){vt(e,e.return,l)}if(e===t){me=null;break}var o=e.sibling;if(o!==null){o.return=e.return,me=o;break}me=e.return}}var Fy=Math.ceil,Gl=Di.ReactCurrentDispatcher,lf=Di.ReactCurrentOwner,In=Di.ReactCurrentBatchConfig,je=0,kt=null,wt=null,zt=0,xn=0,ws=dr(0),Rt=0,Qa=null,Br=0,pc=0,cf=0,Na=null,an=null,uf=0,Ws=1/0,pi=null,Wl=!1,Pd=null,nr=null,Co=!1,$i=null,jl=0,Ia=0,Ld=null,hl=-1,fl=0;function Zt(){return je&6?yt():hl!==-1?hl:hl=yt()}function ir(t){return t.mode&1?je&2&&zt!==0?zt&-zt:yy.transition!==null?(fl===0&&(fl=s0()),fl):(t=tt,t!==0||(t=window.event,t=t===void 0?16:h0(t.type)),t):1}function Yn(t,e,n,i){if(50<Ia)throw Ia=0,Ld=null,Error(te(185));no(t,n,i),(!(je&2)||t!==kt)&&(t===kt&&(!(je&2)&&(pc|=n),Rt===4&&Wi(t,zt)),fn(t,i),n===1&&je===0&&!(e.mode&1)&&(Ws=yt()+500,uc&&hr()))}function fn(t,e){var n=t.callbackNode;yx(t,e);var i=Rl(t,t===kt?zt:0);if(i===0)n!==null&&rp(n),t.callbackNode=null,t.callbackPriority=0;else if(e=i&-i,t.callbackPriority!==e){if(n!=null&&rp(n),e===1)t.tag===0?xy(Kp.bind(null,t)):L0(Kp.bind(null,t)),my(function(){!(je&6)&&hr()}),n=null;else{switch(a0(i)){case 1:n=Uh;break;case 4:n=i0;break;case 16:n=Cl;break;case 536870912:n=r0;break;default:n=Cl}n=bv(n,Mv.bind(null,t))}t.callbackPriority=e,t.callbackNode=n}}function Mv(t,e){if(hl=-1,fl=0,je&6)throw Error(te(327));var n=t.callbackNode;if(Ns()&&t.callbackNode!==n)return null;var i=Rl(t,t===kt?zt:0);if(i===0)return null;if(i&30||i&t.expiredLanes||e)e=Xl(t,i);else{e=i;var r=je;je|=2;var s=wv();(kt!==t||zt!==e)&&(pi=null,Ws=yt()+500,Ir(t,e));do try{By();break}catch(o){Ev(t,o)}while(!0);Yh(),Gl.current=s,je=r,wt!==null?e=0:(kt=null,zt=0,e=Rt)}if(e!==0){if(e===2&&(r=rd(t),r!==0&&(i=r,e=Dd(t,r))),e===1)throw n=Qa,Ir(t,0),Wi(t,i),fn(t,yt()),n;if(e===6)Wi(t,i);else{if(r=t.current.alternate,!(i&30)&&!Oy(r)&&(e=Xl(t,i),e===2&&(s=rd(t),s!==0&&(i=s,e=Dd(t,s))),e===1))throw n=Qa,Ir(t,0),Wi(t,i),fn(t,yt()),n;switch(t.finishedWork=r,t.finishedLanes=i,e){case 0:case 1:throw Error(te(345));case 2:Tr(t,an,pi);break;case 3:if(Wi(t,i),(i&130023424)===i&&(e=uf+500-yt(),10<e)){if(Rl(t,0)!==0)break;if(r=t.suspendedLanes,(r&i)!==i){Zt(),t.pingedLanes|=t.suspendedLanes&r;break}t.timeoutHandle=hd(Tr.bind(null,t,an,pi),e);break}Tr(t,an,pi);break;case 4:if(Wi(t,i),(i&4194240)===i)break;for(e=t.eventTimes,r=-1;0<i;){var a=31-$n(i);s=1<<a,a=e[a],a>r&&(r=a),i&=~s}if(i=r,i=yt()-i,i=(120>i?120:480>i?480:1080>i?1080:1920>i?1920:3e3>i?3e3:4320>i?4320:1960*Fy(i/1960))-i,10<i){t.timeoutHandle=hd(Tr.bind(null,t,an,pi),i);break}Tr(t,an,pi);break;case 5:Tr(t,an,pi);break;default:throw Error(te(329))}}}return fn(t,yt()),t.callbackNode===n?Mv.bind(null,t):null}function Dd(t,e){var n=Na;return t.current.memoizedState.isDehydrated&&(Ir(t,e).flags|=256),t=Xl(t,e),t!==2&&(e=an,an=n,e!==null&&Nd(e)),t}function Nd(t){an===null?an=t:an.push.apply(an,t)}function Oy(t){for(var e=t;;){if(e.flags&16384){var n=e.updateQueue;if(n!==null&&(n=n.stores,n!==null))for(var i=0;i<n.length;i++){var r=n[i],s=r.getSnapshot;r=r.value;try{if(!qn(s(),r))return!1}catch{return!1}}}if(n=e.child,e.subtreeFlags&16384&&n!==null)n.return=e,e=n;else{if(e===t)break;for(;e.sibling===null;){if(e.return===null||e.return===t)return!0;e=e.return}e.sibling.return=e.return,e=e.sibling}}return!0}function Wi(t,e){for(e&=~cf,e&=~pc,t.suspendedLanes|=e,t.pingedLanes&=~e,t=t.expirationTimes;0<e;){var n=31-$n(e),i=1<<n;t[n]=-1,e&=~i}}function Kp(t){if(je&6)throw Error(te(327));Ns();var e=Rl(t,0);if(!(e&1))return fn(t,yt()),null;var n=Xl(t,e);if(t.tag!==0&&n===2){var i=rd(t);i!==0&&(e=i,n=Dd(t,i))}if(n===1)throw n=Qa,Ir(t,0),Wi(t,e),fn(t,yt()),n;if(n===6)throw Error(te(345));return t.finishedWork=t.current.alternate,t.finishedLanes=e,Tr(t,an,pi),fn(t,yt()),null}function df(t,e){var n=je;je|=1;try{return t(e)}finally{je=n,je===0&&(Ws=yt()+500,uc&&hr())}}function Hr(t){$i!==null&&$i.tag===0&&!(je&6)&&Ns();var e=je;je|=1;var n=In.transition,i=tt;try{if(In.transition=null,tt=1,t)return t()}finally{tt=i,In.transition=n,je=e,!(je&6)&&hr()}}function hf(){xn=ws.current,dt(ws)}function Ir(t,e){t.finishedWork=null,t.finishedLanes=0;var n=t.timeoutHandle;if(n!==-1&&(t.timeoutHandle=-1,py(n)),wt!==null)for(n=wt.return;n!==null;){var i=n;switch(jh(i),i.tag){case 1:i=i.type.childContextTypes,i!=null&&Nl();break;case 3:Vs(),dt(dn),dt($t),ef();break;case 5:Jh(i);break;case 4:Vs();break;case 13:dt(ft);break;case 19:dt(ft);break;case 10:qh(i.type._context);break;case 22:case 23:hf()}n=n.return}if(kt=t,wt=t=rr(t.current,null),zt=xn=e,Rt=0,Qa=null,cf=pc=Br=0,an=Na=null,Lr!==null){for(e=0;e<Lr.length;e++)if(n=Lr[e],i=n.interleaved,i!==null){n.interleaved=null;var r=i.next,s=n.pending;if(s!==null){var a=s.next;s.next=r,i.next=a}n.pending=i}Lr=null}return t}function Ev(t,e){do{var n=wt;try{if(Yh(),cl.current=Vl,Hl){for(var i=pt.memoizedState;i!==null;){var r=i.queue;r!==null&&(r.pending=null),i=i.next}Hl=!1}if(zr=0,It=At=pt=null,La=!1,qa=0,lf.current=null,n===null||n.return===null){Rt=1,Qa=e,wt=null;break}e:{var s=t,a=n.return,o=n,l=e;if(e=zt,o.flags|=32768,l!==null&&typeof l=="object"&&typeof l.then=="function"){var c=l,u=o,h=u.tag;if(!(u.mode&1)&&(h===0||h===11||h===15)){var f=u.alternate;f?(u.updateQueue=f.updateQueue,u.memoizedState=f.memoizedState,u.lanes=f.lanes):(u.updateQueue=null,u.memoizedState=null)}var p=Fp(a);if(p!==null){p.flags&=-257,Op(p,a,o,s,e),p.mode&1&&kp(s,c,e),e=p,l=c;var _=e.updateQueue;if(_===null){var y=new Set;y.add(l),e.updateQueue=y}else _.add(l);break e}else{if(!(e&1)){kp(s,c,e),ff();break e}l=Error(te(426))}}else if(ht&&o.mode&1){var m=Fp(a);if(m!==null){!(m.flags&65536)&&(m.flags|=256),Op(m,a,o,s,e),Xh(Gs(l,o));break e}}s=l=Gs(l,o),Rt!==4&&(Rt=2),Na===null?Na=[s]:Na.push(s),s=a;do{switch(s.tag){case 3:s.flags|=65536,e&=-e,s.lanes|=e;var d=av(s,l,e);Pp(s,d);break e;case 1:o=l;var g=s.type,v=s.stateNode;if(!(s.flags&128)&&(typeof g.getDerivedStateFromError=="function"||v!==null&&typeof v.componentDidCatch=="function"&&(nr===null||!nr.has(v)))){s.flags|=65536,e&=-e,s.lanes|=e;var S=ov(s,o,e);Pp(s,S);break e}}s=s.return}while(s!==null)}Av(n)}catch(b){e=b,wt===n&&n!==null&&(wt=n=n.return);continue}break}while(!0)}function wv(){var t=Gl.current;return Gl.current=Vl,t===null?Vl:t}function ff(){(Rt===0||Rt===3||Rt===2)&&(Rt=4),kt===null||!(Br&268435455)&&!(pc&268435455)||Wi(kt,zt)}function Xl(t,e){var n=je;je|=2;var i=wv();(kt!==t||zt!==e)&&(pi=null,Ir(t,e));do try{zy();break}catch(r){Ev(t,r)}while(!0);if(Yh(),je=n,Gl.current=i,wt!==null)throw Error(te(261));return kt=null,zt=0,Rt}function zy(){for(;wt!==null;)Tv(wt)}function By(){for(;wt!==null&&!dx();)Tv(wt)}function Tv(t){var e=Rv(t.alternate,t,xn);t.memoizedProps=t.pendingProps,e===null?Av(t):wt=e,lf.current=null}function Av(t){var e=t;do{var n=e.alternate;if(t=e.return,e.flags&32768){if(n=Ny(n,e),n!==null){n.flags&=32767,wt=n;return}if(t!==null)t.flags|=32768,t.subtreeFlags=0,t.deletions=null;else{Rt=6,wt=null;return}}else if(n=Dy(n,e,xn),n!==null){wt=n;return}if(e=e.sibling,e!==null){wt=e;return}wt=e=t}while(e!==null);Rt===0&&(Rt=5)}function Tr(t,e,n){var i=tt,r=In.transition;try{In.transition=null,tt=1,Hy(t,e,n,i)}finally{In.transition=r,tt=i}return null}function Hy(t,e,n,i){do Ns();while($i!==null);if(je&6)throw Error(te(327));n=t.finishedWork;var r=t.finishedLanes;if(n===null)return null;if(t.finishedWork=null,t.finishedLanes=0,n===t.current)throw Error(te(177));t.callbackNode=null,t.callbackPriority=0;var s=n.lanes|n.childLanes;if(Sx(t,s),t===kt&&(wt=kt=null,zt=0),!(n.subtreeFlags&2064)&&!(n.flags&2064)||Co||(Co=!0,bv(Cl,function(){return Ns(),null})),s=(n.flags&15990)!==0,n.subtreeFlags&15990||s){s=In.transition,In.transition=null;var a=tt;tt=1;var o=je;je|=4,lf.current=null,Uy(t,n),yv(n,t),oy(ud),bl=!!cd,ud=cd=null,t.current=n,ky(n),hx(),je=o,tt=a,In.transition=s}else t.current=n;if(Co&&(Co=!1,$i=t,jl=r),s=t.pendingLanes,s===0&&(nr=null),mx(n.stateNode),fn(t,yt()),e!==null)for(i=t.onRecoverableError,n=0;n<e.length;n++)r=e[n],i(r.value,{componentStack:r.stack,digest:r.digest});if(Wl)throw Wl=!1,t=Pd,Pd=null,t;return jl&1&&t.tag!==0&&Ns(),s=t.pendingLanes,s&1?t===Ld?Ia++:(Ia=0,Ld=t):Ia=0,hr(),null}function Ns(){if($i!==null){var t=a0(jl),e=In.transition,n=tt;try{if(In.transition=null,tt=16>t?16:t,$i===null)var i=!1;else{if(t=$i,$i=null,jl=0,je&6)throw Error(te(331));var r=je;for(je|=4,me=t.current;me!==null;){var s=me,a=s.child;if(me.flags&16){var o=s.deletions;if(o!==null){for(var l=0;l<o.length;l++){var c=o[l];for(me=c;me!==null;){var u=me;switch(u.tag){case 0:case 11:case 15:Da(8,u,s)}var h=u.child;if(h!==null)h.return=u,me=h;else for(;me!==null;){u=me;var f=u.sibling,p=u.return;if(vv(u),u===c){me=null;break}if(f!==null){f.return=p,me=f;break}me=p}}}var _=s.alternate;if(_!==null){var y=_.child;if(y!==null){_.child=null;do{var m=y.sibling;y.sibling=null,y=m}while(y!==null)}}me=s}}if(s.subtreeFlags&2064&&a!==null)a.return=s,me=a;else e:for(;me!==null;){if(s=me,s.flags&2048)switch(s.tag){case 0:case 11:case 15:Da(9,s,s.return)}var d=s.sibling;if(d!==null){d.return=s.return,me=d;break e}me=s.return}}var g=t.current;for(me=g;me!==null;){a=me;var v=a.child;if(a.subtreeFlags&2064&&v!==null)v.return=a,me=v;else e:for(a=g;me!==null;){if(o=me,o.flags&2048)try{switch(o.tag){case 0:case 11:case 15:fc(9,o)}}catch(b){vt(o,o.return,b)}if(o===a){me=null;break e}var S=o.sibling;if(S!==null){S.return=o.return,me=S;break e}me=o.return}}if(je=r,hr(),si&&typeof si.onPostCommitFiberRoot=="function")try{si.onPostCommitFiberRoot(sc,t)}catch{}i=!0}return i}finally{tt=n,In.transition=e}}return!1}function Zp(t,e,n){e=Gs(n,e),e=av(t,e,1),t=tr(t,e,1),e=Zt(),t!==null&&(no(t,1,e),fn(t,e))}function vt(t,e,n){if(t.tag===3)Zp(t,t,n);else for(;e!==null;){if(e.tag===3){Zp(e,t,n);break}else if(e.tag===1){var i=e.stateNode;if(typeof e.type.getDerivedStateFromError=="function"||typeof i.componentDidCatch=="function"&&(nr===null||!nr.has(i))){t=Gs(n,t),t=ov(e,t,1),e=tr(e,t,1),t=Zt(),e!==null&&(no(e,1,t),fn(e,t));break}}e=e.return}}function Vy(t,e,n){var i=t.pingCache;i!==null&&i.delete(e),e=Zt(),t.pingedLanes|=t.suspendedLanes&n,kt===t&&(zt&n)===n&&(Rt===4||Rt===3&&(zt&130023424)===zt&&500>yt()-uf?Ir(t,0):cf|=n),fn(t,e)}function Cv(t,e){e===0&&(t.mode&1?(e=vo,vo<<=1,!(vo&130023424)&&(vo=4194304)):e=1);var n=Zt();t=Ri(t,e),t!==null&&(no(t,e,n),fn(t,n))}function Gy(t){var e=t.memoizedState,n=0;e!==null&&(n=e.retryLane),Cv(t,n)}function Wy(t,e){var n=0;switch(t.tag){case 13:var i=t.stateNode,r=t.memoizedState;r!==null&&(n=r.retryLane);break;case 19:i=t.stateNode;break;default:throw Error(te(314))}i!==null&&i.delete(e),Cv(t,n)}var Rv;Rv=function(t,e,n){if(t!==null)if(t.memoizedProps!==e.pendingProps||dn.current)cn=!0;else{if(!(t.lanes&n)&&!(e.flags&128))return cn=!1,Ly(t,e,n);cn=!!(t.flags&131072)}else cn=!1,ht&&e.flags&1048576&&D0(e,kl,e.index);switch(e.lanes=0,e.tag){case 2:var i=e.type;dl(t,e),t=e.pendingProps;var r=zs(e,$t.current);Ds(e,n),r=nf(null,e,i,t,r,n);var s=rf();return e.flags|=1,typeof r=="object"&&r!==null&&typeof r.render=="function"&&r.$$typeof===void 0?(e.tag=1,e.memoizedState=null,e.updateQueue=null,hn(i)?(s=!0,Il(e)):s=!1,e.memoizedState=r.state!==null&&r.state!==void 0?r.state:null,Zh(e),r.updater=hc,e.stateNode=r,r._reactInternals=e,xd(e,i,t,n),e=Md(null,e,i,!0,s,n)):(e.tag=0,ht&&s&&Wh(e),qt(null,e,r,n),e=e.child),e;case 16:i=e.elementType;e:{switch(dl(t,e),t=e.pendingProps,r=i._init,i=r(i._payload),e.type=i,r=e.tag=Xy(i),t=Vn(i,t),r){case 0:e=Sd(null,e,i,t,n);break e;case 1:e=Hp(null,e,i,t,n);break e;case 11:e=zp(null,e,i,t,n);break e;case 14:e=Bp(null,e,i,Vn(i.type,t),n);break e}throw Error(te(306,i,""))}return e;case 0:return i=e.type,r=e.pendingProps,r=e.elementType===i?r:Vn(i,r),Sd(t,e,i,r,n);case 1:return i=e.type,r=e.pendingProps,r=e.elementType===i?r:Vn(i,r),Hp(t,e,i,r,n);case 3:e:{if(dv(e),t===null)throw Error(te(387));i=e.pendingProps,s=e.memoizedState,r=s.element,O0(t,e),zl(e,i,null,n);var a=e.memoizedState;if(i=a.element,s.isDehydrated)if(s={element:i,isDehydrated:!1,cache:a.cache,pendingSuspenseBoundaries:a.pendingSuspenseBoundaries,transitions:a.transitions},e.updateQueue.baseState=s,e.memoizedState=s,e.flags&256){r=Gs(Error(te(423)),e),e=Vp(t,e,i,n,r);break e}else if(i!==r){r=Gs(Error(te(424)),e),e=Vp(t,e,i,n,r);break e}else for(Mn=er(e.stateNode.containerInfo.firstChild),wn=e,ht=!0,Wn=null,n=k0(e,null,i,n),e.child=n;n;)n.flags=n.flags&-3|4096,n=n.sibling;else{if(Bs(),i===r){e=bi(t,e,n);break e}qt(t,e,i,n)}e=e.child}return e;case 5:return z0(e),t===null&&gd(e),i=e.type,r=e.pendingProps,s=t!==null?t.memoizedProps:null,a=r.children,dd(i,r)?a=null:s!==null&&dd(i,s)&&(e.flags|=32),uv(t,e),qt(t,e,a,n),e.child;case 6:return t===null&&gd(e),null;case 13:return hv(t,e,n);case 4:return Qh(e,e.stateNode.containerInfo),i=e.pendingProps,t===null?e.child=Hs(e,null,i,n):qt(t,e,i,n),e.child;case 11:return i=e.type,r=e.pendingProps,r=e.elementType===i?r:Vn(i,r),zp(t,e,i,r,n);case 7:return qt(t,e,e.pendingProps,n),e.child;case 8:return qt(t,e,e.pendingProps.children,n),e.child;case 12:return qt(t,e,e.pendingProps.children,n),e.child;case 10:e:{if(i=e.type._context,r=e.pendingProps,s=e.memoizedProps,a=r.value,at(Fl,i._currentValue),i._currentValue=a,s!==null)if(qn(s.value,a)){if(s.children===r.children&&!dn.current){e=bi(t,e,n);break e}}else for(s=e.child,s!==null&&(s.return=e);s!==null;){var o=s.dependencies;if(o!==null){a=s.child;for(var l=o.firstContext;l!==null;){if(l.context===i){if(s.tag===1){l=Ei(-1,n&-n),l.tag=2;var c=s.updateQueue;if(c!==null){c=c.shared;var u=c.pending;u===null?l.next=l:(l.next=u.next,u.next=l),c.pending=l}}s.lanes|=n,l=s.alternate,l!==null&&(l.lanes|=n),vd(s.return,n,e),o.lanes|=n;break}l=l.next}}else if(s.tag===10)a=s.type===e.type?null:s.child;else if(s.tag===18){if(a=s.return,a===null)throw Error(te(341));a.lanes|=n,o=a.alternate,o!==null&&(o.lanes|=n),vd(a,n,e),a=s.sibling}else a=s.child;if(a!==null)a.return=s;else for(a=s;a!==null;){if(a===e){a=null;break}if(s=a.sibling,s!==null){s.return=a.return,a=s;break}a=a.return}s=a}qt(t,e,r.children,n),e=e.child}return e;case 9:return r=e.type,i=e.pendingProps.children,Ds(e,n),r=Un(r),i=i(r),e.flags|=1,qt(t,e,i,n),e.child;case 14:return i=e.type,r=Vn(i,e.pendingProps),r=Vn(i.type,r),Bp(t,e,i,r,n);case 15:return lv(t,e,e.type,e.pendingProps,n);case 17:return i=e.type,r=e.pendingProps,r=e.elementType===i?r:Vn(i,r),dl(t,e),e.tag=1,hn(i)?(t=!0,Il(e)):t=!1,Ds(e,n),sv(e,i,r),xd(e,i,r,n),Md(null,e,i,!0,t,n);case 19:return fv(t,e,n);case 22:return cv(t,e,n)}throw Error(te(156,e.tag))};function bv(t,e){return n0(t,e)}function jy(t,e,n,i){this.tag=t,this.key=n,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.ref=null,this.pendingProps=e,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=i,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function Nn(t,e,n,i){return new jy(t,e,n,i)}function pf(t){return t=t.prototype,!(!t||!t.isReactComponent)}function Xy(t){if(typeof t=="function")return pf(t)?1:0;if(t!=null){if(t=t.$$typeof,t===Dh)return 11;if(t===Nh)return 14}return 2}function rr(t,e){var n=t.alternate;return n===null?(n=Nn(t.tag,e,t.key,t.mode),n.elementType=t.elementType,n.type=t.type,n.stateNode=t.stateNode,n.alternate=t,t.alternate=n):(n.pendingProps=e,n.type=t.type,n.flags=0,n.subtreeFlags=0,n.deletions=null),n.flags=t.flags&14680064,n.childLanes=t.childLanes,n.lanes=t.lanes,n.child=t.child,n.memoizedProps=t.memoizedProps,n.memoizedState=t.memoizedState,n.updateQueue=t.updateQueue,e=t.dependencies,n.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext},n.sibling=t.sibling,n.index=t.index,n.ref=t.ref,n}function pl(t,e,n,i,r,s){var a=2;if(i=t,typeof t=="function")pf(t)&&(a=1);else if(typeof t=="string")a=5;else e:switch(t){case ps:return Ur(n.children,r,s,e);case Lh:a=8,r|=8;break;case Gu:return t=Nn(12,n,e,r|2),t.elementType=Gu,t.lanes=s,t;case Wu:return t=Nn(13,n,e,r),t.elementType=Wu,t.lanes=s,t;case ju:return t=Nn(19,n,e,r),t.elementType=ju,t.lanes=s,t;case zg:return mc(n,r,s,e);default:if(typeof t=="object"&&t!==null)switch(t.$$typeof){case Fg:a=10;break e;case Og:a=9;break e;case Dh:a=11;break e;case Nh:a=14;break e;case Hi:a=16,i=null;break e}throw Error(te(130,t==null?t:typeof t,""))}return e=Nn(a,n,e,r),e.elementType=t,e.type=i,e.lanes=s,e}function Ur(t,e,n,i){return t=Nn(7,t,i,e),t.lanes=n,t}function mc(t,e,n,i){return t=Nn(22,t,i,e),t.elementType=zg,t.lanes=n,t.stateNode={isHidden:!1},t}function nu(t,e,n){return t=Nn(6,t,null,e),t.lanes=n,t}function iu(t,e,n){return e=Nn(4,t.children!==null?t.children:[],t.key,e),e.lanes=n,e.stateNode={containerInfo:t.containerInfo,pendingChildren:null,implementation:t.implementation},e}function $y(t,e,n,i,r){this.tag=e,this.containerInfo=t,this.finishedWork=this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.pendingContext=this.context=null,this.callbackPriority=0,this.eventTimes=Fc(0),this.expirationTimes=Fc(-1),this.entangledLanes=this.finishedLanes=this.mutableReadLanes=this.expiredLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=Fc(0),this.identifierPrefix=i,this.onRecoverableError=r,this.mutableSourceEagerHydrationData=null}function mf(t,e,n,i,r,s,a,o,l){return t=new $y(t,e,n,o,l),e===1?(e=1,s===!0&&(e|=8)):e=0,s=Nn(3,null,null,e),t.current=s,s.stateNode=t,s.memoizedState={element:i,isDehydrated:n,cache:null,transitions:null,pendingSuspenseBoundaries:null},Zh(s),t}function Yy(t,e,n){var i=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:fs,key:i==null?null:""+i,children:t,containerInfo:e,implementation:n}}function Pv(t){if(!t)return lr;t=t._reactInternals;e:{if(jr(t)!==t||t.tag!==1)throw Error(te(170));var e=t;do{switch(e.tag){case 3:e=e.stateNode.context;break e;case 1:if(hn(e.type)){e=e.stateNode.__reactInternalMemoizedMergedChildContext;break e}}e=e.return}while(e!==null);throw Error(te(171))}if(t.tag===1){var n=t.type;if(hn(n))return P0(t,n,e)}return e}function Lv(t,e,n,i,r,s,a,o,l){return t=mf(n,i,!0,t,r,s,a,o,l),t.context=Pv(null),n=t.current,i=Zt(),r=ir(n),s=Ei(i,r),s.callback=e??null,tr(n,s,r),t.current.lanes=r,no(t,r,i),fn(t,i),t}function gc(t,e,n,i){var r=e.current,s=Zt(),a=ir(r);return n=Pv(n),e.context===null?e.context=n:e.pendingContext=n,e=Ei(s,a),e.payload={element:t},i=i===void 0?null:i,i!==null&&(e.callback=i),t=tr(r,e,a),t!==null&&(Yn(t,r,a,s),ll(t,r,a)),a}function $l(t){if(t=t.current,!t.child)return null;switch(t.child.tag){case 5:return t.child.stateNode;default:return t.child.stateNode}}function Qp(t,e){if(t=t.memoizedState,t!==null&&t.dehydrated!==null){var n=t.retryLane;t.retryLane=n!==0&&n<e?n:e}}function gf(t,e){Qp(t,e),(t=t.alternate)&&Qp(t,e)}function qy(){return null}var Dv=typeof reportError=="function"?reportError:function(t){console.error(t)};function vf(t){this._internalRoot=t}vc.prototype.render=vf.prototype.render=function(t){var e=this._internalRoot;if(e===null)throw Error(te(409));gc(t,e,null,null)};vc.prototype.unmount=vf.prototype.unmount=function(){var t=this._internalRoot;if(t!==null){this._internalRoot=null;var e=t.containerInfo;Hr(function(){gc(null,t,null,null)}),e[Ci]=null}};function vc(t){this._internalRoot=t}vc.prototype.unstable_scheduleHydration=function(t){if(t){var e=c0();t={blockedOn:null,target:t,priority:e};for(var n=0;n<Gi.length&&e!==0&&e<Gi[n].priority;n++);Gi.splice(n,0,t),n===0&&d0(t)}};function _f(t){return!(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)}function _c(t){return!(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11&&(t.nodeType!==8||t.nodeValue!==" react-mount-point-unstable "))}function Jp(){}function Ky(t,e,n,i,r){if(r){if(typeof i=="function"){var s=i;i=function(){var c=$l(a);s.call(c)}}var a=Lv(e,i,t,0,null,!1,!1,"",Jp);return t._reactRootContainer=a,t[Ci]=a.current,Wa(t.nodeType===8?t.parentNode:t),Hr(),a}for(;r=t.lastChild;)t.removeChild(r);if(typeof i=="function"){var o=i;i=function(){var c=$l(l);o.call(c)}}var l=mf(t,0,!1,null,null,!1,!1,"",Jp);return t._reactRootContainer=l,t[Ci]=l.current,Wa(t.nodeType===8?t.parentNode:t),Hr(function(){gc(e,l,n,i)}),l}function xc(t,e,n,i,r){var s=n._reactRootContainer;if(s){var a=s;if(typeof r=="function"){var o=r;r=function(){var l=$l(a);o.call(l)}}gc(e,a,t,r)}else a=Ky(n,e,t,r,i);return $l(a)}o0=function(t){switch(t.tag){case 3:var e=t.stateNode;if(e.current.memoizedState.isDehydrated){var n=Ea(e.pendingLanes);n!==0&&(kh(e,n|1),fn(e,yt()),!(je&6)&&(Ws=yt()+500,hr()))}break;case 13:Hr(function(){var i=Ri(t,1);if(i!==null){var r=Zt();Yn(i,t,1,r)}}),gf(t,1)}};Fh=function(t){if(t.tag===13){var e=Ri(t,134217728);if(e!==null){var n=Zt();Yn(e,t,134217728,n)}gf(t,134217728)}};l0=function(t){if(t.tag===13){var e=ir(t),n=Ri(t,e);if(n!==null){var i=Zt();Yn(n,t,e,i)}gf(t,e)}};c0=function(){return tt};u0=function(t,e){var n=tt;try{return tt=t,e()}finally{tt=n}};td=function(t,e,n){switch(e){case"input":if(Yu(t,n),e=n.name,n.type==="radio"&&e!=null){for(n=t;n.parentNode;)n=n.parentNode;for(n=n.querySelectorAll("input[name="+JSON.stringify(""+e)+'][type="radio"]'),e=0;e<n.length;e++){var i=n[e];if(i!==t&&i.form===t.form){var r=cc(i);if(!r)throw Error(te(90));Hg(i),Yu(i,r)}}}break;case"textarea":Gg(t,n);break;case"select":e=n.value,e!=null&&Rs(t,!!n.multiple,e,!1)}};Kg=df;Zg=Hr;var Zy={usingClientEntryPoint:!1,Events:[ro,_s,cc,Yg,qg,df]},da={findFiberByHostInstance:Pr,bundleType:0,version:"18.3.1",rendererPackageName:"react-dom"},Qy={bundleType:da.bundleType,version:da.version,rendererPackageName:da.rendererPackageName,rendererConfig:da.rendererConfig,overrideHookState:null,overrideHookStateDeletePath:null,overrideHookStateRenamePath:null,overrideProps:null,overridePropsDeletePath:null,overridePropsRenamePath:null,setErrorHandler:null,setSuspenseHandler:null,scheduleUpdate:null,currentDispatcherRef:Di.ReactCurrentDispatcher,findHostInstanceByFiber:function(t){return t=e0(t),t===null?null:t.stateNode},findFiberByHostInstance:da.findFiberByHostInstance||qy,findHostInstancesForRefresh:null,scheduleRefresh:null,scheduleRoot:null,setRefreshHandler:null,getCurrentFiber:null,reconcilerVersion:"18.3.1-next-f1338f8080-20240426"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"){var Ro=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!Ro.isDisabled&&Ro.supportsFiber)try{sc=Ro.inject(Qy),si=Ro}catch{}}An.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=Zy;An.createPortal=function(t,e){var n=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!_f(e))throw Error(te(200));return Yy(t,e,null,n)};An.createRoot=function(t,e){if(!_f(t))throw Error(te(299));var n=!1,i="",r=Dv;return e!=null&&(e.unstable_strictMode===!0&&(n=!0),e.identifierPrefix!==void 0&&(i=e.identifierPrefix),e.onRecoverableError!==void 0&&(r=e.onRecoverableError)),e=mf(t,1,!1,null,null,n,!1,i,r),t[Ci]=e.current,Wa(t.nodeType===8?t.parentNode:t),new vf(e)};An.findDOMNode=function(t){if(t==null)return null;if(t.nodeType===1)return t;var e=t._reactInternals;if(e===void 0)throw typeof t.render=="function"?Error(te(188)):(t=Object.keys(t).join(","),Error(te(268,t)));return t=e0(e),t=t===null?null:t.stateNode,t};An.flushSync=function(t){return Hr(t)};An.hydrate=function(t,e,n){if(!_c(e))throw Error(te(200));return xc(null,t,e,!0,n)};An.hydrateRoot=function(t,e,n){if(!_f(t))throw Error(te(405));var i=n!=null&&n.hydratedSources||null,r=!1,s="",a=Dv;if(n!=null&&(n.unstable_strictMode===!0&&(r=!0),n.identifierPrefix!==void 0&&(s=n.identifierPrefix),n.onRecoverableError!==void 0&&(a=n.onRecoverableError)),e=Lv(e,null,t,1,n??null,r,!1,s,a),t[Ci]=e.current,Wa(t),i)for(t=0;t<i.length;t++)n=i[t],r=n._getVersion,r=r(n._source),e.mutableSourceEagerHydrationData==null?e.mutableSourceEagerHydrationData=[n,r]:e.mutableSourceEagerHydrationData.push(n,r);return new vc(e)};An.render=function(t,e,n){if(!_c(e))throw Error(te(200));return xc(null,t,e,!1,n)};An.unmountComponentAtNode=function(t){if(!_c(t))throw Error(te(40));return t._reactRootContainer?(Hr(function(){xc(null,null,t,!1,function(){t._reactRootContainer=null,t[Ci]=null})}),!0):!1};An.unstable_batchedUpdates=df;An.unstable_renderSubtreeIntoContainer=function(t,e,n,i){if(!_c(n))throw Error(te(200));if(t==null||t._reactInternals===void 0)throw Error(te(38));return xc(t,e,n,!1,i)};An.version="18.3.1-next-f1338f8080-20240426";function Nv(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(Nv)}catch(t){console.error(t)}}Nv(),Ng.exports=An;var Jy=Ng.exports,Iv,em=Jy;Iv=em.createRoot,em.hydrateRoot;/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const xf="169",eS=0,tm=1,tS=2,Uv=1,nS=2,fi=3,cr=0,Qt=1,ln=2,sr=0,Is=1,Us=2,nm=3,im=4,iS=5,Rr=100,rS=101,sS=102,aS=103,oS=104,lS=200,cS=201,uS=202,dS=203,Id=204,Ud=205,hS=206,fS=207,pS=208,mS=209,gS=210,vS=211,_S=212,xS=213,yS=214,kd=0,Fd=1,Od=2,js=3,zd=4,Bd=5,Hd=6,Vd=7,yf=0,SS=1,MS=2,ar=0,ES=1,wS=2,TS=3,AS=4,CS=5,RS=6,bS=7,kv=300,Xs=301,$s=302,Gd=303,Wd=304,yc=306,Yl=1e3,Nr=1001,jd=1002,un=1003,PS=1004,bo=1005,Kt=1006,ru=1007,yi=1008,Pi=1009,Fv=1010,Ov=1011,Ja=1012,Sf=1013,Vr=1014,ri=1015,ao=1016,Mf=1017,Ef=1018,Ys=1020,zv=35902,Bv=1021,Hv=1022,En=1023,Vv=1024,Gv=1025,ks=1026,qs=1027,wf=1028,Tf=1029,Wv=1030,Af=1031,Cf=1033,ml=33776,gl=33777,vl=33778,_l=33779,Xd=35840,$d=35841,Yd=35842,qd=35843,Kd=36196,Zd=37492,Qd=37496,Jd=37808,eh=37809,th=37810,nh=37811,ih=37812,rh=37813,sh=37814,ah=37815,oh=37816,lh=37817,ch=37818,uh=37819,dh=37820,hh=37821,xl=36492,fh=36494,ph=36495,jv=36283,mh=36284,gh=36285,vh=36286,LS=3200,DS=3201,Rf=0,NS=1,ji="",yn="srgb",fr="srgb-linear",bf="display-p3",Sc="display-p3-linear",ql="linear",ut="srgb",Kl="rec709",Zl="p3",Zr=7680,rm=519,IS=512,US=513,kS=514,Xv=515,FS=516,OS=517,zS=518,BS=519,sm=35044,HS=35048,am="300 es",Si=2e3,Ql=2001;class na{addEventListener(e,n){this._listeners===void 0&&(this._listeners={});const i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(n)===-1&&i[e].push(n)}hasEventListener(e,n){if(this._listeners===void 0)return!1;const i=this._listeners;return i[e]!==void 0&&i[e].indexOf(n)!==-1}removeEventListener(e,n){if(this._listeners===void 0)return;const r=this._listeners[e];if(r!==void 0){const s=r.indexOf(n);s!==-1&&r.splice(s,1)}}dispatchEvent(e){if(this._listeners===void 0)return;const i=this._listeners[e.type];if(i!==void 0){e.target=this;const r=i.slice(0);for(let s=0,a=r.length;s<a;s++)r[s].call(this,e);e.target=null}}}const Wt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],su=Math.PI/180,_h=180/Math.PI;function oo(){const t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(Wt[t&255]+Wt[t>>8&255]+Wt[t>>16&255]+Wt[t>>24&255]+"-"+Wt[e&255]+Wt[e>>8&255]+"-"+Wt[e>>16&15|64]+Wt[e>>24&255]+"-"+Wt[n&63|128]+Wt[n>>8&255]+"-"+Wt[n>>16&255]+Wt[n>>24&255]+Wt[i&255]+Wt[i>>8&255]+Wt[i>>16&255]+Wt[i>>24&255]).toLowerCase()}function on(t,e,n){return Math.max(e,Math.min(n,t))}function VS(t,e){return(t%e+e)%e}function au(t,e,n){return(1-n)*t+n*e}function ha(t,e){switch(e.constructor){case Float32Array:return t;case Uint32Array:return t/4294967295;case Uint16Array:return t/65535;case Uint8Array:return t/255;case Int32Array:return Math.max(t/2147483647,-1);case Int16Array:return Math.max(t/32767,-1);case Int8Array:return Math.max(t/127,-1);default:throw new Error("Invalid component type.")}}function sn(t,e){switch(e.constructor){case Float32Array:return t;case Uint32Array:return Math.round(t*4294967295);case Uint16Array:return Math.round(t*65535);case Uint8Array:return Math.round(t*255);case Int32Array:return Math.round(t*2147483647);case Int16Array:return Math.round(t*32767);case Int8Array:return Math.round(t*127);default:throw new Error("Invalid component type.")}}class Oe{constructor(e=0,n=0){Oe.prototype.isVector2=!0,this.x=e,this.y=n}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,n){return this.x=e,this.y=n,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,n){switch(e){case 0:this.x=n;break;case 1:this.y=n;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,n){return this.x=e.x+n.x,this.y=e.y+n.y,this}addScaledVector(e,n){return this.x+=e.x*n,this.y+=e.y*n,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,n){return this.x=e.x-n.x,this.y=e.y-n.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const n=this.x,i=this.y,r=e.elements;return this.x=r[0]*n+r[3]*i+r[6],this.y=r[1]*n+r[4]*i+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,n){return this.x=Math.max(e.x,Math.min(n.x,this.x)),this.y=Math.max(e.y,Math.min(n.y,this.y)),this}clampScalar(e,n){return this.x=Math.max(e,Math.min(n,this.x)),this.y=Math.max(e,Math.min(n,this.y)),this}clampLength(e,n){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(n,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const n=Math.sqrt(this.lengthSq()*e.lengthSq());if(n===0)return Math.PI/2;const i=this.dot(e)/n;return Math.acos(on(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const n=this.x-e.x,i=this.y-e.y;return n*n+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,n){return this.x+=(e.x-this.x)*n,this.y+=(e.y-this.y)*n,this}lerpVectors(e,n,i){return this.x=e.x+(n.x-e.x)*i,this.y=e.y+(n.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,n=0){return this.x=e[n],this.y=e[n+1],this}toArray(e=[],n=0){return e[n]=this.x,e[n+1]=this.y,e}fromBufferAttribute(e,n){return this.x=e.getX(n),this.y=e.getY(n),this}rotateAround(e,n){const i=Math.cos(n),r=Math.sin(n),s=this.x-e.x,a=this.y-e.y;return this.x=s*i-a*r+e.x,this.y=s*r+a*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class ke{constructor(e,n,i,r,s,a,o,l,c){ke.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,n,i,r,s,a,o,l,c)}set(e,n,i,r,s,a,o,l,c){const u=this.elements;return u[0]=e,u[1]=r,u[2]=o,u[3]=n,u[4]=s,u[5]=l,u[6]=i,u[7]=a,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const n=this.elements,i=e.elements;return n[0]=i[0],n[1]=i[1],n[2]=i[2],n[3]=i[3],n[4]=i[4],n[5]=i[5],n[6]=i[6],n[7]=i[7],n[8]=i[8],this}extractBasis(e,n,i){return e.setFromMatrix3Column(this,0),n.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const n=e.elements;return this.set(n[0],n[4],n[8],n[1],n[5],n[9],n[2],n[6],n[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,n){const i=e.elements,r=n.elements,s=this.elements,a=i[0],o=i[3],l=i[6],c=i[1],u=i[4],h=i[7],f=i[2],p=i[5],_=i[8],y=r[0],m=r[3],d=r[6],g=r[1],v=r[4],S=r[7],b=r[2],C=r[5],A=r[8];return s[0]=a*y+o*g+l*b,s[3]=a*m+o*v+l*C,s[6]=a*d+o*S+l*A,s[1]=c*y+u*g+h*b,s[4]=c*m+u*v+h*C,s[7]=c*d+u*S+h*A,s[2]=f*y+p*g+_*b,s[5]=f*m+p*v+_*C,s[8]=f*d+p*S+_*A,this}multiplyScalar(e){const n=this.elements;return n[0]*=e,n[3]*=e,n[6]*=e,n[1]*=e,n[4]*=e,n[7]*=e,n[2]*=e,n[5]*=e,n[8]*=e,this}determinant(){const e=this.elements,n=e[0],i=e[1],r=e[2],s=e[3],a=e[4],o=e[5],l=e[6],c=e[7],u=e[8];return n*a*u-n*o*c-i*s*u+i*o*l+r*s*c-r*a*l}invert(){const e=this.elements,n=e[0],i=e[1],r=e[2],s=e[3],a=e[4],o=e[5],l=e[6],c=e[7],u=e[8],h=u*a-o*c,f=o*l-u*s,p=c*s-a*l,_=n*h+i*f+r*p;if(_===0)return this.set(0,0,0,0,0,0,0,0,0);const y=1/_;return e[0]=h*y,e[1]=(r*c-u*i)*y,e[2]=(o*i-r*a)*y,e[3]=f*y,e[4]=(u*n-r*l)*y,e[5]=(r*s-o*n)*y,e[6]=p*y,e[7]=(i*l-c*n)*y,e[8]=(a*n-i*s)*y,this}transpose(){let e;const n=this.elements;return e=n[1],n[1]=n[3],n[3]=e,e=n[2],n[2]=n[6],n[6]=e,e=n[5],n[5]=n[7],n[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const n=this.elements;return e[0]=n[0],e[1]=n[3],e[2]=n[6],e[3]=n[1],e[4]=n[4],e[5]=n[7],e[6]=n[2],e[7]=n[5],e[8]=n[8],this}setUvTransform(e,n,i,r,s,a,o){const l=Math.cos(s),c=Math.sin(s);return this.set(i*l,i*c,-i*(l*a+c*o)+a+e,-r*c,r*l,-r*(-c*a+l*o)+o+n,0,0,1),this}scale(e,n){return this.premultiply(ou.makeScale(e,n)),this}rotate(e){return this.premultiply(ou.makeRotation(-e)),this}translate(e,n){return this.premultiply(ou.makeTranslation(e,n)),this}makeTranslation(e,n){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,n,0,0,1),this}makeRotation(e){const n=Math.cos(e),i=Math.sin(e);return this.set(n,-i,0,i,n,0,0,0,1),this}makeScale(e,n){return this.set(e,0,0,0,n,0,0,0,1),this}equals(e){const n=this.elements,i=e.elements;for(let r=0;r<9;r++)if(n[r]!==i[r])return!1;return!0}fromArray(e,n=0){for(let i=0;i<9;i++)this.elements[i]=e[i+n];return this}toArray(e=[],n=0){const i=this.elements;return e[n]=i[0],e[n+1]=i[1],e[n+2]=i[2],e[n+3]=i[3],e[n+4]=i[4],e[n+5]=i[5],e[n+6]=i[6],e[n+7]=i[7],e[n+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const ou=new ke;function $v(t){for(let e=t.length-1;e>=0;--e)if(t[e]>=65535)return!0;return!1}function Jl(t){return document.createElementNS("http://www.w3.org/1999/xhtml",t)}function GS(){const t=Jl("canvas");return t.style.display="block",t}const om={};function yl(t){t in om||(om[t]=!0,console.warn(t))}function WS(t,e,n){return new Promise(function(i,r){function s(){switch(t.clientWaitSync(e,t.SYNC_FLUSH_COMMANDS_BIT,0)){case t.WAIT_FAILED:r();break;case t.TIMEOUT_EXPIRED:setTimeout(s,n);break;default:i()}}setTimeout(s,n)})}function jS(t){const e=t.elements;e[2]=.5*e[2]+.5*e[3],e[6]=.5*e[6]+.5*e[7],e[10]=.5*e[10]+.5*e[11],e[14]=.5*e[14]+.5*e[15]}function XS(t){const e=t.elements;e[11]===-1?(e[10]=-e[10]-1,e[14]=-e[14]):(e[10]=-e[10],e[14]=-e[14]+1)}const lm=new ke().set(.8224621,.177538,0,.0331941,.9668058,0,.0170827,.0723974,.9105199),cm=new ke().set(1.2249401,-.2249404,0,-.0420569,1.0420571,0,-.0196376,-.0786361,1.0982735),fa={[fr]:{transfer:ql,primaries:Kl,luminanceCoefficients:[.2126,.7152,.0722],toReference:t=>t,fromReference:t=>t},[yn]:{transfer:ut,primaries:Kl,luminanceCoefficients:[.2126,.7152,.0722],toReference:t=>t.convertSRGBToLinear(),fromReference:t=>t.convertLinearToSRGB()},[Sc]:{transfer:ql,primaries:Zl,luminanceCoefficients:[.2289,.6917,.0793],toReference:t=>t.applyMatrix3(cm),fromReference:t=>t.applyMatrix3(lm)},[bf]:{transfer:ut,primaries:Zl,luminanceCoefficients:[.2289,.6917,.0793],toReference:t=>t.convertSRGBToLinear().applyMatrix3(cm),fromReference:t=>t.applyMatrix3(lm).convertLinearToSRGB()}},$S=new Set([fr,Sc]),Qe={enabled:!0,_workingColorSpace:fr,get workingColorSpace(){return this._workingColorSpace},set workingColorSpace(t){if(!$S.has(t))throw new Error(`Unsupported working color space, "${t}".`);this._workingColorSpace=t},convert:function(t,e,n){if(this.enabled===!1||e===n||!e||!n)return t;const i=fa[e].toReference,r=fa[n].fromReference;return r(i(t))},fromWorkingColorSpace:function(t,e){return this.convert(t,this._workingColorSpace,e)},toWorkingColorSpace:function(t,e){return this.convert(t,e,this._workingColorSpace)},getPrimaries:function(t){return fa[t].primaries},getTransfer:function(t){return t===ji?ql:fa[t].transfer},getLuminanceCoefficients:function(t,e=this._workingColorSpace){return t.fromArray(fa[e].luminanceCoefficients)}};function Fs(t){return t<.04045?t*.0773993808:Math.pow(t*.9478672986+.0521327014,2.4)}function lu(t){return t<.0031308?t*12.92:1.055*Math.pow(t,.41666)-.055}let Qr;class YS{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{Qr===void 0&&(Qr=Jl("canvas")),Qr.width=e.width,Qr.height=e.height;const i=Qr.getContext("2d");e instanceof ImageData?i.putImageData(e,0,0):i.drawImage(e,0,0,e.width,e.height),n=Qr}return n.width>2048||n.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),n.toDataURL("image/jpeg",.6)):n.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const n=Jl("canvas");n.width=e.width,n.height=e.height;const i=n.getContext("2d");i.drawImage(e,0,0,e.width,e.height);const r=i.getImageData(0,0,e.width,e.height),s=r.data;for(let a=0;a<s.length;a++)s[a]=Fs(s[a]/255)*255;return i.putImageData(r,0,0),n}else if(e.data){const n=e.data.slice(0);for(let i=0;i<n.length;i++)n instanceof Uint8Array||n instanceof Uint8ClampedArray?n[i]=Math.floor(Fs(n[i]/255)*255):n[i]=Fs(n[i]);return{data:n,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let qS=0;class Yv{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:qS++}),this.uuid=oo(),this.data=e,this.dataReady=!0,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const n=e===void 0||typeof e=="string";if(!n&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const i={uuid:this.uuid,url:""},r=this.data;if(r!==null){let s;if(Array.isArray(r)){s=[];for(let a=0,o=r.length;a<o;a++)r[a].isDataTexture?s.push(cu(r[a].image)):s.push(cu(r[a]))}else s=cu(r);i.url=s}return n||(e.images[this.uuid]=i),i}}function cu(t){return typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap?YS.getDataURL(t):t.data?{data:Array.from(t.data),width:t.width,height:t.height,type:t.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let KS=0;class Jt extends na{constructor(e=Jt.DEFAULT_IMAGE,n=Jt.DEFAULT_MAPPING,i=Nr,r=Nr,s=Kt,a=yi,o=En,l=Pi,c=Jt.DEFAULT_ANISOTROPY,u=ji){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:KS++}),this.uuid=oo(),this.name="",this.source=new Yv(e),this.mipmaps=[],this.mapping=n,this.channel=0,this.wrapS=i,this.wrapT=r,this.magFilter=s,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new Oe(0,0),this.repeat=new Oe(1,1),this.center=new Oe(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new ke,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){const n=e===void 0||typeof e=="string";if(!n&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const i={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),n||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==kv)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Yl:e.x=e.x-Math.floor(e.x);break;case Nr:e.x=e.x<0?0:1;break;case jd:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Yl:e.y=e.y-Math.floor(e.y);break;case Nr:e.y=e.y<0?0:1;break;case jd:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}Jt.DEFAULT_IMAGE=null;Jt.DEFAULT_MAPPING=kv;Jt.DEFAULT_ANISOTROPY=1;class _t{constructor(e=0,n=0,i=0,r=1){_t.prototype.isVector4=!0,this.x=e,this.y=n,this.z=i,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,n,i,r){return this.x=e,this.y=n,this.z=i,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,n){switch(e){case 0:this.x=n;break;case 1:this.y=n;break;case 2:this.z=n;break;case 3:this.w=n;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,n){return this.x=e.x+n.x,this.y=e.y+n.y,this.z=e.z+n.z,this.w=e.w+n.w,this}addScaledVector(e,n){return this.x+=e.x*n,this.y+=e.y*n,this.z+=e.z*n,this.w+=e.w*n,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,n){return this.x=e.x-n.x,this.y=e.y-n.y,this.z=e.z-n.z,this.w=e.w-n.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const n=this.x,i=this.y,r=this.z,s=this.w,a=e.elements;return this.x=a[0]*n+a[4]*i+a[8]*r+a[12]*s,this.y=a[1]*n+a[5]*i+a[9]*r+a[13]*s,this.z=a[2]*n+a[6]*i+a[10]*r+a[14]*s,this.w=a[3]*n+a[7]*i+a[11]*r+a[15]*s,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const n=Math.sqrt(1-e.w*e.w);return n<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/n,this.y=e.y/n,this.z=e.z/n),this}setAxisAngleFromRotationMatrix(e){let n,i,r,s;const l=e.elements,c=l[0],u=l[4],h=l[8],f=l[1],p=l[5],_=l[9],y=l[2],m=l[6],d=l[10];if(Math.abs(u-f)<.01&&Math.abs(h-y)<.01&&Math.abs(_-m)<.01){if(Math.abs(u+f)<.1&&Math.abs(h+y)<.1&&Math.abs(_+m)<.1&&Math.abs(c+p+d-3)<.1)return this.set(1,0,0,0),this;n=Math.PI;const v=(c+1)/2,S=(p+1)/2,b=(d+1)/2,C=(u+f)/4,A=(h+y)/4,P=(_+m)/4;return v>S&&v>b?v<.01?(i=0,r=.707106781,s=.707106781):(i=Math.sqrt(v),r=C/i,s=A/i):S>b?S<.01?(i=.707106781,r=0,s=.707106781):(r=Math.sqrt(S),i=C/r,s=P/r):b<.01?(i=.707106781,r=.707106781,s=0):(s=Math.sqrt(b),i=A/s,r=P/s),this.set(i,r,s,n),this}let g=Math.sqrt((m-_)*(m-_)+(h-y)*(h-y)+(f-u)*(f-u));return Math.abs(g)<.001&&(g=1),this.x=(m-_)/g,this.y=(h-y)/g,this.z=(f-u)/g,this.w=Math.acos((c+p+d-1)/2),this}setFromMatrixPosition(e){const n=e.elements;return this.x=n[12],this.y=n[13],this.z=n[14],this.w=n[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,n){return this.x=Math.max(e.x,Math.min(n.x,this.x)),this.y=Math.max(e.y,Math.min(n.y,this.y)),this.z=Math.max(e.z,Math.min(n.z,this.z)),this.w=Math.max(e.w,Math.min(n.w,this.w)),this}clampScalar(e,n){return this.x=Math.max(e,Math.min(n,this.x)),this.y=Math.max(e,Math.min(n,this.y)),this.z=Math.max(e,Math.min(n,this.z)),this.w=Math.max(e,Math.min(n,this.w)),this}clampLength(e,n){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(n,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,n){return this.x+=(e.x-this.x)*n,this.y+=(e.y-this.y)*n,this.z+=(e.z-this.z)*n,this.w+=(e.w-this.w)*n,this}lerpVectors(e,n,i){return this.x=e.x+(n.x-e.x)*i,this.y=e.y+(n.y-e.y)*i,this.z=e.z+(n.z-e.z)*i,this.w=e.w+(n.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,n=0){return this.x=e[n],this.y=e[n+1],this.z=e[n+2],this.w=e[n+3],this}toArray(e=[],n=0){return e[n]=this.x,e[n+1]=this.y,e[n+2]=this.z,e[n+3]=this.w,e}fromBufferAttribute(e,n){return this.x=e.getX(n),this.y=e.getY(n),this.z=e.getZ(n),this.w=e.getW(n),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class ZS extends na{constructor(e=1,n=1,i={}){super(),this.isRenderTarget=!0,this.width=e,this.height=n,this.depth=1,this.scissor=new _t(0,0,e,n),this.scissorTest=!1,this.viewport=new _t(0,0,e,n);const r={width:e,height:n,depth:1};i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Kt,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},i);const s=new Jt(r,i.mapping,i.wrapS,i.wrapT,i.magFilter,i.minFilter,i.format,i.type,i.anisotropy,i.colorSpace);s.flipY=!1,s.generateMipmaps=i.generateMipmaps,s.internalFormat=i.internalFormat,this.textures=[];const a=i.count;for(let o=0;o<a;o++)this.textures[o]=s.clone(),this.textures[o].isRenderTargetTexture=!0;this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this.depthTexture=i.depthTexture,this.samples=i.samples}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}setSize(e,n,i=1){if(this.width!==e||this.height!==n||this.depth!==i){this.width=e,this.height=n,this.depth=i;for(let r=0,s=this.textures.length;r<s;r++)this.textures[r].image.width=e,this.textures[r].image.height=n,this.textures[r].image.depth=i;this.dispose()}this.viewport.set(0,0,e,n),this.scissor.set(0,0,e,n)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let i=0,r=e.textures.length;i<r;i++)this.textures[i]=e.textures[i].clone(),this.textures[i].isRenderTargetTexture=!0;const n=Object.assign({},e.texture.image);return this.texture.source=new Yv(n),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Gr extends ZS{constructor(e=1,n=1,i={}){super(e,n,i),this.isWebGLRenderTarget=!0}}class qv extends Jt{constructor(e=null,n=1,i=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:n,height:i,depth:r},this.magFilter=un,this.minFilter=un,this.wrapR=Nr,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class QS extends Jt{constructor(e=null,n=1,i=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:n,height:i,depth:r},this.magFilter=un,this.minFilter=un,this.wrapR=Nr,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class wi{constructor(e=0,n=0,i=0,r=1){this.isQuaternion=!0,this._x=e,this._y=n,this._z=i,this._w=r}static slerpFlat(e,n,i,r,s,a,o){let l=i[r+0],c=i[r+1],u=i[r+2],h=i[r+3];const f=s[a+0],p=s[a+1],_=s[a+2],y=s[a+3];if(o===0){e[n+0]=l,e[n+1]=c,e[n+2]=u,e[n+3]=h;return}if(o===1){e[n+0]=f,e[n+1]=p,e[n+2]=_,e[n+3]=y;return}if(h!==y||l!==f||c!==p||u!==_){let m=1-o;const d=l*f+c*p+u*_+h*y,g=d>=0?1:-1,v=1-d*d;if(v>Number.EPSILON){const b=Math.sqrt(v),C=Math.atan2(b,d*g);m=Math.sin(m*C)/b,o=Math.sin(o*C)/b}const S=o*g;if(l=l*m+f*S,c=c*m+p*S,u=u*m+_*S,h=h*m+y*S,m===1-o){const b=1/Math.sqrt(l*l+c*c+u*u+h*h);l*=b,c*=b,u*=b,h*=b}}e[n]=l,e[n+1]=c,e[n+2]=u,e[n+3]=h}static multiplyQuaternionsFlat(e,n,i,r,s,a){const o=i[r],l=i[r+1],c=i[r+2],u=i[r+3],h=s[a],f=s[a+1],p=s[a+2],_=s[a+3];return e[n]=o*_+u*h+l*p-c*f,e[n+1]=l*_+u*f+c*h-o*p,e[n+2]=c*_+u*p+o*f-l*h,e[n+3]=u*_-o*h-l*f-c*p,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,n,i,r){return this._x=e,this._y=n,this._z=i,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,n=!0){const i=e._x,r=e._y,s=e._z,a=e._order,o=Math.cos,l=Math.sin,c=o(i/2),u=o(r/2),h=o(s/2),f=l(i/2),p=l(r/2),_=l(s/2);switch(a){case"XYZ":this._x=f*u*h+c*p*_,this._y=c*p*h-f*u*_,this._z=c*u*_+f*p*h,this._w=c*u*h-f*p*_;break;case"YXZ":this._x=f*u*h+c*p*_,this._y=c*p*h-f*u*_,this._z=c*u*_-f*p*h,this._w=c*u*h+f*p*_;break;case"ZXY":this._x=f*u*h-c*p*_,this._y=c*p*h+f*u*_,this._z=c*u*_+f*p*h,this._w=c*u*h-f*p*_;break;case"ZYX":this._x=f*u*h-c*p*_,this._y=c*p*h+f*u*_,this._z=c*u*_-f*p*h,this._w=c*u*h+f*p*_;break;case"YZX":this._x=f*u*h+c*p*_,this._y=c*p*h+f*u*_,this._z=c*u*_-f*p*h,this._w=c*u*h-f*p*_;break;case"XZY":this._x=f*u*h-c*p*_,this._y=c*p*h-f*u*_,this._z=c*u*_+f*p*h,this._w=c*u*h+f*p*_;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+a)}return n===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,n){const i=n/2,r=Math.sin(i);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){const n=e.elements,i=n[0],r=n[4],s=n[8],a=n[1],o=n[5],l=n[9],c=n[2],u=n[6],h=n[10],f=i+o+h;if(f>0){const p=.5/Math.sqrt(f+1);this._w=.25/p,this._x=(u-l)*p,this._y=(s-c)*p,this._z=(a-r)*p}else if(i>o&&i>h){const p=2*Math.sqrt(1+i-o-h);this._w=(u-l)/p,this._x=.25*p,this._y=(r+a)/p,this._z=(s+c)/p}else if(o>h){const p=2*Math.sqrt(1+o-i-h);this._w=(s-c)/p,this._x=(r+a)/p,this._y=.25*p,this._z=(l+u)/p}else{const p=2*Math.sqrt(1+h-i-o);this._w=(a-r)/p,this._x=(s+c)/p,this._y=(l+u)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(e,n){let i=e.dot(n)+1;return i<Number.EPSILON?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*n.z-e.z*n.y,this._y=e.z*n.x-e.x*n.z,this._z=e.x*n.y-e.y*n.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(on(this.dot(e),-1,1)))}rotateTowards(e,n){const i=this.angleTo(e);if(i===0)return this;const r=Math.min(1,n/i);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,n){const i=e._x,r=e._y,s=e._z,a=e._w,o=n._x,l=n._y,c=n._z,u=n._w;return this._x=i*u+a*o+r*c-s*l,this._y=r*u+a*l+s*o-i*c,this._z=s*u+a*c+i*l-r*o,this._w=a*u-i*o-r*l-s*c,this._onChangeCallback(),this}slerp(e,n){if(n===0)return this;if(n===1)return this.copy(e);const i=this._x,r=this._y,s=this._z,a=this._w;let o=a*e._w+i*e._x+r*e._y+s*e._z;if(o<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,o=-o):this.copy(e),o>=1)return this._w=a,this._x=i,this._y=r,this._z=s,this;const l=1-o*o;if(l<=Number.EPSILON){const p=1-n;return this._w=p*a+n*this._w,this._x=p*i+n*this._x,this._y=p*r+n*this._y,this._z=p*s+n*this._z,this.normalize(),this}const c=Math.sqrt(l),u=Math.atan2(c,o),h=Math.sin((1-n)*u)/c,f=Math.sin(n*u)/c;return this._w=a*h+this._w*f,this._x=i*h+this._x*f,this._y=r*h+this._y*f,this._z=s*h+this._z*f,this._onChangeCallback(),this}slerpQuaternions(e,n,i){return this.copy(e).slerp(n,i)}random(){const e=2*Math.PI*Math.random(),n=2*Math.PI*Math.random(),i=Math.random(),r=Math.sqrt(1-i),s=Math.sqrt(i);return this.set(r*Math.sin(e),r*Math.cos(e),s*Math.sin(n),s*Math.cos(n))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,n=0){return this._x=e[n],this._y=e[n+1],this._z=e[n+2],this._w=e[n+3],this._onChangeCallback(),this}toArray(e=[],n=0){return e[n]=this._x,e[n+1]=this._y,e[n+2]=this._z,e[n+3]=this._w,e}fromBufferAttribute(e,n){return this._x=e.getX(n),this._y=e.getY(n),this._z=e.getZ(n),this._w=e.getW(n),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class N{constructor(e=0,n=0,i=0){N.prototype.isVector3=!0,this.x=e,this.y=n,this.z=i}set(e,n,i){return i===void 0&&(i=this.z),this.x=e,this.y=n,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,n){switch(e){case 0:this.x=n;break;case 1:this.y=n;break;case 2:this.z=n;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,n){return this.x=e.x+n.x,this.y=e.y+n.y,this.z=e.z+n.z,this}addScaledVector(e,n){return this.x+=e.x*n,this.y+=e.y*n,this.z+=e.z*n,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,n){return this.x=e.x-n.x,this.y=e.y-n.y,this.z=e.z-n.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,n){return this.x=e.x*n.x,this.y=e.y*n.y,this.z=e.z*n.z,this}applyEuler(e){return this.applyQuaternion(um.setFromEuler(e))}applyAxisAngle(e,n){return this.applyQuaternion(um.setFromAxisAngle(e,n))}applyMatrix3(e){const n=this.x,i=this.y,r=this.z,s=e.elements;return this.x=s[0]*n+s[3]*i+s[6]*r,this.y=s[1]*n+s[4]*i+s[7]*r,this.z=s[2]*n+s[5]*i+s[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const n=this.x,i=this.y,r=this.z,s=e.elements,a=1/(s[3]*n+s[7]*i+s[11]*r+s[15]);return this.x=(s[0]*n+s[4]*i+s[8]*r+s[12])*a,this.y=(s[1]*n+s[5]*i+s[9]*r+s[13])*a,this.z=(s[2]*n+s[6]*i+s[10]*r+s[14])*a,this}applyQuaternion(e){const n=this.x,i=this.y,r=this.z,s=e.x,a=e.y,o=e.z,l=e.w,c=2*(a*r-o*i),u=2*(o*n-s*r),h=2*(s*i-a*n);return this.x=n+l*c+a*h-o*u,this.y=i+l*u+o*c-s*h,this.z=r+l*h+s*u-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const n=this.x,i=this.y,r=this.z,s=e.elements;return this.x=s[0]*n+s[4]*i+s[8]*r,this.y=s[1]*n+s[5]*i+s[9]*r,this.z=s[2]*n+s[6]*i+s[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,n){return this.x=Math.max(e.x,Math.min(n.x,this.x)),this.y=Math.max(e.y,Math.min(n.y,this.y)),this.z=Math.max(e.z,Math.min(n.z,this.z)),this}clampScalar(e,n){return this.x=Math.max(e,Math.min(n,this.x)),this.y=Math.max(e,Math.min(n,this.y)),this.z=Math.max(e,Math.min(n,this.z)),this}clampLength(e,n){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(n,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,n){return this.x+=(e.x-this.x)*n,this.y+=(e.y-this.y)*n,this.z+=(e.z-this.z)*n,this}lerpVectors(e,n,i){return this.x=e.x+(n.x-e.x)*i,this.y=e.y+(n.y-e.y)*i,this.z=e.z+(n.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,n){const i=e.x,r=e.y,s=e.z,a=n.x,o=n.y,l=n.z;return this.x=r*l-s*o,this.y=s*a-i*l,this.z=i*o-r*a,this}projectOnVector(e){const n=e.lengthSq();if(n===0)return this.set(0,0,0);const i=e.dot(this)/n;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return uu.copy(this).projectOnVector(e),this.sub(uu)}reflect(e){return this.sub(uu.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const n=Math.sqrt(this.lengthSq()*e.lengthSq());if(n===0)return Math.PI/2;const i=this.dot(e)/n;return Math.acos(on(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const n=this.x-e.x,i=this.y-e.y,r=this.z-e.z;return n*n+i*i+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,n,i){const r=Math.sin(n)*e;return this.x=r*Math.sin(i),this.y=Math.cos(n)*e,this.z=r*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,n,i){return this.x=e*Math.sin(n),this.y=i,this.z=e*Math.cos(n),this}setFromMatrixPosition(e){const n=e.elements;return this.x=n[12],this.y=n[13],this.z=n[14],this}setFromMatrixScale(e){const n=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=n,this.y=i,this.z=r,this}setFromMatrixColumn(e,n){return this.fromArray(e.elements,n*4)}setFromMatrix3Column(e,n){return this.fromArray(e.elements,n*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,n=0){return this.x=e[n],this.y=e[n+1],this.z=e[n+2],this}toArray(e=[],n=0){return e[n]=this.x,e[n+1]=this.y,e[n+2]=this.z,e}fromBufferAttribute(e,n){return this.x=e.getX(n),this.y=e.getY(n),this.z=e.getZ(n),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,n=Math.random()*2-1,i=Math.sqrt(1-n*n);return this.x=i*Math.cos(e),this.y=n,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const uu=new N,um=new wi;class Xr{constructor(e=new N(1/0,1/0,1/0),n=new N(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=n}set(e,n){return this.min.copy(e),this.max.copy(n),this}setFromArray(e){this.makeEmpty();for(let n=0,i=e.length;n<i;n+=3)this.expandByPoint(zn.fromArray(e,n));return this}setFromBufferAttribute(e){this.makeEmpty();for(let n=0,i=e.count;n<i;n++)this.expandByPoint(zn.fromBufferAttribute(e,n));return this}setFromPoints(e){this.makeEmpty();for(let n=0,i=e.length;n<i;n++)this.expandByPoint(e[n]);return this}setFromCenterAndSize(e,n){const i=zn.copy(n).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,n=!1){return this.makeEmpty(),this.expandByObject(e,n)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,n=!1){e.updateWorldMatrix(!1,!1);const i=e.geometry;if(i!==void 0){const s=i.getAttribute("position");if(n===!0&&s!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=s.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,zn):zn.fromBufferAttribute(s,a),zn.applyMatrix4(e.matrixWorld),this.expandByPoint(zn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Po.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),Po.copy(i.boundingBox)),Po.applyMatrix4(e.matrixWorld),this.union(Po)}const r=e.children;for(let s=0,a=r.length;s<a;s++)this.expandByObject(r[s],n);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,n){return n.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,zn),zn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let n,i;return e.normal.x>0?(n=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(n=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(n+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(n+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(n+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(n+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),n<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(pa),Lo.subVectors(this.max,pa),Jr.subVectors(e.a,pa),es.subVectors(e.b,pa),ts.subVectors(e.c,pa),Ui.subVectors(es,Jr),ki.subVectors(ts,es),gr.subVectors(Jr,ts);let n=[0,-Ui.z,Ui.y,0,-ki.z,ki.y,0,-gr.z,gr.y,Ui.z,0,-Ui.x,ki.z,0,-ki.x,gr.z,0,-gr.x,-Ui.y,Ui.x,0,-ki.y,ki.x,0,-gr.y,gr.x,0];return!du(n,Jr,es,ts,Lo)||(n=[1,0,0,0,1,0,0,0,1],!du(n,Jr,es,ts,Lo))?!1:(Do.crossVectors(Ui,ki),n=[Do.x,Do.y,Do.z],du(n,Jr,es,ts,Lo))}clampPoint(e,n){return n.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,zn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(zn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(li[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),li[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),li[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),li[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),li[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),li[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),li[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),li[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(li),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}}const li=[new N,new N,new N,new N,new N,new N,new N,new N],zn=new N,Po=new Xr,Jr=new N,es=new N,ts=new N,Ui=new N,ki=new N,gr=new N,pa=new N,Lo=new N,Do=new N,vr=new N;function du(t,e,n,i,r){for(let s=0,a=t.length-3;s<=a;s+=3){vr.fromArray(t,s);const o=r.x*Math.abs(vr.x)+r.y*Math.abs(vr.y)+r.z*Math.abs(vr.z),l=e.dot(vr),c=n.dot(vr),u=i.dot(vr);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>o)return!1}return!0}const JS=new Xr,ma=new N,hu=new N;class $r{constructor(e=new N,n=-1){this.isSphere=!0,this.center=e,this.radius=n}set(e,n){return this.center.copy(e),this.radius=n,this}setFromPoints(e,n){const i=this.center;n!==void 0?i.copy(n):JS.setFromPoints(e).getCenter(i);let r=0;for(let s=0,a=e.length;s<a;s++)r=Math.max(r,i.distanceToSquared(e[s]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const n=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=n*n}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,n){const i=this.center.distanceToSquared(e);return n.copy(e),i>this.radius*this.radius&&(n.sub(this.center).normalize(),n.multiplyScalar(this.radius).add(this.center)),n}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;ma.subVectors(e,this.center);const n=ma.lengthSq();if(n>this.radius*this.radius){const i=Math.sqrt(n),r=(i-this.radius)*.5;this.center.addScaledVector(ma,r/i),this.radius+=r}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(hu.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(ma.copy(e.center).add(hu)),this.expandByPoint(ma.copy(e.center).sub(hu))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}}const ci=new N,fu=new N,No=new N,Fi=new N,pu=new N,Io=new N,mu=new N;class Mc{constructor(e=new N,n=new N(0,0,-1)){this.origin=e,this.direction=n}set(e,n){return this.origin.copy(e),this.direction.copy(n),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,n){return n.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,ci)),this}closestPointToPoint(e,n){n.subVectors(e,this.origin);const i=n.dot(this.direction);return i<0?n.copy(this.origin):n.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const n=ci.subVectors(e,this.origin).dot(this.direction);return n<0?this.origin.distanceToSquared(e):(ci.copy(this.origin).addScaledVector(this.direction,n),ci.distanceToSquared(e))}distanceSqToSegment(e,n,i,r){fu.copy(e).add(n).multiplyScalar(.5),No.copy(n).sub(e).normalize(),Fi.copy(this.origin).sub(fu);const s=e.distanceTo(n)*.5,a=-this.direction.dot(No),o=Fi.dot(this.direction),l=-Fi.dot(No),c=Fi.lengthSq(),u=Math.abs(1-a*a);let h,f,p,_;if(u>0)if(h=a*l-o,f=a*o-l,_=s*u,h>=0)if(f>=-_)if(f<=_){const y=1/u;h*=y,f*=y,p=h*(h+a*f+2*o)+f*(a*h+f+2*l)+c}else f=s,h=Math.max(0,-(a*f+o)),p=-h*h+f*(f+2*l)+c;else f=-s,h=Math.max(0,-(a*f+o)),p=-h*h+f*(f+2*l)+c;else f<=-_?(h=Math.max(0,-(-a*s+o)),f=h>0?-s:Math.min(Math.max(-s,-l),s),p=-h*h+f*(f+2*l)+c):f<=_?(h=0,f=Math.min(Math.max(-s,-l),s),p=f*(f+2*l)+c):(h=Math.max(0,-(a*s+o)),f=h>0?s:Math.min(Math.max(-s,-l),s),p=-h*h+f*(f+2*l)+c);else f=a>0?-s:s,h=Math.max(0,-(a*f+o)),p=-h*h+f*(f+2*l)+c;return i&&i.copy(this.origin).addScaledVector(this.direction,h),r&&r.copy(fu).addScaledVector(No,f),p}intersectSphere(e,n){ci.subVectors(e.center,this.origin);const i=ci.dot(this.direction),r=ci.dot(ci)-i*i,s=e.radius*e.radius;if(r>s)return null;const a=Math.sqrt(s-r),o=i-a,l=i+a;return l<0?null:o<0?this.at(l,n):this.at(o,n)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const n=e.normal.dot(this.direction);if(n===0)return e.distanceToPoint(this.origin)===0?0:null;const i=-(this.origin.dot(e.normal)+e.constant)/n;return i>=0?i:null}intersectPlane(e,n){const i=this.distanceToPlane(e);return i===null?null:this.at(i,n)}intersectsPlane(e){const n=e.distanceToPoint(this.origin);return n===0||e.normal.dot(this.direction)*n<0}intersectBox(e,n){let i,r,s,a,o,l;const c=1/this.direction.x,u=1/this.direction.y,h=1/this.direction.z,f=this.origin;return c>=0?(i=(e.min.x-f.x)*c,r=(e.max.x-f.x)*c):(i=(e.max.x-f.x)*c,r=(e.min.x-f.x)*c),u>=0?(s=(e.min.y-f.y)*u,a=(e.max.y-f.y)*u):(s=(e.max.y-f.y)*u,a=(e.min.y-f.y)*u),i>a||s>r||((s>i||isNaN(i))&&(i=s),(a<r||isNaN(r))&&(r=a),h>=0?(o=(e.min.z-f.z)*h,l=(e.max.z-f.z)*h):(o=(e.max.z-f.z)*h,l=(e.min.z-f.z)*h),i>l||o>r)||((o>i||i!==i)&&(i=o),(l<r||r!==r)&&(r=l),r<0)?null:this.at(i>=0?i:r,n)}intersectsBox(e){return this.intersectBox(e,ci)!==null}intersectTriangle(e,n,i,r,s){pu.subVectors(n,e),Io.subVectors(i,e),mu.crossVectors(pu,Io);let a=this.direction.dot(mu),o;if(a>0){if(r)return null;o=1}else if(a<0)o=-1,a=-a;else return null;Fi.subVectors(this.origin,e);const l=o*this.direction.dot(Io.crossVectors(Fi,Io));if(l<0)return null;const c=o*this.direction.dot(pu.cross(Fi));if(c<0||l+c>a)return null;const u=-o*Fi.dot(mu);return u<0?null:this.at(u/a,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Je{constructor(e,n,i,r,s,a,o,l,c,u,h,f,p,_,y,m){Je.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,n,i,r,s,a,o,l,c,u,h,f,p,_,y,m)}set(e,n,i,r,s,a,o,l,c,u,h,f,p,_,y,m){const d=this.elements;return d[0]=e,d[4]=n,d[8]=i,d[12]=r,d[1]=s,d[5]=a,d[9]=o,d[13]=l,d[2]=c,d[6]=u,d[10]=h,d[14]=f,d[3]=p,d[7]=_,d[11]=y,d[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Je().fromArray(this.elements)}copy(e){const n=this.elements,i=e.elements;return n[0]=i[0],n[1]=i[1],n[2]=i[2],n[3]=i[3],n[4]=i[4],n[5]=i[5],n[6]=i[6],n[7]=i[7],n[8]=i[8],n[9]=i[9],n[10]=i[10],n[11]=i[11],n[12]=i[12],n[13]=i[13],n[14]=i[14],n[15]=i[15],this}copyPosition(e){const n=this.elements,i=e.elements;return n[12]=i[12],n[13]=i[13],n[14]=i[14],this}setFromMatrix3(e){const n=e.elements;return this.set(n[0],n[3],n[6],0,n[1],n[4],n[7],0,n[2],n[5],n[8],0,0,0,0,1),this}extractBasis(e,n,i){return e.setFromMatrixColumn(this,0),n.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this}makeBasis(e,n,i){return this.set(e.x,n.x,i.x,0,e.y,n.y,i.y,0,e.z,n.z,i.z,0,0,0,0,1),this}extractRotation(e){const n=this.elements,i=e.elements,r=1/ns.setFromMatrixColumn(e,0).length(),s=1/ns.setFromMatrixColumn(e,1).length(),a=1/ns.setFromMatrixColumn(e,2).length();return n[0]=i[0]*r,n[1]=i[1]*r,n[2]=i[2]*r,n[3]=0,n[4]=i[4]*s,n[5]=i[5]*s,n[6]=i[6]*s,n[7]=0,n[8]=i[8]*a,n[9]=i[9]*a,n[10]=i[10]*a,n[11]=0,n[12]=0,n[13]=0,n[14]=0,n[15]=1,this}makeRotationFromEuler(e){const n=this.elements,i=e.x,r=e.y,s=e.z,a=Math.cos(i),o=Math.sin(i),l=Math.cos(r),c=Math.sin(r),u=Math.cos(s),h=Math.sin(s);if(e.order==="XYZ"){const f=a*u,p=a*h,_=o*u,y=o*h;n[0]=l*u,n[4]=-l*h,n[8]=c,n[1]=p+_*c,n[5]=f-y*c,n[9]=-o*l,n[2]=y-f*c,n[6]=_+p*c,n[10]=a*l}else if(e.order==="YXZ"){const f=l*u,p=l*h,_=c*u,y=c*h;n[0]=f+y*o,n[4]=_*o-p,n[8]=a*c,n[1]=a*h,n[5]=a*u,n[9]=-o,n[2]=p*o-_,n[6]=y+f*o,n[10]=a*l}else if(e.order==="ZXY"){const f=l*u,p=l*h,_=c*u,y=c*h;n[0]=f-y*o,n[4]=-a*h,n[8]=_+p*o,n[1]=p+_*o,n[5]=a*u,n[9]=y-f*o,n[2]=-a*c,n[6]=o,n[10]=a*l}else if(e.order==="ZYX"){const f=a*u,p=a*h,_=o*u,y=o*h;n[0]=l*u,n[4]=_*c-p,n[8]=f*c+y,n[1]=l*h,n[5]=y*c+f,n[9]=p*c-_,n[2]=-c,n[6]=o*l,n[10]=a*l}else if(e.order==="YZX"){const f=a*l,p=a*c,_=o*l,y=o*c;n[0]=l*u,n[4]=y-f*h,n[8]=_*h+p,n[1]=h,n[5]=a*u,n[9]=-o*u,n[2]=-c*u,n[6]=p*h+_,n[10]=f-y*h}else if(e.order==="XZY"){const f=a*l,p=a*c,_=o*l,y=o*c;n[0]=l*u,n[4]=-h,n[8]=c*u,n[1]=f*h+y,n[5]=a*u,n[9]=p*h-_,n[2]=_*h-p,n[6]=o*u,n[10]=y*h+f}return n[3]=0,n[7]=0,n[11]=0,n[12]=0,n[13]=0,n[14]=0,n[15]=1,this}makeRotationFromQuaternion(e){return this.compose(eM,e,tM)}lookAt(e,n,i){const r=this.elements;return vn.subVectors(e,n),vn.lengthSq()===0&&(vn.z=1),vn.normalize(),Oi.crossVectors(i,vn),Oi.lengthSq()===0&&(Math.abs(i.z)===1?vn.x+=1e-4:vn.z+=1e-4,vn.normalize(),Oi.crossVectors(i,vn)),Oi.normalize(),Uo.crossVectors(vn,Oi),r[0]=Oi.x,r[4]=Uo.x,r[8]=vn.x,r[1]=Oi.y,r[5]=Uo.y,r[9]=vn.y,r[2]=Oi.z,r[6]=Uo.z,r[10]=vn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,n){const i=e.elements,r=n.elements,s=this.elements,a=i[0],o=i[4],l=i[8],c=i[12],u=i[1],h=i[5],f=i[9],p=i[13],_=i[2],y=i[6],m=i[10],d=i[14],g=i[3],v=i[7],S=i[11],b=i[15],C=r[0],A=r[4],P=r[8],V=r[12],x=r[1],w=r[5],O=r[9],F=r[13],W=r[2],q=r[6],z=r[10],J=r[14],L=r[3],Y=r[7],$=r[11],ne=r[15];return s[0]=a*C+o*x+l*W+c*L,s[4]=a*A+o*w+l*q+c*Y,s[8]=a*P+o*O+l*z+c*$,s[12]=a*V+o*F+l*J+c*ne,s[1]=u*C+h*x+f*W+p*L,s[5]=u*A+h*w+f*q+p*Y,s[9]=u*P+h*O+f*z+p*$,s[13]=u*V+h*F+f*J+p*ne,s[2]=_*C+y*x+m*W+d*L,s[6]=_*A+y*w+m*q+d*Y,s[10]=_*P+y*O+m*z+d*$,s[14]=_*V+y*F+m*J+d*ne,s[3]=g*C+v*x+S*W+b*L,s[7]=g*A+v*w+S*q+b*Y,s[11]=g*P+v*O+S*z+b*$,s[15]=g*V+v*F+S*J+b*ne,this}multiplyScalar(e){const n=this.elements;return n[0]*=e,n[4]*=e,n[8]*=e,n[12]*=e,n[1]*=e,n[5]*=e,n[9]*=e,n[13]*=e,n[2]*=e,n[6]*=e,n[10]*=e,n[14]*=e,n[3]*=e,n[7]*=e,n[11]*=e,n[15]*=e,this}determinant(){const e=this.elements,n=e[0],i=e[4],r=e[8],s=e[12],a=e[1],o=e[5],l=e[9],c=e[13],u=e[2],h=e[6],f=e[10],p=e[14],_=e[3],y=e[7],m=e[11],d=e[15];return _*(+s*l*h-r*c*h-s*o*f+i*c*f+r*o*p-i*l*p)+y*(+n*l*p-n*c*f+s*a*f-r*a*p+r*c*u-s*l*u)+m*(+n*c*h-n*o*p-s*a*h+i*a*p+s*o*u-i*c*u)+d*(-r*o*u-n*l*h+n*o*f+r*a*h-i*a*f+i*l*u)}transpose(){const e=this.elements;let n;return n=e[1],e[1]=e[4],e[4]=n,n=e[2],e[2]=e[8],e[8]=n,n=e[6],e[6]=e[9],e[9]=n,n=e[3],e[3]=e[12],e[12]=n,n=e[7],e[7]=e[13],e[13]=n,n=e[11],e[11]=e[14],e[14]=n,this}setPosition(e,n,i){const r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=n,r[14]=i),this}invert(){const e=this.elements,n=e[0],i=e[1],r=e[2],s=e[3],a=e[4],o=e[5],l=e[6],c=e[7],u=e[8],h=e[9],f=e[10],p=e[11],_=e[12],y=e[13],m=e[14],d=e[15],g=h*m*c-y*f*c+y*l*p-o*m*p-h*l*d+o*f*d,v=_*f*c-u*m*c-_*l*p+a*m*p+u*l*d-a*f*d,S=u*y*c-_*h*c+_*o*p-a*y*p-u*o*d+a*h*d,b=_*h*l-u*y*l-_*o*f+a*y*f+u*o*m-a*h*m,C=n*g+i*v+r*S+s*b;if(C===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const A=1/C;return e[0]=g*A,e[1]=(y*f*s-h*m*s-y*r*p+i*m*p+h*r*d-i*f*d)*A,e[2]=(o*m*s-y*l*s+y*r*c-i*m*c-o*r*d+i*l*d)*A,e[3]=(h*l*s-o*f*s-h*r*c+i*f*c+o*r*p-i*l*p)*A,e[4]=v*A,e[5]=(u*m*s-_*f*s+_*r*p-n*m*p-u*r*d+n*f*d)*A,e[6]=(_*l*s-a*m*s-_*r*c+n*m*c+a*r*d-n*l*d)*A,e[7]=(a*f*s-u*l*s+u*r*c-n*f*c-a*r*p+n*l*p)*A,e[8]=S*A,e[9]=(_*h*s-u*y*s-_*i*p+n*y*p+u*i*d-n*h*d)*A,e[10]=(a*y*s-_*o*s+_*i*c-n*y*c-a*i*d+n*o*d)*A,e[11]=(u*o*s-a*h*s-u*i*c+n*h*c+a*i*p-n*o*p)*A,e[12]=b*A,e[13]=(u*y*r-_*h*r+_*i*f-n*y*f-u*i*m+n*h*m)*A,e[14]=(_*o*r-a*y*r-_*i*l+n*y*l+a*i*m-n*o*m)*A,e[15]=(a*h*r-u*o*r+u*i*l-n*h*l-a*i*f+n*o*f)*A,this}scale(e){const n=this.elements,i=e.x,r=e.y,s=e.z;return n[0]*=i,n[4]*=r,n[8]*=s,n[1]*=i,n[5]*=r,n[9]*=s,n[2]*=i,n[6]*=r,n[10]*=s,n[3]*=i,n[7]*=r,n[11]*=s,this}getMaxScaleOnAxis(){const e=this.elements,n=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(n,i,r))}makeTranslation(e,n,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,n,0,0,1,i,0,0,0,1),this}makeRotationX(e){const n=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,n,-i,0,0,i,n,0,0,0,0,1),this}makeRotationY(e){const n=Math.cos(e),i=Math.sin(e);return this.set(n,0,i,0,0,1,0,0,-i,0,n,0,0,0,0,1),this}makeRotationZ(e){const n=Math.cos(e),i=Math.sin(e);return this.set(n,-i,0,0,i,n,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,n){const i=Math.cos(n),r=Math.sin(n),s=1-i,a=e.x,o=e.y,l=e.z,c=s*a,u=s*o;return this.set(c*a+i,c*o-r*l,c*l+r*o,0,c*o+r*l,u*o+i,u*l-r*a,0,c*l-r*o,u*l+r*a,s*l*l+i,0,0,0,0,1),this}makeScale(e,n,i){return this.set(e,0,0,0,0,n,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,n,i,r,s,a){return this.set(1,i,s,0,e,1,a,0,n,r,1,0,0,0,0,1),this}compose(e,n,i){const r=this.elements,s=n._x,a=n._y,o=n._z,l=n._w,c=s+s,u=a+a,h=o+o,f=s*c,p=s*u,_=s*h,y=a*u,m=a*h,d=o*h,g=l*c,v=l*u,S=l*h,b=i.x,C=i.y,A=i.z;return r[0]=(1-(y+d))*b,r[1]=(p+S)*b,r[2]=(_-v)*b,r[3]=0,r[4]=(p-S)*C,r[5]=(1-(f+d))*C,r[6]=(m+g)*C,r[7]=0,r[8]=(_+v)*A,r[9]=(m-g)*A,r[10]=(1-(f+y))*A,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,n,i){const r=this.elements;let s=ns.set(r[0],r[1],r[2]).length();const a=ns.set(r[4],r[5],r[6]).length(),o=ns.set(r[8],r[9],r[10]).length();this.determinant()<0&&(s=-s),e.x=r[12],e.y=r[13],e.z=r[14],Bn.copy(this);const c=1/s,u=1/a,h=1/o;return Bn.elements[0]*=c,Bn.elements[1]*=c,Bn.elements[2]*=c,Bn.elements[4]*=u,Bn.elements[5]*=u,Bn.elements[6]*=u,Bn.elements[8]*=h,Bn.elements[9]*=h,Bn.elements[10]*=h,n.setFromRotationMatrix(Bn),i.x=s,i.y=a,i.z=o,this}makePerspective(e,n,i,r,s,a,o=Si){const l=this.elements,c=2*s/(n-e),u=2*s/(i-r),h=(n+e)/(n-e),f=(i+r)/(i-r);let p,_;if(o===Si)p=-(a+s)/(a-s),_=-2*a*s/(a-s);else if(o===Ql)p=-a/(a-s),_=-a*s/(a-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return l[0]=c,l[4]=0,l[8]=h,l[12]=0,l[1]=0,l[5]=u,l[9]=f,l[13]=0,l[2]=0,l[6]=0,l[10]=p,l[14]=_,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,n,i,r,s,a,o=Si){const l=this.elements,c=1/(n-e),u=1/(i-r),h=1/(a-s),f=(n+e)*c,p=(i+r)*u;let _,y;if(o===Si)_=(a+s)*h,y=-2*h;else if(o===Ql)_=s*h,y=-1*h;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-f,l[1]=0,l[5]=2*u,l[9]=0,l[13]=-p,l[2]=0,l[6]=0,l[10]=y,l[14]=-_,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){const n=this.elements,i=e.elements;for(let r=0;r<16;r++)if(n[r]!==i[r])return!1;return!0}fromArray(e,n=0){for(let i=0;i<16;i++)this.elements[i]=e[i+n];return this}toArray(e=[],n=0){const i=this.elements;return e[n]=i[0],e[n+1]=i[1],e[n+2]=i[2],e[n+3]=i[3],e[n+4]=i[4],e[n+5]=i[5],e[n+6]=i[6],e[n+7]=i[7],e[n+8]=i[8],e[n+9]=i[9],e[n+10]=i[10],e[n+11]=i[11],e[n+12]=i[12],e[n+13]=i[13],e[n+14]=i[14],e[n+15]=i[15],e}}const ns=new N,Bn=new Je,eM=new N(0,0,0),tM=new N(1,1,1),Oi=new N,Uo=new N,vn=new N,dm=new Je,hm=new wi;class Kn{constructor(e=0,n=0,i=0,r=Kn.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=n,this._z=i,this._order=r}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,n,i,r=this._order){return this._x=e,this._y=n,this._z=i,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,n=this._order,i=!0){const r=e.elements,s=r[0],a=r[4],o=r[8],l=r[1],c=r[5],u=r[9],h=r[2],f=r[6],p=r[10];switch(n){case"XYZ":this._y=Math.asin(on(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-u,p),this._z=Math.atan2(-a,s)):(this._x=Math.atan2(f,c),this._z=0);break;case"YXZ":this._x=Math.asin(-on(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(o,p),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-h,s),this._z=0);break;case"ZXY":this._x=Math.asin(on(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(-h,p),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,s));break;case"ZYX":this._y=Math.asin(-on(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(f,p),this._z=Math.atan2(l,s)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(on(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-h,s)):(this._x=0,this._y=Math.atan2(o,p));break;case"XZY":this._z=Math.asin(-on(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(f,c),this._y=Math.atan2(o,s)):(this._x=Math.atan2(-u,p),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+n)}return this._order=n,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,n,i){return dm.makeRotationFromQuaternion(e),this.setFromRotationMatrix(dm,n,i)}setFromVector3(e,n=this._order){return this.set(e.x,e.y,e.z,n)}reorder(e){return hm.setFromEuler(this),this.setFromQuaternion(hm,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],n=0){return e[n]=this._x,e[n+1]=this._y,e[n+2]=this._z,e[n+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}Kn.DEFAULT_ORDER="XYZ";class Pf{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let nM=0;const fm=new N,is=new wi,ui=new Je,ko=new N,ga=new N,iM=new N,rM=new wi,pm=new N(1,0,0),mm=new N(0,1,0),gm=new N(0,0,1),vm={type:"added"},sM={type:"removed"},rs={type:"childadded",child:null},gu={type:"childremoved",child:null};class bt extends na{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:nM++}),this.uuid=oo(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=bt.DEFAULT_UP.clone();const e=new N,n=new Kn,i=new wi,r=new N(1,1,1);function s(){i.setFromEuler(n,!1)}function a(){n.setFromQuaternion(i,void 0,!1)}n._onChange(s),i._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:n},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:r},modelViewMatrix:{value:new Je},normalMatrix:{value:new ke}}),this.matrix=new Je,this.matrixWorld=new Je,this.matrixAutoUpdate=bt.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=bt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Pf,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,n){this.quaternion.setFromAxisAngle(e,n)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,n){return is.setFromAxisAngle(e,n),this.quaternion.multiply(is),this}rotateOnWorldAxis(e,n){return is.setFromAxisAngle(e,n),this.quaternion.premultiply(is),this}rotateX(e){return this.rotateOnAxis(pm,e)}rotateY(e){return this.rotateOnAxis(mm,e)}rotateZ(e){return this.rotateOnAxis(gm,e)}translateOnAxis(e,n){return fm.copy(e).applyQuaternion(this.quaternion),this.position.add(fm.multiplyScalar(n)),this}translateX(e){return this.translateOnAxis(pm,e)}translateY(e){return this.translateOnAxis(mm,e)}translateZ(e){return this.translateOnAxis(gm,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(ui.copy(this.matrixWorld).invert())}lookAt(e,n,i){e.isVector3?ko.copy(e):ko.set(e,n,i);const r=this.parent;this.updateWorldMatrix(!0,!1),ga.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?ui.lookAt(ga,ko,this.up):ui.lookAt(ko,ga,this.up),this.quaternion.setFromRotationMatrix(ui),r&&(ui.extractRotation(r.matrixWorld),is.setFromRotationMatrix(ui),this.quaternion.premultiply(is.invert()))}add(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.add(arguments[n]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(vm),rs.child=e,this.dispatchEvent(rs),rs.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}const n=this.children.indexOf(e);return n!==-1&&(e.parent=null,this.children.splice(n,1),e.dispatchEvent(sM),gu.child=e,this.dispatchEvent(gu),gu.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),ui.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),ui.multiply(e.parent.matrixWorld)),e.applyMatrix4(ui),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(vm),rs.child=e,this.dispatchEvent(rs),rs.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,n){if(this[e]===n)return this;for(let i=0,r=this.children.length;i<r;i++){const a=this.children[i].getObjectByProperty(e,n);if(a!==void 0)return a}}getObjectsByProperty(e,n,i=[]){this[e]===n&&i.push(this);const r=this.children;for(let s=0,a=r.length;s<a;s++)r[s].getObjectsByProperty(e,n,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ga,e,iM),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ga,rM,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const n=this.matrixWorld.elements;return e.set(n[8],n[9],n[10]).normalize()}raycast(){}traverse(e){e(this);const n=this.children;for(let i=0,r=n.length;i<r;i++)n[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const n=this.children;for(let i=0,r=n.length;i<r;i++)n[i].traverseVisible(e)}traverseAncestors(e){const n=this.parent;n!==null&&(e(n),n.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const n=this.children;for(let i=0,r=n.length;i<r;i++)n[i].updateMatrixWorld(e)}updateWorldMatrix(e,n){const i=this.parent;if(e===!0&&i!==null&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),n===!0){const r=this.children;for(let s=0,a=r.length;s<a;s++)r[s].updateWorldMatrix(!1,!0)}}toJSON(e){const n=e===void 0||typeof e=="string",i={};n&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const r={};r.uuid=this.uuid,r.type=this.type,this.name!==""&&(r.name=this.name),this.castShadow===!0&&(r.castShadow=!0),this.receiveShadow===!0&&(r.receiveShadow=!0),this.visible===!1&&(r.visible=!1),this.frustumCulled===!1&&(r.frustumCulled=!1),this.renderOrder!==0&&(r.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(r.matrixAutoUpdate=!1),this.isInstancedMesh&&(r.type="InstancedMesh",r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type="BatchedMesh",r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.visibility=this._visibility,r.active=this._active,r.bounds=this._bounds.map(o=>({boxInitialized:o.boxInitialized,boxMin:o.box.min.toArray(),boxMax:o.box.max.toArray(),sphereInitialized:o.sphereInitialized,sphereRadius:o.sphere.radius,sphereCenter:o.sphere.center.toArray()})),r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.geometryCount=this._geometryCount,r.matricesTexture=this._matricesTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere={center:r.boundingSphere.center.toArray(),radius:r.boundingSphere.radius}),this.boundingBox!==null&&(r.boundingBox={min:r.boundingBox.min.toArray(),max:r.boundingBox.max.toArray()}));function s(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=s(e.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const l=o.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){const h=l[c];s(e.shapes,h)}else s(e.shapes,l)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(s(e.materials,this.material[l]));r.material=o}else r.material=s(e.materials,this.material);if(this.children.length>0){r.children=[];for(let o=0;o<this.children.length;o++)r.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let o=0;o<this.animations.length;o++){const l=this.animations[o];r.animations.push(s(e.animations,l))}}if(n){const o=a(e.geometries),l=a(e.materials),c=a(e.textures),u=a(e.images),h=a(e.shapes),f=a(e.skeletons),p=a(e.animations),_=a(e.nodes);o.length>0&&(i.geometries=o),l.length>0&&(i.materials=l),c.length>0&&(i.textures=c),u.length>0&&(i.images=u),h.length>0&&(i.shapes=h),f.length>0&&(i.skeletons=f),p.length>0&&(i.animations=p),_.length>0&&(i.nodes=_)}return i.object=r,i;function a(o){const l=[];for(const c in o){const u=o[c];delete u.metadata,l.push(u)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,n=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),n===!0)for(let i=0;i<e.children.length;i++){const r=e.children[i];this.add(r.clone())}return this}}bt.DEFAULT_UP=new N(0,1,0);bt.DEFAULT_MATRIX_AUTO_UPDATE=!0;bt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const Hn=new N,di=new N,vu=new N,hi=new N,ss=new N,as=new N,_m=new N,_u=new N,xu=new N,yu=new N,Su=new _t,Mu=new _t,Eu=new _t;class Xn{constructor(e=new N,n=new N,i=new N){this.a=e,this.b=n,this.c=i}static getNormal(e,n,i,r){r.subVectors(i,n),Hn.subVectors(e,n),r.cross(Hn);const s=r.lengthSq();return s>0?r.multiplyScalar(1/Math.sqrt(s)):r.set(0,0,0)}static getBarycoord(e,n,i,r,s){Hn.subVectors(r,n),di.subVectors(i,n),vu.subVectors(e,n);const a=Hn.dot(Hn),o=Hn.dot(di),l=Hn.dot(vu),c=di.dot(di),u=di.dot(vu),h=a*c-o*o;if(h===0)return s.set(0,0,0),null;const f=1/h,p=(c*l-o*u)*f,_=(a*u-o*l)*f;return s.set(1-p-_,_,p)}static containsPoint(e,n,i,r){return this.getBarycoord(e,n,i,r,hi)===null?!1:hi.x>=0&&hi.y>=0&&hi.x+hi.y<=1}static getInterpolation(e,n,i,r,s,a,o,l){return this.getBarycoord(e,n,i,r,hi)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(s,hi.x),l.addScaledVector(a,hi.y),l.addScaledVector(o,hi.z),l)}static getInterpolatedAttribute(e,n,i,r,s,a){return Su.setScalar(0),Mu.setScalar(0),Eu.setScalar(0),Su.fromBufferAttribute(e,n),Mu.fromBufferAttribute(e,i),Eu.fromBufferAttribute(e,r),a.setScalar(0),a.addScaledVector(Su,s.x),a.addScaledVector(Mu,s.y),a.addScaledVector(Eu,s.z),a}static isFrontFacing(e,n,i,r){return Hn.subVectors(i,n),di.subVectors(e,n),Hn.cross(di).dot(r)<0}set(e,n,i){return this.a.copy(e),this.b.copy(n),this.c.copy(i),this}setFromPointsAndIndices(e,n,i,r){return this.a.copy(e[n]),this.b.copy(e[i]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,n,i,r){return this.a.fromBufferAttribute(e,n),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Hn.subVectors(this.c,this.b),di.subVectors(this.a,this.b),Hn.cross(di).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return Xn.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,n){return Xn.getBarycoord(e,this.a,this.b,this.c,n)}getInterpolation(e,n,i,r,s){return Xn.getInterpolation(e,this.a,this.b,this.c,n,i,r,s)}containsPoint(e){return Xn.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return Xn.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,n){const i=this.a,r=this.b,s=this.c;let a,o;ss.subVectors(r,i),as.subVectors(s,i),_u.subVectors(e,i);const l=ss.dot(_u),c=as.dot(_u);if(l<=0&&c<=0)return n.copy(i);xu.subVectors(e,r);const u=ss.dot(xu),h=as.dot(xu);if(u>=0&&h<=u)return n.copy(r);const f=l*h-u*c;if(f<=0&&l>=0&&u<=0)return a=l/(l-u),n.copy(i).addScaledVector(ss,a);yu.subVectors(e,s);const p=ss.dot(yu),_=as.dot(yu);if(_>=0&&p<=_)return n.copy(s);const y=p*c-l*_;if(y<=0&&c>=0&&_<=0)return o=c/(c-_),n.copy(i).addScaledVector(as,o);const m=u*_-p*h;if(m<=0&&h-u>=0&&p-_>=0)return _m.subVectors(s,r),o=(h-u)/(h-u+(p-_)),n.copy(r).addScaledVector(_m,o);const d=1/(m+y+f);return a=y*d,o=f*d,n.copy(i).addScaledVector(ss,a).addScaledVector(as,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const Kv={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},zi={h:0,s:0,l:0},Fo={h:0,s:0,l:0};function wu(t,e,n){return n<0&&(n+=1),n>1&&(n-=1),n<1/6?t+(e-t)*6*n:n<1/2?e:n<2/3?t+(e-t)*6*(2/3-n):t}class Fe{constructor(e,n,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,n,i)}set(e,n,i){if(n===void 0&&i===void 0){const r=e;r&&r.isColor?this.copy(r):typeof r=="number"?this.setHex(r):typeof r=="string"&&this.setStyle(r)}else this.setRGB(e,n,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,n=yn){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Qe.toWorkingColorSpace(this,n),this}setRGB(e,n,i,r=Qe.workingColorSpace){return this.r=e,this.g=n,this.b=i,Qe.toWorkingColorSpace(this,r),this}setHSL(e,n,i,r=Qe.workingColorSpace){if(e=VS(e,1),n=on(n,0,1),i=on(i,0,1),n===0)this.r=this.g=this.b=i;else{const s=i<=.5?i*(1+n):i+n-i*n,a=2*i-s;this.r=wu(a,s,e+1/3),this.g=wu(a,s,e),this.b=wu(a,s,e-1/3)}return Qe.toWorkingColorSpace(this,r),this}setStyle(e,n=yn){function i(s){s!==void 0&&parseFloat(s)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let s;const a=r[1],o=r[2];switch(a){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,n);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,n);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,n);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){const s=r[1],a=s.length;if(a===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,n);if(a===6)return this.setHex(parseInt(s,16),n);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,n);return this}setColorName(e,n=yn){const i=Kv[e.toLowerCase()];return i!==void 0?this.setHex(i,n):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Fs(e.r),this.g=Fs(e.g),this.b=Fs(e.b),this}copyLinearToSRGB(e){return this.r=lu(e.r),this.g=lu(e.g),this.b=lu(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=yn){return Qe.fromWorkingColorSpace(jt.copy(this),e),Math.round(on(jt.r*255,0,255))*65536+Math.round(on(jt.g*255,0,255))*256+Math.round(on(jt.b*255,0,255))}getHexString(e=yn){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,n=Qe.workingColorSpace){Qe.fromWorkingColorSpace(jt.copy(this),n);const i=jt.r,r=jt.g,s=jt.b,a=Math.max(i,r,s),o=Math.min(i,r,s);let l,c;const u=(o+a)/2;if(o===a)l=0,c=0;else{const h=a-o;switch(c=u<=.5?h/(a+o):h/(2-a-o),a){case i:l=(r-s)/h+(r<s?6:0);break;case r:l=(s-i)/h+2;break;case s:l=(i-r)/h+4;break}l/=6}return e.h=l,e.s=c,e.l=u,e}getRGB(e,n=Qe.workingColorSpace){return Qe.fromWorkingColorSpace(jt.copy(this),n),e.r=jt.r,e.g=jt.g,e.b=jt.b,e}getStyle(e=yn){Qe.fromWorkingColorSpace(jt.copy(this),e);const n=jt.r,i=jt.g,r=jt.b;return e!==yn?`color(${e} ${n.toFixed(3)} ${i.toFixed(3)} ${r.toFixed(3)})`:`rgb(${Math.round(n*255)},${Math.round(i*255)},${Math.round(r*255)})`}offsetHSL(e,n,i){return this.getHSL(zi),this.setHSL(zi.h+e,zi.s+n,zi.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,n){return this.r=e.r+n.r,this.g=e.g+n.g,this.b=e.b+n.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,n){return this.r+=(e.r-this.r)*n,this.g+=(e.g-this.g)*n,this.b+=(e.b-this.b)*n,this}lerpColors(e,n,i){return this.r=e.r+(n.r-e.r)*i,this.g=e.g+(n.g-e.g)*i,this.b=e.b+(n.b-e.b)*i,this}lerpHSL(e,n){this.getHSL(zi),e.getHSL(Fo);const i=au(zi.h,Fo.h,n),r=au(zi.s,Fo.s,n),s=au(zi.l,Fo.l,n);return this.setHSL(i,r,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const n=this.r,i=this.g,r=this.b,s=e.elements;return this.r=s[0]*n+s[3]*i+s[6]*r,this.g=s[1]*n+s[4]*i+s[7]*r,this.b=s[2]*n+s[5]*i+s[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,n=0){return this.r=e[n],this.g=e[n+1],this.b=e[n+2],this}toArray(e=[],n=0){return e[n]=this.r,e[n+1]=this.g,e[n+2]=this.b,e}fromBufferAttribute(e,n){return this.r=e.getX(n),this.g=e.getY(n),this.b=e.getZ(n),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const jt=new Fe;Fe.NAMES=Kv;let aM=0;class pr extends na{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:aM++}),this.uuid=oo(),this.name="",this.type="Material",this.blending=Is,this.side=cr,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Id,this.blendDst=Ud,this.blendEquation=Rr,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Fe(0,0,0),this.blendAlpha=0,this.depthFunc=js,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=rm,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Zr,this.stencilZFail=Zr,this.stencilZPass=Zr,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const n in e){const i=e[n];if(i===void 0){console.warn(`THREE.Material: parameter '${n}' has value of undefined.`);continue}const r=this[n];if(r===void 0){console.warn(`THREE.Material: '${n}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(i):r&&r.isVector3&&i&&i.isVector3?r.copy(i):this[n]=i}}toJSON(e){const n=e===void 0||typeof e=="string";n&&(e={textures:{},images:{}});const i={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==Is&&(i.blending=this.blending),this.side!==cr&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==Id&&(i.blendSrc=this.blendSrc),this.blendDst!==Ud&&(i.blendDst=this.blendDst),this.blendEquation!==Rr&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==js&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==rm&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Zr&&(i.stencilFail=this.stencilFail),this.stencilZFail!==Zr&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==Zr&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function r(s){const a=[];for(const o in s){const l=s[o];delete l.metadata,a.push(l)}return a}if(n){const s=r(e.textures),a=r(e.images);s.length>0&&(i.textures=s),a.length>0&&(i.images=a)}return i}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const n=e.clippingPlanes;let i=null;if(n!==null){const r=n.length;i=new Array(r);for(let s=0;s!==r;++s)i[s]=n[s].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}}class gi extends pr{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Fe(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Kn,this.combine=yf,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const Et=new N,Oo=new Oe;class Bt{constructor(e,n,i=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=n,this.count=e!==void 0?e.length/n:0,this.normalized=i,this.usage=sm,this.updateRanges=[],this.gpuType=ri,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,n){this.updateRanges.push({start:e,count:n})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,n,i){e*=this.itemSize,i*=n.itemSize;for(let r=0,s=this.itemSize;r<s;r++)this.array[e+r]=n.array[i+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let n=0,i=this.count;n<i;n++)Oo.fromBufferAttribute(this,n),Oo.applyMatrix3(e),this.setXY(n,Oo.x,Oo.y);else if(this.itemSize===3)for(let n=0,i=this.count;n<i;n++)Et.fromBufferAttribute(this,n),Et.applyMatrix3(e),this.setXYZ(n,Et.x,Et.y,Et.z);return this}applyMatrix4(e){for(let n=0,i=this.count;n<i;n++)Et.fromBufferAttribute(this,n),Et.applyMatrix4(e),this.setXYZ(n,Et.x,Et.y,Et.z);return this}applyNormalMatrix(e){for(let n=0,i=this.count;n<i;n++)Et.fromBufferAttribute(this,n),Et.applyNormalMatrix(e),this.setXYZ(n,Et.x,Et.y,Et.z);return this}transformDirection(e){for(let n=0,i=this.count;n<i;n++)Et.fromBufferAttribute(this,n),Et.transformDirection(e),this.setXYZ(n,Et.x,Et.y,Et.z);return this}set(e,n=0){return this.array.set(e,n),this}getComponent(e,n){let i=this.array[e*this.itemSize+n];return this.normalized&&(i=ha(i,this.array)),i}setComponent(e,n,i){return this.normalized&&(i=sn(i,this.array)),this.array[e*this.itemSize+n]=i,this}getX(e){let n=this.array[e*this.itemSize];return this.normalized&&(n=ha(n,this.array)),n}setX(e,n){return this.normalized&&(n=sn(n,this.array)),this.array[e*this.itemSize]=n,this}getY(e){let n=this.array[e*this.itemSize+1];return this.normalized&&(n=ha(n,this.array)),n}setY(e,n){return this.normalized&&(n=sn(n,this.array)),this.array[e*this.itemSize+1]=n,this}getZ(e){let n=this.array[e*this.itemSize+2];return this.normalized&&(n=ha(n,this.array)),n}setZ(e,n){return this.normalized&&(n=sn(n,this.array)),this.array[e*this.itemSize+2]=n,this}getW(e){let n=this.array[e*this.itemSize+3];return this.normalized&&(n=ha(n,this.array)),n}setW(e,n){return this.normalized&&(n=sn(n,this.array)),this.array[e*this.itemSize+3]=n,this}setXY(e,n,i){return e*=this.itemSize,this.normalized&&(n=sn(n,this.array),i=sn(i,this.array)),this.array[e+0]=n,this.array[e+1]=i,this}setXYZ(e,n,i,r){return e*=this.itemSize,this.normalized&&(n=sn(n,this.array),i=sn(i,this.array),r=sn(r,this.array)),this.array[e+0]=n,this.array[e+1]=i,this.array[e+2]=r,this}setXYZW(e,n,i,r,s){return e*=this.itemSize,this.normalized&&(n=sn(n,this.array),i=sn(i,this.array),r=sn(r,this.array),s=sn(s,this.array)),this.array[e+0]=n,this.array[e+1]=i,this.array[e+2]=r,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==sm&&(e.usage=this.usage),e}}class Zv extends Bt{constructor(e,n,i){super(new Uint16Array(e),n,i)}}class Qv extends Bt{constructor(e,n,i){super(new Uint32Array(e),n,i)}}class rt extends Bt{constructor(e,n,i){super(new Float32Array(e),n,i)}}let oM=0;const bn=new Je,Tu=new bt,os=new N,_n=new Xr,va=new Xr,Dt=new N;class Tt extends na{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:oM++}),this.uuid=oo(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new($v(e)?Qv:Zv)(e,1):this.index=e,this}getAttribute(e){return this.attributes[e]}setAttribute(e,n){return this.attributes[e]=n,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,n,i=0){this.groups.push({start:e,count:n,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,n){this.drawRange.start=e,this.drawRange.count=n}applyMatrix4(e){const n=this.attributes.position;n!==void 0&&(n.applyMatrix4(e),n.needsUpdate=!0);const i=this.attributes.normal;if(i!==void 0){const s=new ke().getNormalMatrix(e);i.applyNormalMatrix(s),i.needsUpdate=!0}const r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return bn.makeRotationFromQuaternion(e),this.applyMatrix4(bn),this}rotateX(e){return bn.makeRotationX(e),this.applyMatrix4(bn),this}rotateY(e){return bn.makeRotationY(e),this.applyMatrix4(bn),this}rotateZ(e){return bn.makeRotationZ(e),this.applyMatrix4(bn),this}translate(e,n,i){return bn.makeTranslation(e,n,i),this.applyMatrix4(bn),this}scale(e,n,i){return bn.makeScale(e,n,i),this.applyMatrix4(bn),this}lookAt(e){return Tu.lookAt(e),Tu.updateMatrix(),this.applyMatrix4(Tu.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(os).negate(),this.translate(os.x,os.y,os.z),this}setFromPoints(e){const n=[];for(let i=0,r=e.length;i<r;i++){const s=e[i];n.push(s.x,s.y,s.z||0)}return this.setAttribute("position",new rt(n,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Xr);const e=this.attributes.position,n=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new N(-1/0,-1/0,-1/0),new N(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),n)for(let i=0,r=n.length;i<r;i++){const s=n[i];_n.setFromBufferAttribute(s),this.morphTargetsRelative?(Dt.addVectors(this.boundingBox.min,_n.min),this.boundingBox.expandByPoint(Dt),Dt.addVectors(this.boundingBox.max,_n.max),this.boundingBox.expandByPoint(Dt)):(this.boundingBox.expandByPoint(_n.min),this.boundingBox.expandByPoint(_n.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new $r);const e=this.attributes.position,n=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new N,1/0);return}if(e){const i=this.boundingSphere.center;if(_n.setFromBufferAttribute(e),n)for(let s=0,a=n.length;s<a;s++){const o=n[s];va.setFromBufferAttribute(o),this.morphTargetsRelative?(Dt.addVectors(_n.min,va.min),_n.expandByPoint(Dt),Dt.addVectors(_n.max,va.max),_n.expandByPoint(Dt)):(_n.expandByPoint(va.min),_n.expandByPoint(va.max))}_n.getCenter(i);let r=0;for(let s=0,a=e.count;s<a;s++)Dt.fromBufferAttribute(e,s),r=Math.max(r,i.distanceToSquared(Dt));if(n)for(let s=0,a=n.length;s<a;s++){const o=n[s],l=this.morphTargetsRelative;for(let c=0,u=o.count;c<u;c++)Dt.fromBufferAttribute(o,c),l&&(os.fromBufferAttribute(e,c),Dt.add(os)),r=Math.max(r,i.distanceToSquared(Dt))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,n=this.attributes;if(e===null||n.position===void 0||n.normal===void 0||n.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const i=n.position,r=n.normal,s=n.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Bt(new Float32Array(4*i.count),4));const a=this.getAttribute("tangent"),o=[],l=[];for(let P=0;P<i.count;P++)o[P]=new N,l[P]=new N;const c=new N,u=new N,h=new N,f=new Oe,p=new Oe,_=new Oe,y=new N,m=new N;function d(P,V,x){c.fromBufferAttribute(i,P),u.fromBufferAttribute(i,V),h.fromBufferAttribute(i,x),f.fromBufferAttribute(s,P),p.fromBufferAttribute(s,V),_.fromBufferAttribute(s,x),u.sub(c),h.sub(c),p.sub(f),_.sub(f);const w=1/(p.x*_.y-_.x*p.y);isFinite(w)&&(y.copy(u).multiplyScalar(_.y).addScaledVector(h,-p.y).multiplyScalar(w),m.copy(h).multiplyScalar(p.x).addScaledVector(u,-_.x).multiplyScalar(w),o[P].add(y),o[V].add(y),o[x].add(y),l[P].add(m),l[V].add(m),l[x].add(m))}let g=this.groups;g.length===0&&(g=[{start:0,count:e.count}]);for(let P=0,V=g.length;P<V;++P){const x=g[P],w=x.start,O=x.count;for(let F=w,W=w+O;F<W;F+=3)d(e.getX(F+0),e.getX(F+1),e.getX(F+2))}const v=new N,S=new N,b=new N,C=new N;function A(P){b.fromBufferAttribute(r,P),C.copy(b);const V=o[P];v.copy(V),v.sub(b.multiplyScalar(b.dot(V))).normalize(),S.crossVectors(C,V);const w=S.dot(l[P])<0?-1:1;a.setXYZW(P,v.x,v.y,v.z,w)}for(let P=0,V=g.length;P<V;++P){const x=g[P],w=x.start,O=x.count;for(let F=w,W=w+O;F<W;F+=3)A(e.getX(F+0)),A(e.getX(F+1)),A(e.getX(F+2))}}computeVertexNormals(){const e=this.index,n=this.getAttribute("position");if(n!==void 0){let i=this.getAttribute("normal");if(i===void 0)i=new Bt(new Float32Array(n.count*3),3),this.setAttribute("normal",i);else for(let f=0,p=i.count;f<p;f++)i.setXYZ(f,0,0,0);const r=new N,s=new N,a=new N,o=new N,l=new N,c=new N,u=new N,h=new N;if(e)for(let f=0,p=e.count;f<p;f+=3){const _=e.getX(f+0),y=e.getX(f+1),m=e.getX(f+2);r.fromBufferAttribute(n,_),s.fromBufferAttribute(n,y),a.fromBufferAttribute(n,m),u.subVectors(a,s),h.subVectors(r,s),u.cross(h),o.fromBufferAttribute(i,_),l.fromBufferAttribute(i,y),c.fromBufferAttribute(i,m),o.add(u),l.add(u),c.add(u),i.setXYZ(_,o.x,o.y,o.z),i.setXYZ(y,l.x,l.y,l.z),i.setXYZ(m,c.x,c.y,c.z)}else for(let f=0,p=n.count;f<p;f+=3)r.fromBufferAttribute(n,f+0),s.fromBufferAttribute(n,f+1),a.fromBufferAttribute(n,f+2),u.subVectors(a,s),h.subVectors(r,s),u.cross(h),i.setXYZ(f+0,u.x,u.y,u.z),i.setXYZ(f+1,u.x,u.y,u.z),i.setXYZ(f+2,u.x,u.y,u.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let n=0,i=e.count;n<i;n++)Dt.fromBufferAttribute(e,n),Dt.normalize(),e.setXYZ(n,Dt.x,Dt.y,Dt.z)}toNonIndexed(){function e(o,l){const c=o.array,u=o.itemSize,h=o.normalized,f=new c.constructor(l.length*u);let p=0,_=0;for(let y=0,m=l.length;y<m;y++){o.isInterleavedBufferAttribute?p=l[y]*o.data.stride+o.offset:p=l[y]*u;for(let d=0;d<u;d++)f[_++]=c[p++]}return new Bt(f,u,h)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const n=new Tt,i=this.index.array,r=this.attributes;for(const o in r){const l=r[o],c=e(l,i);n.setAttribute(o,c)}const s=this.morphAttributes;for(const o in s){const l=[],c=s[o];for(let u=0,h=c.length;u<h;u++){const f=c[u],p=e(f,i);l.push(p)}n.morphAttributes[o]=l}n.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let o=0,l=a.length;o<l;o++){const c=a[o];n.addGroup(c.start,c.count,c.materialIndex)}return n}toJSON(){const e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};const n=this.index;n!==null&&(e.data.index={type:n.array.constructor.name,array:Array.prototype.slice.call(n.array)});const i=this.attributes;for(const l in i){const c=i[l];e.data.attributes[l]=c.toJSON(e.data)}const r={};let s=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],u=[];for(let h=0,f=c.length;h<f;h++){const p=c[h];u.push(p.toJSON(e.data))}u.length>0&&(r[l]=u,s=!0)}s&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));const o=this.boundingSphere;return o!==null&&(e.data.boundingSphere={center:o.center.toArray(),radius:o.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const n={};this.name=e.name;const i=e.index;i!==null&&this.setIndex(i.clone(n));const r=e.attributes;for(const c in r){const u=r[c];this.setAttribute(c,u.clone(n))}const s=e.morphAttributes;for(const c in s){const u=[],h=s[c];for(let f=0,p=h.length;f<p;f++)u.push(h[f].clone(n));this.morphAttributes[c]=u}this.morphTargetsRelative=e.morphTargetsRelative;const a=e.groups;for(let c=0,u=a.length;c<u;c++){const h=a[c];this.addGroup(h.start,h.count,h.materialIndex)}const o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const xm=new Je,_r=new Mc,zo=new $r,ym=new N,Bo=new N,Ho=new N,Vo=new N,Au=new N,Go=new N,Sm=new N,Wo=new N;class it extends bt{constructor(e=new Tt,n=new gi){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=n,this.updateMorphTargets()}copy(e,n){return super.copy(e,n),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const n=this.geometry.morphAttributes,i=Object.keys(n);if(i.length>0){const r=n[i[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,a=r.length;s<a;s++){const o=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=s}}}}getVertexPosition(e,n){const i=this.geometry,r=i.attributes.position,s=i.morphAttributes.position,a=i.morphTargetsRelative;n.fromBufferAttribute(r,e);const o=this.morphTargetInfluences;if(s&&o){Go.set(0,0,0);for(let l=0,c=s.length;l<c;l++){const u=o[l],h=s[l];u!==0&&(Au.fromBufferAttribute(h,e),a?Go.addScaledVector(Au,u):Go.addScaledVector(Au.sub(n),u))}n.add(Go)}return n}raycast(e,n){const i=this.geometry,r=this.material,s=this.matrixWorld;r!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),zo.copy(i.boundingSphere),zo.applyMatrix4(s),_r.copy(e.ray).recast(e.near),!(zo.containsPoint(_r.origin)===!1&&(_r.intersectSphere(zo,ym)===null||_r.origin.distanceToSquared(ym)>(e.far-e.near)**2))&&(xm.copy(s).invert(),_r.copy(e.ray).applyMatrix4(xm),!(i.boundingBox!==null&&_r.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,n,_r)))}_computeIntersections(e,n,i){let r;const s=this.geometry,a=this.material,o=s.index,l=s.attributes.position,c=s.attributes.uv,u=s.attributes.uv1,h=s.attributes.normal,f=s.groups,p=s.drawRange;if(o!==null)if(Array.isArray(a))for(let _=0,y=f.length;_<y;_++){const m=f[_],d=a[m.materialIndex],g=Math.max(m.start,p.start),v=Math.min(o.count,Math.min(m.start+m.count,p.start+p.count));for(let S=g,b=v;S<b;S+=3){const C=o.getX(S),A=o.getX(S+1),P=o.getX(S+2);r=jo(this,d,e,i,c,u,h,C,A,P),r&&(r.faceIndex=Math.floor(S/3),r.face.materialIndex=m.materialIndex,n.push(r))}}else{const _=Math.max(0,p.start),y=Math.min(o.count,p.start+p.count);for(let m=_,d=y;m<d;m+=3){const g=o.getX(m),v=o.getX(m+1),S=o.getX(m+2);r=jo(this,a,e,i,c,u,h,g,v,S),r&&(r.faceIndex=Math.floor(m/3),n.push(r))}}else if(l!==void 0)if(Array.isArray(a))for(let _=0,y=f.length;_<y;_++){const m=f[_],d=a[m.materialIndex],g=Math.max(m.start,p.start),v=Math.min(l.count,Math.min(m.start+m.count,p.start+p.count));for(let S=g,b=v;S<b;S+=3){const C=S,A=S+1,P=S+2;r=jo(this,d,e,i,c,u,h,C,A,P),r&&(r.faceIndex=Math.floor(S/3),r.face.materialIndex=m.materialIndex,n.push(r))}}else{const _=Math.max(0,p.start),y=Math.min(l.count,p.start+p.count);for(let m=_,d=y;m<d;m+=3){const g=m,v=m+1,S=m+2;r=jo(this,a,e,i,c,u,h,g,v,S),r&&(r.faceIndex=Math.floor(m/3),n.push(r))}}}}function lM(t,e,n,i,r,s,a,o){let l;if(e.side===Qt?l=i.intersectTriangle(a,s,r,!0,o):l=i.intersectTriangle(r,s,a,e.side===cr,o),l===null)return null;Wo.copy(o),Wo.applyMatrix4(t.matrixWorld);const c=n.ray.origin.distanceTo(Wo);return c<n.near||c>n.far?null:{distance:c,point:Wo.clone(),object:t}}function jo(t,e,n,i,r,s,a,o,l,c){t.getVertexPosition(o,Bo),t.getVertexPosition(l,Ho),t.getVertexPosition(c,Vo);const u=lM(t,e,n,i,Bo,Ho,Vo,Sm);if(u){const h=new N;Xn.getBarycoord(Sm,Bo,Ho,Vo,h),r&&(u.uv=Xn.getInterpolatedAttribute(r,o,l,c,h,new Oe)),s&&(u.uv1=Xn.getInterpolatedAttribute(s,o,l,c,h,new Oe)),a&&(u.normal=Xn.getInterpolatedAttribute(a,o,l,c,h,new N),u.normal.dot(i.direction)>0&&u.normal.multiplyScalar(-1));const f={a:o,b:l,c,normal:new N,materialIndex:0};Xn.getNormal(Bo,Ho,Vo,f.normal),u.face=f,u.barycoord=h}return u}class lo extends Tt{constructor(e=1,n=1,i=1,r=1,s=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:n,depth:i,widthSegments:r,heightSegments:s,depthSegments:a};const o=this;r=Math.floor(r),s=Math.floor(s),a=Math.floor(a);const l=[],c=[],u=[],h=[];let f=0,p=0;_("z","y","x",-1,-1,i,n,e,a,s,0),_("z","y","x",1,-1,i,n,-e,a,s,1),_("x","z","y",1,1,e,i,n,r,a,2),_("x","z","y",1,-1,e,i,-n,r,a,3),_("x","y","z",1,-1,e,n,i,r,s,4),_("x","y","z",-1,-1,e,n,-i,r,s,5),this.setIndex(l),this.setAttribute("position",new rt(c,3)),this.setAttribute("normal",new rt(u,3)),this.setAttribute("uv",new rt(h,2));function _(y,m,d,g,v,S,b,C,A,P,V){const x=S/A,w=b/P,O=S/2,F=b/2,W=C/2,q=A+1,z=P+1;let J=0,L=0;const Y=new N;for(let $=0;$<z;$++){const ne=$*w-F;for(let ye=0;ye<q;ye++){const Ie=ye*x-O;Y[y]=Ie*g,Y[m]=ne*v,Y[d]=W,c.push(Y.x,Y.y,Y.z),Y[y]=0,Y[m]=0,Y[d]=C>0?1:-1,u.push(Y.x,Y.y,Y.z),h.push(ye/A),h.push(1-$/P),J+=1}}for(let $=0;$<P;$++)for(let ne=0;ne<A;ne++){const ye=f+ne+q*$,Ie=f+ne+q*($+1),j=f+(ne+1)+q*($+1),ie=f+(ne+1)+q*$;l.push(ye,Ie,ie),l.push(Ie,j,ie),L+=6}o.addGroup(p,L,V),p+=L,f+=J}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new lo(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function Ks(t){const e={};for(const n in t){e[n]={};for(const i in t[n]){const r=t[n][i];r&&(r.isColor||r.isMatrix3||r.isMatrix4||r.isVector2||r.isVector3||r.isVector4||r.isTexture||r.isQuaternion)?r.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[n][i]=null):e[n][i]=r.clone():Array.isArray(r)?e[n][i]=r.slice():e[n][i]=r}}return e}function Yt(t){const e={};for(let n=0;n<t.length;n++){const i=Ks(t[n]);for(const r in i)e[r]=i[r]}return e}function cM(t){const e=[];for(let n=0;n<t.length;n++)e.push(t[n].clone());return e}function Jv(t){const e=t.getRenderTarget();return e===null?t.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Qe.workingColorSpace}const uM={clone:Ks,merge:Yt};var dM=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,hM=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Li extends pr{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=dM,this.fragmentShader=hM,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Ks(e.uniforms),this.uniformsGroups=cM(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const n=super.toJSON(e);n.glslVersion=this.glslVersion,n.uniforms={};for(const r in this.uniforms){const a=this.uniforms[r].value;a&&a.isTexture?n.uniforms[r]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?n.uniforms[r]={type:"c",value:a.getHex()}:a&&a.isVector2?n.uniforms[r]={type:"v2",value:a.toArray()}:a&&a.isVector3?n.uniforms[r]={type:"v3",value:a.toArray()}:a&&a.isVector4?n.uniforms[r]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?n.uniforms[r]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?n.uniforms[r]={type:"m4",value:a.toArray()}:n.uniforms[r]={value:a}}Object.keys(this.defines).length>0&&(n.defines=this.defines),n.vertexShader=this.vertexShader,n.fragmentShader=this.fragmentShader,n.lights=this.lights,n.clipping=this.clipping;const i={};for(const r in this.extensions)this.extensions[r]===!0&&(i[r]=!0);return Object.keys(i).length>0&&(n.extensions=i),n}}class e_ extends bt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Je,this.projectionMatrix=new Je,this.projectionMatrixInverse=new Je,this.coordinateSystem=Si}copy(e,n){return super.copy(e,n),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,n){super.updateWorldMatrix(e,n),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const Bi=new N,Mm=new Oe,Em=new Oe;class Sn extends e_{constructor(e=50,n=1,i=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=r,this.focus=10,this.aspect=n,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,n){return super.copy(e,n),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const n=.5*this.getFilmHeight()/e;this.fov=_h*2*Math.atan(n),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(su*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return _h*2*Math.atan(Math.tan(su*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,n,i){Bi.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Bi.x,Bi.y).multiplyScalar(-e/Bi.z),Bi.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(Bi.x,Bi.y).multiplyScalar(-e/Bi.z)}getViewSize(e,n){return this.getViewBounds(e,Mm,Em),n.subVectors(Em,Mm)}setViewOffset(e,n,i,r,s,a){this.aspect=e/n,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=n,this.view.offsetX=i,this.view.offsetY=r,this.view.width=s,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let n=e*Math.tan(su*.5*this.fov)/this.zoom,i=2*n,r=this.aspect*i,s=-.5*r;const a=this.view;if(this.view!==null&&this.view.enabled){const l=a.fullWidth,c=a.fullHeight;s+=a.offsetX*r/l,n-=a.offsetY*i/c,r*=a.width/l,i*=a.height/c}const o=this.filmOffset;o!==0&&(s+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+r,n,n-i,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const n=super.toJSON(e);return n.object.fov=this.fov,n.object.zoom=this.zoom,n.object.near=this.near,n.object.far=this.far,n.object.focus=this.focus,n.object.aspect=this.aspect,this.view!==null&&(n.object.view=Object.assign({},this.view)),n.object.filmGauge=this.filmGauge,n.object.filmOffset=this.filmOffset,n}}const ls=-90,cs=1;class fM extends bt{constructor(e,n,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;const r=new Sn(ls,cs,e,n);r.layers=this.layers,this.add(r);const s=new Sn(ls,cs,e,n);s.layers=this.layers,this.add(s);const a=new Sn(ls,cs,e,n);a.layers=this.layers,this.add(a);const o=new Sn(ls,cs,e,n);o.layers=this.layers,this.add(o);const l=new Sn(ls,cs,e,n);l.layers=this.layers,this.add(l);const c=new Sn(ls,cs,e,n);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const e=this.coordinateSystem,n=this.children.concat(),[i,r,s,a,o,l]=n;for(const c of n)this.remove(c);if(e===Si)i.up.set(0,1,0),i.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===Ql)i.up.set(0,-1,0),i.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const c of n)this.add(c),c.updateMatrixWorld()}update(e,n){this.parent===null&&this.updateMatrixWorld();const{renderTarget:i,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[s,a,o,l,c,u]=this.children,h=e.getRenderTarget(),f=e.getActiveCubeFace(),p=e.getActiveMipmapLevel(),_=e.xr.enabled;e.xr.enabled=!1;const y=i.texture.generateMipmaps;i.texture.generateMipmaps=!1,e.setRenderTarget(i,0,r),e.render(n,s),e.setRenderTarget(i,1,r),e.render(n,a),e.setRenderTarget(i,2,r),e.render(n,o),e.setRenderTarget(i,3,r),e.render(n,l),e.setRenderTarget(i,4,r),e.render(n,c),i.texture.generateMipmaps=y,e.setRenderTarget(i,5,r),e.render(n,u),e.setRenderTarget(h,f,p),e.xr.enabled=_,i.texture.needsPMREMUpdate=!0}}class t_ extends Jt{constructor(e,n,i,r,s,a,o,l,c,u){e=e!==void 0?e:[],n=n!==void 0?n:Xs,super(e,n,i,r,s,a,o,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class pM extends Gr{constructor(e=1,n={}){super(e,e,n),this.isWebGLCubeRenderTarget=!0;const i={width:e,height:e,depth:1},r=[i,i,i,i,i,i];this.texture=new t_(r,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=n.generateMipmaps!==void 0?n.generateMipmaps:!1,this.texture.minFilter=n.minFilter!==void 0?n.minFilter:Kt}fromEquirectangularTexture(e,n){this.texture.type=n.type,this.texture.colorSpace=n.colorSpace,this.texture.generateMipmaps=n.generateMipmaps,this.texture.minFilter=n.minFilter,this.texture.magFilter=n.magFilter;const i={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},r=new lo(5,5,5),s=new Li({name:"CubemapFromEquirect",uniforms:Ks(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:Qt,blending:sr});s.uniforms.tEquirect.value=n;const a=new it(r,s),o=n.minFilter;return n.minFilter===yi&&(n.minFilter=Kt),new fM(1,10,this).update(e,a),n.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,n,i,r){const s=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(n,i,r);e.setRenderTarget(s)}}const Cu=new N,mM=new N,gM=new ke;class Ar{constructor(e=new N(1,0,0),n=0){this.isPlane=!0,this.normal=e,this.constant=n}set(e,n){return this.normal.copy(e),this.constant=n,this}setComponents(e,n,i,r){return this.normal.set(e,n,i),this.constant=r,this}setFromNormalAndCoplanarPoint(e,n){return this.normal.copy(e),this.constant=-n.dot(this.normal),this}setFromCoplanarPoints(e,n,i){const r=Cu.subVectors(i,n).cross(mM.subVectors(e,n)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,n){return n.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,n){const i=e.delta(Cu),r=this.normal.dot(i);if(r===0)return this.distanceToPoint(e.start)===0?n.copy(e.start):null;const s=-(e.start.dot(this.normal)+this.constant)/r;return s<0||s>1?null:n.copy(e.start).addScaledVector(i,s)}intersectsLine(e){const n=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return n<0&&i>0||i<0&&n>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,n){const i=n||gM.getNormalMatrix(e),r=this.coplanarPoint(Cu).applyMatrix4(e),s=this.normal.applyMatrix3(i).normalize();return this.constant=-r.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const xr=new $r,Xo=new N;class Lf{constructor(e=new Ar,n=new Ar,i=new Ar,r=new Ar,s=new Ar,a=new Ar){this.planes=[e,n,i,r,s,a]}set(e,n,i,r,s,a){const o=this.planes;return o[0].copy(e),o[1].copy(n),o[2].copy(i),o[3].copy(r),o[4].copy(s),o[5].copy(a),this}copy(e){const n=this.planes;for(let i=0;i<6;i++)n[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,n=Si){const i=this.planes,r=e.elements,s=r[0],a=r[1],o=r[2],l=r[3],c=r[4],u=r[5],h=r[6],f=r[7],p=r[8],_=r[9],y=r[10],m=r[11],d=r[12],g=r[13],v=r[14],S=r[15];if(i[0].setComponents(l-s,f-c,m-p,S-d).normalize(),i[1].setComponents(l+s,f+c,m+p,S+d).normalize(),i[2].setComponents(l+a,f+u,m+_,S+g).normalize(),i[3].setComponents(l-a,f-u,m-_,S-g).normalize(),i[4].setComponents(l-o,f-h,m-y,S-v).normalize(),n===Si)i[5].setComponents(l+o,f+h,m+y,S+v).normalize();else if(n===Ql)i[5].setComponents(o,h,y,v).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+n);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),xr.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const n=e.geometry;n.boundingSphere===null&&n.computeBoundingSphere(),xr.copy(n.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(xr)}intersectsSprite(e){return xr.center.set(0,0,0),xr.radius=.7071067811865476,xr.applyMatrix4(e.matrixWorld),this.intersectsSphere(xr)}intersectsSphere(e){const n=this.planes,i=e.center,r=-e.radius;for(let s=0;s<6;s++)if(n[s].distanceToPoint(i)<r)return!1;return!0}intersectsBox(e){const n=this.planes;for(let i=0;i<6;i++){const r=n[i];if(Xo.x=r.normal.x>0?e.max.x:e.min.x,Xo.y=r.normal.y>0?e.max.y:e.min.y,Xo.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(Xo)<0)return!1}return!0}containsPoint(e){const n=this.planes;for(let i=0;i<6;i++)if(n[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function n_(){let t=null,e=!1,n=null,i=null;function r(s,a){n(s,a),i=t.requestAnimationFrame(r)}return{start:function(){e!==!0&&n!==null&&(i=t.requestAnimationFrame(r),e=!0)},stop:function(){t.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(s){n=s},setContext:function(s){t=s}}}function vM(t){const e=new WeakMap;function n(o,l){const c=o.array,u=o.usage,h=c.byteLength,f=t.createBuffer();t.bindBuffer(l,f),t.bufferData(l,c,u),o.onUploadCallback();let p;if(c instanceof Float32Array)p=t.FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?p=t.HALF_FLOAT:p=t.UNSIGNED_SHORT;else if(c instanceof Int16Array)p=t.SHORT;else if(c instanceof Uint32Array)p=t.UNSIGNED_INT;else if(c instanceof Int32Array)p=t.INT;else if(c instanceof Int8Array)p=t.BYTE;else if(c instanceof Uint8Array)p=t.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)p=t.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:f,type:p,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:h}}function i(o,l,c){const u=l.array,h=l.updateRanges;if(t.bindBuffer(c,o),h.length===0)t.bufferSubData(c,0,u);else{h.sort((p,_)=>p.start-_.start);let f=0;for(let p=1;p<h.length;p++){const _=h[f],y=h[p];y.start<=_.start+_.count+1?_.count=Math.max(_.count,y.start+y.count-_.start):(++f,h[f]=y)}h.length=f+1;for(let p=0,_=h.length;p<_;p++){const y=h[p];t.bufferSubData(c,y.start*u.BYTES_PER_ELEMENT,u,y.start,y.count)}l.clearUpdateRanges()}l.onUploadCallback()}function r(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function s(o){o.isInterleavedBufferAttribute&&(o=o.data);const l=e.get(o);l&&(t.deleteBuffer(l.buffer),e.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){const u=e.get(o);(!u||u.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}const c=e.get(o);if(c===void 0)e.set(o,n(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(c.buffer,o,l),c.version=o.version}}return{get:r,remove:s,update:a}}class Zs extends Tt{constructor(e=1,n=1,i=1,r=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:n,widthSegments:i,heightSegments:r};const s=e/2,a=n/2,o=Math.floor(i),l=Math.floor(r),c=o+1,u=l+1,h=e/o,f=n/l,p=[],_=[],y=[],m=[];for(let d=0;d<u;d++){const g=d*f-a;for(let v=0;v<c;v++){const S=v*h-s;_.push(S,-g,0),y.push(0,0,1),m.push(v/o),m.push(1-d/l)}}for(let d=0;d<l;d++)for(let g=0;g<o;g++){const v=g+c*d,S=g+c*(d+1),b=g+1+c*(d+1),C=g+1+c*d;p.push(v,S,C),p.push(S,b,C)}this.setIndex(p),this.setAttribute("position",new rt(_,3)),this.setAttribute("normal",new rt(y,3)),this.setAttribute("uv",new rt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Zs(e.width,e.height,e.widthSegments,e.heightSegments)}}var _M=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,xM=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,yM=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,SM=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,MM=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,EM=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,wM=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,TM=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,AM=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,CM=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,RM=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,bM=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,PM=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,LM=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,DM=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,NM=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,IM=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,UM=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,kM=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,FM=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,OM=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,zM=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,BM=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,HM=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,VM=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,GM=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,WM=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,jM=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,XM=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,$M=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,YM="gl_FragColor = linearToOutputTexel( gl_FragColor );",qM=`
const mat3 LINEAR_SRGB_TO_LINEAR_DISPLAY_P3 = mat3(
	vec3( 0.8224621, 0.177538, 0.0 ),
	vec3( 0.0331941, 0.9668058, 0.0 ),
	vec3( 0.0170827, 0.0723974, 0.9105199 )
);
const mat3 LINEAR_DISPLAY_P3_TO_LINEAR_SRGB = mat3(
	vec3( 1.2249401, - 0.2249404, 0.0 ),
	vec3( - 0.0420569, 1.0420571, 0.0 ),
	vec3( - 0.0196376, - 0.0786361, 1.0982735 )
);
vec4 LinearSRGBToLinearDisplayP3( in vec4 value ) {
	return vec4( value.rgb * LINEAR_SRGB_TO_LINEAR_DISPLAY_P3, value.a );
}
vec4 LinearDisplayP3ToLinearSRGB( in vec4 value ) {
	return vec4( value.rgb * LINEAR_DISPLAY_P3_TO_LINEAR_SRGB, value.a );
}
vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,KM=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,ZM=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,QM=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,JM=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,eE=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,tE=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,nE=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,iE=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,rE=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,sE=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,aE=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,oE=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,lE=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,cE=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,uE=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,dE=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,hE=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,fE=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,pE=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,mE=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,gE=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,vE=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,_E=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,xE=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,yE=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,SE=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,ME=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,EE=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,wE=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,TE=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,AE=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,CE=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,RE=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,bE=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,PE=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,LE=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,DE=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,NE=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,IE=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,UE=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,kE=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,FE=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,OE=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,zE=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,BE=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,HE=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,VE=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,GE=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,WE=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,jE=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,XE=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,$E=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,YE=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,qE=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,KE=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,ZE=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,QE=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,JE=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,e1=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,t1=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,n1=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,i1=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,r1=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,s1=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,a1=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,o1=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,l1=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,c1=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,u1=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,d1=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,h1=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
		
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
		
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		
		#else
		
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,f1=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,p1=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,m1=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,g1=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const v1=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,_1=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,x1=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,y1=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,S1=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,M1=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,E1=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,w1=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,T1=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,A1=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,C1=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,R1=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,b1=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,P1=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,L1=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,D1=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,N1=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,I1=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,U1=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,k1=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,F1=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,O1=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,z1=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,B1=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,H1=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,V1=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,G1=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,W1=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,j1=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,X1=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,$1=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Y1=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,q1=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,K1=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Ue={alphahash_fragment:_M,alphahash_pars_fragment:xM,alphamap_fragment:yM,alphamap_pars_fragment:SM,alphatest_fragment:MM,alphatest_pars_fragment:EM,aomap_fragment:wM,aomap_pars_fragment:TM,batching_pars_vertex:AM,batching_vertex:CM,begin_vertex:RM,beginnormal_vertex:bM,bsdfs:PM,iridescence_fragment:LM,bumpmap_pars_fragment:DM,clipping_planes_fragment:NM,clipping_planes_pars_fragment:IM,clipping_planes_pars_vertex:UM,clipping_planes_vertex:kM,color_fragment:FM,color_pars_fragment:OM,color_pars_vertex:zM,color_vertex:BM,common:HM,cube_uv_reflection_fragment:VM,defaultnormal_vertex:GM,displacementmap_pars_vertex:WM,displacementmap_vertex:jM,emissivemap_fragment:XM,emissivemap_pars_fragment:$M,colorspace_fragment:YM,colorspace_pars_fragment:qM,envmap_fragment:KM,envmap_common_pars_fragment:ZM,envmap_pars_fragment:QM,envmap_pars_vertex:JM,envmap_physical_pars_fragment:uE,envmap_vertex:eE,fog_vertex:tE,fog_pars_vertex:nE,fog_fragment:iE,fog_pars_fragment:rE,gradientmap_pars_fragment:sE,lightmap_pars_fragment:aE,lights_lambert_fragment:oE,lights_lambert_pars_fragment:lE,lights_pars_begin:cE,lights_toon_fragment:dE,lights_toon_pars_fragment:hE,lights_phong_fragment:fE,lights_phong_pars_fragment:pE,lights_physical_fragment:mE,lights_physical_pars_fragment:gE,lights_fragment_begin:vE,lights_fragment_maps:_E,lights_fragment_end:xE,logdepthbuf_fragment:yE,logdepthbuf_pars_fragment:SE,logdepthbuf_pars_vertex:ME,logdepthbuf_vertex:EE,map_fragment:wE,map_pars_fragment:TE,map_particle_fragment:AE,map_particle_pars_fragment:CE,metalnessmap_fragment:RE,metalnessmap_pars_fragment:bE,morphinstance_vertex:PE,morphcolor_vertex:LE,morphnormal_vertex:DE,morphtarget_pars_vertex:NE,morphtarget_vertex:IE,normal_fragment_begin:UE,normal_fragment_maps:kE,normal_pars_fragment:FE,normal_pars_vertex:OE,normal_vertex:zE,normalmap_pars_fragment:BE,clearcoat_normal_fragment_begin:HE,clearcoat_normal_fragment_maps:VE,clearcoat_pars_fragment:GE,iridescence_pars_fragment:WE,opaque_fragment:jE,packing:XE,premultiplied_alpha_fragment:$E,project_vertex:YE,dithering_fragment:qE,dithering_pars_fragment:KE,roughnessmap_fragment:ZE,roughnessmap_pars_fragment:QE,shadowmap_pars_fragment:JE,shadowmap_pars_vertex:e1,shadowmap_vertex:t1,shadowmask_pars_fragment:n1,skinbase_vertex:i1,skinning_pars_vertex:r1,skinning_vertex:s1,skinnormal_vertex:a1,specularmap_fragment:o1,specularmap_pars_fragment:l1,tonemapping_fragment:c1,tonemapping_pars_fragment:u1,transmission_fragment:d1,transmission_pars_fragment:h1,uv_pars_fragment:f1,uv_pars_vertex:p1,uv_vertex:m1,worldpos_vertex:g1,background_vert:v1,background_frag:_1,backgroundCube_vert:x1,backgroundCube_frag:y1,cube_vert:S1,cube_frag:M1,depth_vert:E1,depth_frag:w1,distanceRGBA_vert:T1,distanceRGBA_frag:A1,equirect_vert:C1,equirect_frag:R1,linedashed_vert:b1,linedashed_frag:P1,meshbasic_vert:L1,meshbasic_frag:D1,meshlambert_vert:N1,meshlambert_frag:I1,meshmatcap_vert:U1,meshmatcap_frag:k1,meshnormal_vert:F1,meshnormal_frag:O1,meshphong_vert:z1,meshphong_frag:B1,meshphysical_vert:H1,meshphysical_frag:V1,meshtoon_vert:G1,meshtoon_frag:W1,points_vert:j1,points_frag:X1,shadow_vert:$1,shadow_frag:Y1,sprite_vert:q1,sprite_frag:K1},oe={common:{diffuse:{value:new Fe(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new ke},alphaMap:{value:null},alphaMapTransform:{value:new ke},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new ke}},envmap:{envMap:{value:null},envMapRotation:{value:new ke},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new ke}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new ke}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new ke},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new ke},normalScale:{value:new Oe(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new ke},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new ke}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new ke}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new ke}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Fe(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Fe(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new ke},alphaTest:{value:0},uvTransform:{value:new ke}},sprite:{diffuse:{value:new Fe(16777215)},opacity:{value:1},center:{value:new Oe(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new ke},alphaMap:{value:null},alphaMapTransform:{value:new ke},alphaTest:{value:0}}},ei={basic:{uniforms:Yt([oe.common,oe.specularmap,oe.envmap,oe.aomap,oe.lightmap,oe.fog]),vertexShader:Ue.meshbasic_vert,fragmentShader:Ue.meshbasic_frag},lambert:{uniforms:Yt([oe.common,oe.specularmap,oe.envmap,oe.aomap,oe.lightmap,oe.emissivemap,oe.bumpmap,oe.normalmap,oe.displacementmap,oe.fog,oe.lights,{emissive:{value:new Fe(0)}}]),vertexShader:Ue.meshlambert_vert,fragmentShader:Ue.meshlambert_frag},phong:{uniforms:Yt([oe.common,oe.specularmap,oe.envmap,oe.aomap,oe.lightmap,oe.emissivemap,oe.bumpmap,oe.normalmap,oe.displacementmap,oe.fog,oe.lights,{emissive:{value:new Fe(0)},specular:{value:new Fe(1118481)},shininess:{value:30}}]),vertexShader:Ue.meshphong_vert,fragmentShader:Ue.meshphong_frag},standard:{uniforms:Yt([oe.common,oe.envmap,oe.aomap,oe.lightmap,oe.emissivemap,oe.bumpmap,oe.normalmap,oe.displacementmap,oe.roughnessmap,oe.metalnessmap,oe.fog,oe.lights,{emissive:{value:new Fe(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Ue.meshphysical_vert,fragmentShader:Ue.meshphysical_frag},toon:{uniforms:Yt([oe.common,oe.aomap,oe.lightmap,oe.emissivemap,oe.bumpmap,oe.normalmap,oe.displacementmap,oe.gradientmap,oe.fog,oe.lights,{emissive:{value:new Fe(0)}}]),vertexShader:Ue.meshtoon_vert,fragmentShader:Ue.meshtoon_frag},matcap:{uniforms:Yt([oe.common,oe.bumpmap,oe.normalmap,oe.displacementmap,oe.fog,{matcap:{value:null}}]),vertexShader:Ue.meshmatcap_vert,fragmentShader:Ue.meshmatcap_frag},points:{uniforms:Yt([oe.points,oe.fog]),vertexShader:Ue.points_vert,fragmentShader:Ue.points_frag},dashed:{uniforms:Yt([oe.common,oe.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Ue.linedashed_vert,fragmentShader:Ue.linedashed_frag},depth:{uniforms:Yt([oe.common,oe.displacementmap]),vertexShader:Ue.depth_vert,fragmentShader:Ue.depth_frag},normal:{uniforms:Yt([oe.common,oe.bumpmap,oe.normalmap,oe.displacementmap,{opacity:{value:1}}]),vertexShader:Ue.meshnormal_vert,fragmentShader:Ue.meshnormal_frag},sprite:{uniforms:Yt([oe.sprite,oe.fog]),vertexShader:Ue.sprite_vert,fragmentShader:Ue.sprite_frag},background:{uniforms:{uvTransform:{value:new ke},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Ue.background_vert,fragmentShader:Ue.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new ke}},vertexShader:Ue.backgroundCube_vert,fragmentShader:Ue.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Ue.cube_vert,fragmentShader:Ue.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Ue.equirect_vert,fragmentShader:Ue.equirect_frag},distanceRGBA:{uniforms:Yt([oe.common,oe.displacementmap,{referencePosition:{value:new N},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Ue.distanceRGBA_vert,fragmentShader:Ue.distanceRGBA_frag},shadow:{uniforms:Yt([oe.lights,oe.fog,{color:{value:new Fe(0)},opacity:{value:1}}]),vertexShader:Ue.shadow_vert,fragmentShader:Ue.shadow_frag}};ei.physical={uniforms:Yt([ei.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new ke},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new ke},clearcoatNormalScale:{value:new Oe(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new ke},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new ke},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new ke},sheen:{value:0},sheenColor:{value:new Fe(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new ke},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new ke},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new ke},transmissionSamplerSize:{value:new Oe},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new ke},attenuationDistance:{value:0},attenuationColor:{value:new Fe(0)},specularColor:{value:new Fe(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new ke},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new ke},anisotropyVector:{value:new Oe},anisotropyMap:{value:null},anisotropyMapTransform:{value:new ke}}]),vertexShader:Ue.meshphysical_vert,fragmentShader:Ue.meshphysical_frag};const $o={r:0,b:0,g:0},yr=new Kn,Z1=new Je;function Q1(t,e,n,i,r,s,a){const o=new Fe(0);let l=s===!0?0:1,c,u,h=null,f=0,p=null;function _(g){let v=g.isScene===!0?g.background:null;return v&&v.isTexture&&(v=(g.backgroundBlurriness>0?n:e).get(v)),v}function y(g){let v=!1;const S=_(g);S===null?d(o,l):S&&S.isColor&&(d(S,1),v=!0);const b=t.xr.getEnvironmentBlendMode();b==="additive"?i.buffers.color.setClear(0,0,0,1,a):b==="alpha-blend"&&i.buffers.color.setClear(0,0,0,0,a),(t.autoClear||v)&&(i.buffers.depth.setTest(!0),i.buffers.depth.setMask(!0),i.buffers.color.setMask(!0),t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil))}function m(g,v){const S=_(v);S&&(S.isCubeTexture||S.mapping===yc)?(u===void 0&&(u=new it(new lo(1,1,1),new Li({name:"BackgroundCubeMaterial",uniforms:Ks(ei.backgroundCube.uniforms),vertexShader:ei.backgroundCube.vertexShader,fragmentShader:ei.backgroundCube.fragmentShader,side:Qt,depthTest:!1,depthWrite:!1,fog:!1})),u.geometry.deleteAttribute("normal"),u.geometry.deleteAttribute("uv"),u.onBeforeRender=function(b,C,A){this.matrixWorld.copyPosition(A.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(u)),yr.copy(v.backgroundRotation),yr.x*=-1,yr.y*=-1,yr.z*=-1,S.isCubeTexture&&S.isRenderTargetTexture===!1&&(yr.y*=-1,yr.z*=-1),u.material.uniforms.envMap.value=S,u.material.uniforms.flipEnvMap.value=S.isCubeTexture&&S.isRenderTargetTexture===!1?-1:1,u.material.uniforms.backgroundBlurriness.value=v.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=v.backgroundIntensity,u.material.uniforms.backgroundRotation.value.setFromMatrix4(Z1.makeRotationFromEuler(yr)),u.material.toneMapped=Qe.getTransfer(S.colorSpace)!==ut,(h!==S||f!==S.version||p!==t.toneMapping)&&(u.material.needsUpdate=!0,h=S,f=S.version,p=t.toneMapping),u.layers.enableAll(),g.unshift(u,u.geometry,u.material,0,0,null)):S&&S.isTexture&&(c===void 0&&(c=new it(new Zs(2,2),new Li({name:"BackgroundMaterial",uniforms:Ks(ei.background.uniforms),vertexShader:ei.background.vertexShader,fragmentShader:ei.background.fragmentShader,side:cr,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(c)),c.material.uniforms.t2D.value=S,c.material.uniforms.backgroundIntensity.value=v.backgroundIntensity,c.material.toneMapped=Qe.getTransfer(S.colorSpace)!==ut,S.matrixAutoUpdate===!0&&S.updateMatrix(),c.material.uniforms.uvTransform.value.copy(S.matrix),(h!==S||f!==S.version||p!==t.toneMapping)&&(c.material.needsUpdate=!0,h=S,f=S.version,p=t.toneMapping),c.layers.enableAll(),g.unshift(c,c.geometry,c.material,0,0,null))}function d(g,v){g.getRGB($o,Jv(t)),i.buffers.color.setClear($o.r,$o.g,$o.b,v,a)}return{getClearColor:function(){return o},setClearColor:function(g,v=1){o.set(g),l=v,d(o,l)},getClearAlpha:function(){return l},setClearAlpha:function(g){l=g,d(o,l)},render:y,addToRenderList:m}}function J1(t,e){const n=t.getParameter(t.MAX_VERTEX_ATTRIBS),i={},r=f(null);let s=r,a=!1;function o(x,w,O,F,W){let q=!1;const z=h(F,O,w);s!==z&&(s=z,c(s.object)),q=p(x,F,O,W),q&&_(x,F,O,W),W!==null&&e.update(W,t.ELEMENT_ARRAY_BUFFER),(q||a)&&(a=!1,S(x,w,O,F),W!==null&&t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,e.get(W).buffer))}function l(){return t.createVertexArray()}function c(x){return t.bindVertexArray(x)}function u(x){return t.deleteVertexArray(x)}function h(x,w,O){const F=O.wireframe===!0;let W=i[x.id];W===void 0&&(W={},i[x.id]=W);let q=W[w.id];q===void 0&&(q={},W[w.id]=q);let z=q[F];return z===void 0&&(z=f(l()),q[F]=z),z}function f(x){const w=[],O=[],F=[];for(let W=0;W<n;W++)w[W]=0,O[W]=0,F[W]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:w,enabledAttributes:O,attributeDivisors:F,object:x,attributes:{},index:null}}function p(x,w,O,F){const W=s.attributes,q=w.attributes;let z=0;const J=O.getAttributes();for(const L in J)if(J[L].location>=0){const $=W[L];let ne=q[L];if(ne===void 0&&(L==="instanceMatrix"&&x.instanceMatrix&&(ne=x.instanceMatrix),L==="instanceColor"&&x.instanceColor&&(ne=x.instanceColor)),$===void 0||$.attribute!==ne||ne&&$.data!==ne.data)return!0;z++}return s.attributesNum!==z||s.index!==F}function _(x,w,O,F){const W={},q=w.attributes;let z=0;const J=O.getAttributes();for(const L in J)if(J[L].location>=0){let $=q[L];$===void 0&&(L==="instanceMatrix"&&x.instanceMatrix&&($=x.instanceMatrix),L==="instanceColor"&&x.instanceColor&&($=x.instanceColor));const ne={};ne.attribute=$,$&&$.data&&(ne.data=$.data),W[L]=ne,z++}s.attributes=W,s.attributesNum=z,s.index=F}function y(){const x=s.newAttributes;for(let w=0,O=x.length;w<O;w++)x[w]=0}function m(x){d(x,0)}function d(x,w){const O=s.newAttributes,F=s.enabledAttributes,W=s.attributeDivisors;O[x]=1,F[x]===0&&(t.enableVertexAttribArray(x),F[x]=1),W[x]!==w&&(t.vertexAttribDivisor(x,w),W[x]=w)}function g(){const x=s.newAttributes,w=s.enabledAttributes;for(let O=0,F=w.length;O<F;O++)w[O]!==x[O]&&(t.disableVertexAttribArray(O),w[O]=0)}function v(x,w,O,F,W,q,z){z===!0?t.vertexAttribIPointer(x,w,O,W,q):t.vertexAttribPointer(x,w,O,F,W,q)}function S(x,w,O,F){y();const W=F.attributes,q=O.getAttributes(),z=w.defaultAttributeValues;for(const J in q){const L=q[J];if(L.location>=0){let Y=W[J];if(Y===void 0&&(J==="instanceMatrix"&&x.instanceMatrix&&(Y=x.instanceMatrix),J==="instanceColor"&&x.instanceColor&&(Y=x.instanceColor)),Y!==void 0){const $=Y.normalized,ne=Y.itemSize,ye=e.get(Y);if(ye===void 0)continue;const Ie=ye.buffer,j=ye.type,ie=ye.bytesPerElement,he=j===t.INT||j===t.UNSIGNED_INT||Y.gpuType===Sf;if(Y.isInterleavedBufferAttribute){const ce=Y.data,De=ce.stride,Ae=Y.offset;if(ce.isInstancedInterleavedBuffer){for(let Ve=0;Ve<L.locationSize;Ve++)d(L.location+Ve,ce.meshPerAttribute);x.isInstancedMesh!==!0&&F._maxInstanceCount===void 0&&(F._maxInstanceCount=ce.meshPerAttribute*ce.count)}else for(let Ve=0;Ve<L.locationSize;Ve++)m(L.location+Ve);t.bindBuffer(t.ARRAY_BUFFER,Ie);for(let Ve=0;Ve<L.locationSize;Ve++)v(L.location+Ve,ne/L.locationSize,j,$,De*ie,(Ae+ne/L.locationSize*Ve)*ie,he)}else{if(Y.isInstancedBufferAttribute){for(let ce=0;ce<L.locationSize;ce++)d(L.location+ce,Y.meshPerAttribute);x.isInstancedMesh!==!0&&F._maxInstanceCount===void 0&&(F._maxInstanceCount=Y.meshPerAttribute*Y.count)}else for(let ce=0;ce<L.locationSize;ce++)m(L.location+ce);t.bindBuffer(t.ARRAY_BUFFER,Ie);for(let ce=0;ce<L.locationSize;ce++)v(L.location+ce,ne/L.locationSize,j,$,ne*ie,ne/L.locationSize*ce*ie,he)}}else if(z!==void 0){const $=z[J];if($!==void 0)switch($.length){case 2:t.vertexAttrib2fv(L.location,$);break;case 3:t.vertexAttrib3fv(L.location,$);break;case 4:t.vertexAttrib4fv(L.location,$);break;default:t.vertexAttrib1fv(L.location,$)}}}}g()}function b(){P();for(const x in i){const w=i[x];for(const O in w){const F=w[O];for(const W in F)u(F[W].object),delete F[W];delete w[O]}delete i[x]}}function C(x){if(i[x.id]===void 0)return;const w=i[x.id];for(const O in w){const F=w[O];for(const W in F)u(F[W].object),delete F[W];delete w[O]}delete i[x.id]}function A(x){for(const w in i){const O=i[w];if(O[x.id]===void 0)continue;const F=O[x.id];for(const W in F)u(F[W].object),delete F[W];delete O[x.id]}}function P(){V(),a=!0,s!==r&&(s=r,c(s.object))}function V(){r.geometry=null,r.program=null,r.wireframe=!1}return{setup:o,reset:P,resetDefaultState:V,dispose:b,releaseStatesOfGeometry:C,releaseStatesOfProgram:A,initAttributes:y,enableAttribute:m,disableUnusedAttributes:g}}function ew(t,e,n){let i;function r(c){i=c}function s(c,u){t.drawArrays(i,c,u),n.update(u,i,1)}function a(c,u,h){h!==0&&(t.drawArraysInstanced(i,c,u,h),n.update(u,i,h))}function o(c,u,h){if(h===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,c,0,u,0,h);let p=0;for(let _=0;_<h;_++)p+=u[_];n.update(p,i,1)}function l(c,u,h,f){if(h===0)return;const p=e.get("WEBGL_multi_draw");if(p===null)for(let _=0;_<c.length;_++)a(c[_],u[_],f[_]);else{p.multiDrawArraysInstancedWEBGL(i,c,0,u,0,f,0,h);let _=0;for(let y=0;y<h;y++)_+=u[y];for(let y=0;y<f.length;y++)n.update(_,i,f[y])}}this.setMode=r,this.render=s,this.renderInstances=a,this.renderMultiDraw=o,this.renderMultiDrawInstances=l}function tw(t,e,n,i){let r;function s(){if(r!==void 0)return r;if(e.has("EXT_texture_filter_anisotropic")===!0){const A=e.get("EXT_texture_filter_anisotropic");r=t.getParameter(A.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else r=0;return r}function a(A){return!(A!==En&&i.convert(A)!==t.getParameter(t.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(A){const P=A===ao&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(A!==Pi&&i.convert(A)!==t.getParameter(t.IMPLEMENTATION_COLOR_READ_TYPE)&&A!==ri&&!P)}function l(A){if(A==="highp"){if(t.getShaderPrecisionFormat(t.VERTEX_SHADER,t.HIGH_FLOAT).precision>0&&t.getShaderPrecisionFormat(t.FRAGMENT_SHADER,t.HIGH_FLOAT).precision>0)return"highp";A="mediump"}return A==="mediump"&&t.getShaderPrecisionFormat(t.VERTEX_SHADER,t.MEDIUM_FLOAT).precision>0&&t.getShaderPrecisionFormat(t.FRAGMENT_SHADER,t.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=n.precision!==void 0?n.precision:"highp";const u=l(c);u!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",u,"instead."),c=u);const h=n.logarithmicDepthBuffer===!0,f=n.reverseDepthBuffer===!0&&e.has("EXT_clip_control");if(f===!0){const A=e.get("EXT_clip_control");A.clipControlEXT(A.LOWER_LEFT_EXT,A.ZERO_TO_ONE_EXT)}const p=t.getParameter(t.MAX_TEXTURE_IMAGE_UNITS),_=t.getParameter(t.MAX_VERTEX_TEXTURE_IMAGE_UNITS),y=t.getParameter(t.MAX_TEXTURE_SIZE),m=t.getParameter(t.MAX_CUBE_MAP_TEXTURE_SIZE),d=t.getParameter(t.MAX_VERTEX_ATTRIBS),g=t.getParameter(t.MAX_VERTEX_UNIFORM_VECTORS),v=t.getParameter(t.MAX_VARYING_VECTORS),S=t.getParameter(t.MAX_FRAGMENT_UNIFORM_VECTORS),b=_>0,C=t.getParameter(t.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:s,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:h,reverseDepthBuffer:f,maxTextures:p,maxVertexTextures:_,maxTextureSize:y,maxCubemapSize:m,maxAttributes:d,maxVertexUniforms:g,maxVaryings:v,maxFragmentUniforms:S,vertexTextures:b,maxSamples:C}}function nw(t){const e=this;let n=null,i=0,r=!1,s=!1;const a=new Ar,o=new ke,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(h,f){const p=h.length!==0||f||i!==0||r;return r=f,i=h.length,p},this.beginShadows=function(){s=!0,u(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(h,f){n=u(h,f,0)},this.setState=function(h,f,p){const _=h.clippingPlanes,y=h.clipIntersection,m=h.clipShadows,d=t.get(h);if(!r||_===null||_.length===0||s&&!m)s?u(null):c();else{const g=s?0:i,v=g*4;let S=d.clippingState||null;l.value=S,S=u(_,f,v,p);for(let b=0;b!==v;++b)S[b]=n[b];d.clippingState=S,this.numIntersection=y?this.numPlanes:0,this.numPlanes+=g}};function c(){l.value!==n&&(l.value=n,l.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function u(h,f,p,_){const y=h!==null?h.length:0;let m=null;if(y!==0){if(m=l.value,_!==!0||m===null){const d=p+y*4,g=f.matrixWorldInverse;o.getNormalMatrix(g),(m===null||m.length<d)&&(m=new Float32Array(d));for(let v=0,S=p;v!==y;++v,S+=4)a.copy(h[v]).applyMatrix4(g,o),a.normal.toArray(m,S),m[S+3]=a.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=y,e.numIntersection=0,m}}function iw(t){let e=new WeakMap;function n(a,o){return o===Gd?a.mapping=Xs:o===Wd&&(a.mapping=$s),a}function i(a){if(a&&a.isTexture){const o=a.mapping;if(o===Gd||o===Wd)if(e.has(a)){const l=e.get(a).texture;return n(l,a.mapping)}else{const l=a.image;if(l&&l.height>0){const c=new pM(l.height);return c.fromEquirectangularTexture(t,a),e.set(a,c),a.addEventListener("dispose",r),n(c.texture,a.mapping)}else return null}}return a}function r(a){const o=a.target;o.removeEventListener("dispose",r);const l=e.get(o);l!==void 0&&(e.delete(o),l.dispose())}function s(){e=new WeakMap}return{get:i,dispose:s}}class i_ extends e_{constructor(e=-1,n=1,i=1,r=-1,s=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=n,this.top=i,this.bottom=r,this.near=s,this.far=a,this.updateProjectionMatrix()}copy(e,n){return super.copy(e,n),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,n,i,r,s,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=n,this.view.offsetX=i,this.view.offsetY=r,this.view.width=s,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),n=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,r=(this.top+this.bottom)/2;let s=i-e,a=i+e,o=r+n,l=r-n;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=c*this.view.offsetX,a=s+c*this.view.width,o-=u*this.view.offsetY,l=o-u*this.view.height}this.projectionMatrix.makeOrthographic(s,a,o,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const n=super.toJSON(e);return n.object.zoom=this.zoom,n.object.left=this.left,n.object.right=this.right,n.object.top=this.top,n.object.bottom=this.bottom,n.object.near=this.near,n.object.far=this.far,this.view!==null&&(n.object.view=Object.assign({},this.view)),n}}const Ts=4,wm=[.125,.215,.35,.446,.526,.582],br=20,Ru=new i_,Tm=new Fe;let bu=null,Pu=0,Lu=0,Du=!1;const Cr=(1+Math.sqrt(5))/2,us=1/Cr,Am=[new N(-Cr,us,0),new N(Cr,us,0),new N(-us,0,Cr),new N(us,0,Cr),new N(0,Cr,-us),new N(0,Cr,us),new N(-1,1,-1),new N(1,1,-1),new N(-1,1,1),new N(1,1,1)];class Cm{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,n=0,i=.1,r=100){bu=this._renderer.getRenderTarget(),Pu=this._renderer.getActiveCubeFace(),Lu=this._renderer.getActiveMipmapLevel(),Du=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,i,r,s),n>0&&this._blur(s,0,0,n),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,n=null){return this._fromTexture(e,n)}fromCubemap(e,n=null){return this._fromTexture(e,n)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Pm(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=bm(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(bu,Pu,Lu),this._renderer.xr.enabled=Du,e.scissorTest=!1,Yo(e,0,0,e.width,e.height)}_fromTexture(e,n){e.mapping===Xs||e.mapping===$s?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),bu=this._renderer.getRenderTarget(),Pu=this._renderer.getActiveCubeFace(),Lu=this._renderer.getActiveMipmapLevel(),Du=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const i=n||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),n=4*this._cubeSize,i={magFilter:Kt,minFilter:Kt,generateMipmaps:!1,type:ao,format:En,colorSpace:fr,depthBuffer:!1},r=Rm(e,n,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==n){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Rm(e,n,i);const{_lodMax:s}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=rw(s)),this._blurMaterial=sw(s,e,n)}return r}_compileMaterial(e){const n=new it(this._lodPlanes[0],e);this._renderer.compile(n,Ru)}_sceneToCubeUV(e,n,i,r){const o=new Sn(90,1,n,i),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],u=this._renderer,h=u.autoClear,f=u.toneMapping;u.getClearColor(Tm),u.toneMapping=ar,u.autoClear=!1;const p=new gi({name:"PMREM.Background",side:Qt,depthWrite:!1,depthTest:!1}),_=new it(new lo,p);let y=!1;const m=e.background;m?m.isColor&&(p.color.copy(m),e.background=null,y=!0):(p.color.copy(Tm),y=!0);for(let d=0;d<6;d++){const g=d%3;g===0?(o.up.set(0,l[d],0),o.lookAt(c[d],0,0)):g===1?(o.up.set(0,0,l[d]),o.lookAt(0,c[d],0)):(o.up.set(0,l[d],0),o.lookAt(0,0,c[d]));const v=this._cubeSize;Yo(r,g*v,d>2?v:0,v,v),u.setRenderTarget(r),y&&u.render(_,o),u.render(e,o)}_.geometry.dispose(),_.material.dispose(),u.toneMapping=f,u.autoClear=h,e.background=m}_textureToCubeUV(e,n){const i=this._renderer,r=e.mapping===Xs||e.mapping===$s;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=Pm()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=bm());const s=r?this._cubemapMaterial:this._equirectMaterial,a=new it(this._lodPlanes[0],s),o=s.uniforms;o.envMap.value=e;const l=this._cubeSize;Yo(n,0,0,3*l,2*l),i.setRenderTarget(n),i.render(a,Ru)}_applyPMREM(e){const n=this._renderer,i=n.autoClear;n.autoClear=!1;const r=this._lodPlanes.length;for(let s=1;s<r;s++){const a=Math.sqrt(this._sigmas[s]*this._sigmas[s]-this._sigmas[s-1]*this._sigmas[s-1]),o=Am[(r-s-1)%Am.length];this._blur(e,s-1,s,a,o)}n.autoClear=i}_blur(e,n,i,r,s){const a=this._pingPongRenderTarget;this._halfBlur(e,a,n,i,r,"latitudinal",s),this._halfBlur(a,e,i,i,r,"longitudinal",s)}_halfBlur(e,n,i,r,s,a,o){const l=this._renderer,c=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const u=3,h=new it(this._lodPlanes[r],c),f=c.uniforms,p=this._sizeLods[i]-1,_=isFinite(s)?Math.PI/(2*p):2*Math.PI/(2*br-1),y=s/_,m=isFinite(s)?1+Math.floor(u*y):br;m>br&&console.warn(`sigmaRadians, ${s}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${br}`);const d=[];let g=0;for(let A=0;A<br;++A){const P=A/y,V=Math.exp(-P*P/2);d.push(V),A===0?g+=V:A<m&&(g+=2*V)}for(let A=0;A<d.length;A++)d[A]=d[A]/g;f.envMap.value=e.texture,f.samples.value=m,f.weights.value=d,f.latitudinal.value=a==="latitudinal",o&&(f.poleAxis.value=o);const{_lodMax:v}=this;f.dTheta.value=_,f.mipInt.value=v-i;const S=this._sizeLods[r],b=3*S*(r>v-Ts?r-v+Ts:0),C=4*(this._cubeSize-S);Yo(n,b,C,3*S,2*S),l.setRenderTarget(n),l.render(h,Ru)}}function rw(t){const e=[],n=[],i=[];let r=t;const s=t-Ts+1+wm.length;for(let a=0;a<s;a++){const o=Math.pow(2,r);n.push(o);let l=1/o;a>t-Ts?l=wm[a-t+Ts-1]:a===0&&(l=0),i.push(l);const c=1/(o-2),u=-c,h=1+c,f=[u,u,h,u,h,h,u,u,h,h,u,h],p=6,_=6,y=3,m=2,d=1,g=new Float32Array(y*_*p),v=new Float32Array(m*_*p),S=new Float32Array(d*_*p);for(let C=0;C<p;C++){const A=C%3*2/3-1,P=C>2?0:-1,V=[A,P,0,A+2/3,P,0,A+2/3,P+1,0,A,P,0,A+2/3,P+1,0,A,P+1,0];g.set(V,y*_*C),v.set(f,m*_*C);const x=[C,C,C,C,C,C];S.set(x,d*_*C)}const b=new Tt;b.setAttribute("position",new Bt(g,y)),b.setAttribute("uv",new Bt(v,m)),b.setAttribute("faceIndex",new Bt(S,d)),e.push(b),r>Ts&&r--}return{lodPlanes:e,sizeLods:n,sigmas:i}}function Rm(t,e,n){const i=new Gr(t,e,n);return i.texture.mapping=yc,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function Yo(t,e,n,i,r){t.viewport.set(e,n,i,r),t.scissor.set(e,n,i,r)}function sw(t,e,n){const i=new Float32Array(br),r=new N(0,1,0);return new Li({name:"SphericalGaussianBlur",defines:{n:br,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${t}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:r}},vertexShader:Df(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:sr,depthTest:!1,depthWrite:!1})}function bm(){return new Li({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Df(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:sr,depthTest:!1,depthWrite:!1})}function Pm(){return new Li({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Df(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:sr,depthTest:!1,depthWrite:!1})}function Df(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function aw(t){let e=new WeakMap,n=null;function i(o){if(o&&o.isTexture){const l=o.mapping,c=l===Gd||l===Wd,u=l===Xs||l===$s;if(c||u){let h=e.get(o);const f=h!==void 0?h.texture.pmremVersion:0;if(o.isRenderTargetTexture&&o.pmremVersion!==f)return n===null&&(n=new Cm(t)),h=c?n.fromEquirectangular(o,h):n.fromCubemap(o,h),h.texture.pmremVersion=o.pmremVersion,e.set(o,h),h.texture;if(h!==void 0)return h.texture;{const p=o.image;return c&&p&&p.height>0||u&&p&&r(p)?(n===null&&(n=new Cm(t)),h=c?n.fromEquirectangular(o):n.fromCubemap(o),h.texture.pmremVersion=o.pmremVersion,e.set(o,h),o.addEventListener("dispose",s),h.texture):null}}}return o}function r(o){let l=0;const c=6;for(let u=0;u<c;u++)o[u]!==void 0&&l++;return l===c}function s(o){const l=o.target;l.removeEventListener("dispose",s);const c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function a(){e=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:i,dispose:a}}function ow(t){const e={};function n(i){if(e[i]!==void 0)return e[i];let r;switch(i){case"WEBGL_depth_texture":r=t.getExtension("WEBGL_depth_texture")||t.getExtension("MOZ_WEBGL_depth_texture")||t.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":r=t.getExtension("EXT_texture_filter_anisotropic")||t.getExtension("MOZ_EXT_texture_filter_anisotropic")||t.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":r=t.getExtension("WEBGL_compressed_texture_s3tc")||t.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||t.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":r=t.getExtension("WEBGL_compressed_texture_pvrtc")||t.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:r=t.getExtension(i)}return e[i]=r,r}return{has:function(i){return n(i)!==null},init:function(){n("EXT_color_buffer_float"),n("WEBGL_clip_cull_distance"),n("OES_texture_float_linear"),n("EXT_color_buffer_half_float"),n("WEBGL_multisampled_render_to_texture"),n("WEBGL_render_shared_exponent")},get:function(i){const r=n(i);return r===null&&yl("THREE.WebGLRenderer: "+i+" extension not supported."),r}}}function lw(t,e,n,i){const r={},s=new WeakMap;function a(h){const f=h.target;f.index!==null&&e.remove(f.index);for(const _ in f.attributes)e.remove(f.attributes[_]);for(const _ in f.morphAttributes){const y=f.morphAttributes[_];for(let m=0,d=y.length;m<d;m++)e.remove(y[m])}f.removeEventListener("dispose",a),delete r[f.id];const p=s.get(f);p&&(e.remove(p),s.delete(f)),i.releaseStatesOfGeometry(f),f.isInstancedBufferGeometry===!0&&delete f._maxInstanceCount,n.memory.geometries--}function o(h,f){return r[f.id]===!0||(f.addEventListener("dispose",a),r[f.id]=!0,n.memory.geometries++),f}function l(h){const f=h.attributes;for(const _ in f)e.update(f[_],t.ARRAY_BUFFER);const p=h.morphAttributes;for(const _ in p){const y=p[_];for(let m=0,d=y.length;m<d;m++)e.update(y[m],t.ARRAY_BUFFER)}}function c(h){const f=[],p=h.index,_=h.attributes.position;let y=0;if(p!==null){const g=p.array;y=p.version;for(let v=0,S=g.length;v<S;v+=3){const b=g[v+0],C=g[v+1],A=g[v+2];f.push(b,C,C,A,A,b)}}else if(_!==void 0){const g=_.array;y=_.version;for(let v=0,S=g.length/3-1;v<S;v+=3){const b=v+0,C=v+1,A=v+2;f.push(b,C,C,A,A,b)}}else return;const m=new($v(f)?Qv:Zv)(f,1);m.version=y;const d=s.get(h);d&&e.remove(d),s.set(h,m)}function u(h){const f=s.get(h);if(f){const p=h.index;p!==null&&f.version<p.version&&c(h)}else c(h);return s.get(h)}return{get:o,update:l,getWireframeAttribute:u}}function cw(t,e,n){let i;function r(f){i=f}let s,a;function o(f){s=f.type,a=f.bytesPerElement}function l(f,p){t.drawElements(i,p,s,f*a),n.update(p,i,1)}function c(f,p,_){_!==0&&(t.drawElementsInstanced(i,p,s,f*a,_),n.update(p,i,_))}function u(f,p,_){if(_===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,p,0,s,f,0,_);let m=0;for(let d=0;d<_;d++)m+=p[d];n.update(m,i,1)}function h(f,p,_,y){if(_===0)return;const m=e.get("WEBGL_multi_draw");if(m===null)for(let d=0;d<f.length;d++)c(f[d]/a,p[d],y[d]);else{m.multiDrawElementsInstancedWEBGL(i,p,0,s,f,0,y,0,_);let d=0;for(let g=0;g<_;g++)d+=p[g];for(let g=0;g<y.length;g++)n.update(d,i,y[g])}}this.setMode=r,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=u,this.renderMultiDrawInstances=h}function uw(t){const e={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function i(s,a,o){switch(n.calls++,a){case t.TRIANGLES:n.triangles+=o*(s/3);break;case t.LINES:n.lines+=o*(s/2);break;case t.LINE_STRIP:n.lines+=o*(s-1);break;case t.LINE_LOOP:n.lines+=o*s;break;case t.POINTS:n.points+=o*s;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",a);break}}function r(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:e,render:n,programs:null,autoReset:!0,reset:r,update:i}}function dw(t,e,n){const i=new WeakMap,r=new _t;function s(a,o,l){const c=a.morphTargetInfluences,u=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,h=u!==void 0?u.length:0;let f=i.get(o);if(f===void 0||f.count!==h){let V=function(){A.dispose(),i.delete(o),o.removeEventListener("dispose",V)};f!==void 0&&f.texture.dispose();const p=o.morphAttributes.position!==void 0,_=o.morphAttributes.normal!==void 0,y=o.morphAttributes.color!==void 0,m=o.morphAttributes.position||[],d=o.morphAttributes.normal||[],g=o.morphAttributes.color||[];let v=0;p===!0&&(v=1),_===!0&&(v=2),y===!0&&(v=3);let S=o.attributes.position.count*v,b=1;S>e.maxTextureSize&&(b=Math.ceil(S/e.maxTextureSize),S=e.maxTextureSize);const C=new Float32Array(S*b*4*h),A=new qv(C,S,b,h);A.type=ri,A.needsUpdate=!0;const P=v*4;for(let x=0;x<h;x++){const w=m[x],O=d[x],F=g[x],W=S*b*4*x;for(let q=0;q<w.count;q++){const z=q*P;p===!0&&(r.fromBufferAttribute(w,q),C[W+z+0]=r.x,C[W+z+1]=r.y,C[W+z+2]=r.z,C[W+z+3]=0),_===!0&&(r.fromBufferAttribute(O,q),C[W+z+4]=r.x,C[W+z+5]=r.y,C[W+z+6]=r.z,C[W+z+7]=0),y===!0&&(r.fromBufferAttribute(F,q),C[W+z+8]=r.x,C[W+z+9]=r.y,C[W+z+10]=r.z,C[W+z+11]=F.itemSize===4?r.w:1)}}f={count:h,texture:A,size:new Oe(S,b)},i.set(o,f),o.addEventListener("dispose",V)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(t,"morphTexture",a.morphTexture,n);else{let p=0;for(let y=0;y<c.length;y++)p+=c[y];const _=o.morphTargetsRelative?1:1-p;l.getUniforms().setValue(t,"morphTargetBaseInfluence",_),l.getUniforms().setValue(t,"morphTargetInfluences",c)}l.getUniforms().setValue(t,"morphTargetsTexture",f.texture,n),l.getUniforms().setValue(t,"morphTargetsTextureSize",f.size)}return{update:s}}function hw(t,e,n,i){let r=new WeakMap;function s(l){const c=i.render.frame,u=l.geometry,h=e.get(l,u);if(r.get(h)!==c&&(e.update(h),r.set(h,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",o)===!1&&l.addEventListener("dispose",o),r.get(l)!==c&&(n.update(l.instanceMatrix,t.ARRAY_BUFFER),l.instanceColor!==null&&n.update(l.instanceColor,t.ARRAY_BUFFER),r.set(l,c))),l.isSkinnedMesh){const f=l.skeleton;r.get(f)!==c&&(f.update(),r.set(f,c))}return h}function a(){r=new WeakMap}function o(l){const c=l.target;c.removeEventListener("dispose",o),n.remove(c.instanceMatrix),c.instanceColor!==null&&n.remove(c.instanceColor)}return{update:s,dispose:a}}class r_ extends Jt{constructor(e,n,i,r,s,a,o,l,c,u=ks){if(u!==ks&&u!==qs)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");i===void 0&&u===ks&&(i=Vr),i===void 0&&u===qs&&(i=Ys),super(null,r,s,a,o,l,u,i,c),this.isDepthTexture=!0,this.image={width:e,height:n},this.magFilter=o!==void 0?o:un,this.minFilter=l!==void 0?l:un,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){const n=super.toJSON(e);return this.compareFunction!==null&&(n.compareFunction=this.compareFunction),n}}const s_=new Jt,Lm=new r_(1,1),a_=new qv,o_=new QS,l_=new t_,Dm=[],Nm=[],Im=new Float32Array(16),Um=new Float32Array(9),km=new Float32Array(4);function ia(t,e,n){const i=t[0];if(i<=0||i>0)return t;const r=e*n;let s=Dm[r];if(s===void 0&&(s=new Float32Array(r),Dm[r]=s),e!==0){i.toArray(s,0);for(let a=1,o=0;a!==e;++a)o+=n,t[a].toArray(s,o)}return s}function Pt(t,e){if(t.length!==e.length)return!1;for(let n=0,i=t.length;n<i;n++)if(t[n]!==e[n])return!1;return!0}function Lt(t,e){for(let n=0,i=e.length;n<i;n++)t[n]=e[n]}function Ec(t,e){let n=Nm[e];n===void 0&&(n=new Int32Array(e),Nm[e]=n);for(let i=0;i!==e;++i)n[i]=t.allocateTextureUnit();return n}function fw(t,e){const n=this.cache;n[0]!==e&&(t.uniform1f(this.addr,e),n[0]=e)}function pw(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y)&&(t.uniform2f(this.addr,e.x,e.y),n[0]=e.x,n[1]=e.y);else{if(Pt(n,e))return;t.uniform2fv(this.addr,e),Lt(n,e)}}function mw(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z)&&(t.uniform3f(this.addr,e.x,e.y,e.z),n[0]=e.x,n[1]=e.y,n[2]=e.z);else if(e.r!==void 0)(n[0]!==e.r||n[1]!==e.g||n[2]!==e.b)&&(t.uniform3f(this.addr,e.r,e.g,e.b),n[0]=e.r,n[1]=e.g,n[2]=e.b);else{if(Pt(n,e))return;t.uniform3fv(this.addr,e),Lt(n,e)}}function gw(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z||n[3]!==e.w)&&(t.uniform4f(this.addr,e.x,e.y,e.z,e.w),n[0]=e.x,n[1]=e.y,n[2]=e.z,n[3]=e.w);else{if(Pt(n,e))return;t.uniform4fv(this.addr,e),Lt(n,e)}}function vw(t,e){const n=this.cache,i=e.elements;if(i===void 0){if(Pt(n,e))return;t.uniformMatrix2fv(this.addr,!1,e),Lt(n,e)}else{if(Pt(n,i))return;km.set(i),t.uniformMatrix2fv(this.addr,!1,km),Lt(n,i)}}function _w(t,e){const n=this.cache,i=e.elements;if(i===void 0){if(Pt(n,e))return;t.uniformMatrix3fv(this.addr,!1,e),Lt(n,e)}else{if(Pt(n,i))return;Um.set(i),t.uniformMatrix3fv(this.addr,!1,Um),Lt(n,i)}}function xw(t,e){const n=this.cache,i=e.elements;if(i===void 0){if(Pt(n,e))return;t.uniformMatrix4fv(this.addr,!1,e),Lt(n,e)}else{if(Pt(n,i))return;Im.set(i),t.uniformMatrix4fv(this.addr,!1,Im),Lt(n,i)}}function yw(t,e){const n=this.cache;n[0]!==e&&(t.uniform1i(this.addr,e),n[0]=e)}function Sw(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y)&&(t.uniform2i(this.addr,e.x,e.y),n[0]=e.x,n[1]=e.y);else{if(Pt(n,e))return;t.uniform2iv(this.addr,e),Lt(n,e)}}function Mw(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z)&&(t.uniform3i(this.addr,e.x,e.y,e.z),n[0]=e.x,n[1]=e.y,n[2]=e.z);else{if(Pt(n,e))return;t.uniform3iv(this.addr,e),Lt(n,e)}}function Ew(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z||n[3]!==e.w)&&(t.uniform4i(this.addr,e.x,e.y,e.z,e.w),n[0]=e.x,n[1]=e.y,n[2]=e.z,n[3]=e.w);else{if(Pt(n,e))return;t.uniform4iv(this.addr,e),Lt(n,e)}}function ww(t,e){const n=this.cache;n[0]!==e&&(t.uniform1ui(this.addr,e),n[0]=e)}function Tw(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y)&&(t.uniform2ui(this.addr,e.x,e.y),n[0]=e.x,n[1]=e.y);else{if(Pt(n,e))return;t.uniform2uiv(this.addr,e),Lt(n,e)}}function Aw(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z)&&(t.uniform3ui(this.addr,e.x,e.y,e.z),n[0]=e.x,n[1]=e.y,n[2]=e.z);else{if(Pt(n,e))return;t.uniform3uiv(this.addr,e),Lt(n,e)}}function Cw(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z||n[3]!==e.w)&&(t.uniform4ui(this.addr,e.x,e.y,e.z,e.w),n[0]=e.x,n[1]=e.y,n[2]=e.z,n[3]=e.w);else{if(Pt(n,e))return;t.uniform4uiv(this.addr,e),Lt(n,e)}}function Rw(t,e,n){const i=this.cache,r=n.allocateTextureUnit();i[0]!==r&&(t.uniform1i(this.addr,r),i[0]=r);let s;this.type===t.SAMPLER_2D_SHADOW?(Lm.compareFunction=Xv,s=Lm):s=s_,n.setTexture2D(e||s,r)}function bw(t,e,n){const i=this.cache,r=n.allocateTextureUnit();i[0]!==r&&(t.uniform1i(this.addr,r),i[0]=r),n.setTexture3D(e||o_,r)}function Pw(t,e,n){const i=this.cache,r=n.allocateTextureUnit();i[0]!==r&&(t.uniform1i(this.addr,r),i[0]=r),n.setTextureCube(e||l_,r)}function Lw(t,e,n){const i=this.cache,r=n.allocateTextureUnit();i[0]!==r&&(t.uniform1i(this.addr,r),i[0]=r),n.setTexture2DArray(e||a_,r)}function Dw(t){switch(t){case 5126:return fw;case 35664:return pw;case 35665:return mw;case 35666:return gw;case 35674:return vw;case 35675:return _w;case 35676:return xw;case 5124:case 35670:return yw;case 35667:case 35671:return Sw;case 35668:case 35672:return Mw;case 35669:case 35673:return Ew;case 5125:return ww;case 36294:return Tw;case 36295:return Aw;case 36296:return Cw;case 35678:case 36198:case 36298:case 36306:case 35682:return Rw;case 35679:case 36299:case 36307:return bw;case 35680:case 36300:case 36308:case 36293:return Pw;case 36289:case 36303:case 36311:case 36292:return Lw}}function Nw(t,e){t.uniform1fv(this.addr,e)}function Iw(t,e){const n=ia(e,this.size,2);t.uniform2fv(this.addr,n)}function Uw(t,e){const n=ia(e,this.size,3);t.uniform3fv(this.addr,n)}function kw(t,e){const n=ia(e,this.size,4);t.uniform4fv(this.addr,n)}function Fw(t,e){const n=ia(e,this.size,4);t.uniformMatrix2fv(this.addr,!1,n)}function Ow(t,e){const n=ia(e,this.size,9);t.uniformMatrix3fv(this.addr,!1,n)}function zw(t,e){const n=ia(e,this.size,16);t.uniformMatrix4fv(this.addr,!1,n)}function Bw(t,e){t.uniform1iv(this.addr,e)}function Hw(t,e){t.uniform2iv(this.addr,e)}function Vw(t,e){t.uniform3iv(this.addr,e)}function Gw(t,e){t.uniform4iv(this.addr,e)}function Ww(t,e){t.uniform1uiv(this.addr,e)}function jw(t,e){t.uniform2uiv(this.addr,e)}function Xw(t,e){t.uniform3uiv(this.addr,e)}function $w(t,e){t.uniform4uiv(this.addr,e)}function Yw(t,e,n){const i=this.cache,r=e.length,s=Ec(n,r);Pt(i,s)||(t.uniform1iv(this.addr,s),Lt(i,s));for(let a=0;a!==r;++a)n.setTexture2D(e[a]||s_,s[a])}function qw(t,e,n){const i=this.cache,r=e.length,s=Ec(n,r);Pt(i,s)||(t.uniform1iv(this.addr,s),Lt(i,s));for(let a=0;a!==r;++a)n.setTexture3D(e[a]||o_,s[a])}function Kw(t,e,n){const i=this.cache,r=e.length,s=Ec(n,r);Pt(i,s)||(t.uniform1iv(this.addr,s),Lt(i,s));for(let a=0;a!==r;++a)n.setTextureCube(e[a]||l_,s[a])}function Zw(t,e,n){const i=this.cache,r=e.length,s=Ec(n,r);Pt(i,s)||(t.uniform1iv(this.addr,s),Lt(i,s));for(let a=0;a!==r;++a)n.setTexture2DArray(e[a]||a_,s[a])}function Qw(t){switch(t){case 5126:return Nw;case 35664:return Iw;case 35665:return Uw;case 35666:return kw;case 35674:return Fw;case 35675:return Ow;case 35676:return zw;case 5124:case 35670:return Bw;case 35667:case 35671:return Hw;case 35668:case 35672:return Vw;case 35669:case 35673:return Gw;case 5125:return Ww;case 36294:return jw;case 36295:return Xw;case 36296:return $w;case 35678:case 36198:case 36298:case 36306:case 35682:return Yw;case 35679:case 36299:case 36307:return qw;case 35680:case 36300:case 36308:case 36293:return Kw;case 36289:case 36303:case 36311:case 36292:return Zw}}class Jw{constructor(e,n,i){this.id=e,this.addr=i,this.cache=[],this.type=n.type,this.setValue=Dw(n.type)}}class eT{constructor(e,n,i){this.id=e,this.addr=i,this.cache=[],this.type=n.type,this.size=n.size,this.setValue=Qw(n.type)}}class tT{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,n,i){const r=this.seq;for(let s=0,a=r.length;s!==a;++s){const o=r[s];o.setValue(e,n[o.id],i)}}}const Nu=/(\w+)(\])?(\[|\.)?/g;function Fm(t,e){t.seq.push(e),t.map[e.id]=e}function nT(t,e,n){const i=t.name,r=i.length;for(Nu.lastIndex=0;;){const s=Nu.exec(i),a=Nu.lastIndex;let o=s[1];const l=s[2]==="]",c=s[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===r){Fm(n,c===void 0?new Jw(o,t,e):new eT(o,t,e));break}else{let h=n.map[o];h===void 0&&(h=new tT(o),Fm(n,h)),n=h}}}class Sl{constructor(e,n){this.seq=[],this.map={};const i=e.getProgramParameter(n,e.ACTIVE_UNIFORMS);for(let r=0;r<i;++r){const s=e.getActiveUniform(n,r),a=e.getUniformLocation(n,s.name);nT(s,a,this)}}setValue(e,n,i,r){const s=this.map[n];s!==void 0&&s.setValue(e,i,r)}setOptional(e,n,i){const r=n[i];r!==void 0&&this.setValue(e,i,r)}static upload(e,n,i,r){for(let s=0,a=n.length;s!==a;++s){const o=n[s],l=i[o.id];l.needsUpdate!==!1&&o.setValue(e,l.value,r)}}static seqWithValue(e,n){const i=[];for(let r=0,s=e.length;r!==s;++r){const a=e[r];a.id in n&&i.push(a)}return i}}function Om(t,e,n){const i=t.createShader(e);return t.shaderSource(i,n),t.compileShader(i),i}const iT=37297;let rT=0;function sT(t,e){const n=t.split(`
`),i=[],r=Math.max(e-6,0),s=Math.min(e+6,n.length);for(let a=r;a<s;a++){const o=a+1;i.push(`${o===e?">":" "} ${o}: ${n[a]}`)}return i.join(`
`)}function aT(t){const e=Qe.getPrimaries(Qe.workingColorSpace),n=Qe.getPrimaries(t);let i;switch(e===n?i="":e===Zl&&n===Kl?i="LinearDisplayP3ToLinearSRGB":e===Kl&&n===Zl&&(i="LinearSRGBToLinearDisplayP3"),t){case fr:case Sc:return[i,"LinearTransferOETF"];case yn:case bf:return[i,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space:",t),[i,"LinearTransferOETF"]}}function zm(t,e,n){const i=t.getShaderParameter(e,t.COMPILE_STATUS),r=t.getShaderInfoLog(e).trim();if(i&&r==="")return"";const s=/ERROR: 0:(\d+)/.exec(r);if(s){const a=parseInt(s[1]);return n.toUpperCase()+`

`+r+`

`+sT(t.getShaderSource(e),a)}else return r}function oT(t,e){const n=aT(e);return`vec4 ${t}( vec4 value ) { return ${n[0]}( ${n[1]}( value ) ); }`}function lT(t,e){let n;switch(e){case ES:n="Linear";break;case wS:n="Reinhard";break;case TS:n="Cineon";break;case AS:n="ACESFilmic";break;case RS:n="AgX";break;case bS:n="Neutral";break;case CS:n="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),n="Linear"}return"vec3 "+t+"( vec3 color ) { return "+n+"ToneMapping( color ); }"}const qo=new N;function cT(){Qe.getLuminanceCoefficients(qo);const t=qo.x.toFixed(4),e=qo.y.toFixed(4),n=qo.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${t}, ${e}, ${n} );`,"	return dot( weights, rgb );","}"].join(`
`)}function uT(t){return[t.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",t.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Ta).join(`
`)}function dT(t){const e=[];for(const n in t){const i=t[n];i!==!1&&e.push("#define "+n+" "+i)}return e.join(`
`)}function hT(t,e){const n={},i=t.getProgramParameter(e,t.ACTIVE_ATTRIBUTES);for(let r=0;r<i;r++){const s=t.getActiveAttrib(e,r),a=s.name;let o=1;s.type===t.FLOAT_MAT2&&(o=2),s.type===t.FLOAT_MAT3&&(o=3),s.type===t.FLOAT_MAT4&&(o=4),n[a]={type:s.type,location:t.getAttribLocation(e,a),locationSize:o}}return n}function Ta(t){return t!==""}function Bm(t,e){const n=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return t.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Hm(t,e){return t.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const fT=/^[ \t]*#include +<([\w\d./]+)>/gm;function xh(t){return t.replace(fT,mT)}const pT=new Map;function mT(t,e){let n=Ue[e];if(n===void 0){const i=pT.get(e);if(i!==void 0)n=Ue[i],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("Can not resolve #include <"+e+">")}return xh(n)}const gT=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Vm(t){return t.replace(gT,vT)}function vT(t,e,n,i){let r="";for(let s=parseInt(e);s<parseInt(n);s++)r+=i.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return r}function Gm(t){let e=`precision ${t.precision} float;
	precision ${t.precision} int;
	precision ${t.precision} sampler2D;
	precision ${t.precision} samplerCube;
	precision ${t.precision} sampler3D;
	precision ${t.precision} sampler2DArray;
	precision ${t.precision} sampler2DShadow;
	precision ${t.precision} samplerCubeShadow;
	precision ${t.precision} sampler2DArrayShadow;
	precision ${t.precision} isampler2D;
	precision ${t.precision} isampler3D;
	precision ${t.precision} isamplerCube;
	precision ${t.precision} isampler2DArray;
	precision ${t.precision} usampler2D;
	precision ${t.precision} usampler3D;
	precision ${t.precision} usamplerCube;
	precision ${t.precision} usampler2DArray;
	`;return t.precision==="highp"?e+=`
#define HIGH_PRECISION`:t.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:t.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function _T(t){let e="SHADOWMAP_TYPE_BASIC";return t.shadowMapType===Uv?e="SHADOWMAP_TYPE_PCF":t.shadowMapType===nS?e="SHADOWMAP_TYPE_PCF_SOFT":t.shadowMapType===fi&&(e="SHADOWMAP_TYPE_VSM"),e}function xT(t){let e="ENVMAP_TYPE_CUBE";if(t.envMap)switch(t.envMapMode){case Xs:case $s:e="ENVMAP_TYPE_CUBE";break;case yc:e="ENVMAP_TYPE_CUBE_UV";break}return e}function yT(t){let e="ENVMAP_MODE_REFLECTION";if(t.envMap)switch(t.envMapMode){case $s:e="ENVMAP_MODE_REFRACTION";break}return e}function ST(t){let e="ENVMAP_BLENDING_NONE";if(t.envMap)switch(t.combine){case yf:e="ENVMAP_BLENDING_MULTIPLY";break;case SS:e="ENVMAP_BLENDING_MIX";break;case MS:e="ENVMAP_BLENDING_ADD";break}return e}function MT(t){const e=t.envMapCubeUVHeight;if(e===null)return null;const n=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,n),7*16)),texelHeight:i,maxMip:n}}function ET(t,e,n,i){const r=t.getContext(),s=n.defines;let a=n.vertexShader,o=n.fragmentShader;const l=_T(n),c=xT(n),u=yT(n),h=ST(n),f=MT(n),p=uT(n),_=dT(s),y=r.createProgram();let m,d,g=n.glslVersion?"#version "+n.glslVersion+`
`:"";n.isRawShaderMaterial?(m=["#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,_].filter(Ta).join(`
`),m.length>0&&(m+=`
`),d=["#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,_].filter(Ta).join(`
`),d.length>0&&(d+=`
`)):(m=[Gm(n),"#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,_,n.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",n.batching?"#define USE_BATCHING":"",n.batchingColor?"#define USE_BATCHING_COLOR":"",n.instancing?"#define USE_INSTANCING":"",n.instancingColor?"#define USE_INSTANCING_COLOR":"",n.instancingMorph?"#define USE_INSTANCING_MORPH":"",n.useFog&&n.fog?"#define USE_FOG":"",n.useFog&&n.fogExp2?"#define FOG_EXP2":"",n.map?"#define USE_MAP":"",n.envMap?"#define USE_ENVMAP":"",n.envMap?"#define "+u:"",n.lightMap?"#define USE_LIGHTMAP":"",n.aoMap?"#define USE_AOMAP":"",n.bumpMap?"#define USE_BUMPMAP":"",n.normalMap?"#define USE_NORMALMAP":"",n.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",n.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",n.displacementMap?"#define USE_DISPLACEMENTMAP":"",n.emissiveMap?"#define USE_EMISSIVEMAP":"",n.anisotropy?"#define USE_ANISOTROPY":"",n.anisotropyMap?"#define USE_ANISOTROPYMAP":"",n.clearcoatMap?"#define USE_CLEARCOATMAP":"",n.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",n.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",n.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",n.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",n.specularMap?"#define USE_SPECULARMAP":"",n.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",n.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",n.roughnessMap?"#define USE_ROUGHNESSMAP":"",n.metalnessMap?"#define USE_METALNESSMAP":"",n.alphaMap?"#define USE_ALPHAMAP":"",n.alphaHash?"#define USE_ALPHAHASH":"",n.transmission?"#define USE_TRANSMISSION":"",n.transmissionMap?"#define USE_TRANSMISSIONMAP":"",n.thicknessMap?"#define USE_THICKNESSMAP":"",n.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",n.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",n.mapUv?"#define MAP_UV "+n.mapUv:"",n.alphaMapUv?"#define ALPHAMAP_UV "+n.alphaMapUv:"",n.lightMapUv?"#define LIGHTMAP_UV "+n.lightMapUv:"",n.aoMapUv?"#define AOMAP_UV "+n.aoMapUv:"",n.emissiveMapUv?"#define EMISSIVEMAP_UV "+n.emissiveMapUv:"",n.bumpMapUv?"#define BUMPMAP_UV "+n.bumpMapUv:"",n.normalMapUv?"#define NORMALMAP_UV "+n.normalMapUv:"",n.displacementMapUv?"#define DISPLACEMENTMAP_UV "+n.displacementMapUv:"",n.metalnessMapUv?"#define METALNESSMAP_UV "+n.metalnessMapUv:"",n.roughnessMapUv?"#define ROUGHNESSMAP_UV "+n.roughnessMapUv:"",n.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+n.anisotropyMapUv:"",n.clearcoatMapUv?"#define CLEARCOATMAP_UV "+n.clearcoatMapUv:"",n.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+n.clearcoatNormalMapUv:"",n.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+n.clearcoatRoughnessMapUv:"",n.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+n.iridescenceMapUv:"",n.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+n.iridescenceThicknessMapUv:"",n.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+n.sheenColorMapUv:"",n.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+n.sheenRoughnessMapUv:"",n.specularMapUv?"#define SPECULARMAP_UV "+n.specularMapUv:"",n.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+n.specularColorMapUv:"",n.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+n.specularIntensityMapUv:"",n.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+n.transmissionMapUv:"",n.thicknessMapUv?"#define THICKNESSMAP_UV "+n.thicknessMapUv:"",n.vertexTangents&&n.flatShading===!1?"#define USE_TANGENT":"",n.vertexColors?"#define USE_COLOR":"",n.vertexAlphas?"#define USE_COLOR_ALPHA":"",n.vertexUv1s?"#define USE_UV1":"",n.vertexUv2s?"#define USE_UV2":"",n.vertexUv3s?"#define USE_UV3":"",n.pointsUvs?"#define USE_POINTS_UV":"",n.flatShading?"#define FLAT_SHADED":"",n.skinning?"#define USE_SKINNING":"",n.morphTargets?"#define USE_MORPHTARGETS":"",n.morphNormals&&n.flatShading===!1?"#define USE_MORPHNORMALS":"",n.morphColors?"#define USE_MORPHCOLORS":"",n.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+n.morphTextureStride:"",n.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+n.morphTargetsCount:"",n.doubleSided?"#define DOUBLE_SIDED":"",n.flipSided?"#define FLIP_SIDED":"",n.shadowMapEnabled?"#define USE_SHADOWMAP":"",n.shadowMapEnabled?"#define "+l:"",n.sizeAttenuation?"#define USE_SIZEATTENUATION":"",n.numLightProbes>0?"#define USE_LIGHT_PROBES":"",n.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",n.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Ta).join(`
`),d=[Gm(n),"#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,_,n.useFog&&n.fog?"#define USE_FOG":"",n.useFog&&n.fogExp2?"#define FOG_EXP2":"",n.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",n.map?"#define USE_MAP":"",n.matcap?"#define USE_MATCAP":"",n.envMap?"#define USE_ENVMAP":"",n.envMap?"#define "+c:"",n.envMap?"#define "+u:"",n.envMap?"#define "+h:"",f?"#define CUBEUV_TEXEL_WIDTH "+f.texelWidth:"",f?"#define CUBEUV_TEXEL_HEIGHT "+f.texelHeight:"",f?"#define CUBEUV_MAX_MIP "+f.maxMip+".0":"",n.lightMap?"#define USE_LIGHTMAP":"",n.aoMap?"#define USE_AOMAP":"",n.bumpMap?"#define USE_BUMPMAP":"",n.normalMap?"#define USE_NORMALMAP":"",n.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",n.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",n.emissiveMap?"#define USE_EMISSIVEMAP":"",n.anisotropy?"#define USE_ANISOTROPY":"",n.anisotropyMap?"#define USE_ANISOTROPYMAP":"",n.clearcoat?"#define USE_CLEARCOAT":"",n.clearcoatMap?"#define USE_CLEARCOATMAP":"",n.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",n.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",n.dispersion?"#define USE_DISPERSION":"",n.iridescence?"#define USE_IRIDESCENCE":"",n.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",n.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",n.specularMap?"#define USE_SPECULARMAP":"",n.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",n.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",n.roughnessMap?"#define USE_ROUGHNESSMAP":"",n.metalnessMap?"#define USE_METALNESSMAP":"",n.alphaMap?"#define USE_ALPHAMAP":"",n.alphaTest?"#define USE_ALPHATEST":"",n.alphaHash?"#define USE_ALPHAHASH":"",n.sheen?"#define USE_SHEEN":"",n.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",n.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",n.transmission?"#define USE_TRANSMISSION":"",n.transmissionMap?"#define USE_TRANSMISSIONMAP":"",n.thicknessMap?"#define USE_THICKNESSMAP":"",n.vertexTangents&&n.flatShading===!1?"#define USE_TANGENT":"",n.vertexColors||n.instancingColor||n.batchingColor?"#define USE_COLOR":"",n.vertexAlphas?"#define USE_COLOR_ALPHA":"",n.vertexUv1s?"#define USE_UV1":"",n.vertexUv2s?"#define USE_UV2":"",n.vertexUv3s?"#define USE_UV3":"",n.pointsUvs?"#define USE_POINTS_UV":"",n.gradientMap?"#define USE_GRADIENTMAP":"",n.flatShading?"#define FLAT_SHADED":"",n.doubleSided?"#define DOUBLE_SIDED":"",n.flipSided?"#define FLIP_SIDED":"",n.shadowMapEnabled?"#define USE_SHADOWMAP":"",n.shadowMapEnabled?"#define "+l:"",n.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",n.numLightProbes>0?"#define USE_LIGHT_PROBES":"",n.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",n.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",n.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",n.toneMapping!==ar?"#define TONE_MAPPING":"",n.toneMapping!==ar?Ue.tonemapping_pars_fragment:"",n.toneMapping!==ar?lT("toneMapping",n.toneMapping):"",n.dithering?"#define DITHERING":"",n.opaque?"#define OPAQUE":"",Ue.colorspace_pars_fragment,oT("linearToOutputTexel",n.outputColorSpace),cT(),n.useDepthPacking?"#define DEPTH_PACKING "+n.depthPacking:"",`
`].filter(Ta).join(`
`)),a=xh(a),a=Bm(a,n),a=Hm(a,n),o=xh(o),o=Bm(o,n),o=Hm(o,n),a=Vm(a),o=Vm(o),n.isRawShaderMaterial!==!0&&(g=`#version 300 es
`,m=[p,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,d=["#define varying in",n.glslVersion===am?"":"layout(location = 0) out highp vec4 pc_fragColor;",n.glslVersion===am?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+d);const v=g+m+a,S=g+d+o,b=Om(r,r.VERTEX_SHADER,v),C=Om(r,r.FRAGMENT_SHADER,S);r.attachShader(y,b),r.attachShader(y,C),n.index0AttributeName!==void 0?r.bindAttribLocation(y,0,n.index0AttributeName):n.morphTargets===!0&&r.bindAttribLocation(y,0,"position"),r.linkProgram(y);function A(w){if(t.debug.checkShaderErrors){const O=r.getProgramInfoLog(y).trim(),F=r.getShaderInfoLog(b).trim(),W=r.getShaderInfoLog(C).trim();let q=!0,z=!0;if(r.getProgramParameter(y,r.LINK_STATUS)===!1)if(q=!1,typeof t.debug.onShaderError=="function")t.debug.onShaderError(r,y,b,C);else{const J=zm(r,b,"vertex"),L=zm(r,C,"fragment");console.error("THREE.WebGLProgram: Shader Error "+r.getError()+" - VALIDATE_STATUS "+r.getProgramParameter(y,r.VALIDATE_STATUS)+`

Material Name: `+w.name+`
Material Type: `+w.type+`

Program Info Log: `+O+`
`+J+`
`+L)}else O!==""?console.warn("THREE.WebGLProgram: Program Info Log:",O):(F===""||W==="")&&(z=!1);z&&(w.diagnostics={runnable:q,programLog:O,vertexShader:{log:F,prefix:m},fragmentShader:{log:W,prefix:d}})}r.deleteShader(b),r.deleteShader(C),P=new Sl(r,y),V=hT(r,y)}let P;this.getUniforms=function(){return P===void 0&&A(this),P};let V;this.getAttributes=function(){return V===void 0&&A(this),V};let x=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return x===!1&&(x=r.getProgramParameter(y,iT)),x},this.destroy=function(){i.releaseStatesOfProgram(this),r.deleteProgram(y),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=rT++,this.cacheKey=e,this.usedTimes=1,this.program=y,this.vertexShader=b,this.fragmentShader=C,this}let wT=0;class TT{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const n=e.vertexShader,i=e.fragmentShader,r=this._getShaderStage(n),s=this._getShaderStage(i),a=this._getShaderCacheForMaterial(e);return a.has(r)===!1&&(a.add(r),r.usedTimes++),a.has(s)===!1&&(a.add(s),s.usedTimes++),this}remove(e){const n=this.materialCache.get(e);for(const i of n)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const n=this.materialCache;let i=n.get(e);return i===void 0&&(i=new Set,n.set(e,i)),i}_getShaderStage(e){const n=this.shaderCache;let i=n.get(e);return i===void 0&&(i=new AT(e),n.set(e,i)),i}}class AT{constructor(e){this.id=wT++,this.code=e,this.usedTimes=0}}function CT(t,e,n,i,r,s,a){const o=new Pf,l=new TT,c=new Set,u=[],h=r.logarithmicDepthBuffer,f=r.reverseDepthBuffer,p=r.vertexTextures;let _=r.precision;const y={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function m(x){return c.add(x),x===0?"uv":`uv${x}`}function d(x,w,O,F,W){const q=F.fog,z=W.geometry,J=x.isMeshStandardMaterial?F.environment:null,L=(x.isMeshStandardMaterial?n:e).get(x.envMap||J),Y=L&&L.mapping===yc?L.image.height:null,$=y[x.type];x.precision!==null&&(_=r.getMaxPrecision(x.precision),_!==x.precision&&console.warn("THREE.WebGLProgram.getParameters:",x.precision,"not supported, using",_,"instead."));const ne=z.morphAttributes.position||z.morphAttributes.normal||z.morphAttributes.color,ye=ne!==void 0?ne.length:0;let Ie=0;z.morphAttributes.position!==void 0&&(Ie=1),z.morphAttributes.normal!==void 0&&(Ie=2),z.morphAttributes.color!==void 0&&(Ie=3);let j,ie,he,ce;if($){const rn=ei[$];j=rn.vertexShader,ie=rn.fragmentShader}else j=x.vertexShader,ie=x.fragmentShader,l.update(x),he=l.getVertexShaderID(x),ce=l.getFragmentShaderID(x);const De=t.getRenderTarget(),Ae=W.isInstancedMesh===!0,Ve=W.isBatchedMesh===!0,nt=!!x.map,Ge=!!x.matcap,D=!!L,pn=!!x.aoMap,Be=!!x.lightMap,$e=!!x.bumpMap,Re=!!x.normalMap,ot=!!x.displacementMap,Le=!!x.emissiveMap,R=!!x.metalnessMap,E=!!x.roughnessMap,B=x.anisotropy>0,Z=x.clearcoat>0,ee=x.dispersion>0,K=x.iridescence>0,Me=x.sheen>0,le=x.transmission>0,ge=B&&!!x.anisotropyMap,Ye=Z&&!!x.clearcoatMap,se=Z&&!!x.clearcoatNormalMap,ve=Z&&!!x.clearcoatRoughnessMap,be=K&&!!x.iridescenceMap,Pe=K&&!!x.iridescenceThicknessMap,_e=Me&&!!x.sheenColorMap,He=Me&&!!x.sheenRoughnessMap,Ne=!!x.specularMap,st=!!x.specularColorMap,I=!!x.specularIntensityMap,fe=le&&!!x.transmissionMap,X=le&&!!x.thicknessMap,Q=!!x.gradientMap,ue=!!x.alphaMap,pe=x.alphaTest>0,We=!!x.alphaHash,Mt=!!x.extensions;let nn=ar;x.toneMapped&&(De===null||De.isXRRenderTarget===!0)&&(nn=t.toneMapping);const qe={shaderID:$,shaderType:x.type,shaderName:x.name,vertexShader:j,fragmentShader:ie,defines:x.defines,customVertexShaderID:he,customFragmentShaderID:ce,isRawShaderMaterial:x.isRawShaderMaterial===!0,glslVersion:x.glslVersion,precision:_,batching:Ve,batchingColor:Ve&&W._colorsTexture!==null,instancing:Ae,instancingColor:Ae&&W.instanceColor!==null,instancingMorph:Ae&&W.morphTexture!==null,supportsVertexTextures:p,outputColorSpace:De===null?t.outputColorSpace:De.isXRRenderTarget===!0?De.texture.colorSpace:fr,alphaToCoverage:!!x.alphaToCoverage,map:nt,matcap:Ge,envMap:D,envMapMode:D&&L.mapping,envMapCubeUVHeight:Y,aoMap:pn,lightMap:Be,bumpMap:$e,normalMap:Re,displacementMap:p&&ot,emissiveMap:Le,normalMapObjectSpace:Re&&x.normalMapType===NS,normalMapTangentSpace:Re&&x.normalMapType===Rf,metalnessMap:R,roughnessMap:E,anisotropy:B,anisotropyMap:ge,clearcoat:Z,clearcoatMap:Ye,clearcoatNormalMap:se,clearcoatRoughnessMap:ve,dispersion:ee,iridescence:K,iridescenceMap:be,iridescenceThicknessMap:Pe,sheen:Me,sheenColorMap:_e,sheenRoughnessMap:He,specularMap:Ne,specularColorMap:st,specularIntensityMap:I,transmission:le,transmissionMap:fe,thicknessMap:X,gradientMap:Q,opaque:x.transparent===!1&&x.blending===Is&&x.alphaToCoverage===!1,alphaMap:ue,alphaTest:pe,alphaHash:We,combine:x.combine,mapUv:nt&&m(x.map.channel),aoMapUv:pn&&m(x.aoMap.channel),lightMapUv:Be&&m(x.lightMap.channel),bumpMapUv:$e&&m(x.bumpMap.channel),normalMapUv:Re&&m(x.normalMap.channel),displacementMapUv:ot&&m(x.displacementMap.channel),emissiveMapUv:Le&&m(x.emissiveMap.channel),metalnessMapUv:R&&m(x.metalnessMap.channel),roughnessMapUv:E&&m(x.roughnessMap.channel),anisotropyMapUv:ge&&m(x.anisotropyMap.channel),clearcoatMapUv:Ye&&m(x.clearcoatMap.channel),clearcoatNormalMapUv:se&&m(x.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:ve&&m(x.clearcoatRoughnessMap.channel),iridescenceMapUv:be&&m(x.iridescenceMap.channel),iridescenceThicknessMapUv:Pe&&m(x.iridescenceThicknessMap.channel),sheenColorMapUv:_e&&m(x.sheenColorMap.channel),sheenRoughnessMapUv:He&&m(x.sheenRoughnessMap.channel),specularMapUv:Ne&&m(x.specularMap.channel),specularColorMapUv:st&&m(x.specularColorMap.channel),specularIntensityMapUv:I&&m(x.specularIntensityMap.channel),transmissionMapUv:fe&&m(x.transmissionMap.channel),thicknessMapUv:X&&m(x.thicknessMap.channel),alphaMapUv:ue&&m(x.alphaMap.channel),vertexTangents:!!z.attributes.tangent&&(Re||B),vertexColors:x.vertexColors,vertexAlphas:x.vertexColors===!0&&!!z.attributes.color&&z.attributes.color.itemSize===4,pointsUvs:W.isPoints===!0&&!!z.attributes.uv&&(nt||ue),fog:!!q,useFog:x.fog===!0,fogExp2:!!q&&q.isFogExp2,flatShading:x.flatShading===!0,sizeAttenuation:x.sizeAttenuation===!0,logarithmicDepthBuffer:h,reverseDepthBuffer:f,skinning:W.isSkinnedMesh===!0,morphTargets:z.morphAttributes.position!==void 0,morphNormals:z.morphAttributes.normal!==void 0,morphColors:z.morphAttributes.color!==void 0,morphTargetsCount:ye,morphTextureStride:Ie,numDirLights:w.directional.length,numPointLights:w.point.length,numSpotLights:w.spot.length,numSpotLightMaps:w.spotLightMap.length,numRectAreaLights:w.rectArea.length,numHemiLights:w.hemi.length,numDirLightShadows:w.directionalShadowMap.length,numPointLightShadows:w.pointShadowMap.length,numSpotLightShadows:w.spotShadowMap.length,numSpotLightShadowsWithMaps:w.numSpotLightShadowsWithMaps,numLightProbes:w.numLightProbes,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:x.dithering,shadowMapEnabled:t.shadowMap.enabled&&O.length>0,shadowMapType:t.shadowMap.type,toneMapping:nn,decodeVideoTexture:nt&&x.map.isVideoTexture===!0&&Qe.getTransfer(x.map.colorSpace)===ut,premultipliedAlpha:x.premultipliedAlpha,doubleSided:x.side===ln,flipSided:x.side===Qt,useDepthPacking:x.depthPacking>=0,depthPacking:x.depthPacking||0,index0AttributeName:x.index0AttributeName,extensionClipCullDistance:Mt&&x.extensions.clipCullDistance===!0&&i.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Mt&&x.extensions.multiDraw===!0||Ve)&&i.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:x.customProgramCacheKey()};return qe.vertexUv1s=c.has(1),qe.vertexUv2s=c.has(2),qe.vertexUv3s=c.has(3),c.clear(),qe}function g(x){const w=[];if(x.shaderID?w.push(x.shaderID):(w.push(x.customVertexShaderID),w.push(x.customFragmentShaderID)),x.defines!==void 0)for(const O in x.defines)w.push(O),w.push(x.defines[O]);return x.isRawShaderMaterial===!1&&(v(w,x),S(w,x),w.push(t.outputColorSpace)),w.push(x.customProgramCacheKey),w.join()}function v(x,w){x.push(w.precision),x.push(w.outputColorSpace),x.push(w.envMapMode),x.push(w.envMapCubeUVHeight),x.push(w.mapUv),x.push(w.alphaMapUv),x.push(w.lightMapUv),x.push(w.aoMapUv),x.push(w.bumpMapUv),x.push(w.normalMapUv),x.push(w.displacementMapUv),x.push(w.emissiveMapUv),x.push(w.metalnessMapUv),x.push(w.roughnessMapUv),x.push(w.anisotropyMapUv),x.push(w.clearcoatMapUv),x.push(w.clearcoatNormalMapUv),x.push(w.clearcoatRoughnessMapUv),x.push(w.iridescenceMapUv),x.push(w.iridescenceThicknessMapUv),x.push(w.sheenColorMapUv),x.push(w.sheenRoughnessMapUv),x.push(w.specularMapUv),x.push(w.specularColorMapUv),x.push(w.specularIntensityMapUv),x.push(w.transmissionMapUv),x.push(w.thicknessMapUv),x.push(w.combine),x.push(w.fogExp2),x.push(w.sizeAttenuation),x.push(w.morphTargetsCount),x.push(w.morphAttributeCount),x.push(w.numDirLights),x.push(w.numPointLights),x.push(w.numSpotLights),x.push(w.numSpotLightMaps),x.push(w.numHemiLights),x.push(w.numRectAreaLights),x.push(w.numDirLightShadows),x.push(w.numPointLightShadows),x.push(w.numSpotLightShadows),x.push(w.numSpotLightShadowsWithMaps),x.push(w.numLightProbes),x.push(w.shadowMapType),x.push(w.toneMapping),x.push(w.numClippingPlanes),x.push(w.numClipIntersection),x.push(w.depthPacking)}function S(x,w){o.disableAll(),w.supportsVertexTextures&&o.enable(0),w.instancing&&o.enable(1),w.instancingColor&&o.enable(2),w.instancingMorph&&o.enable(3),w.matcap&&o.enable(4),w.envMap&&o.enable(5),w.normalMapObjectSpace&&o.enable(6),w.normalMapTangentSpace&&o.enable(7),w.clearcoat&&o.enable(8),w.iridescence&&o.enable(9),w.alphaTest&&o.enable(10),w.vertexColors&&o.enable(11),w.vertexAlphas&&o.enable(12),w.vertexUv1s&&o.enable(13),w.vertexUv2s&&o.enable(14),w.vertexUv3s&&o.enable(15),w.vertexTangents&&o.enable(16),w.anisotropy&&o.enable(17),w.alphaHash&&o.enable(18),w.batching&&o.enable(19),w.dispersion&&o.enable(20),w.batchingColor&&o.enable(21),x.push(o.mask),o.disableAll(),w.fog&&o.enable(0),w.useFog&&o.enable(1),w.flatShading&&o.enable(2),w.logarithmicDepthBuffer&&o.enable(3),w.reverseDepthBuffer&&o.enable(4),w.skinning&&o.enable(5),w.morphTargets&&o.enable(6),w.morphNormals&&o.enable(7),w.morphColors&&o.enable(8),w.premultipliedAlpha&&o.enable(9),w.shadowMapEnabled&&o.enable(10),w.doubleSided&&o.enable(11),w.flipSided&&o.enable(12),w.useDepthPacking&&o.enable(13),w.dithering&&o.enable(14),w.transmission&&o.enable(15),w.sheen&&o.enable(16),w.opaque&&o.enable(17),w.pointsUvs&&o.enable(18),w.decodeVideoTexture&&o.enable(19),w.alphaToCoverage&&o.enable(20),x.push(o.mask)}function b(x){const w=y[x.type];let O;if(w){const F=ei[w];O=uM.clone(F.uniforms)}else O=x.uniforms;return O}function C(x,w){let O;for(let F=0,W=u.length;F<W;F++){const q=u[F];if(q.cacheKey===w){O=q,++O.usedTimes;break}}return O===void 0&&(O=new ET(t,w,x,s),u.push(O)),O}function A(x){if(--x.usedTimes===0){const w=u.indexOf(x);u[w]=u[u.length-1],u.pop(),x.destroy()}}function P(x){l.remove(x)}function V(){l.dispose()}return{getParameters:d,getProgramCacheKey:g,getUniforms:b,acquireProgram:C,releaseProgram:A,releaseShaderCache:P,programs:u,dispose:V}}function RT(){let t=new WeakMap;function e(a){return t.has(a)}function n(a){let o=t.get(a);return o===void 0&&(o={},t.set(a,o)),o}function i(a){t.delete(a)}function r(a,o,l){t.get(a)[o]=l}function s(){t=new WeakMap}return{has:e,get:n,remove:i,update:r,dispose:s}}function bT(t,e){return t.groupOrder!==e.groupOrder?t.groupOrder-e.groupOrder:t.renderOrder!==e.renderOrder?t.renderOrder-e.renderOrder:t.material.id!==e.material.id?t.material.id-e.material.id:t.z!==e.z?t.z-e.z:t.id-e.id}function Wm(t,e){return t.groupOrder!==e.groupOrder?t.groupOrder-e.groupOrder:t.renderOrder!==e.renderOrder?t.renderOrder-e.renderOrder:t.z!==e.z?e.z-t.z:t.id-e.id}function jm(){const t=[];let e=0;const n=[],i=[],r=[];function s(){e=0,n.length=0,i.length=0,r.length=0}function a(h,f,p,_,y,m){let d=t[e];return d===void 0?(d={id:h.id,object:h,geometry:f,material:p,groupOrder:_,renderOrder:h.renderOrder,z:y,group:m},t[e]=d):(d.id=h.id,d.object=h,d.geometry=f,d.material=p,d.groupOrder=_,d.renderOrder=h.renderOrder,d.z=y,d.group=m),e++,d}function o(h,f,p,_,y,m){const d=a(h,f,p,_,y,m);p.transmission>0?i.push(d):p.transparent===!0?r.push(d):n.push(d)}function l(h,f,p,_,y,m){const d=a(h,f,p,_,y,m);p.transmission>0?i.unshift(d):p.transparent===!0?r.unshift(d):n.unshift(d)}function c(h,f){n.length>1&&n.sort(h||bT),i.length>1&&i.sort(f||Wm),r.length>1&&r.sort(f||Wm)}function u(){for(let h=e,f=t.length;h<f;h++){const p=t[h];if(p.id===null)break;p.id=null,p.object=null,p.geometry=null,p.material=null,p.group=null}}return{opaque:n,transmissive:i,transparent:r,init:s,push:o,unshift:l,finish:u,sort:c}}function PT(){let t=new WeakMap;function e(i,r){const s=t.get(i);let a;return s===void 0?(a=new jm,t.set(i,[a])):r>=s.length?(a=new jm,s.push(a)):a=s[r],a}function n(){t=new WeakMap}return{get:e,dispose:n}}function LT(){const t={};return{get:function(e){if(t[e.id]!==void 0)return t[e.id];let n;switch(e.type){case"DirectionalLight":n={direction:new N,color:new Fe};break;case"SpotLight":n={position:new N,direction:new N,color:new Fe,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":n={position:new N,color:new Fe,distance:0,decay:0};break;case"HemisphereLight":n={direction:new N,skyColor:new Fe,groundColor:new Fe};break;case"RectAreaLight":n={color:new Fe,position:new N,halfWidth:new N,halfHeight:new N};break}return t[e.id]=n,n}}}function DT(){const t={};return{get:function(e){if(t[e.id]!==void 0)return t[e.id];let n;switch(e.type){case"DirectionalLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Oe};break;case"SpotLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Oe};break;case"PointLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Oe,shadowCameraNear:1,shadowCameraFar:1e3};break}return t[e.id]=n,n}}}let NT=0;function IT(t,e){return(e.castShadow?2:0)-(t.castShadow?2:0)+(e.map?1:0)-(t.map?1:0)}function UT(t){const e=new LT,n=DT(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)i.probe.push(new N);const r=new N,s=new Je,a=new Je;function o(c){let u=0,h=0,f=0;for(let V=0;V<9;V++)i.probe[V].set(0,0,0);let p=0,_=0,y=0,m=0,d=0,g=0,v=0,S=0,b=0,C=0,A=0;c.sort(IT);for(let V=0,x=c.length;V<x;V++){const w=c[V],O=w.color,F=w.intensity,W=w.distance,q=w.shadow&&w.shadow.map?w.shadow.map.texture:null;if(w.isAmbientLight)u+=O.r*F,h+=O.g*F,f+=O.b*F;else if(w.isLightProbe){for(let z=0;z<9;z++)i.probe[z].addScaledVector(w.sh.coefficients[z],F);A++}else if(w.isDirectionalLight){const z=e.get(w);if(z.color.copy(w.color).multiplyScalar(w.intensity),w.castShadow){const J=w.shadow,L=n.get(w);L.shadowIntensity=J.intensity,L.shadowBias=J.bias,L.shadowNormalBias=J.normalBias,L.shadowRadius=J.radius,L.shadowMapSize=J.mapSize,i.directionalShadow[p]=L,i.directionalShadowMap[p]=q,i.directionalShadowMatrix[p]=w.shadow.matrix,g++}i.directional[p]=z,p++}else if(w.isSpotLight){const z=e.get(w);z.position.setFromMatrixPosition(w.matrixWorld),z.color.copy(O).multiplyScalar(F),z.distance=W,z.coneCos=Math.cos(w.angle),z.penumbraCos=Math.cos(w.angle*(1-w.penumbra)),z.decay=w.decay,i.spot[y]=z;const J=w.shadow;if(w.map&&(i.spotLightMap[b]=w.map,b++,J.updateMatrices(w),w.castShadow&&C++),i.spotLightMatrix[y]=J.matrix,w.castShadow){const L=n.get(w);L.shadowIntensity=J.intensity,L.shadowBias=J.bias,L.shadowNormalBias=J.normalBias,L.shadowRadius=J.radius,L.shadowMapSize=J.mapSize,i.spotShadow[y]=L,i.spotShadowMap[y]=q,S++}y++}else if(w.isRectAreaLight){const z=e.get(w);z.color.copy(O).multiplyScalar(F),z.halfWidth.set(w.width*.5,0,0),z.halfHeight.set(0,w.height*.5,0),i.rectArea[m]=z,m++}else if(w.isPointLight){const z=e.get(w);if(z.color.copy(w.color).multiplyScalar(w.intensity),z.distance=w.distance,z.decay=w.decay,w.castShadow){const J=w.shadow,L=n.get(w);L.shadowIntensity=J.intensity,L.shadowBias=J.bias,L.shadowNormalBias=J.normalBias,L.shadowRadius=J.radius,L.shadowMapSize=J.mapSize,L.shadowCameraNear=J.camera.near,L.shadowCameraFar=J.camera.far,i.pointShadow[_]=L,i.pointShadowMap[_]=q,i.pointShadowMatrix[_]=w.shadow.matrix,v++}i.point[_]=z,_++}else if(w.isHemisphereLight){const z=e.get(w);z.skyColor.copy(w.color).multiplyScalar(F),z.groundColor.copy(w.groundColor).multiplyScalar(F),i.hemi[d]=z,d++}}m>0&&(t.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=oe.LTC_FLOAT_1,i.rectAreaLTC2=oe.LTC_FLOAT_2):(i.rectAreaLTC1=oe.LTC_HALF_1,i.rectAreaLTC2=oe.LTC_HALF_2)),i.ambient[0]=u,i.ambient[1]=h,i.ambient[2]=f;const P=i.hash;(P.directionalLength!==p||P.pointLength!==_||P.spotLength!==y||P.rectAreaLength!==m||P.hemiLength!==d||P.numDirectionalShadows!==g||P.numPointShadows!==v||P.numSpotShadows!==S||P.numSpotMaps!==b||P.numLightProbes!==A)&&(i.directional.length=p,i.spot.length=y,i.rectArea.length=m,i.point.length=_,i.hemi.length=d,i.directionalShadow.length=g,i.directionalShadowMap.length=g,i.pointShadow.length=v,i.pointShadowMap.length=v,i.spotShadow.length=S,i.spotShadowMap.length=S,i.directionalShadowMatrix.length=g,i.pointShadowMatrix.length=v,i.spotLightMatrix.length=S+b-C,i.spotLightMap.length=b,i.numSpotLightShadowsWithMaps=C,i.numLightProbes=A,P.directionalLength=p,P.pointLength=_,P.spotLength=y,P.rectAreaLength=m,P.hemiLength=d,P.numDirectionalShadows=g,P.numPointShadows=v,P.numSpotShadows=S,P.numSpotMaps=b,P.numLightProbes=A,i.version=NT++)}function l(c,u){let h=0,f=0,p=0,_=0,y=0;const m=u.matrixWorldInverse;for(let d=0,g=c.length;d<g;d++){const v=c[d];if(v.isDirectionalLight){const S=i.directional[h];S.direction.setFromMatrixPosition(v.matrixWorld),r.setFromMatrixPosition(v.target.matrixWorld),S.direction.sub(r),S.direction.transformDirection(m),h++}else if(v.isSpotLight){const S=i.spot[p];S.position.setFromMatrixPosition(v.matrixWorld),S.position.applyMatrix4(m),S.direction.setFromMatrixPosition(v.matrixWorld),r.setFromMatrixPosition(v.target.matrixWorld),S.direction.sub(r),S.direction.transformDirection(m),p++}else if(v.isRectAreaLight){const S=i.rectArea[_];S.position.setFromMatrixPosition(v.matrixWorld),S.position.applyMatrix4(m),a.identity(),s.copy(v.matrixWorld),s.premultiply(m),a.extractRotation(s),S.halfWidth.set(v.width*.5,0,0),S.halfHeight.set(0,v.height*.5,0),S.halfWidth.applyMatrix4(a),S.halfHeight.applyMatrix4(a),_++}else if(v.isPointLight){const S=i.point[f];S.position.setFromMatrixPosition(v.matrixWorld),S.position.applyMatrix4(m),f++}else if(v.isHemisphereLight){const S=i.hemi[y];S.direction.setFromMatrixPosition(v.matrixWorld),S.direction.transformDirection(m),y++}}}return{setup:o,setupView:l,state:i}}function Xm(t){const e=new UT(t),n=[],i=[];function r(u){c.camera=u,n.length=0,i.length=0}function s(u){n.push(u)}function a(u){i.push(u)}function o(){e.setup(n)}function l(u){e.setupView(n,u)}const c={lightsArray:n,shadowsArray:i,camera:null,lights:e,transmissionRenderTarget:{}};return{init:r,state:c,setupLights:o,setupLightsView:l,pushLight:s,pushShadow:a}}function kT(t){let e=new WeakMap;function n(r,s=0){const a=e.get(r);let o;return a===void 0?(o=new Xm(t),e.set(r,[o])):s>=a.length?(o=new Xm(t),a.push(o)):o=a[s],o}function i(){e=new WeakMap}return{get:n,dispose:i}}class FT extends pr{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=LS,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class OT extends pr{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}const zT=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,BT=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function HT(t,e,n){let i=new Lf;const r=new Oe,s=new Oe,a=new _t,o=new FT({depthPacking:DS}),l=new OT,c={},u=n.maxTextureSize,h={[cr]:Qt,[Qt]:cr,[ln]:ln},f=new Li({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Oe},radius:{value:4}},vertexShader:zT,fragmentShader:BT}),p=f.clone();p.defines.HORIZONTAL_PASS=1;const _=new Tt;_.setAttribute("position",new Bt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const y=new it(_,f),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Uv;let d=this.type;this.render=function(C,A,P){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||C.length===0)return;const V=t.getRenderTarget(),x=t.getActiveCubeFace(),w=t.getActiveMipmapLevel(),O=t.state;O.setBlending(sr),O.buffers.color.setClear(1,1,1,1),O.buffers.depth.setTest(!0),O.setScissorTest(!1);const F=d!==fi&&this.type===fi,W=d===fi&&this.type!==fi;for(let q=0,z=C.length;q<z;q++){const J=C[q],L=J.shadow;if(L===void 0){console.warn("THREE.WebGLShadowMap:",J,"has no shadow.");continue}if(L.autoUpdate===!1&&L.needsUpdate===!1)continue;r.copy(L.mapSize);const Y=L.getFrameExtents();if(r.multiply(Y),s.copy(L.mapSize),(r.x>u||r.y>u)&&(r.x>u&&(s.x=Math.floor(u/Y.x),r.x=s.x*Y.x,L.mapSize.x=s.x),r.y>u&&(s.y=Math.floor(u/Y.y),r.y=s.y*Y.y,L.mapSize.y=s.y)),L.map===null||F===!0||W===!0){const ne=this.type!==fi?{minFilter:un,magFilter:un}:{};L.map!==null&&L.map.dispose(),L.map=new Gr(r.x,r.y,ne),L.map.texture.name=J.name+".shadowMap",L.camera.updateProjectionMatrix()}t.setRenderTarget(L.map),t.clear();const $=L.getViewportCount();for(let ne=0;ne<$;ne++){const ye=L.getViewport(ne);a.set(s.x*ye.x,s.y*ye.y,s.x*ye.z,s.y*ye.w),O.viewport(a),L.updateMatrices(J,ne),i=L.getFrustum(),S(A,P,L.camera,J,this.type)}L.isPointLightShadow!==!0&&this.type===fi&&g(L,P),L.needsUpdate=!1}d=this.type,m.needsUpdate=!1,t.setRenderTarget(V,x,w)};function g(C,A){const P=e.update(y);f.defines.VSM_SAMPLES!==C.blurSamples&&(f.defines.VSM_SAMPLES=C.blurSamples,p.defines.VSM_SAMPLES=C.blurSamples,f.needsUpdate=!0,p.needsUpdate=!0),C.mapPass===null&&(C.mapPass=new Gr(r.x,r.y)),f.uniforms.shadow_pass.value=C.map.texture,f.uniforms.resolution.value=C.mapSize,f.uniforms.radius.value=C.radius,t.setRenderTarget(C.mapPass),t.clear(),t.renderBufferDirect(A,null,P,f,y,null),p.uniforms.shadow_pass.value=C.mapPass.texture,p.uniforms.resolution.value=C.mapSize,p.uniforms.radius.value=C.radius,t.setRenderTarget(C.map),t.clear(),t.renderBufferDirect(A,null,P,p,y,null)}function v(C,A,P,V){let x=null;const w=P.isPointLight===!0?C.customDistanceMaterial:C.customDepthMaterial;if(w!==void 0)x=w;else if(x=P.isPointLight===!0?l:o,t.localClippingEnabled&&A.clipShadows===!0&&Array.isArray(A.clippingPlanes)&&A.clippingPlanes.length!==0||A.displacementMap&&A.displacementScale!==0||A.alphaMap&&A.alphaTest>0||A.map&&A.alphaTest>0){const O=x.uuid,F=A.uuid;let W=c[O];W===void 0&&(W={},c[O]=W);let q=W[F];q===void 0&&(q=x.clone(),W[F]=q,A.addEventListener("dispose",b)),x=q}if(x.visible=A.visible,x.wireframe=A.wireframe,V===fi?x.side=A.shadowSide!==null?A.shadowSide:A.side:x.side=A.shadowSide!==null?A.shadowSide:h[A.side],x.alphaMap=A.alphaMap,x.alphaTest=A.alphaTest,x.map=A.map,x.clipShadows=A.clipShadows,x.clippingPlanes=A.clippingPlanes,x.clipIntersection=A.clipIntersection,x.displacementMap=A.displacementMap,x.displacementScale=A.displacementScale,x.displacementBias=A.displacementBias,x.wireframeLinewidth=A.wireframeLinewidth,x.linewidth=A.linewidth,P.isPointLight===!0&&x.isMeshDistanceMaterial===!0){const O=t.properties.get(x);O.light=P}return x}function S(C,A,P,V,x){if(C.visible===!1)return;if(C.layers.test(A.layers)&&(C.isMesh||C.isLine||C.isPoints)&&(C.castShadow||C.receiveShadow&&x===fi)&&(!C.frustumCulled||i.intersectsObject(C))){C.modelViewMatrix.multiplyMatrices(P.matrixWorldInverse,C.matrixWorld);const F=e.update(C),W=C.material;if(Array.isArray(W)){const q=F.groups;for(let z=0,J=q.length;z<J;z++){const L=q[z],Y=W[L.materialIndex];if(Y&&Y.visible){const $=v(C,Y,V,x);C.onBeforeShadow(t,C,A,P,F,$,L),t.renderBufferDirect(P,null,F,$,C,L),C.onAfterShadow(t,C,A,P,F,$,L)}}}else if(W.visible){const q=v(C,W,V,x);C.onBeforeShadow(t,C,A,P,F,q,null),t.renderBufferDirect(P,null,F,q,C,null),C.onAfterShadow(t,C,A,P,F,q,null)}}const O=C.children;for(let F=0,W=O.length;F<W;F++)S(O[F],A,P,V,x)}function b(C){C.target.removeEventListener("dispose",b);for(const P in c){const V=c[P],x=C.target.uuid;x in V&&(V[x].dispose(),delete V[x])}}}const VT={[kd]:Fd,[Od]:Hd,[zd]:Vd,[js]:Bd,[Fd]:kd,[Hd]:Od,[Vd]:zd,[Bd]:js};function GT(t){function e(){let I=!1;const fe=new _t;let X=null;const Q=new _t(0,0,0,0);return{setMask:function(ue){X!==ue&&!I&&(t.colorMask(ue,ue,ue,ue),X=ue)},setLocked:function(ue){I=ue},setClear:function(ue,pe,We,Mt,nn){nn===!0&&(ue*=Mt,pe*=Mt,We*=Mt),fe.set(ue,pe,We,Mt),Q.equals(fe)===!1&&(t.clearColor(ue,pe,We,Mt),Q.copy(fe))},reset:function(){I=!1,X=null,Q.set(-1,0,0,0)}}}function n(){let I=!1,fe=!1,X=null,Q=null,ue=null;return{setReversed:function(pe){fe=pe},setTest:function(pe){pe?he(t.DEPTH_TEST):ce(t.DEPTH_TEST)},setMask:function(pe){X!==pe&&!I&&(t.depthMask(pe),X=pe)},setFunc:function(pe){if(fe&&(pe=VT[pe]),Q!==pe){switch(pe){case kd:t.depthFunc(t.NEVER);break;case Fd:t.depthFunc(t.ALWAYS);break;case Od:t.depthFunc(t.LESS);break;case js:t.depthFunc(t.LEQUAL);break;case zd:t.depthFunc(t.EQUAL);break;case Bd:t.depthFunc(t.GEQUAL);break;case Hd:t.depthFunc(t.GREATER);break;case Vd:t.depthFunc(t.NOTEQUAL);break;default:t.depthFunc(t.LEQUAL)}Q=pe}},setLocked:function(pe){I=pe},setClear:function(pe){ue!==pe&&(t.clearDepth(pe),ue=pe)},reset:function(){I=!1,X=null,Q=null,ue=null}}}function i(){let I=!1,fe=null,X=null,Q=null,ue=null,pe=null,We=null,Mt=null,nn=null;return{setTest:function(qe){I||(qe?he(t.STENCIL_TEST):ce(t.STENCIL_TEST))},setMask:function(qe){fe!==qe&&!I&&(t.stencilMask(qe),fe=qe)},setFunc:function(qe,rn,oi){(X!==qe||Q!==rn||ue!==oi)&&(t.stencilFunc(qe,rn,oi),X=qe,Q=rn,ue=oi)},setOp:function(qe,rn,oi){(pe!==qe||We!==rn||Mt!==oi)&&(t.stencilOp(qe,rn,oi),pe=qe,We=rn,Mt=oi)},setLocked:function(qe){I=qe},setClear:function(qe){nn!==qe&&(t.clearStencil(qe),nn=qe)},reset:function(){I=!1,fe=null,X=null,Q=null,ue=null,pe=null,We=null,Mt=null,nn=null}}}const r=new e,s=new n,a=new i,o=new WeakMap,l=new WeakMap;let c={},u={},h=new WeakMap,f=[],p=null,_=!1,y=null,m=null,d=null,g=null,v=null,S=null,b=null,C=new Fe(0,0,0),A=0,P=!1,V=null,x=null,w=null,O=null,F=null;const W=t.getParameter(t.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let q=!1,z=0;const J=t.getParameter(t.VERSION);J.indexOf("WebGL")!==-1?(z=parseFloat(/^WebGL (\d)/.exec(J)[1]),q=z>=1):J.indexOf("OpenGL ES")!==-1&&(z=parseFloat(/^OpenGL ES (\d)/.exec(J)[1]),q=z>=2);let L=null,Y={};const $=t.getParameter(t.SCISSOR_BOX),ne=t.getParameter(t.VIEWPORT),ye=new _t().fromArray($),Ie=new _t().fromArray(ne);function j(I,fe,X,Q){const ue=new Uint8Array(4),pe=t.createTexture();t.bindTexture(I,pe),t.texParameteri(I,t.TEXTURE_MIN_FILTER,t.NEAREST),t.texParameteri(I,t.TEXTURE_MAG_FILTER,t.NEAREST);for(let We=0;We<X;We++)I===t.TEXTURE_3D||I===t.TEXTURE_2D_ARRAY?t.texImage3D(fe,0,t.RGBA,1,1,Q,0,t.RGBA,t.UNSIGNED_BYTE,ue):t.texImage2D(fe+We,0,t.RGBA,1,1,0,t.RGBA,t.UNSIGNED_BYTE,ue);return pe}const ie={};ie[t.TEXTURE_2D]=j(t.TEXTURE_2D,t.TEXTURE_2D,1),ie[t.TEXTURE_CUBE_MAP]=j(t.TEXTURE_CUBE_MAP,t.TEXTURE_CUBE_MAP_POSITIVE_X,6),ie[t.TEXTURE_2D_ARRAY]=j(t.TEXTURE_2D_ARRAY,t.TEXTURE_2D_ARRAY,1,1),ie[t.TEXTURE_3D]=j(t.TEXTURE_3D,t.TEXTURE_3D,1,1),r.setClear(0,0,0,1),s.setClear(1),a.setClear(0),he(t.DEPTH_TEST),s.setFunc(js),Be(!1),$e(tm),he(t.CULL_FACE),D(sr);function he(I){c[I]!==!0&&(t.enable(I),c[I]=!0)}function ce(I){c[I]!==!1&&(t.disable(I),c[I]=!1)}function De(I,fe){return u[I]!==fe?(t.bindFramebuffer(I,fe),u[I]=fe,I===t.DRAW_FRAMEBUFFER&&(u[t.FRAMEBUFFER]=fe),I===t.FRAMEBUFFER&&(u[t.DRAW_FRAMEBUFFER]=fe),!0):!1}function Ae(I,fe){let X=f,Q=!1;if(I){X=h.get(fe),X===void 0&&(X=[],h.set(fe,X));const ue=I.textures;if(X.length!==ue.length||X[0]!==t.COLOR_ATTACHMENT0){for(let pe=0,We=ue.length;pe<We;pe++)X[pe]=t.COLOR_ATTACHMENT0+pe;X.length=ue.length,Q=!0}}else X[0]!==t.BACK&&(X[0]=t.BACK,Q=!0);Q&&t.drawBuffers(X)}function Ve(I){return p!==I?(t.useProgram(I),p=I,!0):!1}const nt={[Rr]:t.FUNC_ADD,[rS]:t.FUNC_SUBTRACT,[sS]:t.FUNC_REVERSE_SUBTRACT};nt[aS]=t.MIN,nt[oS]=t.MAX;const Ge={[lS]:t.ZERO,[cS]:t.ONE,[uS]:t.SRC_COLOR,[Id]:t.SRC_ALPHA,[gS]:t.SRC_ALPHA_SATURATE,[pS]:t.DST_COLOR,[hS]:t.DST_ALPHA,[dS]:t.ONE_MINUS_SRC_COLOR,[Ud]:t.ONE_MINUS_SRC_ALPHA,[mS]:t.ONE_MINUS_DST_COLOR,[fS]:t.ONE_MINUS_DST_ALPHA,[vS]:t.CONSTANT_COLOR,[_S]:t.ONE_MINUS_CONSTANT_COLOR,[xS]:t.CONSTANT_ALPHA,[yS]:t.ONE_MINUS_CONSTANT_ALPHA};function D(I,fe,X,Q,ue,pe,We,Mt,nn,qe){if(I===sr){_===!0&&(ce(t.BLEND),_=!1);return}if(_===!1&&(he(t.BLEND),_=!0),I!==iS){if(I!==y||qe!==P){if((m!==Rr||v!==Rr)&&(t.blendEquation(t.FUNC_ADD),m=Rr,v=Rr),qe)switch(I){case Is:t.blendFuncSeparate(t.ONE,t.ONE_MINUS_SRC_ALPHA,t.ONE,t.ONE_MINUS_SRC_ALPHA);break;case Us:t.blendFunc(t.ONE,t.ONE);break;case nm:t.blendFuncSeparate(t.ZERO,t.ONE_MINUS_SRC_COLOR,t.ZERO,t.ONE);break;case im:t.blendFuncSeparate(t.ZERO,t.SRC_COLOR,t.ZERO,t.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",I);break}else switch(I){case Is:t.blendFuncSeparate(t.SRC_ALPHA,t.ONE_MINUS_SRC_ALPHA,t.ONE,t.ONE_MINUS_SRC_ALPHA);break;case Us:t.blendFunc(t.SRC_ALPHA,t.ONE);break;case nm:t.blendFuncSeparate(t.ZERO,t.ONE_MINUS_SRC_COLOR,t.ZERO,t.ONE);break;case im:t.blendFunc(t.ZERO,t.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",I);break}d=null,g=null,S=null,b=null,C.set(0,0,0),A=0,y=I,P=qe}return}ue=ue||fe,pe=pe||X,We=We||Q,(fe!==m||ue!==v)&&(t.blendEquationSeparate(nt[fe],nt[ue]),m=fe,v=ue),(X!==d||Q!==g||pe!==S||We!==b)&&(t.blendFuncSeparate(Ge[X],Ge[Q],Ge[pe],Ge[We]),d=X,g=Q,S=pe,b=We),(Mt.equals(C)===!1||nn!==A)&&(t.blendColor(Mt.r,Mt.g,Mt.b,nn),C.copy(Mt),A=nn),y=I,P=!1}function pn(I,fe){I.side===ln?ce(t.CULL_FACE):he(t.CULL_FACE);let X=I.side===Qt;fe&&(X=!X),Be(X),I.blending===Is&&I.transparent===!1?D(sr):D(I.blending,I.blendEquation,I.blendSrc,I.blendDst,I.blendEquationAlpha,I.blendSrcAlpha,I.blendDstAlpha,I.blendColor,I.blendAlpha,I.premultipliedAlpha),s.setFunc(I.depthFunc),s.setTest(I.depthTest),s.setMask(I.depthWrite),r.setMask(I.colorWrite);const Q=I.stencilWrite;a.setTest(Q),Q&&(a.setMask(I.stencilWriteMask),a.setFunc(I.stencilFunc,I.stencilRef,I.stencilFuncMask),a.setOp(I.stencilFail,I.stencilZFail,I.stencilZPass)),ot(I.polygonOffset,I.polygonOffsetFactor,I.polygonOffsetUnits),I.alphaToCoverage===!0?he(t.SAMPLE_ALPHA_TO_COVERAGE):ce(t.SAMPLE_ALPHA_TO_COVERAGE)}function Be(I){V!==I&&(I?t.frontFace(t.CW):t.frontFace(t.CCW),V=I)}function $e(I){I!==eS?(he(t.CULL_FACE),I!==x&&(I===tm?t.cullFace(t.BACK):I===tS?t.cullFace(t.FRONT):t.cullFace(t.FRONT_AND_BACK))):ce(t.CULL_FACE),x=I}function Re(I){I!==w&&(q&&t.lineWidth(I),w=I)}function ot(I,fe,X){I?(he(t.POLYGON_OFFSET_FILL),(O!==fe||F!==X)&&(t.polygonOffset(fe,X),O=fe,F=X)):ce(t.POLYGON_OFFSET_FILL)}function Le(I){I?he(t.SCISSOR_TEST):ce(t.SCISSOR_TEST)}function R(I){I===void 0&&(I=t.TEXTURE0+W-1),L!==I&&(t.activeTexture(I),L=I)}function E(I,fe,X){X===void 0&&(L===null?X=t.TEXTURE0+W-1:X=L);let Q=Y[X];Q===void 0&&(Q={type:void 0,texture:void 0},Y[X]=Q),(Q.type!==I||Q.texture!==fe)&&(L!==X&&(t.activeTexture(X),L=X),t.bindTexture(I,fe||ie[I]),Q.type=I,Q.texture=fe)}function B(){const I=Y[L];I!==void 0&&I.type!==void 0&&(t.bindTexture(I.type,null),I.type=void 0,I.texture=void 0)}function Z(){try{t.compressedTexImage2D.apply(t,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function ee(){try{t.compressedTexImage3D.apply(t,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function K(){try{t.texSubImage2D.apply(t,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function Me(){try{t.texSubImage3D.apply(t,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function le(){try{t.compressedTexSubImage2D.apply(t,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function ge(){try{t.compressedTexSubImage3D.apply(t,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function Ye(){try{t.texStorage2D.apply(t,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function se(){try{t.texStorage3D.apply(t,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function ve(){try{t.texImage2D.apply(t,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function be(){try{t.texImage3D.apply(t,arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function Pe(I){ye.equals(I)===!1&&(t.scissor(I.x,I.y,I.z,I.w),ye.copy(I))}function _e(I){Ie.equals(I)===!1&&(t.viewport(I.x,I.y,I.z,I.w),Ie.copy(I))}function He(I,fe){let X=l.get(fe);X===void 0&&(X=new WeakMap,l.set(fe,X));let Q=X.get(I);Q===void 0&&(Q=t.getUniformBlockIndex(fe,I.name),X.set(I,Q))}function Ne(I,fe){const Q=l.get(fe).get(I);o.get(fe)!==Q&&(t.uniformBlockBinding(fe,Q,I.__bindingPointIndex),o.set(fe,Q))}function st(){t.disable(t.BLEND),t.disable(t.CULL_FACE),t.disable(t.DEPTH_TEST),t.disable(t.POLYGON_OFFSET_FILL),t.disable(t.SCISSOR_TEST),t.disable(t.STENCIL_TEST),t.disable(t.SAMPLE_ALPHA_TO_COVERAGE),t.blendEquation(t.FUNC_ADD),t.blendFunc(t.ONE,t.ZERO),t.blendFuncSeparate(t.ONE,t.ZERO,t.ONE,t.ZERO),t.blendColor(0,0,0,0),t.colorMask(!0,!0,!0,!0),t.clearColor(0,0,0,0),t.depthMask(!0),t.depthFunc(t.LESS),t.clearDepth(1),t.stencilMask(4294967295),t.stencilFunc(t.ALWAYS,0,4294967295),t.stencilOp(t.KEEP,t.KEEP,t.KEEP),t.clearStencil(0),t.cullFace(t.BACK),t.frontFace(t.CCW),t.polygonOffset(0,0),t.activeTexture(t.TEXTURE0),t.bindFramebuffer(t.FRAMEBUFFER,null),t.bindFramebuffer(t.DRAW_FRAMEBUFFER,null),t.bindFramebuffer(t.READ_FRAMEBUFFER,null),t.useProgram(null),t.lineWidth(1),t.scissor(0,0,t.canvas.width,t.canvas.height),t.viewport(0,0,t.canvas.width,t.canvas.height),c={},L=null,Y={},u={},h=new WeakMap,f=[],p=null,_=!1,y=null,m=null,d=null,g=null,v=null,S=null,b=null,C=new Fe(0,0,0),A=0,P=!1,V=null,x=null,w=null,O=null,F=null,ye.set(0,0,t.canvas.width,t.canvas.height),Ie.set(0,0,t.canvas.width,t.canvas.height),r.reset(),s.reset(),a.reset()}return{buffers:{color:r,depth:s,stencil:a},enable:he,disable:ce,bindFramebuffer:De,drawBuffers:Ae,useProgram:Ve,setBlending:D,setMaterial:pn,setFlipSided:Be,setCullFace:$e,setLineWidth:Re,setPolygonOffset:ot,setScissorTest:Le,activeTexture:R,bindTexture:E,unbindTexture:B,compressedTexImage2D:Z,compressedTexImage3D:ee,texImage2D:ve,texImage3D:be,updateUBOMapping:He,uniformBlockBinding:Ne,texStorage2D:Ye,texStorage3D:se,texSubImage2D:K,texSubImage3D:Me,compressedTexSubImage2D:le,compressedTexSubImage3D:ge,scissor:Pe,viewport:_e,reset:st}}function $m(t,e,n,i){const r=WT(i);switch(n){case Bv:return t*e;case Vv:return t*e;case Gv:return t*e*2;case wf:return t*e/r.components*r.byteLength;case Tf:return t*e/r.components*r.byteLength;case Wv:return t*e*2/r.components*r.byteLength;case Af:return t*e*2/r.components*r.byteLength;case Hv:return t*e*3/r.components*r.byteLength;case En:return t*e*4/r.components*r.byteLength;case Cf:return t*e*4/r.components*r.byteLength;case ml:case gl:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*8;case vl:case _l:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*16;case $d:case qd:return Math.max(t,16)*Math.max(e,8)/4;case Xd:case Yd:return Math.max(t,8)*Math.max(e,8)/2;case Kd:case Zd:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*8;case Qd:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*16;case Jd:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*16;case eh:return Math.floor((t+4)/5)*Math.floor((e+3)/4)*16;case th:return Math.floor((t+4)/5)*Math.floor((e+4)/5)*16;case nh:return Math.floor((t+5)/6)*Math.floor((e+4)/5)*16;case ih:return Math.floor((t+5)/6)*Math.floor((e+5)/6)*16;case rh:return Math.floor((t+7)/8)*Math.floor((e+4)/5)*16;case sh:return Math.floor((t+7)/8)*Math.floor((e+5)/6)*16;case ah:return Math.floor((t+7)/8)*Math.floor((e+7)/8)*16;case oh:return Math.floor((t+9)/10)*Math.floor((e+4)/5)*16;case lh:return Math.floor((t+9)/10)*Math.floor((e+5)/6)*16;case ch:return Math.floor((t+9)/10)*Math.floor((e+7)/8)*16;case uh:return Math.floor((t+9)/10)*Math.floor((e+9)/10)*16;case dh:return Math.floor((t+11)/12)*Math.floor((e+9)/10)*16;case hh:return Math.floor((t+11)/12)*Math.floor((e+11)/12)*16;case xl:case fh:case ph:return Math.ceil(t/4)*Math.ceil(e/4)*16;case jv:case mh:return Math.ceil(t/4)*Math.ceil(e/4)*8;case gh:case vh:return Math.ceil(t/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${n} format.`)}function WT(t){switch(t){case Pi:case Fv:return{byteLength:1,components:1};case Ja:case Ov:case ao:return{byteLength:2,components:1};case Mf:case Ef:return{byteLength:2,components:4};case Vr:case Sf:case ri:return{byteLength:4,components:1};case zv:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${t}.`)}function jT(t,e,n,i,r,s,a){const o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new Oe,u=new WeakMap;let h;const f=new WeakMap;let p=!1;try{p=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function _(R,E){return p?new OffscreenCanvas(R,E):Jl("canvas")}function y(R,E,B){let Z=1;const ee=Le(R);if((ee.width>B||ee.height>B)&&(Z=B/Math.max(ee.width,ee.height)),Z<1)if(typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&R instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&R instanceof ImageBitmap||typeof VideoFrame<"u"&&R instanceof VideoFrame){const K=Math.floor(Z*ee.width),Me=Math.floor(Z*ee.height);h===void 0&&(h=_(K,Me));const le=E?_(K,Me):h;return le.width=K,le.height=Me,le.getContext("2d").drawImage(R,0,0,K,Me),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+ee.width+"x"+ee.height+") to ("+K+"x"+Me+")."),le}else return"data"in R&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+ee.width+"x"+ee.height+")."),R;return R}function m(R){return R.generateMipmaps&&R.minFilter!==un&&R.minFilter!==Kt}function d(R){t.generateMipmap(R)}function g(R,E,B,Z,ee=!1){if(R!==null){if(t[R]!==void 0)return t[R];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+R+"'")}let K=E;if(E===t.RED&&(B===t.FLOAT&&(K=t.R32F),B===t.HALF_FLOAT&&(K=t.R16F),B===t.UNSIGNED_BYTE&&(K=t.R8)),E===t.RED_INTEGER&&(B===t.UNSIGNED_BYTE&&(K=t.R8UI),B===t.UNSIGNED_SHORT&&(K=t.R16UI),B===t.UNSIGNED_INT&&(K=t.R32UI),B===t.BYTE&&(K=t.R8I),B===t.SHORT&&(K=t.R16I),B===t.INT&&(K=t.R32I)),E===t.RG&&(B===t.FLOAT&&(K=t.RG32F),B===t.HALF_FLOAT&&(K=t.RG16F),B===t.UNSIGNED_BYTE&&(K=t.RG8)),E===t.RG_INTEGER&&(B===t.UNSIGNED_BYTE&&(K=t.RG8UI),B===t.UNSIGNED_SHORT&&(K=t.RG16UI),B===t.UNSIGNED_INT&&(K=t.RG32UI),B===t.BYTE&&(K=t.RG8I),B===t.SHORT&&(K=t.RG16I),B===t.INT&&(K=t.RG32I)),E===t.RGB_INTEGER&&(B===t.UNSIGNED_BYTE&&(K=t.RGB8UI),B===t.UNSIGNED_SHORT&&(K=t.RGB16UI),B===t.UNSIGNED_INT&&(K=t.RGB32UI),B===t.BYTE&&(K=t.RGB8I),B===t.SHORT&&(K=t.RGB16I),B===t.INT&&(K=t.RGB32I)),E===t.RGBA_INTEGER&&(B===t.UNSIGNED_BYTE&&(K=t.RGBA8UI),B===t.UNSIGNED_SHORT&&(K=t.RGBA16UI),B===t.UNSIGNED_INT&&(K=t.RGBA32UI),B===t.BYTE&&(K=t.RGBA8I),B===t.SHORT&&(K=t.RGBA16I),B===t.INT&&(K=t.RGBA32I)),E===t.RGB&&B===t.UNSIGNED_INT_5_9_9_9_REV&&(K=t.RGB9_E5),E===t.RGBA){const Me=ee?ql:Qe.getTransfer(Z);B===t.FLOAT&&(K=t.RGBA32F),B===t.HALF_FLOAT&&(K=t.RGBA16F),B===t.UNSIGNED_BYTE&&(K=Me===ut?t.SRGB8_ALPHA8:t.RGBA8),B===t.UNSIGNED_SHORT_4_4_4_4&&(K=t.RGBA4),B===t.UNSIGNED_SHORT_5_5_5_1&&(K=t.RGB5_A1)}return(K===t.R16F||K===t.R32F||K===t.RG16F||K===t.RG32F||K===t.RGBA16F||K===t.RGBA32F)&&e.get("EXT_color_buffer_float"),K}function v(R,E){let B;return R?E===null||E===Vr||E===Ys?B=t.DEPTH24_STENCIL8:E===ri?B=t.DEPTH32F_STENCIL8:E===Ja&&(B=t.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):E===null||E===Vr||E===Ys?B=t.DEPTH_COMPONENT24:E===ri?B=t.DEPTH_COMPONENT32F:E===Ja&&(B=t.DEPTH_COMPONENT16),B}function S(R,E){return m(R)===!0||R.isFramebufferTexture&&R.minFilter!==un&&R.minFilter!==Kt?Math.log2(Math.max(E.width,E.height))+1:R.mipmaps!==void 0&&R.mipmaps.length>0?R.mipmaps.length:R.isCompressedTexture&&Array.isArray(R.image)?E.mipmaps.length:1}function b(R){const E=R.target;E.removeEventListener("dispose",b),A(E),E.isVideoTexture&&u.delete(E)}function C(R){const E=R.target;E.removeEventListener("dispose",C),V(E)}function A(R){const E=i.get(R);if(E.__webglInit===void 0)return;const B=R.source,Z=f.get(B);if(Z){const ee=Z[E.__cacheKey];ee.usedTimes--,ee.usedTimes===0&&P(R),Object.keys(Z).length===0&&f.delete(B)}i.remove(R)}function P(R){const E=i.get(R);t.deleteTexture(E.__webglTexture);const B=R.source,Z=f.get(B);delete Z[E.__cacheKey],a.memory.textures--}function V(R){const E=i.get(R);if(R.depthTexture&&R.depthTexture.dispose(),R.isWebGLCubeRenderTarget)for(let Z=0;Z<6;Z++){if(Array.isArray(E.__webglFramebuffer[Z]))for(let ee=0;ee<E.__webglFramebuffer[Z].length;ee++)t.deleteFramebuffer(E.__webglFramebuffer[Z][ee]);else t.deleteFramebuffer(E.__webglFramebuffer[Z]);E.__webglDepthbuffer&&t.deleteRenderbuffer(E.__webglDepthbuffer[Z])}else{if(Array.isArray(E.__webglFramebuffer))for(let Z=0;Z<E.__webglFramebuffer.length;Z++)t.deleteFramebuffer(E.__webglFramebuffer[Z]);else t.deleteFramebuffer(E.__webglFramebuffer);if(E.__webglDepthbuffer&&t.deleteRenderbuffer(E.__webglDepthbuffer),E.__webglMultisampledFramebuffer&&t.deleteFramebuffer(E.__webglMultisampledFramebuffer),E.__webglColorRenderbuffer)for(let Z=0;Z<E.__webglColorRenderbuffer.length;Z++)E.__webglColorRenderbuffer[Z]&&t.deleteRenderbuffer(E.__webglColorRenderbuffer[Z]);E.__webglDepthRenderbuffer&&t.deleteRenderbuffer(E.__webglDepthRenderbuffer)}const B=R.textures;for(let Z=0,ee=B.length;Z<ee;Z++){const K=i.get(B[Z]);K.__webglTexture&&(t.deleteTexture(K.__webglTexture),a.memory.textures--),i.remove(B[Z])}i.remove(R)}let x=0;function w(){x=0}function O(){const R=x;return R>=r.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+R+" texture units while this GPU supports only "+r.maxTextures),x+=1,R}function F(R){const E=[];return E.push(R.wrapS),E.push(R.wrapT),E.push(R.wrapR||0),E.push(R.magFilter),E.push(R.minFilter),E.push(R.anisotropy),E.push(R.internalFormat),E.push(R.format),E.push(R.type),E.push(R.generateMipmaps),E.push(R.premultiplyAlpha),E.push(R.flipY),E.push(R.unpackAlignment),E.push(R.colorSpace),E.join()}function W(R,E){const B=i.get(R);if(R.isVideoTexture&&Re(R),R.isRenderTargetTexture===!1&&R.version>0&&B.__version!==R.version){const Z=R.image;if(Z===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(Z.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{Ie(B,R,E);return}}n.bindTexture(t.TEXTURE_2D,B.__webglTexture,t.TEXTURE0+E)}function q(R,E){const B=i.get(R);if(R.version>0&&B.__version!==R.version){Ie(B,R,E);return}n.bindTexture(t.TEXTURE_2D_ARRAY,B.__webglTexture,t.TEXTURE0+E)}function z(R,E){const B=i.get(R);if(R.version>0&&B.__version!==R.version){Ie(B,R,E);return}n.bindTexture(t.TEXTURE_3D,B.__webglTexture,t.TEXTURE0+E)}function J(R,E){const B=i.get(R);if(R.version>0&&B.__version!==R.version){j(B,R,E);return}n.bindTexture(t.TEXTURE_CUBE_MAP,B.__webglTexture,t.TEXTURE0+E)}const L={[Yl]:t.REPEAT,[Nr]:t.CLAMP_TO_EDGE,[jd]:t.MIRRORED_REPEAT},Y={[un]:t.NEAREST,[PS]:t.NEAREST_MIPMAP_NEAREST,[bo]:t.NEAREST_MIPMAP_LINEAR,[Kt]:t.LINEAR,[ru]:t.LINEAR_MIPMAP_NEAREST,[yi]:t.LINEAR_MIPMAP_LINEAR},$={[IS]:t.NEVER,[BS]:t.ALWAYS,[US]:t.LESS,[Xv]:t.LEQUAL,[kS]:t.EQUAL,[zS]:t.GEQUAL,[FS]:t.GREATER,[OS]:t.NOTEQUAL};function ne(R,E){if(E.type===ri&&e.has("OES_texture_float_linear")===!1&&(E.magFilter===Kt||E.magFilter===ru||E.magFilter===bo||E.magFilter===yi||E.minFilter===Kt||E.minFilter===ru||E.minFilter===bo||E.minFilter===yi)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),t.texParameteri(R,t.TEXTURE_WRAP_S,L[E.wrapS]),t.texParameteri(R,t.TEXTURE_WRAP_T,L[E.wrapT]),(R===t.TEXTURE_3D||R===t.TEXTURE_2D_ARRAY)&&t.texParameteri(R,t.TEXTURE_WRAP_R,L[E.wrapR]),t.texParameteri(R,t.TEXTURE_MAG_FILTER,Y[E.magFilter]),t.texParameteri(R,t.TEXTURE_MIN_FILTER,Y[E.minFilter]),E.compareFunction&&(t.texParameteri(R,t.TEXTURE_COMPARE_MODE,t.COMPARE_REF_TO_TEXTURE),t.texParameteri(R,t.TEXTURE_COMPARE_FUNC,$[E.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(E.magFilter===un||E.minFilter!==bo&&E.minFilter!==yi||E.type===ri&&e.has("OES_texture_float_linear")===!1)return;if(E.anisotropy>1||i.get(E).__currentAnisotropy){const B=e.get("EXT_texture_filter_anisotropic");t.texParameterf(R,B.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(E.anisotropy,r.getMaxAnisotropy())),i.get(E).__currentAnisotropy=E.anisotropy}}}function ye(R,E){let B=!1;R.__webglInit===void 0&&(R.__webglInit=!0,E.addEventListener("dispose",b));const Z=E.source;let ee=f.get(Z);ee===void 0&&(ee={},f.set(Z,ee));const K=F(E);if(K!==R.__cacheKey){ee[K]===void 0&&(ee[K]={texture:t.createTexture(),usedTimes:0},a.memory.textures++,B=!0),ee[K].usedTimes++;const Me=ee[R.__cacheKey];Me!==void 0&&(ee[R.__cacheKey].usedTimes--,Me.usedTimes===0&&P(E)),R.__cacheKey=K,R.__webglTexture=ee[K].texture}return B}function Ie(R,E,B){let Z=t.TEXTURE_2D;(E.isDataArrayTexture||E.isCompressedArrayTexture)&&(Z=t.TEXTURE_2D_ARRAY),E.isData3DTexture&&(Z=t.TEXTURE_3D);const ee=ye(R,E),K=E.source;n.bindTexture(Z,R.__webglTexture,t.TEXTURE0+B);const Me=i.get(K);if(K.version!==Me.__version||ee===!0){n.activeTexture(t.TEXTURE0+B);const le=Qe.getPrimaries(Qe.workingColorSpace),ge=E.colorSpace===ji?null:Qe.getPrimaries(E.colorSpace),Ye=E.colorSpace===ji||le===ge?t.NONE:t.BROWSER_DEFAULT_WEBGL;t.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,E.flipY),t.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL,E.premultiplyAlpha),t.pixelStorei(t.UNPACK_ALIGNMENT,E.unpackAlignment),t.pixelStorei(t.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ye);let se=y(E.image,!1,r.maxTextureSize);se=ot(E,se);const ve=s.convert(E.format,E.colorSpace),be=s.convert(E.type);let Pe=g(E.internalFormat,ve,be,E.colorSpace,E.isVideoTexture);ne(Z,E);let _e;const He=E.mipmaps,Ne=E.isVideoTexture!==!0,st=Me.__version===void 0||ee===!0,I=K.dataReady,fe=S(E,se);if(E.isDepthTexture)Pe=v(E.format===qs,E.type),st&&(Ne?n.texStorage2D(t.TEXTURE_2D,1,Pe,se.width,se.height):n.texImage2D(t.TEXTURE_2D,0,Pe,se.width,se.height,0,ve,be,null));else if(E.isDataTexture)if(He.length>0){Ne&&st&&n.texStorage2D(t.TEXTURE_2D,fe,Pe,He[0].width,He[0].height);for(let X=0,Q=He.length;X<Q;X++)_e=He[X],Ne?I&&n.texSubImage2D(t.TEXTURE_2D,X,0,0,_e.width,_e.height,ve,be,_e.data):n.texImage2D(t.TEXTURE_2D,X,Pe,_e.width,_e.height,0,ve,be,_e.data);E.generateMipmaps=!1}else Ne?(st&&n.texStorage2D(t.TEXTURE_2D,fe,Pe,se.width,se.height),I&&n.texSubImage2D(t.TEXTURE_2D,0,0,0,se.width,se.height,ve,be,se.data)):n.texImage2D(t.TEXTURE_2D,0,Pe,se.width,se.height,0,ve,be,se.data);else if(E.isCompressedTexture)if(E.isCompressedArrayTexture){Ne&&st&&n.texStorage3D(t.TEXTURE_2D_ARRAY,fe,Pe,He[0].width,He[0].height,se.depth);for(let X=0,Q=He.length;X<Q;X++)if(_e=He[X],E.format!==En)if(ve!==null)if(Ne){if(I)if(E.layerUpdates.size>0){const ue=$m(_e.width,_e.height,E.format,E.type);for(const pe of E.layerUpdates){const We=_e.data.subarray(pe*ue/_e.data.BYTES_PER_ELEMENT,(pe+1)*ue/_e.data.BYTES_PER_ELEMENT);n.compressedTexSubImage3D(t.TEXTURE_2D_ARRAY,X,0,0,pe,_e.width,_e.height,1,ve,We,0,0)}E.clearLayerUpdates()}else n.compressedTexSubImage3D(t.TEXTURE_2D_ARRAY,X,0,0,0,_e.width,_e.height,se.depth,ve,_e.data,0,0)}else n.compressedTexImage3D(t.TEXTURE_2D_ARRAY,X,Pe,_e.width,_e.height,se.depth,0,_e.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Ne?I&&n.texSubImage3D(t.TEXTURE_2D_ARRAY,X,0,0,0,_e.width,_e.height,se.depth,ve,be,_e.data):n.texImage3D(t.TEXTURE_2D_ARRAY,X,Pe,_e.width,_e.height,se.depth,0,ve,be,_e.data)}else{Ne&&st&&n.texStorage2D(t.TEXTURE_2D,fe,Pe,He[0].width,He[0].height);for(let X=0,Q=He.length;X<Q;X++)_e=He[X],E.format!==En?ve!==null?Ne?I&&n.compressedTexSubImage2D(t.TEXTURE_2D,X,0,0,_e.width,_e.height,ve,_e.data):n.compressedTexImage2D(t.TEXTURE_2D,X,Pe,_e.width,_e.height,0,_e.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Ne?I&&n.texSubImage2D(t.TEXTURE_2D,X,0,0,_e.width,_e.height,ve,be,_e.data):n.texImage2D(t.TEXTURE_2D,X,Pe,_e.width,_e.height,0,ve,be,_e.data)}else if(E.isDataArrayTexture)if(Ne){if(st&&n.texStorage3D(t.TEXTURE_2D_ARRAY,fe,Pe,se.width,se.height,se.depth),I)if(E.layerUpdates.size>0){const X=$m(se.width,se.height,E.format,E.type);for(const Q of E.layerUpdates){const ue=se.data.subarray(Q*X/se.data.BYTES_PER_ELEMENT,(Q+1)*X/se.data.BYTES_PER_ELEMENT);n.texSubImage3D(t.TEXTURE_2D_ARRAY,0,0,0,Q,se.width,se.height,1,ve,be,ue)}E.clearLayerUpdates()}else n.texSubImage3D(t.TEXTURE_2D_ARRAY,0,0,0,0,se.width,se.height,se.depth,ve,be,se.data)}else n.texImage3D(t.TEXTURE_2D_ARRAY,0,Pe,se.width,se.height,se.depth,0,ve,be,se.data);else if(E.isData3DTexture)Ne?(st&&n.texStorage3D(t.TEXTURE_3D,fe,Pe,se.width,se.height,se.depth),I&&n.texSubImage3D(t.TEXTURE_3D,0,0,0,0,se.width,se.height,se.depth,ve,be,se.data)):n.texImage3D(t.TEXTURE_3D,0,Pe,se.width,se.height,se.depth,0,ve,be,se.data);else if(E.isFramebufferTexture){if(st)if(Ne)n.texStorage2D(t.TEXTURE_2D,fe,Pe,se.width,se.height);else{let X=se.width,Q=se.height;for(let ue=0;ue<fe;ue++)n.texImage2D(t.TEXTURE_2D,ue,Pe,X,Q,0,ve,be,null),X>>=1,Q>>=1}}else if(He.length>0){if(Ne&&st){const X=Le(He[0]);n.texStorage2D(t.TEXTURE_2D,fe,Pe,X.width,X.height)}for(let X=0,Q=He.length;X<Q;X++)_e=He[X],Ne?I&&n.texSubImage2D(t.TEXTURE_2D,X,0,0,ve,be,_e):n.texImage2D(t.TEXTURE_2D,X,Pe,ve,be,_e);E.generateMipmaps=!1}else if(Ne){if(st){const X=Le(se);n.texStorage2D(t.TEXTURE_2D,fe,Pe,X.width,X.height)}I&&n.texSubImage2D(t.TEXTURE_2D,0,0,0,ve,be,se)}else n.texImage2D(t.TEXTURE_2D,0,Pe,ve,be,se);m(E)&&d(Z),Me.__version=K.version,E.onUpdate&&E.onUpdate(E)}R.__version=E.version}function j(R,E,B){if(E.image.length!==6)return;const Z=ye(R,E),ee=E.source;n.bindTexture(t.TEXTURE_CUBE_MAP,R.__webglTexture,t.TEXTURE0+B);const K=i.get(ee);if(ee.version!==K.__version||Z===!0){n.activeTexture(t.TEXTURE0+B);const Me=Qe.getPrimaries(Qe.workingColorSpace),le=E.colorSpace===ji?null:Qe.getPrimaries(E.colorSpace),ge=E.colorSpace===ji||Me===le?t.NONE:t.BROWSER_DEFAULT_WEBGL;t.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,E.flipY),t.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL,E.premultiplyAlpha),t.pixelStorei(t.UNPACK_ALIGNMENT,E.unpackAlignment),t.pixelStorei(t.UNPACK_COLORSPACE_CONVERSION_WEBGL,ge);const Ye=E.isCompressedTexture||E.image[0].isCompressedTexture,se=E.image[0]&&E.image[0].isDataTexture,ve=[];for(let Q=0;Q<6;Q++)!Ye&&!se?ve[Q]=y(E.image[Q],!0,r.maxCubemapSize):ve[Q]=se?E.image[Q].image:E.image[Q],ve[Q]=ot(E,ve[Q]);const be=ve[0],Pe=s.convert(E.format,E.colorSpace),_e=s.convert(E.type),He=g(E.internalFormat,Pe,_e,E.colorSpace),Ne=E.isVideoTexture!==!0,st=K.__version===void 0||Z===!0,I=ee.dataReady;let fe=S(E,be);ne(t.TEXTURE_CUBE_MAP,E);let X;if(Ye){Ne&&st&&n.texStorage2D(t.TEXTURE_CUBE_MAP,fe,He,be.width,be.height);for(let Q=0;Q<6;Q++){X=ve[Q].mipmaps;for(let ue=0;ue<X.length;ue++){const pe=X[ue];E.format!==En?Pe!==null?Ne?I&&n.compressedTexSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+Q,ue,0,0,pe.width,pe.height,Pe,pe.data):n.compressedTexImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+Q,ue,He,pe.width,pe.height,0,pe.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Ne?I&&n.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+Q,ue,0,0,pe.width,pe.height,Pe,_e,pe.data):n.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+Q,ue,He,pe.width,pe.height,0,Pe,_e,pe.data)}}}else{if(X=E.mipmaps,Ne&&st){X.length>0&&fe++;const Q=Le(ve[0]);n.texStorage2D(t.TEXTURE_CUBE_MAP,fe,He,Q.width,Q.height)}for(let Q=0;Q<6;Q++)if(se){Ne?I&&n.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0,0,0,ve[Q].width,ve[Q].height,Pe,_e,ve[Q].data):n.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0,He,ve[Q].width,ve[Q].height,0,Pe,_e,ve[Q].data);for(let ue=0;ue<X.length;ue++){const We=X[ue].image[Q].image;Ne?I&&n.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+Q,ue+1,0,0,We.width,We.height,Pe,_e,We.data):n.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+Q,ue+1,He,We.width,We.height,0,Pe,_e,We.data)}}else{Ne?I&&n.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0,0,0,Pe,_e,ve[Q]):n.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0,He,Pe,_e,ve[Q]);for(let ue=0;ue<X.length;ue++){const pe=X[ue];Ne?I&&n.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+Q,ue+1,0,0,Pe,_e,pe.image[Q]):n.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+Q,ue+1,He,Pe,_e,pe.image[Q])}}}m(E)&&d(t.TEXTURE_CUBE_MAP),K.__version=ee.version,E.onUpdate&&E.onUpdate(E)}R.__version=E.version}function ie(R,E,B,Z,ee,K){const Me=s.convert(B.format,B.colorSpace),le=s.convert(B.type),ge=g(B.internalFormat,Me,le,B.colorSpace);if(!i.get(E).__hasExternalTextures){const se=Math.max(1,E.width>>K),ve=Math.max(1,E.height>>K);ee===t.TEXTURE_3D||ee===t.TEXTURE_2D_ARRAY?n.texImage3D(ee,K,ge,se,ve,E.depth,0,Me,le,null):n.texImage2D(ee,K,ge,se,ve,0,Me,le,null)}n.bindFramebuffer(t.FRAMEBUFFER,R),$e(E)?o.framebufferTexture2DMultisampleEXT(t.FRAMEBUFFER,Z,ee,i.get(B).__webglTexture,0,Be(E)):(ee===t.TEXTURE_2D||ee>=t.TEXTURE_CUBE_MAP_POSITIVE_X&&ee<=t.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&t.framebufferTexture2D(t.FRAMEBUFFER,Z,ee,i.get(B).__webglTexture,K),n.bindFramebuffer(t.FRAMEBUFFER,null)}function he(R,E,B){if(t.bindRenderbuffer(t.RENDERBUFFER,R),E.depthBuffer){const Z=E.depthTexture,ee=Z&&Z.isDepthTexture?Z.type:null,K=v(E.stencilBuffer,ee),Me=E.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT,le=Be(E);$e(E)?o.renderbufferStorageMultisampleEXT(t.RENDERBUFFER,le,K,E.width,E.height):B?t.renderbufferStorageMultisample(t.RENDERBUFFER,le,K,E.width,E.height):t.renderbufferStorage(t.RENDERBUFFER,K,E.width,E.height),t.framebufferRenderbuffer(t.FRAMEBUFFER,Me,t.RENDERBUFFER,R)}else{const Z=E.textures;for(let ee=0;ee<Z.length;ee++){const K=Z[ee],Me=s.convert(K.format,K.colorSpace),le=s.convert(K.type),ge=g(K.internalFormat,Me,le,K.colorSpace),Ye=Be(E);B&&$e(E)===!1?t.renderbufferStorageMultisample(t.RENDERBUFFER,Ye,ge,E.width,E.height):$e(E)?o.renderbufferStorageMultisampleEXT(t.RENDERBUFFER,Ye,ge,E.width,E.height):t.renderbufferStorage(t.RENDERBUFFER,ge,E.width,E.height)}}t.bindRenderbuffer(t.RENDERBUFFER,null)}function ce(R,E){if(E&&E.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(n.bindFramebuffer(t.FRAMEBUFFER,R),!(E.depthTexture&&E.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");(!i.get(E.depthTexture).__webglTexture||E.depthTexture.image.width!==E.width||E.depthTexture.image.height!==E.height)&&(E.depthTexture.image.width=E.width,E.depthTexture.image.height=E.height,E.depthTexture.needsUpdate=!0),W(E.depthTexture,0);const Z=i.get(E.depthTexture).__webglTexture,ee=Be(E);if(E.depthTexture.format===ks)$e(E)?o.framebufferTexture2DMultisampleEXT(t.FRAMEBUFFER,t.DEPTH_ATTACHMENT,t.TEXTURE_2D,Z,0,ee):t.framebufferTexture2D(t.FRAMEBUFFER,t.DEPTH_ATTACHMENT,t.TEXTURE_2D,Z,0);else if(E.depthTexture.format===qs)$e(E)?o.framebufferTexture2DMultisampleEXT(t.FRAMEBUFFER,t.DEPTH_STENCIL_ATTACHMENT,t.TEXTURE_2D,Z,0,ee):t.framebufferTexture2D(t.FRAMEBUFFER,t.DEPTH_STENCIL_ATTACHMENT,t.TEXTURE_2D,Z,0);else throw new Error("Unknown depthTexture format")}function De(R){const E=i.get(R),B=R.isWebGLCubeRenderTarget===!0;if(E.__boundDepthTexture!==R.depthTexture){const Z=R.depthTexture;if(E.__depthDisposeCallback&&E.__depthDisposeCallback(),Z){const ee=()=>{delete E.__boundDepthTexture,delete E.__depthDisposeCallback,Z.removeEventListener("dispose",ee)};Z.addEventListener("dispose",ee),E.__depthDisposeCallback=ee}E.__boundDepthTexture=Z}if(R.depthTexture&&!E.__autoAllocateDepthBuffer){if(B)throw new Error("target.depthTexture not supported in Cube render targets");ce(E.__webglFramebuffer,R)}else if(B){E.__webglDepthbuffer=[];for(let Z=0;Z<6;Z++)if(n.bindFramebuffer(t.FRAMEBUFFER,E.__webglFramebuffer[Z]),E.__webglDepthbuffer[Z]===void 0)E.__webglDepthbuffer[Z]=t.createRenderbuffer(),he(E.__webglDepthbuffer[Z],R,!1);else{const ee=R.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT,K=E.__webglDepthbuffer[Z];t.bindRenderbuffer(t.RENDERBUFFER,K),t.framebufferRenderbuffer(t.FRAMEBUFFER,ee,t.RENDERBUFFER,K)}}else if(n.bindFramebuffer(t.FRAMEBUFFER,E.__webglFramebuffer),E.__webglDepthbuffer===void 0)E.__webglDepthbuffer=t.createRenderbuffer(),he(E.__webglDepthbuffer,R,!1);else{const Z=R.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT,ee=E.__webglDepthbuffer;t.bindRenderbuffer(t.RENDERBUFFER,ee),t.framebufferRenderbuffer(t.FRAMEBUFFER,Z,t.RENDERBUFFER,ee)}n.bindFramebuffer(t.FRAMEBUFFER,null)}function Ae(R,E,B){const Z=i.get(R);E!==void 0&&ie(Z.__webglFramebuffer,R,R.texture,t.COLOR_ATTACHMENT0,t.TEXTURE_2D,0),B!==void 0&&De(R)}function Ve(R){const E=R.texture,B=i.get(R),Z=i.get(E);R.addEventListener("dispose",C);const ee=R.textures,K=R.isWebGLCubeRenderTarget===!0,Me=ee.length>1;if(Me||(Z.__webglTexture===void 0&&(Z.__webglTexture=t.createTexture()),Z.__version=E.version,a.memory.textures++),K){B.__webglFramebuffer=[];for(let le=0;le<6;le++)if(E.mipmaps&&E.mipmaps.length>0){B.__webglFramebuffer[le]=[];for(let ge=0;ge<E.mipmaps.length;ge++)B.__webglFramebuffer[le][ge]=t.createFramebuffer()}else B.__webglFramebuffer[le]=t.createFramebuffer()}else{if(E.mipmaps&&E.mipmaps.length>0){B.__webglFramebuffer=[];for(let le=0;le<E.mipmaps.length;le++)B.__webglFramebuffer[le]=t.createFramebuffer()}else B.__webglFramebuffer=t.createFramebuffer();if(Me)for(let le=0,ge=ee.length;le<ge;le++){const Ye=i.get(ee[le]);Ye.__webglTexture===void 0&&(Ye.__webglTexture=t.createTexture(),a.memory.textures++)}if(R.samples>0&&$e(R)===!1){B.__webglMultisampledFramebuffer=t.createFramebuffer(),B.__webglColorRenderbuffer=[],n.bindFramebuffer(t.FRAMEBUFFER,B.__webglMultisampledFramebuffer);for(let le=0;le<ee.length;le++){const ge=ee[le];B.__webglColorRenderbuffer[le]=t.createRenderbuffer(),t.bindRenderbuffer(t.RENDERBUFFER,B.__webglColorRenderbuffer[le]);const Ye=s.convert(ge.format,ge.colorSpace),se=s.convert(ge.type),ve=g(ge.internalFormat,Ye,se,ge.colorSpace,R.isXRRenderTarget===!0),be=Be(R);t.renderbufferStorageMultisample(t.RENDERBUFFER,be,ve,R.width,R.height),t.framebufferRenderbuffer(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0+le,t.RENDERBUFFER,B.__webglColorRenderbuffer[le])}t.bindRenderbuffer(t.RENDERBUFFER,null),R.depthBuffer&&(B.__webglDepthRenderbuffer=t.createRenderbuffer(),he(B.__webglDepthRenderbuffer,R,!0)),n.bindFramebuffer(t.FRAMEBUFFER,null)}}if(K){n.bindTexture(t.TEXTURE_CUBE_MAP,Z.__webglTexture),ne(t.TEXTURE_CUBE_MAP,E);for(let le=0;le<6;le++)if(E.mipmaps&&E.mipmaps.length>0)for(let ge=0;ge<E.mipmaps.length;ge++)ie(B.__webglFramebuffer[le][ge],R,E,t.COLOR_ATTACHMENT0,t.TEXTURE_CUBE_MAP_POSITIVE_X+le,ge);else ie(B.__webglFramebuffer[le],R,E,t.COLOR_ATTACHMENT0,t.TEXTURE_CUBE_MAP_POSITIVE_X+le,0);m(E)&&d(t.TEXTURE_CUBE_MAP),n.unbindTexture()}else if(Me){for(let le=0,ge=ee.length;le<ge;le++){const Ye=ee[le],se=i.get(Ye);n.bindTexture(t.TEXTURE_2D,se.__webglTexture),ne(t.TEXTURE_2D,Ye),ie(B.__webglFramebuffer,R,Ye,t.COLOR_ATTACHMENT0+le,t.TEXTURE_2D,0),m(Ye)&&d(t.TEXTURE_2D)}n.unbindTexture()}else{let le=t.TEXTURE_2D;if((R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&(le=R.isWebGL3DRenderTarget?t.TEXTURE_3D:t.TEXTURE_2D_ARRAY),n.bindTexture(le,Z.__webglTexture),ne(le,E),E.mipmaps&&E.mipmaps.length>0)for(let ge=0;ge<E.mipmaps.length;ge++)ie(B.__webglFramebuffer[ge],R,E,t.COLOR_ATTACHMENT0,le,ge);else ie(B.__webglFramebuffer,R,E,t.COLOR_ATTACHMENT0,le,0);m(E)&&d(le),n.unbindTexture()}R.depthBuffer&&De(R)}function nt(R){const E=R.textures;for(let B=0,Z=E.length;B<Z;B++){const ee=E[B];if(m(ee)){const K=R.isWebGLCubeRenderTarget?t.TEXTURE_CUBE_MAP:t.TEXTURE_2D,Me=i.get(ee).__webglTexture;n.bindTexture(K,Me),d(K),n.unbindTexture()}}}const Ge=[],D=[];function pn(R){if(R.samples>0){if($e(R)===!1){const E=R.textures,B=R.width,Z=R.height;let ee=t.COLOR_BUFFER_BIT;const K=R.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT,Me=i.get(R),le=E.length>1;if(le)for(let ge=0;ge<E.length;ge++)n.bindFramebuffer(t.FRAMEBUFFER,Me.__webglMultisampledFramebuffer),t.framebufferRenderbuffer(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0+ge,t.RENDERBUFFER,null),n.bindFramebuffer(t.FRAMEBUFFER,Me.__webglFramebuffer),t.framebufferTexture2D(t.DRAW_FRAMEBUFFER,t.COLOR_ATTACHMENT0+ge,t.TEXTURE_2D,null,0);n.bindFramebuffer(t.READ_FRAMEBUFFER,Me.__webglMultisampledFramebuffer),n.bindFramebuffer(t.DRAW_FRAMEBUFFER,Me.__webglFramebuffer);for(let ge=0;ge<E.length;ge++){if(R.resolveDepthBuffer&&(R.depthBuffer&&(ee|=t.DEPTH_BUFFER_BIT),R.stencilBuffer&&R.resolveStencilBuffer&&(ee|=t.STENCIL_BUFFER_BIT)),le){t.framebufferRenderbuffer(t.READ_FRAMEBUFFER,t.COLOR_ATTACHMENT0,t.RENDERBUFFER,Me.__webglColorRenderbuffer[ge]);const Ye=i.get(E[ge]).__webglTexture;t.framebufferTexture2D(t.DRAW_FRAMEBUFFER,t.COLOR_ATTACHMENT0,t.TEXTURE_2D,Ye,0)}t.blitFramebuffer(0,0,B,Z,0,0,B,Z,ee,t.NEAREST),l===!0&&(Ge.length=0,D.length=0,Ge.push(t.COLOR_ATTACHMENT0+ge),R.depthBuffer&&R.resolveDepthBuffer===!1&&(Ge.push(K),D.push(K),t.invalidateFramebuffer(t.DRAW_FRAMEBUFFER,D)),t.invalidateFramebuffer(t.READ_FRAMEBUFFER,Ge))}if(n.bindFramebuffer(t.READ_FRAMEBUFFER,null),n.bindFramebuffer(t.DRAW_FRAMEBUFFER,null),le)for(let ge=0;ge<E.length;ge++){n.bindFramebuffer(t.FRAMEBUFFER,Me.__webglMultisampledFramebuffer),t.framebufferRenderbuffer(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0+ge,t.RENDERBUFFER,Me.__webglColorRenderbuffer[ge]);const Ye=i.get(E[ge]).__webglTexture;n.bindFramebuffer(t.FRAMEBUFFER,Me.__webglFramebuffer),t.framebufferTexture2D(t.DRAW_FRAMEBUFFER,t.COLOR_ATTACHMENT0+ge,t.TEXTURE_2D,Ye,0)}n.bindFramebuffer(t.DRAW_FRAMEBUFFER,Me.__webglMultisampledFramebuffer)}else if(R.depthBuffer&&R.resolveDepthBuffer===!1&&l){const E=R.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT;t.invalidateFramebuffer(t.DRAW_FRAMEBUFFER,[E])}}}function Be(R){return Math.min(r.maxSamples,R.samples)}function $e(R){const E=i.get(R);return R.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&E.__useRenderToTexture!==!1}function Re(R){const E=a.render.frame;u.get(R)!==E&&(u.set(R,E),R.update())}function ot(R,E){const B=R.colorSpace,Z=R.format,ee=R.type;return R.isCompressedTexture===!0||R.isVideoTexture===!0||B!==fr&&B!==ji&&(Qe.getTransfer(B)===ut?(Z!==En||ee!==Pi)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",B)),E}function Le(R){return typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement?(c.width=R.naturalWidth||R.width,c.height=R.naturalHeight||R.height):typeof VideoFrame<"u"&&R instanceof VideoFrame?(c.width=R.displayWidth,c.height=R.displayHeight):(c.width=R.width,c.height=R.height),c}this.allocateTextureUnit=O,this.resetTextureUnits=w,this.setTexture2D=W,this.setTexture2DArray=q,this.setTexture3D=z,this.setTextureCube=J,this.rebindTextures=Ae,this.setupRenderTarget=Ve,this.updateRenderTargetMipmap=nt,this.updateMultisampleRenderTarget=pn,this.setupDepthRenderbuffer=De,this.setupFrameBufferTexture=ie,this.useMultisampledRTT=$e}function XT(t,e){function n(i,r=ji){let s;const a=Qe.getTransfer(r);if(i===Pi)return t.UNSIGNED_BYTE;if(i===Mf)return t.UNSIGNED_SHORT_4_4_4_4;if(i===Ef)return t.UNSIGNED_SHORT_5_5_5_1;if(i===zv)return t.UNSIGNED_INT_5_9_9_9_REV;if(i===Fv)return t.BYTE;if(i===Ov)return t.SHORT;if(i===Ja)return t.UNSIGNED_SHORT;if(i===Sf)return t.INT;if(i===Vr)return t.UNSIGNED_INT;if(i===ri)return t.FLOAT;if(i===ao)return t.HALF_FLOAT;if(i===Bv)return t.ALPHA;if(i===Hv)return t.RGB;if(i===En)return t.RGBA;if(i===Vv)return t.LUMINANCE;if(i===Gv)return t.LUMINANCE_ALPHA;if(i===ks)return t.DEPTH_COMPONENT;if(i===qs)return t.DEPTH_STENCIL;if(i===wf)return t.RED;if(i===Tf)return t.RED_INTEGER;if(i===Wv)return t.RG;if(i===Af)return t.RG_INTEGER;if(i===Cf)return t.RGBA_INTEGER;if(i===ml||i===gl||i===vl||i===_l)if(a===ut)if(s=e.get("WEBGL_compressed_texture_s3tc_srgb"),s!==null){if(i===ml)return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===gl)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===vl)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===_l)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(s=e.get("WEBGL_compressed_texture_s3tc"),s!==null){if(i===ml)return s.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===gl)return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===vl)return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===_l)return s.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===Xd||i===$d||i===Yd||i===qd)if(s=e.get("WEBGL_compressed_texture_pvrtc"),s!==null){if(i===Xd)return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===$d)return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===Yd)return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===qd)return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===Kd||i===Zd||i===Qd)if(s=e.get("WEBGL_compressed_texture_etc"),s!==null){if(i===Kd||i===Zd)return a===ut?s.COMPRESSED_SRGB8_ETC2:s.COMPRESSED_RGB8_ETC2;if(i===Qd)return a===ut?s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:s.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(i===Jd||i===eh||i===th||i===nh||i===ih||i===rh||i===sh||i===ah||i===oh||i===lh||i===ch||i===uh||i===dh||i===hh)if(s=e.get("WEBGL_compressed_texture_astc"),s!==null){if(i===Jd)return a===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:s.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===eh)return a===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:s.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===th)return a===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:s.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===nh)return a===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:s.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===ih)return a===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:s.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===rh)return a===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:s.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===sh)return a===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:s.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===ah)return a===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:s.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===oh)return a===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:s.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===lh)return a===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:s.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===ch)return a===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:s.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===uh)return a===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:s.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===dh)return a===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:s.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===hh)return a===ut?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:s.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===xl||i===fh||i===ph)if(s=e.get("EXT_texture_compression_bptc"),s!==null){if(i===xl)return a===ut?s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:s.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===fh)return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===ph)return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===jv||i===mh||i===gh||i===vh)if(s=e.get("EXT_texture_compression_rgtc"),s!==null){if(i===xl)return s.COMPRESSED_RED_RGTC1_EXT;if(i===mh)return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===gh)return s.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===vh)return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===Ys?t.UNSIGNED_INT_24_8:t[i]!==void 0?t[i]:null}return{convert:n}}class $T extends Sn{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}}class jn extends bt{constructor(){super(),this.isGroup=!0,this.type="Group"}}const YT={type:"move"};class Iu{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new jn,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new jn,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new N,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new N),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new jn,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new N,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new N),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const n=this._hand;if(n)for(const i of e.hand.values())this._getHandJoint(n,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,n,i){let r=null,s=null,a=null;const o=this._targetRay,l=this._grip,c=this._hand;if(e&&n.session.visibilityState!=="visible-blurred"){if(c&&e.hand){a=!0;for(const y of e.hand.values()){const m=n.getJointPose(y,i),d=this._getHandJoint(c,y);m!==null&&(d.matrix.fromArray(m.transform.matrix),d.matrix.decompose(d.position,d.rotation,d.scale),d.matrixWorldNeedsUpdate=!0,d.jointRadius=m.radius),d.visible=m!==null}const u=c.joints["index-finger-tip"],h=c.joints["thumb-tip"],f=u.position.distanceTo(h.position),p=.02,_=.005;c.inputState.pinching&&f>p+_?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&f<=p-_&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(s=n.getPose(e.gripSpace,i),s!==null&&(l.matrix.fromArray(s.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,s.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(s.linearVelocity)):l.hasLinearVelocity=!1,s.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(s.angularVelocity)):l.hasAngularVelocity=!1));o!==null&&(r=n.getPose(e.targetRaySpace,i),r===null&&s!==null&&(r=s),r!==null&&(o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,r.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(r.linearVelocity)):o.hasLinearVelocity=!1,r.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(r.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(YT)))}return o!==null&&(o.visible=r!==null),l!==null&&(l.visible=s!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,n){if(e.joints[n.jointName]===void 0){const i=new jn;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[n.jointName]=i,e.add(i)}return e.joints[n.jointName]}}const qT=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,KT=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class ZT{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,n,i){if(this.texture===null){const r=new Jt,s=e.properties.get(r);s.__webglTexture=n.texture,(n.depthNear!=i.depthNear||n.depthFar!=i.depthFar)&&(this.depthNear=n.depthNear,this.depthFar=n.depthFar),this.texture=r}}getMesh(e){if(this.texture!==null&&this.mesh===null){const n=e.cameras[0].viewport,i=new Li({vertexShader:qT,fragmentShader:KT,uniforms:{depthColor:{value:this.texture},depthWidth:{value:n.z},depthHeight:{value:n.w}}});this.mesh=new it(new Zs(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class QT extends na{constructor(e,n){super();const i=this;let r=null,s=1,a=null,o="local-floor",l=1,c=null,u=null,h=null,f=null,p=null,_=null;const y=new ZT,m=n.getContextAttributes();let d=null,g=null;const v=[],S=[],b=new Oe;let C=null;const A=new Sn;A.layers.enable(1),A.viewport=new _t;const P=new Sn;P.layers.enable(2),P.viewport=new _t;const V=[A,P],x=new $T;x.layers.enable(1),x.layers.enable(2);let w=null,O=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(j){let ie=v[j];return ie===void 0&&(ie=new Iu,v[j]=ie),ie.getTargetRaySpace()},this.getControllerGrip=function(j){let ie=v[j];return ie===void 0&&(ie=new Iu,v[j]=ie),ie.getGripSpace()},this.getHand=function(j){let ie=v[j];return ie===void 0&&(ie=new Iu,v[j]=ie),ie.getHandSpace()};function F(j){const ie=S.indexOf(j.inputSource);if(ie===-1)return;const he=v[ie];he!==void 0&&(he.update(j.inputSource,j.frame,c||a),he.dispatchEvent({type:j.type,data:j.inputSource}))}function W(){r.removeEventListener("select",F),r.removeEventListener("selectstart",F),r.removeEventListener("selectend",F),r.removeEventListener("squeeze",F),r.removeEventListener("squeezestart",F),r.removeEventListener("squeezeend",F),r.removeEventListener("end",W),r.removeEventListener("inputsourceschange",q);for(let j=0;j<v.length;j++){const ie=S[j];ie!==null&&(S[j]=null,v[j].disconnect(ie))}w=null,O=null,y.reset(),e.setRenderTarget(d),p=null,f=null,h=null,r=null,g=null,Ie.stop(),i.isPresenting=!1,e.setPixelRatio(C),e.setSize(b.width,b.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(j){s=j,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(j){o=j,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(j){c=j},this.getBaseLayer=function(){return f!==null?f:p},this.getBinding=function(){return h},this.getFrame=function(){return _},this.getSession=function(){return r},this.setSession=async function(j){if(r=j,r!==null){if(d=e.getRenderTarget(),r.addEventListener("select",F),r.addEventListener("selectstart",F),r.addEventListener("selectend",F),r.addEventListener("squeeze",F),r.addEventListener("squeezestart",F),r.addEventListener("squeezeend",F),r.addEventListener("end",W),r.addEventListener("inputsourceschange",q),m.xrCompatible!==!0&&await n.makeXRCompatible(),C=e.getPixelRatio(),e.getSize(b),r.renderState.layers===void 0){const ie={antialias:m.antialias,alpha:!0,depth:m.depth,stencil:m.stencil,framebufferScaleFactor:s};p=new XRWebGLLayer(r,n,ie),r.updateRenderState({baseLayer:p}),e.setPixelRatio(1),e.setSize(p.framebufferWidth,p.framebufferHeight,!1),g=new Gr(p.framebufferWidth,p.framebufferHeight,{format:En,type:Pi,colorSpace:e.outputColorSpace,stencilBuffer:m.stencil})}else{let ie=null,he=null,ce=null;m.depth&&(ce=m.stencil?n.DEPTH24_STENCIL8:n.DEPTH_COMPONENT24,ie=m.stencil?qs:ks,he=m.stencil?Ys:Vr);const De={colorFormat:n.RGBA8,depthFormat:ce,scaleFactor:s};h=new XRWebGLBinding(r,n),f=h.createProjectionLayer(De),r.updateRenderState({layers:[f]}),e.setPixelRatio(1),e.setSize(f.textureWidth,f.textureHeight,!1),g=new Gr(f.textureWidth,f.textureHeight,{format:En,type:Pi,depthTexture:new r_(f.textureWidth,f.textureHeight,he,void 0,void 0,void 0,void 0,void 0,void 0,ie),stencilBuffer:m.stencil,colorSpace:e.outputColorSpace,samples:m.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1})}g.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await r.requestReferenceSpace(o),Ie.setContext(r),Ie.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return y.getDepthTexture()};function q(j){for(let ie=0;ie<j.removed.length;ie++){const he=j.removed[ie],ce=S.indexOf(he);ce>=0&&(S[ce]=null,v[ce].disconnect(he))}for(let ie=0;ie<j.added.length;ie++){const he=j.added[ie];let ce=S.indexOf(he);if(ce===-1){for(let Ae=0;Ae<v.length;Ae++)if(Ae>=S.length){S.push(he),ce=Ae;break}else if(S[Ae]===null){S[Ae]=he,ce=Ae;break}if(ce===-1)break}const De=v[ce];De&&De.connect(he)}}const z=new N,J=new N;function L(j,ie,he){z.setFromMatrixPosition(ie.matrixWorld),J.setFromMatrixPosition(he.matrixWorld);const ce=z.distanceTo(J),De=ie.projectionMatrix.elements,Ae=he.projectionMatrix.elements,Ve=De[14]/(De[10]-1),nt=De[14]/(De[10]+1),Ge=(De[9]+1)/De[5],D=(De[9]-1)/De[5],pn=(De[8]-1)/De[0],Be=(Ae[8]+1)/Ae[0],$e=Ve*pn,Re=Ve*Be,ot=ce/(-pn+Be),Le=ot*-pn;if(ie.matrixWorld.decompose(j.position,j.quaternion,j.scale),j.translateX(Le),j.translateZ(ot),j.matrixWorld.compose(j.position,j.quaternion,j.scale),j.matrixWorldInverse.copy(j.matrixWorld).invert(),De[10]===-1)j.projectionMatrix.copy(ie.projectionMatrix),j.projectionMatrixInverse.copy(ie.projectionMatrixInverse);else{const R=Ve+ot,E=nt+ot,B=$e-Le,Z=Re+(ce-Le),ee=Ge*nt/E*R,K=D*nt/E*R;j.projectionMatrix.makePerspective(B,Z,ee,K,R,E),j.projectionMatrixInverse.copy(j.projectionMatrix).invert()}}function Y(j,ie){ie===null?j.matrixWorld.copy(j.matrix):j.matrixWorld.multiplyMatrices(ie.matrixWorld,j.matrix),j.matrixWorldInverse.copy(j.matrixWorld).invert()}this.updateCamera=function(j){if(r===null)return;let ie=j.near,he=j.far;y.texture!==null&&(y.depthNear>0&&(ie=y.depthNear),y.depthFar>0&&(he=y.depthFar)),x.near=P.near=A.near=ie,x.far=P.far=A.far=he,(w!==x.near||O!==x.far)&&(r.updateRenderState({depthNear:x.near,depthFar:x.far}),w=x.near,O=x.far);const ce=j.parent,De=x.cameras;Y(x,ce);for(let Ae=0;Ae<De.length;Ae++)Y(De[Ae],ce);De.length===2?L(x,A,P):x.projectionMatrix.copy(A.projectionMatrix),$(j,x,ce)};function $(j,ie,he){he===null?j.matrix.copy(ie.matrixWorld):(j.matrix.copy(he.matrixWorld),j.matrix.invert(),j.matrix.multiply(ie.matrixWorld)),j.matrix.decompose(j.position,j.quaternion,j.scale),j.updateMatrixWorld(!0),j.projectionMatrix.copy(ie.projectionMatrix),j.projectionMatrixInverse.copy(ie.projectionMatrixInverse),j.isPerspectiveCamera&&(j.fov=_h*2*Math.atan(1/j.projectionMatrix.elements[5]),j.zoom=1)}this.getCamera=function(){return x},this.getFoveation=function(){if(!(f===null&&p===null))return l},this.setFoveation=function(j){l=j,f!==null&&(f.fixedFoveation=j),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=j)},this.hasDepthSensing=function(){return y.texture!==null},this.getDepthSensingMesh=function(){return y.getMesh(x)};let ne=null;function ye(j,ie){if(u=ie.getViewerPose(c||a),_=ie,u!==null){const he=u.views;p!==null&&(e.setRenderTargetFramebuffer(g,p.framebuffer),e.setRenderTarget(g));let ce=!1;he.length!==x.cameras.length&&(x.cameras.length=0,ce=!0);for(let Ae=0;Ae<he.length;Ae++){const Ve=he[Ae];let nt=null;if(p!==null)nt=p.getViewport(Ve);else{const D=h.getViewSubImage(f,Ve);nt=D.viewport,Ae===0&&(e.setRenderTargetTextures(g,D.colorTexture,f.ignoreDepthValues?void 0:D.depthStencilTexture),e.setRenderTarget(g))}let Ge=V[Ae];Ge===void 0&&(Ge=new Sn,Ge.layers.enable(Ae),Ge.viewport=new _t,V[Ae]=Ge),Ge.matrix.fromArray(Ve.transform.matrix),Ge.matrix.decompose(Ge.position,Ge.quaternion,Ge.scale),Ge.projectionMatrix.fromArray(Ve.projectionMatrix),Ge.projectionMatrixInverse.copy(Ge.projectionMatrix).invert(),Ge.viewport.set(nt.x,nt.y,nt.width,nt.height),Ae===0&&(x.matrix.copy(Ge.matrix),x.matrix.decompose(x.position,x.quaternion,x.scale)),ce===!0&&x.cameras.push(Ge)}const De=r.enabledFeatures;if(De&&De.includes("depth-sensing")){const Ae=h.getDepthInformation(he[0]);Ae&&Ae.isValid&&Ae.texture&&y.init(e,Ae,r.renderState)}}for(let he=0;he<v.length;he++){const ce=S[he],De=v[he];ce!==null&&De!==void 0&&De.update(ce,ie,c||a)}ne&&ne(j,ie),ie.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:ie}),_=null}const Ie=new n_;Ie.setAnimationLoop(ye),this.setAnimationLoop=function(j){ne=j},this.dispose=function(){}}}const Sr=new Kn,JT=new Je;function eA(t,e){function n(m,d){m.matrixAutoUpdate===!0&&m.updateMatrix(),d.value.copy(m.matrix)}function i(m,d){d.color.getRGB(m.fogColor.value,Jv(t)),d.isFog?(m.fogNear.value=d.near,m.fogFar.value=d.far):d.isFogExp2&&(m.fogDensity.value=d.density)}function r(m,d,g,v,S){d.isMeshBasicMaterial||d.isMeshLambertMaterial?s(m,d):d.isMeshToonMaterial?(s(m,d),h(m,d)):d.isMeshPhongMaterial?(s(m,d),u(m,d)):d.isMeshStandardMaterial?(s(m,d),f(m,d),d.isMeshPhysicalMaterial&&p(m,d,S)):d.isMeshMatcapMaterial?(s(m,d),_(m,d)):d.isMeshDepthMaterial?s(m,d):d.isMeshDistanceMaterial?(s(m,d),y(m,d)):d.isMeshNormalMaterial?s(m,d):d.isLineBasicMaterial?(a(m,d),d.isLineDashedMaterial&&o(m,d)):d.isPointsMaterial?l(m,d,g,v):d.isSpriteMaterial?c(m,d):d.isShadowMaterial?(m.color.value.copy(d.color),m.opacity.value=d.opacity):d.isShaderMaterial&&(d.uniformsNeedUpdate=!1)}function s(m,d){m.opacity.value=d.opacity,d.color&&m.diffuse.value.copy(d.color),d.emissive&&m.emissive.value.copy(d.emissive).multiplyScalar(d.emissiveIntensity),d.map&&(m.map.value=d.map,n(d.map,m.mapTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,n(d.alphaMap,m.alphaMapTransform)),d.bumpMap&&(m.bumpMap.value=d.bumpMap,n(d.bumpMap,m.bumpMapTransform),m.bumpScale.value=d.bumpScale,d.side===Qt&&(m.bumpScale.value*=-1)),d.normalMap&&(m.normalMap.value=d.normalMap,n(d.normalMap,m.normalMapTransform),m.normalScale.value.copy(d.normalScale),d.side===Qt&&m.normalScale.value.negate()),d.displacementMap&&(m.displacementMap.value=d.displacementMap,n(d.displacementMap,m.displacementMapTransform),m.displacementScale.value=d.displacementScale,m.displacementBias.value=d.displacementBias),d.emissiveMap&&(m.emissiveMap.value=d.emissiveMap,n(d.emissiveMap,m.emissiveMapTransform)),d.specularMap&&(m.specularMap.value=d.specularMap,n(d.specularMap,m.specularMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest);const g=e.get(d),v=g.envMap,S=g.envMapRotation;v&&(m.envMap.value=v,Sr.copy(S),Sr.x*=-1,Sr.y*=-1,Sr.z*=-1,v.isCubeTexture&&v.isRenderTargetTexture===!1&&(Sr.y*=-1,Sr.z*=-1),m.envMapRotation.value.setFromMatrix4(JT.makeRotationFromEuler(Sr)),m.flipEnvMap.value=v.isCubeTexture&&v.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=d.reflectivity,m.ior.value=d.ior,m.refractionRatio.value=d.refractionRatio),d.lightMap&&(m.lightMap.value=d.lightMap,m.lightMapIntensity.value=d.lightMapIntensity,n(d.lightMap,m.lightMapTransform)),d.aoMap&&(m.aoMap.value=d.aoMap,m.aoMapIntensity.value=d.aoMapIntensity,n(d.aoMap,m.aoMapTransform))}function a(m,d){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,d.map&&(m.map.value=d.map,n(d.map,m.mapTransform))}function o(m,d){m.dashSize.value=d.dashSize,m.totalSize.value=d.dashSize+d.gapSize,m.scale.value=d.scale}function l(m,d,g,v){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,m.size.value=d.size*g,m.scale.value=v*.5,d.map&&(m.map.value=d.map,n(d.map,m.uvTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,n(d.alphaMap,m.alphaMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest)}function c(m,d){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,m.rotation.value=d.rotation,d.map&&(m.map.value=d.map,n(d.map,m.mapTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,n(d.alphaMap,m.alphaMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest)}function u(m,d){m.specular.value.copy(d.specular),m.shininess.value=Math.max(d.shininess,1e-4)}function h(m,d){d.gradientMap&&(m.gradientMap.value=d.gradientMap)}function f(m,d){m.metalness.value=d.metalness,d.metalnessMap&&(m.metalnessMap.value=d.metalnessMap,n(d.metalnessMap,m.metalnessMapTransform)),m.roughness.value=d.roughness,d.roughnessMap&&(m.roughnessMap.value=d.roughnessMap,n(d.roughnessMap,m.roughnessMapTransform)),d.envMap&&(m.envMapIntensity.value=d.envMapIntensity)}function p(m,d,g){m.ior.value=d.ior,d.sheen>0&&(m.sheenColor.value.copy(d.sheenColor).multiplyScalar(d.sheen),m.sheenRoughness.value=d.sheenRoughness,d.sheenColorMap&&(m.sheenColorMap.value=d.sheenColorMap,n(d.sheenColorMap,m.sheenColorMapTransform)),d.sheenRoughnessMap&&(m.sheenRoughnessMap.value=d.sheenRoughnessMap,n(d.sheenRoughnessMap,m.sheenRoughnessMapTransform))),d.clearcoat>0&&(m.clearcoat.value=d.clearcoat,m.clearcoatRoughness.value=d.clearcoatRoughness,d.clearcoatMap&&(m.clearcoatMap.value=d.clearcoatMap,n(d.clearcoatMap,m.clearcoatMapTransform)),d.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=d.clearcoatRoughnessMap,n(d.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),d.clearcoatNormalMap&&(m.clearcoatNormalMap.value=d.clearcoatNormalMap,n(d.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(d.clearcoatNormalScale),d.side===Qt&&m.clearcoatNormalScale.value.negate())),d.dispersion>0&&(m.dispersion.value=d.dispersion),d.iridescence>0&&(m.iridescence.value=d.iridescence,m.iridescenceIOR.value=d.iridescenceIOR,m.iridescenceThicknessMinimum.value=d.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=d.iridescenceThicknessRange[1],d.iridescenceMap&&(m.iridescenceMap.value=d.iridescenceMap,n(d.iridescenceMap,m.iridescenceMapTransform)),d.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=d.iridescenceThicknessMap,n(d.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),d.transmission>0&&(m.transmission.value=d.transmission,m.transmissionSamplerMap.value=g.texture,m.transmissionSamplerSize.value.set(g.width,g.height),d.transmissionMap&&(m.transmissionMap.value=d.transmissionMap,n(d.transmissionMap,m.transmissionMapTransform)),m.thickness.value=d.thickness,d.thicknessMap&&(m.thicknessMap.value=d.thicknessMap,n(d.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=d.attenuationDistance,m.attenuationColor.value.copy(d.attenuationColor)),d.anisotropy>0&&(m.anisotropyVector.value.set(d.anisotropy*Math.cos(d.anisotropyRotation),d.anisotropy*Math.sin(d.anisotropyRotation)),d.anisotropyMap&&(m.anisotropyMap.value=d.anisotropyMap,n(d.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=d.specularIntensity,m.specularColor.value.copy(d.specularColor),d.specularColorMap&&(m.specularColorMap.value=d.specularColorMap,n(d.specularColorMap,m.specularColorMapTransform)),d.specularIntensityMap&&(m.specularIntensityMap.value=d.specularIntensityMap,n(d.specularIntensityMap,m.specularIntensityMapTransform))}function _(m,d){d.matcap&&(m.matcap.value=d.matcap)}function y(m,d){const g=e.get(d).light;m.referencePosition.value.setFromMatrixPosition(g.matrixWorld),m.nearDistance.value=g.shadow.camera.near,m.farDistance.value=g.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:r}}function tA(t,e,n,i){let r={},s={},a=[];const o=t.getParameter(t.MAX_UNIFORM_BUFFER_BINDINGS);function l(g,v){const S=v.program;i.uniformBlockBinding(g,S)}function c(g,v){let S=r[g.id];S===void 0&&(_(g),S=u(g),r[g.id]=S,g.addEventListener("dispose",m));const b=v.program;i.updateUBOMapping(g,b);const C=e.render.frame;s[g.id]!==C&&(f(g),s[g.id]=C)}function u(g){const v=h();g.__bindingPointIndex=v;const S=t.createBuffer(),b=g.__size,C=g.usage;return t.bindBuffer(t.UNIFORM_BUFFER,S),t.bufferData(t.UNIFORM_BUFFER,b,C),t.bindBuffer(t.UNIFORM_BUFFER,null),t.bindBufferBase(t.UNIFORM_BUFFER,v,S),S}function h(){for(let g=0;g<o;g++)if(a.indexOf(g)===-1)return a.push(g),g;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function f(g){const v=r[g.id],S=g.uniforms,b=g.__cache;t.bindBuffer(t.UNIFORM_BUFFER,v);for(let C=0,A=S.length;C<A;C++){const P=Array.isArray(S[C])?S[C]:[S[C]];for(let V=0,x=P.length;V<x;V++){const w=P[V];if(p(w,C,V,b)===!0){const O=w.__offset,F=Array.isArray(w.value)?w.value:[w.value];let W=0;for(let q=0;q<F.length;q++){const z=F[q],J=y(z);typeof z=="number"||typeof z=="boolean"?(w.__data[0]=z,t.bufferSubData(t.UNIFORM_BUFFER,O+W,w.__data)):z.isMatrix3?(w.__data[0]=z.elements[0],w.__data[1]=z.elements[1],w.__data[2]=z.elements[2],w.__data[3]=0,w.__data[4]=z.elements[3],w.__data[5]=z.elements[4],w.__data[6]=z.elements[5],w.__data[7]=0,w.__data[8]=z.elements[6],w.__data[9]=z.elements[7],w.__data[10]=z.elements[8],w.__data[11]=0):(z.toArray(w.__data,W),W+=J.storage/Float32Array.BYTES_PER_ELEMENT)}t.bufferSubData(t.UNIFORM_BUFFER,O,w.__data)}}}t.bindBuffer(t.UNIFORM_BUFFER,null)}function p(g,v,S,b){const C=g.value,A=v+"_"+S;if(b[A]===void 0)return typeof C=="number"||typeof C=="boolean"?b[A]=C:b[A]=C.clone(),!0;{const P=b[A];if(typeof C=="number"||typeof C=="boolean"){if(P!==C)return b[A]=C,!0}else if(P.equals(C)===!1)return P.copy(C),!0}return!1}function _(g){const v=g.uniforms;let S=0;const b=16;for(let A=0,P=v.length;A<P;A++){const V=Array.isArray(v[A])?v[A]:[v[A]];for(let x=0,w=V.length;x<w;x++){const O=V[x],F=Array.isArray(O.value)?O.value:[O.value];for(let W=0,q=F.length;W<q;W++){const z=F[W],J=y(z),L=S%b,Y=L%J.boundary,$=L+Y;S+=Y,$!==0&&b-$<J.storage&&(S+=b-$),O.__data=new Float32Array(J.storage/Float32Array.BYTES_PER_ELEMENT),O.__offset=S,S+=J.storage}}}const C=S%b;return C>0&&(S+=b-C),g.__size=S,g.__cache={},this}function y(g){const v={boundary:0,storage:0};return typeof g=="number"||typeof g=="boolean"?(v.boundary=4,v.storage=4):g.isVector2?(v.boundary=8,v.storage=8):g.isVector3||g.isColor?(v.boundary=16,v.storage=12):g.isVector4?(v.boundary=16,v.storage=16):g.isMatrix3?(v.boundary=48,v.storage=48):g.isMatrix4?(v.boundary=64,v.storage=64):g.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",g),v}function m(g){const v=g.target;v.removeEventListener("dispose",m);const S=a.indexOf(v.__bindingPointIndex);a.splice(S,1),t.deleteBuffer(r[v.id]),delete r[v.id],delete s[v.id]}function d(){for(const g in r)t.deleteBuffer(r[g]);a=[],r={},s={}}return{bind:l,update:c,dispose:d}}class nA{constructor(e={}){const{canvas:n=GS(),context:i=null,depth:r=!0,stencil:s=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:h=!1}=e;this.isWebGLRenderer=!0;let f;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");f=i.getContextAttributes().alpha}else f=a;const p=new Uint32Array(4),_=new Int32Array(4);let y=null,m=null;const d=[],g=[];this.domElement=n,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=yn,this.toneMapping=ar,this.toneMappingExposure=1;const v=this;let S=!1,b=0,C=0,A=null,P=-1,V=null;const x=new _t,w=new _t;let O=null;const F=new Fe(0);let W=0,q=n.width,z=n.height,J=1,L=null,Y=null;const $=new _t(0,0,q,z),ne=new _t(0,0,q,z);let ye=!1;const Ie=new Lf;let j=!1,ie=!1;const he=new Je,ce=new Je,De=new N,Ae=new _t,Ve={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let nt=!1;function Ge(){return A===null?J:1}let D=i;function pn(T,U){return n.getContext(T,U)}try{const T={alpha:!0,depth:r,stencil:s,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:h};if("setAttribute"in n&&n.setAttribute("data-engine",`three.js r${xf}`),n.addEventListener("webglcontextlost",Q,!1),n.addEventListener("webglcontextrestored",ue,!1),n.addEventListener("webglcontextcreationerror",pe,!1),D===null){const U="webgl2";if(D=pn(U,T),D===null)throw pn(U)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(T){throw console.error("THREE.WebGLRenderer: "+T.message),T}let Be,$e,Re,ot,Le,R,E,B,Z,ee,K,Me,le,ge,Ye,se,ve,be,Pe,_e,He,Ne,st,I;function fe(){Be=new ow(D),Be.init(),Ne=new XT(D,Be),$e=new tw(D,Be,e,Ne),Re=new GT(D),$e.reverseDepthBuffer&&Re.buffers.depth.setReversed(!0),ot=new uw(D),Le=new RT,R=new jT(D,Be,Re,Le,$e,Ne,ot),E=new iw(v),B=new aw(v),Z=new vM(D),st=new J1(D,Z),ee=new lw(D,Z,ot,st),K=new hw(D,ee,Z,ot),Pe=new dw(D,$e,R),se=new nw(Le),Me=new CT(v,E,B,Be,$e,st,se),le=new eA(v,Le),ge=new PT,Ye=new kT(Be),be=new Q1(v,E,B,Re,K,f,l),ve=new HT(v,K,$e),I=new tA(D,ot,$e,Re),_e=new ew(D,Be,ot),He=new cw(D,Be,ot),ot.programs=Me.programs,v.capabilities=$e,v.extensions=Be,v.properties=Le,v.renderLists=ge,v.shadowMap=ve,v.state=Re,v.info=ot}fe();const X=new QT(v,D);this.xr=X,this.getContext=function(){return D},this.getContextAttributes=function(){return D.getContextAttributes()},this.forceContextLoss=function(){const T=Be.get("WEBGL_lose_context");T&&T.loseContext()},this.forceContextRestore=function(){const T=Be.get("WEBGL_lose_context");T&&T.restoreContext()},this.getPixelRatio=function(){return J},this.setPixelRatio=function(T){T!==void 0&&(J=T,this.setSize(q,z,!1))},this.getSize=function(T){return T.set(q,z)},this.setSize=function(T,U,H=!0){if(X.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}q=T,z=U,n.width=Math.floor(T*J),n.height=Math.floor(U*J),H===!0&&(n.style.width=T+"px",n.style.height=U+"px"),this.setViewport(0,0,T,U)},this.getDrawingBufferSize=function(T){return T.set(q*J,z*J).floor()},this.setDrawingBufferSize=function(T,U,H){q=T,z=U,J=H,n.width=Math.floor(T*H),n.height=Math.floor(U*H),this.setViewport(0,0,T,U)},this.getCurrentViewport=function(T){return T.copy(x)},this.getViewport=function(T){return T.copy($)},this.setViewport=function(T,U,H,G){T.isVector4?$.set(T.x,T.y,T.z,T.w):$.set(T,U,H,G),Re.viewport(x.copy($).multiplyScalar(J).round())},this.getScissor=function(T){return T.copy(ne)},this.setScissor=function(T,U,H,G){T.isVector4?ne.set(T.x,T.y,T.z,T.w):ne.set(T,U,H,G),Re.scissor(w.copy(ne).multiplyScalar(J).round())},this.getScissorTest=function(){return ye},this.setScissorTest=function(T){Re.setScissorTest(ye=T)},this.setOpaqueSort=function(T){L=T},this.setTransparentSort=function(T){Y=T},this.getClearColor=function(T){return T.copy(be.getClearColor())},this.setClearColor=function(){be.setClearColor.apply(be,arguments)},this.getClearAlpha=function(){return be.getClearAlpha()},this.setClearAlpha=function(){be.setClearAlpha.apply(be,arguments)},this.clear=function(T=!0,U=!0,H=!0){let G=0;if(T){let k=!1;if(A!==null){const ae=A.texture.format;k=ae===Cf||ae===Af||ae===Tf}if(k){const ae=A.texture.type,de=ae===Pi||ae===Vr||ae===Ja||ae===Ys||ae===Mf||ae===Ef,xe=be.getClearColor(),Se=be.getClearAlpha(),Te=xe.r,Ce=xe.g,Ee=xe.b;de?(p[0]=Te,p[1]=Ce,p[2]=Ee,p[3]=Se,D.clearBufferuiv(D.COLOR,0,p)):(_[0]=Te,_[1]=Ce,_[2]=Ee,_[3]=Se,D.clearBufferiv(D.COLOR,0,_))}else G|=D.COLOR_BUFFER_BIT}U&&(G|=D.DEPTH_BUFFER_BIT,D.clearDepth(this.capabilities.reverseDepthBuffer?0:1)),H&&(G|=D.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),D.clear(G)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){n.removeEventListener("webglcontextlost",Q,!1),n.removeEventListener("webglcontextrestored",ue,!1),n.removeEventListener("webglcontextcreationerror",pe,!1),ge.dispose(),Ye.dispose(),Le.dispose(),E.dispose(),B.dispose(),K.dispose(),st.dispose(),I.dispose(),Me.dispose(),X.dispose(),X.removeEventListener("sessionstart",Of),X.removeEventListener("sessionend",zf),mr.stop()};function Q(T){T.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),S=!0}function ue(){console.log("THREE.WebGLRenderer: Context Restored."),S=!1;const T=ot.autoReset,U=ve.enabled,H=ve.autoUpdate,G=ve.needsUpdate,k=ve.type;fe(),ot.autoReset=T,ve.enabled=U,ve.autoUpdate=H,ve.needsUpdate=G,ve.type=k}function pe(T){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",T.statusMessage)}function We(T){const U=T.target;U.removeEventListener("dispose",We),Mt(U)}function Mt(T){nn(T),Le.remove(T)}function nn(T){const U=Le.get(T).programs;U!==void 0&&(U.forEach(function(H){Me.releaseProgram(H)}),T.isShaderMaterial&&Me.releaseShaderCache(T))}this.renderBufferDirect=function(T,U,H,G,k,ae){U===null&&(U=Ve);const de=k.isMesh&&k.matrixWorld.determinant()<0,xe=E_(T,U,H,G,k);Re.setMaterial(G,de);let Se=H.index,Te=1;if(G.wireframe===!0){if(Se=ee.getWireframeAttribute(H),Se===void 0)return;Te=2}const Ce=H.drawRange,Ee=H.attributes.position;let et=Ce.start*Te,lt=(Ce.start+Ce.count)*Te;ae!==null&&(et=Math.max(et,ae.start*Te),lt=Math.min(lt,(ae.start+ae.count)*Te)),Se!==null?(et=Math.max(et,0),lt=Math.min(lt,Se.count)):Ee!=null&&(et=Math.max(et,0),lt=Math.min(lt,Ee.count));const gt=lt-et;if(gt<0||gt===1/0)return;st.setup(k,G,xe,H,Se);let mn,Ke=_e;if(Se!==null&&(mn=Z.get(Se),Ke=He,Ke.setIndex(mn)),k.isMesh)G.wireframe===!0?(Re.setLineWidth(G.wireframeLinewidth*Ge()),Ke.setMode(D.LINES)):Ke.setMode(D.TRIANGLES);else if(k.isLine){let we=G.linewidth;we===void 0&&(we=1),Re.setLineWidth(we*Ge()),k.isLineSegments?Ke.setMode(D.LINES):k.isLineLoop?Ke.setMode(D.LINE_LOOP):Ke.setMode(D.LINE_STRIP)}else k.isPoints?Ke.setMode(D.POINTS):k.isSprite&&Ke.setMode(D.TRIANGLES);if(k.isBatchedMesh)if(k._multiDrawInstances!==null)Ke.renderMultiDrawInstances(k._multiDrawStarts,k._multiDrawCounts,k._multiDrawCount,k._multiDrawInstances);else if(Be.get("WEBGL_multi_draw"))Ke.renderMultiDraw(k._multiDrawStarts,k._multiDrawCounts,k._multiDrawCount);else{const we=k._multiDrawStarts,Ft=k._multiDrawCounts,Ze=k._multiDrawCount,Fn=Se?Z.get(Se).bytesPerElement:1,qr=Le.get(G).currentProgram.getUniforms();for(let gn=0;gn<Ze;gn++)qr.setValue(D,"_gl_DrawID",gn),Ke.render(we[gn]/Fn,Ft[gn])}else if(k.isInstancedMesh)Ke.renderInstances(et,gt,k.count);else if(H.isInstancedBufferGeometry){const we=H._maxInstanceCount!==void 0?H._maxInstanceCount:1/0,Ft=Math.min(H.instanceCount,we);Ke.renderInstances(et,gt,Ft)}else Ke.render(et,gt)};function qe(T,U,H){T.transparent===!0&&T.side===ln&&T.forceSinglePass===!1?(T.side=Qt,T.needsUpdate=!0,uo(T,U,H),T.side=cr,T.needsUpdate=!0,uo(T,U,H),T.side=ln):uo(T,U,H)}this.compile=function(T,U,H=null){H===null&&(H=T),m=Ye.get(H),m.init(U),g.push(m),H.traverseVisible(function(k){k.isLight&&k.layers.test(U.layers)&&(m.pushLight(k),k.castShadow&&m.pushShadow(k))}),T!==H&&T.traverseVisible(function(k){k.isLight&&k.layers.test(U.layers)&&(m.pushLight(k),k.castShadow&&m.pushShadow(k))}),m.setupLights();const G=new Set;return T.traverse(function(k){if(!(k.isMesh||k.isPoints||k.isLine||k.isSprite))return;const ae=k.material;if(ae)if(Array.isArray(ae))for(let de=0;de<ae.length;de++){const xe=ae[de];qe(xe,H,k),G.add(xe)}else qe(ae,H,k),G.add(ae)}),g.pop(),m=null,G},this.compileAsync=function(T,U,H=null){const G=this.compile(T,U,H);return new Promise(k=>{function ae(){if(G.forEach(function(de){Le.get(de).currentProgram.isReady()&&G.delete(de)}),G.size===0){k(T);return}setTimeout(ae,10)}Be.get("KHR_parallel_shader_compile")!==null?ae():setTimeout(ae,10)})};let rn=null;function oi(T){rn&&rn(T)}function Of(){mr.stop()}function zf(){mr.start()}const mr=new n_;mr.setAnimationLoop(oi),typeof self<"u"&&mr.setContext(self),this.setAnimationLoop=function(T){rn=T,X.setAnimationLoop(T),T===null?mr.stop():mr.start()},X.addEventListener("sessionstart",Of),X.addEventListener("sessionend",zf),this.render=function(T,U){if(U!==void 0&&U.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(S===!0)return;if(T.matrixWorldAutoUpdate===!0&&T.updateMatrixWorld(),U.parent===null&&U.matrixWorldAutoUpdate===!0&&U.updateMatrixWorld(),X.enabled===!0&&X.isPresenting===!0&&(X.cameraAutoUpdate===!0&&X.updateCamera(U),U=X.getCamera()),T.isScene===!0&&T.onBeforeRender(v,T,U,A),m=Ye.get(T,g.length),m.init(U),g.push(m),ce.multiplyMatrices(U.projectionMatrix,U.matrixWorldInverse),Ie.setFromProjectionMatrix(ce),ie=this.localClippingEnabled,j=se.init(this.clippingPlanes,ie),y=ge.get(T,d.length),y.init(),d.push(y),X.enabled===!0&&X.isPresenting===!0){const ae=v.xr.getDepthSensingMesh();ae!==null&&Rc(ae,U,-1/0,v.sortObjects)}Rc(T,U,0,v.sortObjects),y.finish(),v.sortObjects===!0&&y.sort(L,Y),nt=X.enabled===!1||X.isPresenting===!1||X.hasDepthSensing()===!1,nt&&be.addToRenderList(y,T),this.info.render.frame++,j===!0&&se.beginShadows();const H=m.state.shadowsArray;ve.render(H,T,U),j===!0&&se.endShadows(),this.info.autoReset===!0&&this.info.reset();const G=y.opaque,k=y.transmissive;if(m.setupLights(),U.isArrayCamera){const ae=U.cameras;if(k.length>0)for(let de=0,xe=ae.length;de<xe;de++){const Se=ae[de];Hf(G,k,T,Se)}nt&&be.render(T);for(let de=0,xe=ae.length;de<xe;de++){const Se=ae[de];Bf(y,T,Se,Se.viewport)}}else k.length>0&&Hf(G,k,T,U),nt&&be.render(T),Bf(y,T,U);A!==null&&(R.updateMultisampleRenderTarget(A),R.updateRenderTargetMipmap(A)),T.isScene===!0&&T.onAfterRender(v,T,U),st.resetDefaultState(),P=-1,V=null,g.pop(),g.length>0?(m=g[g.length-1],j===!0&&se.setGlobalState(v.clippingPlanes,m.state.camera)):m=null,d.pop(),d.length>0?y=d[d.length-1]:y=null};function Rc(T,U,H,G){if(T.visible===!1)return;if(T.layers.test(U.layers)){if(T.isGroup)H=T.renderOrder;else if(T.isLOD)T.autoUpdate===!0&&T.update(U);else if(T.isLight)m.pushLight(T),T.castShadow&&m.pushShadow(T);else if(T.isSprite){if(!T.frustumCulled||Ie.intersectsSprite(T)){G&&Ae.setFromMatrixPosition(T.matrixWorld).applyMatrix4(ce);const de=K.update(T),xe=T.material;xe.visible&&y.push(T,de,xe,H,Ae.z,null)}}else if((T.isMesh||T.isLine||T.isPoints)&&(!T.frustumCulled||Ie.intersectsObject(T))){const de=K.update(T),xe=T.material;if(G&&(T.boundingSphere!==void 0?(T.boundingSphere===null&&T.computeBoundingSphere(),Ae.copy(T.boundingSphere.center)):(de.boundingSphere===null&&de.computeBoundingSphere(),Ae.copy(de.boundingSphere.center)),Ae.applyMatrix4(T.matrixWorld).applyMatrix4(ce)),Array.isArray(xe)){const Se=de.groups;for(let Te=0,Ce=Se.length;Te<Ce;Te++){const Ee=Se[Te],et=xe[Ee.materialIndex];et&&et.visible&&y.push(T,de,et,H,Ae.z,Ee)}}else xe.visible&&y.push(T,de,xe,H,Ae.z,null)}}const ae=T.children;for(let de=0,xe=ae.length;de<xe;de++)Rc(ae[de],U,H,G)}function Bf(T,U,H,G){const k=T.opaque,ae=T.transmissive,de=T.transparent;m.setupLightsView(H),j===!0&&se.setGlobalState(v.clippingPlanes,H),G&&Re.viewport(x.copy(G)),k.length>0&&co(k,U,H),ae.length>0&&co(ae,U,H),de.length>0&&co(de,U,H),Re.buffers.depth.setTest(!0),Re.buffers.depth.setMask(!0),Re.buffers.color.setMask(!0),Re.setPolygonOffset(!1)}function Hf(T,U,H,G){if((H.isScene===!0?H.overrideMaterial:null)!==null)return;m.state.transmissionRenderTarget[G.id]===void 0&&(m.state.transmissionRenderTarget[G.id]=new Gr(1,1,{generateMipmaps:!0,type:Be.has("EXT_color_buffer_half_float")||Be.has("EXT_color_buffer_float")?ao:Pi,minFilter:yi,samples:4,stencilBuffer:s,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Qe.workingColorSpace}));const ae=m.state.transmissionRenderTarget[G.id],de=G.viewport||x;ae.setSize(de.z,de.w);const xe=v.getRenderTarget();v.setRenderTarget(ae),v.getClearColor(F),W=v.getClearAlpha(),W<1&&v.setClearColor(16777215,.5),v.clear(),nt&&be.render(H);const Se=v.toneMapping;v.toneMapping=ar;const Te=G.viewport;if(G.viewport!==void 0&&(G.viewport=void 0),m.setupLightsView(G),j===!0&&se.setGlobalState(v.clippingPlanes,G),co(T,H,G),R.updateMultisampleRenderTarget(ae),R.updateRenderTargetMipmap(ae),Be.has("WEBGL_multisampled_render_to_texture")===!1){let Ce=!1;for(let Ee=0,et=U.length;Ee<et;Ee++){const lt=U[Ee],gt=lt.object,mn=lt.geometry,Ke=lt.material,we=lt.group;if(Ke.side===ln&&gt.layers.test(G.layers)){const Ft=Ke.side;Ke.side=Qt,Ke.needsUpdate=!0,Vf(gt,H,G,mn,Ke,we),Ke.side=Ft,Ke.needsUpdate=!0,Ce=!0}}Ce===!0&&(R.updateMultisampleRenderTarget(ae),R.updateRenderTargetMipmap(ae))}v.setRenderTarget(xe),v.setClearColor(F,W),Te!==void 0&&(G.viewport=Te),v.toneMapping=Se}function co(T,U,H){const G=U.isScene===!0?U.overrideMaterial:null;for(let k=0,ae=T.length;k<ae;k++){const de=T[k],xe=de.object,Se=de.geometry,Te=G===null?de.material:G,Ce=de.group;xe.layers.test(H.layers)&&Vf(xe,U,H,Se,Te,Ce)}}function Vf(T,U,H,G,k,ae){T.onBeforeRender(v,U,H,G,k,ae),T.modelViewMatrix.multiplyMatrices(H.matrixWorldInverse,T.matrixWorld),T.normalMatrix.getNormalMatrix(T.modelViewMatrix),k.onBeforeRender(v,U,H,G,T,ae),k.transparent===!0&&k.side===ln&&k.forceSinglePass===!1?(k.side=Qt,k.needsUpdate=!0,v.renderBufferDirect(H,U,G,k,T,ae),k.side=cr,k.needsUpdate=!0,v.renderBufferDirect(H,U,G,k,T,ae),k.side=ln):v.renderBufferDirect(H,U,G,k,T,ae),T.onAfterRender(v,U,H,G,k,ae)}function uo(T,U,H){U.isScene!==!0&&(U=Ve);const G=Le.get(T),k=m.state.lights,ae=m.state.shadowsArray,de=k.state.version,xe=Me.getParameters(T,k.state,ae,U,H),Se=Me.getProgramCacheKey(xe);let Te=G.programs;G.environment=T.isMeshStandardMaterial?U.environment:null,G.fog=U.fog,G.envMap=(T.isMeshStandardMaterial?B:E).get(T.envMap||G.environment),G.envMapRotation=G.environment!==null&&T.envMap===null?U.environmentRotation:T.envMapRotation,Te===void 0&&(T.addEventListener("dispose",We),Te=new Map,G.programs=Te);let Ce=Te.get(Se);if(Ce!==void 0){if(G.currentProgram===Ce&&G.lightsStateVersion===de)return Wf(T,xe),Ce}else xe.uniforms=Me.getUniforms(T),T.onBeforeCompile(xe,v),Ce=Me.acquireProgram(xe,Se),Te.set(Se,Ce),G.uniforms=xe.uniforms;const Ee=G.uniforms;return(!T.isShaderMaterial&&!T.isRawShaderMaterial||T.clipping===!0)&&(Ee.clippingPlanes=se.uniform),Wf(T,xe),G.needsLights=T_(T),G.lightsStateVersion=de,G.needsLights&&(Ee.ambientLightColor.value=k.state.ambient,Ee.lightProbe.value=k.state.probe,Ee.directionalLights.value=k.state.directional,Ee.directionalLightShadows.value=k.state.directionalShadow,Ee.spotLights.value=k.state.spot,Ee.spotLightShadows.value=k.state.spotShadow,Ee.rectAreaLights.value=k.state.rectArea,Ee.ltc_1.value=k.state.rectAreaLTC1,Ee.ltc_2.value=k.state.rectAreaLTC2,Ee.pointLights.value=k.state.point,Ee.pointLightShadows.value=k.state.pointShadow,Ee.hemisphereLights.value=k.state.hemi,Ee.directionalShadowMap.value=k.state.directionalShadowMap,Ee.directionalShadowMatrix.value=k.state.directionalShadowMatrix,Ee.spotShadowMap.value=k.state.spotShadowMap,Ee.spotLightMatrix.value=k.state.spotLightMatrix,Ee.spotLightMap.value=k.state.spotLightMap,Ee.pointShadowMap.value=k.state.pointShadowMap,Ee.pointShadowMatrix.value=k.state.pointShadowMatrix),G.currentProgram=Ce,G.uniformsList=null,Ce}function Gf(T){if(T.uniformsList===null){const U=T.currentProgram.getUniforms();T.uniformsList=Sl.seqWithValue(U.seq,T.uniforms)}return T.uniformsList}function Wf(T,U){const H=Le.get(T);H.outputColorSpace=U.outputColorSpace,H.batching=U.batching,H.batchingColor=U.batchingColor,H.instancing=U.instancing,H.instancingColor=U.instancingColor,H.instancingMorph=U.instancingMorph,H.skinning=U.skinning,H.morphTargets=U.morphTargets,H.morphNormals=U.morphNormals,H.morphColors=U.morphColors,H.morphTargetsCount=U.morphTargetsCount,H.numClippingPlanes=U.numClippingPlanes,H.numIntersection=U.numClipIntersection,H.vertexAlphas=U.vertexAlphas,H.vertexTangents=U.vertexTangents,H.toneMapping=U.toneMapping}function E_(T,U,H,G,k){U.isScene!==!0&&(U=Ve),R.resetTextureUnits();const ae=U.fog,de=G.isMeshStandardMaterial?U.environment:null,xe=A===null?v.outputColorSpace:A.isXRRenderTarget===!0?A.texture.colorSpace:fr,Se=(G.isMeshStandardMaterial?B:E).get(G.envMap||de),Te=G.vertexColors===!0&&!!H.attributes.color&&H.attributes.color.itemSize===4,Ce=!!H.attributes.tangent&&(!!G.normalMap||G.anisotropy>0),Ee=!!H.morphAttributes.position,et=!!H.morphAttributes.normal,lt=!!H.morphAttributes.color;let gt=ar;G.toneMapped&&(A===null||A.isXRRenderTarget===!0)&&(gt=v.toneMapping);const mn=H.morphAttributes.position||H.morphAttributes.normal||H.morphAttributes.color,Ke=mn!==void 0?mn.length:0,we=Le.get(G),Ft=m.state.lights;if(j===!0&&(ie===!0||T!==V)){const Rn=T===V&&G.id===P;se.setState(G,T,Rn)}let Ze=!1;G.version===we.__version?(we.needsLights&&we.lightsStateVersion!==Ft.state.version||we.outputColorSpace!==xe||k.isBatchedMesh&&we.batching===!1||!k.isBatchedMesh&&we.batching===!0||k.isBatchedMesh&&we.batchingColor===!0&&k.colorTexture===null||k.isBatchedMesh&&we.batchingColor===!1&&k.colorTexture!==null||k.isInstancedMesh&&we.instancing===!1||!k.isInstancedMesh&&we.instancing===!0||k.isSkinnedMesh&&we.skinning===!1||!k.isSkinnedMesh&&we.skinning===!0||k.isInstancedMesh&&we.instancingColor===!0&&k.instanceColor===null||k.isInstancedMesh&&we.instancingColor===!1&&k.instanceColor!==null||k.isInstancedMesh&&we.instancingMorph===!0&&k.morphTexture===null||k.isInstancedMesh&&we.instancingMorph===!1&&k.morphTexture!==null||we.envMap!==Se||G.fog===!0&&we.fog!==ae||we.numClippingPlanes!==void 0&&(we.numClippingPlanes!==se.numPlanes||we.numIntersection!==se.numIntersection)||we.vertexAlphas!==Te||we.vertexTangents!==Ce||we.morphTargets!==Ee||we.morphNormals!==et||we.morphColors!==lt||we.toneMapping!==gt||we.morphTargetsCount!==Ke)&&(Ze=!0):(Ze=!0,we.__version=G.version);let Fn=we.currentProgram;Ze===!0&&(Fn=uo(G,U,k));let qr=!1,gn=!1,bc=!1;const xt=Fn.getUniforms(),Ni=we.uniforms;if(Re.useProgram(Fn.program)&&(qr=!0,gn=!0,bc=!0),G.id!==P&&(P=G.id,gn=!0),qr||V!==T){$e.reverseDepthBuffer?(he.copy(T.projectionMatrix),jS(he),XS(he),xt.setValue(D,"projectionMatrix",he)):xt.setValue(D,"projectionMatrix",T.projectionMatrix),xt.setValue(D,"viewMatrix",T.matrixWorldInverse);const Rn=xt.map.cameraPosition;Rn!==void 0&&Rn.setValue(D,De.setFromMatrixPosition(T.matrixWorld)),$e.logarithmicDepthBuffer&&xt.setValue(D,"logDepthBufFC",2/(Math.log(T.far+1)/Math.LN2)),(G.isMeshPhongMaterial||G.isMeshToonMaterial||G.isMeshLambertMaterial||G.isMeshBasicMaterial||G.isMeshStandardMaterial||G.isShaderMaterial)&&xt.setValue(D,"isOrthographic",T.isOrthographicCamera===!0),V!==T&&(V=T,gn=!0,bc=!0)}if(k.isSkinnedMesh){xt.setOptional(D,k,"bindMatrix"),xt.setOptional(D,k,"bindMatrixInverse");const Rn=k.skeleton;Rn&&(Rn.boneTexture===null&&Rn.computeBoneTexture(),xt.setValue(D,"boneTexture",Rn.boneTexture,R))}k.isBatchedMesh&&(xt.setOptional(D,k,"batchingTexture"),xt.setValue(D,"batchingTexture",k._matricesTexture,R),xt.setOptional(D,k,"batchingIdTexture"),xt.setValue(D,"batchingIdTexture",k._indirectTexture,R),xt.setOptional(D,k,"batchingColorTexture"),k._colorsTexture!==null&&xt.setValue(D,"batchingColorTexture",k._colorsTexture,R));const Pc=H.morphAttributes;if((Pc.position!==void 0||Pc.normal!==void 0||Pc.color!==void 0)&&Pe.update(k,H,Fn),(gn||we.receiveShadow!==k.receiveShadow)&&(we.receiveShadow=k.receiveShadow,xt.setValue(D,"receiveShadow",k.receiveShadow)),G.isMeshGouraudMaterial&&G.envMap!==null&&(Ni.envMap.value=Se,Ni.flipEnvMap.value=Se.isCubeTexture&&Se.isRenderTargetTexture===!1?-1:1),G.isMeshStandardMaterial&&G.envMap===null&&U.environment!==null&&(Ni.envMapIntensity.value=U.environmentIntensity),gn&&(xt.setValue(D,"toneMappingExposure",v.toneMappingExposure),we.needsLights&&w_(Ni,bc),ae&&G.fog===!0&&le.refreshFogUniforms(Ni,ae),le.refreshMaterialUniforms(Ni,G,J,z,m.state.transmissionRenderTarget[T.id]),Sl.upload(D,Gf(we),Ni,R)),G.isShaderMaterial&&G.uniformsNeedUpdate===!0&&(Sl.upload(D,Gf(we),Ni,R),G.uniformsNeedUpdate=!1),G.isSpriteMaterial&&xt.setValue(D,"center",k.center),xt.setValue(D,"modelViewMatrix",k.modelViewMatrix),xt.setValue(D,"normalMatrix",k.normalMatrix),xt.setValue(D,"modelMatrix",k.matrixWorld),G.isShaderMaterial||G.isRawShaderMaterial){const Rn=G.uniformsGroups;for(let Lc=0,A_=Rn.length;Lc<A_;Lc++){const jf=Rn[Lc];I.update(jf,Fn),I.bind(jf,Fn)}}return Fn}function w_(T,U){T.ambientLightColor.needsUpdate=U,T.lightProbe.needsUpdate=U,T.directionalLights.needsUpdate=U,T.directionalLightShadows.needsUpdate=U,T.pointLights.needsUpdate=U,T.pointLightShadows.needsUpdate=U,T.spotLights.needsUpdate=U,T.spotLightShadows.needsUpdate=U,T.rectAreaLights.needsUpdate=U,T.hemisphereLights.needsUpdate=U}function T_(T){return T.isMeshLambertMaterial||T.isMeshToonMaterial||T.isMeshPhongMaterial||T.isMeshStandardMaterial||T.isShadowMaterial||T.isShaderMaterial&&T.lights===!0}this.getActiveCubeFace=function(){return b},this.getActiveMipmapLevel=function(){return C},this.getRenderTarget=function(){return A},this.setRenderTargetTextures=function(T,U,H){Le.get(T.texture).__webglTexture=U,Le.get(T.depthTexture).__webglTexture=H;const G=Le.get(T);G.__hasExternalTextures=!0,G.__autoAllocateDepthBuffer=H===void 0,G.__autoAllocateDepthBuffer||Be.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),G.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(T,U){const H=Le.get(T);H.__webglFramebuffer=U,H.__useDefaultFramebuffer=U===void 0},this.setRenderTarget=function(T,U=0,H=0){A=T,b=U,C=H;let G=!0,k=null,ae=!1,de=!1;if(T){const Se=Le.get(T);if(Se.__useDefaultFramebuffer!==void 0)Re.bindFramebuffer(D.FRAMEBUFFER,null),G=!1;else if(Se.__webglFramebuffer===void 0)R.setupRenderTarget(T);else if(Se.__hasExternalTextures)R.rebindTextures(T,Le.get(T.texture).__webglTexture,Le.get(T.depthTexture).__webglTexture);else if(T.depthBuffer){const Ee=T.depthTexture;if(Se.__boundDepthTexture!==Ee){if(Ee!==null&&Le.has(Ee)&&(T.width!==Ee.image.width||T.height!==Ee.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");R.setupDepthRenderbuffer(T)}}const Te=T.texture;(Te.isData3DTexture||Te.isDataArrayTexture||Te.isCompressedArrayTexture)&&(de=!0);const Ce=Le.get(T).__webglFramebuffer;T.isWebGLCubeRenderTarget?(Array.isArray(Ce[U])?k=Ce[U][H]:k=Ce[U],ae=!0):T.samples>0&&R.useMultisampledRTT(T)===!1?k=Le.get(T).__webglMultisampledFramebuffer:Array.isArray(Ce)?k=Ce[H]:k=Ce,x.copy(T.viewport),w.copy(T.scissor),O=T.scissorTest}else x.copy($).multiplyScalar(J).floor(),w.copy(ne).multiplyScalar(J).floor(),O=ye;if(Re.bindFramebuffer(D.FRAMEBUFFER,k)&&G&&Re.drawBuffers(T,k),Re.viewport(x),Re.scissor(w),Re.setScissorTest(O),ae){const Se=Le.get(T.texture);D.framebufferTexture2D(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_CUBE_MAP_POSITIVE_X+U,Se.__webglTexture,H)}else if(de){const Se=Le.get(T.texture),Te=U||0;D.framebufferTextureLayer(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0,Se.__webglTexture,H||0,Te)}P=-1},this.readRenderTargetPixels=function(T,U,H,G,k,ae,de){if(!(T&&T.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let xe=Le.get(T).__webglFramebuffer;if(T.isWebGLCubeRenderTarget&&de!==void 0&&(xe=xe[de]),xe){Re.bindFramebuffer(D.FRAMEBUFFER,xe);try{const Se=T.texture,Te=Se.format,Ce=Se.type;if(!$e.textureFormatReadable(Te)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!$e.textureTypeReadable(Ce)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}U>=0&&U<=T.width-G&&H>=0&&H<=T.height-k&&D.readPixels(U,H,G,k,Ne.convert(Te),Ne.convert(Ce),ae)}finally{const Se=A!==null?Le.get(A).__webglFramebuffer:null;Re.bindFramebuffer(D.FRAMEBUFFER,Se)}}},this.readRenderTargetPixelsAsync=async function(T,U,H,G,k,ae,de){if(!(T&&T.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let xe=Le.get(T).__webglFramebuffer;if(T.isWebGLCubeRenderTarget&&de!==void 0&&(xe=xe[de]),xe){const Se=T.texture,Te=Se.format,Ce=Se.type;if(!$e.textureFormatReadable(Te))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!$e.textureTypeReadable(Ce))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(U>=0&&U<=T.width-G&&H>=0&&H<=T.height-k){Re.bindFramebuffer(D.FRAMEBUFFER,xe);const Ee=D.createBuffer();D.bindBuffer(D.PIXEL_PACK_BUFFER,Ee),D.bufferData(D.PIXEL_PACK_BUFFER,ae.byteLength,D.STREAM_READ),D.readPixels(U,H,G,k,Ne.convert(Te),Ne.convert(Ce),0);const et=A!==null?Le.get(A).__webglFramebuffer:null;Re.bindFramebuffer(D.FRAMEBUFFER,et);const lt=D.fenceSync(D.SYNC_GPU_COMMANDS_COMPLETE,0);return D.flush(),await WS(D,lt,4),D.bindBuffer(D.PIXEL_PACK_BUFFER,Ee),D.getBufferSubData(D.PIXEL_PACK_BUFFER,0,ae),D.deleteBuffer(Ee),D.deleteSync(lt),ae}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(T,U=null,H=0){T.isTexture!==!0&&(yl("WebGLRenderer: copyFramebufferToTexture function signature has changed."),U=arguments[0]||null,T=arguments[1]);const G=Math.pow(2,-H),k=Math.floor(T.image.width*G),ae=Math.floor(T.image.height*G),de=U!==null?U.x:0,xe=U!==null?U.y:0;R.setTexture2D(T,0),D.copyTexSubImage2D(D.TEXTURE_2D,H,0,0,de,xe,k,ae),Re.unbindTexture()},this.copyTextureToTexture=function(T,U,H=null,G=null,k=0){T.isTexture!==!0&&(yl("WebGLRenderer: copyTextureToTexture function signature has changed."),G=arguments[0]||null,T=arguments[1],U=arguments[2],k=arguments[3]||0,H=null);let ae,de,xe,Se,Te,Ce;H!==null?(ae=H.max.x-H.min.x,de=H.max.y-H.min.y,xe=H.min.x,Se=H.min.y):(ae=T.image.width,de=T.image.height,xe=0,Se=0),G!==null?(Te=G.x,Ce=G.y):(Te=0,Ce=0);const Ee=Ne.convert(U.format),et=Ne.convert(U.type);R.setTexture2D(U,0),D.pixelStorei(D.UNPACK_FLIP_Y_WEBGL,U.flipY),D.pixelStorei(D.UNPACK_PREMULTIPLY_ALPHA_WEBGL,U.premultiplyAlpha),D.pixelStorei(D.UNPACK_ALIGNMENT,U.unpackAlignment);const lt=D.getParameter(D.UNPACK_ROW_LENGTH),gt=D.getParameter(D.UNPACK_IMAGE_HEIGHT),mn=D.getParameter(D.UNPACK_SKIP_PIXELS),Ke=D.getParameter(D.UNPACK_SKIP_ROWS),we=D.getParameter(D.UNPACK_SKIP_IMAGES),Ft=T.isCompressedTexture?T.mipmaps[k]:T.image;D.pixelStorei(D.UNPACK_ROW_LENGTH,Ft.width),D.pixelStorei(D.UNPACK_IMAGE_HEIGHT,Ft.height),D.pixelStorei(D.UNPACK_SKIP_PIXELS,xe),D.pixelStorei(D.UNPACK_SKIP_ROWS,Se),T.isDataTexture?D.texSubImage2D(D.TEXTURE_2D,k,Te,Ce,ae,de,Ee,et,Ft.data):T.isCompressedTexture?D.compressedTexSubImage2D(D.TEXTURE_2D,k,Te,Ce,Ft.width,Ft.height,Ee,Ft.data):D.texSubImage2D(D.TEXTURE_2D,k,Te,Ce,ae,de,Ee,et,Ft),D.pixelStorei(D.UNPACK_ROW_LENGTH,lt),D.pixelStorei(D.UNPACK_IMAGE_HEIGHT,gt),D.pixelStorei(D.UNPACK_SKIP_PIXELS,mn),D.pixelStorei(D.UNPACK_SKIP_ROWS,Ke),D.pixelStorei(D.UNPACK_SKIP_IMAGES,we),k===0&&U.generateMipmaps&&D.generateMipmap(D.TEXTURE_2D),Re.unbindTexture()},this.copyTextureToTexture3D=function(T,U,H=null,G=null,k=0){T.isTexture!==!0&&(yl("WebGLRenderer: copyTextureToTexture3D function signature has changed."),H=arguments[0]||null,G=arguments[1]||null,T=arguments[2],U=arguments[3],k=arguments[4]||0);let ae,de,xe,Se,Te,Ce,Ee,et,lt;const gt=T.isCompressedTexture?T.mipmaps[k]:T.image;H!==null?(ae=H.max.x-H.min.x,de=H.max.y-H.min.y,xe=H.max.z-H.min.z,Se=H.min.x,Te=H.min.y,Ce=H.min.z):(ae=gt.width,de=gt.height,xe=gt.depth,Se=0,Te=0,Ce=0),G!==null?(Ee=G.x,et=G.y,lt=G.z):(Ee=0,et=0,lt=0);const mn=Ne.convert(U.format),Ke=Ne.convert(U.type);let we;if(U.isData3DTexture)R.setTexture3D(U,0),we=D.TEXTURE_3D;else if(U.isDataArrayTexture||U.isCompressedArrayTexture)R.setTexture2DArray(U,0),we=D.TEXTURE_2D_ARRAY;else{console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");return}D.pixelStorei(D.UNPACK_FLIP_Y_WEBGL,U.flipY),D.pixelStorei(D.UNPACK_PREMULTIPLY_ALPHA_WEBGL,U.premultiplyAlpha),D.pixelStorei(D.UNPACK_ALIGNMENT,U.unpackAlignment);const Ft=D.getParameter(D.UNPACK_ROW_LENGTH),Ze=D.getParameter(D.UNPACK_IMAGE_HEIGHT),Fn=D.getParameter(D.UNPACK_SKIP_PIXELS),qr=D.getParameter(D.UNPACK_SKIP_ROWS),gn=D.getParameter(D.UNPACK_SKIP_IMAGES);D.pixelStorei(D.UNPACK_ROW_LENGTH,gt.width),D.pixelStorei(D.UNPACK_IMAGE_HEIGHT,gt.height),D.pixelStorei(D.UNPACK_SKIP_PIXELS,Se),D.pixelStorei(D.UNPACK_SKIP_ROWS,Te),D.pixelStorei(D.UNPACK_SKIP_IMAGES,Ce),T.isDataTexture||T.isData3DTexture?D.texSubImage3D(we,k,Ee,et,lt,ae,de,xe,mn,Ke,gt.data):U.isCompressedArrayTexture?D.compressedTexSubImage3D(we,k,Ee,et,lt,ae,de,xe,mn,gt.data):D.texSubImage3D(we,k,Ee,et,lt,ae,de,xe,mn,Ke,gt),D.pixelStorei(D.UNPACK_ROW_LENGTH,Ft),D.pixelStorei(D.UNPACK_IMAGE_HEIGHT,Ze),D.pixelStorei(D.UNPACK_SKIP_PIXELS,Fn),D.pixelStorei(D.UNPACK_SKIP_ROWS,qr),D.pixelStorei(D.UNPACK_SKIP_IMAGES,gn),k===0&&U.generateMipmaps&&D.generateMipmap(we),Re.unbindTexture()},this.initRenderTarget=function(T){Le.get(T).__webglFramebuffer===void 0&&R.setupRenderTarget(T)},this.initTexture=function(T){T.isCubeTexture?R.setTextureCube(T,0):T.isData3DTexture?R.setTexture3D(T,0):T.isDataArrayTexture||T.isCompressedArrayTexture?R.setTexture2DArray(T,0):R.setTexture2D(T,0),Re.unbindTexture()},this.resetState=function(){b=0,C=0,A=null,Re.reset(),st.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Si}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const n=this.getContext();n.drawingBufferColorSpace=e===bf?"display-p3":"srgb",n.unpackColorSpace=Qe.workingColorSpace===Sc?"display-p3":"srgb"}}class Ym extends bt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Kn,this.environmentIntensity=1,this.environmentRotation=new Kn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,n){return super.copy(e,n),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const n=super.toJSON(e);return this.fog!==null&&(n.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(n.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(n.object.backgroundIntensity=this.backgroundIntensity),n.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(n.object.environmentIntensity=this.environmentIntensity),n.object.environmentRotation=this.environmentRotation.toArray(),n}}class yh extends Jt{constructor(e=null,n=1,i=1,r,s,a,o,l,c=un,u=un,h,f){super(null,a,o,l,c,u,r,s,h,f),this.isDataTexture=!0,this.image={data:e,width:n,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class qm extends Bt{constructor(e,n,i,r=1){super(e,n,i),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=r}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){const e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}}const ds=new Je,Km=new Je,Ko=[],Zm=new Xr,iA=new Je,_a=new it,xa=new $r;class Qm extends it{constructor(e,n,i){super(e,n),this.isInstancedMesh=!0,this.instanceMatrix=new qm(new Float32Array(i*16),16),this.instanceColor=null,this.morphTexture=null,this.count=i,this.boundingBox=null,this.boundingSphere=null;for(let r=0;r<i;r++)this.setMatrixAt(r,iA)}computeBoundingBox(){const e=this.geometry,n=this.count;this.boundingBox===null&&(this.boundingBox=new Xr),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let i=0;i<n;i++)this.getMatrixAt(i,ds),Zm.copy(e.boundingBox).applyMatrix4(ds),this.boundingBox.union(Zm)}computeBoundingSphere(){const e=this.geometry,n=this.count;this.boundingSphere===null&&(this.boundingSphere=new $r),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let i=0;i<n;i++)this.getMatrixAt(i,ds),xa.copy(e.boundingSphere).applyMatrix4(ds),this.boundingSphere.union(xa)}copy(e,n){return super.copy(e,n),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,n){n.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,n){n.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,n){const i=n.morphTargetInfluences,r=this.morphTexture.source.data.data,s=i.length+1,a=e*s+1;for(let o=0;o<i.length;o++)i[o]=r[a+o]}raycast(e,n){const i=this.matrixWorld,r=this.count;if(_a.geometry=this.geometry,_a.material=this.material,_a.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),xa.copy(this.boundingSphere),xa.applyMatrix4(i),e.ray.intersectsSphere(xa)!==!1))for(let s=0;s<r;s++){this.getMatrixAt(s,ds),Km.multiplyMatrices(i,ds),_a.matrixWorld=Km,_a.raycast(e,Ko);for(let a=0,o=Ko.length;a<o;a++){const l=Ko[a];l.instanceId=s,l.object=this,n.push(l)}Ko.length=0}}setColorAt(e,n){this.instanceColor===null&&(this.instanceColor=new qm(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),n.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,n){n.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,n){const i=n.morphTargetInfluences,r=i.length+1;this.morphTexture===null&&(this.morphTexture=new yh(new Float32Array(r*this.count),r,this.count,wf,ri));const s=this.morphTexture.source.data.data;let a=0;for(let c=0;c<i.length;c++)a+=i[c];const o=this.geometry.morphTargetsRelative?1:1-a,l=r*e;s[l]=o,s.set(i,l+1)}updateMorphTargets(){}dispose(){return this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null),this}}class c_ extends pr{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Fe(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const ec=new N,tc=new N,Jm=new Je,ya=new Mc,Zo=new $r,Uu=new N,eg=new N;class rA extends bt{constructor(e=new Tt,n=new c_){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=n,this.updateMorphTargets()}copy(e,n){return super.copy(e,n),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const n=e.attributes.position,i=[0];for(let r=1,s=n.count;r<s;r++)ec.fromBufferAttribute(n,r-1),tc.fromBufferAttribute(n,r),i[r]=i[r-1],i[r]+=ec.distanceTo(tc);e.setAttribute("lineDistance",new rt(i,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,n){const i=this.geometry,r=this.matrixWorld,s=e.params.Line.threshold,a=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),Zo.copy(i.boundingSphere),Zo.applyMatrix4(r),Zo.radius+=s,e.ray.intersectsSphere(Zo)===!1)return;Jm.copy(r).invert(),ya.copy(e.ray).applyMatrix4(Jm);const o=s/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=this.isLineSegments?2:1,u=i.index,f=i.attributes.position;if(u!==null){const p=Math.max(0,a.start),_=Math.min(u.count,a.start+a.count);for(let y=p,m=_-1;y<m;y+=c){const d=u.getX(y),g=u.getX(y+1),v=Qo(this,e,ya,l,d,g);v&&n.push(v)}if(this.isLineLoop){const y=u.getX(_-1),m=u.getX(p),d=Qo(this,e,ya,l,y,m);d&&n.push(d)}}else{const p=Math.max(0,a.start),_=Math.min(f.count,a.start+a.count);for(let y=p,m=_-1;y<m;y+=c){const d=Qo(this,e,ya,l,y,y+1);d&&n.push(d)}if(this.isLineLoop){const y=Qo(this,e,ya,l,_-1,p);y&&n.push(y)}}}updateMorphTargets(){const n=this.geometry.morphAttributes,i=Object.keys(n);if(i.length>0){const r=n[i[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,a=r.length;s<a;s++){const o=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=s}}}}}function Qo(t,e,n,i,r,s){const a=t.geometry.attributes.position;if(ec.fromBufferAttribute(a,r),tc.fromBufferAttribute(a,s),n.distanceSqToSegment(ec,tc,Uu,eg)>i)return;Uu.applyMatrix4(t.matrixWorld);const l=e.ray.origin.distanceTo(Uu);if(!(l<e.near||l>e.far))return{distance:l,point:eg.clone().applyMatrix4(t.matrixWorld),index:r,face:null,faceIndex:null,barycoord:null,object:t}}const tg=new N,ng=new N;class sA extends rA{constructor(e,n){super(e,n),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const n=e.attributes.position,i=[];for(let r=0,s=n.count;r<s;r+=2)tg.fromBufferAttribute(n,r),ng.fromBufferAttribute(n,r+1),i[r]=r===0?0:i[r-1],i[r+1]=i[r]+tg.distanceTo(ng);e.setAttribute("lineDistance",new rt(i,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class wc extends pr{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new Fe(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}const ig=new Je,Sh=new Mc,Jo=new $r,el=new N;class Nf extends bt{constructor(e=new Tt,n=new wc){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=n,this.updateMorphTargets()}copy(e,n){return super.copy(e,n),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,n){const i=this.geometry,r=this.matrixWorld,s=e.params.Points.threshold,a=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),Jo.copy(i.boundingSphere),Jo.applyMatrix4(r),Jo.radius+=s,e.ray.intersectsSphere(Jo)===!1)return;ig.copy(r).invert(),Sh.copy(e.ray).applyMatrix4(ig);const o=s/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=i.index,h=i.attributes.position;if(c!==null){const f=Math.max(0,a.start),p=Math.min(c.count,a.start+a.count);for(let _=f,y=p;_<y;_++){const m=c.getX(_);el.fromBufferAttribute(h,m),rg(el,m,l,r,e,n,this)}}else{const f=Math.max(0,a.start),p=Math.min(h.count,a.start+a.count);for(let _=f,y=p;_<y;_++)el.fromBufferAttribute(h,_),rg(el,_,l,r,e,n,this)}}updateMorphTargets(){const n=this.geometry.morphAttributes,i=Object.keys(n);if(i.length>0){const r=n[i[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,a=r.length;s<a;s++){const o=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=s}}}}}function rg(t,e,n,i,r,s,a){const o=Sh.distanceSqToPoint(t);if(o<n){const l=new N;Sh.closestPointToPoint(t,l),l.applyMatrix4(i);const c=r.ray.origin.distanceTo(l);if(c<r.near||c>r.far)return;s.push({distance:c,distanceToRay:Math.sqrt(o),point:l,index:e,face:null,faceIndex:null,barycoord:null,object:a})}}class If extends Tt{constructor(e=1,n=32,i=0,r=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:n,thetaStart:i,thetaLength:r},n=Math.max(3,n);const s=[],a=[],o=[],l=[],c=new N,u=new Oe;a.push(0,0,0),o.push(0,0,1),l.push(.5,.5);for(let h=0,f=3;h<=n;h++,f+=3){const p=i+h/n*r;c.x=e*Math.cos(p),c.y=e*Math.sin(p),a.push(c.x,c.y,c.z),o.push(0,0,1),u.x=(a[f]/e+1)/2,u.y=(a[f+1]/e+1)/2,l.push(u.x,u.y)}for(let h=1;h<=n;h++)s.push(h,h+1,0);this.setIndex(s),this.setAttribute("position",new rt(a,3)),this.setAttribute("normal",new rt(o,3)),this.setAttribute("uv",new rt(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new If(e.radius,e.segments,e.thetaStart,e.thetaLength)}}class Tc extends Tt{constructor(e=1,n=1,i=1,r=32,s=1,a=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:n,height:i,radialSegments:r,heightSegments:s,openEnded:a,thetaStart:o,thetaLength:l};const c=this;r=Math.floor(r),s=Math.floor(s);const u=[],h=[],f=[],p=[];let _=0;const y=[],m=i/2;let d=0;g(),a===!1&&(e>0&&v(!0),n>0&&v(!1)),this.setIndex(u),this.setAttribute("position",new rt(h,3)),this.setAttribute("normal",new rt(f,3)),this.setAttribute("uv",new rt(p,2));function g(){const S=new N,b=new N;let C=0;const A=(n-e)/i;for(let P=0;P<=s;P++){const V=[],x=P/s,w=x*(n-e)+e;for(let O=0;O<=r;O++){const F=O/r,W=F*l+o,q=Math.sin(W),z=Math.cos(W);b.x=w*q,b.y=-x*i+m,b.z=w*z,h.push(b.x,b.y,b.z),S.set(q,A,z).normalize(),f.push(S.x,S.y,S.z),p.push(F,1-x),V.push(_++)}y.push(V)}for(let P=0;P<r;P++)for(let V=0;V<s;V++){const x=y[V][P],w=y[V+1][P],O=y[V+1][P+1],F=y[V][P+1];e>0&&(u.push(x,w,F),C+=3),n>0&&(u.push(w,O,F),C+=3)}c.addGroup(d,C,0),d+=C}function v(S){const b=_,C=new Oe,A=new N;let P=0;const V=S===!0?e:n,x=S===!0?1:-1;for(let O=1;O<=r;O++)h.push(0,m*x,0),f.push(0,x,0),p.push(.5,.5),_++;const w=_;for(let O=0;O<=r;O++){const W=O/r*l+o,q=Math.cos(W),z=Math.sin(W);A.x=V*z,A.y=m*x,A.z=V*q,h.push(A.x,A.y,A.z),f.push(0,x,0),C.x=q*.5+.5,C.y=z*.5*x+.5,p.push(C.x,C.y),_++}for(let O=0;O<r;O++){const F=b+O,W=w+O;S===!0?u.push(W,W+1,F):u.push(W+1,W,F),P+=3}c.addGroup(d,P,S===!0?1:2),d+=P}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Tc(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class Ac extends Tc{constructor(e=1,n=1,i=32,r=1,s=!1,a=0,o=Math.PI*2){super(0,e,n,i,r,s,a,o),this.type="ConeGeometry",this.parameters={radius:e,height:n,radialSegments:i,heightSegments:r,openEnded:s,thetaStart:a,thetaLength:o}}static fromJSON(e){return new Ac(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class Uf extends Tt{constructor(e=[],n=[],i=1,r=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:n,radius:i,detail:r};const s=[],a=[];o(r),c(i),u(),this.setAttribute("position",new rt(s,3)),this.setAttribute("normal",new rt(s.slice(),3)),this.setAttribute("uv",new rt(a,2)),r===0?this.computeVertexNormals():this.normalizeNormals();function o(g){const v=new N,S=new N,b=new N;for(let C=0;C<n.length;C+=3)p(n[C+0],v),p(n[C+1],S),p(n[C+2],b),l(v,S,b,g)}function l(g,v,S,b){const C=b+1,A=[];for(let P=0;P<=C;P++){A[P]=[];const V=g.clone().lerp(S,P/C),x=v.clone().lerp(S,P/C),w=C-P;for(let O=0;O<=w;O++)O===0&&P===C?A[P][O]=V:A[P][O]=V.clone().lerp(x,O/w)}for(let P=0;P<C;P++)for(let V=0;V<2*(C-P)-1;V++){const x=Math.floor(V/2);V%2===0?(f(A[P][x+1]),f(A[P+1][x]),f(A[P][x])):(f(A[P][x+1]),f(A[P+1][x+1]),f(A[P+1][x]))}}function c(g){const v=new N;for(let S=0;S<s.length;S+=3)v.x=s[S+0],v.y=s[S+1],v.z=s[S+2],v.normalize().multiplyScalar(g),s[S+0]=v.x,s[S+1]=v.y,s[S+2]=v.z}function u(){const g=new N;for(let v=0;v<s.length;v+=3){g.x=s[v+0],g.y=s[v+1],g.z=s[v+2];const S=m(g)/2/Math.PI+.5,b=d(g)/Math.PI+.5;a.push(S,1-b)}_(),h()}function h(){for(let g=0;g<a.length;g+=6){const v=a[g+0],S=a[g+2],b=a[g+4],C=Math.max(v,S,b),A=Math.min(v,S,b);C>.9&&A<.1&&(v<.2&&(a[g+0]+=1),S<.2&&(a[g+2]+=1),b<.2&&(a[g+4]+=1))}}function f(g){s.push(g.x,g.y,g.z)}function p(g,v){const S=g*3;v.x=e[S+0],v.y=e[S+1],v.z=e[S+2]}function _(){const g=new N,v=new N,S=new N,b=new N,C=new Oe,A=new Oe,P=new Oe;for(let V=0,x=0;V<s.length;V+=9,x+=6){g.set(s[V+0],s[V+1],s[V+2]),v.set(s[V+3],s[V+4],s[V+5]),S.set(s[V+6],s[V+7],s[V+8]),C.set(a[x+0],a[x+1]),A.set(a[x+2],a[x+3]),P.set(a[x+4],a[x+5]),b.copy(g).add(v).add(S).divideScalar(3);const w=m(b);y(C,x+0,g,w),y(A,x+2,v,w),y(P,x+4,S,w)}}function y(g,v,S,b){b<0&&g.x===1&&(a[v]=g.x-1),S.x===0&&S.z===0&&(a[v]=b/2/Math.PI+.5)}function m(g){return Math.atan2(g.z,-g.x)}function d(g){return Math.atan2(-g.y,Math.sqrt(g.x*g.x+g.z*g.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Uf(e.vertices,e.indices,e.radius,e.details)}}class kf extends Uf{constructor(e=1,n=0){const i=(1+Math.sqrt(5))/2,r=[-1,i,0,1,i,0,-1,-i,0,1,-i,0,0,-1,i,0,1,i,0,-1,-i,0,1,-i,i,0,-1,i,0,1,-i,0,-1,-i,0,1],s=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(r,s,e,n),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:n}}static fromJSON(e){return new kf(e.radius,e.detail)}}class Yi extends Tt{constructor(e=.5,n=1,i=32,r=1,s=0,a=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:n,thetaSegments:i,phiSegments:r,thetaStart:s,thetaLength:a},i=Math.max(3,i),r=Math.max(1,r);const o=[],l=[],c=[],u=[];let h=e;const f=(n-e)/r,p=new N,_=new Oe;for(let y=0;y<=r;y++){for(let m=0;m<=i;m++){const d=s+m/i*a;p.x=h*Math.cos(d),p.y=h*Math.sin(d),l.push(p.x,p.y,p.z),c.push(0,0,1),_.x=(p.x/n+1)/2,_.y=(p.y/n+1)/2,u.push(_.x,_.y)}h+=f}for(let y=0;y<r;y++){const m=y*(i+1);for(let d=0;d<i;d++){const g=d+m,v=g,S=g+i+1,b=g+i+2,C=g+1;o.push(v,S,C),o.push(S,b,C)}}this.setIndex(o),this.setAttribute("position",new rt(l,3)),this.setAttribute("normal",new rt(c,3)),this.setAttribute("uv",new rt(u,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Yi(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}}class vi extends Tt{constructor(e=1,n=32,i=16,r=0,s=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:n,heightSegments:i,phiStart:r,phiLength:s,thetaStart:a,thetaLength:o},n=Math.max(3,Math.floor(n)),i=Math.max(2,Math.floor(i));const l=Math.min(a+o,Math.PI);let c=0;const u=[],h=new N,f=new N,p=[],_=[],y=[],m=[];for(let d=0;d<=i;d++){const g=[],v=d/i;let S=0;d===0&&a===0?S=.5/n:d===i&&l===Math.PI&&(S=-.5/n);for(let b=0;b<=n;b++){const C=b/n;h.x=-e*Math.cos(r+C*s)*Math.sin(a+v*o),h.y=e*Math.cos(a+v*o),h.z=e*Math.sin(r+C*s)*Math.sin(a+v*o),_.push(h.x,h.y,h.z),f.copy(h).normalize(),y.push(f.x,f.y,f.z),m.push(C+S,1-v),g.push(c++)}u.push(g)}for(let d=0;d<i;d++)for(let g=0;g<n;g++){const v=u[d][g+1],S=u[d][g],b=u[d+1][g],C=u[d+1][g+1];(d!==0||a>0)&&p.push(v,S,C),(d!==i-1||l<Math.PI)&&p.push(S,b,C)}this.setIndex(p),this.setAttribute("position",new rt(_,3)),this.setAttribute("normal",new rt(y,3)),this.setAttribute("uv",new rt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new vi(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class Ml extends pr{constructor(e){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.type="MeshStandardMaterial",this.color=new Fe(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Fe(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Rf,this.normalScale=new Oe(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Kn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class u_ extends pr{constructor(e){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new Fe(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Fe(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Rf,this.normalScale=new Oe(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Kn,this.combine=yf,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class Ff extends bt{constructor(e,n=1){super(),this.isLight=!0,this.type="Light",this.color=new Fe(e),this.intensity=n}dispose(){}copy(e,n){return super.copy(e,n),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const n=super.toJSON(e);return n.object.color=this.color.getHex(),n.object.intensity=this.intensity,this.groundColor!==void 0&&(n.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(n.object.distance=this.distance),this.angle!==void 0&&(n.object.angle=this.angle),this.decay!==void 0&&(n.object.decay=this.decay),this.penumbra!==void 0&&(n.object.penumbra=this.penumbra),this.shadow!==void 0&&(n.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(n.object.target=this.target.uuid),n}}class aA extends Ff{constructor(e,n,i){super(e,i),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(bt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Fe(n)}copy(e,n){return super.copy(e,n),this.groundColor.copy(e.groundColor),this}}const ku=new Je,sg=new N,ag=new N;class oA{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Oe(512,512),this.map=null,this.mapPass=null,this.matrix=new Je,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Lf,this._frameExtents=new Oe(1,1),this._viewportCount=1,this._viewports=[new _t(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const n=this.camera,i=this.matrix;sg.setFromMatrixPosition(e.matrixWorld),n.position.copy(sg),ag.setFromMatrixPosition(e.target.matrixWorld),n.lookAt(ag),n.updateMatrixWorld(),ku.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(ku),i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(ku)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}class lA extends oA{constructor(){super(new i_(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class cA extends Ff{constructor(e,n){super(e,n),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(bt.DEFAULT_UP),this.updateMatrix(),this.target=new bt,this.shadow=new lA}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}class uA extends Ff{constructor(e,n){super(e,n),this.isAmbientLight=!0,this.type="AmbientLight"}}const og=new Je;class dA{constructor(e,n,i=0,r=1/0){this.ray=new Mc(e,n),this.near=i,this.far=r,this.camera=null,this.layers=new Pf,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,n){this.ray.set(e,n)}setFromCamera(e,n){n.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(n.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(n).sub(this.ray.origin).normalize(),this.camera=n):n.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(n.near+n.far)/(n.near-n.far)).unproject(n),this.ray.direction.set(0,0,-1).transformDirection(n.matrixWorld),this.camera=n):console.error("THREE.Raycaster: Unsupported camera type: "+n.type)}setFromXRController(e){return og.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(og),this}intersectObject(e,n=!0,i=[]){return Mh(e,this,i,n),i.sort(lg),i}intersectObjects(e,n=!0,i=[]){for(let r=0,s=e.length;r<s;r++)Mh(e[r],this,i,n);return i.sort(lg),i}}function lg(t,e){return t.distance-e.distance}function Mh(t,e,n,i){let r=!0;if(t.layers.test(e.layers)&&t.raycast(e,n)===!1&&(r=!1),r===!0&&i===!0){const s=t.children;for(let a=0,o=s.length;a<o;a++)Mh(s[a],e,n,!0)}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:xf}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=xf);const As=160,Cs=80,d_=4,qi=As*d_,Ki=Cs*d_,nc=6371,kr=Math.PI/180;function h_(t,e){const n=new Float32Array(e),i=new Float32Array(e),r=new Float32Array(e);let s=0;const a=2*Math.PI/t;for(let o=0;o<e;o++){const l=90-(o+.5)*180/e;n[o]=l,i[o]=Math.cos(l*kr);const c=(90-o*180/e)*kr,u=(90-(o+1)*180/e)*kr;r[o]=nc*nc*a*(Math.sin(c)-Math.sin(u)),s+=r[o]*t}return{w:t,h:e,lat:n,cosLat:i,areaKm2:r,totalAreaKm2:s}}h_(As,Cs);h_(qi,Ki);function Ti(t,e,n=[0,0,0]){const i=(e+180)*kr,r=t*kr,s=Math.cos(r);return n[0]=-Math.cos(i)*s,n[1]=Math.sin(r),n[2]=Math.sin(i)*s,n}function eo(t,e,n){const i=Math.hypot(t,e,n)||1,r=Math.asin(Math.max(-1,Math.min(1,e/i)))/kr;let s=Math.atan2(n,-t)/kr-180;return s<-180&&(s+=360),s>=180&&(s-=360),{lat:r,lon:s}}function cg(t,e,n,i){const r=(e+180)/360*n-.5,s=(90-t)/180*i-.5;return{gx:r,gy:s}}function ug(t,e){return(t%e+e)%e}function dg(t,e,n,i,r){r<0&&(r=0),r>n-1&&(r=n-1);const s=Math.floor(i),a=Math.floor(r),o=i-s,l=r-a,c=ug(s,e),u=ug(s+1,e),h=Math.min(n-1,a+1),f=a*e,p=h*e,_=t[f+c]*(1-o)+t[f+u]*o,y=t[p+c]*(1-o)+t[p+u]*o;return _*(1-l)+y*l}class f_{constructor(e){this.state=e>>>0||2654435769}next(){let e=this.state=this.state+1831565813>>>0;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}range(e,n){return e+(n-e)*this.next()}int(e,n){return Math.floor(this.range(e,n+1))}pick(e){return e[Math.floor(this.next()*e.length)]}}function hA(t){let e=2166136261;for(let n=0;n<t.length;n++)e^=t.charCodeAt(n),e=Math.imul(e,16777619)>>>0;return e>>>0}function fA(t){if(typeof t=="number")return t>>>0;const e=t.trim();return/^\d+$/.test(e)?Number(e)>>>0:hA(e)}const Ua=365,pA=["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"],hg=[31,28,31,30,31,30,31,31,30,31,30,31];function p_(t){const e=Math.floor(t/Ua)+1;let n=Math.floor(t-(e-1)*Ua),i=0;for(;i<11&&n>=hg[i];)n-=hg[i],i++;const r=Math.floor((i+1)%12/3),s=["Kış","İlkbahar","Yaz","Sonbahar"],a=["Yaz","Sonbahar","Kış","İlkbahar"];return{year:e,month:i,monthName:pA[i],dayOfMonth:n+1,seasonNorth:s[r],seasonSouth:a[r]}}function ii(t){const e=p_(t);return`Yıl ${e.year.toLocaleString("tr-TR")} · ${e.dayOfMonth} ${e.monthName}`}function mA(t){return(t%Ua+Ua)%Ua}const Mr=Math.PI/180;function El(t,e,n=1){const i=Ti(t,e);return new N(i[0]*n,i[1]*n,i[2]*n)}function gA(t,e){const n=El(t,e),i=El(Math.min(89.999,t+.01),e).sub(El(Math.max(-89.999,t-.01),e)).normalize();(!isFinite(i.x)||i.lengthSq()<.5)&&i.set(0,1,0);const r=new N().crossVectors(i,n).normalize();return i.crossVectors(n,r).normalize(),{up:n,north:i,east:r}}class vA{constructor(e,n,i,r){this.camera=e,this.el=n,this.terrain=i,this.cb=r,this.mode="space",this.sp={lat:20,lon:10,dist:3.2},this.spCur={lat:20,lon:10,dist:3.2},this.sf={lat:0,lon:0,heading:0,pitch:30,range:.06},this.sfCur={lat:0,lon:0,heading:0,pitch:30,range:.06},this.enabled=!0,this.autoRotate=!1,this.transition=null,this.pointers=new Map,this.pinch0=0,this.mid0={x:0,y:0},this.holdTimer=0,this.moved=!1,this.keys=new Set,this.onDown=a=>{if(this.enabled){if(this.el.setPointerCapture(a.pointerId),this.pointers.set(a.pointerId,{x:a.clientX,y:a.clientY,sx:a.clientX,sy:a.clientY,t:performance.now(),button:a.button}),this.moved=!1,this.pointers.size===2){const[o,l]=[...this.pointers.values()];this.pinch0=Math.hypot(o.x-l.x,o.y-l.y),this.mid0={x:(o.x+l.x)/2,y:(o.y+l.y)/2},clearInterval(this.holdTimer)}else if(this.pointers.size===1){const o=a.clientX,l=a.clientY;clearInterval(this.holdTimer);const c=performance.now();this.holdTimer=window.setInterval(()=>{if(this.moved||this.pointers.size!==1)return clearInterval(this.holdTimer);performance.now()-c>450&&this.cb.onTap(o,l,!0)},220)}}},this.onMove=a=>{this.cb.onHover?.(a.clientX,a.clientY);const o=this.pointers.get(a.pointerId);if(!o||!this.enabled)return;const l=a.clientX-o.x,c=a.clientY-o.y;o.x=a.clientX,o.y=a.clientY,Math.hypot(a.clientX-o.sx,a.clientY-o.sy)>7&&(this.moved=!0);const u=this.el.clientHeight||800;if(this.pointers.size===2){const[f,p]=[...this.pointers.values()],_=Math.hypot(f.x-p.x,f.y-p.y);this.pinch0>0&&this.zoom(this.pinch0/Math.max(_,1)),this.pinch0=_;const y={x:(f.x+p.x)/2,y:(f.y+p.y)/2},m=y.x-this.mid0.x,d=y.y-this.mid0.y;this.mid0=y,this.mode==="surface"?this.rotate(m*.5,d*.5):this.orbit(m,d,u);return}const h=o.button===2||a.shiftKey||a.ctrlKey;this.mode==="space"?this.orbit(l,c,u):h?this.rotate(l*.4,c*.4):this.pan(l,c,u)},this.onUp=a=>{const o=this.pointers.get(a.pointerId);this.pointers.delete(a.pointerId),clearInterval(this.holdTimer),o&&(!this.moved&&performance.now()-o.t<450&&this.pointers.size===0&&this.cb.onTap(a.clientX,a.clientY,!1),this.pinch0=0)},this.onWheel=a=>{a.preventDefault(),this.enabled&&this.zoom(Math.exp(a.deltaY*.0012))},this.onKey=a=>{const o=a.target?.tagName;o==="INPUT"||o==="TEXTAREA"||o==="SELECT"||this.keys.add(a.key.toLowerCase())},this.onKeyUp=a=>this.keys.delete(a.key.toLowerCase()),n.addEventListener("pointerdown",this.onDown),n.addEventListener("pointermove",this.onMove),n.addEventListener("pointerup",this.onUp),n.addEventListener("pointercancel",this.onUp),n.addEventListener("wheel",this.onWheel,{passive:!1}),n.addEventListener("contextmenu",a=>a.preventDefault()),window.addEventListener("keydown",this.onKey),window.addEventListener("keyup",this.onKeyUp);const s=(n.clientWidth||1)/(n.clientHeight||1);s<1&&(this.sp.dist=this.spCur.dist=1+2.2/Math.max(.4,s))}dispose(){this.el.removeEventListener("pointerdown",this.onDown),this.el.removeEventListener("pointermove",this.onMove),this.el.removeEventListener("pointerup",this.onUp),this.el.removeEventListener("pointercancel",this.onUp),this.el.removeEventListener("wheel",this.onWheel),window.removeEventListener("keydown",this.onKey),window.removeEventListener("keyup",this.onKeyUp),clearInterval(this.holdTimer)}altitude(){return this.mode==="space"?this.spCur.dist-1:this.sfCur.range*Math.sin(this.sfCur.pitch*Mr)+.002}focusLatLon(){return this.mode==="space"?{lat:this.spCur.lat,lon:this.spCur.lon}:{lat:this.sfCur.lat,lon:this.sfCur.lon}}startTransition(e=1.4){this.transition={t:0,dur:e,fromPos:this.camera.position.clone(),fromQuat:this.camera.quaternion.clone()}}enterSurface(e,n,i=.05){this.sf={lat:e,lon:n,heading:0,pitch:32,range:i},this.sfCur={...this.sf},this.mode="surface",this.startTransition(),this.cb.onModeChange("surface")}exitToSpace(e=2.6){const n=this.focusLatLon();this.sp={lat:n.lat,lon:n.lon,dist:e},this.spCur={...this.sp},this.mode="space",this.startTransition(),this.cb.onModeChange("space")}flyTo(e,n){this.mode==="space"?(this.sp.lat=e,this.sp.lon=n,this.sp.dist=Math.min(this.sp.dist,2.4)):(this.sf.lat=e,this.sf.lon=n,this.sfCur.lat=e,this.sfCur.lon=n,this.startTransition(1))}orbit(e,n,i){const r=110*(this.sp.dist-1)/i;this.sp.lon-=e*r,this.sp.lat=Math.max(-85,Math.min(85,this.sp.lat+n*r))}pan(e,n,i){const r=this.sf.range*1.6/i,s=this.sf.heading*Mr,a=n*r,o=-e*r,l=a*Math.cos(s)-o*Math.sin(s),c=a*Math.sin(s)+o*Math.cos(s);this.sf.lat=Math.max(-88,Math.min(88,this.sf.lat+l/Mr)),this.sf.lon+=c/Mr/Math.max(.05,Math.cos(this.sf.lat*Mr)),this.sf.lon=((this.sf.lon+180)%360+360)%360-180}rotate(e,n){this.sf.heading=(this.sf.heading-e+360)%360,this.sf.pitch=Math.max(6,Math.min(88,this.sf.pitch+n))}zoom(e){this.transition||(this.mode==="space"?(this.sp.dist=Math.max(1.12,Math.min(9,1+(this.sp.dist-1)*e)),this.sp.dist<=1.13&&e<1&&this.enterSurface(this.spCur.lat,this.spCur.lon,.12)):(this.sf.range*=e,this.sf.range>.42&&this.exitToSpace(1.6),this.sf.range=Math.max(.0012,Math.min(.42,this.sf.range))))}livePose(){if(this.mode==="space"){const h=this.spCur;return{pos:El(h.lat,h.lon,h.dist),target:new N(0,0,0),up:new N(0,1,0)}}const e=this.sfCur,n=gA(e.lat,e.lon),i=this.terrain.surfaceRadius(e.lat,e.lon),r=n.up.clone().multiplyScalar(i),s=e.heading*Mr,a=e.pitch*Mr,o=n.north.clone().multiplyScalar(Math.cos(s)).add(n.east.clone().multiplyScalar(Math.sin(s))),l=r.clone().add(o.multiplyScalar(-Math.cos(a)*e.range)).add(n.up.clone().multiplyScalar(Math.sin(a)*e.range)),c=eo(l.x,l.y,l.z),u=this.terrain.surfaceRadius(c.lat,c.lon)+e.range*.05+4e-4;return l.length()<u&&l.setLength(u),{pos:l,target:r,up:n.up}}update(e){const n=1-Math.exp(-e*8);if(this.keys.size){const l=this.el.clientHeight||800,c=600*e;this.mode==="surface"?((this.keys.has("w")||this.keys.has("arrowup"))&&this.pan(0,c,l),(this.keys.has("s")||this.keys.has("arrowdown"))&&this.pan(0,-c,l),(this.keys.has("a")||this.keys.has("arrowleft"))&&this.pan(c,0,l),(this.keys.has("d")||this.keys.has("arrowright"))&&this.pan(-c,0,l),this.keys.has("q")&&this.rotate(-90*e,0),this.keys.has("e")&&this.rotate(90*e,0)):((this.keys.has("w")||this.keys.has("arrowup"))&&this.orbit(0,c,l),(this.keys.has("s")||this.keys.has("arrowdown"))&&this.orbit(0,-c,l),(this.keys.has("a")||this.keys.has("arrowleft"))&&this.orbit(c,0,l),(this.keys.has("d")||this.keys.has("arrowright"))&&this.orbit(-c,0,l)),(this.keys.has("+")||this.keys.has("="))&&this.zoom(Math.exp(-e*1.5)),this.keys.has("-")&&this.zoom(Math.exp(e*1.5))}if(this.autoRotate&&this.mode==="space"&&this.pointers.size===0&&(this.sp.lon+=e*4),this.mode==="space"){let l=this.sp.lon-this.spCur.lon;l=((l+180)%360+360)%360-180,this.spCur.lon+=l*n,this.spCur.lat+=(this.sp.lat-this.spCur.lat)*n,this.spCur.dist+=(this.sp.dist-this.spCur.dist)*n}else{let l=this.sf.lon-this.sfCur.lon;l=((l+180)%360+360)%360-180,this.sfCur.lon+=l*n,this.sfCur.lat+=(this.sf.lat-this.sfCur.lat)*n;let c=this.sf.heading-this.sfCur.heading;c=((c+180)%360+360)%360-180,this.sfCur.heading+=c*n,this.sfCur.pitch+=(this.sf.pitch-this.sfCur.pitch)*n,this.sfCur.range+=(this.sf.range-this.sfCur.range)*n}const i=this.livePose(),r=this.camera,s=new Je().lookAt(i.pos,i.target,i.up),a=new wi().setFromRotationMatrix(s);if(this.transition){const l=this.transition;l.t+=e/l.dur;const c=Math.min(1,l.t),u=c*c*(3-2*c),h=l.fromPos.length(),f=i.pos.length(),p=l.fromPos.clone().normalize(),_=new wi().setFromUnitVectors(p,i.pos.clone().normalize()),y=new wi().slerp(_,u),m=Math.sin(Math.PI*u)*.25*Math.max(0,Math.min(1,p.angleTo(i.pos)*2));r.position.copy(p.applyQuaternion(y).multiplyScalar(h+(f-h)*u+m)),r.quaternion.copy(l.fromQuat).slerp(a,u),c>=1&&(this.transition=null)}else r.position.copy(i.pos),r.quaternion.copy(a);r.up.copy(i.up);const o=Math.max(4e-4,r.position.length()-1);r.near=Math.max(5e-5,o*.08),r.far=o+4,r.updateProjectionMatrix()}}class _A{constructor(){this.hrElev=new Float32Array(qi*Ki),this.seaLevel=0,this.tree=new Float32Array(As*Cs),this.ice=new Float32Array(As*Cs),this.exaggeration=20}get k(){return this.exaggeration/6371e3}elevAt(e,n){const{gx:i,gy:r}=cg(e,n,qi,Ki);return dg(this.hrElev,qi,Ki,i,r)}simAt(e,n,i){const{gx:r,gy:s}=cg(n,i,As,Cs);return dg(e,As,Cs,r,s)}radiusFor(e){const n=e-this.seaLevel;return n>0?1.0004+n*this.k:.9985+n*this.k*.35}waterRadius(){return 1}surfaceRadius(e,n){return Math.max(this.waterRadius(),this.radiusFor(this.elevAt(e,n)))}}const Pn=new Float32Array([1,1,0,-1,1,0,1,-1,0,-1,-1,0,1,0,1,-1,0,1,1,0,-1,-1,0,-1,0,1,1,0,-1,1,0,1,-1,0,-1,-1]),xA=1/3,Qn=1/6;class fg{constructor(e){this.perm=new Uint8Array(512),this.permMod12=new Uint8Array(512);const n=new f_(e),i=new Uint8Array(256);for(let r=0;r<256;r++)i[r]=r;for(let r=255;r>0;r--){const s=Math.floor(n.next()*(r+1)),a=i[r];i[r]=i[s],i[s]=a}for(let r=0;r<512;r++)this.perm[r]=i[r&255],this.permMod12[r]=this.perm[r]%12}noise(e,n,i){const r=this.perm,s=this.permMod12;let a=0,o=0,l=0,c=0;const u=(e+n+i)*xA,h=Math.floor(e+u),f=Math.floor(n+u),p=Math.floor(i+u),_=(h+f+p)*Qn,y=e-(h-_),m=n-(f-_),d=i-(p-_);let g,v,S,b,C,A;y>=m?m>=d?(g=1,v=0,S=0,b=1,C=1,A=0):y>=d?(g=1,v=0,S=0,b=1,C=0,A=1):(g=0,v=0,S=1,b=1,C=0,A=1):m<d?(g=0,v=0,S=1,b=0,C=1,A=1):y<d?(g=0,v=1,S=0,b=0,C=1,A=1):(g=0,v=1,S=0,b=1,C=1,A=0);const P=y-g+Qn,V=m-v+Qn,x=d-S+Qn,w=y-b+2*Qn,O=m-C+2*Qn,F=d-A+2*Qn,W=y-1+3*Qn,q=m-1+3*Qn,z=d-1+3*Qn,J=h&255,L=f&255,Y=p&255;let $=.6-y*y-m*m-d*d;if($>0){const j=s[J+r[L+r[Y]]]*3;$*=$,a=$*$*(Pn[j]*y+Pn[j+1]*m+Pn[j+2]*d)}let ne=.6-P*P-V*V-x*x;if(ne>0){const j=s[J+g+r[L+v+r[Y+S]]]*3;ne*=ne,o=ne*ne*(Pn[j]*P+Pn[j+1]*V+Pn[j+2]*x)}let ye=.6-w*w-O*O-F*F;if(ye>0){const j=s[J+b+r[L+C+r[Y+A]]]*3;ye*=ye,l=ye*ye*(Pn[j]*w+Pn[j+1]*O+Pn[j+2]*F)}let Ie=.6-W*W-q*q-z*z;if(Ie>0){const j=s[J+1+r[L+1+r[Y+1]]]*3;Ie*=Ie,c=Ie*Ie*(Pn[j]*W+Pn[j+1]*q+Pn[j+2]*z)}return 32*(a+o+l+c)}fbm(e,n,i,r,s=2,a=.5){let o=1,l=1,c=0,u=0;for(let h=0;h<r;h++)c+=o*this.noise(e*l,n*l,i*l),u+=o,o*=a,l*=s;return c/u}ridged(e,n,i,r){let s=1,a=1,o=0,l=0,c=1;for(let u=0;u<r;u++){let h=1-Math.abs(this.noise(e*a,n*a,i*a));h*=h*c,c=Math.min(1,h*2),o+=h*s,l+=s,s*=.5,a*=2.1}return o/l}}function yA(t,e){return new Li({uniforms:{uColor:{value:t},uIntensity:{value:e},uSunDir:{value:new N(1,0,0)}},vertexShader:`
      varying vec3 vNormal;
      varying vec3 vWorld;
      void main() {
        vNormal = normalize(mat3(modelMatrix) * normal);
        vec4 w = modelMatrix * vec4(position, 1.0);
        vWorld = w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,fragmentShader:`
      uniform vec3 uColor;
      uniform float uIntensity;
      uniform vec3 uSunDir;
      varying vec3 vNormal;
      varying vec3 vWorld;
      void main() {
        vec3 viewDir = normalize(cameraPosition - vWorld);
        float rim = 1.0 - abs(dot(viewDir, vNormal));
        float glow = pow(rim, 3.0) * uIntensity;
        float day = clamp(dot(normalize(vWorld), uSunDir) * 0.8 + 0.45, 0.08, 1.0);
        gl_FragColor = vec4(uColor * glow * day, glow * day);
      }`,side:Qt,blending:Us,transparent:!0,depthWrite:!1})}function SA(t=4e3){const e=new Tt,n=new Float32Array(t*3),i=new Float32Array(t*3);let r=12345;const s=()=>(r=r*16807%2147483647)/2147483647;for(let o=0;o<t;o++){const l=s()*2-1,c=s()*Math.PI*2,u=Math.sqrt(1-l*l);n.set([u*Math.cos(c)*50,l*50,u*Math.sin(c)*50],o*3);const h=.5+s()*.5,f=s();i.set([h*(.85+.15*f),h*.9,h*(1.05-.2*f)],o*3)}e.setAttribute("position",new Bt(n,3)),e.setAttribute("color",new Bt(i,3));const a=new wc({size:1.4,sizeAttenuation:!1,vertexColors:!0,transparent:!0,opacity:.9,depthWrite:!1});return new Nf(e,a)}function pg(){const t=new Ac(.35,1,6,1);t.translate(0,.75,0);const e=new Tc(.07,.09,.4,5,1);e.translate(0,.2,0);const n=new Tt,i=[t.toNonIndexed(),e.toNonIndexed()],r=[],s=[],a=[];return i.forEach((o,l)=>{o.computeVertexNormals();const c=o.getAttribute("position").array,u=o.getAttribute("normal").array;for(let f=0;f<c.length;f++)s.push(c[f]),a.push(u[f]);const h=l===0?[1,1,1]:[.45,.32,.22];for(let f=0;f<c.length/3;f++)r.push(...h)}),n.setAttribute("position",new rt(s,3)),n.setAttribute("normal",new rt(a,3)),n.setAttribute("color",new rt(r,3)),n}class MA{constructor(e,n,i,r=96,s=3e3){this.terrain=e,this.res=r,this.maxTrees=s,this.group=new jn,this.center={lat:999,lon:999,half:0},this.hideDir=new N(0,1,0),this.hideCos=2,this.lastBuild=0,this.dataVersion=0,this.builtVersion=-1,this.noise=new fg(i^1013904242);const a=new Zs(1,1,r,r);this.mesh=new it(a,n),this.mesh.frustumCulled=!0,this.trees=new Qm(pg(),new u_({vertexColors:!0}),s),this.trees.count=0,this.trees.instanceMatrix.setUsage(HS),this.group.add(this.mesh,this.trees),this.group.visible=!1}setSeed(e){this.noise=new fg(e^1013904242),this.builtVersion=-1}setQuality(e,n){if(e===this.res&&n===this.maxTrees)return;this.res=e,this.maxTrees=n,this.mesh.geometry.dispose(),this.mesh.geometry=new Zs(1,1,e,e);const i=this.trees.material;this.group.remove(this.trees),this.trees.geometry.dispose(),this.trees=new Qm(pg(),i,Math.max(1,n)),this.trees.count=0,this.group.add(this.trees),this.builtVersion=-1}invalidate(){this.builtVersion=-1}update(e,n,i,r){if(this.group.visible=e,!e)return;const s=Math.min(.14,Math.max(.012,r*1.8)),a=(Math.abs(n-this.center.lat)+Math.abs(i-this.center.lon)*Math.cos(n*Math.PI/180))*(Math.PI/180),o=performance.now();(this.builtVersion<0||a>this.center.half*.3||s/this.center.half>1.6||this.center.half/s>1.6||this.builtVersion!==this.dataVersion&&o-this.lastBuild>2500)&&o-this.lastBuild>120&&this.build(n,i,s)}build(e,n,i){this.lastBuild=performance.now(),this.builtVersion=this.dataVersion,this.center={lat:e,lon:n,half:i};const r=Ti(e,n);this.hideDir.set(r[0],r[1],r[2]),this.hideCos=Math.cos(i*.93);const s=this.terrain,a=Ti(e,n),o=new N(a[0],a[1],a[2]),l=Ti(Math.min(89.9,e+.01),n),c=new N(l[0],l[1],l[2]).sub(o).normalize(),u=new N().crossVectors(c,o).normalize();c.crossVectors(o,u).normalize();const h=this.mesh.geometry,f=h.getAttribute("position"),p=h.getAttribute("uv"),_=this.res+1,y=12e-5,m=new N;for(let x=0;x<_;x++)for(let w=0;w<_;w++){const O=x*_+w,F=w/this.res*2-1,W=x/this.res*2-1;m.copy(o).addScaledVector(u,F*i).addScaledVector(c,-W*i).normalize();const q=eo(m.x,m.y,m.z);let z=s.elevAt(q.lat,q.lon);const J=Math.max(Math.abs(F),Math.abs(W)),L=1-Math.min(1,Math.max(0,(J-.7)/.3));if(z>s.seaLevel){const ne=Math.min(1,(z-s.seaLevel)/2500),ye=90;z+=L*(60+420*ne)*this.noise.fbm(m.x*ye,m.y*ye,m.z*ye,5),z=Math.max(s.seaLevel+1,z)}const Y=Math.max(s.waterRadius()-6e-4,s.radiusFor(z))+y*L;f.setXYZ(O,m.x*Y,m.y*Y,m.z*Y);let $=q.lon;$-n>180&&($-=360),$-n<-180&&($+=360),p.setXY(O,($+180)/360,(q.lat+90)/180)}f.needsUpdate=!0,p.needsUpdate=!0,h.computeVertexNormals(),h.computeBoundingSphere();const d=new f_((e*1e3|0)^(n*1e3|0)<<8),g=new Je,v=new wi,S=new N,b=new N,C=new Fe,A=Math.min(.004,Math.max(12e-5,i*.012));let P=0;const V=this.maxTrees*3;for(let x=0;x<V&&P<this.maxTrees;x++){const w=d.range(-.92,.92),O=d.range(-.92,.92);m.copy(o).addScaledVector(u,w*i).addScaledVector(c,-O*i).normalize();const F=eo(m.x,m.y,m.z),W=s.simAt(s.tree,F.lat,F.lon);if(d.next()>W*1.1||s.simAt(s.ice,F.lat,F.lon)>3)continue;const q=s.elevAt(F.lat,F.lon);if(q<=s.seaLevel+2)continue;const z=Math.min(1,(q-s.seaLevel)/2500),J=90,L=Math.max(s.seaLevel+1,q+(60+420*z)*this.noise.fbm(m.x*J,m.y*J,m.z*J,5)),Y=s.radiusFor(L)+y;b.copy(m).multiplyScalar(Y),v.setFromUnitVectors(new N(0,1,0),m);const $=A*d.range(.6,1.4);S.set($,$*d.range(.8,1.5),$),g.compose(b,v,S),this.trees.setMatrixAt(P,g);const ne=Math.abs(F.lat)>50?1:0;C.setRGB(.16+d.range(0,.08),.42-ne*.12+d.range(0,.1),.18+ne*.06),this.trees.setColorAt(P,C),P++}this.trees.count=P,this.trees.instanceMatrix.needsUpdate=!0,this.trees.instanceColor&&(this.trees.instanceColor.needsUpdate=!0),this.trees.computeBoundingSphere()}raycastTargets(){return this.group.visible?[this.mesh]:[]}}const EA={flood:3837670,drought:14262346,coldwave:9426687,heatwave:16734780,epidemic:11758591,wildfire:16742954,superstorm:10467280};function hs(t,e,n,i){const r=Ti(e,n),s=new N(r[0],r[1],r[2]);t.position.copy(s).multiplyScalar(i),t.quaternion.setFromUnitVectors(new N(0,0,1),s)}class wA{constructor(e){this.terrain=e,this.group=new jn,this.fx=new Map,this.time=0,this.events=[]}sync(e){const n=new Set(e.map(i=>i.id));for(const[i,r]of this.fx)n.has(i)||(this.group.remove(r.obj),r.dispose(),this.fx.delete(i));for(const i of e)if(!this.fx.has(i.id)){const r=this.create(i);r&&(this.fx.set(i.id,r),this.group.add(r.obj))}this.events=e}update(e){this.time+=e;for(const n of this.events)this.fx.get(n.id)?.update(this.time,e,n)}create(e){const n=e.radiusKm/nc,i=()=>this.terrain.surfaceRadius(e.lat,e.lon)+.002,r=[],s=l=>(l instanceof Tt&&r.push(l),l),a=()=>r.forEach(l=>l.dispose()),o=(l,c=.8)=>s(new gi({color:l,transparent:!0,opacity:c,side:ln,depthWrite:!1,blending:Us}));switch(e.type){case"volcano":{const l=new jn,c=new it(s(new vi(.006,12,8)),s(new gi({color:16730640})));l.add(c);const u=160,h=s(new Tt),f=new Float32Array(u*3),p=new Float32Array(u);for(let y=0;y<u;y++)p[y]=Math.random();h.setAttribute("position",new Bt(f,3));const _=new Nf(h,s(new wc({color:9077114,size:6,sizeAttenuation:!1,transparent:!0,opacity:.75,depthWrite:!1})));return l.add(_),{obj:l,dispose:a,update:(y,m,d)=>{hs(l,d.lat,d.lon,i()),c.scale.setScalar(1+.3*Math.sin(y*9));for(let g=0;g<u;g++){const v=(p[g]+y*.25)%1,S=v*.06*(.5+d.intensity),b=v*.02;f[g*3]=Math.cos(p[g]*40)*b,f[g*3+1]=Math.sin(p[g]*40)*b,f[g*3+2]=S}h.attributes.position.needsUpdate=!0}}}case"earthquake":case"tsunami":case"epidemic":{const l=e.type==="earthquake"?16752704:e.type==="tsunami"?7334143:11758591,c=new jn,u=[];for(let h=0;h<3;h++){const f=new it(s(new Yi(.96,1,64)),o(l));u.push(f),c.add(f)}return{obj:c,dispose:a,update:(h,f,p)=>{hs(c,p.lat,p.lon,e.type==="tsunami"?1.0015:i());const _=Math.min(1,p.elapsedDays/p.durationDays);u.forEach((y,m)=>{const d=(h*(e.type==="tsunami"?.35:.8)+m/3)%1,g=e.type==="tsunami"?n*Math.max(.1,_)*(.7+.3*d):n*d;y.scale.setScalar(Math.max(1e-4,g)),y.material.opacity=.85*(1-d)})}}}case"hurricane":case"tornado":{const l=new jn;if(e.type==="tornado"){const u=new it(s(new Ac(.004,.03,16,1,!0)),s(new gi({color:10134702,transparent:!0,opacity:.6,side:ln,depthWrite:!1})));return u.rotation.x=-Math.PI/2,u.position.z=.015,l.add(u),{obj:l,dispose:a,update:(h,f,p)=>{hs(l,p.lat,p.lon,i()),u.rotation.y=h*8,u.scale.set(1+.15*Math.sin(h*13),1,1+.15*Math.cos(h*11))}}}const c=new it(s(new Yi(.9,1,64,1,0,Math.PI*1.6)),o(13625087,.45));return l.add(c),{obj:l,dispose:a,update:(u,h,f)=>{hs(l,f.lat,f.lon,1.035),c.scale.setScalar(n*(.8+.4*f.intensity)),c.rotation.z=(f.lat>=0?1:-1)*u*2}}}case"asteroid":{const l=new jn,c=new it(s(new kf(.012,1)),s(new Ml({color:7035466,emissive:16734736,emissiveIntensity:.6}))),u=new it(s(new vi(1,24,16)),s(new gi({color:16765834,transparent:!0,opacity:.9,depthWrite:!1,blending:Us}))),h=new it(s(new Yi(.95,1,96)),o(16756848));l.add(c,u,h);const f=Ti(e.lat,e.lon),p=new N(f[0],f[1],f[2]),_=new N(0,1,0).cross(p).normalize(),y=p.clone().multiplyScalar(3).addScaledVector(_,1.5);let m=0;return{obj:l,dispose:a,update:(d,g)=>{m+=g;const v=Math.min(1,m/1.6);c.visible=v<1,c.position.lerpVectors(y,p.clone().multiplyScalar(1.01),v*v),c.rotation.x+=g*4;const S=m-1.6;u.visible=S>0&&S<2.5,u.visible&&(u.position.copy(p).multiplyScalar(1),u.scale.setScalar(n*.5*Math.min(1,S*2)),u.material.opacity=Math.max(0,.9-S*.36)),h.visible=S>0&&S<6,h.visible&&(hs(h,e.lat,e.lon,1.006),h.scale.setScalar(n*Math.min(2.5,S*.6)),h.material.opacity=Math.max(0,.9-S*.15))}}}case"meteorShower":{const c=s(new Tt),u=new Float32Array(24*6);c.setAttribute("position",new Bt(u,3));const h=new sA(c,s(new c_({color:16769696,transparent:!0,opacity:.9,blending:Us}))),f=Array.from({length:24},()=>[Math.random(),Math.random(),Math.random()]);return{obj:h,dispose:a,update:(p,_,y)=>{const m=Ti(y.lat,y.lon),d=new N(m[0],m[1],m[2]),g=new N(0,1,0).cross(d).normalize(),v=d.clone().cross(g).normalize();for(let S=0;S<24;S++){const[b,C,A]=f[S],P=(A+p*.6)%1,V=g.clone().multiplyScalar((b-.5)*n*1.6).add(v.clone().multiplyScalar((C-.5)*n*1.6)),x=d.clone().multiplyScalar(1.01+(1-P)*.25).add(V).addScaledVector(g,(1-P)*.12),w=x.clone().addScaledVector(d,.03).addScaledVector(g,.02);u.set([x.x,x.y,x.z,w.x,w.y,w.z],S*6)}c.attributes.position.needsUpdate=!0}}}case"iceAge":case"climateChange":return null;default:{const l=EA[e.type]??16777215,c=new it(s(new If(1,64)),s(new gi({color:l,transparent:!0,opacity:.22,depthWrite:!1,side:ln}))),u=new it(s(new Yi(.97,1,64)),o(l,.7)),h=new jn;return h.add(c,u),{obj:h,dispose:a,update:(f,p,_)=>{hs(h,_.lat,_.lon,Math.max(1.004,i())),h.scale.setScalar(n),c.material.opacity=.16+.08*Math.sin(f*3)}}}}}}const Fu={low:{seg:[160,80],patch:48,trees:600,dpr:1},medium:{seg:[320,160],patch:72,trees:1800,dpr:1.5},high:{seg:[640,320],patch:110,trees:4e3,dpr:2}};class TA{constructor(e,n){this.container=e,this.scene=new Ym,this.terrain=new _A,this.starScene=new Ym,this.sun=new cA(16777215,2.4),this.baseDirs=new Float32Array(0),this.quality="high",this.raf=0,this.last=performance.now(),this.frames=0,this.fpsT=performance.now(),this.fps=0,this.day=0,this.showClouds=!0,this.atmoDensity=1,this.globalTint=new Fe(1,1,1),this.hasTerrain=!1,this.hideUniforms={dir:{value:new N(0,1,0)},cos:{value:2}},this.loop=()=>{this.raf=requestAnimationFrame(this.loop);const a=performance.now(),o=Math.min(.1,(a-this.last)/1e3);this.last=a,this.frames++,a-this.fpsT>1e3&&(this.fps=this.frames*1e3/(a-this.fpsT),this.frames=0,this.fpsT=a),this.controller.update(o);const l=this.camera.position.length()-1,c=this.controller.mode==="surface",u=this.controller.sfCur;this.patch.update(c&&l<.3,u.lat,u.lon,u.range);const h=this.patch.group.visible;this.hideUniforms.dir.value.copy(this.patch.hideDir),this.hideUniforms.cos.value=h?this.patch.hideCos:2,this.effects.update(o);const f=23.44*Math.sin(2*Math.PI*(mA(this.day)-80)/365)*(Math.PI/180),p=this.camera.position,_=Math.atan2(p.z,p.x)-.75,y=new N(Math.cos(f)*Math.cos(_),Math.sin(f),Math.cos(f)*Math.sin(_));c&&y.lerp(p.clone().normalize(),.5).normalize(),this.sun.position.copy(y).multiplyScalar(10),this.atmoMat.uniforms.uSunDir.value.copy(y);const m=this.atmoDensity;this.atmoMat.uniforms.uIntensity.value=(.5+.6*Math.sqrt(m))*(c?.6:1),this.atmoMat.uniforms.uColor.value.setRGB(.35*this.globalTint.r,.65*this.globalTint.g,1*this.globalTint.b),this.atmo.visible=l>.01;const d=this.clouds.material;this.clouds.visible=this.showClouds,d.opacity=Math.max(.12,Math.min(1,(l-.02)/.15)),this.starCam.quaternion.copy(this.camera.quaternion),this.starCam.fov=this.camera.fov,this.renderer.clear(),this.renderer.render(this.starScene,this.starCam),this.renderer.render(this.scene,this.camera)},this.renderer=new nA({antialias:!0,powerPreference:"high-performance"}),this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,2)),this.renderer.outputColorSpace=yn,this.renderer.autoClear=!1,e.appendChild(this.renderer.domElement),this.renderer.domElement.style.touchAction="none",this.camera=new Sn(45,1,.01,10),this.starCam=new Sn(45,1,.1,200),this.starScene.add(SA()),this.surfaceTex=new yh(new Uint8Array(qi*Ki*4),qi,Ki,En),this.surfaceTex.colorSpace=yn,this.surfaceTex.wrapS=Yl,this.surfaceTex.magFilter=Kt,this.surfaceTex.minFilter=yi,this.surfaceTex.generateMipmaps=!0,this.surfaceTex.anisotropy=4,this.cloudTex=new yh(new Uint8Array(qi*Ki*4),qi,Ki,En),this.cloudTex.colorSpace=yn,this.cloudTex.magFilter=Kt,this.cloudTex.minFilter=Kt;const i=new Ml({map:this.surfaceTex,roughness:.92,metalness:0});i.onBeforeCompile=a=>{a.uniforms.uHideDir=this.hideUniforms.dir,a.uniforms.uHideCos=this.hideUniforms.cos,a.vertexShader=a.vertexShader.replace("#include <common>",`#include <common>
varying vec3 vObjDir;`).replace("#include <begin_vertex>",`#include <begin_vertex>
vObjDir = normalize(position);`),a.fragmentShader=a.fragmentShader.replace("#include <common>",`#include <common>
varying vec3 vObjDir;
uniform vec3 uHideDir;
uniform float uHideCos;`).replace("void main() {",`void main() {
  if (dot(normalize(vObjDir), uHideDir) > uHideCos) discard;`)},this.planet=new it(new vi(1,64,32),i),this.water=new it(new vi(1,160,80),new Ml({color:997982,roughness:.22,metalness:.15,transparent:!0,opacity:.5,depthWrite:!1})),this.water.renderOrder=1,this.clouds=new it(new vi(1.032,128,64),new u_({map:this.cloudTex,transparent:!0,depthWrite:!1})),this.clouds.renderOrder=3,this.atmoMat=yA(new Fe(.35,.65,1),1.1),this.atmo=new it(new vi(1.085,96,48),this.atmoMat),this.atmo.renderOrder=4,this.scene.add(this.planet,this.water,this.clouds,this.atmo),this.scene.add(this.sun,new uA(6719658,.32),new aA(10406399,1709064,.25)),this.scene.add(this.sun.target);const r=new Ml({map:this.surfaceTex,roughness:.95,metalness:0});this.patch=new MA(this.terrain,r,1,Fu.high.patch,Fu.high.trees),this.scene.add(this.patch.group),this.effects=new wA(this.terrain),this.scene.add(this.effects.group),this.brush=new it(new Yi(.94,1,72),new gi({color:5235670,transparent:!0,opacity:.85,side:ln,depthTest:!1})),this.brush.renderOrder=10,this.brush.visible=!1,this.selection=new it(new Yi(.6,1,48),new gi({color:16777215,transparent:!0,opacity:.9,side:ln,depthTest:!1})),this.selection.renderOrder=11,this.selection.visible=!1,this.scene.add(this.brush,this.selection);const s=new Tt;s.setAttribute("position",new Bt(new Float32Array(3*200),3)),s.setAttribute("color",new Bt(new Float32Array(3*200),3)),this.settlementPts=new Nf(s,new wc({size:5,sizeAttenuation:!1,vertexColors:!0,transparent:!0,depthWrite:!1})),this.settlementPts.frustumCulled=!1,this.settlementPts.renderOrder=5,this.scene.add(this.settlementPts),this.controller=new vA(this.camera,this.renderer.domElement,this.terrain,{onTap:(a,o,l)=>{const c=this.pick(a,o);c&&n.onTap(c.lat,c.lon,l)},onModeChange:a=>n.onModeChange(a),onHover:(a,o)=>{if(!this.brush.userData.radiusKm)return;const l=this.pick(a,o);l?(this.placeRing(this.brush,l.lat,l.lon,this.brush.userData.radiusKm),this.brush.visible=!0,n.onHover?.(l.lat,l.lon)):this.brush.visible=!1}}),this.resizeObs=new ResizeObserver(()=>this.resize()),this.resizeObs.observe(e),this.setQuality("high"),this.resize(),this.loop()}dispose(){cancelAnimationFrame(this.raf),this.resizeObs.disconnect(),this.controller.dispose(),this.renderer.dispose(),this.renderer.domElement.remove()}resize(){const e=this.container.clientWidth||1,n=this.container.clientHeight||1;this.renderer.setSize(e,n,!1),this.renderer.domElement.style.width="100%",this.renderer.domElement.style.height="100%",this.camera.aspect=e/n,this.starCam.aspect=e/n,this.camera.updateProjectionMatrix(),this.starCam.updateProjectionMatrix()}setQuality(e){this.quality=e;const n=Fu[e];this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,n.dpr));const i=this.planet.geometry,r=new vi(1,n.seg[0],n.seg[1]);this.baseDirs=Float32Array.from(r.getAttribute("position").array),this.planet.geometry=r,i.dispose(),this.patch.setQuality(n.patch,n.trees);const s=e!=="low";this.surfaceTex.generateMipmaps=s,this.surfaceTex.minFilter=s?yi:Kt,this.surfaceTex.needsUpdate=!0,this.hasTerrain&&this.applyDisplacement(),this.resize()}setSeed(e){this.patch.setSeed(fA(e))}setExaggeration(e){this.terrain.exaggeration=e,this.hasTerrain&&this.applyDisplacement()}setAtmosphere(e){this.atmoDensity=e}setShowClouds(e){this.showClouds=e}setTerrain(e,n){this.terrain.hrElev=e,this.terrain.seaLevel=n,this.hasTerrain=!0,this.applyDisplacement()}applyDisplacement(){const e=this.planet.geometry,n=e.getAttribute("position"),{widthSegments:i,heightSegments:r}=e.parameters,s=this.baseDirs;for(let a=0;a<=r;a++){const o=90-a/r*180;for(let l=0;l<=i;l++){const c=a*(i+1)+l,u=l/i*360-180,h=this.terrain.radiusFor(this.terrain.elevAt(o,u));n.setXYZ(c,s[c*3]*h,s[c*3+1]*h,s[c*3+2]*h)}}n.needsUpdate=!0,e.computeVertexNormals(),e.computeBoundingSphere(),this.patch.invalidate()}setFrame(e){this.surfaceTex.image.data=new Uint8Array(e.surface.buffer),this.surfaceTex.needsUpdate=!0,this.cloudTex.image.data=new Uint8Array(e.clouds.buffer),this.cloudTex.needsUpdate=!0,this.terrain.tree=e.tree,this.terrain.ice=e.ice,Math.abs(e.seaLevel-this.terrain.seaLevel)>.5&&(this.terrain.seaLevel=e.seaLevel,this.applyDisplacement()),this.patch.dataVersion++,this.effects.sync(e.events),this.updateSettlements(e.settlements),this.day=e.stats.day;const n=e.events.some(s=>s.type==="iceAge"),i=e.events.some(s=>s.type==="climateChange");this.globalTint.setRGB(i?1.25:n?.8:1,n?1.05:i?.85:1,n?1.3:i?.7:1);const r=Math.min(1,e.stats.aerosol*.15);this.globalTint.lerp(new Fe(.75,.6,.45),r)}updateSettlements(e){const n=this.settlementPts.geometry,i=n.getAttribute("position"),r=n.getAttribute("color"),s=Math.min(200,e.length);for(let a=0;a<s;a++){const o=e[a],l=this.terrain.surfaceRadius(o.lat,o.lon)+.003,c=Ti(o.lat,o.lon);i.setXYZ(a,c[0]*l,c[1]*l,c[2]*l);const u=Math.min(1,o.tech/10);r.setXYZ(a,1,.75+.2*u,.35+.5*u)}n.setDrawRange(0,s),i.needsUpdate=!0,r.needsUpdate=!0}setBrush(e){this.brush.userData.radiusKm=e,e||(this.brush.visible=!1)}setSelection(e,n=0){if(e===null){this.selection.visible=!1;return}this.placeRing(this.selection,e,n,60),this.selection.visible=!0}placeRing(e,n,i,r){const s=Ti(n,i),a=new N(s[0],s[1],s[2]);e.position.copy(a).multiplyScalar(this.terrain.surfaceRadius(n,i)+.002),e.quaternion.setFromUnitVectors(new N(0,0,1),a);const l=Math.max(.002,this.camera.position.length()-1)*.02;e.scale.setScalar(Math.max(l,r/nc))}pick(e,n){const i=this.renderer.domElement.getBoundingClientRect(),r=new Oe((e-i.left)/i.width*2-1,-((n-i.top)/i.height)*2+1),s=new dA;s.setFromCamera(r,this.camera);const a=s.ray.origin,o=s.ray.direction,l=a.dot(o),c=a.lengthSq()-1.05*1.05,u=l*l-c;if(u<0)return null;let h=Math.max(0,-l-Math.sqrt(u));const f=-l+Math.sqrt(u),p=new N,_=S=>{p.copy(a).addScaledVector(o,S);const b=eo(p.x,p.y,p.z);return p.length()<=this.terrain.surfaceRadius(b.lat,b.lon)},y=160,m=(f-h)/y;let d=-1;for(let S=1;S<=y;S++){const b=h+S*m;if(_(b)){d=b;break}}if(d<0)return null;let g=d-m,v=d;for(let S=0;S<20;S++){const b=(g+v)/2;_(b)?v=b:g=b}return h=v,p.copy(a).addScaledVector(o,h),eo(p.x,p.y,p.z)}}const AA={},mg=t=>{let e;const n=new Set,i=(u,h)=>{const f=typeof u=="function"?u(e):u;if(!Object.is(f,e)){const p=e;e=h??(typeof f!="object"||f===null)?f:Object.assign({},e,f),n.forEach(_=>_(e,p))}},r=()=>e,l={setState:i,getState:r,getInitialState:()=>c,subscribe:u=>(n.add(u),()=>n.delete(u)),destroy:()=>{(AA?"production":void 0)!=="production"&&console.warn("[DEPRECATED] The `destroy` method will be unsupported in a future version. Instead use unsubscribe function returned by subscribe. Everything will be garbage-collected if store is garbage-collected."),n.clear()}},c=e=t(i,r,l);return l},CA=t=>t?mg(t):mg;var m_={exports:{}},g_={},v_={exports:{}},__={};/**
 * @license React
 * use-sync-external-store-shim.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Qs=St;function RA(t,e){return t===e&&(t!==0||1/t===1/e)||t!==t&&e!==e}var bA=typeof Object.is=="function"?Object.is:RA,PA=Qs.useState,LA=Qs.useEffect,DA=Qs.useLayoutEffect,NA=Qs.useDebugValue;function IA(t,e){var n=e(),i=PA({inst:{value:n,getSnapshot:e}}),r=i[0].inst,s=i[1];return DA(function(){r.value=n,r.getSnapshot=e,Ou(r)&&s({inst:r})},[t,n,e]),LA(function(){return Ou(r)&&s({inst:r}),t(function(){Ou(r)&&s({inst:r})})},[t]),NA(n),n}function Ou(t){var e=t.getSnapshot;t=t.value;try{var n=e();return!bA(t,n)}catch{return!0}}function UA(t,e){return e()}var kA=typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"?UA:IA;__.useSyncExternalStore=Qs.useSyncExternalStore!==void 0?Qs.useSyncExternalStore:kA;v_.exports=__;var FA=v_.exports;/**
 * @license React
 * use-sync-external-store-shim/with-selector.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Cc=St,OA=FA;function zA(t,e){return t===e&&(t!==0||1/t===1/e)||t!==t&&e!==e}var BA=typeof Object.is=="function"?Object.is:zA,HA=OA.useSyncExternalStore,VA=Cc.useRef,GA=Cc.useEffect,WA=Cc.useMemo,jA=Cc.useDebugValue;g_.useSyncExternalStoreWithSelector=function(t,e,n,i,r){var s=VA(null);if(s.current===null){var a={hasValue:!1,value:null};s.current=a}else a=s.current;s=WA(function(){function l(p){if(!c){if(c=!0,u=p,p=i(p),r!==void 0&&a.hasValue){var _=a.value;if(r(_,p))return h=_}return h=p}if(_=h,BA(u,p))return _;var y=i(p);return r!==void 0&&r(_,y)?_:(u=p,h=y)}var c=!1,u,h,f=n===void 0?null:n;return[function(){return l(e())},f===null?void 0:function(){return l(f())}]},[e,n,i,r]);var o=HA(t,s[0],s[1]);return GA(function(){a.hasValue=!0,a.value=o},[o]),jA(o),o};m_.exports=g_;var XA=m_.exports;const $A=Sg(XA),x_={},{useDebugValue:YA}=V_,{useSyncExternalStoreWithSelector:qA}=$A;let gg=!1;const KA=t=>t;function ZA(t,e=KA,n){(x_?"production":void 0)!=="production"&&n&&!gg&&(console.warn("[DEPRECATED] Use `createWithEqualityFn` instead of `create` or use `useStoreWithEqualityFn` instead of `useStore`. They can be imported from 'zustand/traditional'. https://github.com/pmndrs/zustand/discussions/1937"),gg=!0);const i=qA(t.subscribe,t.getState,t.getServerState||t.getInitialState,e,n);return YA(i),i}const vg=t=>{(x_?"production":void 0)!=="production"&&typeof t!="function"&&console.warn("[DEPRECATED] Passing a vanilla store will be unsupported in a future version. Instead use `import { useStore } from 'zustand'`.");const e=typeof t=="function"?CA(t):t,n=(i,r)=>ZA(e,i,r);return Object.assign(n,e),n},QA=t=>t?vg(t):vg,ic={seed:"1337",name:"Gaia",landRatio:.32,mountainDensity:.5,oceanDepth:4e3,forestDensity:.6,iceAmount:.4,baseTemperature:14,atmosphereDensity:1},ti={volcano:{label:"Volkanik patlama",defaultRadius:300,defaultDuration:60,icon:"🌋"},earthquake:{label:"Deprem",defaultRadius:400,defaultDuration:3,icon:"〰"},tsunami:{label:"Tsunami",defaultRadius:900,defaultDuration:4,icon:"🌊"},hurricane:{label:"Kasırga",defaultRadius:500,defaultDuration:12,icon:"🌀"},tornado:{label:"Hortum",defaultRadius:80,defaultDuration:2,icon:"🌪"},wildfire:{label:"Orman yangını",defaultRadius:250,defaultDuration:30,icon:"🔥"},flood:{label:"Sel",defaultRadius:350,defaultDuration:20,icon:"💧"},drought:{label:"Kuraklık",defaultRadius:1200,defaultDuration:540,icon:"☀"},coldwave:{label:"Aşırı soğuma",defaultRadius:1500,defaultDuration:60,icon:"❄"},heatwave:{label:"Aşırı sıcaklık",defaultRadius:1500,defaultDuration:45,icon:"♨"},asteroid:{label:"Asteroit çarpması",defaultRadius:900,defaultDuration:1500,icon:"☄"},meteorShower:{label:"Meteor yağmuru",defaultRadius:2e3,defaultDuration:10,icon:"✦"},iceAge:{label:"Buzul çağı",defaultRadius:0,defaultDuration:365*400,global:!0,icon:"🧊"},superstorm:{label:"Büyük fırtına",defaultRadius:1400,defaultDuration:8,icon:"⛈"},climateChange:{label:"Küresel iklim değişimi",defaultRadius:0,defaultDuration:365*200,global:!0,icon:"🌡"},epidemic:{label:"Salgın",defaultRadius:1500,defaultDuration:365,icon:"☣"}},zu={normal:"Normal",temperature:"Sıcaklık",precipitation:"Yağış",elevation:"Yükseklik",vegetation:"Bitki örtüsü",population:"Nüfus",animals:"Hayvan yoğunluğu",disaster:"Felaket",water:"Su kaynakları"},Eh=[1,5,10,50,100,1e3];let JA=1;function eC(){const t=typeof location<"u"?new URLSearchParams(location.search).get("quality"):null;return t==="low"||t==="medium"||t==="high"?t:typeof window<"u"&&(window.matchMedia?.("(max-width: 900px)").matches||/Mobi|Android/i.test(navigator.userAgent))?"medium":"high"}const re=QA((t,e)=>({status:"booting",progress:{msg:"Başlatılıyor",frac:0},params:{...ic},stats:null,history:[],logs:[],events:[],settlements:[],running:!1,speedIdx:2,layer:"normal",tool:"inspect",brushKm:400,strength:.6,speciesId:"grazer",disaster:{type:"volcano",intensity:.6,radiusKm:ti.volcano.defaultRadius,durationDays:ti.volcano.defaultDuration},selected:null,cell:null,cameraMode:"space",dialog:null,mobilePanel:null,toasts:[],jump:{active:!1,frac:0,years:0},settings:{quality:eC(),exaggeration:20,clouds:!0,natural:!0,autosave:!0},saves:[],fps:0,lastSavedAt:null,set:n=>t(n),toast:(n,i="info")=>{const r={id:JA++,text:n,level:i};t({toasts:[...e().toasts.slice(-3),r]}),setTimeout(()=>t({toasts:e().toasts.filter(s=>s.id!==r.id)}),3800)}})),tC="world-simulator",nC=1;let tl=null;function iC(){return tl||(tl=new Promise((t,e)=>{const n=indexedDB.open(tC,nC);n.onupgradeneeded=()=>{const i=n.result;i.objectStoreNames.contains("saves")||i.createObjectStore("saves",{keyPath:"id"}),i.objectStoreNames.contains("saveData")||i.createObjectStore("saveData",{keyPath:"id"}),i.objectStoreNames.contains("seeds")||i.createObjectStore("seeds",{keyPath:"id"})},n.onsuccess=()=>t(n.result),n.onerror=()=>e(n.error)}),tl)}function Yr(t,e,n){return iC().then(i=>new Promise((r,s)=>{const a=i.transaction(t,e);let o;const l=n(a);l&&(l.onsuccess=()=>o=l.result),a.oncomplete=()=>r(o),a.onerror=()=>s(a.error),a.onabort=()=>s(a.error??new Error("transaction aborted"))}))}async function Bu(t,e){await Yr(["saves","saveData"],"readwrite",n=>{n.objectStore("saves").put(t),n.objectStore("saveData").put({id:t.id,data:e})})}async function y_(){return(await Yr(["saves"],"readonly",e=>e.objectStore("saves").getAll())??[]).sort((e,n)=>n.createdAt-e.createdAt)}async function rC(t){return(await Yr(["saveData"],"readonly",n=>n.objectStore("saveData").get(t)))?.data??null}async function S_(t){await Yr(["saves","saveData"],"readwrite",e=>{e.objectStore("saves").delete(t),e.objectStore("saveData").delete(t)})}async function sC(t,e){const i=(await y_()).filter(r=>r.kind==="checkpoint"&&r.seed===e).sort((r,s)=>s.day-r.day);for(const r of i.slice(t))await S_(r.id)}async function Hu(){return(await Yr(["seeds"],"readonly",e=>e.objectStore("seeds").getAll())??[]).sort((e,n)=>n.createdAt-e.createdAt)}async function aC(t){await Yr(["seeds"],"readwrite",e=>{e.objectStore("seeds").put(t)})}async function oC(t){await Yr(["seeds"],"readwrite",e=>{e.objectStore("seeds").delete(t)})}class lC{constructor(){this.frameListeners=new Set,this.terrainListeners=new Set,this.reqId=1,this.pending=new Map,this.autosaveTimer=0,this.lastTerrain=null,this.worker=new Worker(new URL(""+new URL("sim.worker-C7F5Eupm.js",import.meta.url).href,import.meta.url),{type:"module"}),this.worker.onmessage=e=>this.onMessage(e.data),this.worker.onerror=e=>re.getState().toast(`Simülasyon hatası: ${e.message}`,"warn"),this.autosaveTimer=window.setInterval(()=>this.autosave(),9e4)}send(e,n=[]){this.worker.postMessage(e,n)}onFrame(e){return this.frameListeners.add(e),()=>this.frameListeners.delete(e)}onTerrain(e){return this.terrainListeners.add(e),this.lastTerrain&&e(this.lastTerrain.hr,this.lastTerrain.sea,this.lastTerrain.params),()=>this.terrainListeners.delete(e)}onMessage(e){const n=re.getState();switch(e.type){case"progress":n.set({status:"generating",progress:{msg:e.msg,frac:e.frac}});break;case"ready":this.lastTerrain={hr:e.hrElev,sea:e.seaLevel,params:e.params},this.terrainListeners.forEach(i=>i(e.hrElev,e.seaLevel,e.params)),n.set({status:"ready",params:e.params,logs:e.log,history:e.history,selected:null,cell:null}),this.send({type:"setSpeed",speed:Eh[n.speedIdx]}),this.send({type:"setLayer",layer:n.layer}),this.send({type:"setNatural",on:n.settings.natural}),this.send({type:"setRunning",running:n.running});break;case"terrain":this.lastTerrain={hr:e.hrElev,sea:e.seaLevel,params:this.lastTerrain?.params},this.terrainListeners.forEach(i=>i(e.hrElev,e.seaLevel));break;case"frame":{this.frameListeners.forEach(r=>r(e));const i={stats:e.stats,events:e.events,settlements:e.settlements};if(e.history&&(i.history=e.history),e.logs.length){i.logs=[...n.logs,...e.logs].slice(-400);for(const r of e.logs)(r.kind==="extinction"||r.kind==="species")&&n.toast(r.text,r.kind==="extinction"?"warn":"info")}n.set(i);break}case"cell":case"serialized":{const i=this.pending.get(e.reqId);this.pending.delete(e.reqId),i?.(e.type==="cell"?e.info:e.data);break}case"checkpoint":this.storeCheckpoint(e.data,e.day);break;case"jumpProgress":n.set({jump:{active:e.active,frac:e.frac,years:e.years}});break;case"toast":n.toast(e.text,e.level);break;case"error":n.toast(`Hata: ${e.message}`,"warn");break}}generate(e){re.getState().set({status:"generating",progress:{msg:"Gezegen oluşturuluyor",frac:0},params:e,stats:null}),this.send({type:"generate",params:e})}load(e){re.getState().set({status:"generating",progress:{msg:"Kayıt yükleniyor",frac:.5}}),this.send({type:"load",data:e})}setRunning(e){re.getState().set({running:e}),this.send({type:"setRunning",running:e})}setSpeedIdx(e){re.getState().set({speedIdx:e}),this.send({type:"setSpeed",speed:Eh[e]})}setLayer(e){re.getState().set({layer:e}),this.send({type:"setLayer",layer:e})}applyTool(e){this.send({type:"tool",apply:e})}addSpecies(e,n,i){this.send({type:"addSpecies",def:e,lat:n,lon:i})}stopEvent(e){this.send({type:"stopEvent",id:e})}resetEvents(){this.send({type:"resetEvents"})}resetUserForcing(){this.send({type:"resetUserForcing"})}setNatural(e){this.send({type:"setNatural",on:e})}jump(e){this.send({type:"jump",years:e})}cancelJump(){this.send({type:"cancelJump"})}requestFrame(){this.send({type:"requestFrame"})}query(e,n){const i=this.reqId++;return new Promise(r=>{this.pending.set(i,r),this.send({type:"query",lat:e,lon:n,reqId:i})})}serialize(){const e=this.reqId++;return new Promise(n=>{this.pending.set(e,n),this.send({type:"serialize",reqId:e})})}meta(e,n,i,r){const s=re.getState().stats,a=r.meta.params;return{id:e,name:n,kind:i,createdAt:Date.now(),day:r.meta.day,planetName:a.name,seed:a.seed,summary:{temp:s?.meanTemp??0,humans:s?.humans??0,species:s?.species.filter(o=>!o.extinct).length??0}}}async save(e){const n=await this.serialize(),i=`save-${Date.now()}`;await Bu(this.meta(i,e||`${n.meta.params.name} · ${ii(n.meta.day)}`,"manual",n),n),re.getState().set({lastSavedAt:Date.now()}),await this.refreshSaves(),re.getState().toast("Gezegen kaydedildi")}async autosave(){const e=re.getState();if(!(e.status!=="ready"||!e.settings.autosave||e.jump.active))try{const n=await this.serialize();await Bu(this.meta("autosave",`Otomatik kayıt · ${n.meta.params.name}`,"auto",n),n),re.getState().set({lastSavedAt:Date.now()})}catch(n){console.warn("autosave failed",n)}}async storeCheckpoint(e,n){try{const i=e.meta.params;await Bu(this.meta(`cp-${i.seed}-${Math.round(n)}`,`Kayıt noktası · ${ii(n)}`,"checkpoint",e),e),await sC(8,i.seed),await this.refreshSaves()}catch(i){console.warn("checkpoint failed",i)}}async loadSaved(e){const n=await rC(e);if(!n)return re.getState().toast("Kayıt bulunamadı","warn");this.load(n)}async refreshSaves(){re.getState().set({saves:await y_()})}dispose(){clearInterval(this.autosaveTimer),this.worker.terminate()}}const Xe=new lC;globalThis.__sim=Xe;let Ut=null;const cC=new Set(["heat","cool","rain","dry","grass","forest","raise","lower","animals"]);function uC(t,e,n){const i=re.getState();i.status==="ready"&&(n&&!cC.has(i.tool)||(i.set({selected:{lat:t,lon:e}}),Ut?.setSelection(t,e),i.tool!=="inspect"&&Xe.applyTool({tool:i.tool,lat:t,lon:e,radiusKm:i.tool==="disaster"?i.disaster.radiusKm:i.brushKm,strength:n?i.strength*.5:i.strength,speciesId:i.speciesId,disaster:i.tool==="disaster"?i.disaster:void 0}),Xe.query(t,e).then(r=>re.getState().set({cell:r}))))}function dC(){const t=St.useRef(null);return St.useEffect(()=>{if(!t.current)return;let e;try{e=new TA(t.current,{onTap:uC,onModeChange:o=>re.getState().set({cameraMode:o})})}catch(o){re.getState().toast("WebGL başlatılamadı: "+(o instanceof Error?o.message:String(o)),"warn");return}Ut=e,window.__renderer=e;const n=re.getState();e.setQuality(n.settings.quality),e.setExaggeration(n.settings.exaggeration),e.setShowClouds(n.settings.clouds);const i=Xe.onTerrain((o,l,c)=>{e.setTerrain(o,l),c&&(e.setSeed(c.seed),e.setAtmosphere(c.atmosphereDensity))}),r=Xe.onFrame(o=>e.setFrame(o)),s=setInterval(()=>re.getState().set({fps:e.fps}),1e3),a=re.subscribe((o,l)=>{if(o.settings!==l.settings&&(o.settings.quality!==l.settings.quality&&e.setQuality(o.settings.quality),o.settings.exaggeration!==l.settings.exaggeration&&e.setExaggeration(o.settings.exaggeration),e.setShowClouds(o.settings.clouds)),o.tool!==l.tool||o.brushKm!==l.brushKm||o.disaster!==l.disaster){const c=o.tool==="inspect"?null:o.tool==="disaster"?ti[o.disaster.type].global?null:o.disaster.radiusKm:o.brushKm;e.setBrush(c)}o.selected!==l.selected&&!o.selected&&e.setSelection(null)});return()=>{i(),r(),a(),clearInterval(s),e.dispose(),Ut=null}},[]),M.jsx("div",{ref:t,className:"planet-view","data-testid":"planet-view"})}function hC(){const t=re(u=>u.params),e=re(u=>u.stats?.day??0),n=re(u=>u.running),i=re(u=>u.jump),r=re(u=>u.stats?.simSpeedDaysPerSec??0),s=re(u=>u.fps),a=re(u=>u.set),o=re(u=>u.mobilePanel),l=p_(e),c=i.active?`Zaman sıçraması %${Math.round(i.frac*100)}`:n?"Çalışıyor":"Duraklatıldı";return M.jsxs("header",{className:"topbar",children:[M.jsx("button",{className:"icon-btn mobile-only","aria-label":"Araçlar",onClick:()=>a({mobilePanel:o==="left"?null:"left"}),children:"☰"}),M.jsxs("div",{className:"brand",children:[M.jsx("span",{className:"logo",children:"◐"}),M.jsxs("div",{children:[M.jsx("div",{className:"planet-name",children:t.name}),M.jsxs("div",{className:"sub",children:["seed ",t.seed]})]})]}),M.jsxs("div",{className:"date-block",children:[M.jsx("div",{className:"date",children:ii(e)}),M.jsxs("div",{className:"sub",children:["K: ",l.seasonNorth," · G: ",l.seasonSouth]})]}),M.jsxs("div",{className:`status-chip ${i.active?"jump":n?"on":"off"}`,"data-testid":"sim-status",children:[M.jsx("span",{className:"dot"}),c,n&&!i.active&&M.jsx("span",{className:"eff",children:r>=365?`${(r/365).toFixed(1)} yıl/sn`:`${r.toFixed(1)} gün/sn`})]}),M.jsx("div",{className:"spacer"}),M.jsxs("span",{className:"fps desktop-only",children:[s.toFixed(0)," FPS"]}),M.jsxs("nav",{className:"top-actions",children:[M.jsx("button",{onClick:()=>a({dialog:"new"}),children:"Yeni gezegen"}),M.jsx("button",{onClick:()=>{Xe.refreshSaves(),a({dialog:"saves"})},children:"Kayıtlar"}),M.jsx("button",{onClick:()=>a({dialog:"settings"}),"aria-label":"Ayarlar",children:"Ayarlar"}),M.jsx("button",{className:"desktop-only",onClick:()=>a({dialog:"about"}),children:"Model"})]}),M.jsx("button",{className:"icon-btn mobile-only","aria-label":"İstatistikler",onClick:()=>a({mobilePanel:o==="right"?null:"right"}),children:"▤"})]})}function fC(){const t=re(n=>n.layer),e=Object.keys(zu);return M.jsxs("div",{className:"layerbar",children:[M.jsx("div",{className:"chips desktop-only",children:e.map(n=>M.jsx("button",{className:n===t?"chip active":"chip",onClick:()=>Xe.setLayer(n),children:zu[n]},n))}),M.jsx("select",{className:"mobile-only",value:t,onChange:n=>Xe.setLayer(n.target.value),"aria-label":"Harita katmanı",children:e.map(n=>M.jsx("option",{value:n,children:zu[n]},n))}),M.jsx(mC,{layer:t})]})}const pC={temperature:{grad:"linear-gradient(90deg,#283caa,#4696dc,#ebf0f0,#f5aa46,#c82828)",lo:"-40°C",hi:"+40°C"},precipitation:{grad:"linear-gradient(90deg,#e6dca0,#78c8c8,#2878d2,#1e2896)",lo:"0",hi:"3000 mm/yıl"},elevation:{grad:"linear-gradient(90deg,#0a1e5a,#5aaad2,#468c46,#aab45a,#be8c50,#f5f5f5)",lo:"-6 km",hi:"+6 km"},vegetation:{grad:"linear-gradient(90deg,#c8b478,#8cbe50,#1e7832,#0a461e)",lo:"çıplak",hi:"yoğun orman"},population:{grad:"linear-gradient(90deg,#3c143c,#c83228,#faaa32,#fffac8)",lo:"seyrek",hi:"yoğun"},animals:{grad:"linear-gradient(90deg,#281e46,#783caa,#dc78c8,#ffdcf0)",lo:"az",hi:"çok (log)"},disaster:{grad:"linear-gradient(90deg,#3c143c,#c83228,#faaa32,#fffac8)",lo:"hasar yok",hi:"yüksek"},water:{grad:"linear-gradient(90deg,#e6dca0,#78c8c8,#2878d2,#1e2896)",lo:"kurak",hi:"bol su"}};function mC({layer:t}){const e=pC[t];return e?M.jsxs("div",{className:"legend",children:[M.jsx("span",{children:e.lo}),M.jsx("i",{style:{background:e.grad}}),M.jsx("span",{children:e.hi})]}):null}function Ct(t,e=0){if(!isFinite(t))return"—";const n=Math.abs(t);return n>=1e12?(t/1e12).toLocaleString("tr-TR",{maximumFractionDigits:1})+" trilyon":n>=1e9?(t/1e9).toLocaleString("tr-TR",{maximumFractionDigits:1})+" milyar":n>=1e6?(t/1e6).toLocaleString("tr-TR",{maximumFractionDigits:1})+" milyon":n>=1e4?Math.round(t).toLocaleString("tr-TR"):t.toLocaleString("tr-TR",{maximumFractionDigits:e,minimumFractionDigits:0})}const Mi=t=>`${t.toLocaleString("tr-TR",{maximumFractionDigits:1,minimumFractionDigits:1})}°C`;function gC(t,e){return`${Math.abs(t).toFixed(1)}°${t>=0?"K":"G"} ${Math.abs(e).toFixed(1)}°${e>=0?"D":"B"}`}function M_(t){return t>.02?{s:"▲",c:"up"}:t<-.02?{s:"▼",c:"down"}:{s:"■",c:"flat"}}const _g=[{id:"inspect",label:"Bölge seç",icon:"⌖",hint:"Bölgeye dokun: ayrıntılı veriler"},{id:"heat",label:"Isıt",icon:"▲°",hint:"Bölgesel sıcaklık +"},{id:"cool",label:"Soğut",icon:"▼°",hint:"Bölgesel sıcaklık −"},{id:"rain",label:"Yağış +",icon:"☂",hint:"Yağış çarpanını artır"},{id:"dry",label:"Yağış −",icon:"☀",hint:"Yağış çarpanını azalt"},{id:"grass",label:"Bitki örtüsü",icon:"❀",hint:"Ot ve çalı ekle"},{id:"forest",label:"Orman",icon:"♣",hint:"Ağaç örtüsü ekle"},{id:"lake",label:"Göl",icon:"◍",hint:"Karada göl çanağı kaz"},{id:"raise",label:"Yükselt",icon:"⛰",hint:"Araziyi yükselt"},{id:"lower",label:"Alçalt",icon:"⌄",hint:"Araziyi alçalt"},{id:"animals",label:"Hayvan ekle",icon:"🐾",hint:"Seçili türün popülasyonunu ekle"},{id:"settlement",label:"Yerleşim",icon:"⌂",hint:"Yeni yerleşim kur"}];function vC(){const[t,e]=St.useState("tools"),n=re(i=>i.mobilePanel);return M.jsxs("aside",{className:`panel left ${n==="left"?"open":""}`,"data-testid":"left-panel",children:[M.jsxs("div",{className:"drawer-actions",children:[M.jsx("button",{onClick:()=>re.getState().set({dialog:"new",mobilePanel:null}),children:"Yeni gezegen"}),M.jsx("button",{onClick:()=>{Xe.refreshSaves(),re.getState().set({dialog:"saves",mobilePanel:null})},children:"Kayıtlar"}),M.jsx("button",{onClick:()=>re.getState().set({dialog:"settings",mobilePanel:null}),children:"Ayarlar"}),M.jsx("button",{onClick:()=>re.getState().set({dialog:"about",mobilePanel:null}),children:"Model"})]}),M.jsx("div",{className:"panel-title",children:"TANRI MODU"}),M.jsxs("div",{className:"tabs",children:[M.jsx("button",{className:t==="tools"?"active":"",onClick:()=>e("tools"),children:"Araçlar"}),M.jsx("button",{className:t==="disasters"?"active":"",onClick:()=>e("disasters"),children:"Felaketler"}),M.jsx("button",{className:t==="life"?"active":"",onClick:()=>e("life"),children:"Canlılar"})]}),M.jsxs("div",{className:"panel-body",children:[t==="tools"&&M.jsx(_C,{}),t==="disasters"&&M.jsx(yC,{}),t==="life"&&M.jsx(MC,{})]})]})}function _C(){const t=re(c=>c.tool),e=re(c=>c.brushKm),n=re(c=>c.strength),i=re(c=>c.settings.natural),r=re(c=>c.settings),s=re(c=>c.set),a=re(c=>c.stats?.species??[]),o=re(c=>c.speciesId),l=_g.find(c=>c.id===t);return M.jsxs(M.Fragment,{children:[M.jsx("div",{className:"tool-grid",children:_g.map(c=>M.jsxs("button",{className:`tool ${t===c.id?"active":""}`,title:c.hint,onClick:()=>s({tool:c.id}),"data-testid":`tool-${c.id}`,children:[M.jsx("span",{className:"ti",children:c.icon}),M.jsx("span",{children:c.label})]},c.id))}),M.jsxs("p",{className:"hint",children:[l?l.hint:"Felaket aracı seçili"," — gezegene dokun",t!=="inspect"?", basılı tut: sürekli uygula":"","."]}),t==="animals"&&M.jsxs("label",{className:"field",children:["Tür",M.jsx("select",{value:o,onChange:c=>s({speciesId:c.target.value}),children:a.filter(c=>c.category!=="microbe"||!0).map(c=>M.jsxs("option",{value:c.id,children:[c.name,c.extinct?" (yok oldu)":""]},c.id))})]}),M.jsxs("label",{className:"field",children:["Fırça yarıçapı ",M.jsxs("b",{children:[e," km"]}),M.jsx("input",{type:"range",min:50,max:2e3,step:25,value:e,onChange:c=>s({brushKm:+c.target.value})})]}),M.jsxs("label",{className:"field",children:["Güç ",M.jsxs("b",{children:["%",Math.round(n*100)]}),M.jsx("input",{type:"range",min:.05,max:1,step:.05,value:n,onChange:c=>s({strength:+c.target.value})})]}),M.jsx("div",{className:"row",children:M.jsx("button",{className:"ghost",onClick:()=>Xe.resetUserForcing(),children:"Bölgesel iklim müdahalelerini sıfırla"})}),M.jsxs("label",{className:"check",children:[M.jsx("input",{type:"checkbox",checked:i,onChange:c=>{s({settings:{...r,natural:c.target.checked}}),Xe.setNatural(c.target.checked),re.getState().toast(c.target.checked?"Doğal olaylar açık":"Doğal olaylar kapalı")}}),"Doğal olaylar (volkan, deprem, kasırga, yangın…)"]})]})}const xC=Object.keys(ti);function yC(){const t=re(o=>o.tool),e=re(o=>o.disaster),n=re(o=>o.set),i=re(o=>o.events),r=o=>{const l=ti[o];n({tool:"disaster",disaster:{type:o,intensity:e.intensity,radiusKm:l.defaultRadius,durationDays:l.defaultDuration}})},s=ti[e.type],a=()=>{const o=re.getState().selected,l=Ut?.controller.focusLatLon()??{lat:0,lon:0},c=s.global?{lat:0,lon:0}:o??l;Xe.applyTool({tool:"disaster",lat:c.lat,lon:c.lon,radiusKm:e.radiusKm,strength:1,disaster:e})};return M.jsxs(M.Fragment,{children:[M.jsx("div",{className:"dis-grid",children:xC.map(o=>M.jsxs("button",{className:`dis ${t==="disaster"&&e.type===o?"active":""}`,onClick:()=>r(o),"data-testid":`dis-${o}`,children:[M.jsx("span",{className:"ti",children:ti[o].icon}),ti[o].label]},o))}),M.jsxs("div",{className:"card",children:[M.jsxs("div",{className:"card-title",children:[s.icon," ",s.label]}),M.jsxs("label",{className:"field",children:["Şiddet ",M.jsxs("b",{children:["%",Math.round(e.intensity*100)]}),M.jsx("input",{type:"range",min:.1,max:1,step:.05,value:e.intensity,onChange:o=>n({disaster:{...e,intensity:+o.target.value}})})]}),!s.global&&M.jsxs("label",{className:"field",children:["Etki alanı ",M.jsxs("b",{children:[e.radiusKm," km"]}),M.jsx("input",{type:"range",min:30,max:4e3,step:10,value:e.radiusKm,onChange:o=>n({disaster:{...e,radiusKm:+o.target.value}})})]}),M.jsxs("label",{className:"field",children:["Süre ",M.jsx("b",{children:e.durationDays>=365?`${(e.durationDays/365).toFixed(1)} yıl`:`${Math.round(e.durationDays)} gün`}),M.jsx("input",{type:"range",min:0,max:1,step:.001,value:Math.log(e.durationDays)/Math.log(365*1e3),onChange:o=>n({disaster:{...e,durationDays:Math.max(1,Math.round(Math.pow(365*1e3,+o.target.value)))}})})]}),M.jsx("p",{className:"hint",children:s.global?"Küresel olay — konum gerekmez.":"Konum için gezegene dokunun ya da seçili/merkez noktada başlatın."}),M.jsx("button",{className:"primary",onClick:a,"data-testid":"start-disaster",children:s.global?"Başlat":"Seçili noktada başlat"})]}),M.jsxs("div",{className:"card",children:[M.jsxs("div",{className:"card-title",children:["Aktif olaylar (",i.length,")"]}),i.length===0&&M.jsx("p",{className:"hint",children:"Aktif olay yok."}),M.jsx("ul",{className:"ev-list",children:i.map(o=>M.jsxs("li",{children:[M.jsxs("span",{children:[ti[o.type].icon," ",ti[o.type].label]}),M.jsx("progress",{max:1,value:Math.min(1,o.elapsedDays/o.durationDays)}),M.jsx("button",{className:"mini",onClick:()=>Ut?.controller.flyTo(o.lat,o.lon),title:"Konuma git",children:"◎"}),M.jsx("button",{className:"mini danger",onClick:()=>Xe.stopEvent(o.id),title:"Durdur",children:"■"})]},o.id))}),M.jsx("button",{className:"ghost",onClick:()=>Xe.resetEvents(),title:"Kalıcı hasarlar (yanmış alan, ölümler, krater) geri alınmaz; tam geri dönüş için kayıt noktası kullanın.",children:"Tümünü sıfırla"})]})]})}const SC=[{id:"herbivore",label:"Otçul"},{id:"carnivore",label:"Etçil"},{id:"bird",label:"Kuş"},{id:"fish",label:"Balık"},{id:"insect",label:"Böcek"}];function MC(){const t=re(s=>s.stats?.species??[]),e=re(s=>s.set),[n,i]=St.useState({name:"Yeni tür",category:"herbivore",mass:30,tempMin:-10,tempMax:35,repro:.6,life:12,water:.15}),r=()=>{const s=re.getState().selected??Ut?.controller.focusLatLon()??{lat:0,lon:0},a=n.category,o=a==="herbivore"?{grass:.6,shrub:.3,tree:.1}:a==="carnivore"?{herbivore:1}:a==="bird"?{insect:.7,grass:.3}:a==="fish"?{plankton:1}:{grass:.6,shrub:.4};Xe.addSpecies({id:"",name:n.name.slice(0,40)||"Tür",category:a,habitat:a==="fish"?"ocean":"land",diet:o,massKg:n.mass,lifespanYr:n.life,reproRate:n.repro,tempMin:n.tempMin,tempMax:n.tempMax,waterNeed:a==="fish"?0:n.water,dispersal:a==="bird"?.8:.3,color:"#f0c060"},s.lat,s.lon)};return M.jsxs(M.Fragment,{children:[M.jsxs("table",{className:"sp-table",children:[M.jsx("thead",{children:M.jsxs("tr",{children:[M.jsx("th",{children:"Tür"}),M.jsx("th",{children:"Sayı"}),M.jsx("th",{})]})}),M.jsx("tbody",{children:t.map(s=>{const a=M_(s.trend);return M.jsxs("tr",{className:s.extinct?"extinct":"",children:[M.jsxs("td",{children:[M.jsx("i",{className:"sw",style:{background:s.color}}),s.name]}),M.jsx("td",{children:s.extinct?"yok oldu":s.category==="microbe"?`${Ct(s.count)} t`:Ct(s.count)}),M.jsxs("td",{children:[M.jsx("span",{className:`tr ${a.c}`,children:a.s})," ",M.jsx("button",{className:"mini",title:"Bu türü ekleme aracına al",onClick:()=>e({tool:"animals",speciesId:s.id}),children:"+"})]})]},s.id)})})]}),M.jsxs("div",{className:"card",children:[M.jsx("div",{className:"card-title",children:"Yeni canlı türü oluştur"}),M.jsxs("label",{className:"field",children:["Ad",M.jsx("input",{value:n.name,onChange:s=>i({...n,name:s.target.value})})]}),M.jsxs("label",{className:"field",children:["Kategori",M.jsx("select",{value:n.category,onChange:s=>i({...n,category:s.target.value}),children:SC.map(s=>M.jsx("option",{value:s.id,children:s.label},s.id))})]}),M.jsxs("div",{className:"grid2",children:[M.jsxs("label",{className:"field",children:["Kütle (kg)",M.jsx("input",{type:"number",min:.001,max:5e3,step:"any",value:n.mass,onChange:s=>i({...n,mass:Math.max(.001,+s.target.value)})})]}),M.jsxs("label",{className:"field",children:["Ömür (yıl)",M.jsx("input",{type:"number",min:.1,max:200,step:"any",value:n.life,onChange:s=>i({...n,life:Math.max(.1,+s.target.value)})})]}),M.jsxs("label",{className:"field",children:["Min °C",M.jsx("input",{type:"number",value:n.tempMin,onChange:s=>i({...n,tempMin:+s.target.value})})]}),M.jsxs("label",{className:"field",children:["Maks °C",M.jsx("input",{type:"number",value:n.tempMax,onChange:s=>i({...n,tempMax:+s.target.value})})]}),M.jsxs("label",{className:"field",children:["Üreme (/yıl)",M.jsx("input",{type:"number",min:.01,max:50,step:"any",value:n.repro,onChange:s=>i({...n,repro:Math.max(.01,+s.target.value)})})]}),M.jsxs("label",{className:"field",children:["Su ihtiyacı",M.jsx("input",{type:"number",min:0,max:1,step:.05,value:n.water,onChange:s=>i({...n,water:Math.min(1,Math.max(0,+s.target.value))})})]})]}),M.jsx("p",{className:"hint",children:"Tür, seçili bölgenin (yoksa ekran merkezinin) çevresine uygun yaşam alanlarına yerleştirilir."}),M.jsx("button",{className:"primary",onClick:r,"data-testid":"create-species",children:"Türü oluştur"})]})]})}function Er({data:t,color:e,height:n=44,label:i,value:r,log:s}){const a=St.useRef(null);return St.useEffect(()=>{const o=a.current;if(!o)return;const l=Math.min(2,window.devicePixelRatio||1),c=o.clientWidth||200;o.width=c*l,o.height=n*l;const u=o.getContext("2d");if(!u)return;u.scale(l,l),u.clearRect(0,0,c,n);const h=t.map(g=>s?Math.log10(Math.max(1,g)):g).filter(g=>isFinite(g));if(h.length<2)return;let f=Math.min(...h),p=Math.max(...h);p-f<1e-6&&(p+=.5,f-=.5);const _=4,y=g=>_+g/(h.length-1)*(c-_*2),m=g=>n-_-(g-f)/(p-f)*(n-_*2);u.beginPath(),h.forEach((g,v)=>v?u.lineTo(y(v),m(g)):u.moveTo(y(v),m(g))),u.strokeStyle=e,u.lineWidth=1.6,u.stroke(),u.lineTo(y(h.length-1),n),u.lineTo(y(0),n),u.closePath();const d=u.createLinearGradient(0,0,0,n);d.addColorStop(0,e+"55"),d.addColorStop(1,e+"00"),u.fillStyle=d,u.fill(),u.beginPath(),u.arc(y(h.length-1),m(h[h.length-1]),2.5,0,Math.PI*2),u.fillStyle=e,u.fill()},[t,e,n,s]),M.jsxs("div",{className:"spark",children:[M.jsxs("div",{className:"spark-head",children:[M.jsx("span",{children:i}),M.jsx("b",{children:r})]}),M.jsx("canvas",{ref:a,style:{width:"100%",height:n}})]})}const EC=(t,e,n)=>t<e?e:t>n?n:t,xg=["Taş Çağı","Tarım Devrimi","Tunç Çağı","Demir Çağı","Klasik Çağ","Orta Çağ","Sanayi Çağı","Modern Çağ","Bilgi Çağı","Uzay Çağı","İleri Uygarlık"];function wC(t){return xg[EC(Math.floor(t),0,xg.length-1)]}function Nt({k:t,v:e,t:n}){return M.jsxs("div",{className:"kv",title:n,children:[M.jsx("span",{children:t}),M.jsx("b",{children:e})]})}function TC(){const t=re(a=>a.stats),e=re(a=>a.history),n=re(a=>a.logs),i=re(a=>a.mobilePanel),r=St.useMemo(()=>({temp:e.map(a=>a.temp),co2:e.map(a=>a.co2),humans:e.map(a=>a.humans),herb:e.map(a=>a.herb),carn:e.map(a=>a.carn),forest:e.map(a=>a.forest),ice:e.map(a=>a.ice)}),[e]);if(!t)return M.jsx("aside",{className:`panel right ${i==="right"?"open":""}`});const s=t.species.filter(a=>a.category!=="microbe");return M.jsx("aside",{className:`panel right ${i==="right"?"open":""}`,"data-testid":"right-panel",children:M.jsxs("div",{className:"panel-body",children:[M.jsxs("section",{children:[M.jsx("h3",{children:"Gezegen"}),M.jsx(Nt,{k:"Ortalama sıcaklık",v:Mi(t.meanTemp)}),M.jsx(Nt,{k:"Kara / deniz",v:`${Mi(t.meanLandTemp)} / ${Mi(t.meanSeaTemp)}`}),M.jsx(Nt,{k:"CO₂",v:`${t.co2ppm.toFixed(1)} ppm`}),M.jsx(Nt,{k:"Ek ışınımsal zorlama",v:`${t.forcing>=0?"+":""}${t.forcing.toFixed(2)} W/m²`,t:"Başlangıca göre sera + olay zorlaması"}),M.jsx(Nt,{k:"Aerosol (AOD)",v:t.aerosol.toFixed(3)}),M.jsx(Nt,{k:"Deniz seviyesi",v:`${t.seaLevel>=0?"+":""}${t.seaLevel.toFixed(2)} m`}),M.jsx(Nt,{k:"Buz örtüsü",v:`%${t.iceAreaPct.toFixed(1)} (deniz buzu %${t.seaIcePct.toFixed(1)})`})]}),M.jsxs("section",{children:[M.jsx("h3",{children:"İklim"}),M.jsx(Nt,{k:"Ortalama yağış",v:`${Ct(t.meanPrecip)} mm/yıl`}),M.jsx(Nt,{k:"Bağıl nem",v:`%${Math.round(t.meanHumidity*100)}`}),M.jsx(Nt,{k:"Bulut örtüsü",v:`%${Math.round(t.meanCloud*100)}`}),M.jsx(Nt,{k:"Yanan hücre",v:`${t.burningCells}`})]}),M.jsxs("section",{children:[M.jsx("h3",{children:"Ekosistem"}),M.jsx(Nt,{k:"Orman / çayır / çöl",v:`%${t.forestPct.toFixed(0)} / %${t.grassPct.toFixed(0)} / %${t.desertPct.toFixed(0)}`,t:"Kara yüzeyine oran"}),M.jsx(Nt,{k:"Bitki biyokütlesi",v:`${Ct(t.plantBiomassGt)} Gt`}),M.jsx("div",{className:"mini-species",children:s.map(a=>{const o=M_(a.trend);return M.jsxs("div",{className:a.extinct?"extinct":"",children:[M.jsx("i",{className:"sw",style:{background:a.color}}),M.jsx("span",{children:a.name}),M.jsx("b",{children:a.extinct?"—":Ct(a.count)}),M.jsx("span",{className:`tr ${o.c}`,children:o.s})]},a.id)})})]}),M.jsxs("section",{children:[M.jsx("h3",{children:"Uygarlık"}),M.jsx(Nt,{k:"Nüfus",v:Ct(t.humans)}),M.jsx(Nt,{k:"Yerleşim",v:`${t.settlements}`}),M.jsx(Nt,{k:"En ileri dönem",v:t.settlements?wC(t.maxTech):"—",t:`Teknoloji ${t.maxTech.toFixed(2)}`}),M.jsx(Nt,{k:"Gıda oranı",v:t.settlements?`${t.meanFood.toFixed(2)}×`:"—",t:"Üretim / ihtiyaç (nüfus ağırlıklı)"}),M.jsx(Nt,{k:"Tarım arazisi",v:`${Ct(t.farmlandKm2)} km²`})]}),M.jsxs("section",{children:[M.jsx("h3",{children:"Zaman serileri"}),M.jsx(Er,{label:"Sıcaklık",value:Mi(t.meanTemp),data:r.temp,color:"#ff8a5c"}),M.jsx(Er,{label:"CO₂",value:`${t.co2ppm.toFixed(0)} ppm`,data:r.co2,color:"#c7a3ff"}),M.jsx(Er,{label:"İnsan nüfusu",value:Ct(t.humans),data:r.humans,color:"#ffd36b",log:!0}),M.jsx(Er,{label:"Otçullar",value:Ct(r.herb[r.herb.length-1]??0),data:r.herb,color:"#6fdc8c",log:!0}),M.jsx(Er,{label:"Etçiller",value:Ct(r.carn[r.carn.length-1]??0),data:r.carn,color:"#ff6b6b",log:!0}),M.jsx(Er,{label:"Orman (kara %)",value:`%${t.forestPct.toFixed(1)}`,data:r.forest,color:"#3fb37f"}),M.jsx(Er,{label:"Buz (yüzey %)",value:`%${t.iceAreaPct.toFixed(1)}`,data:r.ice,color:"#9fd8ff"})]}),M.jsxs("section",{children:[M.jsx("h3",{children:"Olay günlüğü"}),M.jsx("ul",{className:"log",children:n.slice(-40).reverse().map((a,o)=>M.jsxs("li",{className:a.kind,onClick:()=>a.lat!==void 0&&Ut?.controller.flyTo(a.lat,a.lon??0),children:[M.jsx("time",{children:ii(a.day)}),M.jsx("span",{children:a.text})]},o))})]})]})})}const AC=[{y:10,l:"+10 yıl"},{y:100,l:"+100 yıl"},{y:1e3,l:"+1.000 yıl"},{y:1e5,l:"+100 bin"},{y:1e6,l:"+1 milyon"}];function CC(){const t=re(r=>r.running),e=re(r=>r.speedIdx),n=re(r=>r.jump),i=re(r=>r.status==="ready");return M.jsxs("footer",{className:"bottombar",children:[M.jsxs("div",{className:"time-controls",children:[M.jsx("button",{className:`play ${t?"on":""}`,disabled:!i||n.active,onClick:()=>Xe.setRunning(!t),"data-testid":"play","aria-label":t?"Duraklat":"Devam et",children:t?"❚❚":"▶"}),M.jsx("div",{className:"speeds",children:Eh.map((r,s)=>M.jsxs("button",{className:s===e?"active":"",onClick:()=>Xe.setSpeedIdx(s),"data-testid":`speed-${r}`,children:[r,"x"]},r))}),M.jsx("span",{className:"hint desktop-only",children:"1x = 1 gün/sn"}),M.jsx("div",{className:"jumps",children:n.active?M.jsxs(M.Fragment,{children:[M.jsx("progress",{max:1,value:n.frac}),M.jsxs("span",{children:["%",Math.round(n.frac*100)," · ",n.years.toLocaleString("tr-TR")," yıl"]}),M.jsx("button",{className:"mini danger",onClick:()=>Xe.cancelJump(),children:"Durdur"})]}):AC.map(r=>M.jsx("button",{disabled:!i,onClick:()=>{Xe.setRunning(!1),Xe.jump(r.y)},title:"Hızlandırılmış uzun dönem hesaplaması (yaklaşık)","data-testid":`jump-${r.y}`,children:r.l},r.y))})]}),M.jsx(RC,{})]})}function RC(){const t=re(o=>o.logs),e=re(o=>o.stats?.day??0),n=re(o=>o.saves),i=re(o=>o.params.seed),r=St.useMemo(()=>t.filter(o=>o.kind==="disaster"||o.kind==="extinction"||o.kind==="species"),[t]),s=n.filter(o=>o.kind==="checkpoint"&&o.seed===i&&o.day<=e),a=Math.max(1,e);return M.jsxs("div",{className:"timeline","aria-label":"Zaman çizelgesi",children:[M.jsxs("div",{className:"track",children:[r.map((o,l)=>M.jsx("button",{className:`mark ${o.kind}`,style:{left:`${o.day/a*100}%`},title:`${ii(o.day)} — ${o.text}`,onClick:()=>o.lat!==void 0&&Ut?.controller.flyTo(o.lat,o.lon??0)},l)),s.map(o=>M.jsx("button",{className:"mark checkpoint",style:{left:`${o.day/a*100}%`},title:`Kayıt noktası: ${ii(o.day)} — geri dönmek için tıklayın`,onClick:()=>{confirm(`${ii(o.day)} kayıt noktasına dönülsün mü? Kaydedilmemiş ilerleme kaybolur.`)&&Xe.loadSaved(o.id)}},o.id))]}),M.jsxs("div",{className:"tl-labels",children:[M.jsx("span",{children:ii(0)}),M.jsx("span",{children:ii(e)})]})]})}const bC=["K","KD","D","GD","G","GB","B","KB"];function PC(){const t=re(s=>s.selected),e=re(s=>s.cell),n=re(s=>s.set),i=re(s=>s.cameraMode);if(St.useEffect(()=>{if(!t)return;const s=setInterval(()=>Xe.query(t.lat,t.lon).then(a=>re.getState().set({cell:a})),1e3);return()=>clearInterval(s)},[t]),!t||!e)return null;const r=e;return M.jsxs("div",{className:"region-card","data-testid":"region-card",children:[M.jsxs("div",{className:"rc-head",children:[M.jsxs("div",{children:[M.jsxs("div",{className:"rc-title",children:["BÖLGE: ",r.region]}),M.jsxs("div",{className:"sub",children:[gC(r.lat,r.lon)," · ",r.biome]})]}),M.jsx("button",{className:"icon-btn","aria-label":"Kapat",onClick:()=>n({selected:null,cell:null}),children:"×"})]}),M.jsxs("div",{className:"rc-grid",children:[M.jsx("span",{children:"Sıcaklık"}),M.jsx("b",{children:Mi(r.temp)}),M.jsx("span",{children:"Yıllık ort."}),M.jsx("b",{children:Mi(r.tempAnnual)}),r.seaTemp!==null&&M.jsxs(M.Fragment,{children:[M.jsx("span",{children:"Deniz sıcaklığı"}),M.jsx("b",{children:Mi(r.seaTemp)})]}),M.jsx("span",{children:"Nem (bağıl)"}),M.jsxs("b",{children:["%",Math.round(r.humidity*100)]}),M.jsx("span",{children:"Yağış"}),M.jsxs("b",{children:[Ct(r.precipAnnual)," mm/yıl"]}),M.jsx("span",{children:"Basınç"}),M.jsxs("b",{children:[r.pressure.toFixed(0)," hPa"]}),M.jsx("span",{children:"Rüzgâr"}),M.jsxs("b",{children:[r.windSpeed.toFixed(1)," m/s ",bC[Math.round(r.windDir/45)%8]]}),M.jsx("span",{children:"Bulut"}),M.jsxs("b",{children:["%",Math.round(r.cloud*100)]}),M.jsx("span",{children:"Yükseklik"}),M.jsxs("b",{children:[Ct(r.elevation)," m"]}),r.isLand&&M.jsxs(M.Fragment,{children:[M.jsx("span",{children:"Toprak nemi"}),M.jsxs("b",{children:["%",Math.round(r.soilWater*100)]}),M.jsx("span",{children:"Su kaynağı"}),M.jsxs("b",{children:["%",Math.round(r.waterIndex*100)]}),M.jsx("span",{children:"Kar / buzul"}),M.jsxs("b",{children:[Ct(r.snowMm)," mm / ",Ct(r.iceM)," m"]}),M.jsx("span",{children:"Örtü (ağaç/ot/çalı)"}),M.jsxs("b",{children:["%",Math.round(r.tree*100)," / %",Math.round(r.grass*100)," / %",Math.round(r.shrub*100)]}),r.farm>.01&&M.jsxs(M.Fragment,{children:[M.jsx("span",{children:"Tarım"}),M.jsxs("b",{children:["%",Math.round(r.farm*100)]})]})]}),M.jsx("span",{children:"Hayvan popülasyonu"}),M.jsx("b",{children:Ct(r.animalTotal)}),M.jsx("span",{children:"İnsan nüfusu"}),M.jsx("b",{children:Ct(r.humans)}),M.jsx("span",{children:"Ekolojik durum"}),M.jsx("b",{className:`eco ${r.ecoStatus.startsWith("Dengeli")?"ok":r.ecoStatus.startsWith("Kritik")||r.ecoStatus.startsWith("Aktif")?"bad":"mid"}`,children:r.ecoStatus})]}),r.settlement&&M.jsxs("div",{className:"rc-note",children:["⌂ ",r.settlement]}),r.events.length>0&&M.jsxs("div",{className:"rc-note warn",children:["Etkin olaylar: ",r.events.join(", ")]}),r.animals.length>0&&M.jsxs("details",{children:[M.jsxs("summary",{children:["Türler (",r.animals.length,")"]}),M.jsx("ul",{className:"rc-species",children:r.animals.sort((s,a)=>a.count-s.count).map(s=>M.jsxs("li",{children:[M.jsx("span",{children:s.name}),M.jsx("b",{children:Ct(s.count)})]},s.id))})]}),M.jsx("div",{className:"row",children:i==="space"?M.jsx("button",{className:"primary",onClick:()=>Ut?.controller.enterSurface(r.lat,r.lon,.05),"data-testid":"descend",children:"Yüzeye in"}):M.jsx("button",{onClick:()=>Ut?.controller.flyTo(r.lat,r.lon),children:"Buraya git"})}),M.jsx("p",{className:"fineprint",children:"Değerler simülasyon ızgarasından (≈2.25°) gelir; model yaklaşık sonuçlar üretir."})]})}function LC(){const t=re(e=>e.cameraMode);return M.jsxs("div",{className:"cam-buttons",children:[t==="space"?M.jsx("button",{onClick:()=>{const e=Ut?.controller.focusLatLon();e&&Ut?.controller.enterSurface(e.lat,e.lon,.06)},"data-testid":"to-surface",children:"Yüzey modu"}):M.jsx("button",{onClick:()=>Ut?.controller.exitToSpace(),"data-testid":"to-space",children:"Uzay modu"}),M.jsx("button",{onClick:()=>{Ut&&(Ut.controller.autoRotate=!Ut.controller.autoRotate)},title:"Otomatik dönüş",children:"⟳"}),M.jsx("button",{onClick:()=>Ut?.controller.zoom(.7),"aria-label":"Yakınlaş",children:"+"}),M.jsx("button",{onClick:()=>Ut?.controller.zoom(1.4),"aria-label":"Uzaklaş",children:"−"})]})}function nl({title:t,children:e,onClose:n}){return M.jsx("div",{className:"modal-back",onClick:n,children:M.jsxs("div",{className:"modal",onClick:i=>i.stopPropagation(),role:"dialog","aria-label":t,children:[M.jsxs("div",{className:"modal-head",children:[M.jsx("h2",{children:t}),M.jsx("button",{className:"icon-btn",onClick:n,"aria-label":"Kapat",children:"×"})]}),M.jsx("div",{className:"modal-body",children:e})]})})}function DC(){const t=re(i=>i.dialog),e=re(i=>i.set),n=()=>e({dialog:null});return t==="new"?M.jsx(nl,{title:"Yeni gezegen",onClose:n,children:M.jsx(IC,{onDone:n})}):t==="saves"?M.jsx(nl,{title:"Kayıtlar",onClose:n,children:M.jsx(UC,{onDone:n})}):t==="settings"?M.jsx(nl,{title:"Ayarlar",onClose:n,children:M.jsx(kC,{})}):t==="about"?M.jsx(nl,{title:"Simülasyon modeli",onClose:n,children:M.jsx(FC,{})}):null}const NC=[{k:"landRatio",label:"Kara oranı",min:.1,max:.7,step:.01,fmt:t=>`%${Math.round(t*100)}`},{k:"mountainDensity",label:"Dağ yoğunluğu",min:0,max:1,step:.05,fmt:t=>`%${Math.round(t*100)}`},{k:"oceanDepth",label:"Okyanus derinliği",min:1500,max:7e3,step:100,fmt:t=>`${Ct(t)} m`},{k:"forestDensity",label:"Orman yoğunluğu",min:0,max:1,step:.05,fmt:t=>`%${Math.round(t*100)}`},{k:"iceAmount",label:"Buzul miktarı",min:0,max:1,step:.05,fmt:t=>`%${Math.round(t*100)}`},{k:"baseTemperature",label:"Başlangıç sıcaklığı (küresel ort.)",min:-5,max:30,step:.5,fmt:t=>Mi(t)},{k:"atmosphereDensity",label:"Atmosfer yoğunluğu",min:.3,max:3,step:.1,fmt:t=>`${t.toFixed(1)}× Dünya`}];function IC({onDone:t}){const e=re(l=>l.params),[n,i]=St.useState({...e}),[r,s]=St.useState([]);St.useEffect(()=>{Hu().then(s).catch(()=>{})},[]);const a=()=>{Xe.setRunning(!1),Xe.generate({...n,name:n.name.trim()||"Gaia",seed:n.seed.trim()||String(Date.now()%1e6)}),t()},o=async()=>{await aC({id:`seed-${Date.now()}`,name:`${n.name} (${n.seed})`,params:n,createdAt:Date.now()}),s(await Hu()),re.getState().toast("Seed kaydedildi")};return M.jsxs("div",{className:"form",children:[M.jsxs("div",{className:"grid2",children:[M.jsxs("label",{className:"field",children:["Gezegen adı",M.jsx("input",{value:n.name,onChange:l=>i({...n,name:l.target.value}),"data-testid":"planet-name"})]}),M.jsxs("label",{className:"field",children:["Seed",M.jsxs("div",{className:"row",children:[M.jsx("input",{value:n.seed,onChange:l=>i({...n,seed:l.target.value}),"data-testid":"planet-seed"}),M.jsx("button",{className:"mini",onClick:()=>i({...n,seed:String(Math.floor(Math.random()*1e9))}),title:"Rastgele",children:"⚄"})]})]})]}),NC.map(l=>M.jsxs("label",{className:"field",children:[l.label," ",M.jsx("b",{children:l.fmt(n[l.k])}),M.jsx("input",{type:"range",min:l.min,max:l.max,step:l.step,value:n[l.k],onChange:c=>i({...n,[l.k]:+c.target.value})})]},l.k)),M.jsxs("div",{className:"row",children:[M.jsx("button",{onClick:()=>i({...ic,seed:n.seed,name:n.name}),children:"Varsayılanlar"}),M.jsx("button",{onClick:o,children:"Seed'i kaydet"}),M.jsx("div",{className:"spacer"}),M.jsx("button",{className:"primary",onClick:a,"data-testid":"generate",children:"Oluştur"})]}),r.length>0&&M.jsxs(M.Fragment,{children:[M.jsx("h4",{children:"Kayıtlı seed'ler"}),M.jsx("ul",{className:"save-list",children:r.map(l=>M.jsxs("li",{children:[M.jsx("span",{children:l.name}),M.jsx("button",{className:"mini",onClick:()=>i({...l.params}),children:"Kullan"}),M.jsx("button",{className:"mini danger",onClick:async()=>{await oC(l.id),s(await Hu())},children:"Sil"})]},l.id))})]}),M.jsx("p",{className:"fineprint",children:"Aynı seed ve ayarlar her zaman aynı gezegeni üretir. Oluşturma birkaç saniye sürer (iklim, buzullar ve ekosistem dengelenir)."})]})}function UC({onDone:t}){const e=re(l=>l.saves),n=re(l=>l.lastSavedAt),[i,r]=St.useState(""),[s,a]=St.useState(!1),o=[{k:"manual",t:"Kayıtlar"},{k:"auto",t:"Otomatik kayıt"},{k:"checkpoint",t:"Kayıt noktaları (her 25 simülasyon yılı)"}];return M.jsxs("div",{className:"form",children:[M.jsxs("div",{className:"row",children:[M.jsx("input",{placeholder:"Kayıt adı (isteğe bağlı)",value:i,onChange:l=>r(l.target.value)}),M.jsx("button",{className:"primary",disabled:s,onClick:async()=>{a(!0);try{await Xe.save(i),r("")}catch(l){re.getState().toast("Kayıt başarısız: "+String(l),"warn")}a(!1)},"data-testid":"save-now",children:"Şimdi kaydet"})]}),n&&M.jsxs("p",{className:"fineprint",children:["Son kayıt: ",new Date(n).toLocaleTimeString("tr-TR")]}),o.map(l=>{const c=e.filter(u=>u.kind===l.k);return c.length?M.jsxs("div",{children:[M.jsx("h4",{children:l.t}),M.jsx("ul",{className:"save-list",children:c.map(u=>M.jsxs("li",{"data-testid":"save-item",children:[M.jsxs("div",{children:[M.jsx("b",{children:u.name}),M.jsxs("div",{className:"sub",children:[u.planetName," · seed ",u.seed," · ",ii(u.day)," · ",Mi(u.summary.temp)," · ",Ct(u.summary.humans)," insan · ",new Date(u.createdAt).toLocaleString("tr-TR")]})]}),M.jsx("button",{className:"mini",onClick:()=>{Xe.setRunning(!1),Xe.loadSaved(u.id),t()},"data-testid":"load-save",children:"Yükle"}),M.jsx("button",{className:"mini danger",onClick:async()=>{await S_(u.id),Xe.refreshSaves()},children:"Sil"})]},u.id))})]},l.k):null}),e.length===0&&M.jsx("p",{className:"hint",children:"Henüz kayıt yok."}),M.jsx("p",{className:"fineprint",children:"Kayıtlar tarayıcının IndexedDB deposunda tutulur: arazi, iklim alanları, tüm popülasyonlar, yerleşimler, aktif olaylar ve olay geçmişi dahil."})]})}function kC(){const t=re(i=>i.settings),e=re(i=>i.set),n=i=>e({settings:{...t,...i}});return M.jsxs("div",{className:"form",children:[M.jsxs("label",{className:"field",children:["Grafik kalitesi",M.jsxs("select",{value:t.quality,onChange:i=>n({quality:i.target.value}),children:[M.jsx("option",{value:"low",children:"Düşük (zayıf cihazlar)"}),M.jsx("option",{value:"medium",children:"Orta"}),M.jsx("option",{value:"high",children:"Yüksek"})]})]}),M.jsxs("label",{className:"field",children:["Yükseklik abartısı ",M.jsxs("b",{children:[t.exaggeration,"×"]}),M.jsx("input",{type:"range",min:1,max:60,step:1,value:t.exaggeration,onChange:i=>n({exaggeration:+i.target.value})})]}),M.jsxs("label",{className:"check",children:[M.jsx("input",{type:"checkbox",checked:t.clouds,onChange:i=>n({clouds:i.target.checked})})," Bulut katmanı"]}),M.jsxs("label",{className:"check",children:[M.jsx("input",{type:"checkbox",checked:t.autosave,onChange:i=>n({autosave:i.target.checked})})," Otomatik kayıt (90 sn)"]}),M.jsxs("label",{className:"check",children:[M.jsx("input",{type:"checkbox",checked:t.natural,onChange:i=>{n({natural:i.target.checked}),Xe.setNatural(i.target.checked),re.getState().toast(i.target.checked?"Doğal olaylar açık":"Doğal olaylar kapalı")}})," Doğal olaylar"]}),M.jsx("h4",{children:"Kontroller"}),M.jsxs("ul",{className:"help",children:[M.jsx("li",{children:"Uzay modu: sürükle = döndür, tekerlek / iki parmak = yakınlaş. Çok yakınlaşınca yüzey moduna geçer."}),M.jsx("li",{children:"Yüzey modu: sürükle = kaydır, sağ tık/Shift + sürükle veya iki parmak = bakış açısı, WASD / QE klavye."}),M.jsx("li",{children:"Dokun = bölge seç / aracı uygula; basılı tut = aracı sürekli uygula."})]})]})}function FC(){return M.jsxs("div",{className:"about",children:[M.jsx("p",{children:"Bu simülasyon, gerçek fizik formüllerine dayanan bileşenler ile oynanabilirlik için ayarlanmış yaklaşık modelleri birlikte kullanır. Sonuçlar bilimsel tahmin değildir."}),M.jsx("h4",{children:"Fiziksel temelli (basitleştirilmiş)"}),M.jsxs("ul",{children:[M.jsx("li",{children:"Enleme ve mevsime göre günlük ortalama güneş ışınımı (eğiklik 23,44°)."}),M.jsx("li",{children:"Budyko–Sellers enerji dengesi: OLR = A + B·T, ısı taşınımı, kar/buz-albedo geri beslemesi, kara/okyanus ısı kapasitesi farkı."}),M.jsx("li",{children:"Rakımla sıcaklık düşüşü (6,5 °C/km), barometrik basınç azalması."}),M.jsx("li",{children:"Clausius–Clapeyron (Magnus) nem kapasitesi; yarı-Lagrange nem taşınımı, orografik yağış."}),M.jsx("li",{children:"CO₂ zorlaması ΔF = 5,35·ln(C/C₀); volkanik/çarpma aerosolü ışınımı azaltır."}),M.jsx("li",{children:"Derece-gün kar/buz erimesi, buzul hacmine bağlı deniz seviyesi."}),M.jsx("li",{children:"Öncelik-taşkın (priority-flood) drenajı ile nehirler ve göller."})]}),M.jsx("h4",{children:"Yaklaşık / sezgisel"}),M.jsxs("ul",{children:[M.jsx("li",{children:"Rüzgâr kuşakları, basınç alanı, bulut ve yağış eşikleri."}),M.jsx("li",{children:"Ekosistem: hücre başına biyokütle; lojistik bitki büyümesi, Holling tip-II beslenme, kütleye bağlı (allometrik) tüketim ve yoğunluk sınırları. Bireyler simüle edilmez."}),M.jsx("li",{children:"Uygarlık: gıda/su/teknoloji tabanlı nüfus, göç, salgın ve emisyon modeli — ampirik olarak kalibre edilmemiştir."}),M.jsx("li",{children:"Felaket şiddet ve etki büyüklükleri oynanabilirlik için seçilmiştir."}),M.jsx("li",{children:"Uzun zaman sıçramaları: her adımda tek bir temsili yıl tam modelle hesaplanır; buzullar, CO₂, erozyon ve teknoloji aradaki yıllar için tahmin edilir (ara dinamikler çözülmez)."})]}),M.jsx("p",{className:"fineprint",children:"Izgara: simülasyon 160×80 hücre (~2,25°), arazi 640×320 piksel."})]})}function OC(){const t=re(n=>n.status),e=re(n=>n.progress);return t==="ready"?null:M.jsx("div",{className:"loading","data-testid":"loading",children:M.jsxs("div",{className:"loading-box",children:[M.jsx("div",{className:"spinner"}),M.jsx("div",{children:e.msg}),M.jsx("progress",{max:1,value:e.frac})]})})}function zC(){const t=re(e=>e.toasts);return M.jsx("div",{className:"toasts",children:t.map(e=>M.jsx("div",{className:`toast ${e.level}`,children:e.text},e.id))})}let yg=!1;function BC(){const t=re(e=>e.mobilePanel);return St.useEffect(()=>{if(yg)return;yg=!0,Xe.refreshSaves().catch(()=>{});const n=new URL(location.href).searchParams.get("seed");Xe.generate({...ic,seed:n??ic.seed});const i=s=>{const a=s.target?.tagName;if(!(a==="INPUT"||a==="TEXTAREA"||a==="SELECT")){if(s.code==="Space"){s.preventDefault();const o=re.getState();o.status==="ready"&&!o.jump.active&&Xe.setRunning(!o.running)}s.key==="Escape"&&re.getState().set({dialog:null,mobilePanel:null,tool:"inspect"})}};window.addEventListener("keydown",i);const r=()=>{document.visibilityState==="hidden"&&Xe.autosave()};document.addEventListener("visibilitychange",r)},[]),M.jsxs("div",{className:"app",children:[M.jsx(dC,{}),M.jsx(hC,{}),M.jsx(vC,{}),M.jsx(TC,{}),M.jsxs("div",{className:"center-overlay",children:[M.jsx(fC,{}),M.jsx(LC,{})]}),M.jsx(PC,{}),M.jsx(CC,{}),t&&M.jsx("div",{className:"scrim mobile-only",onClick:()=>re.getState().set({mobilePanel:null})}),M.jsx(DC,{}),M.jsx(zC,{}),M.jsx(OC,{})]})}Iv(document.getElementById("root")).render(M.jsx(St.StrictMode,{children:M.jsx(BC,{})}));
