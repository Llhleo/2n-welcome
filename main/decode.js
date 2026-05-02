// decode.js – 解析带格式标记的文本为 HTML，支持 \n 换行

/**
 * 将 JSON 字符串中的格式标记转换为 HTML，并将 \n 转为 <br>
 * @param {string} input - 原始文本
 * @param {number} baseFontSize - 周围字号（px）
 * @returns {string} HTML 字符串
 */
export function decodeRichText(input, baseFontSize = 16) {
  if (!input || typeof input !== 'string') return input;

  // 匹配块：可选单引号前缀，花括号内部不含花括号的内容
  const blockRegex = /(\x27?)\{((?:\\.|[^{}])*)\}\1/g;

  let result = input.replace(blockRegex, (match, quote, content) => {
    // 单引号包裹 → 原文照显（去掉花括号和引号）
    if (quote === "'") {
      return escapeHTML(content);
    }

    // 解析格式化块
    const parsed = parseBlock(content, baseFontSize);
    if (!parsed) return escapeHTML(`{${content}}`);

    const { text, link, color, font, size } = parsed;
    const styles = [];
    if (color) styles.push(`color:${color}`);
    if (font) styles.push(`font-family:${font}`);
    if (size != null) {
      const min = baseFontSize * 0.35;
      const max = baseFontSize * 3;
      const clamped = Math.min(Math.max(size, min), max);
      styles.push(`font-size:${clamped.toFixed(1)}px`);
    }
    const styleAttr = styles.length > 0 ? ` style="${styles.join(';')}"` : '';
    const escapedText = escapeHTML(text);

    if (link) {
      return `<a href="${escapeAttr(link)}"${styleAttr}>${escapedText}</a>`;
    } else {
      return `<span${styleAttr}>${escapedText}</span>`;
    }
  });

  // 将剩余文本中的 \n 替换为 <br>
  result = result.replace(/\n/g, '<br>');
  return result;
}

// 解析花括号内部内容
function parseBlock(content, baseFontSize) {
  content = content.trim();

  // 1. 提取文本字符串
  const strMatch = content.match(/^"((?:\\.|[^"\\])*)"/);
  if (!strMatch) return null;
  let text = strMatch[1].replace(/\\(.)/g, '$1'); // 处理转义
  let rest = content.substring(strMatch[0].length);

  // 2. 尝试提取 link
  let link = null;
  const linkMatch = rest.match(/^\s*\|\s*"link"\s*:\s*"((?:\\.|[^"\\])*)"/);
  if (linkMatch) {
    link = linkMatch[1].replace(/\\(.)/g, '$1');
    rest = rest.substring(linkMatch[0].length);
  }

  // 3. 解析剩余属性（逗号分隔）
  let color = null;
  let font = null;
  let size = null;
  const propRegex = /\s*,\s*"(\w+)"\s*:\s*(?:"((?:\\.|[^"\\])*)"|([^,}]+))/g;
  let propMatch;
  while ((propMatch = propRegex.exec(rest)) !== null) {
    const key = propMatch[1].toLowerCase();
    let rawValue = propMatch[2] !== undefined ? propMatch[2] : propMatch[3];
    rawValue = rawValue.trim();

    switch (key) {
      case 'color':
        color = resolveColor(rawValue);
        break;
      case 'font':
        font = rawValue;
        break;
      case 'size':
        size = parseSize(rawValue, baseFontSize);
        break;
    }
  }

  return { text, link, color, font, size };
}

// 颜色标准化（支持颜色缩写）
function resolveColor(value) {
  const colors = {
    'c': '#7eef6d',
    'un': '#ffe65d',
    'r': '#4d52e3',
    'e': '#861fde',
    'l': '#de1f1f',
    'm': '#1fdbde',
    'u': '#ff2b75',
    's': '#2bffa3',
    'en': '#eeeeee',
    'uq': '#555555'
  };
  const lower = value.toLowerCase();
  if (colors[lower]) return colors[lower];
  return value;
}

function parseSize(value, base) {
  let num;
  if (/^[+-]/.test(value)) {
    num = base + parseFloat(value);
  } else {
    num = parseFloat(value);
  }
  return isNaN(num) ? null : num;
}

function escapeHTML(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttr(str) {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}