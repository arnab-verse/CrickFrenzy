/**
 * Tactile vibration feedback for mobile touch devices.
 */
export function triggerHaptic(type: 'tap' | 'hit' | 'boundary' | 'six' | 'wicket') {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      switch (type) {
        case 'tap':
          navigator.vibrate(15);
          break;
        case 'hit':
          navigator.vibrate(28);
          break;
        case 'boundary':
          navigator.vibrate([35, 40, 35]);
          break;
        case 'six':
          navigator.vibrate([50, 40, 70]);
          break;
        case 'wicket':
          navigator.vibrate([100, 50, 120]);
          break;
      }
    } catch {
      // Ignore vibration errors on unsupported platforms
    }
  }
}
