if(!self.define){let e,t={};const i=(i,n)=>(i=new URL(i+".js",n).href,t[i]||new Promise((t=>{if("document"in self){const e=document.createElement("script");e.src=i,e.onload=t,document.head.appendChild(e)}else e=i,importScripts(i),t()})).then((()=>{let e=t[i];if(!e)throw new Error(`Module ${i} didn’t register its module`);return e})));self.define=(n,s)=>{const r=e||("document"in self?document.currentScript.src:"")||location.href;if(t[r])return;let o={};const l=e=>i(e,r),c={module:{uri:r},exports:o,require:l};t[r]=Promise.all(n.map((e=>c[e]||l(e)))).then((e=>(s(...e),o)))}}define(["./workbox-b8fc7838"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"registerSW.js",revision:"3ca0b8505b4bec776b69afdba2768812"},{revision:null,url:"index.html"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html"),{allowlist:[/^\/$/]})),e.registerRoute(/^https:\/\/wiki.td2.info.pl\/images\/thumb\/.*/,new e.NetworkFirst({cacheName:"sceneries-cache",plugins:[new e.ExpirationPlugin({maxEntries:400,maxAgeSeconds:31536e3}),new e.CacheableResponsePlugin({statuses:[0,200]})]}),"GET")}));