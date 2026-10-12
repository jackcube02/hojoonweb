
const MIN_WIDTH = 300;
const MAX_WIDTH = 550;

const RIGHT_WIDTH = 280;


const wrap = document.querySelector('#wrap');
const sidebar = document.querySelector('#sidebar');
const divider = document.querySelector('#divider');


const mobile = window.matchMedia('(max-width: 768px)');
const contact = document.querySelector('.contact');
const footer = document.querySelector('#footer');

function moveContact() {
    
    (mobile.matches ? footer : sidebar).append(contact);
}
mobile.addEventListener('change', moveContact);
moveContact();

let width = mobile.matches ? null : sidebar.getBoundingClientRect().width;
let drag = null;


function getLimits() {
    const space = Math.max(0, wrap.clientWidth - divider.offsetWidth);
    const rightMin = Math.min(RIGHT_WIDTH, space * 0.45);
    const max = Math.max(0, Math.min(MAX_WIDTH, space - rightMin));
    return { min: Math.min(MIN_WIDTH, max), max };
}

function setWidth(value) {
    if (mobile.matches) return;
    const { min, max } = getLimits();
    
    width = Math.max(min, Math.min(max, value));
    wrap.style.setProperty('--sidebar-width', `${width}px`);
    
    const total = Math.max(1, wrap.clientWidth);
    divider.setAttribute('aria-valuemin', String(Math.round(min / total * 100)));
    divider.setAttribute('aria-valuemax', String(Math.round(max / total * 100)));
    divider.setAttribute('aria-valuenow', String(Math.round(width / total * 100)));
    divider.setAttribute('aria-valuetext', `소개 너비 ${Math.round(width)}픽셀`);
}


divider.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    event.preventDefault();
    divider.focus({ preventScroll: true });
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


window.addEventListener('resize', () => {
    if (drag) stopDrag({ pointerId: drag.id });
    setWidth(width ?? sidebar.getBoundingClientRect().width);
});
setWidth(width ?? sidebar.getBoundingClientRect().width);

function setupToggle(buttonId, panelId, itemSelector) {
    const button = document.getElementById(buttonId);
    const panel = document.getElementById(panelId);
    if (!button || !panel) return;

    function closeMenu(focus = false) {
        button.setAttribute('aria-expanded', 'false');
        if (focus) button.focus({ preventScroll: true });
    }

    button.addEventListener('click', () => {
        const open = button.getAttribute('aria-expanded') === 'true';
        button.setAttribute('aria-expanded', String(!open));
    });

    panel.addEventListener('click', event => {
        const item = event.target.closest(itemSelector);
        if (!item || !panel.contains(item)) return;
        if (mobile.matches) closeMenu(true);
    });

    for (const element of [button, panel]) {
        element.addEventListener('keydown', event => {
            if (event.key === 'Escape' && mobile.matches) {
                closeMenu(true);
            }
        });
    }

    mobile.addEventListener('change', () => closeMenu());
}

setupToggle('menu-toggle', 'nav', 'a');
setupToggle('filter-toggle', 'filter', 'button[data-filter]');
