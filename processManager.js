const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const kill = require('tree-kill');

const running = new Map();
const BOTS_DIR = path.join(__dirname, 'bots');
const MAX_RESTARTS_PER_HOUR = 20;

function botDir(botId) { return path.join(BOTS_DIR, botId); }
function logFile(botId) { return path.join(botDir(botId), 'run.log'); }

function appendLog(botId, line) {
  try {
    const stamp = new Date().toLocaleTimeString('en-GB');
    fs.appendFileSync(logFile(botId), `[${stamp}] ${line}\n`);
  } catch(e) {}
}

function getStatus(botId) {
  const entry = running.get(botId);
  return entry ? entry.status : 'stopped';
}

function getEntry(botId) { return running.get(botId); }

function readLogs(botId, lines = 300) {
  const file = logFile(botId);
  if (!fs.existsSync(file)) return '';
  const content = fs.readFileSync(file, 'utf8');
  const all = content.split('\n');
  return all.slice(Math.max(0, all.length - lines)).join('\n');
}

function clearLogs(botId) {
  try { fs.writeFileSync(logFile(botId), ''); } catch(e) {}
}

function detectLanguage(dir, entryFile) {
  const ext = path.extname(entryFile).toLowerCase();
  if (ext === '.py') return 'python';
  if (ext === '.js' || ext === '.mjs' || ext === '.cjs') return 'node';
  if (fs.existsSync(path.join(dir, 'requirements.txt'))) return 'python';
  return 'node';
}

function pythonCmd() {
  return process.platform === 'win32' ? 'python' : 'python3';
}

function pipInstall(botId, dir, cb) {
  // Try pip3 first, then python3 -m pip, then python -m pip
  const reqPath = path.join(dir, 'requirements.txt');
  if (!fs.existsSync(reqPath)) return cb(null);

  appendLog(botId, '⏳ تثبيت مكتبات Python...');

  // Try pip3 directly
  const tryCommands = [
    ['pip3', ['install', '--no-cache-dir', '-r', 'requirements.txt']],
    ['pip', ['install', '--no-cache-dir', '-r', 'requirements.txt']],
    [pythonCmd(), ['-m', 'pip', 'install', '--no-cache-dir', '-r', 'requirements.txt']],
  ];

  function tryNext(i) {
    if (i >= tryCommands.length) {
      appendLog(botId, '❌ فشل تثبيت مكتبات Python — pip غير متوفر');
      return cb(new Error('pip not found'));
    }
    const [cmd, args] = tryCommands[i];
    const proc = spawn(cmd, args, { cwd: dir, shell: true });
    let output = '';
    proc.stdout.on('data', d => { output += d; appendLog(botId, d.toString().trim()); });
    proc.stderr.on('data', d => { output += d; });
    proc.on('close', code => {
      if (code === 0) {
        appendLog(botId, '✅ تم تثبيت مكتبات Python بنجاح');
        cb(null);
      } else {
        tryNext(i + 1);
      }
    });
    proc.on('error', () => tryNext(i + 1));
  }

  tryNext(0);
}

function installDeps(botId, dir, language, cb) {
  if (language === 'python') {
    return pipInstall(botId, dir, cb);
  }
  if (!fs.existsSync(path.join(dir, 'package.json'))) return cb(null);
  appendLog(botId, '⏳ تثبيت المكتبات (npm install)...');
  const install = spawn('npm', ['install', '--omit=dev', '--no-audit', '--no-fund'], { cwd: dir, shell: true });
  install.stdout.on('data', d => appendLog(botId, d.toString().trim()));
  install.stderr.on('data', d => appendLog(botId, d.toString().trim()));
  install.on('close', code => {
    if (code === 0) { appendLog(botId, '✅ تم تثبيت المكتبات بنجاح'); cb(null); }
    else { appendLog(botId, '❌ فشل تثبيت المكتبات (كود ' + code + ')'); cb(new Error('npm install failed')); }
  });
}

function spawnProcess(botId, entryFile, language, dir, onChange) {
  appendLog(botId, '🚀 تشغيل البوت...');
  const cmd = language === 'python' ? pythonCmd() : 'node';
  const proc = spawn(cmd, [entryFile], {
    cwd: dir,
    env: { ...process.env, PYTHONUNBUFFERED: '1', PYTHONIOENCODING: 'utf-8' },
    shell: false
  });

  const prev = running.get(botId) || {};
  running.set(botId, { ...prev, proc, status: 'running', startedAt: Date.now(), wantStop: false });
  if (onChange) onChange('running');

  proc.stdout.on('data', d => appendLog(botId, d.toString().trimEnd()));
  proc.stderr.on('data', d => appendLog(botId, '⚠️ ' + d.toString().trimEnd()));

  proc.on('exit', (code, signal) => {
    const entry = running.get(botId) || {};
    const manualStop = entry.wantStop === true;
    appendLog(botId, `⛔ توقف البوت (code: ${code}, signal: ${signal})`);

    if (manualStop) {
      running.set(botId, { ...entry, proc: null, status: 'stopped' });
      if (onChange) onChange('stopped');
      return;
    }

    const now = Date.now();
    const history = (entry.restartHistory || []).filter(t => t > now - 3600000);
    if (history.length >= MAX_RESTARTS_PER_HOUR) {
      appendLog(botId, '🧯 تجاوز الحد الأقصى لإعادة التشغيل. أعد التشغيل يدوياً.');
      running.set(botId, { ...entry, proc: null, status: 'crashed', restartHistory: history });
      if (onChange) onChange('crashed');
      return;
    }

    running.set(botId, { ...entry, proc: null, status: 'restarting', restartHistory: [...history, now] });
    if (onChange) onChange('restarting');
    appendLog(botId, '♻️ إعادة تشغيل تلقائية بعد 3 ثواني...');

    const timer = setTimeout(() => {
      const e2 = running.get(botId);
      if (!e2 || e2.wantStop) return;
      spawnProcess(botId, entryFile, language, dir, onChange);
    }, 3000);
    running.set(botId, { ...running.get(botId), timer });
  });
}

function startBot(botId, entryFile, onChange) {
  const current = running.get(botId);
  if (current && (current.status === 'running' || current.status === 'starting')) return { ok: false };
  const dir = botDir(botId);
  if (!fs.existsSync(dir)) return { ok: false };
  const language = detectLanguage(dir, entryFile);
  running.set(botId, { proc: null, status: 'starting', startedAt: Date.now(), wantStop: false, restartHistory: [] });
  if (onChange) onChange('starting');
  installDeps(botId, dir, language, (err) => {
    if (err) {
      running.set(botId, { ...running.get(botId), proc: null, status: 'crashed' });
      if (onChange) onChange('crashed');
      return;
    }
    spawnProcess(botId, entryFile, language, dir, onChange);
  });
  return { ok: true, language };
}

function stopBot(botId, cb) {
  const entry = running.get(botId);
  if (!entry || !entry.proc) {
    if (entry && entry.timer) clearTimeout(entry.timer);
    running.set(botId, { proc: null, status: 'stopped', startedAt: Date.now(), wantStop: true });
    return cb && cb(null);
  }
  running.set(botId, { ...entry, status: 'stopping', wantStop: true });
  appendLog(botId, '🛑 إيقاف البوت...');
  kill(entry.proc.pid, 'SIGTERM', err => cb && cb(err));
}

module.exports = { startBot, stopBot, getStatus, getEntry, readLogs, clearLogs, appendLog, botDir, detectLanguage, BOTS_DIR };
