// data/announcement.js – 通知渲染（所有标题和标签居中）
import { decodeRichText } from '../main/decode.js';
import * as pipe from '../main/pipe.js';

function getLocalizedString(raw, lang) {
  if (!raw || typeof raw !== 'string') return '';
  if (!raw.includes('|')) return raw.trim();
  const parts = raw.split('|');
  const left = (parts[0] || '').trim();
  const right = (parts[1] || '').trim();
  return lang === 'zh' ? (left || right) : (right || left);
}

export async function loadAnnouncements(container, lang, text) {
  try {
    const indexRes = await fetch('./data/Announcement/index.json');
    if (!indexRes.ok) throw new Error('索引加载失败');
    const fileList = await indexRes.json();

    const allNotices = [];
    for (const file of fileList) {
      const res = await fetch(`./data/Announcement/${file}`);
      if (res.ok) {
        const notice = await res.json();
        notice._file = file;
        allNotices.push(notice);
      }
    }

    const recent = allNotices.slice(-3).reverse();
    let importantNotice = null;
    const importants = recent.filter(n => n.tag?.toLowerCase() === 'important');
    if (importants.length) {
      importantNotice = importants[importants.length - 1];
    } else {
      for (let i = allNotices.length - 1; i >= 0; i--) {
        if (allNotices[i].tag?.toLowerCase() === 'important') {
          importantNotice = allNotices[i];
          break;
        }
      }
    }

    let html = '';
    if (importantNotice) {
      html += renderNotice(importantNotice, lang);
    }
    for (const notice of recent) {
      if (notice !== importantNotice) html += renderNotice(notice, lang);
    }

    const queryString = pipe.buildQueryString({ lang: lang, mode: pipe.getColorMode() });
    const href = 'announcement.html' + (queryString ? '?' + queryString : '');

    html += `
      <div class="announce-more">
        <button class="changelog-toggle" onclick="location.href='${href}'">
          ${text.moreText} <i class="fas fa-arrow-right"></i>
        </button>
      </div>
    `;
    container.innerHTML = html;
  } catch (e) {
    container.innerHTML = `<div class="loading-placeholder">${lang === 'zh' ? '通知加载失败' : 'Failed to load notices'}</div>`;
  }
}

function renderNotice(notice, lang, isImportant) {
  const titleText = getLocalizedString(notice.title, lang);
  const tag = (notice.tag || '').toLowerCase();
  let titleClass = 'notice-title ';
  if (tag === 'important') titleClass += 'notice-title-important';
  else if (tag === 'joke') titleClass += 'notice-title-joke';
  else titleClass += 'notice-title-normal';
  if (isImportant) titleClass += ' notice-title-center';

  const content = lang === 'zh' ? (notice.zh || '') : (notice.en || notice.zh || '');
  const paragraphs = content.split('\n').filter(p => p.trim() !== '');
  const decodedParagraphs = paragraphs.map(p => decodeRichText(p, 14));
  const bodyHTML = decodedParagraphs.map(p => `<p class="notice-body">${p}</p>`).join('');

  const timeStr = formatTime(notice._file, lang);
  const writer = escapeHTML(notice.writer || '');

  return `
    <div class="notice-item">
      <div class="${titleClass}">${escapeHTML(titleText)}</div>
      <div class="notice-tag ${titleClass}">[${escapeHTML(tag)}]</div>
      ${bodyHTML}
      <div class="notice-writer">${writer}</div>
      <div class="notice-time">${timeStr}</div>
    </div>
  `;
}

function formatTime(filename, lang) {
  if (!filename) return '';
  const match = filename.match(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})/);
  if (!match) return filename;
  const [, y, m, d, h, min] = match;
  if (lang === 'zh') return `${y}.${m}.${d} ${h}:${min}`;
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[+m-1]} ${+d}, ${y} ${h}:${min}`;
}

function escapeHTML(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }