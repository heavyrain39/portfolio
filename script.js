// script.js (전체 코드 - 테마 셀렉터 기능 추가)

document.addEventListener('DOMContentLoaded', function () {

    let musicSwiper = null; // Swiper 인스턴스를 저장할 변수

    // --- Initialize Swiper for the music section ---
    const swiperContainer = document.querySelector('.my-music-swiper');
    if (swiperContainer) {
        musicSwiper = new Swiper('.my-music-swiper', {
            loop: true,
            slidesPerView: 1,
            spaceBetween: 20,
            breakpoints: {
                768: { slidesPerView: 2, spaceBetween: 30 },
                1024: { slidesPerView: 2, spaceBetween: 40 }
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            keyboard: {
                enabled: true,
                onlyInViewport: false,
            },
            a11y: {
                prevSlideMessage: 'Previous slide',
                nextSlideMessage: 'Next slide',
            },
            on: {
                slideChangeTransitionStart: function () {
                    const iframes = this.el.querySelectorAll('iframe');
                    iframes.forEach(iframe => {
                        if (iframe.src.includes('youtube.com') && iframe.contentWindow) {
                             try {
                                 iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
                             } catch (e) {
                                 console.warn("Could not pause YouTube video via postMessage.", e);
                             }
                        }
                    });
                },
            }
        });
    }


    // --- Initialize Lightbox2 ---
    if (typeof lightbox !== 'undefined') {
        lightbox.option({
          'resizeDuration': 200,
          'fadeDuration': 300,
          'imageFadeDuration': 300,
          'wrapAround': true,
          'showImageNumberLabel': true,
          'disableScrolling': true
        });

        if (musicSwiper && musicSwiper.keyboard) {
            const body = document.body;
            const lightboxClass = 'lb-disable-scrolling';

            const observerCallback = function(mutationsList, observer) {
                for(let mutation of mutationsList) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                        if (body.classList.contains(lightboxClass)) {
                            musicSwiper.keyboard.disable();
                        } else {
                            musicSwiper.keyboard.enable();
                        }
                    }
                }
            };
            const observer = new MutationObserver(observerCallback);
            observer.observe(body, { attributes: true });
        }
    }


    // --- Vibe Coding Modal Logic ---
    const helpButton = document.getElementById('vibe-coding-help');
    const modalOverlay = document.getElementById('vibe-coding-modal');
    const modalContent = modalOverlay?.querySelector('.modal-content');
    const closeButton = modalOverlay?.querySelector('.modal-close');

    if (helpButton && modalOverlay && modalContent && closeButton) {
        function showModal() {
            modalOverlay.style.display = 'flex';
            setTimeout(() => {
                modalOverlay.classList.add('visible');
            }, 10);
             closeButton.focus();
        }
        function hideModal() {
            modalOverlay.classList.remove('visible');
            modalOverlay.addEventListener('transitionend', () => {
                 modalOverlay.style.display = 'none';
            }, { once: true });
        }
        helpButton.addEventListener('click', showModal);
        closeButton.addEventListener('click', hideModal);
        modalOverlay.addEventListener('click', function(event) {
            if (event.target === modalOverlay) {
                hideModal();
            }
        });
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && modalOverlay.style.display === 'flex') {
                hideModal();
            }
        });
    } else {
        console.warn('Modal elements not found, skipping modal initialization.');
    }


    // --- Dynamically update footer year ---
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    } else {
        console.warn('Footer year span (#current-year) not found.');
    }
    

    // --- Theme Selector Logic ---
    const themeButtons = document.querySelectorAll('.theme-btn');
    
    function setActiveTheme(themeName) {
        document.body.setAttribute('data-theme', themeName);
        themeButtons.forEach(btn => {
            if (btn.dataset.theme === themeName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        localStorage.setItem('yakshawan-portfolio-theme', themeName);
    }

    themeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const selectedTheme = button.dataset.theme;
            setActiveTheme(selectedTheme);
        });
    });

    const savedTheme = localStorage.getItem('yakshawan-portfolio-theme') || 'aetherial-light';
    setActiveTheme(savedTheme);


// ==========================================================================
// --- Hero Section Interactive Background ---
// ==========================================================================
const heroSection = document.getElementById('hero');
const canvas = document.getElementById('hero-canvas');

