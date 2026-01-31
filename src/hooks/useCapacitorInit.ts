import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

export const useCapacitorInit = () => {
  useEffect(() => {
    const initCapacitor = async () => {
      // Only run on native platforms
      if (!Capacitor.isNativePlatform()) {
        return;
      }

      try {
        // Do NOT overlay - let the native status bar have its own space
        // This pushes the WebView below the status bar/Dynamic Island
        await StatusBar.setOverlaysWebView({ overlay: false });
        
        // Set status bar style and background color to match app theme
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#262933' });
        
        console.log('Capacitor StatusBar initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Capacitor StatusBar:', error);
      }
    };

    initCapacitor();
  }, []);
};
