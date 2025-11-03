import { pathConfig } from '../config/PathConfig.js';

/**
 * NotificationManager - Handles push notifications for mobile devices
 */
export class NotificationManager {
    constructor() {
        this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
        this.registration = null;
        this.permission = Notification.permission;
    }

    /**
     * Initialize service worker and request notification permission
     */
    async initialize() {
        if (!this.isSupported) {
            console.log('[NotificationManager] Push notifications not supported');
            return false;
        }

        try {
            // Register service worker with resolved path
            const swPath = pathConfig.resolvePath('service-worker.js');
            
            // Get base path and ALWAYS ensure trailing slash for Service Worker spec compliance
            // Service Worker spec requires scope to end with / to match the max scope allowed
            let swScope = pathConfig.getBasePath();
            if (!swScope || swScope === '') {
                swScope = '/';
            } else {
                // Ensure trailing slash is present
                swScope = swScope.endsWith('/') ? swScope : swScope + '/';
            }
            
            console.log('[NotificationManager] Registering service worker:', { swPath, swScope });
            
            this.registration = await navigator.serviceWorker.register(swPath, {
                scope: swScope
            });
            console.log('[NotificationManager] Service Worker registered:', this.registration);

            // Wait for service worker to be ready
            await navigator.serviceWorker.ready;
            console.log('[NotificationManager] Service Worker ready');

            return true;
        } catch (error) {
            console.error('[NotificationManager] Service Worker registration failed:', error);
            console.error('[NotificationManager] Attempted path:', pathConfig.resolvePath('service-worker.js'));
            console.error('[NotificationManager] Error details:', error.message);
            
            // Mark as unsupported to gracefully degrade
            this.isSupported = false;
            return false;
        }
    }

    /**
     * Request notification permission from user
     */
    async requestPermission() {
        if (!this.isSupported) {
            return false;
        }

        try {
            this.permission = await Notification.requestPermission();
            console.log('[NotificationManager] Notification permission:', this.permission);
            return this.permission === 'granted';
        } catch (error) {
            console.error('[NotificationManager] Failed to request permission:', error);
            return false;
        }
    }

    /**
     * Check if notifications are enabled
     */
    isEnabled() {
        return this.isSupported && this.permission === 'granted';
    }

    /**
     * Show a notification
     * @param {string} title - Notification title
     * @param {string} body - Notification body
     * @param {object} options - Additional notification options
     */
    async showNotification(title, body, options = {}) {
        if (!this.isEnabled()) {
            console.log('[NotificationManager] Notifications not enabled');
            return;
        }

        try {
            // Resolve icon and badge paths
            const defaultIcon = pathConfig.resolveAssetPath('icons/icon-192.png');
            const defaultBadge = pathConfig.resolveAssetPath('icons/icon-192.png');
            
            // If service worker is available, use it to show notification
            if (this.registration) {
                await this.registration.showNotification(title, {
                    body,
                    icon: options.icon || defaultIcon,
                    badge: options.badge || defaultBadge,
                    tag: options.tag || 'message-notification',
                    data: options.data || {},
                    requireInteraction: false,
                    vibrate: [200, 100, 200], // Vibration pattern for mobile
                    ...options
                });
            } else {
                // Fallback to regular notification API
                new Notification(title, {
                    body,
                    icon: options.icon || defaultIcon,
                    tag: options.tag || 'message-notification',
                    ...options
                });
            }
            
            console.log('[NotificationManager] Notification shown:', title);
        } catch (error) {
            console.error('[NotificationManager] Failed to show notification:', error);
        }
    }

    /**
     * Show notification for new message
     * @param {object} message - Message object
     */
    async showMessageNotification(message) {
        const title = `来自 ${message.deviceName} 的新消息`;
        const body = message.content;
        
        await this.showNotification(title, body, {
            tag: 'message-notification',
            data: {
                messageId: message.id,
                deviceName: message.deviceName,
                timestamp: message.timestamp
            }
        });
    }

    /**
     * Check if running on mobile device
     */
    isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    /**
     * Auto-request permission on mobile devices
     */
    async autoRequestPermission() {
        if (this.isMobileDevice() && this.permission === 'default') {
            console.log('[NotificationManager] Auto-requesting permission on mobile');
            return await this.requestPermission();
        }
        return this.permission === 'granted';
    }
}
