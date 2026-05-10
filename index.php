<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>抖音表情包库——木子白白白</title>
    <link rel="stylesheet" href="assets/css/index.css" />
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="header-top">
                <div class="brand">
                    <span class="brand-mark" aria-hidden="true">
                        <img src="./assets/img/icon.svg" alt="" />
                    </span>
                    <div>
                        <div class="brand-meta">木子白白白</div>
                        <div class="brand-label">Douyin Sticker Studio</div>
                    </div>
                </div>
                <button
                    class="theme-toggle"
                    id="themeToggle"
                    type="button"
                    aria-label="切换明暗模式"
                    title="点击切换明暗模式，右键恢复系统偏好"
                >
                    <span class="toggle-icon" aria-hidden="true">
                        <svg class="icon-sun" viewBox="0 0 24 24" stroke-width="1.6" fill="none">
                            <circle cx="12" cy="12" r="5"></circle>
                            <line x1="12" y1="2" x2="12" y2="5"></line>
                            <line x1="12" y1="19" x2="12" y2="22"></line>
                            <line x1="4.22" y1="4.22" x2="6.34" y2="6.34"></line>
                            <line x1="17.66" y1="17.66" x2="19.78" y2="19.78"></line>
                            <line x1="2" y1="12" x2="5" y2="12"></line>
                            <line x1="19" y1="12" x2="22" y2="12"></line>
                            <line x1="4.22" y1="19.78" x2="6.34" y2="17.66"></line>
                            <line x1="17.66" y1="6.34" x2="19.78" y2="4.22"></line>
                        </svg>
                        <svg class="icon-moon" viewBox="0 0 24 24" stroke-width="1.6" fill="none">
                            <path d="M21 14.5A8.5 8.5 0 0 1 10.5 4a8.5 8.5 0 1 0 10.5 10.5Z"></path>
                        </svg>
                    </span>
                    <span class="theme-toggle-text" id="themeToggleText">浅色模式</span>
                </button>
            </div>
            <div class="header-main">
                <h1>抖音表情包库</h1>
                <p>免责声明：本页面仅用于交流与学习，与抖音官方无关，请勿将素材用于任何商业用途。</p>
                <div class="meta-row">
                    <span class="meta-chip"
                        >来源：<a href="https://www.douyin.com" target="_blank" rel="noreferrer">抖音</a></span>
                    <span class="meta-chip">更新时间：2026/02/10</span>
                    <span class="meta-chip"
                        ><a href="https://ihn.lanzouu.com/i1MUr3i97pyh" target="_blank" rel="noreferrer">下载全部静态表情</a></span>
                    <span class="meta-chip"
                        ><a href="https://www.123865.com/s/lnZUVv-4T2fd" target="_blank" rel="noreferrer" id="downloadDynamicLink">下载部分动态表情</a></span>
                </div>
            </div>
        </div>

        <div class="card card-upload hidden" id="uploadSection">
            <div class="upload-area" id="uploadArea">
                <div class="upload-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 7V5a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v2" />
                        <path d="M3 7h6l2 2h10v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
                    </svg>
                </div>
                <div class="upload-title">导入 info.json</div>
                <p class="upload-desc">拖拽 JSON 文件到此或点击按钮上传</p>
                <button type="button" class="btn btn-primary" id="uploadButton">选择文件</button>
                <input type="file" id="fileInput" accept=".json" />
                <p class="upload-hint">支持 .json 格式文件</p>
            </div>
        </div>

        <div class="card card-content hidden" id="contentSection">
            <div class="info-block">
                <h3>表情列表</h3>
                <div class="toolbar">
                    <input
                        type="text"
                        class="search-box"
                        id="searchBox"
                        placeholder="搜索表情名称..."
                    />
                    <div class="filter-section" id="filterSection"></div>
                </div>
                <div id="timeLimitedNotice"></div>
                <div class="stickers-grid" id="stickersGrid"></div>
            </div>
        </div>

        <div class="loading" id="loading">
            <p>正在加载 info.json...</p>
        </div>

        <div class="error hidden" id="error">
            <p>加载失败，请上传 info.json 文件</p>
        </div>

        <div class="card" id="statsSection" style="display: none;">
            <div class="info-block">
                <h3>统计信息</h3>
                <div class="stats" id="stats"></div>
            </div>
        </div>
    </div>

    <!-- 弹窗 -->
    <div class="modal-backdrop" id="stickerModal">
        <div class="modal-content">
            <span class="modal-close" id="modalClose">&times;</span>
            <div class="modal-title" id="modalTitle"></div>
            <div class="modal-badges" id="modalBadges"></div>
            <img class="modal-image" id="modalImage" alt="表情" />
            <button type="button" class="btn btn-primary download-btn" id="downloadBtn">下载表情</button>
        </div>
    </div>

    <!-- 页脚版权信息 -->
    <div class="container">
        <div class="footer">
            <p>
                &copy; 2026
                <a href="https://linux.do/u/672149402/summary" target="_blank" rel="noreferrer">木子白白白</a>
                · 抖音表情包库
            </p>
        </div>
    </div>

    <script src="assets/js/index.js"></script>
    <script charset="UTF-8" id="LA_COLLECT" src="//sdk.51.la/js-sdk-pro.min.js"></script>
    <script>LA.init({id:"3O4vyVJwXXEwx41L",ck:"3O4vyVJwXXEwx41L"})</script>
</body>
</html>
