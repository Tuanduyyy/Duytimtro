import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname, key, state } = useLocation();
  const navType = useNavigationType();
  const prevPathname = useRef<string>(pathname);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    // 1. Save scroll position and last visited room if we are leaving the rooms list or favorites list
    if ((prevPathname.current === '/rooms' || prevPathname.current === '/favorites') && pathname.startsWith('/rooms/')) {
      const scrollKey = prevPathname.current === '/rooms' ? 'roomsScrollPos' : 'favoritesScrollPos';
      sessionStorage.setItem(scrollKey, window.scrollY.toString());
      const roomId = pathname.split('/').pop();
      if (roomId) {
        sessionStorage.setItem('lastVisitedRoomId', roomId);
      }
    }

    // 2. Decide whether to scroll to top or restore position
    // We'll let RoomList and Favorites handle their own restoration for better coordination with pagination
    const isReturningToRooms = pathname === '/rooms' && prevPathname.current.startsWith('/rooms/');
    const isReturningToFavorites = pathname === '/favorites' && prevPathname.current.startsWith('/rooms/');
    
    if (isReturningToRooms || isReturningToFavorites) {
      // Do nothing, RoomList/Favorites will handle it
    } else {
      // Standard navigation or same-page click - scroll to top
      window.scrollTo(0, 0);
    }

    // Update the ref for the next transition
    prevPathname.current = pathname;
  }, [pathname, key, navType, state]);

  return null;
}
