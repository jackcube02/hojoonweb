// 오른쪽 작업 영역만 교체합니다. 헤더와 소개, 조절선은 그대로 유지됩니다.
const works = document.querySelector('#works, #store');
const list = document.querySelector('#list');
const detail = document.querySelector('#detail');
let listScroll = 0;
let listMobile = false;
// 모바일은 페이지 스크롤, 데스크탑은 오른쪽 영역 스크롤을 사용합니다.
const mobileView = () => window.matchMedia('(max-width: 768px)').matches;
let returnLink = null;
const homeHash = works.id === 'store' ? '#store' : '#works';
const homeTitle = works.id === 'store' ? 'Store — spreadseoul' : 'spreadseoul';
const notices = new Map();
let newsError = false;
const newsReady = loadNews();
let lastHash = null;

function escapeText(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[character]));
}

function projectLink(project) {
    if (!project.link) return '';
    const label = project.video ? 'YouTube에서 보기' : '관련 사이트 보기';
    return `<a class="source" href="${escapeText(project.link)}" target="_blank" rel="noopener noreferrer">${label} ↗</a>`;
}

function showDetail(project) {
    const title = project.detailTitle || project.title;
    const credits = project.credits.map(html => `<div>${html}</div>`).join('');
    const descriptions = project.description.map(text => `<div class="text" lang="${text.lang}">${text.html}</div>`).join('');
    const images = project.images.map((src, index) => `<a class="image" href="${escapeText(src)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeText(title)} 이미지 ${index + 1} 원본 보기"><img src="${escapeText(src)}" alt="${escapeText(title)} — ${index + 1}" loading="${index === 0 ? 'eager' : 'lazy'}" decoding="async"></a>`).join('');
    const video = project.video ? `<div class="film"><iframe src="${escapeText(project.video)}" title="${escapeText(title)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>` : '';
    detail.innerHTML = `
        <div class="detail-top"><a class="back" href="#works" data-list aria-label="작업 목록으로 돌아가기" title="뒤로가기">←</a></div>
        <h1 id="work-title" tabindex="-1">${escapeText(title)}</h1>
        <div class="about">
            <div class="info">${project.format ? `<p>${escapeText(project.format)}</p>` : ''}${credits}${projectLink(project)}</div>
            ${descriptions ? `<div class="description">${descriptions}</div>` : ''}
        </div>
        <div class="gallery">${video}${images}</div>
        <a class="back bottom" href="#works" data-list aria-label="작업 목록으로 돌아가기" title="뒤로가기">←</a>`;
    document.title = `${title} — spreadseoul`;
}


// 공통 HTML 한 파일에서 소식 목록과 본문을 가져옵니다.
async function loadNews() {
    const newsList = document.querySelector('#news-list');
    try {
        const response = await fetch('news.html', { cache: 'no-cache' });
        if (!response.ok) throw new Error('News unavailable');
        const page = new DOMParser().parseFromString(await response.text(), 'text/html');
        newsList.replaceChildren();
        for (const article of page.querySelectorAll('article[id]')) {
            const title = article.querySelector('h1');
            if (!title || notices.has(article.id)) continue;
            notices.set(article.id, article);
            const link = document.createElement('a');
            link.className = 'news-link';
            link.href = `#news/${encodeURIComponent(article.id)}`;
            link.dataset.news = article.id;
            const label = document.createElement('span');
            label.className = 'news-title';
            label.textContent = title.textContent;
            link.append(label);
            const date = article.querySelector('time');
            if (date) {
                const copy = date.cloneNode(true);
                copy.className = 'news-date';
                link.append(copy);
            }
            newsList.append(link);
        }
        if (!notices.size) newsList.textContent = '아직 등록된 소식이 없습니다.';
    } catch {
        newsError = true;
        newsList.textContent = '소식을 불러오지 못했습니다. 새로고침해 주세요.';
    }
}

function backLink() {
    return `<a class="back" href="${homeHash}" data-list aria-label="이전 목록으로 돌아가기" title="뒤로가기">←</a>`;
}

function showNews(article) {
    detail.innerHTML = `<div class="detail-top">${backLink()}</div>`;
    const title = article.querySelector('h1').cloneNode(true);
    title.id = 'work-title';
    title.tabIndex = -1;
    detail.append(title);
    const date = article.querySelector('time');
    if (date) {
        const copy = date.cloneNode(true);
        copy.className = 'news-date';
        detail.append(copy);
    }
    const body = article.querySelector('.news-body');
    if (body) detail.append(body.cloneNode(true));
    document.title = `${title.textContent} — spreadseoul`;
}

