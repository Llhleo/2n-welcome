// main/core.js
import { lightStyles, darkStyles } from '../data/styles.js';
import { decodeRichText } from './decode.js';
import { checkForUpdate } from './checkUpdate.js';
import { loadAnnouncements } from '../data/announcement.js';
import * as pipe from './pipe.js';

// ---------- 主题 ----------
function applyTheme() {
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const mode = pipe.getColorMode();
  let useDark = isDark;
  if (mode === 'light') useDark = false;
  else if (mode === 'dark') useDark = true;

  const styleId = 'dynamic-theme';
  let styleTag = document.getElementById(styleId);
  if (!styleTag) {
    styleTag = document.createElement('style');
    styleTag.id = styleId;
    document.head.appendChild(styleTag);
  }
  styleTag.textContent = useDark ? darkStyles : lightStyles;
}
applyTheme();
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);

// ---------- 语言 ----------
const LANG_FOLDER = { zh: 'zh-CN', en: 'en-US' };
const langCache = {};
let currentLang = pipe.getLanguage();

const guildTitleEl = document.getElementById('guildTitle');
const langDisplaySpan = document.getElementById('langDisplay');
const leaderLabel1 = document.getElementById('leaderLabel1');
const leaderLabel2 = document.getElementById('leaderLabel2');
const quickStartTitleEl = document.getElementById('quickStartTitle');
const portalTitleEl = document.getElementById('portalTitle');
const infoTitleEl = document.getElementById('infoTitle');
const quickstartContent = document.getElementById('quickstartContent');
const portalList = document.getElementById('portalList');
const langBtn = document.getElementById('langButton');
const langDropdown = document.getElementById('langDropdown');
const langWrapper = document.getElementById('langWrapper');

async function loadLanguage(langCode) {
  const folder = LANG_FOLDER[langCode];
  if (!folder) return null;
  if (langCache[langCode]) return langCache[langCode];
  const baseUrl = `./data/${folder}/`;
  try {
    const [titlesRes, startRes, linksRes] = await Promise.all([
      fetch(baseUrl + 'titles.json'),
      fetch(baseUrl + 'start.json'),
      fetch(baseUrl + 'links.json')
    ]);
    if (!titlesRes.ok || !startRes.ok || !linksRes.ok) throw new Error('Language files missing');
    const titles = await titlesRes.json();
    const start = await startRes.json();
    const links = await linksRes.json();
    const merged = { ...titles, quickHtml: start.quickHtml, portalItems: links.portalItems };
    langCache[langCode] = merged;
    return merged;
  } catch (e) { console.error(e); return null; }
}

function renderWithData(data) {
  if (!data) return;
  guildTitleEl.textContent = data.guildTitle;
  langDisplaySpan.textContent = data.langDisplay;
  leaderLabel1.textContent = data.leader1;
  leaderLabel2.textContent = data.leader2;
  quickStartTitleEl.textContent = data.quickStartTitle;
  portalTitleEl.textContent = data.portalTitle;
  infoTitleEl.textContent = data.infoTitle || '资讯';

  const announceTitle = data.announcementTitle || (currentLang === 'zh' ? '通知' : 'Announcement');
  document.getElementById('announceTitleDesktop').textContent = announceTitle;
  document.getElementById('announceTitleMobile').textContent = announceTitle;

  const changelogTitle = data.changeLogTitle || (currentLang === 'zh' ? '更新日志' : 'Change Log');
  document.getElementById('changelogTitleDesktop').textContent = changelogTitle;
  document.getElementById('changelogTitleMobile').textContent = changelogTitle;

  quickstartContent.innerHTML = decodeRichText(data.quickHtml, 16);
  renderPortalItems(data.portalItems);
  document.querySelectorAll('.lang-option').forEach(opt => {
    opt.classList.toggle('selected', opt.dataset.lang === currentLang);
  });
}

