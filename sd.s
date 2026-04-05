DuckDuckGo Images API, Pixabay, Robohash
Open Library API, LocalStorage, React Hooks

<!DOCTYPE html>
<html lang="mn">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Shopify MN — Дэлгүүр</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet"/>
<style>
:root {
  --bg: #0a0a0f;
  --surface: #13131a;
  --surface2: #1c1c27;
  --surface3: #242432;
  --border: rgba(255,255,255,0.07);
  --border2: rgba(255,255,255,0.12);
  --text: #f0f0f5;
  --text2: #9191a8;
  --text3: #5c5c72;
  --accent: #6c63ff;
  --accent2: #8b84ff;
  --accentbg: rgba(108,99,255,0.12);
  --accentborder: rgba(108,99,255,0.3);
  --green: #22c55e;
  --greenbg: rgba(34,197,94,0.1);
  --greenborder: rgba(34,197,94,0.25);
  --red: #f87171;
  --yellow: #fbbf24;
  --qpay: #0066ff;
  --qpaybg: rgba(0,102,255,0.1);
}
*{box-sizing:border-box;margin:0;padding:0;}
html,body{height:100%;font-family:'DM Sans',sans-serif;background:var(--bg);color:var(--text);}

body {
  display:flex;
  align-items:center;
  justify-content:center;
  min-height:100vh;
  background:
    radial-gradient(ellipse 60% 50% at 20% 20%, rgba(108,99,255,0.08) 0%, transparent 70%),
    radial-gradient(ellipse 50% 60% at 80% 80%, rgba(34,197,94,0.05) 0%, transparent 70%),
    #0a0a0f;
}

/* ─── App Shell ─── */
.app {
  width:420px;
  height:760px;
  background:var(--surface);
  border-radius:28px;
  border:1px solid var(--border2);
  display:flex;
  flex-direction:column;
  overflow:hidden;
  box-shadow:
    0 0 0 1px rgba(255,255,255,0.04),
    0 40px 80px rgba(0,0,0,0.6),
    0 0 120px rgba(108,99,255,0.06);
  position:relative;
}

/* ─── Status bar ─── */
.status-bar {
  height:44px;
  padding:0 20px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  flex-shrink:0;
  background:var(--surface);
}
.status-time {font-size:12px;font-weight:600;color:var(--text);letter-spacing:0.3px;}
.status-icons {display:flex;gap:6px;align-items:center;}
.status-icons svg {width:14px;height:14px;fill:var(--text);}
.battery {
  width:22px;height:11px;border:1.5px solid var(--text);border-radius:3px;position:relative;
  display:flex;align-items:center;padding:1.5px;
}
.battery::after{content:'';position:absolute;right:-4px;top:50%;transform:translateY(-50%);width:2px;height:5px;background:var(--text);border-radius:0 1px 1px 0;}
.battery-fill{height:100%;width:75%;background:var(--text);border-radius:1px;}

