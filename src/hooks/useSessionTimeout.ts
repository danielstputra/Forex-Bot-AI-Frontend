import { useState, useEffect, useRef } from 'react';
import { useBotStore } from '../store/useBotStore';

export function useSessionTimeout(timeoutMs = 30000, countdownSec = 15) {
  const logout = useBotStore((state) => state.logout);
  const user = useBotStore((state) => state.user);
  
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(countdownSec);
  
  const activityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = () => {
    setShowWarning(false);
    setCountdown(countdownSec);
    
    if (activityTimerRef.current) {
      clearTimeout(activityTimerRef.current);
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }

    if (user) {
      activityTimerRef.current = setTimeout(() => {
        setShowWarning(true);
      }, timeoutMs);
    }
  };

  useEffect(() => {
    // Events to track user activity
    const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];
    
    if (user) {
      resetTimer();
      events.forEach((event) => {
        window.addEventListener(event, resetTimer);
      });
    }

    return () => {
      if (activityTimerRef.current) clearTimeout(activityTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [user]);

  // Manage the countdown once warning is shown
  useEffect(() => {
    if (showWarning) {
      countdownTimerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownTimerRef.current!);
            logout(); // Trigger auto-logout
            setShowWarning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, [showWarning, logout]);

  return {
    showWarning,
    countdown,
    resetTimeout: resetTimer,
  };
}
