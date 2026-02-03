function initCouponsPage() {
  if (!document.body.classList.contains('coupons-page')) return;

  const deck = document.querySelector('[data-coupon-deck]');
  const nextButton = document.querySelector('[data-coupon-next]');
  const feedback = document.querySelector('[data-coupon-feedback]');
  if (!deck || !nextButton) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cards = Array.from(deck.querySelectorAll('.coupon-card'));

  // Backend endpoint that relays notifications to SendGrid.
  const NOTIFY_ENDPOINT = '/api/send-notification';

  const order = cards.map((_, index) => index);
  let isAnimating = false;

  const stackStates = [
    { x: 0, y: 0, scale: 1, rotate: 0, opacity: 1, zIndex: 60, pointerEvents: 'auto' },
    { x: 0, y: 14, scale: 0.96, rotate: -1.2, opacity: 0.8, zIndex: 40, pointerEvents: 'none' },
    { x: 0, y: 28, scale: 0.92, rotate: 1.2, opacity: 0.66, zIndex: 30, pointerEvents: 'none' },
  ];

  function setFeedback(text) {
    if (!feedback) return;
    feedback.textContent = text;
  }

  async function sendRedeemEmail(couponTitle) {
    const timestamp = new Date().toLocaleString();
    const activeWish = cards[order[0]]?.querySelector('.coupon-wish')?.value?.trim() || 'No custom wish entered.';

    const payload = {
      coupon_title: couponTitle,
      event: `Coupon redeemed: ${couponTitle}`,
      // For blank coupon, this captures the custom wish typed by the user.
      message: activeWish,
      timestamp,
    };

    try {
      const response = await fetch(NOTIFY_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.success) {
        console.error('[Coupons] Notification failed:', result);
        setFeedback(`Redeemed: ${couponTitle} • Email failed, check server logs`);
        return;
      }

      const messageIdText = result.messageId ? ` • id: ${result.messageId}` : '';
      setFeedback(`Redeemed: ${couponTitle} • Email sent at ${timestamp}${messageIdText}`);
    } catch (error) {
      console.error('[Coupons] Notification request failed:', error);
      setFeedback(`Redeemed: ${couponTitle} • Notification request failed`);
    }
  }

  function applyStack(animate = true) {
    order.forEach((cardIndex, depth) => {
      const card = cards[cardIndex];
      const state = stackStates[depth] || stackStates[stackStates.length - 1];
      card.classList.toggle('coupon-card--active', depth === 0);

      if (window.gsap && animate && !prefersReducedMotion) {
        // Tweak these durations for faster/slower deck movement.
        gsap.to(card, {
          x: state.x,
          y: state.y,
          scale: state.scale,
          rotation: state.rotate,
          opacity: state.opacity,
          duration: 0.42,
          ease: 'power2.out',
          overwrite: 'auto',
          onStart: () => {
            card.style.zIndex = String(state.zIndex);
            card.style.pointerEvents = state.pointerEvents;
          },
        });
      } else {
        card.style.transform = `translate3d(${state.x}px, ${state.y}px, 0) scale(${state.scale}) rotate(${state.rotate}deg)`;
        card.style.opacity = String(state.opacity);
        card.style.zIndex = String(state.zIndex);
        card.style.pointerEvents = state.pointerEvents;
      }
    });
  }

  function rotateDeck() {
    if (isAnimating) return;
    isAnimating = true;

    const frontCard = cards[order[0]];

    if (window.gsap && !prefersReducedMotion) {
      gsap.to(frontCard, {
        x: 120,
        y: 16,
        rotation: 6,
        scale: 0.94,
        opacity: 0,
        duration: 0.35,
        ease: 'power1.inOut',
        onComplete: () => {
          order.push(order.shift());
          gsap.set(frontCard, { x: 0, y: 34, rotation: -2, scale: 0.9, opacity: 0.82 });
          applyStack(true);
          setTimeout(() => {
            isAnimating = false;
          }, 240);
        },
      });
      return;
    }

    order.push(order.shift());
    applyStack(false);
    setTimeout(() => {
      isAnimating = false;
    }, 80);
  }

  function attachSwipe(card) {
    let pointerStartX = 0;
    let pointerStartY = 0;

    card.addEventListener('pointerdown', (event) => {
      pointerStartX = event.clientX;
      pointerStartY = event.clientY;
    });

    card.addEventListener('pointerup', (event) => {
      const deltaX = event.clientX - pointerStartX;
      const deltaY = event.clientY - pointerStartY;
      if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY)) {
        rotateDeck();
      }
    });
  }

  cards.forEach((card) => {
    const button = card.querySelector('.coupon-redeem');
    const title = card.dataset.couponTitle || card.querySelector('.coupon-title')?.textContent?.trim() || 'Coupon';

    if (button) {
      button.addEventListener('click', async () => {
        await sendRedeemEmail(title);
      });
    }

    attachSwipe(card);
  });

  nextButton.addEventListener('click', rotateDeck);

  applyStack(false);

  if (window.gsap && !prefersReducedMotion) {
    const intro = gsap.timeline({ defaults: { ease: 'power2.out' } });
    intro.from('.coupons-head > *', { y: 18, autoAlpha: 0, stagger: 0.08, duration: 0.62 });
    intro.from('.coupon-deck', { y: 18, autoAlpha: 0, duration: 0.62 }, '-=0.3');
    intro.from('.coupon-controls', { y: 12, autoAlpha: 0, duration: 0.55 }, '-=0.34');
  }
}

window.addEventListener('DOMContentLoaded', initCouponsPage);
