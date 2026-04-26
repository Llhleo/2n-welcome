// data/announcement.js
import { decodeRichText } from '../decode.js';

/**
 * 根据语言从 "左侧|右侧" 格式的字符串中提取对应文本
 * @param {string} raw 原始字符串
 * @param {string} lang 'zh' 或 'en'
 * @returns {string}
 */
function getLocalizedString(raw, lang) {
  if (!raw || typeof raw !== 'string') return '';
  if (!raw.includes('|')) return raw.trim();
  
  const parts = raw.split('|');
  const left = (parts[0] || '').trim();
  const right = (parts[1] || '').trim();
  
  if (lang === 'zh') {
    return left || right; // 中文优先左侧，如果左侧为空则用右侧
  } else {
    return right || left; // 英文优先右侧，如果右侧为空则用左侧
  }
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
    const importantInRecent = recent.filter(n => n.tag && n.tag.toLowerCase() === 'important');
    if (importantInRecent.length > 0) {
      importantNotice = importantInRecent[importantInRecent.length - 1];
    } else {
      for (let i = allNotices.length - 1; i >= 0; i--) {
        if (allNotices[i].tag && allNotices[i].tag.toLowerCase() === 'important') {
          importantNotice = allNotices[i];
          break;
        }
      }
    }

    let html = '';
    if (importantNotice) {
      html += renderNotice(importantNotice, lang, true);
    }
    const displayed = recent.filter(n => n !== importantNotice);
    for (const notice of displayed) {
      html += renderNotice(notice, lang, false);
    }

    html += `
      <div style="text-align:right; margin-top:12px;">
        <button class="changelog-toggle" onclick="location.href='announcement.html'">
          ${text.moreText} <i class="fas fa-arrow-right"></i>
        </button>
      </div>
    `;

    container.innerHTML = html;
  } catch (error) {
    container.innerHTML = `<div class="loading-placeholder">${lang === 'zh' ? '通知加载失败' : 'Failed to load announcements'}</div>`;
    console.error(error);
  }
}

function renderNotice(notice, lang, isImportant) {
  // 标题适配
  const titleText = getLocalizedString(notice.title, lang);
  const tag = notice.tag || '';
  let titleColor = '#1e3b4f';
  if (tag.toLowerCase() === 'important') titleColor = '#de1f1f';
  else if (tag.toLowerCase() === 'joke') titleColor = '#f59e0b';

  const titleStyle = `color:${titleColor}; font-weight:bold; ${isImportant ? 'text-align:center;' : ''}`;

  const content = lang === 'zh' ? (notice.zh || '') : (notice.en || notice.zh || '');
  const decodedContent = decodeRichText(content, 14);

  const fileTime = formatTime(notice._file, lang);
  const writerLine = `<div style="text-align:right; font-size:0.85rem; color:inherit;">${escapeHTML(notice.writer || '')}</div>`;
  const timeLine = `<div style="text-align:right; font-size:0.8rem; color:#6a859c;">${fileTime}</div>`;
  const tagLine = `<div style="font-size:0.8rem; color:${titleColor}; margin-bottom:4px;">[${escapeHTML(tag)}]</div>`;
  const bodyStyle = 'text-indent:2em; margin:0; line-height:1.6;';

  return `
    <div style="border-bottom:1px dashed #ccc; padding-bottom:12px; margin-bottom:12px;">
      <div style="${titleStyle} margin-bottom:4px;">${escapeHTML(titleText)}</div>
      ${tagLine}
      <p style="${bodyStyle}">${decodedContent}</p>
      ${writerLine}
      ${timeLine}
    </div>
  `;
}

function formatTime(filename, lang) {
  if (!filename) return '';
  const match = filename.match(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})/);
  if (!match) return filename;
  const [, year, month, day, hour, minute] = match;
  if (lang === 'zh') {
    return `${year}.${month}.${day} ${hour}:${minute}`;
  } else {
    const monthNames = ['January','February','March','April','May','June',
      'July','August','September','October','November','December'];
    const monStr = monthNames[parseInt(month,10)-1] || month;
    const dayInt = parseInt(day,10);
    let suffix = 'th';
    if (dayInt === 1 || dayInt === 21 || dayInt === 31) suffix = 'st';
    else if (dayInt === 2 || dayInt === 22) suffix = 'nd';
    else if (dayInt === 3 || dayInt === 23) suffix = 'rd';
    return `${monStr} ${dayInt}${suffix}, ${year} ${hour}:${minute}`;
  }
}

function escapeHTML(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}