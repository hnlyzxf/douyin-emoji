const dom = {
    fileInput: document.getElementById('fileInput'),
    uploadArea: document.getElementById('uploadArea'),
    uploadButton: document.getElementById('uploadButton'),
    uploadSection: document.getElementById('uploadSection'),
    contentSection: document.getElementById('contentSection'),
    loadingDiv: document.getElementById('loading'),
    errorDiv: document.getElementById('error'),
    searchBox: document.getElementById('searchBox'),
    stats: document.getElementById('stats'),
    statsSection: document.getElementById('statsSection'),
    filterSection: document.getElementById('filterSection'),
    timeLimitedNotice: document.getElementById('timeLimitedNotice'),
    stickersGrid: document.getElementById('stickersGrid'),
    modal: document.getElementById('stickerModal'),
    modalClose: document.getElementById('modalClose'),
    modalTitle: document.getElementById('modalTitle'),
    modalBadges: document.getElementById('modalBadges'),
    modalImage: document.getElementById('modalImage'),
    downloadBtn: document.getElementById('downloadBtn'),
    themeToggle: document.getElementById('themeToggle'),
    themeToggleText: document.getElementById('themeToggleText')
};

let currentData = null;
let currentFilter = 'all';
let searchTerm = '';
let storedThemePreference = null;

function removeBrackets(text) {
    return String(text || '').replace(/[\[\]【】()（）]/g, '');
}

// 限时表情始终可见，不受时间戳影响
function isVisibleSticker(sticker) {
    return sticker.hide === 0 || sticker.time_limited === 1;
}

function updateThemeToggleUI(theme) {
    if (dom.themeToggleText) {
        dom.themeToggleText.textContent = theme === 'dark' ? '深色模式' : '浅色模式';
    }
    if (dom.themeToggle) {
        dom.themeToggle.classList.toggle('is-dark', theme === 'dark');
        dom.themeToggle.setAttribute('aria-pressed', String(theme === 'dark'));
    }
}

function applyTheme(theme, persistSelection = false) {
    document.body.dataset.theme = theme;
    updateThemeToggleUI(theme);

    if (persistSelection) {
        storedThemePreference = theme;
        try {
            localStorage.setItem('preferred-theme', theme);
        } catch (error) {
            console.warn('无法保存主题偏好:', error);
        }
    }
}

function initTheme() {
    if (!dom.themeToggle) return;

    try {
        storedThemePreference = localStorage.getItem('preferred-theme');
    } catch {
        storedThemePreference = null;
    }

    const mediaQuery =
        typeof window.matchMedia === 'function'
            ? window.matchMedia('(prefers-color-scheme: dark)')
            : null;

    const resolveSystemTheme = () => (mediaQuery && mediaQuery.matches ? 'dark' : 'light');
    const initialTheme = storedThemePreference || resolveSystemTheme();
    applyTheme(initialTheme);

    dom.themeToggle.addEventListener('click', () => {
        const nextTheme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
        applyTheme(nextTheme, true);
    });

    dom.themeToggle.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        storedThemePreference = null;
        try {
            localStorage.removeItem('preferred-theme');
        } catch (error) {
            console.warn('无法清除主题偏好:', error);
        }
        applyTheme(resolveSystemTheme());
    });

    const handleSchemeChange = (event) => {
        if (!storedThemePreference) {
            applyTheme(event.matches ? 'dark' : 'light');
        }
    };

    if (mediaQuery) {
        if (typeof mediaQuery.addEventListener === 'function') {
            mediaQuery.addEventListener('change', handleSchemeChange);
        } else if (typeof mediaQuery.addListener === 'function') {
            mediaQuery.addListener(handleSchemeChange);
        }
    }
}

function showMainContent() {
    dom.loadingDiv.classList.add('hidden');
    dom.errorDiv.classList.add('hidden');
    dom.uploadSection.classList.add('hidden');
    dom.contentSection.classList.remove('hidden');
    dom.statsSection.style.display = 'block';
}

