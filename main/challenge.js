// challenge.js – 访问控制 + 挑战验证（集成 admission 配置）
import { show403 } from './error403.js';
import { test_admission, other_admission } from '../admission.js';

export function isDeveloper(user) {
  const devUsers = ['debug', 'dev', 'admin'];
  return devUsers.includes(user);
}

export async function runChallenge(user) {
  // 仅当 test_admission 为 true 时才执行挑战
  if (!test_admission) return;

  console.log(`[Challenge] 为 ${user} 启动挑战验证...`);

  let waited = 0;
  while (!window.__tampermonkeyReady && waited < 5000) {
    await new Promise(r => setTimeout(r, 250));
    waited += 250;
  }
  if (!window.__tampermonkeyReady) {
    show403(2);
    throw new Error('Challenge script not ready');
  }

  for (let attempt = 1; attempt <= 2; attempt++) {
    const challenges = [];
    for (let i = 0; i < 500; i++) {
      challenges.push({
        id: i,
        data: Array.from(crypto.getRandomValues(new Uint8Array(32)))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('')
      });
    }
    window.dispatchEvent(new CustomEvent('2n-challenge', { detail: { challenges, user } }));
    const response = await waitForChallengeResponse(25000);
    if (response && response.success) {
      console.log(`[Challenge] 第 ${attempt} 次尝试成功`);
      return;
    }
    console.warn(`[Challenge] 第 ${attempt} 次尝试失败`);
    if (attempt < 2) await new Promise(r => setTimeout(r, 1000));
  }

  show403(3);
  throw new Error('Challenge failed');
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

export async function initChallenge(user) {
  // 如果是调试用户，根据 test_admission 决定是否挑战
  if (isDeveloper(user)) {
    if (test_admission) {
      await runChallenge(user);
    }
  } else {
    // 非调试用户：若 other_admission 为 false，直接拦截
    if (!other_admission) {
      show403(1);
      throw new Error('Access denied');
    }
  }
}