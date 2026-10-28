
const works = document.querySelector('#works, #store, #text');
const list = document.querySelector('#list');
const detail = document.querySelector('#detail');
let listScroll = 0;
let listMobile = false;

const mobileView = () => window.matchMedia('(max-width: 768px)').matches;
let returnLink = null;
const homeHash = `#${works.id}`;
const homePage = { works: 'index.html', store: 'store.html', text: 'text.html' }[works.id];
const homeTitle = { works: 'spreadseoul', store: 'Store — spreadseoul', text: 'Text — spreadseoul' }[works.id];
const filter = document.querySelector('#filter');

if (filter) {
    const buttons = filter.querySelectorAll('button[data-filter]');
    const cards = list.querySelectorAll('.work');
    const status = document.querySelector('#filter-status');
    filter.addEventListener('click', event => {
        const button = event.target.closest('button[data-filter]');
        if (!button || !filter.contains(button)) return;
        const category = button.dataset.filter;
        let count = 0;
        for (const card of cards) {
            const matches = category === 'all' || Array.from(card.querySelectorAll('.tags .tag')).some(tag => tag.classList.contains(category));
            card.hidden = !matches;
            if (matches) count++;
        }
        for (const item of buttons) {
            item.setAttribute('aria-pressed', String(item === button));
        }
        status.textContent = `${button.textContent.trim()} 작업 ${count}개`;
    });
}

const writings = new Map();

for (const template of document.querySelectorAll('template[data-text]')) {
    const title = template.content.querySelector('.text-title');
    if (!title) continue;
    const id = template.dataset.text;
    writings.set(id, template);
    const item = document.createElement('li');
    item.className = 'text-item';
    const link = document.createElement('a');
    link.className = 'text-link';
    link.href = `#text/${encodeURIComponent(id)}`;
    link.dataset.text = id;
    const label = document.createElement('p');
    label.className = 'text-list-title';
    label.textContent = title.textContent;
    link.append(label);
    const date = template.content.querySelector('.text-date');
    if (date) link.append(date.cloneNode(true));
    const author = template.content.querySelector('.text-author');
    if (author) link.append(author.cloneNode(true));
    item.append(link);
    document.querySelector('.text-list').append(item);
}
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
    const images = project.images.map((src, index) => `<a class="image" href="${escapeText(src)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeText(title)} 이미지 ${index + 1} 크게 보기"><img src="${escapeText(src)}" alt="${escapeText(title)} — ${index + 1}" loading="${index === 0 ? 'eager' : 'lazy'}" decoding="async"></a>`).join('');
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

function showText(template) {
    detail.innerHTML = `<div class="detail-top">${backLink()}</div>`;
    const content = template.content.cloneNode(true);
    const title = content.querySelector('.text-title');
    title.id = 'text-title';
    title.tabIndex = -1;
    detail.append(content);
    document.title = `${title.textContent} — spreadseoul`;
}

async function renderWork() {
    if (location.hash === lastHash) return;
    lastHash = location.hash;
    if (viewer.open) viewer.close();
    const route = location.hash;
    const isNews = route.startsWith('#news/');
    const isText = route.startsWith('#text/');
    let id = '';
    try {
        if (isNews || isText || route.startsWith('#work/')) id = decodeURIComponent(route.slice(6));
    } catch { id = 'unknown'; }

    document.querySelectorAll('[data-news]').forEach(link => {
        if (isNews && link.dataset.news === id) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
    });

    if (!id) {
        const returning = list.hidden;
        detail.hidden = true;
        detail.replaceChildren(); 
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
        returnLink = document.activeElement?.matches('[data-work], [data-news], a[data-text]') ? document.activeElement : null;
    }
    const project = !isNews && !isText && typeof WORKS !== 'undefined' ? WORKS.find(project => project.id === id) : null;
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
    } else if (isText) {
        const template = writings.get(id);
        if (template) showText(template);
        else {
            detail.innerHTML = `${backLink()}<h1 id="text-title" class="text-title" tabindex="-1">글을 찾을 수 없습니다.</h1><p class="text-body">글 목록에서 다시 선택해 주세요.</p>`;
            document.title = '글을 찾을 수 없습니다 — spreadseoul';
        }
    } else if (project) showDetail(project);
    else {
        detail.innerHTML = '<a class="back" href="#works" data-list aria-label="작업 목록으로 돌아가기" title="뒤로가기">←</a><h1 id="work-title" tabindex="-1">작업을 찾을 수 없습니다.</h1><p>전체 작업에서 다시 선택해 주세요.</p>';
        document.title = '작업을 찾을 수 없습니다 — spreadseoul';
    }
    if (mobileView()) works.scrollIntoView({ block: 'start', behavior: 'instant' });
    else works.scrollTop = 0;
    const heading = detail.querySelector(isText ? '#text-title' : '#work-title');
    detail.setAttribute('aria-labelledby', heading.id);
    heading.focus({ preventScroll: true });
}

const viewer = document.createElement('dialog');
viewer.id = 'viewer';
viewer.setAttribute('aria-label', '작업 이미지 크게 보기');
viewer.innerHTML = `<img id="viewer-image" alt=""><p id="viewer-status" role="status"></p>`;
document.body.append(viewer);
const viewerImage = viewer.querySelector('#viewer-image');
const viewerStatus = viewer.querySelector('#viewer-status');
let imageScroll = 0;

function openImage(link) {
    viewerImage.alt = link.querySelector('img').alt;
    viewerStatus.textContent = '이미지를 불러오는 중입니다.';
    viewerImage.hidden = false;
    viewerImage.src = link.href;
    imageScroll = window.scrollY;
    document.documentElement.style.setProperty('--image-scroll', `-${imageScroll}px`);
    document.documentElement.classList.add('image-open');
    viewer.showModal();
}

viewerImage.addEventListener('load', () => {
    viewerStatus.textContent = '';
});
viewerImage.addEventListener('error', () => {
    viewerImage.hidden = true;
    viewerStatus.textContent = '이미지를 불러오지 못했습니다. 잠시 후 다시 열어 주세요.';
});
viewer.addEventListener('click', event => {
    if (event.target === viewer) viewer.close();
});
viewer.addEventListener('close', () => {
    document.documentElement.classList.remove('image-open');
    document.documentElement.style.removeProperty('--image-scroll');
    window.scrollTo({ top: imageScroll, behavior: 'instant' });
    viewerImage.removeAttribute('src');
    viewerImage.alt = '';
    viewerStatus.textContent = '';
});

function navigateWork(hash) {
    if (location.hash !== hash) history.pushState(null, '', hash);
    renderWork();
}

document.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (link.matches('.gallery a.image')) {
        event.preventDefault();
        openImage(link);
    } else if (link.hasAttribute('data-work') || link.hasAttribute('data-list') || link.hasAttribute('data-news') || link.hasAttribute('data-text')) {
        event.preventDefault();
        navigateWork(link.getAttribute('href'));
    } else if (link.closest('#nav') && link.getAttribute('href') === homePage) {
        event.preventDefault();
        navigateWork(homeHash);
    }
});


works.addEventListener('error', event => {
    const image = event.target;
    if (!(image instanceof HTMLImageElement) || image.hidden) return;
    image.hidden = true;
    const message = document.createElement('span');
    message.className = 'image-error';
    message.textContent = '이미지를 불러오지 못했습니다.';
    image.after(message);
}, true);


window.addEventListener('popstate', renderWork);
window.addEventListener('hashchange', renderWork);
renderWork();
