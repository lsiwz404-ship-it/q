const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const https = require('https');

const db = require('./db');
const pm = require('./processManager');

const app = express();
const PORT = process.env.PORT || 3000;
const MAX_BOTS_PER_USER = parseInt(process.env.MAX_BOTS_PER_USER || '5', 10);

// Discord OAuth config
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || '';
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || '';
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || `http://localhost:${PORT}/auth/discord/callback`;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/public', express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'drawbot-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 }
}));

const upload = multer({ dest: path.join(__dirname, 'uploads'), limits: { fileSize: 25 * 1024 * 1024 } });

// ---------- helpers ----------
function requireAuth(req, res, next) {
  if (!req.session.userId) return res.redirect('/login');
  next();
}
function getUser(req) {
  return db.get('users').find({ id: req.session.userId }).value();
}
function findUserBot(req, botId) {
  return db.get('bots').find({ id: botId, ownerId: req.session.userId }).value();
}
function withLiveStatus(bot) {
  return { ...bot, liveStatus: pm.getStatus(bot.id) };
}

// ---------- Discord OAuth helpers ----------
function discordRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch(e) { resolve(data); }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

// ---------- routes ----------
app.get('/', (req, res) => {
  if (req.session.userId) return res.redirect('/dashboard');
  res.render('landing');
});

// Discord OAuth
app.get('/auth/discord', (req, res) => {
  if (!DISCORD_CLIENT_ID) return res.redirect('/login?error=discord_not_configured');
  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    redirect_uri: DISCORD_REDIRECT_URI,
    response_type: 'code',
    scope: 'identify email'
  });
  res.redirect(`https://discord.com/api/oauth2/authorize?${params}`);
});

app.get('/auth/discord/callback', async (req, res) => {
  const { code, error } = req.query;
  if (error || !code) return res.redirect('/login?error=discord_denied');
  if (!DISCORD_CLIENT_ID) return res.redirect('/login?error=discord_not_configured');

  try {
    // Exchange code for token
    const tokenBody = new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      client_secret: DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: DISCORD_REDIRECT_URI
    }).toString();

    const tokenData = await discordRequest({
      hostname: 'discord.com',
      path: '/api/oauth2/token',
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': tokenBody.length }
    }, tokenBody);

    if (!tokenData.access_token) return res.redirect('/login?error=discord_token_fail');

    // Get user info
    const userInfo = await discordRequest({
      hostname: 'discord.com',
      path: '/api/users/@me',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
    });

    if (!userInfo.id) return res.redirect('/login?error=discord_user_fail');

    // Find or create user
    let user = db.get('users').find({ discordId: userInfo.id }).value();
    if (!user) {
      // Check if username taken
      let username = userInfo.username || userInfo.global_name || 'discord_user';
      const existing = db.get('users').find({ username }).value();
      if (existing) username = username + '_' + userInfo.id.slice(-4);

      user = {
        id: uuidv4(),
        username,
        password: bcrypt.hashSync(uuidv4(), 10), // random pw
        discordId: userInfo.id,
        discordAvatar: userInfo.avatar,
        discordEmail: userInfo.email,
        createdAt: Date.now()
      };
      db.get('users').push(user).write();
    } else {
      // Update avatar
      db.get('users').find({ id: user.id }).assign({ discordAvatar: userInfo.avatar }).write();
    }

    req.session.userId = user.id;
    res.redirect('/dashboard');
  } catch(e) {
    console.error('Discord OAuth error:', e);
    res.redirect('/login?error=discord_error');
  }
});

app.get('/register', (req, res) => {
  if (req.session.userId) return res.redirect('/dashboard');
  res.render('register', { error: null });
});

app.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password || password.length < 4) {
    return res.render('register', { error: 'الرجاء إدخال اسم مستخدم وكلمة مرور لا تقل عن 4 أحرف' });
  }
  const exists = db.get('users').find({ username }).value();
  if (exists) {
    return res.render('register', { error: 'اسم المستخدم محجوز، جرب اسم آخر' });
  }
  const user = { id: uuidv4(), username, password: bcrypt.hashSync(password, 10), createdAt: Date.now() };
  db.get('users').push(user).write();
  req.session.userId = user.id;
  res.redirect('/dashboard');
});

