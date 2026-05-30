// submit.js – 收集答案并提交到 GitHub Actions

/**
 * 收集自定义问卷答案并提交
 * @param {Object} config 问卷配置对象
 * @param {string} lang 当前语言
 * @param {string} user 用户名
 */
export async function submitSurvey(config, lang, user) {
  // 收集填空题答案
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

  // 收集选择题答案
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

  // 调用 GitHub Actions workflow dispatch API
  // 注意：此处使用占位符 __SURVEY_PAT__，部署时会被注入
  const GITHUB_PAT = '__SURVEY_PAT__' || '';
  if (!GITHUB_PAT) {
    alert('提交功能未配置，请联系管理员');
    return;
  }

  const res = await fetch('https://api.github.com/repos/pythonWsr/2n-welcome/actions/workflows/submit.yml/dispatches', {
    method: 'POST',
    headers: {
      'Authorization': `token ${GITHUB_PAT}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.github.v3+json'
    },
    body: JSON.stringify({
      ref: 'main',
      inputs: {
        payload: JSON.stringify(payload)
      }
    })
  });

  if (res.ok) {
    alert(lang === 'zh' ? '提交成功！' : 'Submitted successfully!');
  } else {
    alert(lang === 'zh' ? '提交失败，请稍后重试' : 'Submission failed, please try again later.');
  }
}