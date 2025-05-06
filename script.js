// script.js (전체 코드 - Lightbox 활성 시 Swiper 키보드 비활성화 로직 추가)

// Wait for the DOM to be fully loaded before running scripts
document.addEventListener('DOMContentLoaded', function () {

    let musicSwiper = null; // Swiper 인스턴스를 저장할 변수

    // --- Initialize Swiper for the music section ---
    const swiperContainer = document.querySelector('.my-music-swiper');
    if (swiperContainer) {
        musicSwiper = new Swiper('.my-music-swiper', { // 변수에 할당
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
            keyboard: { // 키보드 기본 설정은 활성화
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
    } // End of Swiper initialization check


    // --- Initialize Lightbox2 ---
    if (typeof lightbox !== 'undefined') {
        lightbox.option({
          'resizeDuration': 200,
          'fadeDuration': 300,
          'imageFadeDuration': 300,
          'wrapAround': true,
          'showImageNumberLabel': true,
          'disableScrolling': true // Lightbox 열렸을 때 배경 스크롤 막기
        });

        // --- Logic to disable Swiper keyboard when Lightbox is open (NEW) ---
        if (musicSwiper && musicSwiper.keyboard) { // Swiper 인스턴스와 keyboard 모듈 확인
            const body = document.body;
            const lightboxClass = 'lb-disable-scrolling'; // Lightbox가 body에 추가하는 클래스

            // MutationObserver 콜백 함수: body 클래스 변경 감지
            const observerCallback = function(mutationsList, observer) {
                for(let mutation of mutationsList) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                        if (body.classList.contains(lightboxClass)) {
                            // Lightbox가 열림 -> Swiper 키보드 비활성화
                            musicSwiper.keyboard.disable();
                            // console.log('Lightbox opened, Swiper keyboard disabled.'); // 디버깅용
                        } else {
                            // Lightbox가 닫힘 -> Swiper 키보드 활성화
                            musicSwiper.keyboard.enable();
                            // console.log('Lightbox closed, Swiper keyboard enabled.'); // 디버깅용
                        }
                    }
                }
            };

            // MutationObserver 인스턴스 생성
            const observer = new MutationObserver(observerCallback);

            // body 요소의 attribute(클래스 포함) 변경 감시 시작
            observer.observe(body, { attributes: true });

            // 페이지를 떠날 때 observer 연결 해제 (선택 사항, 일반적으로 필요 X)
            // window.addEventListener('unload', () => observer.disconnect());
        }
        // --- End of Swiper keyboard control logic ---

    } // End of Lightbox initialization check


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
    } // End of modal elements check

}); // End of DOMContentLoaded listener