/* ─── Header ─── */
.header {
  padding:0 20px 16px;
  display:flex;
  align-items:center;
  gap:12px;
  flex-shrink:0;
  border-bottom:1px solid var(--border);
}
.shop-logo {
  width:44px;height:44px;border-radius:14px;
  background:linear-gradient(135deg,#6c63ff,#a78bfa);
  display:flex;align-items:center;justify-content:center;
  font-size:20px;
  flex-shrink:0;
  box-shadow:0 4px 16px rgba(108,99,255,0.35);
}
.shop-info{flex:1;}
.shop-name{font-size:15px;font-weight:600;color:var(--text);letter-spacing:-0.2px;}
.shop-status{
  display:flex;align-items:center;gap:5px;
  font-size:11px;color:var(--text2);margin-top:2px;
}
.online-dot{width:6px;height:6px;border-radius:50%;background:var(--green);box-shadow:0 0 6px rgba(34,197,94,0.6);}
.header-actions{display:flex;gap:8px;}
.icon-btn {
  width:34px;height:34px;border-radius:10px;border:1px solid var(--border);
  background:var(--surface2);display:flex;align-items:center;justify-content:center;cursor:pointer;
  transition:all 0.15s;
}
.icon-btn:hover{background:var(--surface3);border-color:var(--border2);}
.icon-btn svg{width:15px;height:15px;stroke:var(--text2);fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}

/* ─── Messages ─── */
.messages {
  flex:1;
  overflow-y:auto;
  padding:20px 16px;
  display:flex;
  flex-direction:column;
  gap:16px;
  scrollbar-width:none;
}
.messages::-webkit-scrollbar{display:none;}

/* date divider */
.date-divider {
  text-align:center;
  font-size:11px;color:var(--text3);
  display:flex;align-items:center;gap:8px;
  font-weight:500;letter-spacing:0.5px;
}
.date-divider::before,.date-divider::after{
  content:'';flex:1;height:1px;background:var(--border);
}

/* message row */
.msg-row{display:flex;gap:8px;align-items:flex-end;animation:msgIn 0.25s cubic-bezier(.34,1.56,.64,1);}
@keyframes msgIn{from{opacity:0;transform:translateY(10px) scale(0.97);}to{opacity:1;transform:none;}}
.msg-row.user{flex-direction:row-reverse;}

.bot-av {
  width:32px;height:32px;border-radius:10px;
  background:linear-gradient(135deg,#6c63ff,#a78bfa);
  display:flex;align-items:center;justify-content:center;
  font-size:14px;flex-shrink:0;
  box-shadow:0 2px 8px rgba(108,99,255,0.3);
}
.user-av {
  width:32px;height:32px;border-radius:10px;
  background:var(--surface3);border:1px solid var(--border2);
  display:flex;align-items:center;justify-content:center;
  font-size:12px;flex-shrink:0;color:var(--text2);font-weight:600;
}

.bubble {
  max-width:72%;
  padding:11px 14px;
  border-radius:16px;
  font-size:14px;line-height:1.55;
  letter-spacing:-0.1px;
}
.bot .bubble {
  background:var(--surface2);
  color:var(--text);
  border:1px solid var(--border);
  border-bottom-left-radius:4px;
}
.user .bubble {
  background:var(--accent);
  color:#fff;
  border-bottom-right-radius:4px;
  box-shadow:0 4px 16px rgba(108,99,255,0.35);
}

.msg-time {
  font-size:10px;color:var(--text3);
  margin-top:4px;padding:0 4px;
  font-family:'DM Mono',monospace;
}
.user .msg-time{text-align:right;}

/* ─── Typing ─── */
.typing-wrap{display:flex;gap:8px;align-items:flex-end;animation:msgIn 0.2s ease;}
.typing-bubble{
  background:var(--surface2);border:1px solid var(--border);
  border-radius:16px;border-bottom-left-radius:4px;
  padding:14px 18px;
  display:flex;gap:5px;align-items:center;
}
.td{width:6px;height:6px;border-radius:50%;background:var(--text3);animation:tdBounce 1.1s infinite;}
.td:nth-child(2){animation-delay:.18s;}
.td:nth-child(3){animation-delay:.36s;}
@keyframes tdBounce{0%,80%,100%{transform:translateY(0);}40%{transform:translateY(-7px);background:var(--accent2);}}

/* ─── Product Card ─── */
.product-card {
  background:var(--surface2);
  border:1px solid var(--border);
  border-radius:18px;
  overflow:hidden;
  width:256px;
  margin-top:6px;
  transition:border-color 0.2s;
}
.product-card:hover{border-color:var(--border2);}
.product-image {
  width:100%;height:130px;
  background:linear-gradient(135deg,#1e1b4b,#312e81,#1e1b4b);
  display:flex;align-items:center;justify-content:center;
  font-size:54px;
  position:relative;overflow:hidden;
}
.product-image::after{
  content:'';position:absolute;inset:0;
  background:radial-gradient(circle at 30% 40%,rgba(108,99,255,0.3),transparent 60%);
}
.product-body{padding:14px;}
.product-badge {
  display:inline-flex;align-items:center;gap:4px;
  background:var(--accentbg);border:1px solid var(--accentborder);
  color:var(--accent2);font-size:10px;font-weight:600;
  padding:3px 8px;border-radius:20px;
  margin-bottom:8px;letter-spacing:0.4px;text-transform:uppercase;
}
.product-name{font-size:14px;font-weight:600;color:var(--text);margin-bottom:3px;letter-spacing:-0.2px;}
.product-meta{font-size:11px;color:var(--text3);margin-bottom:12px;}
.product-footer{display:flex;align-items:center;justify-content:space-between;}
.product-price{font-size:20px;font-weight:600;color:var(--text);letter-spacing:-0.5px;}
.product-price span{font-size:12px;font-weight:400;color:var(--text3);}
.pay-btn {
  padding:9px 16px;
  background:var(--accent);
  color:#fff;border:none;border-radius:10px;
  font-size:12px;font-weight:600;
  cursor:pointer;
  display:flex;align-items:center;gap:6px;
  transition:all 0.15s;
  font-family:'DM Sans',sans-serif;
  letter-spacing:-0.1px;
}
.pay-btn:hover{background:var(--accent2);transform:translateY(-1px);box-shadow:0 4px 16px rgba(108,99,255,0.4);}
.pay-btn:active{transform:translateY(0);}

/* ─── QPay Modal ─── */
.qpay-sheet {
  background:var(--surface);
  border:1px solid var(--border2);
  border-radius:20px;
  padding:0;
  width:280px;
  margin-top:6px;
  overflow:hidden;
}
.qpay-header {
  padding:16px 16px 12px;
  border-bottom:1px solid var(--border);
  display:flex;align-items:center;justify-content:space-between;
}
.qpay-logo-wrap {
  display:flex;align-items:center;gap:8px;
}
.qpay-logo {
  background:#0066ff;
  color:#fff;
  font-size:11px;font-weight:700;
  padding:4px 9px;border-radius:7px;
  letter-spacing:0.5px;
}
.qpay-title-text{font-size:13px;font-weight:500;color:var(--text2);}
.qpay-secure {
  display:flex;align-items:center;gap:4px;
  font-size:10px;color:var(--green);font-weight:500;
}
.qpay-body{padding:16px;}

.qr-area {
  background:#fff;
  border-radius:14px;
  padding:14px;
  display:flex;align-items:center;justify-content:center;
  margin-bottom:12px;
  position:relative;
}
.qr-corner {
  position:absolute;width:16px;height:16px;border-color:#6c63ff;border-style:solid;
  border-width:0;
}
.qr-corner.tl{top:8px;left:8px;border-top-width:2.5px;border-left-width:2.5px;border-top-left-radius:4px;}
.qr-corner.tr{top:8px;right:8px;border-top-width:2.5px;border-right-width:2.5px;border-top-right-radius:4px;}
.qr-corner.bl{bottom:8px;left:8px;border-bottom-width:2.5px;border-left-width:2.5px;border-bottom-left-radius:4px;}
.qr-corner.br{bottom:8px;right:8px;border-bottom-width:2.5px;border-right-width:2.5px;border-bottom-right-radius:4px;}

.amount-section{text-align:center;margin-bottom:14px;}
.amount-label{font-size:11px;color:var(--text3);font-weight:500;letter-spacing:0.4px;text-transform:uppercase;margin-bottom:4px;}
.amount-big{font-size:26px;font-weight:600;color:var(--text);letter-spacing:-1px;font-family:'DM Mono',monospace;}
.amount-big small{font-size:14px;font-weight:400;color:var(--text2);letter-spacing:0;}

.timer-bar-wrap{margin-bottom:14px;}
.timer-label{display:flex;justify-content:space-between;font-size:10px;color:var(--text3);margin-bottom:5px;}
.timer-bar-track{height:3px;background:var(--surface3);border-radius:10px;overflow:hidden;}
.timer-bar-fill{height:100%;background:linear-gradient(90deg,var(--accent),var(--accent2));border-radius:10px;width:100%;transition:width 1s linear;}

.banks-label{font-size:11px;color:var(--text3);font-weight:500;letter-spacing:0.3px;margin-bottom:8px;text-transform:uppercase;}
.banks-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:12px;}
.bank-item {
  background:var(--surface2);
  border:1px solid var(--border);
  border-radius:10px;
  padding:8px 4px;
  text-align:center;
  cursor:pointer;
  transition:all 0.15s;
}
.bank-item:hover{border-color:var(--accentborder);background:var(--accentbg);}
.bank-icon{font-size:16px;margin-bottom:3px;}
.bank-name{font-size:10px;color:var(--text2);font-weight:500;}
.bank-item:hover .bank-name{color:var(--accent2);}

.demo-confirm-btn {
  width:100%;padding:13px;
  background:linear-gradient(135deg,var(--green),#16a34a);
  color:#fff;border:none;border-radius:12px;
  font-size:13px;font-weight:600;
  cursor:pointer;font-family:'DM Sans',sans-serif;
  display:flex;align-items:center;justify-content:center;gap:7px;
  transition:all 0.15s;
  box-shadow:0 4px 16px rgba(34,197,94,0.25);
  letter-spacing:-0.1px;
}
.demo-confirm-btn:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(34,197,94,0.35);}
.demo-confirm-btn:active{transform:translateY(0);}

.qpay-footer{
  padding:10px 16px 14px;
  display:flex;align-items:center;justify-content:center;gap:5px;
  font-size:10px;color:var(--text3);
  border-top:1px solid var(--border);
}

/* ─── Success Card ─── */
.success-sheet {
  background:var(--surface);
  border:1px solid var(--greenborder);
  border-radius:20px;
  overflow:hidden;
  width:272px;
  margin-top:6px;
}
.success-top {
  padding:20px 20px 16px;
  text-align:center;
  background:linear-gradient(180deg,rgba(34,197,94,0.08),transparent);
  border-bottom:1px solid var(--border);
}
.success-ring {
  width:56px;height:56px;border-radius:50%;
  background:var(--greenbg);border:1.5px solid var(--greenborder);
  display:flex;align-items:center;justify-content:center;
  margin:0 auto 10px;
  animation:popIn 0.4s cubic-bezier(.34,1.56,.64,1);
}
@keyframes popIn{from{transform:scale(0.5);opacity:0;}to{transform:scale(1);opacity:1;}}
.success-ring svg{width:26px;height:26px;}
.success-title{font-size:16px;font-weight:600;color:var(--text);margin-bottom:3px;letter-spacing:-0.3px;}
.success-sub{font-size:12px;color:var(--text2);}

.receipt-body{padding:14px 16px 16px;}
.receipt-title{font-size:10px;color:var(--text3);font-weight:600;letter-spacing:0.8px;text-transform:uppercase;margin-bottom:10px;}
.receipt-row{
  display:flex;justify-content:space-between;align-items:center;
  padding:7px 0;border-bottom:1px solid var(--border);
  font-size:12px;
}
.receipt-row:last-child{border-bottom:none;}
.r-label{color:var(--text3);font-weight:400;}
.r-val{color:var(--text);font-weight:500;font-family:'DM Mono',monospace;font-size:11px;}
.r-val.accent{color:var(--accent2);}
.r-val.green{color:var(--green);}
.r-val.price{font-size:14px;font-weight:600;color:var(--text);font-family:'DM Sans',monospace;}

.success-actions{padding:0 16px 16px;display:flex;gap:8px;}
.action-btn {
  flex:1;padding:10px;border-radius:10px;border:1px solid var(--border);
  background:var(--surface2);color:var(--text2);font-size:12px;font-weight:500;
  cursor:pointer;font-family:'DM Sans',sans-serif;text-align:center;
  transition:all 0.15s;
}
.action-btn:hover{border-color:var(--border2);color:var(--text);background:var(--surface3);}

/* ─── Chips ─── */
.chip-row{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;}
.chip {
  padding:6px 12px;
  background:var(--surface2);
  border:1px solid var(--border);
  border-radius:20px;
  font-size:12px;color:var(--text2);
  cursor:pointer;
  transition:all 0.15s;
  font-weight:500;
}
.chip:hover{border-color:var(--accentborder);color:var(--accent2);background:var(--accentbg);}

/* ─── Input Area ─── */
.input-area {
  padding:12px 16px 20px;
  border-top:1px solid var(--border);
  background:var(--surface);
  flex-shrink:0;
  display:flex;gap:10px;align-items:center;
}
.attach-btn {
  width:38px;height:38px;border-radius:12px;border:1px solid var(--border);
  background:var(--surface2);display:flex;align-items:center;justify-content:center;
  cursor:pointer;flex-shrink:0;transition:all 0.15s;
}
.attach-btn:hover{border-color:var(--border2);background:var(--surface3);}
.attach-btn svg{width:16px;height:16px;stroke:var(--text3);fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}
.input-wrap{flex:1;position:relative;}
#user-input {
  width:100%;padding:10px 14px;
  background:var(--surface2);
  border:1px solid var(--border);
  border-radius:12px;
  font-size:14px;color:var(--text);
  outline:none;font-family:'DM Sans',sans-serif;
  transition:border-color 0.2s;
}
#user-input::placeholder{color:var(--text3);}
#user-input:focus{border-color:var(--accentborder);}
.send-btn {
  width:38px;height:38px;border-radius:12px;
  background:var(--accent);border:none;
  display:flex;align-items:center;justify-content:center;
  cursor:pointer;flex-shrink:0;
  transition:all 0.15s;
  box-shadow:0 2px 10px rgba(108,99,255,0.35);
}
.send-btn:hover{background:var(--accent2);transform:translateY(-1px);box-shadow:0 4px 16px rgba(108,99,255,0.45);}
.send-btn:active{transform:translateY(0);}
.send-btn svg{width:16px;height:16px;stroke:#fff;fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;}
</style>
</head>
<body>

<div class="app">
  <!-- Status Bar -->
  <div class="status-bar">
    <div class="status-time" id="status-time">9:41</div>
    <div class="status-icons">
      <svg viewBox="0 0 24 24"><path d="M1 6C8.5-1.5 15.5-1.5 23 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M5 10c4-4 10-4 14 0" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M9 14c1.5-1.5 5.5-1.5 6 0" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="12" cy="18" r="1.5" fill="currentColor"/></svg>
      <div class="battery"><div class="battery-fill"></div></div>
    </div>
  </div>

  <!-- Header -->
  <div class="header">
    <div class="shop-logo">🛍</div>
    <div class="shop-info">
      <div class="shop-name">Shopify Mongolia</div>
      <div class="shop-status">
        <div class="online-dot"></div>
        Идэвхтэй · Ихэвчлэн нэн даруй хариулдаг
      </div>
    </div>
    <div class="header-actions">
      <div class="icon-btn">
        <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      </div>
      <div class="icon-btn">
        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
      </div>
    </div>
  </div>

  <!-- Messages -->
  <div class="messages" id="messages">
    <div class="date-divider">Өнөөдөр</div>
  </div>

  <!-- Input -->
  <div class="input-area">
    <div class="attach-btn">
      <svg viewBox="0 0 24 24"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
    </div>
    <div class="input-wrap">
      <input type="text" id="user-input" placeholder="Мессеж бичих..." onkeydown="if(event.key==='Enter')sendMsg()"/>
    </div>
    <button class="send-btn" onclick="sendMsg()">
      <svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
    </button>
  </div>
</div>

<script>
/* ─── Time ─── */
function updateTime(){
  const n=new Date();
  document.getElementById('status-time').textContent=
    n.getHours().toString().padStart(2,'0')+':'+n.getMinutes().toString().padStart(2,'0');
}
updateTime(); setInterval(updateTime,30000);

const msgs=document.getElementById('messages');
let timerInterval=null;
let timerSecs=300;

function scrollDown(){msgs.scrollTop=msgs.scrollHeight;}
function delay(ms){return new Promise(r=>setTimeout(r,ms));}
function nowTime(){
  const n=new Date();
  return n.getHours().toString().padStart(2,'0')+':'+n.getMinutes().toString().padStart(2,'0');
}

/* ─── Build QR SVG ─── */
function buildQR(){
  const p=[
    [1,1,1,1,1,1,1,0,1,0,1,0,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,0,1,0,0,1,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,0,1,0,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,0,1,0,1,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,1,1,1,0,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,0,0,1,0,1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,0,1,0,1,0,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,1,1,0,1,0,0,0,0,0,0,0],
    [1,0,1,1,0,1,1,1,0,0,1,1,1,0,1,0,1,1,0],
    [0,1,0,0,1,0,0,0,1,0,0,1,0,1,0,0,0,1,0],
    [1,1,1,0,1,1,1,1,0,1,1,0,1,1,1,0,1,0,1],
    [0,0,1,0,0,0,0,1,0,0,1,0,0,0,1,0,0,1,0],
    [1,1,1,1,1,1,1,0,1,1,0,1,1,0,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0],
    [1,1,1,1,1,1,1,0,1,0,1,1,0,0,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,0,1,0,1,1,0,0,1,0,0,0],
    [1,0,1,1,1,0,1,0,1,0,1,0,0,1,1,0,1,1,0],
    [1,0,0,0,0,0,1,0,0,0,1,1,0,0,0,0,0,1,1],
    [1,1,1,1,1,1,1,0,1,1,0,0,1,1,1,1,1,0,1],
  ];
  const cell=7, size=19, total=size*cell;
  let svg=`<svg width="${total}" height="${total}" viewBox="0 0 ${total} ${total}" xmlns="http://www.w3.org/2000/svg">`;
  p.forEach((row,r)=>row.forEach((v,c)=>{
    if(v) svg+=`<rect x="${c*cell+1}" y="${r*cell+1}" width="${cell-1}" height="${cell-1}" fill="#000" rx="1"/>`;
  }));
  svg+='</svg>';
  return svg;
}

/* ─── addRow ─── */
function addRow(el, isUser){
  const row=document.createElement('div');
  row.className='msg-row '+(isUser?'user':'bot');
  if(!isUser){
    const av=document.createElement('div');av.className='bot-av';av.textContent='🛍';row.appendChild(av);
  }
  const col=document.createElement('div');
  col.appendChild(el);
  const t=document.createElement('div');t.className='msg-time';t.textContent=nowTime();
  col.appendChild(t);
  row.appendChild(col);
  if(isUser){
    const av=document.createElement('div');av.className='user-av';av.textContent='Та';row.appendChild(av);
  }
  msgs.appendChild(row);scrollDown();
  return row;
}

function addBubble(text,isUser){
  const b=document.createElement('div');b.className='bubble';b.textContent=text;
  addRow(b,isUser);
}

function showTyping(){
  const row=document.createElement('div');row.className='typing-wrap';row.id='typing';
  const av=document.createElement('div');av.className='bot-av';av.textContent='🛍';row.appendChild(av);
  const tb=document.createElement('div');tb.className='typing-bubble';
  tb.innerHTML='<div class="td"></div><div class="td"></div><div class="td"></div>';
  row.appendChild(tb);msgs.appendChild(row);scrollDown();
}
function removeTyping(){const t=document.getElementById('typing');if(t)t.remove();}

/* ─── Product ─── */
async function showProduct(){
  const card=document.createElement('div');card.className='product-card';
  card.innerHTML=`
    <div class="product-image">🎧</div>
    <div class="product-body">
      <div class="product-badge">
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        Нөөцтэй
      </div>
      <div class="product-name">Sony WH-1000XM5</div>
      <div class="product-meta">Wireless · Noise Cancelling · 30 цаг</div>
      <div class="product-footer">
        <div class="product-price">₮450,000 <span>/ ширхэг</span></div>
        <button class="pay-btn" onclick="startPayment()">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
          Худалдан авах
        </button>
      </div>
    </div>
  `;
  const wrap=document.createElement('div');
  const b=document.createElement('div');b.className='bubble';b.textContent='Танд тохирох бараа олдлоо 👇';
  wrap.appendChild(b);wrap.appendChild(card);
  addRow(wrap,false);
}

/* ─── QPay ─── */
let qpayTimerEl=null;
function showQPay(){
  if(timerInterval) clearInterval(timerInterval);
  timerSecs=300;

  const sheet=document.createElement('div');sheet.className='qpay-sheet';
  sheet.innerHTML=`
    <div class="qpay-header">
      <div class="qpay-logo-wrap">
        <div class="qpay-logo">QPay</div>
        <div class="qpay-title-text">Төлбөрийн мэдээлэл</div>
      </div>
      <div class="qpay-secure">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        Аюулгүй
      </div>
    </div>
    <div class="qpay-body">
      <div class="qr-area">
        <div class="qr-corner tl"></div>
        <div class="qr-corner tr"></div>
        <div class="qr-corner bl"></div>
        <div class="qr-corner br"></div>
        ${buildQR()}
      </div>
      <div class="amount-section">
        <div class="amount-label">Нийт төлбөр</div>
        <div class="amount-big"><small>₮</small>450,000</div>
      </div>
      <div class="timer-bar-wrap">
        <div class="timer-label">
          <span>Хугацаа дуусахад</span>
          <span id="timer-count">5:00</span>
        </div>
        <div class="timer-bar-track">
          <div class="timer-bar-fill" id="timer-bar"></div>
        </div>
      </div>
      <div class="banks-label">Банк сонгох</div>
      <div class="banks-grid">
        <div class="bank-item" onclick="confirmPay()"><div class="bank-icon">🏦</div><div class="bank-name">Хаан банк</div></div>
        <div class="bank-item" onclick="confirmPay()"><div class="bank-icon">🏛</div><div class="bank-name">Голомт</div></div>
        <div class="bank-item" onclick="confirmPay()"><div class="bank-icon">💳</div><div class="bank-name">TDB</div></div>
        <div class="bank-item" onclick="confirmPay()"><div class="bank-icon">🔵</div><div class="bank-name">Хас банк</div></div>
        <div class="bank-item" onclick="confirmPay()"><div class="bank-icon">🟢</div><div class="bank-name">Ардын</div></div>
        <div class="bank-item" onclick="confirmPay()"><div class="bank-icon">📱</div><div class="bank-name">M банк</div></div>
      </div>
      <button class="demo-confirm-btn" onclick="confirmPay()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        Төлбөр баталгаажуулах
      </button>
    </div>
    <div class="qpay-footer">
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      256-bit SSL шифрлэлтээр хамгаалагдсан
    </div>
  `;

  const wrap=document.createElement('div');
  const b=document.createElement('div');b.className='bubble';b.textContent='QPay-р төлбөр хийнэ үү:';
  wrap.appendChild(b);wrap.appendChild(sheet);
  addRow(wrap,false);

  // Start timer
  timerInterval=setInterval(()=>{
    timerSecs--;
    const m=Math.floor(timerSecs/60), s=timerSecs%60;
    const tc=document.getElementById('timer-count');
    const tb=document.getElementById('timer-bar');
    if(tc) tc.textContent=m+':'+(s<10?'0':'')+s;
    if(tb) tb.style.width=(timerSecs/300*100)+'%';
    if(timerSecs<=0){ clearInterval(timerInterval); }
  },1000);
}

/* ─── Confirm Pay ─── */
async function confirmPay(){
  if(timerInterval){ clearInterval(timerInterval); timerInterval=null; }
  addBubble('Хаан банкны QPay-ээр илгээлээ', true);
  showTyping();
  await delay(300);

  // simulate processing
  const processingBubble=document.createElement('div');
  processingBubble.className='bubble';
  processingBubble.innerHTML='⏳ Гүйлгээ боловсруулж байна...';
  addRow(processingBubble,false);
  removeTyping();

  await delay(1800);

  // remove processing bubble's row
  const lastBot=[...msgs.querySelectorAll('.msg-row.bot')];
  const lastRow=lastBot[lastBot.length-1];
  if(lastRow) lastRow.style.opacity='0.4';
  await delay(200);
  if(lastRow) lastRow.remove();

  const txId='QPY-'+Math.random().toString(36).substr(2,6).toUpperCase();
  const now=new Date();
  const dateStr=now.getFullYear()+'.'+(now.getMonth()+1).toString().padStart(2,'0')+'.'+now.getDate().toString().padStart(2,'0');
  const timeStr=now.getHours().toString().padStart(2,'0')+':'+now.getMinutes().toString().padStart(2,'0')+':'+now.getSeconds().toString().padStart(2,'0');

  const sheet=document.createElement('div');sheet.className='success-sheet';
  sheet.innerHTML=`
    <div class="success-top">
      <div class="success-ring">
        <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      </div>
      <div class="success-title">Амжилттай төлөгдлөө!</div>
      <div class="success-sub">QPay гүйлгээ баталгаажлаа</div>
    </div>
    <div class="receipt-body">
      <div class="receipt-title">Гүйлгээний баримт</div>
      <div class="receipt-row"><span class="r-label">Бараа</span><span class="r-val">Sony WH-1000XM5</span></div>
      <div class="receipt-row"><span class="r-label">Тоо ширхэг</span><span class="r-val">1 ш</span></div>
      <div class="receipt-row"><span class="r-label">Дүн</span><span class="r-val price">₮450,000</span></div>
      <div class="receipt-row"><span class="r-label">Гүйлгээний №</span><span class="r-val accent">${txId}</span></div>
      <div class="receipt-row"><span class="r-label">Огноо</span><span class="r-val">${dateStr}</span></div>
      <div class="receipt-row"><span class="r-label">Цаг</span><span class="r-val">${timeStr}</span></div>
      <div class="receipt-row"><span class="r-label">Банк</span><span class="r-val">Хаан банк · QPay</span></div>
      <div class="receipt-row"><span class="r-label">Төлөв</span><span class="r-val green">✓ Баталгаажсан</span></div>
    </div>
    <div class="success-actions">
      <div class="action-btn">📄 Баримт</div>
      <div class="action-btn">📦 Захиалга</div>
    </div>
  `;

  const wrap=document.createElement('div');
  const b=document.createElement('div');b.className='bubble';b.textContent='🎉 Таны төлбөр амжилттай хийгдлээ!';
  wrap.appendChild(b);wrap.appendChild(sheet);
  addRow(wrap,false);

  await delay(700);
  addBubble('Захиалга баталгаажлаа. Хүргэлт 1–3 ажлын өдөрт хийгдэнэ. Баярлалаа! 🙏',false);
}

/* ─── User message ─── */
async function botSay(text){
  showTyping();await delay(850);removeTyping();addBubble(text,false);
}

async function sendMsg(){
  const inp=document.getElementById('user-input');
  const v=inp.value.trim();if(!v)return;
  inp.value='';addBubble(v,true);
  const low=v.toLowerCase();
  if(low.includes('бараа')||low.includes('харах')||low.includes('үзэх')||low.includes('product')){
    showTyping();await delay(900);removeTyping();await showProduct();
  } else if(low.includes('qpay')||low.includes('төлөх')||low.includes('худалдан')){
    showTyping();await delay(700);removeTyping();showQPay();
  } else if(low.includes('хүргэлт')){
    await botSay('Улаанбаатар хотын хаягруу 1–2 ажлын өдөр, орон нутаг руу 3–5 хоног. Хүргэлтийн мэдэгдэл SMS-ээр ирнэ.');
  } else if(low.includes('буцаах')||low.includes('cancel')){
    await botSay('Захиалга буцаах хүсэлтийг 7777-1234 дугаарт залгах эсвэл support@shopify.mn-д имэйл илгээгээрэй.');
  } else if(low.includes('баярлалаа')||low.includes('thanks')){
    await botSay('Танд ч баярлалаа! Дараагийн удаа тавтай морилно уу 🙏');
  } else {
    const r=['Ойлголоо! "бараа харах" гэж бичвэл бараа харуулна 🛍️','Танд туслахдаа таатай байна. Асуулт байвал хэлнэ үү!','Манай дэлгүүрт бусад барааг харахыг хүсвэл "бараа" гэж бичнэ үү.'];
    await botSay(r[Math.floor(Math.random()*r.length)]);
  }
}

function chipClick(v){document.getElementById('user-input').value=v;sendMsg();}

/* ─── Init ─── */
async function init(){
  await delay(400);
  addBubble('Сайн байна уу! Shopify Mongolia-д тавтай морилно уу 👋',false);
  await delay(900);

  const wrap=document.createElement('div');
  const b=document.createElement('div');b.className='bubble';
  b.textContent='Танд хэрхэн туслах вэ?';
  wrap.appendChild(b);
  const chips=document.createElement('div');chips.className='chip-row';
  [['🎧 Бараа харах','бараа харах'],['💳 QPay төлбөр','qpay төлбөр'],['🚚 Хүргэлт','хүргэлт хэдэн хоног'],['📦 Захиалга','захиалга шалгах']].forEach(([l,v])=>{
    const c=document.createElement('div');c.className='chip';c.textContent=l;c.onclick=()=>chipClick(v);chips.appendChild(c);
  });
  wrap.appendChild(chips);

  const row=document.createElement('div');row.className='msg-row bot';
  const av=document.createElement('div');av.className='bot-av';av.textContent='🛍';row.appendChild(av);
  const col=document.createElement('div');col.appendChild(wrap);
  const t=document.createElement('div');t.className='msg-time';t.textContent=nowTime();col.appendChild(t);
  row.appendChild(col);msgs.appendChild(row);scrollDown();
}
init();
</script>
</body>
</html>