function showError() {
    dom.loadingDiv.classList.add('hidden');
    dom.contentSection.classList.add('hidden');
    dom.statsSection.style.display = 'none';
    dom.errorDiv.classList.remove('hidden');
    dom.uploadSection.classList.remove('hidden');
}

function loadDefaultJson() {
    fetch('./info.json', { cache: 'no-cache' })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`加载 info.json 失败: HTTP ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            currentData = data;
            displayData(data);
            showMainContent();
        })
        .catch((error) => {
            console.error('加载失败:', error);
            showError();
        });
}

function handleFile(file) {
    if (!file || !file.name.toLowerCase().endsWith('.json')) {
        alert('请上传 .json 文件');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            currentData = data;
            displayData(data);
            showMainContent();
        } catch (error) {
            alert(`JSON 解析失败: ${error.message}`);
        }
    };
    reader.readAsText(file, 'utf-8');
}

function displayData(data) {
    const stickers = Array.isArray(data?.stickers) ? data.stickers : [];
    const totalStickers = stickers.length;
    const hiddenStickers = stickers.filter((s) => !isVisibleSticker(s)).length;
    const visibleStickers = totalStickers - hiddenStickers;
    const systemEmoji = stickers.filter((s) => s.is_system_emoji === 1).length;
    const timeLimited = stickers.filter((s) => s.time_limited === 1).length;

    dom.stats.innerHTML = `
        <div class="stat-item">
            <div class="stat-number">${totalStickers}</div>
            <div class="stat-label">总表情数</div>
        </div>
        <div class="stat-item">
            <div class="stat-number">${visibleStickers}</div>
            <div class="stat-label">显示表情</div>
        </div>
        <div class="stat-item">
            <div class="stat-number">${hiddenStickers}</div>
            <div class="stat-label">隐藏表情</div>
        </div>
        <div class="stat-item">
            <div class="stat-number">${systemEmoji}</div>
            <div class="stat-label">系统表情</div>
        </div>
        <div class="stat-item">
            <div class="stat-number">${timeLimited}</div>
            <div class="stat-label">限时表情</div>
        </div>
    `;

    dom.filterSection.innerHTML = `
        <button class="btn btn-filter active" data-filter="all">全部 (${totalStickers})</button>
        <button class="btn btn-filter" data-filter="visible">显示 (${visibleStickers})</button>
        <button class="btn btn-filter" data-filter="hidden">隐藏 (${hiddenStickers})</button>
        <button class="btn btn-filter" data-filter="system">系统 (${systemEmoji})</button>
        <button class="btn btn-filter" data-filter="limited">限时 (${timeLimited})</button>
    `;

    filterAndDisplayStickers();
}

function formatMonthDay(timestampSeconds) {
    if (!Number.isFinite(timestampSeconds)) return '';
    const date = new Date(timestampSeconds * 1000);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}.${day}`;
}

function getTimeLimitedStatus(startTimestamp, endTimestamp) {
    if (!Number.isFinite(startTimestamp) || !Number.isFinite(endTimestamp)) {
        return { key: 'all', label: '全部展示' };
    }

    const now = Math.floor(Date.now() / 1000);
    if (now < startTimestamp) return { key: 'upcoming', label: '未开始' };
    if (now > endTimestamp) return { key: 'ended', label: '已结束' };
    return { key: 'active', label: '进行中' };
}

