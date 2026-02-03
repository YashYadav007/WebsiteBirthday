function initStoryScrollAnimations() {
  if (!document.body.classList.contains('story-page')) return;
  if (!window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cards = gsap.utils.toArray('.story-moment .moment-card');
  const finalCard = document.querySelector('.story-final__card');

  // Animation tuning: increase/decrease this scrub value for slower/faster section progress.
  const scrubStrength = 0.75;

  if (prefersReducedMotion) {
    gsap.set([...cards, finalCard].filter(Boolean), { clearProps: 'all', opacity: 1, y: 0, scale: 1 });
    return;
  }

  if (window.__lenis) {
    window.__lenis.on('scroll', ScrollTrigger.update);
  }

  cards.forEach((card) => {
    const textParts = card.querySelectorAll('.moment-card__label, .moment-card__title, .moment-card__body, .moment-photo');

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: card.closest('.story-panel'),
        start: 'top 88%',
        end: 'bottom 12%',
        scrub: scrubStrength,
      },
    });

    timeline.fromTo(
      card,
      { scale: 0.74, autoAlpha: 0.08, yPercent: 12 },
      { scale: 1.32, autoAlpha: 1, yPercent: 0, ease: 'none' },
      0,
    );

    timeline.fromTo(
      textParts,
      { y: 16, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, stagger: 0.06, ease: 'none' },
      0.08,
    );

    timeline.to(
      card,
      { scale: 0.74, autoAlpha: 0.4, yPercent: -12, ease: 'none' },
      0.62,
    );
  });

  if (finalCard) {
    gsap.fromTo(
      finalCard,
      { scale: 0.94, y: 18 },
      {
        scale: 1,
        y: 0,
        duration: 1.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: finalCard.closest('.story-panel'),
          start: 'top 72%',
          toggleActions: 'play none none none',
          once: true,
        },
      },
    );

    gsap.fromTo(
      finalCard.querySelectorAll('.story-final__lead, .story-final__sub, .together-timer'),
      { y: 16, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        duration: 1,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: finalCard.closest('.story-panel'),
          start: 'top 72%',
          toggleActions: 'play none none none',
          once: true,
        },
      },
    );
  }

  gsap.to('.story-hero__inner', {
    scale: 0.985,
    autoAlpha: 0.32,
    ease: 'none',
    scrollTrigger: {
      trigger: '.story-hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 0.7,
    },
  });

  ScrollTrigger.refresh();
}

function initTogetherTimer() {
  const timerNode = document.querySelector('[data-together-timer]');
  if (!timerNode) return;

  // Change this start date/time if needed.
  const startDate = new Date('2025-10-25T21:10:00+05:30');

  const renderTime = () => {
    const now = new Date();
    const elapsedMs = Math.max(0, now.getTime() - startDate.getTime());
    const totalSeconds = Math.floor(elapsedMs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    timerNode.textContent = `${days} days ${String(hours).padStart(2, '0')} hours ${String(minutes).padStart(2, '0')} minutes ${String(seconds).padStart(2, '0')} seconds`;
  };

  renderTime();
  window.setInterval(renderTime, 1000);
}

window.addEventListener('DOMContentLoaded', () => {
  initStoryScrollAnimations();
  initTogetherTimer();
});
