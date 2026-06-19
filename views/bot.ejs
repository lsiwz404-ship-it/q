<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<title><%= bot.name %> — Draw Bot</title>
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
  <div class="loader-text">تحميل بيانات البوت...</div>
</div>

<nav class="nav">
  <a class="brand" href="/dashboard">
    <img src="/public/logo.ico" class="brand-logo" alt="logo">
    <span class="brand-name">DRAW BOT</span>
  </a>
  <div class="nav-right">
    <a class="btn btn-ghost btn-sm" href="/dashboard">← لوحة التحكم</a>
  </div>
</nav>

<div class="page">
  <!-- Bot Header -->
  <div class="bot-header">
    <div>
      <h1><%= bot.name %></h1>
      <div class="tags">
        <span class="tag mono"><%= bot.language === 'python' ? '🐍 Python' : '🟢 Node.js' %></span>
        <span class="tag alt mono">entry: <%= bot.entryFile %></span>
        <span class="tag live">⏱ تشغيل دائم 24/7</span>
        <div class="status <%= bot.liveStatus %>" style="margin-right:6px;">
          <span class="dot"></span>
          <span id="statusLabel">
            <%= bot.liveStatus === 'running' ? 'يعمل' : bot.liveStatus === 'starting' ? 'يبدأ...' : bot.liveStatus === 'restarting' ? 'إعادة تشغيل' : bot.liveStatus === 'crashed' ? 'تعطّل' : 'متوقف' %>
          </span>
        </div>
      </div>
    </div>
    <div class="ctrl-row">
      <form method="POST" action="/bots/<%= bot.id %>/start">
        <button class="btn btn-success" <%= (!bot.uploaded || bot.liveStatus==='running' || bot.liveStatus==='starting' || bot.liveStatus==='restarting') ? 'disabled' : '' %>>▶ تشغيل</button>
      </form>
      <form method="POST" action="/bots/<%= bot.id %>/restart">
        <button class="btn btn-ghost" <%= !bot.uploaded ? 'disabled':'' %>>↻ إعادة تشغيل</button>
      </form>
      <form method="POST" action="/bots/<%= bot.id %>/stop">
        <button class="btn btn-danger" <%= (bot.liveStatus!=='running' && bot.liveStatus!=='restarting') ? 'disabled':'' %>>■ إيقاف</button>
      </form>
      <form method="POST" action="/bots/<%= bot.id %>/delete" onsubmit="return confirm('هل تريد حذف هذا البوت نهائياً؟')">
        <button class="btn btn-ghost">🗑</button>
      </form>
    </div>
  </div>

  <!-- Stats Row -->
  <div class="stats-row" style="grid-template-columns:repeat(4,1fr);margin-bottom:20px;">
    <div class="stat-card fade-in fade-in-1">
      <div class="s-label">📊 الحالة</div>
      <div class="s-value" id="statusVal" style="font-size:18px;"><%= bot.liveStatus === 'running' ? '🟢 يعمل' : bot.liveStatus === 'crashed' ? '🔴 تعطّل' : '⚫ متوقف' %></div>
    </div>
    <div class="stat-card fade-in fade-in-2">
      <div class="s-label">💻 اللغة</div>
      <div class="s-value" style="font-size:18px;"><%= bot.language === 'python' ? '🐍 Python' : '🟢 Node.js' %></div>
    </div>
    <div class="stat-card fade-in fade-in-3">
      <div class="s-label">📁 الكود</div>
      <div class="s-value" style="font-size:18px;"><%= bot.uploaded ? '✅ جاهز' : '❌ غير مرفوع' %></div>
    </div>
    <div class="stat-card fade-in fade-in-4">
      <div class="s-label">🔄 إعادة تشغيل تلقائي</div>
      <div class="s-value" style="font-size:18px;">✅ مفعّل</div>
    </div>
  </div>

  <div class="grid-2">
    <div style="display:flex;flex-direction:column;gap:20px;">

      <!-- Code Panel -->
      <div class="panel fade-in fade-in-1">
        <h3>كود البوت</h3>
        <div class="tabs">
          <button type="button" class="tab-btn active" data-tab="editor" onclick="switchTab('editor')">✏️ كتابة/لصق</button>
          <button type="button" class="tab-btn" data-tab="zip" onclick="switchTab('zip')">📦 رفع ZIP</button>
        </div>

        <div id="tab-editor" class="tab-pane active">
          <form method="POST" action="/bots/<%= bot.id %>/save-code" id="codeForm">
            <div class="field">
              <label>محتوى <span class="mono"><%= bot.entryFile %></span></label>
              <textarea name="code" id="codeArea" class="code-area" placeholder="الصق كود البوت هنا..."></textarea>
            </div>
            <div class="field">
              <label><%= bot.language === 'python' ? 'requirements.txt (اختياري)' : 'package.json (اختياري)' %></label>
              <textarea name="deps" id="depsArea" class="code-area small" placeholder="<%= bot.language === 'python' ? 'pyTelegramBotAPI==4.16.1' : '{\n  \"dependencies\": {}\n}' %>"></textarea>
            </div>
            <button class="btn btn-primary btn-block" type="submit">💾 حفظ ونشر الكود</button>
          </form>
        </div>

        <div id="tab-zip" class="tab-pane">
          <form method="POST" action="/bots/<%= bot.id %>/upload" enctype="multipart/form-data">
            <div class="upload-box">
              <div style="font-size:28px;margin-bottom:10px;">📦</div>
              <div>اسحب ملف ZIP أو اضغط للاختيار</div>
              <div style="font-size:12px;color:var(--text-2);margin-top:6px;">يجب أن يحتوي على <span class="mono"><%= bot.entryFile %></span></div>
              <input type="file" name="botzip" accept=".zip" required>
            </div>
            <button class="btn btn-primary btn-block" type="submit">رفع ونشر</button>
          </form>
        </div>
      </div>

      <!-- Info Panel -->
      <div class="panel fade-in fade-in-2">
        <h3>معلومات البوت</h3>
        <div class="kv"><span>الحالة الحالية</span><span class="status <%= bot.liveStatus %>" id="kvStatus"><span class="dot"></span><%= bot.liveStatus === 'running' ? 'يعمل' : bot.liveStatus === 'crashed' ? 'تعطّل' : 'متوقف' %></span></div>
        <div class="kv"><span>اللغة</span><span><%= bot.language === 'python' ? '🐍 Python' : '🟢 Node.js' %></span></div>
        <div class="kv"><span>ملف التشغيل</span><span class="mono"><%= bot.entryFile %></span></div>
        <div class="kv"><span>الكود مرفوع</span><span><%= bot.uploaded ? '✅ نعم' : '❌ لا' %></span></div>
        <div class="kv"><span>إعادة التشغيل التلقائي</span><span style="color:var(--green)">✅ مفعّل</span></div>
        <div class="kv"><span>تاريخ الإنشاء</span><span><%= new Date(bot.createdAt).toLocaleString('ar-EG') %></span></div>
      </div>
    </div>

    <!-- Console Panel -->
    <div class="panel fade-in fade-in-2">
      <h3 style="justify-content:space-between;">
        <span style="display:flex;align-items:center;gap:8px;">
          <span style="width:3px;height:18px;border-radius:3px;background:linear-gradient(var(--blue),var(--cyan));display:block;"></span>
          الكونسول (Logs)
        </span>
        <span style="font-size:12px;color:var(--text-2);font-weight:500;">تحديث تلقائي</span>
      </h3>
      <div class="logs-wrap">
        <div class="logs-box" id="logsBox"><%= logs || 'لا توجد سجلات بعد...' %></div>
        <div class="console-anim"></div>
      </div>
    </div>
  </div>
