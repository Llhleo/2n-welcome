// challenge.js – 挑战-响应验证（强化版）

/**
 * 检查当前用户是否为开发者/管理员
 * @param {string} user - pipe 中的 user 参数
 * @returns {boolean}
 */
export function isDeveloper(user) {
  const devUsers = ['debug', 'dev', 'admin'];
  return devUsers.includes(user);
}

/**
 * 发起挑战并验证
 * 如果未通过或超时，会直接覆盖页面显示 403，不再继续加载
 * @param {string} user - 已确认的开发者用户
 */
export async function runChallenge(user) {
  if (!isDeveloper(user)) return; // 非开发者无需验证

  console.log(`[Challenge] 为 ${user} 启动挑战验证...`);

  // 生成随机挑战数据
  const challenges = [];
  for (let i = 0; i < 3000; i++) {
    challenges.push({
      id: i,
      data: Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
    });
  }

  // 将挑战数据交给篡改猴脚本处理
  window.dispatchEvent(new CustomEvent('2n-challenge', { 
    detail: { challenges, user } 
  }));

  // 等待脚本响应（超时 15 秒）
  const response = await waitForChallengeResponse(15000);
  if (!response || !response.success) {
    // 彻底阻止页面：覆盖文档内容
    document.documentElement.innerHTML = '';
    document.body.innerHTML = `
      <div style="text-align:center;margin-top:20vh;font-family:system-ui;">
        <h1 style="color:#de1f1f;">403 Forbidden</h1>
        <p>挑战验证未通过，请确认已安装并启用篡改猴脚本。</p>
        <p style="color:#6a859c;">如果您是开发者，请确保已安装 <a href="./tampermonkey-challenge.user.js">挑战脚本</a> 并刷新页面。</p>
      </div>
    `;
    throw new Error('Challenge failed');
  }
  console.log('[Challenge] 验证通过，页面正常加载');
}

/**
 * 等待篡改猴脚本返回挑战结果
 * @param {number} timeout 超时时间(ms)
 * @returns {Promise<{success: boolean}|null>}
 */
function waitForChallengeResponse(timeout) {
  return new Promise((resolve) => {
    const handler = (e) => {
      window.removeEventListener('2n-challenge-response', handler);
      resolve(e.detail);
    };
    window.addEventListener('2n-challenge-response', handler);
    setTimeout(() => {
      window.removeEventListener('2n-challenge-response', handler);
      resolve(null);
    }, timeout);
  });
}

/**
 * 页面加载时自动检查（由 core.js 调用）
 * 必须在任何内容加载前执行
 */
export async function initChallenge() {
  const user = new URLSearchParams(window.location.search).get('user');
  if (isDeveloper(user)) {
    await runChallenge(user);
  }
}