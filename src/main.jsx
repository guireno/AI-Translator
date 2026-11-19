import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

const LANGS = [
  ["id","Indonesia"],["en","English"],["zh-CN","中文 (Mandarin)"],["ja","日本語"],["ko","한국어"],["es","Español"],["fr","Français"],["de","Deutsch"],["ar","العربية"],["th","ไทย"],["ms","Bahasa Melayu"],["pt","Português"],["it","Italiano"],["ru","Русский"],["hi","हिन्दी"]
];
const speechCode = c => ({ "zh-CN":"zh-CN", id:"id-ID", en:"en-US", ja:"ja-JP", ko:"ko-KR", es:"es-ES", fr:"fr-FR", de:"de-DE", ar:"ar-SA", th:"th-TH", ms:"ms-MY", pt:"pt-PT", it:"it-IT", ru:"ru-RU", hi:"hi-IN" }[c] || c);
function App(){
  const [from,setFrom]=useState("en"), [to,setTo]=useState("id");
  const [input,setInput]=useState("Hello! How are you today?");
  const [result,setResult]=useState("");
  const [busy,setBusy]=useState(false), [mode,setMode]=useState("translate");
  const [tab,setTab]=useState("translator"), [listening,setListening]=useState(false);
  const [history,setHistory]=useState(()=>JSON.parse(localStorage.getItem("atp-history")||"[]"));
  const [notice,setNotice]=useState("Siap menerjemahkan");
  const [context,setContext]=useState("");
  const [health,setHealth]=useState({configured:false});
  const [mobileMenu,setMobileMenu]=useState(false);
  useEffect(()=>{fetch("/api/health").then(r=>r.json()).then(setHealth).catch(()=>setHealth({configured:false}));},[]);
  useEffect(()=>{localStorage.setItem("atp-history",JSON.stringify(history.slice(0,40)));},[history]);
  const fromName=useMemo(()=>LANGS.find(x=>x[0]===from)?.[1],[from]);
  const toName=useMemo(()=>LANGS.find(x=>x[0]===to)?.[1],[to]);
  const swap=()=>{setFrom(to);setTo(from);setInput(result||input);setResult("");};
  async function process(){
    if(!input.trim()) return setNotice("Masukkan teks atau gunakan mikrofon terlebih dahulu.");
    setBusy(true);setNotice("AI sedang memproses...");
    try{
      const r=await fetch("/api/translate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text:input,from:fromName,to:toName,mode,context})});
      const data=await r.json(); if(!r.ok) throw new Error(data.error||"Permintaan gagal");
      setResult(data.result);setNotice("Selesai");
      setHistory(h=>[{id:Date.now(),input,output:data.result,from:fromName,to:toName,mode,date:new Date().toLocaleString("id-ID")},...h].slice(0,40));
    }catch(e){setNotice(e.message);}
    finally{setBusy(false);}
  }
  function listen(target){
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){setNotice("Browser ini belum mendukung pengenalan suara. Coba Google Chrome.");return;}
    const rec=new SR();rec.lang=speechCode(target==="input"?from:to);rec.interimResults=false;rec.maxAlternatives=1;
    rec.onstart=()=>{setListening(true);setNotice("Mendengarkan...");};
    rec.onresult=e=>{const words=e.results[0][0].transcript;if(target==="input")setInput(v=>v?`${v} ${words}`:words);else setResult(v=>v?`${v}\n${words}`:words);};
    rec.onerror=()=>setNotice("Mikrofon tidak dapat digunakan. Periksa izin browser.");
    rec.onend=()=>setListening(false);rec.start();
  }
  function speak(text,lang){if(!text)return;if(!("speechSynthesis" in window)){setNotice("Fitur suara tidak didukung browser.");return;}speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang=speechCode(lang);speechSynthesis.speak(u);}
  function copy(text){navigator.clipboard?.writeText(text).then(()=>setNotice("Teks berhasil disalin")).catch(()=>setNotice("Tidak dapat menyalin teks."));}
  return <div className="app-shell">
    <aside className={`sidebar ${mobileMenu?"open":""}`}>
      <div className="brand"><div className="brand-mark">✦</div><div><b>lingua<span>AI</span></b><small>TRANSLATOR PRO</small></div></div>
      <div className="side-label">WORKSPACE</div>
      <button className={`nav-item ${tab==="translator"?"active":""}`} onClick={()=>{setTab("translator");setMobileMenu(false)}}><span>⇄</span> Translator</button>
      <button className={`nav-item ${tab==="history"?"active":""}`} onClick={()=>{setTab("history");setMobileMenu(false)}}><span>◷</span> Riwayat</button>
      <div className="side-bottom"><div className="upgrade"><div className="spark">✧</div><b>Speak without limits</b><p>Terjemahkan percakapan lintas bahasa dengan bantuan AI.</p><span className="mini-tag">AI POWERED</span></div><div className="profile"><div className="avatar">R</div><div><b>Pengguna</b><small>Personal workspace</small></div><span className="dots">•••</span></div></div>
    </aside>
    <main className="main">
      <header className="topbar"><button className="mobile-toggle" onClick={()=>setMobileMenu(!mobileMenu)}>☰</button><div className="crumb">Workspace <span>/</span> {tab==="translator"?"Translator":"Riwayat"}</div><div className="top-right"><span className="status-dot"></span><span>AI Assistant</span><div className="top-avatar">R</div></div></header>
      {tab==="translator"?<section className="content">
        <div className="hero"><div><div className="eyebrow"><span className="pulse"></span> YOUR PERSONAL LANGUAGE COMPANION</div><h1>Words connect<br/><em>worlds.</em></h1><p>Terjemahkan lebih alami. Pahami lebih dalam. Bicara tanpa batas bahasa.</p></div><div className="hero-orb"><div className="orb-inner">文<span>↔</span>A</div><i className="orbit orbit-one"></i><i className="orbit orbit-two"></i></div></div>
        <div className="mode-row"><div className="mode-tabs"><button className={mode==="translate"?"selected":""} onClick={()=>setMode("translate")}>⇄ <span>Terjemahkan</span></button><button className={mode==="reply"?"selected":""} onClick={()=>setMode("reply")}>✧ <span>AI Reply</span><b className="new">AI</b></button></div><div className="secure"><span>⌑</span> Private workspace</div></div>
        <div className="language-bar"><div className="lang-select"><label>FROM</label><select value={from} onChange={e=>setFrom(e.target.value)}>{LANGS.map(([v,n])=><option key={v} value={v}>{n}</option>)}</select></div><button className="swap" onClick={swap} title="Tukar bahasa">⇄</button><div className="lang-select"><label>TO</label><select value={to} onChange={e=>setTo(e.target.value)}>{LANGS.map(([v,n])=><option key={v} value={v}>{n}</option>)}</select></div><div className="quick">◉ <span>Auto detect</span></div></div>
        <div className="translator-grid">
          <div className="panel input-panel"><div className="panel-head"><span>✎ &nbsp;SOURCE TEXT</span><span className="counter">{input.length} / 5,000</span></div><textarea maxLength={5000} value={input} onChange={e=>setInput(e.target.value)} placeholder="Ketik atau tempel teks di sini..."/>{mode==="reply"&&<div className="context-box"><label>CONTEXT (OPTIONAL)</label><input value={context} onChange={e=>setContext(e.target.value)} placeholder="Contoh: membalas pesan calon pelanggan"/></div>}<div className="panel-foot"><div className="tools"><button onClick={()=>setInput("")} title="Hapus">⌫</button><button onClick={()=>listen("input")} className={listening?"recording":""} title="Input suara">🎙</button><button onClick={()=>speak(input,from)} title="Dengarkan">🔊</button></div><span>{fromName}</span></div></div>
          <div className="panel output-panel"><div className="panel-head"><span>✧ &nbsp;{mode==="reply"?"SUGGESTED REPLIES":"TRANSLATION"}</span><span className="ai-pill">✦ AI GENERATED</span></div><div className={`output ${result?"has-result":""}`}>{result||<div className="empty"><div className="empty-icon">文</div><b>Your translation will appear here</b><p>Hasil terjemahan akan muncul di sini.</p></div>}</div><div className="panel-foot"><div className="tools"><button onClick={()=>copy(result)} title="Salin">▢</button><button onClick={()=>speak(result,to)} title="Dengarkan">🔊</button><button onClick={()=>listen("output")} title="Dikte hasil">🎙</button></div><span>{toName}</span></div></div>
        </div>
        <div className="action-row"><div className="notice"><span className="status-dot"></span>{notice}</div><button className="translate-btn" onClick={process} disabled={busy}>{busy?<><span className="spinner"></span> Processing...</>:<><span>✦</span> {mode==="reply"?"Generate reply":"Translate now"} <b>→</b></>}</button></div>
        <div className="tip"><span>✧</span><div><b>Pro tip</b><p>Gunakan mode AI Reply untuk mendapatkan beberapa pilihan balasan dengan nada yang berbeda.</p></div></div>
        <footer>LINGUAAI <span>•</span> MADE FOR CLEARER CONVERSATIONS <span className="footer-right">Version 1.0.0</span></footer>
      </section>:<section className="content history-content"><div className="eyebrow">YOUR ACTIVITY</div><h1 className="history-title">Translation <em>history.</em></h1><p className="history-sub">Percakapan dan terjemahan yang pernah kamu buat.</p>{history.length===0?<div className="empty-history">◷<b>Belum ada riwayat</b><p>Hasil terjemahan akan tersimpan di sini.</p></div>:<div className="history-list">{history.map(item=><article className="history-card" key={item.id}><div className="history-meta"><span>{item.from} → {item.to}</span><small>{item.date}</small></div><b>{item.input}</b><p>{item.output}</p><button onClick={()=>{setInput(item.input);setResult(item.output);setFrom(LANGS.find(x=>x[1]===item.from)?.[0]||"en");setTo(LANGS.find(x=>x[1]===item.to)?.[0]||"id");setTab("translator")}}>Open translation ↗</button></article>)}</div>}<button className="clear-history" onClick={()=>{if(confirm("Hapus semua riwayat?"))setHistory([])}}>Hapus semua riwayat</button></section>}
    </main>
  </div>
}
createRoot(document.getElementById("root")).render(<App/>);