function renderTimeLimitedNotices(data) {
    const activities = [];
    const seen = new Set();

    if (Array.isArray(data?.time_limited_show_names)) {
        data.time_limited_show_names.forEach((item) => {
            if (!item || typeof item.show_name !== 'string' || !item.show_name.trim()) return;

            const normalized = {
                name: item.show_name.trim(),
                startTimestamp: Number(item.start_timestamp),
                endTimestamp: Number(item.end_timestamp)
            };
            const dedupeKey = `${normalized.name}|${normalized.startTimestamp}|${normalized.endTimestamp}`;

            if (!seen.has(dedupeKey)) {
                seen.add(dedupeKey);
                activities.push(normalized);
            }
        });
    }

    if (typeof data?.time_limited_show_name === 'string' && data.time_limited_show_name.trim()) {
        const fallbackName = data.time_limited_show_name.trim();
        const existsByName = activities.some((item) => item.name === fallbackName);
        if (!existsByName) {
            activities.unshift({
                name: fallbackName,
                startTimestamp: NaN,
                endTimestamp: NaN
            });
        }
    }

    if (!activities.length) return '';

    activities.sort((a, b) => {
        const aTime = Number.isFinite(a.startTimestamp) ? a.startTimestamp : Number.MAX_SAFE_INTEGER;
        const bTime = Number.isFinite(b.startTimestamp) ? b.startTimestamp : Number.MAX_SAFE_INTEGER;
        return aTime - bTime;
    });

    const listHtml = activities
        .map((item) => {
            const hasTimeRange = Number.isFinite(item.startTimestamp) && Number.isFinite(item.endTimestamp);
            const dateRange = hasTimeRange
                ? `${formatMonthDay(item.startTimestamp)} - ${formatMonthDay(item.endTimestamp)}`
                : '时间未提供';
            const status = getTimeLimitedStatus(item.startTimestamp, item.endTimestamp);

            return `
                <div class="time-limited-item">
                    <div class="time-limited-item-row">
                        <span class="time-limited-name">${item.name}</span>
                        <span class="time-limited-status is-${status.key}">${status.label}</span>
                    </div>
                    <div class="time-limited-date">${dateRange}</div>
                </div>
            `;
        })
        .join('');

    return `
        <div class="time-limited-board">
            <div class="time-limited-board-title">
                限时活动（全部展示）
                <span class="time-limited-count">${activities.length}</span>
            </div>
            <div class="time-limited-list">${listHtml}</div>
        </div>
    `;
}

function filterAndDisplayStickers() {
    if (!currentData || !Array.isArray(currentData.stickers)) return;

    if (currentFilter === 'limited') {
        dom.timeLimitedNotice.innerHTML = renderTimeLimitedNotices(currentData);
        dom.timeLimitedNotice.classList.remove('hidden');
    } else {
        dom.timeLimitedNotice.innerHTML = '';
        dom.timeLimitedNotice.classList.add('hidden');
    }

    let filtered = currentData.stickers;

    switch (currentFilter) {
        case 'visible':
            filtered = filtered.filter((s) => isVisibleSticker(s));
            break;
        case 'hidden':
            filtered = filtered.filter((s) => !isVisibleSticker(s));
            break;
        case 'system':
            filtered = filtered.filter((s) => s.is_system_emoji === 1);
            break;
        case 'limited':
            filtered = filtered.filter((s) => s.time_limited === 1);
            break;
        default:
            break;
    }

    if (searchTerm) {
        filtered = filtered.filter((s) => removeBrackets(s.display_name).toLowerCase().includes(searchTerm));
    }

    displayStickers(filtered);
}

function displayStickers(stickers) {
    if (!stickers.length) {
        dom.stickersGrid.innerHTML = '<p style="color: var(--text-muted);">未找到匹配的表情。</p>';
        return;
    }

    dom.stickersGrid.innerHTML = stickers
        .map((sticker) => {
            const imagePath = `./static/${sticker.uri}`;
            const displayText = removeBrackets(sticker.display_name);

            return `
                <div class="sticker-item" data-uri="${sticker.uri}">
                    <div class="sticker-image-container">
                        <img
                            src="${imagePath}"
                            class="sticker-image"
                            alt="${displayText}"
                            loading="lazy"
                            onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
                        >
                        <div class="sticker-image-placeholder" style="display: none;">无图片</div>
                    </div>
                    <div class="sticker-name" title="${displayText}">${displayText}</div>
                    <div class="sticker-badges">
                        ${sticker.hide === 1 ? '<span class="badge badge-hidden">隐藏</span>' : ''}
                        ${sticker.is_system_emoji === 1 ? '<span class="badge badge-system">系统</span>' : ''}
                        ${sticker.time_limited === 1 ? '<span class="badge badge-limited">限时</span>' : ''}
                    </div>
                </div>
            `;
        })
        .join('');
}

