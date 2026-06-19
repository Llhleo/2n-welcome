// fillBlanks.js – 自定义问卷渲染（临时跳过条件判断）

import { decodeRichText } from './decode.js';

export function renderCustomSurvey(container, config, lang, user) {
  if (!container || !config) return;

  const t = config[lang] || config.zh;
  if (!t) return;

  const questions = Object.keys(t)
    .filter(k => /^question\d+$/.test(k))
    .sort((a, b) => parseInt(a.slice(8)) - parseInt(b.slice(8)));

  let html = `<form id="customSurveyForm" class="custom-survey" data-file="${config._file}">`;
  html += `<h3 class="survey-title">${decodeRichText(t.title, 18)}</h3>`;

  for (const qKey of questions) {
    const q = t[qKey];
    html += renderQuestion(q, qKey);
  }

  html += `<div class="survey-actions">
    <button type="button" id="surveySubmit">${lang === 'zh' ? '提交' : 'Submit'}</button>
  </div>`;
  html += `</form>`;

  container.innerHTML = html;

  // ======= 临时修改：无条件显示所有题目 =======
  const questionEls = document.querySelectorAll('#customSurveyForm .survey-question');
  questionEls.forEach(el => el.style.display = 'block');
  console.log('[Conditions] 条件判断已跳过，所有题目直接显示');
  // ===========================================

  // 绑定提交
  import('./submit.js').then(module => {
    document.getElementById('surveySubmit')?.addEventListener('click', () => {
      module.submitSurvey(config, lang, user);
    });
  });
}

// 以下函数保持不变（renderQuestion, renderBlank, renderSelect 等）
// ... 内容与之前相同，此处省略 ...

function renderQuestion(q, qKey) {
  const text = q.text || '';
  const blankMatches = [...text.matchAll(/___(\w+)___/g)];
  const selectMatches = [...text.matchAll(/\(_(\w+)_\)/g)];

  let html = `<div class="survey-question" id="${qKey}"`;
  // 条件属性仍然保留在 DOM 上，但不再使用
  if (q.condition) {
    html += ` data-condition='${JSON.stringify(q.condition)}'`;
  }
  html += `>`;

  html += `<div class="q-text">`;

  let lastIdx = 0;
  const parts = [];
  const allMatches = [
    ...blankMatches.map(m => ({ type: 'blank', start: m.index, end: m.index + m[0].length, id: m[1] })),
    ...selectMatches.map(m => ({ type: 'select', start: m.index, end: m.index + m[0].length, id: m[1] }))
  ].sort((a, b) => a.start - b.start);

  for (const match of allMatches) {
    if (match.start > lastIdx) {
      const plainText = text.substring(lastIdx, match.start);
      parts.push(decodeRichText(plainText, 16));
    }
    if (match.type === 'blank') {
      const cfg = q.blanks?.[match.id] || {};
      parts.push(renderBlank(match.id, cfg));
    } else {
      const cfg = q.selects?.[match.id] || {};
      parts.push(renderSelect(match.id, cfg));
    }
    lastIdx = match.end;
  }
  if (lastIdx < text.length) {
    parts.push(decodeRichText(text.substring(lastIdx), 16));
  }

  html += parts.join('');
  html += `</div></div>`;
  return html;
}

function renderBlank(id, cfg) {
  const requiredAttr = cfg.required ? 'required' : '';
  const typeAttr = cfg.type || 'str';
  let inputType = 'text';
  if (typeAttr === 'int' || typeAttr === 'float') inputType = 'number';
  let extraAttr = '';
  if (cfg.min !== undefined) extraAttr += ` min="${cfg.min}"`;
  if (cfg.max !== undefined) extraAttr += ` max="${cfg.max}"`;
  if (typeAttr === 'str') {
    if (cfg.min) extraAttr += ` minlength="${cfg.min}"`;
    if (cfg.max) extraAttr += ` maxlength="${cfg.max}"`;
  }
  return `<span class="blank-wrapper"><input type="${inputType}" name="blank_${id}" data-blank="${id}" ${requiredAttr} ${extraAttr} placeholder="${escapeHTML(id)}"/></span>`;
}

function renderSelect(id, cfg) {
  const options = cfg.options || [];
  const min = cfg.min || 0;
  const max = cfg.max || 1;
  const isMulti = max > 1;
  const inputType = isMulti ? 'checkbox' : 'radio';
  let html = `<span class="select-wrapper" data-select="${id}" data-min="${min}" data-max="${max}">`;
  options.forEach((opt, idx) => {
    html += `<label class="select-option"><input type="${inputType}" name="select_${id}" value="${escapeHTML(opt)}" data-option="${idx}"> ${escapeHTML(opt)}</label>`;
  });
  html += `</span>`;
  return html;
}

// 保留原有条件函数（已不使用，便于恢复）
/*
function evaluateAllConditions(t) { ... }
function evaluateCondition(condition) { ... }
function parseSingleCondition(condStr) { ... }
*/

function escapeHTML(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}