import { useState, useEffect, useCallback, type MutableRefObject } from 'react';

export function useScrollSpy(
  fileBlockRefs: MutableRefObject<Map<number, HTMLDivElement>>,
  expanded: boolean,
  count: number
) {
  const [activeFileIndex, setActiveFileIndex] = useState<number>(0);

  const scrollToBlock = useCallback((blockIndex: number, fileIndex: number) => {
    const el = fileBlockRefs.current.get(blockIndex);
    if (el) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setActiveFileIndex(fileIndex);
    }
  }, [fileBlockRefs]);

  useEffect(() => {
    if (!expanded) return;

    const observerOptions = {
      root: null,
      rootMargin: '-100px 0px -60% 0px',
      threshold: 0
    };

    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const fileIndex = parseInt(entry.target.getAttribute('data-file-index') || '0', 10);
          setActiveFileIndex(fileIndex);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    fileBlockRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [expanded, count, fileBlockRefs]);

  return { activeFileIndex, scrollToBlock };
}