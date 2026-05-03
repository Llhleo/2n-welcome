// challenge.js – 挑战-响应验证（500次挑战）

export function isDeveloper(user) {
  const devUsers = ['debug', 'dev', 'admin'];
  return devUsers.includes(user);
}

export async function runChallenge(user) {
  if (!isDeveloper(user)) return;

  console.log(`[Challenge] 为 ${user} 启动挑战验证...`);

  const challenges = [];
  for (let i = 0; i < 500; i++) {      // 改为 500 次
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

  const response = await waitForChallengeResponse(15000);   // 15秒足够
  if (!response || !response.success) {
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