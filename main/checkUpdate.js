// checkUpdate.js
export async function checkForUpdate({ language = 'zh', countdown = 10 } = {}) {
  const STORAGE_KEY = 'cachedVersion';
  // 获取远程版本号（README.md 中第一个 ## Version x.y.z）
  let latestVersion = null;
  try {
    const res = await fetch('./README.md');
    const text = await res.text();
    const match = text.match(/^#{0,6}\s*Version\s+([\d.]+)/m);
    if (match) latestVersion = match[1];
  } catch (e) {
    console.error('获取远程版本失败', e);
    return;
  }
  const cachedVersion = localStorage.getItem(STORAGE_KEY);
  if (!cachedVersion) {
    localStorage.setItem(STORAGE_KEY, latestVersion);
    return;
  }
  if (cachedVersion === latestVersion) return;

  // 语言包
  const lang = await loadCheckLang(language);

  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;';
  const dialog = document.createElement('div');
  dialog.style.cssText = 'background:#fff;border-radius:20px;padding:24px;min-width:300px;max-width:90%;box-shadow:0 10px 30px rgba(0,0,0,0.3);text-align:center;font-family:system-ui;';
  const titleEl = document.createElement('h3');
  titleEl.textContent = lang.title;
  const msgEl = document.createElement('p');
  msgEl.textContent = lang.message;
  msgEl.style.margin = '12px 0 20px';
  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = lang.cancel;
  cancelBtn.style.cssText = 'padding:8px 24px;border:1px solid #ccc;border-radius:30px;background:#f5f5f5;cursor:pointer;margin-right:12px;';
  const updateBtn = document.createElement('button');
  updateBtn.style.cssText = 'padding:8px 24px;border:none;border-radius:30px;background:#2563eb;color:white;cursor:pointer;';
  let remain = countdown;
  const updateText = () => `${lang.update}${remain > 0 ? ` (${remain}s)` : ''}`;
  updateBtn.textContent = updateText();

  dialog.appendChild(titleEl);
  dialog.appendChild(msgEl);
  dialog.appendChild(cancelBtn);
  dialog.appendChild(updateBtn);
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);

  let resolved = false;
  const finish = (doUpdate) => {
    if (resolved) return;
    resolved = true;
    clearInterval(timer);
    document.body.removeChild(overlay);
    if (doUpdate) {
      localStorage.setItem(STORAGE_KEY, latestVersion);
      location.reload();
    }
  };

  const timer = setInterval(() => {
    remain--;
    updateBtn.textContent = updateText();
    if (remain <= 0) finish(true);
  }, 1000);

  cancelBtn.onclick = () => finish(false);
  updateBtn.onclick = () => finish(true);
}

async function loadCheckLang(langCode) {
  const folder = langCode === 'zh' ? 'zh-CN' : 'en-US';
  try {
    const res = await fetch(`./data/${folder}/check.json`);
    return await res.json();
  } catch (e) {
    return {
      title: 'Notice',
      message: 'A new version is available. Update now?',
      cancel: 'Cancel',
      update: 'Update'
    };
  }
}