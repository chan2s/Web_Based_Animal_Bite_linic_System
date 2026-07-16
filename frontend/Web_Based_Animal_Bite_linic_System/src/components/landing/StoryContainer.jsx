import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SceneOne from './scenes/SceneOne';
import SceneTwo from './scenes/SceneTwo';
import SceneThree from './scenes/SceneThree';
import SceneFour from './scenes/SceneFour';
import SceneFive from './scenes/SceneFive';
import SceneSix from './scenes/SceneSix';
import SceneSeven from './scenes/SceneSeven';
import Scene3DContainer from './Scene3DContainer';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';

gsap.registerPlugin(ScrollTrigger);

const SCENE_LABELS = [
  'A Peaceful Day',
  'The Incident',
  'Panic & Confusion',
  'Discovery',
  'Taking Action',
  'Expert Care',
  'Safe & Protected',
];

export default function StoryContainer() {
  const containerRef = useRef(null);
  const progressRef = useRef(null);
  const labelRef = useRef(null);
  const reducedMotion = usePrefersReducedMotion();

  // Update scene indicator on scroll
  useEffect(() => {
    if (reducedMotion) return;

    const sections = containerRef.current?.querySelectorAll('.story-scene');
    if (!sections?.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Array.from(sections).indexOf(entry.target);
            if (index >= 0 && labelRef.current) {
              labelRef.current.textContent = SCENE_LABELS[index] || '';

              // Update progress dots
              const dots = progressRef.current?.querySelectorAll('.scene-dot');
              dots?.forEach((dot, i) => {
                const isActive = i <= index;
                dot.classList.toggle('bg-blue-500', isActive);
                dot.classList.toggle('bg-gray-200', !isActive);
                dot.classList.toggle('opacity-100', isActive);
                dot.classList.toggle('opacity-40', !isActive);
              });
            }
          }
        });
      },
      { threshold: 0.4, rootMargin: '0px 0px -10% 0px' }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [reducedMotion]);

  return (
    <div ref={containerRef} className="relative">
      {/* Sticky scene progress indicator */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col items-end gap-3">
        {/* Scene label */}
        <div
          ref={labelRef}
          className="text-xs font-medium text-gray-400 tracking-wider uppercase mb-2 transition-all duration-500 text-right min-w-[120px]"
        >
          A Peaceful Day
        </div>

        {/* Progress dots */}
        <div ref={progressRef} className="flex flex-col items-center gap-2.5">
          {SCENE_LABELS.map((_, i) => (
            <div
              key={i}
              className={`scene-dot w-2 h-2 rounded-full transition-all duration-500 ${
                i === 0 ? 'bg-blue-500 opacity-100' : 'bg-gray-200 opacity-40'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Scene transition dividers */}
      {[SceneOne, SceneTwo, SceneThree, SceneFour, SceneFive, SceneSix, SceneSeven].map(
        (SceneComponent, i) => (
          <div key={i} className="relative">
            {/* Scene wrapped in 3D depth container */}
            <div className="story-scene relative">
              <Scene3DContainer>
                <SceneComponent />
              </Scene3DContainer>
            </div>

            {/* Transition divider between scenes (except after last) */}
            {i < 6 && (
              <div className="relative h-24 lg:h-32 bg-gradient-to-b from-transparent via-blue-50/10 to-transparent overflow-hidden">
                {/* Scroll indicator */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
                  <span className="text-[10px] text-gray-300 font-medium tracking-widest uppercase">
                    Continue scrolling
                  </span>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-0.5 h-4 bg-gray-200 rounded-full animate-pulse" />
                    <div className="w-0.5 h-4 bg-gray-200 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
}
