import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useFadeInUp(ref, options = {}) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { y: options.distance || 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: options.duration || 0.8,
          ease: options.ease || 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: options.start || 'top 85%',
            toggleActions: 'play none none reverse',
            ...(options.scrub ? { scrub: options.scrub } : {}),
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [ref, options.distance, options.duration, options.ease, options.start, options.scrub]);
}

export function useStaggerFade(refs, options = {}) {
  useEffect(() => {
    const elements = refs.current.filter(Boolean);
    if (!elements.length) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        elements,
        { y: options.distance || 40, opacity: 0, scale: options.scale || 1 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: options.duration || 0.6,
          ease: options.ease || 'power2.out',
          stagger: options.stagger || 0.1,
          scrollTrigger: {
            trigger: elements[0],
            start: options.start || 'top 88%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, elements);

    return () => ctx.revert();
  }, [refs, options.distance, options.duration, options.ease, options.stagger, options.start, options.scale]);
}

export function useCounter(target, endValue, options = {}) {
  useEffect(() => {
    const el = target.current;
    if (!el) return;

    const obj = { val: 0 };
    const ctx = gsap.context(() => {
      gsap.to(obj, {
        val: endValue,
        duration: options.duration || 2,
        ease: options.ease || 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: options.start || 'top 85%',
          toggleActions: 'play none none reverse',
        },
        onUpdate: () => {
          const suffix = options.suffix || '';
          el.textContent = Math.floor(obj.val).toLocaleString() + suffix;
        },
      });
    }, el);

    return () => ctx.revert();
  }, [target, endValue, options.duration, options.ease, options.start, options.suffix]);
}

export function useParallax(ref, options = {}) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.to(el, {
        y: options.distance || '30%',
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: options.scrub || 1,
        },
      });
    }, el);

    return () => ctx.revert();
  }, [ref, options.distance, options.scrub]);
}

export function useHorizontalScroll(triggerRef, trackRef, options = {}) {
  useEffect(() => {
    const trigger = triggerRef.current;
    const track = trackRef.current;
    if (!trigger || !track) return;

    const totalWidth = track.scrollWidth;
    const viewportWidth = window.innerWidth;
    const scrollDistance = -(totalWidth - viewportWidth + (options.padding || 100));

    const ctx = gsap.context(() => {
      gsap.to(track, {
        x: scrollDistance,
        ease: 'none',
        scrollTrigger: {
          trigger,
          start: 'top top',
          end: () => `+=${totalWidth - viewportWidth + (options.endPadding || 400)}`,
          pin: true,
          scrub: options.scrub || 1.5,
          invalidateOnRefresh: true,
        },
      });
    }, trigger);

    return () => ctx.revert();
  }, [triggerRef, trackRef, options.padding, options.endPadding, options.scrub]);
}

export function useTextReveal(ref, options = {}) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Save original text to restore on cleanup
    const originalText = el.textContent || '';

    const chars = originalText.split('');
    el.textContent = '';
    const spans = chars.map((char) => {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.display = 'inline-block';
      span.style.opacity = '0';
      span.style.transform = 'translateY(20px)';
      el.appendChild(span);
      return span;
    });

    const ctx = gsap.context(() => {
      gsap.to(spans, {
        y: 0,
        opacity: 1,
        duration: options.duration || 0.04,
        stagger: options.stagger || 0.03,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: options.start || 'top 85%',
          toggleActions: 'play none none reverse',
        },
      });
    }, el);

    return () => {
      ctx.revert();
      // Restore original DOM to prevent broken text on unmount
      el.textContent = originalText;
    };
  }, [ref, options.duration, options.stagger, options.start]);
}