app.get('/login', (req, res) => {
  if (req.session.userId) return res.redirect('/dashboard');
  res.render('login', { error: req.query.error ? 'حدث خطأ أثناء تسجيل الدخول عبر Discord' : null });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.get('users').find({ username }).value();
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.render('login', { error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
  }
  req.session.userId = user.id;
  res.redirect('/dashboard');
});

app.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

// ---------- dashboard ----------
app.get('/dashboard', requireAuth, (req, res) => {
  const user = getUser(req);
  const bots = db.get('bots').filter({ ownerId: user.id }).value().map(withLiveStatus);
  res.render('dashboard', { user, bots, maxBots: MAX_BOTS_PER_USER, isWindows: process.platform === 'win32' });
});

app.post('/bots/create', requireAuth, (req, res) => {
  const user = getUser(req);
  const myBots = db.get('bots').filter({ ownerId: user.id }).value();
  if (myBots.length >= MAX_BOTS_PER_USER) return res.redirect('/dashboard?error=limit');
  const name = (req.body.name || 'بوت').trim().slice(0, 40);
  const language = req.body.language === 'python' ? 'python' : 'node';
  const entryFile = (req.body.entryFile || (language === 'python' ? 'bot.py' : 'index.js')).trim().slice(0, 60);
  const bot = { id: uuidv4(), ownerId: user.id, name, language, entryFile, createdAt: Date.now(), uploaded: false };
  db.get('bots').push(bot).write();
  fs.mkdirSync(pm.botDir(bot.id), { recursive: true });
  pm.appendLog(bot.id, '📦 تم إنشاء البوت. قم برفع ملفات الكود لتشغيله.');
  res.redirect('/bots/' + bot.id);
});

app.get('/bots/:id', requireAuth, (req, res) => {
  const bot = findUserBot(req, req.params.id);
  if (!bot) return res.redirect('/dashboard');
  res.render('bot', { bot: withLiveStatus(bot), logs: pm.readLogs(bot.id, 300) });
});

app.get('/bots/:id/logs', requireAuth, (req, res) => {
  const bot = findUserBot(req, req.params.id);
  if (!bot) return res.status(404).json({ error: 'not found' });
  res.json({ logs: pm.readLogs(bot.id, 300), status: pm.getStatus(bot.id) });
});

app.post('/bots/:id/upload', requireAuth, upload.single('botzip'), (req, res) => {
  const bot = findUserBot(req, req.params.id);
  if (!bot) return res.redirect('/dashboard');
  if (!req.file) return res.redirect('/bots/' + bot.id);
  try {
    const dir = pm.botDir(bot.id);
    for (const f of fs.readdirSync(dir)) {
      if (f === 'run.log') continue;
      fs.rmSync(path.join(dir, f), { recursive: true, force: true });
    }
    const zip = new AdmZip(req.file.path);
    zip.extractAllTo(dir, true);
    fs.unlinkSync(req.file.path);
    db.get('bots').find({ id: bot.id }).assign({ uploaded: true }).write();
    pm.appendLog(bot.id, '📤 تم رفع ملفات جديدة (ZIP) بنجاح');
  } catch(e) {
    pm.appendLog(bot.id, '❌ خطأ في استخراج الملف: ' + e.message);
  }
  res.redirect('/bots/' + bot.id);
});

app.post('/bots/:id/save-code', requireAuth, (req, res) => {
  const bot = findUserBot(req, req.params.id);
  if (!bot) return res.redirect('/dashboard');
  try {
    const dir = pm.botDir(bot.id);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, bot.entryFile), req.body.code || '', 'utf8');
    const depsContent = req.body.deps || '';
    if (depsContent.trim()) {
      const depsFile = bot.language === 'python' ? 'requirements.txt' : 'package.json';
      fs.writeFileSync(path.join(dir, depsFile), depsContent, 'utf8');
    }
    db.get('bots').find({ id: bot.id }).assign({ uploaded: true }).write();
    pm.appendLog(bot.id, '📝 تم حفظ الكود بنجاح (' + bot.entryFile + ')');
  } catch(e) {
    pm.appendLog(bot.id, '❌ خطأ في حفظ الكود: ' + e.message);
  }
  res.redirect('/bots/' + bot.id);
});

app.get('/bots/:id/code', requireAuth, (req, res) => {
  const bot = findUserBot(req, req.params.id);
  if (!bot) return res.status(404).json({ error: 'not found' });
  const dir = pm.botDir(bot.id);
  let code = '', deps = '';
  try {
    const ep = path.join(dir, bot.entryFile);
    if (fs.existsSync(ep)) code = fs.readFileSync(ep, 'utf8');
    const df = bot.language === 'python' ? 'requirements.txt' : 'package.json';
    const dp = path.join(dir, df);
    if (fs.existsSync(dp)) deps = fs.readFileSync(dp, 'utf8');
  } catch(e) {}
  res.json({ code, deps });
});

app.post('/bots/:id/start', requireAuth, (req, res) => {
  const bot = findUserBot(req, req.params.id);
  if (!bot || !bot.uploaded) return res.redirect('/bots/' + req.params.id);
  pm.startBot(bot.id, bot.entryFile);
  res.redirect('/bots/' + bot.id);
});

app.post('/bots/:id/stop', requireAuth, (req, res) => {
  const bot = findUserBot(req, req.params.id);
  if (!bot) return res.redirect('/dashboard');
  pm.stopBot(bot.id, () => {});
  res.redirect('/bots/' + bot.id);
});

app.post('/bots/:id/restart', requireAuth, (req, res) => {
  const bot = findUserBot(req, req.params.id);
  if (!bot) return res.redirect('/dashboard');
  pm.stopBot(bot.id, () => {
    setTimeout(() => pm.startBot(bot.id, bot.entryFile), 800);
  });
  res.redirect('/bots/' + bot.id);
});

app.post('/bots/:id/delete', requireAuth, (req, res) => {
  const bot = findUserBot(req, req.params.id);
  if (!bot) return res.redirect('/dashboard');
  pm.stopBot(bot.id, () => {
    fs.rmSync(pm.botDir(bot.id), { recursive: true, force: true });
    db.get('bots').remove({ id: bot.id }).write();
  });
  res.redirect('/dashboard');
});

app.listen(PORT, () => {
  console.log(`Draw Bot يعمل على المنفذ ${PORT}`);
});
