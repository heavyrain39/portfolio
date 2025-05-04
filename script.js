// Wait for the DOM to be fully loaded before running scripts
document.addEventListener('DOMContentLoaded', function () {

    // --- Initialize Swiper for the music section ---
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
            // You might want to keep it at 2 or adjust based on your design
            1024: {
                 slidesPerView: 2, // Still show 2 slides
                 spaceBetween: 40
            }
            // Add more breakpoints if needed (e.g., 1200px)
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

        // Accessibility features (Swiper handles many automatically)
        a11y: {
            prevSlideMessage: 'Previous slide',
            nextSlideMessage: 'Next slide',
        },

        // IMPORTANT: Pause YouTube videos when sliding away
        on: {
            slideChangeTransitionStart: function () {
                // Find all iframes within the currently active Swiper instance
                const iframes = this.el.querySelectorAll('iframe');
                iframes.forEach(iframe => {
                    // Stop the video by telling the YouTube player API to pause
                    // This requires the ?enablejsapi=1 parameter in the iframe src,
                    // but a simpler method is to reset the src, which usually works.
                    try {
                         iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
                    } catch (e) {
                        // Fallback if postMessage fails (e.g., cross-origin issues without proper setup)
                        // Resetting src is less ideal but often works
                        // const currentSrc = iframe.src;
                        // iframe.src = currentSrc;
                        console.log("Could not pause video via postMessage, consider adding enablejsapi=1 to iframe src");
                    }
                });
            },
        }

    }); // End of new Swiper initialization

    // --- Initialize Lightbox2 (Optional: Add options if needed) ---
    // Lightbox2 automatically finds links with data-lightbox attribute,
    // so explicit initialization is often not required unless changing defaults.
    lightbox.option({
      'resizeDuration': 200, // Speed of resizing animation
      'fadeDuration': 300,   // Speed of fade-in/out
      'imageFadeDuration': 300, // Speed of image fade when loading
      'wrapAround': true,      // Allow navigation from last image back to first
      'showImageNumberLabel': true // Show "Image x of y" text
      // Add other options here if desired, see Lightbox2 documentation
    });

}); // End of DOMContentLoaded listener