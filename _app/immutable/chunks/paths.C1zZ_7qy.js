import{n as c,s as _}from"./scheduler.jBqkNYEv.js";const e=[];function q(n,l=c){let o;const i=new Set;function r(t){if(_(n,t)&&(n=t,o)){const b=!e.length;for(const s of i)s[1](),e.push(s,n);if(b){for(let s=0;s<e.length;s+=2)e[s][0](e[s+1]);e.length=0}}}function f(t){r(t(n))}function p(t,b=c){const s=[t,b];return i.add(s),i.size===1&&(o=l(r,f)||c),t(n),()=>{i.delete(s),i.size===0&&o&&(o(),o=null)}}return{set:r,update:f,subscribe:p}}var u;const h=((u=globalThis.__sveltekit_ofqpxw)==null?void 0:u.base)??"/journeypin";var a;const d=((a=globalThis.__sveltekit_ofqpxw)==null?void 0:a.assets)??h;export{d as a,h as b,q as w};