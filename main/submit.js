// submit.js – 收集答案并通过 Cloudflare Worker 提交

export async function submitSurvey(config, lang, user) {
  const blankInputs = document.querySelectorAll('[data-blank]');
  const blanks = {};
  let hasError = false;
  blankInputs.forEach(inp => {
    const id = inp.dataset.blank;
    if (inp.required && !inp.value.trim()) {
      alert(`请填写 ${id}`);
      hasError = true;
    }
    blanks[id] = inp.value;
  });
  if (hasError) return;

  const selectWrappers = document.querySelectorAll('[data-select]');
  const selects = {};
  selectWrappers.forEach(wrapper => {
    const id = wrapper.dataset.select;
    const checked = Array.from(wrapper.querySelectorAll('input:checked')).map(el => el.value);
    const min = parseInt(wrapper.dataset.min) || 0;
    const max = parseInt(wrapper.dataset.max) || 1;
    if (checked.length < min) {
      alert(`${id} 至少选择 ${min} 项`);
      hasError = true;
    }
    if (checked.length > max) {
      alert(`${id} 最多选择 ${max} 项`);
      hasError = true;
    }
    selects[id] = checked;
  });
  if (hasError) return;

  const payload = {
    file: config._file,
    user,
    lang,
    answers: { blanks, selects },
    weights: config.weights
  };

  // 部署后请替换为您的实际 Worker URL
  const WORKER_URL = 'https://survey-proxy.your-subdomain.workers.dev';
  // 部署时由 Actions 注入真实值
  const SUBMIT_SECRET = '__SUBMIT_SECRET__';

  try {
    const res = await fetch(WORKER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Submit-Secret': SUBMIT_SECRET
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      alert(lang === 'zh' ? '提交成功！' : 'Submitted successfully!');
    } else {
      alert(lang === 'zh' ? '提交失败，请稍后重试。' : 'Submission failed, please try again later.');
    }
  } catch (e) {
    alert(lang === 'zh' ? '网络错误，请稍后重试。' : 'Network error, please try again later.');
  }
}