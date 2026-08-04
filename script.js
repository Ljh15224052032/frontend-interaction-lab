const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function initArchive() {
    const entries = [...document.querySelectorAll('.project-entry')];
    const tabs = [...document.querySelectorAll('.category-tab')];
    const previousButton = document.querySelector('#prevBtn');
    const nextButton = document.querySelector('#nextBtn');
    const currentPageElement = document.querySelector('#currentPage');
    const totalPagesElement = document.querySelector('#totalPages');
    const pagination = document.querySelector('#pagination');
    const emptyState = document.querySelector('#archiveEmpty');
    const archive = document.querySelector('#projectArchive');
    const perPage = 10;
    let category = 'all';
    let page = 1;

    if (!entries.length || !tabs.length) return;

    const getFilteredEntries = () => entries.filter((entry) => (
        category === 'all' || entry.dataset.category === category
    ));

    const revealPageEntries = (visibleEntries) => {
        requestAnimationFrame(() => {
            visibleEntries.forEach((entry, index) => {
                entry.style.transitionDelay = `${Math.min(index * 45, 270)}ms`;
                entry.classList.add('is-revealed');
            });
        });
    };

    const render = ({ returnToArchive = false } = {}) => {
        const matches = getFilteredEntries();
        const totalPages = Math.max(1, Math.ceil(matches.length / perPage));
        page = Math.min(Math.max(page, 1), totalPages);

        entries.forEach((entry) => {
            entry.hidden = true;
            entry.classList.remove('is-revealed');
            entry.style.removeProperty('transition-delay');
        });

        const visibleEntries = matches.slice((page - 1) * perPage, page * perPage);
        visibleEntries.forEach((entry) => {
            entry.hidden = false;
        });
        revealPageEntries(visibleEntries);

        currentPageElement.textContent = String(page).padStart(2, '0');
        totalPagesElement.textContent = String(totalPages).padStart(2, '0');
        previousButton.disabled = page <= 1;
        nextButton.disabled = page >= totalPages;
        emptyState.hidden = matches.length !== 0;
        pagination.hidden = matches.length === 0;

        if (returnToArchive) {
            archive.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
        }
    };

    tabs.forEach((tab) => {
        const tabCategory = tab.dataset.category;
        const count = tabCategory === 'all'
            ? entries.length
            : entries.filter((entry) => entry.dataset.category === tabCategory).length;
        tab.querySelector('.count').textContent = count;

        tab.addEventListener('click', () => {
            category = tabCategory;
            page = 1;
            tabs.forEach((item) => {
                const active = item === tab;
                item.classList.toggle('active', active);
                item.setAttribute('aria-pressed', String(active));
            });
            render();
        });
    });

    previousButton.addEventListener('click', () => {
        if (page <= 1) return;
        page -= 1;
        render({ returnToArchive: true });
    });

    nextButton.addEventListener('click', () => {
        const totalPages = Math.max(1, Math.ceil(getFilteredEntries().length / perPage));
        if (page >= totalPages) return;
        page += 1;
        render({ returnToArchive: true });
    });

    const completed = entries.filter((entry) => entry.dataset.status === 'done').length;
    document.querySelector('#completedProjects').textContent = completed;
    document.querySelector('#completionRate').textContent = `${Math.round((completed / 86) * 100)}%`;
    document.querySelector('#footerRecorded').textContent = entries.length;

    render();
}

function initStarfield() {
    const canvas = document.querySelector('#starfield');
    const context = canvas?.getContext?.('2d');
    if (!context) return;

    let stars = [];
    let animationFrame = 0;
    let resizeFrame = 0;
    let running = !document.hidden && !reducedMotion.matches;
    let pointerX = 0;
    let pointerY = 0;
    let driftX = 0;
    let driftY = 0;

    const createStars = () => {
        const area = window.innerWidth * window.innerHeight;
        const count = Math.min(190, Math.max(72, Math.floor(area / 7200)));
        stars = Array.from({ length: count }, () => ({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            radius: Math.random() * 1.15 + 0.18,
            alpha: Math.random() * 0.62 + 0.18,
            depth: Math.random() * 0.78 + 0.22,
            speed: Math.random() * 0.055 + 0.012
        }));
    };

    const resize = () => {
        const ratio = Math.min(window.devicePixelRatio || 1, 1.75);
        canvas.width = Math.floor(window.innerWidth * ratio);
        canvas.height = Math.floor(window.innerHeight * ratio);
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        createStars();
    };

    const draw = () => {
        context.clearRect(0, 0, window.innerWidth, window.innerHeight);
        driftX += (pointerX - driftX) * 0.018;
        driftY += (pointerY - driftY) * 0.018;

        for (const star of stars) {
            if (running) star.y += star.speed * star.depth;
            if (star.y > window.innerHeight + 2) star.y = -2;
            const x = star.x + driftX * star.depth;
            const y = star.y + driftY * star.depth;

            context.globalAlpha = star.alpha;
            context.fillStyle = star.depth > 0.78 ? '#c7f1ff' : '#dfeaf1';
            context.beginPath();
            context.arc(x, y, star.radius * star.depth, 0, Math.PI * 2);
            context.fill();
        }
        context.globalAlpha = 1;
        if (running) animationFrame = requestAnimationFrame(draw);
    };

    const restart = () => {
        cancelAnimationFrame(animationFrame);
        running = !document.hidden && !reducedMotion.matches;
        draw();
    };

    window.addEventListener('pointermove', (event) => {
        pointerX = (event.clientX / window.innerWidth - 0.5) * -14;
        pointerY = (event.clientY / window.innerHeight - 0.5) * -10;
    }, { passive: true });

    window.addEventListener('resize', () => {
        cancelAnimationFrame(resizeFrame);
        resizeFrame = requestAnimationFrame(() => {
            resize();
            if (!running) draw();
        });
    }, { passive: true });

    document.addEventListener('visibilitychange', restart);
    if (typeof reducedMotion.addEventListener === 'function') {
        reducedMotion.addEventListener('change', restart);
    }

    resize();
    draw();
}

