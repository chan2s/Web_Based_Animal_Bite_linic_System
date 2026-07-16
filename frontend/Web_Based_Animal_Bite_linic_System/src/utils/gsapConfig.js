import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const EASE = {
  power1: 'power1.out',
  power2: 'power2.out',
  power3: 'power3.out',
  power4: 'power4.out',
  expo: 'expo.out',
  elastic: 'elastic.out(1, 0.5)',
  bounce: 'bounce.out',
};

export const DURATION = {
  fast: 0.4,
  normal: 0.6,
  slow: 0.8,
  xslow: 1.2,
  cinematic: 1.8,
};

export const STAGGER = {
  fast: 0.05,
  normal: 0.08,
  slow: 0.12,
  cards: 0.15,
};

// ScrollTrigger defaults
ScrollTrigger.defaults({
  toggleActions: 'play none none reverse',
});

// Helper: create a fade-up animation
export function fadeUp(element, options = {}) {
  return gsap.fromTo(
    element,
    { y: options.y || 60, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: options.duration || DURATION.normal,
      ease: options.ease || EASE.power3,
      scrollTrigger: {
        trigger: element,
        start: options.start || 'top 85%',
        end: options.end || 'top 40%',
        toggleActions: 'play none none reverse',
        ...(options.scrollTrigger || {}),
      },
      ...options.tweens,
    }
  );
}

// Helper: create a scale-in animation
export function scaleIn(element, options = {}) {
  return gsap.fromTo(
    element,
    { scale: options.scale || 0.85, opacity: 0 },
    {
      scale: 1,
      opacity: 1,
      duration: options.duration || DURATION.slow,
      ease: options.ease || EASE.power3,
      scrollTrigger: {
        trigger: element,
        start: 'top 85%',
        ...(options.scrollTrigger || {}),
      },
    }
  );
}

// Helper: stagger children animation
export function staggerChildren(container, options = {}) {
  return gsap.fromTo(
    container.children,
    { y: 40, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: options.duration || DURATION.normal,
      stagger: options.stagger || STAGGER.normal,
      ease: options.ease || EASE.power3,
      scrollTrigger: {
        trigger: container,
        start: 'top 82%',
        ...(options.scrollTrigger || {}),
      },
    }
  );
}

// Helper: horizontal scroll timeline
export function horizontalScroll(container, track, options = {}) {
  const sections = container ? container.children : [];
  const totalWidth = options.totalWidth || (sections.length * (options.sectionWidth || 400));

  gsap.to(track || container, {
    x: () => -(totalWidth - window.innerWidth + (options.padding || 100)),
    ease: 'none',
    scrollTrigger: {
      trigger: container,
      pin: true,
      scrub: 1,
      start: 'top top',
      end: () => `+=${totalWidth}`,
      invalidateOnRefresh: true,
      ...(options.scrollTrigger || {}),
    },
  });
}

// Helper: count-up animation
export function countUp(element, target, options = {}) {
  return gsap.fromTo(
    element,
    { textContent: 0 },
    {
      textContent: target,
      duration: options.duration || 2,
      ease: options.ease || EASE.power2,
      snap: { textContent: 1 },
      scrollTrigger: {
        trigger: element,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
        ...(options.scrollTrigger || {}),
      },
    }
  );
}

// Helper: parallax effect
export function parallax(element, options = {}) {
  return gsap.to(element, {
    y: options.y || 80,
    ease: 'none',
    scrollTrigger: {
      trigger: element,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
      ...(options.scrollTrigger || {}),
    },
  });
}
