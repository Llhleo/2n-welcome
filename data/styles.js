// data/styles.js

// 浅色主题样式（默认）
export const lightStyles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    background: #f5f7fa;
    font-family: 'Segoe UI', 'Roboto', system-ui, sans-serif;
    color: #1e2b3c;
    padding: 20px 16px 30px;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .page {
    max-width: 1000px;
    width: 100%;
    background: rgba(255,255,255,0.7);
    backdrop-filter: blur(2px);
    border-radius: 36px;
    padding: 24px 24px 20px;
    box-shadow: 0 12px 30px rgba(0,0,0,0.05);
  }

  .header-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 28px;
    flex-wrap: wrap;
  }

  .main-title {
    font-size: clamp(28px, 8vw, 52px);
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: -0.01em;
    background: linear-gradient(135deg, #0b3b5c, #2b5e7c);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    margin-right: 16px;
  }

  .lang-wrapper {
    position: relative;
    user-select: none;
  }

  .lang-btn {
    background: white;
    border: 1px solid #cfdde9;
    border-radius: 40px;
    padding: 10px 18px;
    font-size: 1rem;
    font-weight: 500;
    color: #1e3b4f;
    box-shadow: 0 4px 8px rgba(0,0,0,0.02);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.15s;
    backdrop-filter: blur(4px);
    background: rgba(255,255,255,0.8);
  }

  .lang-btn i {
    font-size: 1rem;
    transition: transform 0.2s;
  }

  .lang-btn.active i {
    transform: rotate(180deg);
  }

  .lang-dropdown {
    position: absolute;
    top: calc(100% + 6px);
    right: 0;
    background: white;
    border-radius: 24px;
    box-shadow: 0 12px 28px rgba(0,0,0,0.12);
    border: 1px solid #e2eaf1;
    overflow: hidden;
    min-width: 140px;
    z-index: 100;
    display: none;
  }

  .lang-dropdown.show {
    display: block;
  }

  .lang-option {
    padding: 12px 20px;
    cursor: pointer;
    font-weight: 500;
    transition: background 0.1s;
    color: #1e3b4f;
  }

  .lang-option:hover {
    background: #e6f0f9;
  }

  .lang-option.selected {
    background: #d4e2f0;
    color: #0a3144;
  }

  .leaders {
    display: flex;
    justify-content: space-around;
    margin-bottom: 36px;
    gap: 12px;
  }

  .leader-card {
    flex: 1;
    text-align: center;
    background: rgba(255,255,255,0.5);
    border-radius: 40px;
    padding: 16px 8px 20px;
    backdrop-filter: blur(4px);
    box-shadow: 0 6px 12px rgba(46, 78, 102, 0.04);
  }

  .leader-emoji {
    font-size: clamp(3.5rem, 18vw, 8rem);
    line-height: 1;
  }

  .leader-label {
    font-size: 1.2rem;
    font-weight: 600;
    margin-top: 6px;
    color: #2b4e65;
  }

  .leader-name {
    font-size: 1.5rem;
    font-weight: 700;
    margin-top: 4px;
    color: #0b2f44;
    letter-spacing: 0.5px;
  }

  .card {
    background: #ffffffd9;
    backdrop-filter: blur(8px);
    border-radius: 32px;
    padding: 24px 22px;
    box-shadow: 0 20px 35px -8px rgba(21, 50, 70, 0.1);
    border: 1px solid #ffffff70;
    margin-bottom: 24px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 16px;
  }

  .card-header h2 {
    font-size: 1.6rem;
    font-weight: 700;
    color: #1b4b64;
  }

  .desktop-layout {
    display: flex;
    gap: 24px;
  }

  .left-column {
    flex: 8;
    display: flex;
    flex-direction: column;
  }

  .right-column {
    flex: 2;
  }

  .quickstart-content {
    font-size: 1rem;
    line-height: 1.6;
    color: #1f3f54;
  }

  .quickstart-content p {
    margin-bottom: 1em;
  }

  .quickstart-content a {
    color: #1e6f9f;
    text-decoration: none;
    font-weight: 500;
    border-bottom: 1.5px dotted #7fa9c7;
  }

  .quickstart-content a:hover {
    color: #0a4c70;
    border-bottom-style: solid;
  }

  .portal-list {
    list-style: none;
  }

  .portal-item {
    display: flex;
    flex-direction: column;
    margin-bottom: 24px;
  }

  .portal-label {
    font-weight: 700;
    color: #1e4e6b;
    margin-bottom: 6px;
    font-size: 0.95rem;
  }

  .portal-value-row {
    display: flex;
    align-items: center;
    background: #ecf3f9;
    border-radius: 40px;
    padding: 6px 12px 6px 16px;
    word-break: break-all;
  }

  .portal-value-text {
    flex: 1;
    color: #0d3e58;
    font-size: 0.95rem;
    white-space: normal;
    word-break: break-all;
    line-height: 1.4;
    margin-right: 8px;
  }

  .copy-btn {
    background: none;
    border: none;
    color: #3a7799;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 4px 6px;
    border-radius: 30px;
    transition: all 0.15s;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .copy-btn:hover {
    background: #cbdde9;
    color: #0b3e5c;
  }

  .info-section {
    width: 100%;
  }

  .info-header {
    margin-bottom: 16px;
  }

  .info-header h2 {
    font-size: 1.6rem;
    font-weight: 700;
    color: #1b4b64;
  }

  .up-info {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 18px;
    padding: 0 4px;
  }

  .up-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid white;
    box-shadow: 0 4px 8px rgba(0,0,0,0.05);
  }

  .up-name a {
    font-size: 1.2rem;
    font-weight: 700;
    color: #1b4b64;
    text-decoration: none;
  }

  .up-name a:hover {
    text-decoration: underline;
  }

  .video-scroll-container {
    position: relative;
  }

  .video-list {
    display: flex;
    gap: 16px;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    padding-bottom: 8px;
    scrollbar-width: thin;
    scrollbar-color: #b0c8da #e2ecf5;
    -webkit-overflow-scrolling: touch;
  }

  .video-list::-webkit-scrollbar {
    height: 6px;
  }

  .video-list::-webkit-scrollbar-thumb {
    background: #b0c8da;
    border-radius: 10px;
  }

  .video-card {
    flex: 0 0 200px;
    scroll-snap-align: start;
    background: rgba(255,255,255,0.6);
    border-radius: 20px;
    padding: 12px;
    box-shadow: 0 6px 14px rgba(0,0,0,0.02);
    transition: transform 0.2s;
  }

  .video-iframe-wrapper {
    position: relative;
    padding-bottom: 56.25%;
    height: 0;
    overflow: hidden;
    border-radius: 16px;
    margin-bottom: 10px;
  }

  .video-iframe-wrapper iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: none;
  }

  .video-title {
    font-weight: 600;
    font-size: 0.95rem;
    line-height: 1.4;
    margin-bottom: 6px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .video-title a {
    color: #1e3b4f;
    text-decoration: none;
  }

  .video-title a:hover {
    color: #0a4c70;
    text-decoration: underline;
  }

  .video-meta {
    font-size: 0.8rem;
    color: #6a859c;
    display: flex;
    justify-content: space-between;
  }

  .footer {
    margin-top: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.8rem;
    color: #8a9eb0;
  }

  .footer .version {
    color: #8a9eb0;
  }

  .footer .copyright {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .toast-tip {
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    background: #1e3b4f;
    color: white;
    padding: 8px 18px;
    border-radius: 60px;
    font-size: 0.9rem;
    opacity: 0;
    transition: opacity 0.2s;
    pointer-events: none;
    z-index: 999;
  }

  .loading-placeholder {
    color: #6a859c;
    text-align: center;
    padding: 20px;
  }

  @media (max-width: 680px) {
    .page { padding: 18px 16px 20px; }
    .desktop-layout { flex-direction: column; }
    .left-column { width: 100%; }
    .right-column { width: 100%; }
    .left-column .card:first-child { order: 1; }
    .info-section { order: 2; }
    .right-column { order: 3; }
    .video-card { flex: 0 0 160px; }
  }
`;

// 深色主题样式
export const darkStyles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    background: #0f172a;
    font-family: 'Segoe UI', 'Roboto', system-ui, sans-serif;
    color: #e2e8f0;
    padding: 20px 16px 30px;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .page {
    max-width: 1000px;
    width: 100%;
    background: rgba(30, 41, 59, 0.7);
    backdrop-filter: blur(2px);
    border-radius: 36px;
    padding: 24px 24px 20px;
    box-shadow: 0 12px 30px rgba(0,0,0,0.3);
  }

  .header-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 28px;
    flex-wrap: wrap;
  }

  .main-title {
    font-size: clamp(28px, 8vw, 52px);
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: -0.01em;
    background: linear-gradient(135deg, #60a5fa, #93c5fd);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    margin-right: 16px;
  }

  .lang-wrapper {
    position: relative;
    user-select: none;
  }

  .lang-btn {
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 40px;
    padding: 10px 18px;
    font-size: 1rem;
    font-weight: 500;
    color: #cbd5e1;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.15s;
    backdrop-filter: blur(4px);
    background: rgba(30, 41, 59, 0.8);
  }

  .lang-btn i {
    font-size: 1rem;
    transition: transform 0.2s;
  }

  .lang-btn.active i {
    transform: rotate(180deg);
  }

  .lang-dropdown {
    position: absolute;
    top: calc(100% + 6px);
    right: 0;
    background: #1e293b;
    border-radius: 24px;
    box-shadow: 0 12px 28px rgba(0,0,0,0.5);
    border: 1px solid #334155;
    overflow: hidden;
    min-width: 140px;
    z-index: 100;
    display: none;
  }

  .lang-dropdown.show {
    display: block;
  }

  .lang-option {
    padding: 12px 20px;
    cursor: pointer;
    font-weight: 500;
    transition: background 0.1s;
    color: #cbd5e1;
  }

  .lang-option:hover {
    background: #334155;
  }

  .lang-option.selected {
    background: #2563eb;
    color: white;
  }

  .leaders {
    display: flex;
    justify-content: space-around;
    margin-bottom: 36px;
    gap: 12px;
  }

  .leader-card {
    flex: 1;
    text-align: center;
    background: rgba(30, 41, 59, 0.5);
    border-radius: 40px;
    padding: 16px 8px 20px;
    backdrop-filter: blur(4px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
  }

  .leader-emoji {
    font-size: clamp(3.5rem, 18vw, 8rem);
    line-height: 1;
  }

  .leader-label {
    font-size: 1.2rem;
    font-weight: 600;
    margin-top: 6px;
    color: #94a3b8;
  }

  .leader-name {
    font-size: 1.5rem;
    font-weight: 700;
    margin-top: 4px;
    color: #f1f5f9;
    letter-spacing: 0.5px;
  }

  .card {
    background: rgba(30, 41, 59, 0.85);
    backdrop-filter: blur(8px);
    border-radius: 32px;
    padding: 24px 22px;
    box-shadow: 0 20px 35px -8px rgba(0,0,0,0.4);
    border: 1px solid #334155;
    margin-bottom: 24px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 16px;
  }

  .card-header h2 {
    font-size: 1.6rem;
    font-weight: 700;
    color: #93c5fd;
  }

  .desktop-layout {
    display: flex;
    gap: 24px;
  }

  .left-column {
    flex: 8;
    display: flex;
    flex-direction: column;
  }

  .right-column {
    flex: 2;
  }

  .quickstart-content {
    font-size: 1rem;
    line-height: 1.6;
    color: #cbd5e1;
  }

  .quickstart-content p {
    margin-bottom: 1em;
  }

  .quickstart-content a {
    color: #60a5fa;
    text-decoration: none;
    font-weight: 500;
    border-bottom: 1.5px dotted #64748b;
  }

  .quickstart-content a:hover {
    color: #93c5fd;
    border-bottom-style: solid;
  }

  .portal-list {
    list-style: none;
  }

  .portal-item {
    display: flex;
    flex-direction: column;
    margin-bottom: 24px;
  }

  .portal-label {
    font-weight: 700;
    color: #94a3b8;
    margin-bottom: 6px;
    font-size: 0.95rem;
  }

  .portal-value-row {
    display: flex;
    align-items: center;
    background: #1e293b;
    border-radius: 40px;
    padding: 6px 12px 6px 16px;
    word-break: break-all;
  }

  .portal-value-text {
    flex: 1;
    color: #cbd5e1;
    font-size: 0.95rem;
    white-space: normal;
    word-break: break-all;
    line-height: 1.4;
    margin-right: 8px;
  }

  .copy-btn {
    background: none;
    border: none;
    color: #60a5fa;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 4px 6px;
    border-radius: 30px;
    transition: all 0.15s;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .copy-btn:hover {
    background: #334155;
    color: #93c5fd;
  }

  .info-section {
    width: 100%;
  }

  .info-header {
    margin-bottom: 16px;
  }

  .info-header h2 {
    font-size: 1.6rem;
    font-weight: 700;
    color: #93c5fd;
  }

  .up-info {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 18px;
    padding: 0 4px;
  }

  .up-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #334155;
    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
  }

  .up-name a {
    font-size: 1.2rem;
    font-weight: 700;
    color: #f1f5f9;
    text-decoration: none;
  }

  .up-name a:hover {
    text-decoration: underline;
    color: #60a5fa;
  }

  .video-scroll-container {
    position: relative;
  }

  .video-list {
    display: flex;
    gap: 16px;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    padding-bottom: 8px;
    scrollbar-width: thin;
    scrollbar-color: #475569 #1e293b;
    -webkit-overflow-scrolling: touch;
  }

  .video-list::-webkit-scrollbar {
    height: 6px;
  }

  .video-list::-webkit-scrollbar-thumb {
    background: #475569;
    border-radius: 10px;
  }

  .video-card {
    flex: 0 0 200px;
    scroll-snap-align: start;
    background: rgba(30, 41, 59, 0.6);
    border-radius: 20px;
    padding: 12px;
    box-shadow: 0 6px 14px rgba(0,0,0,0.2);
    transition: transform 0.2s;
  }

  .video-iframe-wrapper {
    position: relative;
    padding-bottom: 56.25%;
    height: 0;
    overflow: hidden;
    border-radius: 16px;
    margin-bottom: 10px;
  }

  .video-iframe-wrapper iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: none;
  }

  .video-title {
    font-weight: 600;
    font-size: 0.95rem;
    line-height: 1.4;
    margin-bottom: 6px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .video-title a {
    color: #e2e8f0;
    text-decoration: none;
  }

  .video-title a:hover {
    color: #60a5fa;
    text-decoration: underline;
  }

  .video-meta {
    font-size: 0.8rem;
    color: #94a3b8;
    display: flex;
    justify-content: space-between;
  }

  .footer {
    margin-top: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.8rem;
    color: #64748b;
  }

  .footer .version {
    color: #64748b;
  }

  .footer .copyright {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .toast-tip {
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    background: #2563eb;
    color: white;
    padding: 8px 18px;
    border-radius: 60px;
    font-size: 0.9rem;
    opacity: 0;
    transition: opacity 0.2s;
    pointer-events: none;
    z-index: 999;
  }

  .loading-placeholder {
    color: #94a3b8;
    text-align: center;
    padding: 20px;
  }

  @media (max-width: 680px) {
    .page { padding: 18px 16px 20px; }
    .desktop-layout { flex-direction: column; }
    .left-column { width: 100%; }
    .right-column { width: 100%; }
    .left-column .card:first-child { order: 1; }
    .info-section { order: 2; }
    .right-column { order: 3; }
    .video-card { flex: 0 0 160px; }
  }
`;