function renderPortalItems(items) {
  portalList.innerHTML = '';
  items.forEach(item => {
    const li = document.createElement('li');
    li.className = 'portal-item';
    const labelDiv = document.createElement('div');
    labelDiv.className = 'portal-label';
    labelDiv.innerHTML = decodeRichText(item.label, 14);
    const valueRow = document.createElement('div');
    valueRow.className = 'portal-value-row';
    const valueSpan = document.createElement('span');
    valueSpan.className = 'portal-value-text';
    valueSpan.innerHTML = decodeRichText(item.value, 14);
    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.innerHTML = '<i class="far fa-copy"></i>';
    copyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const raw = item.value.replace(/<[^>]*>/g, '');
      navigator.clipboard?.writeText(raw).then(() => showToast('已复制')).catch(() => fallbackCopy(raw));
    });
    valueRow.appendChild(valueSpan);
    valueRow.appendChild(copyBtn);
    li.appendChild(labelDiv);
    li.appendChild(valueRow);
    portalList.appendChild(li);
  });
}

function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
  showToast('已复制');
}

const toast = document.getElementById('copyToast');
let toastTimer;
function showToast(msg) {
  toast.textContent = `📋 ${msg}`;
  toast.style.opacity = '1';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.style.opacity = '0', 1500);
}

// 语言切换
async function switchLanguage(langCode) {
  if (langCode === currentLang) { closeDropdown(); return; }
  const data = await loadLanguage(langCode);
  if (data) {
    currentLang = langCode;
    pipe.setLanguage(langCode);
    renderWithData(data);
    document.documentElement.lang = langCode === 'zh' ? 'zh' : 'en';
    loadAnnouncementsWrapper();
    loadChangelog();
  }
  closeDropdown();
}

function openDropdown() { langDropdown.classList.add('show'); langBtn.classList.add('active'); }
function closeDropdown() { langDropdown.classList.remove('show'); langBtn.classList.remove('active'); }

langBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  langDropdown.classList.contains('show') ? closeDropdown() : openDropdown();
});
document.querySelectorAll('.lang-option').forEach(opt => {
  opt.addEventListener('click', (e) => { e.stopPropagation(); switchLanguage(opt.dataset.lang); });
});
document.addEventListener('click', (e) => { if (!langWrapper.contains(e.target)) closeDropdown(); });
langDropdown.addEventListener('click', (e) => e.stopPropagation());

// ---------- 资讯 ----------
async function loadBilibiliManual() {
  const container = document.getElementById('bilibiliFeed');
  try {
    const res = await fetch('./data/bilibili.json');
    if (!res.ok) throw new Error('fail');
    const data = await res.json();
    renderManualFeed(data);
  } catch(e) { container.innerHTML = '<div class="loading-placeholder">资讯加载失败，请稍后重试</div>'; }
}

function renderManualFeed(data) {
  const container = document.getElementById('bilibiliFeed');
  let html = `<div class="up-info"><img class="up-avatar" src="${data.up.face}" onerror="this.src='data:image/svg+xml,...'"><div class="up-name"><a href="${data.up.homepage}" target="_blank">${data.up.name}</a></div></div><div class="video-scroll-container"><div class="video-list">`;
  data.videos.forEach(v => {
    html += `<div class="video-card"><div class="video-iframe-wrapper">${v.iframe.replace('<iframe', '<iframe style="position:absolute; top:0; left:0; width:100%; height:100%;"')}</div><div class="video-title"><a href="https://www.bilibili.com/video/${v.bvid}" target="_blank">${v.title}</a></div><div class="video-meta"><span>${v.date}</span><span><i class="far fa-play-circle"></i> ${v.play||''}</span></div></div>`;
  });
  html += `</div></div>`;
  container.innerHTML = html;
}

