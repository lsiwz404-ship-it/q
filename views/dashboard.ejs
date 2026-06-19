<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<title>لوحة التحكم — Draw Bot</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="icon" href="/public/logo.ico">
<link rel="stylesheet" href="/public/css/style.css">
</head>
<body>
<div id="page-loader">
  <div class="loader-logo">
    <img src="/public/logo.ico" alt="Draw Bot">
    <div class="loader-ring"></div>
    <div class="loader-ring2"></div>
  </div>
  <div class="loader-bar-wrap"><div class="loader-bar" id="lbar"></div></div>
  <div class="loader-text">تحميل لوحة التحكم...</div>
</div>

<nav class="nav">
  <a class="brand" href="/dashboard">
    <img src="/public/logo.ico" class="brand-logo" alt="logo">
    <span class="brand-name">DRAW BOT</span>
  </a>
  <div class="nav-right">
    <% if (user.discordAvatar) { %>
      <div class="nav-user">
        <img src="https://cdn.discordapp.com/avatars/<%= user.discordId %>/<%= user.discordAvatar %>.png" class="nav-avatar" alt="">
        <span class="nav-username"><%= user.username %></span>
      </div>
    <% } else { %>
      <div class="nav-user">
        <span style="font-size:20px;">👤</span>
        <span class="nav-username"><%= user.username %></span>
      </div>
    <% } %>
    <form method="POST" action="/logout" style="margin:0">
      <button class="btn btn-ghost btn-sm" type="submit">خروج</button>
    </form>
  </div>
</nav>

<div class="page">
  <% if (isWindows) { %>
    <div class="banner">🖥️ تشغيل محلي على Windows — للاستضافة الدائمة انشر على Railway.</div>
  <% } %>

  <!-- Welcome Banner -->
  <div class="welcome-banner">
    <% if (user.discordAvatar) { %>
      <img src="https://cdn.discordapp.com/avatars/<%= user.discordId %>/<%= user.discordAvatar %>.png" class="welcome-avatar" alt="">
    <% } else { %>
      <img src="/public/logo.ico" class="welcome-logo" alt="">
    <% } %>
    <div class="welcome-text">
      <h2>أهلاً، <%= user.username %>! 👋</h2>
      <p>مرحباً بك في لوحة تحكم Draw Bot — استضف بوتاتك وتابعها من هنا</p>
    </div>
    <div class="welcome-stats">
      <div class="stat-box">
        <div class="num"><%= bots.length %></div>
        <div class="lbl">بوتات نشطة</div>
      </div>
      <div class="stat-box">
        <div class="num"><%= bots.filter(b=>b.liveStatus==='running').length %></div>
        <div class="lbl">يعمل الآن</div>
      </div>
      <div class="stat-box">
        <div class="num"><%= maxBots - bots.length %></div>
        <div class="lbl">متاح للإضافة</div>
      </div>
    </div>
  </div>

  <!-- Stats Row -->
  <div class="stats-row">
    <div class="stat-card fade-in fade-in-1">
      <div class="s-label">📦 إجمالي البوتات</div>
      <div class="s-value"><%= bots.length %> / <%= maxBots %></div>
      <div class="s-sub">من الحد الأقصى المسموح به</div>
    </div>
    <div class="stat-card fade-in fade-in-2">
      <div class="s-label">✅ بوتات تعمل</div>
      <div class="s-value"><%= bots.filter(b=>b.liveStatus==='running').length %></div>
      <div class="s-sub">تعمل الآن على السيرفر</div>
    </div>
    <div class="stat-card fade-in fade-in-3">
      <div class="s-label">⚠️ متوقفة / تعطلت</div>
      <div class="s-value"><%= bots.filter(b=>b.liveStatus!=='running').length %></div>
      <div class="s-sub">تحتاج انتباهاً</div>
    </div>
    <div class="stat-card fade-in fade-in-4">
      <div class="s-label">🔥 مدة الاستضافة</div>
      <div class="s-value">24/7</div>
      <div class="s-sub">تشغيل دائم بلا انقطاع</div>
    </div>
  </div>

  <!-- Bots Grid -->
  <div class="page-head">
    <div>
      <h1>بوتاتي</h1>
      <p><%= bots.length %> من <%= maxBots %> بوتات مستخدمة</p>
    </div>
    <button class="btn btn-primary" onclick="document.getElementById('createModal').classList.add('open')">
      + بوت جديد
    </button>
  </div>

  <% if (bots.length === 0) { %>
    <div class="bots-grid">
      <div class="empty-state">
        <img src="/public/logo.ico" style="width:60px;opacity:.3;margin-bottom:20px;" alt="">
        <h3>لا توجد بوتات بعد</h3>
        <p>أنشئ أول بوت لك وابدأ الاستضافة الآن</p>
      </div>
    </div>
  <% } else { %>
    <div class="bots-grid">
      <% bots.forEach(bot => { %>
        <a class="bot-card" href="/bots/<%= bot.id %>">
          <div class="bot-card-top">
            <div class="bot-name"><%= bot.name %></div>
            <div class="status <%= bot.liveStatus %>">
              <span class="dot"></span>
              <%= bot.liveStatus === 'running' ? 'يعمل' : bot.liveStatus === 'starting' ? 'يبدأ' : bot.liveStatus === 'restarting' ? 'إعادة تشغيل' : bot.liveStatus === 'crashed' ? 'تعطّل' : 'متوقف' %>
            </div>
          </div>
          <div class="bot-lang"><%= bot.language === 'python' ? '🐍 Python' : '🟢 Node.js' %></div>
          <div class="bot-meta mono"><%= bot.entryFile %></div>
          <div class="bot-meta"><%= bot.uploaded ? '📦 الكود جاهز للتشغيل' : '⚠️ لم يتم رفع الكود بعد' %></div>
        </a>
      <% }) %>
    </div>
  <% } %>
