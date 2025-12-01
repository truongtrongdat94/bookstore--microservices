import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 * 
 * Automatically scrolls the window to the top when the route changes.
 * This component should be placed inside the Router context but outside Routes.
 * 
 * @returns null - This component does not render any UI
 */
export function ScrollToTop(): null {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
  }, [pathname]);

  return null;
}