async function renderWork() {
    if (location.hash === lastHash) return;
    lastHash = location.hash;
    const route = location.hash;
    const isNews = route.startsWith('#news/');
    let id = '';
    try {
        if (isNews || route.startsWith('#work/')) id = decodeURIComponent(route.slice(6));
    } catch { id = 'unknown'; }

    document.querySelectorAll('[data-news]').forEach(link => {
        if (isNews && link.dataset.news === id) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
    });

    if (!id) {
        const returning = list.hidden;
        detail.hidden = true;
        detail.replaceChildren(); // 목록으로 돌아가면 영상 재생도 멈춥니다.
        list.hidden = false;
        document.title = homeTitle;
        if (returning) {
            if (mobileView() === listMobile) {
                if (mobileView()) window.scrollTo({ top: listScroll, behavior: 'instant' });
                else works.scrollTop = listScroll;
            } else if (returnLink?.isConnected) {
                returnLink.scrollIntoView({ block: 'center', behavior: 'instant' });
            }
            if (returnLink?.isConnected) returnLink.focus({ preventScroll: true });
            else works.focus({ preventScroll: true });
        }
        return;
    }

    if (!list.hidden) {
        listMobile = mobileView();
        listScroll = listMobile ? window.scrollY : works.scrollTop;
        returnLink = document.activeElement?.matches('[data-work], [data-news]') ? document.activeElement : null;
    }
    const project = !isNews && typeof WORKS !== 'undefined' ? WORKS.find(project => project.id === id) : null;
    list.hidden = true;
    detail.hidden = false;
    if (isNews) {
        detail.innerHTML = '<p role="status">소식을 불러오는 중입니다.</p>';
        await newsReady;
        if (location.hash !== route) return;
        const article = notices.get(id);
        if (article) {
            showNews(article);
            document.querySelectorAll('[data-news]').forEach(link => {
                if (link.dataset.news === id) link.setAttribute('aria-current', 'page');
            });
        }
        else {
            detail.innerHTML = `${backLink()}<h1 id="work-title" tabindex="-1">${newsError ? '소식을 불러오지 못했습니다.' : '소식을 찾을 수 없습니다.'}</h1><p>왼쪽 목록에서 다시 선택하거나 새로고침해 주세요.</p>`;
            document.title = '소식 — spreadseoul';
        }
    } else if (project) showDetail(project);
    else {
        detail.innerHTML = '<a class="back" href="#works" data-list aria-label="작업 목록으로 돌아가기" title="뒤로가기">←</a><h1 id="work-title" tabindex="-1">작업을 찾을 수 없습니다.</h1><p>전체 작업에서 다시 선택해 주세요.</p>';
        document.title = '작업을 찾을 수 없습니다 — spreadseoul';
    }
    if (mobileView()) works.scrollIntoView({ block: 'start', behavior: 'instant' });
    else works.scrollTop = 0;
    document.querySelector('#work-title').focus({ preventScroll: true });
}

function navigateWork(hash) {
    if (location.hash !== hash) history.pushState(null, '', hash);
    renderWork();
}

document.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (link.hasAttribute('data-work') || link.hasAttribute('data-list') || link.hasAttribute('data-news')) {
        event.preventDefault();
        navigateWork(link.getAttribute('href'));
    } else if (link.closest('#nav') && link.getAttribute('href') === (works.id === 'store' ? 'store.html' : 'index.html')) {
        event.preventDefault();
        navigateWork(homeHash);
    }
});

// 네트워크 문제로 이미지가 열리지 않아도 원본 링크와 작업명은 유지합니다.
works.addEventListener('error', event => {
    const image = event.target;
    if (!(image instanceof HTMLImageElement) || image.hidden) return;
    image.hidden = true;
    const message = document.createElement('span');
    message.className = 'image-error';
    message.textContent = '이미지를 불러오지 못했습니다.';
    image.after(message);
}, true);

// 목록은 index.html을 그대로 사용합니다. 제목·표지·스티커는 HTML에서 수정하세요.
window.addEventListener('popstate', renderWork);
window.addEventListener('hashchange', renderWork);
renderWork();
