import { useEffect, useRef, useCallback, useState } from 'react';

// Create notification sound using Web Audio API
const createNotificationSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  return () => {
    // Create oscillator for the notification tone
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };
};

// Request notification permission
const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('Browser ne podržava notifikacije');
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
};

// Show browser notification
const showBrowserNotification = (title: string, body: string) => {
  if (Notification.permission === 'granted') {
    const notification = new Notification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'new-order',
      requireInteraction: true,
    });
    
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
    
    return notification;
  }
  return null;
};

const NOTIFICATION_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const SOUND_INTERVAL_MS = 2000; // Play sound every 2 seconds

export const useNotificationSound = (orderCount: number, enabled: boolean = true) => {
  const prevCountRef = useRef(orderCount);
  const [notificationPermission, setNotificationPermission] = useState<boolean>(false);
  const soundRef = useRef<(() => void) | null>(null);
 const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notificationRef = useRef<Notification | null>(null);
  const [isAlerting, setIsAlerting] = useState(false);
  
  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission().then(setNotificationPermission);
  }, []);
  
  // Initialize sound on first user interaction
  useEffect(() => {
    const initSound = () => {
      if (!soundRef.current) {
        try {
          soundRef.current = createNotificationSound();
        } catch (e) {
          console.log('Audio not available');
        }
      }
      document.removeEventListener('click', initSound);
    };
    
    document.addEventListener('click', initSound);
    return () => document.removeEventListener('click', initSound);
  }, []);
  
  // Stop alerting function
  const stopAlert = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (notificationRef.current) {
      notificationRef.current.close();
      notificationRef.current = null;
    }
    setIsAlerting(false);
  }, []);
  
  // Start persistent alert
  const startAlert = useCallback(() => {
    if (!enabled) return;
    
    // Play sound immediately if available
    if (soundRef.current) {
      soundRef.current();
    }
    setIsAlerting(true);
    
    // Show browser notification (works in background)
    if (notificationPermission) {
      notificationRef.current = showBrowserNotification(
        '🛒 Nova Porudžbina!',
        'Stigla je nova porudžbina. Kliknite da pregledate.'
      );
    }
    
    // Play sound every 2 seconds
    intervalRef.current = setInterval(() => {
      if (soundRef.current) {
        soundRef.current();
      }
    }, SOUND_INTERVAL_MS);
    
    // Auto-stop after 5 minutes
    timeoutRef.current = setTimeout(() => {
      stopAlert();
    }, NOTIFICATION_DURATION_MS);
  }, [enabled, stopAlert, notificationPermission]);
  
  // Detect new order and start alert
  useEffect(() => {
    if (enabled && orderCount > prevCountRef.current) {
      // New order arrived - start persistent alert
      stopAlert(); // Clear any existing alert
      startAlert();
    }
    prevCountRef.current = orderCount;
  }, [orderCount, enabled, startAlert, stopAlert]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAlert();
    };
  }, [stopAlert]);
  
  const playSound = useCallback(() => {
    if (soundRef.current) {
      soundRef.current();
    }
  }, []);
  
  return { playSound, isAlerting, stopAlert, notificationPermission };
};