// ---------- 更新日志 ----------
async function loadChangelog() {
  const desktop = document.getElementById('changelogContentDesktop');
  const mobile = document.getElementById('changelogContentMobile');
  try {
    const res = await fetch('./README.md');
    const text = await res.text();
    const versions = parseChangelog(text);
    const langData = langCache[currentLang] || {};
    const expand = langData.changelogExpand || (currentLang === 'zh' ? '查看全部' : 'Show All');
    const collapse = langData.changelogCollapse || (currentLang === 'zh' ? '折叠' : 'Collapse');
    renderChangelog(versions, desktop, expand, collapse);
    renderChangelog(versions, mobile, expand, collapse);
  } catch(e) {
    desktop.innerHTML = '<div class="loading-placeholder">更新日志不可用</div>';
    mobile.innerHTML = '<div class="loading-placeholder">更新日志不可用</div>';
  }
}

function parseChangelog(md) {
  const lines = md.split('\n');
  const blocks = [];
  let current = null;
  for (const line of lines) {
    const m = line.match(/^#{0,6}\s*Version\s+([\d.]+)/);
    if (m) {
      if (current) blocks.push(current);
      current = { version: 'Version ' + m[1], items: [] };
    } else if (current && /^\s*·/.test(line)) {
      current.items.push(line.replace(/^\s*·\s*/, ''));
    }
  }
  if (current) blocks.push(current);
  return blocks;
}

function renderChangelog(versions, container, expandText, collapseText) {
  if (!versions.length) { container.innerHTML = '<div class="loading-placeholder">暂无更新日志</div>'; return; }
  const showCount = 5;
  const initial = versions.slice(0, showCount);
  let expanded = false;
  const listDiv = document.createElement('div');
  listDiv.className = 'changelog-list';

  function isRed(v) {
    const match = v.match(/^Version\s+(\d+)\.(\d+)\.(\d+)$/);
    return match && parseInt(match[1]) === 0 && parseInt(match[3]) === 0;
  }
  function renderList(items) {
    listDiv.innerHTML = '';
    items.forEach(ver => {
      const ve = document.createElement('div');
      ve.className = 'changelog-version';
      ve.textContent = ver.version;
      if (isRed(ver.version)) ve.style.color = '#de1f1f';
      listDiv.appendChild(ve);
      ver.items.forEach(item => {
        const ie = document.createElement('div');
        ie.className = 'changelog-item';
        ie.textContent = '· ' + item;
        if (isRed(ver.version)) ie.style.color = '#de1f1f';
        listDiv.appendChild(ie);
      });
    });
  }
  renderList(initial);
  const btn = document.createElement('button');
  btn.className = 'changelog-toggle';
  btn.innerHTML = `${expandText} <i class="fas fa-chevron-down"></i>`;
  btn.addEventListener('click', () => {
    expanded = !expanded;
    if (expanded) {
      renderList(versions);
      btn.innerHTML = `${collapseText} <i class="fas fa-chevron-up"></i>`;
    } else {
      renderList(initial);
      btn.innerHTML = `${expandText} <i class="fas fa-chevron-down"></i>`;
    }
  });
  container.innerHTML = '';
  container.appendChild(listDiv);
  container.appendChild(btn);
}

// ---------- 通知 ----------
async function loadAnnouncementsWrapper() {
  const langData = langCache[currentLang] || {};
  const moreText = langData.announcementMore || (currentLang === 'zh' ? '查看更多历史通知' : 'View More History');
  const containers = [document.getElementById('announceDesktop'), document.getElementById('announceMobile')].filter(Boolean);
  for (const c of containers) {
    // 按钮跳转改用 pipe.navigate，但需要在生成 HTML 时提供 onclick，这里先保持原有方式，跳转链接附加参数
    await loadAnnouncements(c, currentLang, { moreText, moreArrow: '→' });
  }
}

// 启动
async function init() {
  loadLanguage('en').catch(() => {});
  const data = await loadLanguage(currentLang);
  if (data) {
    renderWithData(data);
    // 检测更新（使用当前语言）
    checkForUpdate({ language: currentLang, countdown: 10 });
  }
  loadBilibiliManual();
  loadChangelog();
  loadAnnouncementsWrapper();
}

init();