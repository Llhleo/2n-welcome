// fillBlanks.js – 自定义问卷渲染与交互

import { decodeRichText } from './decode.js';

/**
 * 渲染自定义问卷
 * @param {HTMLElement} container 问卷容器
 * @param {Object} config 问卷配置对象（已包含 _file 字段）
 * @param {string} lang 当前语言 (zh/en)
 * @param {string} user 当前用户名（从链接获取）
 */
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
    html += renderQuestion(q, qKey, lang);
  }

  html += `<div class="survey-actions">
    <button type="button" id="surveySubmit">${lang === 'zh' ? '提交' : 'Submit'}</button>
  </div>`;
  html += `</form>`;

  container.innerHTML = html;

  // 初始化条件显示
  evaluateAllConditions(t, lang);

  // 绑定输入变化时重新评估条件
  document.querySelectorAll('#customSurveyForm input, #customSurveyForm select').forEach(el => {
    el.addEventListener('change', () => evaluateAllConditions(t, lang));
    el.addEventListener('input', () => evaluateAllConditions(t, lang));
  });

  // 绑定提交按钮
  import('./submit.js').then(module => {
    document.getElementById('surveySubmit')?.addEventListener('click', () => {
      module.submitSurvey(config, lang, user);
    });
  });
}

function renderQuestion(q, qKey, lang) {
  const text = q.text || '';
  // 匹配填空占位符 ___str___（至少三个下划线后加标识）
  const blankMatches = [...text.matchAll(/___(\w+)___/g)];
  // 匹配选择占位符 (_str_)（下划线加括号）
  const selectMatches = [...text.matchAll(/\(_(\w+)_\)/g)]; // 修改匹配：(_str_)

  let html = `<div class="survey-question" id="${qKey}"`;

  if (q.condition) {
    html += ` data-condition='${JSON.stringify(q.condition)}'`;
  }
  html += ` style="display:none;">`; // 默认隐藏

  html += `<div class="q-text">`;

  // 将所有占位符按顺序处理
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

function evaluateAllConditions(t, lang) {
  const questions = Object.keys(t).filter(k => /^question\d+$/.test(k));
  for (const qKey of questions) {
    const q = t[qKey];
    const el = document.getElementById(qKey);
    if (!el || !q.condition) {
      if (el) el.style.display = 'block';
      continue;
    }
    const show = evaluateCondition(q.condition);
    el.style.display = show ? 'block' : 'none';
  }
}

function evaluateCondition(condition) {
  for (const orGroup of condition) {
    let allTrue = true;
    for (const condStr of orGroup) {
      if (!parseSingleCondition(condStr)) {
        allTrue = false;
        break;
      }
    }
    if (allTrue) return true;
  }
  return false;
}

function parseSingleCondition(condStr) {
  // 匹配填空条件
  const blankMatch = condStr.match(/^(\w+)\s*([><=!]+)\s*(.+)$/);
  if (blankMatch) {
    const id = blankMatch[1];
    const op = blankMatch[2];
    const val = blankMatch[3].trim();
    const input = document.querySelector(`[data-blank="${id}"]`);
    if (!input) return false;
    const inputVal = input.value;
    const numVal = parseFloat(val);
    const isNum = !isNaN(numVal) && isFinite(Number(val));
    let compareVal = isNum ? numVal : val.replace(/^['"]|['"]$/g, '');
    let actualVal = isNum ? parseFloat(inputVal) : inputVal;
    if (isNaN(actualVal)) actualVal = inputVal;
    switch (op) {
      case '==': return actualVal == compareVal;
      case '!=': return actualVal != compareVal;
      case '>': return actualVal > compareVal;
      case '<': return actualVal < compareVal;
      case '>=': return actualVal >= compareVal;
      case '<=': return actualVal <= compareVal;
      default: return false;
    }
  }

  // 匹配选择题条件
  const selectMatch = condStr.match(/^(\w+)==(\w+)\[(\d+)\]$/);
  if (selectMatch) {
    const selectId = selectMatch[2];
    const targetIdx = parseInt(selectMatch[3]);
    const wrapper = document.querySelector(`[data-select="${selectId}"]`);
    if (!wrapper) return false;
    const inputs = wrapper.querySelectorAll('input[type="radio"], input[type="checkbox"]');
    for (let i = 0; i < inputs.length; i++) {
      if (inputs[i].checked) {
        return i === targetIdx;
      }
    }
    return false;
  }

  return false;
}

function escapeHTML(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}