if (!heroSection || !canvas) {
    console.warn('Hero section or canvas not found, skipping background animation.');
} else {
    const context = canvas.getContext('2d');

    const parameters = {
        size: 35,
        radius: 1.2,
        proximity: 130,
        growth: 45,
        ease: 0.08,
    };

    let circles = [];
    let imageLoaded = false;
    const image = new Image();
    
    // 애니메이션 상태 관리를 위한 변수 추가
    let animationFrameId = null; 

    class Point {
        constructor(x, y) { this.x = x; this.y = y; }
    }

    class Circle {
        constructor(radius, x, y) {
            this._radius = radius;
            this.radius = radius;
            this.growthValue = 0;
            this.position = new Point(x, y);
        }

        draw(context, ease) {
            this.radius += ((this._radius + this.growthValue) - this.radius) * ease;
            context.moveTo(this.position.x, this.position.y);
            context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
        }

        addRadius(value) { this.growthValue = value; }
    }
    
    function buildGrid() {
        circles = [];
        const { size, radius } = parameters;
        const columns = Math.ceil(canvas.width / size) + 1;
        const rows = Math.ceil(canvas.height / size) + 1;
        const amount = Math.ceil(columns * rows);

        for (let i = 0; i < amount; i++) {
            const column = i % columns;
            const row = ~~(i / columns);
            circles.push(new Circle(radius, size * column, size * row));
        }
    }

    function mouseMoveHandler(event) {
        const { proximity, growth } = parameters;
        const rect = heroSection.getBoundingClientRect();
        const mouseX = event.clientX;
        const mouseY = event.clientY;

        const isMouseInHero = (
            mouseX >= rect.left &&
            mouseX <= rect.right &&
            mouseY >= rect.top &&
            mouseY <= rect.bottom
        );

        if (isMouseInHero) {
            for (let c of circles) {
                const distance = Math.sqrt(Math.pow(c.position.x - mouseX, 2) + Math.pow(c.position.y - mouseY, 2));
                let d = ((proximity - distance) / proximity) * growth;
                if (d < 0) d = 0;
                c.addRadius(d);
            }
        } else {
            for (let c of circles) {
                c.addRadius(0);
            }
        }
    }
    
    function drawImage() {
        context.clip();
        const { naturalWidth, naturalHeight } = image;
        const ratio = Math.max(canvas.width / naturalWidth, canvas.height / naturalHeight);
        const w = naturalWidth * ratio;
        const h = naturalHeight * ratio;
        const x = canvas.width / 2 - w / 2;
        const y = canvas.height / 2 - h / 2;
        context.drawImage(image, 0, 0, naturalWidth, naturalHeight, x, y, w, h);
    }

    function drawGridLines(context, themeColors) {
        context.beginPath();
        context.strokeStyle = themeColors.gridColor;
        context.lineWidth = 0.1;
        const { size } = parameters;
        const columns = Math.ceil(canvas.width / size);
        const rows = Math.ceil(canvas.height / size);

        for(let i = 0; i <= columns; i++) {
            context.moveTo(i * size, 0);
            context.lineTo(i * size, canvas.height);
        }
        for(let j = 0; j <= rows; j++) {
            context.moveTo(0, j * size);
            context.lineTo(canvas.width, j * size);
        }
        context.stroke();
    }

    function animate() {
        const computedStyle = getComputedStyle(document.body);
        const themeColors = {
            pointColor: computedStyle.getPropertyValue('--secondary-text').trim(),
            gridColor: computedStyle.getPropertyValue('--border-color').trim(),
        };

        context.clearRect(0, 0, canvas.width, canvas.height);
        
        const rect = heroSection.getBoundingClientRect();
        
        context.save();
        context.beginPath();
        context.rect(rect.left, rect.top, rect.width, rect.height);
        context.clip();

        drawGridLines(context, themeColors);
        
        context.save();
        context.beginPath();
        for (let circle of circles) {
            circle.draw(context, parameters.ease);
        }
        
        if (imageLoaded) {
            drawImage();
        } else {
            context.fillStyle = themeColors.pointColor;
            context.fill();
        }
        context.restore();
        context.restore();

        // 다음 프레임을 요청하고 ID를 저장
        animationFrameId = requestAnimationFrame(animate);
    }
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        buildGrid();
    }

    // 애니메이션을 시작하고 멈추는 헬퍼 함수
    function startAnimation() {
        if (!animationFrameId) {
            animationFrameId = requestAnimationFrame(animate);
        }
    }

    function stopAnimation() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    }
    
    // Intersection Observer 설정
    const observerOptions = {
        root: null, // viewport 기준
        rootMargin: '0px',
        threshold: 0.0 // 1px라도 보이면 isIntersecting은 true
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                startAnimation(); // 화면에 보이면 애니메이션 시작
            } else {
                stopAnimation(); // 화면에서 사라지면 애니메이션 정지
            }
        });
    }, observerOptions);

    // --- 초기화 로직 ---
    image.onload = () => { imageLoaded = true; };
    image.src = "images/hero_background.webp";

    resizeCanvas();
    observer.observe(heroSection); // heroSection 관찰 시작

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', mouseMoveHandler);
    window.addEventListener('touchmove', (e) => mouseMoveHandler(e.touches[0]), { passive: true });
}


    // ==========================================================================
    // --- Hero Section Height Adjustment ---
    // ==========================================================================
    function adjustHeroHeight() {
        const header = document.getElementById('main-header');
        const hero = document.getElementById('hero');
        
        if (header && hero) {
            const headerHeight = header.offsetHeight;
            hero.style.minHeight = `calc(100vh - ${headerHeight}px)`;
        }
    }

    adjustHeroHeight();
    window.addEventListener('resize', adjustHeroHeight);

});