// challenge.js – 挑战-响应验证（1000次挑战，重试 + 脚本就绪检测）

export function isDeveloper(user) {
  const devUsers = ['debug', 'dev', 'admin'];
  return devUsers.includes(user);
}

export async function runChallenge(user) {
  if (!isDeveloper(user)) return;

  console.log(`[Challenge] 为 ${user} 启动挑战验证...`);

  // 等待篡改猴脚本就绪（最多等 5 秒）
  let waited = 0;
  while (!window.__tampermonkeyReady && waited < 5000) {
    await new Promise(r => setTimeout(r, 250));
    waited += 250;
  }
  if (!window.__tampermonkeyReady) {
    console.error('[Challenge] 篡改猴脚本未就绪');
    show403();
    throw new Error('Tampermonkey script not ready');
  }

  // 最多尝试 2 次
  for (let attempt = 1; attempt <= 2; attempt++) {
    const challenges = [];
    for (let i = 0; i < 1000; i++) {      // 改为 1000 次
      challenges.push({
        id: i,
        data: Array.from(crypto.getRandomValues(new Uint8Array(32)))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('')
      });
    }

    window.dispatchEvent(new CustomEvent('2n-challenge', { 
      detail: { challenges, user } 
    }));

    const response = await waitForChallengeResponse(25000); // 25 秒超时
    if (response && response.success) {
      console.log(`[Challenge] 第 ${attempt} 次尝试成功`);
      return;
    }
    console.warn(`[Challenge] 第 ${attempt} 次尝试超时或失败`);
    if (attempt < 2) await new Promise(r => setTimeout(r, 1000)); // 间隔 1 秒重试
  }

  // 两次均失败
  show403();
  throw new Error('Challenge failed after retries');
}

function show403() {
  document.documentElement.innerHTML = '';
  document.body.innerHTML = `
    <div style="text-align:center;margin-top:20vh;font-family:system-ui;">
      <h1 style="color:#de1f1f;">403 Forbidden</h1>
      <p>挑战验证未通过，请确认已安装并启用篡改猴脚本。</p>
      <p style="color:#6a859c;">如果您是开发者，请确保已安装 <a href="./tampermonkey-challenge.user.js">挑战脚本</a> 并刷新页面。</p>
    </div>
  `;
}

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

export async function initChallenge() {
  const user = new URLSearchParams(window.location.search).get('user');
  if (isDeveloper(user)) {
    await runChallenge(user);
  }
}