</div>

<footer>
  <img src="/public/logo.ico" alt="">
  Draw Bot © 2026
</footer>

<script>
const botId = "<%= bot.id %>";
const logsBox = document.getElementById('logsBox');

async function refreshLogs() {
  try {
    const res = await fetch('/bots/' + botId + '/logs');
    const data = await res.json();
    const atBottom = logsBox.scrollTop + logsBox.clientHeight >= logsBox.scrollHeight - 30;
    logsBox.textContent = data.logs || 'لا توجد سجلات بعد...';
    if (atBottom) logsBox.scrollTop = logsBox.scrollHeight;
  } catch(e) {}
}
logsBox.scrollTop = logsBox.scrollHeight;
setInterval(refreshLogs, 2500);

async function loadCode() {
  try {
    const res = await fetch('/bots/' + botId + '/code');
    const data = await res.json();
    if (data.code) document.getElementById('codeArea').value = data.code;
    if (data.deps) document.getElementById('depsArea').value = data.deps;
  } catch(e) {}
}
loadCode();

function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.toggle('active', p.id === 'tab-' + tab));
}

// Loader
const bar=document.getElementById('lbar');const loader=document.getElementById('page-loader');let w=0;
const iv=setInterval(()=>{w=Math.min(w+Math.random()*18+5,92);bar.style.width=w+'%';},120);
window.addEventListener('load',()=>{clearInterval(iv);bar.style.width='100%';setTimeout(()=>loader.classList.add('done'),400);});
setTimeout(()=>loader.classList.add('done'),2500);
</script>
</body>
</html>