function openModal(stickerUri) {
    if (!currentData || !Array.isArray(currentData.stickers)) return;

    const sticker = currentData.stickers.find((s) => s.uri === stickerUri);
    if (!sticker) return;

    const imagePath = `./static/${sticker.uri}`;
    const displayText = removeBrackets(sticker.display_name);

    dom.modalTitle.textContent = displayText;
    dom.modalImage.src = imagePath;

    const badges = [
        sticker.hide === 1 ? '<span class="badge badge-hidden">隐藏</span>' : '',
        sticker.is_system_emoji === 1 ? '<span class="badge badge-system">系统</span>' : '',
        sticker.time_limited === 1 ? '<span class="badge badge-limited">限时</span>' : ''
    ].join('');
    dom.modalBadges.innerHTML = badges;

    dom.downloadBtn.dataset.path = imagePath;
    dom.downloadBtn.dataset.filename = sticker.uri;
    delete dom.downloadBtn.dataset.externalUrl;

    dom.modal.classList.add('show');
}

function closeModal() {
    dom.modal.classList.remove('show');
}

function openDownloadModal() {
    dom.modalTitle.textContent = '部分动态表情下载';
    dom.modalImage.src = './assets/img/dongtai.png';
    dom.modalBadges.innerHTML = '<span class="badge badge-limited">动态表情</span>';

    dom.downloadBtn.dataset.path = 'EXTERNAL_LINK';
    dom.downloadBtn.dataset.filename = 'dynamic-stickers';
    dom.downloadBtn.dataset.externalUrl = 'https://www.123865.com/s/lnZUVv-4T2fd';

    dom.modal.classList.add('show');
}

function downloadSticker(imagePath, filename) {
    fetch(imagePath)
        .then((response) => response.blob())
        .then((blob) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        })
        .catch((error) => {
            console.error('下载失败:', error);
            alert('下载失败，请重试');
        });
}

function initEventListeners() {
    dom.searchBox.addEventListener('input', (e) => {
        searchTerm = e.target.value.toLowerCase().trim();
        filterAndDisplayStickers();
    });

    dom.uploadButton.addEventListener('click', () => dom.fileInput.click());
    dom.fileInput.addEventListener('change', (e) => handleFile(e.target.files[0]));

    dom.uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        dom.uploadArea.classList.add('dragover');
    });

    dom.uploadArea.addEventListener('dragleave', () => {
        dom.uploadArea.classList.remove('dragover');
    });

    dom.uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        dom.uploadArea.classList.remove('dragover');
        handleFile(e.dataTransfer.files[0]);
    });

    dom.filterSection.addEventListener('click', (e) => {
        const button = e.target.closest('.btn-filter');
        if (!button) return;

        currentFilter = button.dataset.filter;
        dom.filterSection.querySelectorAll('.btn-filter').forEach((btn) => btn.classList.remove('active'));
        button.classList.add('active');

        filterAndDisplayStickers();
    });

    dom.stickersGrid.addEventListener('click', (e) => {
        const item = e.target.closest('.sticker-item');
        if (!item) return;
        openModal(item.dataset.uri);
    });

    dom.modalClose.addEventListener('click', closeModal);
    dom.modal.addEventListener('click', (e) => {
        if (e.target === dom.modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && dom.modal.classList.contains('show')) {
            closeModal();
        }
    });

    dom.downloadBtn.addEventListener('click', () => {
        const { path, filename, externalUrl } = dom.downloadBtn.dataset;

        if (externalUrl) {
            window.open(externalUrl, '_blank');
            return;
        }

        if (path && filename && path !== 'EXTERNAL_LINK') {
            downloadSticker(path, filename);
        }
    });

    const downloadDynamicLink = document.getElementById('downloadDynamicLink');
    if (downloadDynamicLink) {
        downloadDynamicLink.addEventListener('click', (e) => {
            e.preventDefault();
            openDownloadModal();
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initEventListeners();
    loadDefaultJson();
});
