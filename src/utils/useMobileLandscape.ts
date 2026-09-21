import { useEffect, useState } from 'react';

export function useMobileLandscape() {
  const [dimensions, setDimensions] = useState(() => {
    if (typeof window === 'undefined') {
      return { width: 1024, height: 768, isLandscape: true };
    }
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      isLandscape: window.innerWidth > window.innerHeight,
    };
  });

  const [isFullscreen, setIsFullscreen] = useState(() => {
    if (typeof document === 'undefined') return false;
    return !!document.fullscreenElement;
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
        isLandscape: window.innerWidth > window.innerHeight,
      });
      setIsFullscreen(!!document.fullscreenElement);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    document.addEventListener('fullscreenchange', handleResize);

    // Attempt automatic landscape lock on mount
    try {
      if (
        typeof screen !== 'undefined' &&
        'orientation' in screen &&
        screen.orientation &&
        'lock' in screen.orientation
      ) {
        (screen.orientation as any).lock('landscape').catch(() => {});
      }
    } catch {}

    // Auto-request fullscreen and landscape lock on first user interaction (tap/click)
    const handleFirstInteraction = async () => {
      try {
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen().catch(() => {});
        }
        if (
          typeof screen !== 'undefined' &&
          'orientation' in screen &&
          screen.orientation &&
          'lock' in screen.orientation
        ) {
          await (screen.orientation as any).lock('landscape').catch(() => {});
        }
      } catch {}
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction, { once: true });
    window.addEventListener('touchstart', handleFirstInteraction, { once: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      document.removeEventListener('fullscreenchange', handleResize);
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
        // Try locking orientation to landscape on mobile if supported
        if (
          typeof screen !== 'undefined' &&
          'orientation' in screen &&
          screen.orientation &&
          'lock' in screen.orientation
        ) {
          (screen.orientation as any).lock('landscape').catch(() => {});
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch {
      // Graceful fallback if fullscreen is blocked by iframe or browser policy
    }
  };

  // Mobile landscape is active when width > height and vertical height is compact (<= 560px),
  // OR on smaller screens (width <= 960px and height <= 600px)
  const isLandscape = dimensions.width > dimensions.height;
  const isCompactHeight = dimensions.height <= 560;
  const isMobileLandscape = isLandscape && (isCompactHeight || (dimensions.width <= 960 && dimensions.height <= 600));
  const isPortraitMobile = !isLandscape && dimensions.width < 768;

  return {
    ...dimensions,
    isCompactHeight,
    isMobileLandscape,
    isPortraitMobile,
    isFullscreen,
    toggleFullscreen,
  };
}
