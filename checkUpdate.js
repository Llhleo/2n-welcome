// checkUpdate.js - 检测新版本并提示用户更新

/**
 * 从 README.md 中提取最新版本号（第一行匹配的 Version）
 * @returns {Promise<string|null>} 版本字符串，如 "0.3.1"
 */
async function getLatestVersionFromReadme() {
  try {
    const res = await fetch('./README.md');
    if (!res.ok) throw new Error('无法获取 README.md');
    const text = await res.text();
    const match = text.match(/^#{0,6}\s*Version\s+([\d.]+)/m);
    return match ? match[1] : null;
  } catch (error) {
    console.error('获取最新版本失败:', error);
    return null;
  }
}

/**
 * 加载语言文件
 * @param {string} langCode 'zh' 或 'en'
 * @returns {Promise<Object>}
 */
async function loadCheckLanguage(langCode) {
  const folder = langCode === 'zh' ? 'zh-CN' : 'en-US';
  const url = `./data/${folder}/check.json`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('语言文件加载失败');
    return await res.json();
  } catch (e) {
    // 默认英文回退
    return {
      title: "Notice",
      message: "A new version is available. Update now?",
      cancel: "Cancel",
      update: "Update"
    };
  }
}

/**
 * 显示更新提示弹窗
 * @param {Object} lang 语言包对象
 * @param {number} seconds 倒计时秒数
 * @returns {Promise<boolean>} true 表示用户点击更新，false 表示取消或超时自动更新
 */
function showUpdateDialog(lang, seconds = 10) {
  return new Promise((resolve) => {
    // 创建遮罩层
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;';

    // 弹窗主体
    const dialog = document.createElement('div');
    dialog.style.cssText = 'background:#fff;border-radius:20px;padding:24px;min-width:300px;max-width:90%;box-shadow:0 10px 30px rgba(0,0,0,0.3);text-align:center;font-family:system-ui;';

    const titleEl = document.createElement('h3');
    titleEl.textContent = lang.title;
    titleEl.style.cssText = 'margin:0 0 12px;color:#1e3b4f;';

    const messageEl = document.createElement('p');
    messageEl.textContent = lang.message;
    messageEl.style.cssText = 'margin:0 0 24px;color:#2b4e65;';

    const btnContainer = document.createElement('div');
    btnContainer.style.cssText = 'display:flex;gap:12px;justify-content:center;';

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = lang.cancel;
    cancelBtn.style.cssText = 'padding:8px 24px;border:1px solid #ccc;border-radius:30px;background:#f5f5f5;cursor:pointer;font-size:1rem;';

    const updateBtn = document.createElement('button');
    const updateText = () => `${lang.update}${seconds > 0 ? ` (${seconds}s)` : ''}`;
    updateBtn.textContent = updateText();
    updateBtn.style.cssText = 'padding:8px 24px;border:none;border-radius:30px;background:#2563eb;color:white;cursor:pointer;font-size:1rem;';

    btnContainer.appendChild(cancelBtn);
    btnContainer.appendChild(updateBtn);
    dialog.appendChild(titleEl);
    dialog.appendChild(messageEl);
    dialog.appendChild(btnContainer);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    let countdown = seconds;
    let timer = null;
    let resolved = false;

    const finish = (doUpdate) => {
      if (resolved) return;
      resolved = true;
      clearInterval(timer);
      document.body.removeChild(overlay);
      resolve(doUpdate);
    };

    // 更新按钮点击
    updateBtn.addEventListener('click', () => finish(true));

    // 取消按钮点击
    cancelBtn.addEventListener('click', () => finish(false));

    // 倒计时逻辑
    if (countdown > 0) {
      timer = setInterval(() => {
        countdown--;
        updateBtn.textContent = updateText();
        if (countdown <= 0) {
          finish(true); // 倒计时结束自动更新
        }
      }, 1000);
    }
  });
}

/**
 * 主检查函数：对比缓存版本与远程版本，决定是否弹窗
 * @param {Object} options 可选配置
 * @param {string} options.language 当前语言 'zh' 或 'en'
 * @param {number} options.countdown 倒计时秒数，默认10
 */
export async function checkForUpdate({ language = 'zh', countdown = 10 } = {}) {
  const STORAGE_KEY = 'cachedVersion';
  const latestVersion = await getLatestVersionFromReadme();
  if (!latestVersion) return; // 获取失败则不提示

  const cachedVersion = localStorage.getItem(STORAGE_KEY);

  // 如果没有缓存版本（首次访问），直接存储最新版本，不弹窗
  if (!cachedVersion) {
    localStorage.setItem(STORAGE_KEY, latestVersion);
    return;
  }

  // 版本相同则无需更新
  if (cachedVersion === latestVersion) return;

  // 存在新版本，加载语言包并弹窗
  const lang = await loadCheckLanguage(language);
  const doUpdate = await showUpdateDialog(lang, countdown);

  if (doUpdate) {
    // 用户确认更新或倒计时结束：更新缓存版本并刷新页面
    localStorage.setItem(STORAGE_KEY, latestVersion);
    location.reload();
  }
  // 如果取消，则不更新缓存，下次刷新仍会提示
}