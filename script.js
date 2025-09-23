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
    

    // --- Theme Selector Logic (NEW) ---
    const themeButtons = document.querySelectorAll('.theme-btn');
    
    function setActiveTheme(themeName) {
        // body의 data-theme 속성을 변경합니다.
        document.body.setAttribute('data-theme', themeName);

        // 모든 버튼에서 'active' 클래스를 제거하고, 선택된 버튼에만 추가합니다.
        themeButtons.forEach(btn => {
            if (btn.dataset.theme === themeName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // 사용자의 테마 선택을 localStorage에 저장합니다.
        localStorage.setItem('yakshawan-portfolio-theme', themeName);
    }

    // 각 테마 버튼에 클릭 이벤트를 추가합니다.
    themeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const selectedTheme = button.dataset.theme;
            setActiveTheme(selectedTheme);
        });
    });

    // 페이지 로드 시, localStorage에 저장된 테마가 있는지 확인하고 적용합니다.
    const savedTheme = localStorage.getItem('yakshawan-portfolio-theme') || 'aetherial-light'; // 저장된 테마가 없으면 라이트 테마를 기본으로 사용
    setActiveTheme(savedTheme);

});