</div>

<!-- Create Modal -->
<div class="modal-bg" id="createModal">
  <div class="modal">
    <h3>
      <img src="/public/logo.ico" class="modal-logo" alt="">
      إنشاء بوت جديد
    </h3>
    <form method="POST" action="/bots/create">
      <div class="field">
        <label>اسم البوت</label>
        <input type="text" name="name" placeholder="مثال: بوت الترحيب" required>
      </div>
      <div class="field">
        <label>لغة البوت</label>
        <select name="language" id="langSelect" onchange="updateEntryPlaceholder()">
          <option value="node">🟢 Node.js (JavaScript)</option>
          <option value="python">🐍 Python</option>
        </select>
      </div>
      <div class="field">
        <label>ملف التشغيل الرئيسي</label>
        <input type="text" name="entryFile" id="entryFileInput" value="index.js" required>
      </div>
      <div style="display:flex;gap:10px;margin-top:4px;">
        <button type="button" class="btn btn-ghost btn-block" onclick="document.getElementById('createModal').classList.remove('open')">إلغاء</button>
        <button type="submit" class="btn btn-primary btn-block">إنشاء البوت</button>
      </div>
    </form>
  </div>
</div>

<footer>
  <img src="/public/logo.ico" alt="">
  Draw Bot © 2026 — استضافة بوتات سريعة وآمنة
</footer>

<script>
function updateEntryPlaceholder(){
  const lang=document.getElementById('langSelect').value;
  document.getElementById('entryFileInput').value=lang==='python'?'bot.py':'index.js';
}
const bar=document.getElementById('lbar');const loader=document.getElementById('page-loader');let w=0;
const iv=setInterval(()=>{w=Math.min(w+Math.random()*18+5,92);bar.style.width=w+'%';},120);
window.addEventListener('load',()=>{clearInterval(iv);bar.style.width='100%';setTimeout(()=>loader.classList.add('done'),400);});
setTimeout(()=>loader.classList.add('done'),2500);
</script>
</body>
</html>
