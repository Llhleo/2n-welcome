// survey.js – 问卷嵌入模块（支持 iframe 和自定义 html 类型）

import { getUrlParam } from '../main/explicitPipe.js';
import { getLanguage } from '../main/implicitPipe.js';

/**
 * 加载问卷配置：支持 ?survey=文件名 指定，或随机有效问卷
 * @returns {Promise<Object|null>}
 */
async function loadSurveyConfig() {
  // 优先使用 ?survey= 参数指定的问卷文件名
  const surveyParam = getUrlParam('survey');
  if (surveyParam) {
    const directRes = await fetch(`./data/Survey/${surveyParam}`);
    if (directRes.ok) {
      const config = await directRes.json();
      config._file = surveyParam; // 保存文件名，供提交时使用
      return config;
    }
    return null;
  }

  // 从 index.json 随机选择
  try {
    const indexRes = await fetch('./data/Survey/index.json');
    if (!indexRes.ok) return null;
    const surveys = await indexRes.json();
    if (!Array.isArray(surveys) || surveys.length === 0) return null;

    const today = new Date().toISOString().split('T')[0];
    const activeSurveys = surveys.filter(s => s.start <= today && today <= s.end);
    if (activeSurveys.length === 0) return null;

    const chosen = activeSurveys[Math.floor(Math.random() * activeSurveys.length)];
    const configRes = await fetch(`./data/Survey/${chosen.file}`);
    if (!configRes.ok) return null;
    const config = await configRes.json();
    config._file = chosen.file;
    return config;
  } catch (e) {
    console.error('加载问卷配置失败:', e);
    return null;
  }
}

/**
 * 渲染问卷入口（根据类型调用不同渲染函数）
 * @param {HTMLElement} container - 问卷容器
 * @param {string} user - 当前用户
 * @param {boolean} isMobile - 是否手机端（用于 iframe 高度）
 */
export async function renderSurvey(container, user, isMobile = false) {
  if (!container || !user) return;

  const config = await loadSurveyConfig();
  if (!config) return;

  const lang = getLanguage();

  if (config.type === 'iframe') {
    const height = isMobile ? '500px' : '600px';
    container.innerHTML = `
      <div class="survey-wrapper" style="margin-top:16px;">
        <iframe src="${config.link}"
                style="width:100%; height:${height}; border:none; border-radius:12px; overflow:auto;"
                frameborder="0"></iframe>
      </div>
    `;
  } else if (config.type === 'html') {
    // 动态导入 fillBlanks 模块，避免循环依赖
    const { renderCustomSurvey } = await import('../main/fillBlanks.js');
    renderCustomSurvey(container, config, lang, user);
  }
}