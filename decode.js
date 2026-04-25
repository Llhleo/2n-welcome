// decode.js - 解析带格式标记的文本为 HTML

/**
 * 将 JSON 字符串中的格式标记转换为 HTML
 * 格式示例: {"str" | "link": "url", "color": "#f00", "font": "Arial", "size": 14}
 * 外部用单引号包裹则不解析，直接显示内部内容（不含引号）
 * @param {string} input - 原始文本
 * @param {number} baseFontSize - 周围字号（px），用于相对大小计算
 * @returns {string} HTML 字符串
 */
export function decodeRichText(input, baseFontSize = 16) {
  if (!input || typeof input !== 'string') return input;

  // 匹配块：可选单引号前缀，花括号内部不含花括号的内容
  const blockRegex = /(\x27?)\{((?:\\.|[^{}])*)\}\1/g;
  
  return input.replace(blockRegex, (match, quote, content) => {
    // 单引号包裹 → 原文照显（去掉花括号和引号）
    if (quote === "'") {
      return escapeHTML(content);
    }

    // 解析格式化块
    const parsed = parseBlock(content, baseFontSize);
    if (!parsed) return escapeHTML(`{${content}}`); // 解析失败保留原文

    const { text, link, color, font, size } = parsed;
    const styles = [];
    if (color) styles.push(`color:${color}`);
    if (font) styles.push(`font-family:${font}`);
    if (size != null) {
      // 限制在 35% ~ 300% 的基准字号
      const min = baseFontSize * 0.35;
      const max = baseFontSize * 3;
      const clamped = Math.min(Math.max(size, min), max);
      styles.push(`font-size:${clamped.toFixed(1)}px`);
    }
    const styleAttr = styles.length > 0 ? ` style="${styles.join(';')}"` : '';

    // HTML 转义文本内容
    const escapedText = escapeHTML(text);

    // 生成最终元素
    if (link) {
      return `<a href="${escapeAttr(link)}"${styleAttr}>${escapedText}</a>`;
    } else {
      return `<span${styleAttr}>${escapedText}</span>`;
    }
  });
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

  // 分割属性（简单按逗号，但注意值中可能包含逗号？安全起见用状态机或限制）
  // 此处假设值不会内含逗号（color、font、size 的值均不含逗号）
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
        font = rawValue; // 浏览器会忽略无效字体
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
  // 直接返回原值（通常为 #ffffff 格式）
  return value;
}

// 解析字号：支持纯数字、+数字、-数字
function parseSize(value, base) {
  let num;
  if (/^[+-]/.test(value)) {
    num = base + parseFloat(value);
  } else {
    num = parseFloat(value);
  }
  return isNaN(num) ? null : num;
}

// 转义 HTML 特殊字符
function escapeHTML(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// 转义属性值中的引号
function escapeAttr(str) {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}