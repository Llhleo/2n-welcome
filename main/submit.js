// submit.js – 收集答案并提交到 Cloudflare Worker

export async function submitSurvey(config, lang, user) {
  const blankInputs = document.querySelectorAll('[data-blank]');
  const blanks = {};
  for (const inp of blankInputs) {
    blanks[inp.dataset.blank] = inp.value;
  }

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

  // 您的实际 Worker URL
  const WORKER_URL = 'https://super-feather-a36a.wusiruibaidu04.workers.dev/';
  // 如果 Actions 尚未注入，可先替换为 Worker 环境变量中实际设置的 SUBMIT_SECRET 值，例如：
  const SUBMIT_SECRET = '__SUBMIT_SECRET__' !== '__SUBMIT_SECRET__' ? '__SUBMIT_SECRET__' : '您的临时测试密钥';

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