// 사이드바 너비 설정 (단위: px) — 아래 두 숫자를 수정하세요.
const MIN_WIDTH = 300;
const MAX_WIDTH = 550;
// 오른쪽 영역에 남겨 둘 최소 공간. 좁은 화면에서는 자동으로 줄어듭니다.
const RIGHT_WIDTH = 280;

// 화면의 세 요소: 소개, 조절선, 작업 영역
const wrap = document.querySelector('#wrap');
const sidebar = document.querySelector('#sidebar');
const divider = document.querySelector('#divider');

// CSS의 모바일 기준과 같은 값입니다.
const mobile = window.matchMedia('(max-width: 768px)');
const contact = document.querySelector('.contact');
const footer = document.querySelector('#footer');

function moveContact() {
    // 복제하지 않고 옮기므로 연락처는 기존 HTML 한 곳에서만 수정합니다.
    (mobile.matches ? footer : sidebar).append(contact);
}
mobile.addEventListener('change', moveContact);
moveContact();

let width = mobile.matches ? null : sidebar.getBoundingClientRect().width;
let drag = null;

// 오른쪽 작업 공간을 남겨 두면서 왼쪽이 넓어질 수 있는 한계를 계산합니다.
function getLimits() {
    const space = Math.max(0, wrap.clientWidth - divider.offsetWidth);
    const rightMin = Math.min(RIGHT_WIDTH, space * 0.45);
    const max = Math.max(0, Math.min(MAX_WIDTH, space - rightMin));
    return { min: Math.min(MIN_WIDTH, max), max };
}

function setWidth(value) {
    if (mobile.matches) return;
    const { min, max } = getLimits();
    // 소개 영역이 사라지지 않도록 최소 너비를 유지합니다.
    width = Math.max(min, Math.min(max, value));
    wrap.style.setProperty('--sidebar-width', `${width}px`);
    // separator의 값은 전체 화면 너비에 대한 백분율입니다.
    const total = Math.max(1, wrap.clientWidth);
    divider.setAttribute('aria-valuemin', String(Math.round(min / total * 100)));
    divider.setAttribute('aria-valuemax', String(Math.round(max / total * 100)));
    divider.setAttribute('aria-valuenow', String(Math.round(width / total * 100)));
    divider.setAttribute('aria-valuetext', `소개 너비 ${Math.round(width)}픽셀`);
}


divider.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    event.preventDefault();
    divider.focus();
    drag = { id: event.pointerId, x: event.clientX, width };
    divider.setPointerCapture(event.pointerId);
    wrap.classList.add('dragging');
});

divider.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return;
    setWidth(drag.width + event.clientX - drag.x);
});

function stopDrag(event) {
    if (!drag || event.pointerId !== drag.id) return;
    const id = drag.id;
    drag = null;
    wrap.classList.remove('dragging');
    if (divider.hasPointerCapture(id)) divider.releasePointerCapture(id);
}

divider.addEventListener('pointerup', stopDrag);
divider.addEventListener('pointercancel', stopDrag);
divider.addEventListener('lostpointercapture', stopDrag);

// 마우스 없이도 조절할 수 있습니다.
divider.addEventListener('keydown', event => {
    const { min, max } = getLimits();
    const step = event.shiftKey ? 50 : 20;
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'ArrowLeft') setWidth(width - step);
    if (event.key === 'ArrowRight') setWidth(width + step);
    if (event.key === 'Home') setWidth(min);
    if (event.key === 'End') setWidth(max);
});

// 창 크기가 바뀌어도 작업 영역이 화면 밖으로 밀려나지 않도록 합니다.
window.addEventListener('resize', () => {
    if (drag) stopDrag({ pointerId: drag.id });
    setWidth(width ?? sidebar.getBoundingClientRect().width);
});
setWidth(width ?? sidebar.getBoundingClientRect().width);