function initScrollScene() {
    const progress = document.querySelector('#readingProgress');
    const planet = document.querySelector('#heroPlanet');
    const heroCopy = document.querySelector('#heroCopy');
    const orbitOne = document.querySelector('.orbit-one');
    const orbitTwo = document.querySelector('.orbit-two');
    let ticking = false;

    if (!progress || !planet || !heroCopy) return;

    const update = () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollRange = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        const readingProgress = Math.min(1, Math.max(0, scrollTop / scrollRange));
        const heroProgress = Math.min(1, Math.max(0, scrollTop / Math.max(window.innerHeight, 1)));

        progress.style.transform = `scaleX(${readingProgress})`;
        if (!reducedMotion.matches) {
            planet.style.transform = `translate3d(0, ${heroProgress * 92}px, 0) scale(${1 + heroProgress * 0.035})`;
            heroCopy.style.transform = `translate3d(0, ${heroProgress * 38}px, 0)`;
            orbitOne.style.transform = `rotate(${-18 + heroProgress * 18}deg)`;
            orbitTwo.style.transform = `rotate(${23 - heroProgress * 24}deg)`;
        }
        ticking = false;
    };

    const requestUpdate = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(update);
    };

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate, { passive: true });
    update();
}

function initReveals() {
    const elements = [...document.querySelectorAll('.project-entry, .reveal-block')];
    const reveal = (element) => element.classList.add('is-revealed');

    if (!('IntersectionObserver' in window) || reducedMotion.matches) {
        elements.forEach(reveal);
        return;
    }

    const observer = new IntersectionObserver((records) => {
        records.forEach((record) => {
            if (!record.isIntersecting) return;
            reveal(record.target);
            observer.unobserve(record.target);
        });
    }, { rootMargin: '0px 0px -7%', threshold: 0.08 });

    elements.forEach((element) => observer.observe(element));
}

function initCursor() {
    const coarsePointer = window.matchMedia('(pointer: coarse)');
    const cursor = document.querySelector('#cursor');
    if (!cursor || coarsePointer.matches || reducedMotion.matches) return;

    document.documentElement.classList.add('has-custom-cursor');
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;

    const render = () => {
        currentX += (targetX - currentX) * 0.2;
        currentY += (targetY - currentY) * 0.2;
        cursor.style.transform = `translate3d(${currentX - cursor.offsetWidth / 2}px, ${currentY - cursor.offsetHeight / 2}px, 0)`;
        requestAnimationFrame(render);
    };

    window.addEventListener('pointermove', (event) => {
        targetX = event.clientX;
        targetY = event.clientY;
        cursor.classList.add('is-visible');
    }, { passive: true });

    document.addEventListener('pointerover', (event) => {
        if (event.target.closest('.cursor-target')) cursor.classList.add('is-active');
    });

    document.addEventListener('pointerout', (event) => {
        const target = event.target.closest('.cursor-target');
        if (!target || target.contains(event.relatedTarget)) return;
        cursor.classList.remove('is-active');
    });

    document.addEventListener('pointerleave', () => cursor.classList.remove('is-visible'));
    document.addEventListener('pointerenter', () => cursor.classList.add('is-visible'));
    render();
}

function initPage() {
    const year = document.querySelector('#currentYear');
    if (year) year.textContent = new Date().getFullYear();

    initArchive();
    initStarfield();
    initScrollScene();
    initReveals();
    initCursor();

    if (window.gsap && !reducedMotion.matches) {
        window.gsap.from('.hero-copy > *', {
            y: 28,
            opacity: 0,
            duration: 0.9,
            stagger: 0.09,
            ease: 'power3.out',
            clearProps: 'transform,opacity'
        });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPage, { once: true });
} else {
    initPage();
}
