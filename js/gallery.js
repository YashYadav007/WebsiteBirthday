function initGalleryIntro() {
  if (!document.body.classList.contains('gallery-page')) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion || !window.gsap) return;

  // Tweak duration/stagger below to control collage entrance speed.
  const timeline = gsap.timeline({ defaults: { ease: 'power2.out' } });

  timeline.from('.gallery-title', { y: 24, autoAlpha: 0, duration: 0.72 });
  timeline.from('.gallery-subtitle', { y: 18, autoAlpha: 0, duration: 0.64 }, '-=0.44');
  timeline.from(
    '.gallery-card',
    {
      y: 28,
      autoAlpha: 0,
      scale: 0.97,
      duration: 0.72,
      stagger: 0.08,
    },
    '-=0.28',
  );
  timeline.from('.gallery-actions', { y: 14, autoAlpha: 0, duration: 0.55 }, '-=0.38');
}

function initGalleryImageFallbacks() {
  if (!document.body.classList.contains('gallery-page')) return;

  const mediaNodes = document.querySelectorAll('.gallery-media');
  mediaNodes.forEach((media) => {
    const img = media.querySelector('img');
    if (!img) return;

    const showFallback = () => media.classList.add('gallery-media--empty');
    const hideFallback = () => media.classList.remove('gallery-media--empty');

    img.addEventListener('error', showFallback, { once: true });
    img.addEventListener('load', hideFallback, { once: true });

    if (img.complete && img.naturalWidth === 0) showFallback();
  });
}

window.addEventListener('DOMContentLoaded', () => {
  initGalleryImageFallbacks();
  initGalleryIntro();
});
