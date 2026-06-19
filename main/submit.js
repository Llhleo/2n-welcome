// submit.js – 收集答案并提交到 Cloudflare Worker

export async function submitSurvey(config, lang, user) {
  // 收集填空题
  const blankInputs = document.querySelectorAll('[data-blank]');
  const blanks = {};
  for (const inp of blankInputs) {
    blanks[inp.dataset.blank] = inp.value;
  }

  // 收集选择题
  const selectWrappers = document.querySelectorAll('[data-select]');
  const selects = {};
  for (const wrapper of selectWrappers) {
    const id = wrapper.dataset.select;
    const checked = Array.from(wrapper.querySelectorAll('input:checked')).map(el => el.value);
    selects[id] = checked;
  }

  const payload = {
    file: config._file,
    user,
    lang,
    answers: { blanks, selects },
    weights: config.weights
  };

  console.log('提交数据:', payload);

  // 替换为您的 Worker 地址
  const WORKER_URL = 'https://super-feather-a36a.wusiruibaidu04.workers.dev/';
  // 提交密钥，部署后由 Actions 注入（本地测试可暂时写一个占位，但 Worker 会校验）
  const SUBMIT_SECRET = '' || 'ca0d00d22e154bfb7ee5e180409c5a33';

  try {
    const res = await fetch(WORKER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Submit-Secret': SUBMIT_SECRET
      },
      body: JSON.stringify(payload)
    });

    const text = await res.text();
    if (res.ok) {
      alert(lang === 'zh' ? '提交成功！' : 'Submitted successfully!');
    } else {
      alert(lang === 'zh' ? `提交失败 (${res.status}): ${text}` : `Submission failed (${res.status}): ${text}`);
    }
  } catch (e) {
    alert(lang === 'zh' ? `网络错误: ${e.message}` : `Network error: ${e.message}`);
  }
}