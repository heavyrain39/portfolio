// Wait for the DOM to be fully loaded before running scripts
document.addEventListener('DOMContentLoaded', function () {

    // --- Initialize Swiper for the music section ---
    // Check if the Swiper container exists before initializing
    const swiperContainer = document.querySelector('.my-music-swiper');
    if (swiperContainer) {
        const musicSwiper = new Swiper('.my-music-swiper', {
            // Configuration options for the slider
            loop: true, // Enable infinite looping (first/last slides connect)
            slidesPerView: 1, // Show 1 slide at a time on small screens
            spaceBetween: 20, // Space between slides (in pixels)

            // Responsive settings: change slidesPerView based on screen width
            breakpoints: {
                // when window width is >= 768px (tablets)
                768: {
                    slidesPerView: 2, // Show 2 slides
                    spaceBetween: 30
                },
                // when window width is >= 1024px (desktops)
                1024: {
                    slidesPerView: 2, // Still show 2 slides (adjust if you want more)
                    spaceBetween: 40
                }
            },

            // Navigation arrows
            navigation: {
                nextEl: '.swiper-button-next', // Selector for the next button
                prevEl: '.swiper-button-prev', // Selector for the previous button
            },

            // Enable keyboard navigation (using arrow keys)
            keyboard: {
                enabled: true,
                onlyInViewport: false, // Allow keyboard control even when swiper isn't focused
            },

            // Accessibility features
            a11y: {
                prevSlideMessage: 'Previous slide',
                nextSlideMessage: 'Next slide',
            },

            // Pause YouTube videos when sliding away
            on: {
                slideChangeTransitionStart: function () {
                    // Find all iframes within the currently active Swiper instance
                    const iframes = this.el.querySelectorAll('iframe');
                    iframes.forEach(iframe => {
                        // Use postMessage for YouTube API control (requires ?enablejsapi=1)
                        if (iframe.src.includes('youtube.com') && iframe.contentWindow) {
                             try {
                                 iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
                             } catch (e) {
                                 console.warn("Could not pause YouTube video via postMessage. Ensure enablejsapi=1 is in the iframe src.", e);
                                 // Fallback: Resetting src (less ideal, might cause reload flicker)
                                 // const currentSrc = iframe.src;
                                 // iframe.src = currentSrc;
                             }
                        }
                    });
                },
            }
        }); // End of new Swiper initialization
    } // End of Swiper initialization check


    // --- Initialize Lightbox2 ---
    // Check if Lightbox elements exist before initializing options
    if (typeof lightbox !== 'undefined') {
        lightbox.option({
          'resizeDuration': 200, // Speed of resizing animation
          'fadeDuration': 300,   // Speed of fade-in/out
          'imageFadeDuration': 300, // Speed of image fade when loading
          'wrapAround': true,      // Allow navigation from last image back to first
          'showImageNumberLabel': true, // Show "Image x of y" text
          'disableScrolling': true // Prevent background scrolling when Lightbox is open
          // Add other options here if desired, see Lightbox2 documentation
        });
    } // End of Lightbox initialization check


    // --- Vibe Coding Modal Logic (NEW) ---
    const helpButton = document.getElementById('vibe-coding-help');
    const modalOverlay = document.getElementById('vibe-coding-modal');
    const modalContent = modalOverlay?.querySelector('.modal-content'); // Optional chaining
    const closeButton = modalOverlay?.querySelector('.modal-close');    // Optional chaining

    // Check if all modal elements exist
    if (helpButton && modalOverlay && modalContent && closeButton) {

        // Function to show the modal
        function showModal() {
            modalOverlay.style.display = 'flex';
            // Add class for transition after display is set
            setTimeout(() => {
                modalOverlay.classList.add('visible');
            }, 10); // Small delay to ensure display:flex is applied first
             // Focus the close button for accessibility
             closeButton.focus();
        }

        // Function to hide the modal
        function hideModal() {
            modalOverlay.classList.remove('visible');
            // Wait for transition to finish before setting display:none
            modalOverlay.addEventListener('transitionend', () => {
                 modalOverlay.style.display = 'none';
            }, { once: true }); // Remove listener after it runs once
        }

        // Event listener for the help button
        helpButton.addEventListener('click', showModal);

        // Event listener for the close button
        closeButton.addEventListener('click', hideModal);

        // Event listener for the overlay (background) click
        modalOverlay.addEventListener('click', function(event) {
            // Only hide if the click is directly on the overlay, not the content inside
            if (event.target === modalOverlay) {
                hideModal();
            }
        });

        // Optional: Close modal with the Escape key
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && modalOverlay.style.display === 'flex') {
                hideModal();
            }
        });

    } else {
        console.warn('Modal elements not found, skipping modal initialization.');
    } // End of modal elements check

}); // End of DOMContentLoaded listener