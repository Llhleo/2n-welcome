// dev.js – 调试增强：捕获每条命令并休眠5ms

(function() {
  if (typeof window.__devEnabled !== 'undefined') return;
  window.__devEnabled = true;

  const origSetTimeout = window.setTimeout;
  const origSetInterval = window.setInterval;
  const origFetch = window.fetch;

  // 记录所有命令调用
  function logCommand(type, args) {
    console.debug(`[DEV] ${type}:`, ...args);
  }

  // 包装定时器
  window.setTimeout = function(fn, delay, ...args) {
    logCommand('setTimeout', [fn, delay, ...args]);
    return origSetTimeout.call(window, fn, delay, ...args);
  };
  window.setInterval = function(fn, delay, ...args) {
    logCommand('setInterval', [fn, delay, ...args]);
    return origSetInterval.call(window, fn, delay, ...args);
  };

  // 包装 fetch
  window.fetch = function(...args) {
    logCommand('fetch', args);
    return origFetch.apply(window, args).then(response => {
      // 不记录响应体，避免性能问题
      return response;
    });
  };

  // 每次同步命令后休眠5ms（无法真正休眠同步代码，但可插入微任务）
  const origPromiseThen = Promise.prototype.then;
  Promise.prototype.then = function(onFulfilled, onRejected) {
    const start = Date.now();
    const wrappedFulfilled = typeof onFulfilled === 'function' ? function(value) {
      const now = Date.now();
      if (now - start < 5) {
        // 模拟休眠：延迟执行后续回调
        return new Promise(resolve => setTimeout(() => resolve(onFulfilled(value)), 5 - (now - start)));
      }
      return onFulfilled(value);
    } : onFulfilled;
    return origPromiseThen.call(this, wrappedFulfilled, onRejected);
  };

  console.log('🔧 dev.js 已激活：命令追踪与5ms延迟');
})();