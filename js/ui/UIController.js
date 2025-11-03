// UI Controller
// Manages user interface interactions and updates
import { NotificationManager } from './NotificationManager.js';

export class UIController {
    constructor(messageManager, configManager) {
        this.messageManager = messageManager;
        this.configManager = configManager;
        this.notificationManager = new NotificationManager();
        
        // Settings panel elements
        this.settingsPanel = document.getElementById('settings-panel');
        this.settingsBtn = document.getElementById('settings-btn');
        this.closeSettingsBtn = document.getElementById('close-settings-btn');
        this.saveSettingsBtn = document.getElementById('save-settings-btn');
        this.settingsDeviceNameInput = document.getElementById('settings-device-name');
        this.brokerTypeSelect = document.getElementById('broker-type');
        this.channelDisplay = document.getElementById('channel-display');
        
        // Message input elements
        this.messageInput = document.getElementById('message-input');
        this.sendBtn = document.getElementById('send-btn');
        
        // Bind events
        this.bindSettingsEvents();
        this.bindMessageInputEvents();
    }

    /**
     * Bind settings panel events
     */
    bindSettingsEvents() {
        this.settingsBtn.addEventListener('click', () => this.showSettings());
        this.closeSettingsBtn.addEventListener('click', () => this.hideSettings());
        this.saveSettingsBtn.addEventListener('click', () => this.handleSaveSettings());
        
        // Close settings when clicking outside
        this.settingsPanel.addEventListener('click', (e) => {
            if (e.target === this.settingsPanel) {
                this.hideSettings();
            }
        });
    }

    /**
     * Show settings panel
     */
    showSettings() {
        // Load current settings
        this.settingsDeviceNameInput.value = this.configManager.getDeviceName();
        this.brokerTypeSelect.value = this.configManager.getBrokerType();
        this.channelDisplay.textContent = this.configManager.getChannelName();
        
        this.settingsPanel.classList.remove('hidden');
    }

    /**
     * Hide settings panel
     */
    hideSettings() {
        this.settingsPanel.classList.add('hidden');
    }

    /**
     * Handle save settings
     */
    handleSaveSettings() {
        const newDeviceName = this.settingsDeviceNameInput.value.trim();
        const newBrokerType = this.brokerTypeSelect.value;
        const currentBrokerType = this.configManager.getBrokerType();
        
        // Validate device name
        if (!newDeviceName) {
            this.showSettingsError('设备名称不能为空');
            return;
        }
        
        try {
            // Save device name
            this.configManager.setDeviceName(newDeviceName);
            
            // Check if broker type changed
            if (newBrokerType !== currentBrokerType) {
                this.configManager.setBrokerType(newBrokerType);
                
                // Notify that broker changed (will be handled in task 6)
                window.dispatchEvent(new CustomEvent('broker-changed', {
                    detail: { brokerType: newBrokerType }
                }));
            }
            
            this.hideSettings();
            this.showSuccessMessage('设置已保存');
            
        } catch (error) {
            this.showSettingsError('保存设置失败: ' + error.message);
        }
    }

    /**
     * Show error in settings panel
     * @param {string} message - Error message
     */
    showSettingsError(message) {
        let errorElement = this.settingsPanel.querySelector('.error-message');
        
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            this.saveSettingsBtn.parentElement.insertBefore(errorElement, this.saveSettingsBtn.parentElement.firstChild);
        }
        
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 3000);
    }

    /**
     * Show success message (toast notification)
     * @param {string} message - Success message
     */
    showSuccessMessage(message) {
        this._showToast(message, 'success');
    }

    /**
     * Show error message (toast notification)
     * @param {string} message - Error message
     */
    showErrorMessage(message) {
        this._showToast(message, 'error');
    }

    /**
     * Show toast notification
     * @private
     * @param {string} message - Message to display
     * @param {string} type - Type of toast ('success' or 'error')
     */
    _showToast(message, type = 'info') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        // Add to body
        document.body.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }

    /**
     * Setup message send confirmation callbacks
     * This implements the confirmation mechanism for task 5.2
     */
    setupMessageConfirmation() {
        // Handle send success
        this.messageManager.onSendSuccess(() => {
            this.showSuccessMessage('消息发送成功');
        });
        
        // Handle send error
        this.messageManager.onSendError((error, messageContent) => {
            this.showErrorMessage('消息发送失败: ' + error.message);
            
            // Restore message content in input field so user can retry
            const messageInput = document.getElementById('message-input');
            if (messageInput && messageContent) {
                messageInput.value = messageContent;
            }
        });
    }

    /**
     * Initialize UI Controller
     */
    async initialize() {
        // Initialize notification manager (service worker + push notifications)
        await this.notificationManager.initialize();
        
        // Request notification permission (desktop and mobile)
        await this.requestNotificationPermission();
        
        // Auto-request permission on mobile devices
        await this.notificationManager.autoRequestPermission();
        
        // Setup message confirmation callbacks
        this.setupMessageConfirmation();
        
        // Setup message received handler (Task 9.3)
        this.messageManager.onMessageReceived((message) => {
            this.displayMessage(message);
            this.showNotification(message);
        });
        
        // Setup message sent handler to display sent messages (Task 9.3)
        this.messageManager.onSendSuccess((message) => {
            this.displayMessage(message);
        });
    }

    /**
     * Display a message in the message list
     * @param {Object} message - Message object with id, content, deviceName, timestamp, direction
     */
    displayMessage(message) {
        const messageList = document.getElementById('message-list');
        if (!messageList) return;
        
        // Create message item
        const messageItem = document.createElement('div');
        messageItem.className = `message-item ${message.direction}`;
        messageItem.dataset.messageId = message.id;
        
        // Create message bubble
        const messageBubble = document.createElement('div');
        messageBubble.className = 'message-bubble';
        messageBubble.textContent = message.content;
        
        // Create message metadata (timestamp and device name)
        const messageMeta = document.createElement('div');
        messageMeta.className = 'message-meta';
        
        const timestamp = this._formatTimestamp(message.timestamp);
        const deviceName = message.deviceName;
        
        messageMeta.textContent = `${deviceName} · ${timestamp}`;
        
        // Assemble message item
        messageItem.appendChild(messageBubble);
        messageItem.appendChild(messageMeta);
        
        // Add to message list
        messageList.appendChild(messageItem);
        
        // Auto-scroll to latest message
        this._scrollToBottom();
    }

    /**
     * Format timestamp to readable format
     * @private
     * @param {number} timestamp - Unix timestamp in milliseconds
     * @returns {string} Formatted time string
     */
    _formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        
        // Check if message is from today
        const isToday = date.toDateString() === now.toDateString();
        
        if (isToday) {
            // Show only time for today's messages
            return date.toLocaleTimeString('zh-CN', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        } else {
            // Show date and time for older messages
            return date.toLocaleString('zh-CN', { 
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit', 
                minute: '2-digit' 
            });
        }
    }

    /**
     * Scroll message list to bottom (latest message)
     * @private
     */
    _scrollToBottom() {
        const messageContainer = document.querySelector('.message-container');
        if (messageContainer) {
            messageContainer.scrollTop = messageContainer.scrollHeight;
        }
    }

    /**
     * Load and display message history
     * @param {Array} messages - Array of message objects
     */
    loadMessageHistory(messages) {
        const messageList = document.getElementById('message-list');
        if (!messageList) return;
        
        // Clear existing messages
        messageList.innerHTML = '';
        
        // Display each message
        messages.forEach(message => {
            this.displayMessage(message);
        });
    }

    /**
     * Request notification permission from user
     * @returns {Promise<boolean>} True if permission granted
     */
    async requestNotificationPermission() {
        // Check if browser supports notifications
        if (!('Notification' in window)) {
            console.warn('This browser does not support desktop notifications');
            return false;
        }
        
        // Check current permission
        if (Notification.permission === 'granted') {
            return true;
        }
        
        if (Notification.permission === 'denied') {
            return false;
        }
        
        // Request permission
        try {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        } catch (error) {
            console.error('Failed to request notification permission:', error);
            return false;
        }
    }

    /**
     * Show desktop/mobile notification for new message
     * @param {Object} message - Message object
     */
    async showNotification(message) {
        // Only show notification for received messages
        if (message.direction !== 'received') {
            return;
        }
        
        // Check if window is already focused
        if (document.hasFocus()) {
            // Don't show notification if user is already viewing the app
            return;
        }
        
        // Use NotificationManager for mobile push notifications
        if (this.notificationManager.isEnabled()) {
            await this.notificationManager.showMessageNotification(message);
            return;
        }
        
        // Fallback to desktop notifications
        if (!('Notification' in window) || Notification.permission !== 'granted') {
            return;
        }
        
        try {
            // Create notification
            const notification = new Notification('新消息', {
                body: `${message.deviceName}: ${message.content}`,
                icon: '/icons/icon-192.png',
                tag: message.id, // Prevent duplicate notifications
                requireInteraction: false,
                silent: false
            });
            
            // Handle notification click - focus the app window
            notification.onclick = () => {
                window.focus();
                notification.close();
            };
            
            // Auto-close notification after 5 seconds
            setTimeout(() => {
                notification.close();
            }, 5000);
            
        } catch (error) {
            console.error('Failed to show notification:', error);
        }
    }

    /**
     * Update connection status display
     * @param {string} status - Connection status from ConnectionStatus enum
     */
    updateConnectionStatus(status) {
        const statusElement = document.getElementById('connection-status');
        if (!statusElement) return;
        
        // Map status to display text and CSS class
        const statusMap = {
            'disconnected': { text: '未连接', class: 'status-disconnected' },
            'connecting': { text: '连接中...', class: 'status-connecting' },
            'connected': { text: '已连接', class: 'status-connected' },
            'failed': { text: '连接失败', class: 'status-failed' }
        };
        
        const statusInfo = statusMap[status] || statusMap['disconnected'];
        
        // Update text
        statusElement.textContent = statusInfo.text;
        
        // Update CSS class
        statusElement.className = 'status-indicator ' + statusInfo.class;
    }

    /**
     * Bind message input events
     */
    bindMessageInputEvents() {
        // Send button click
        this.sendBtn.addEventListener('click', () => this.handleSendMessage());
        
        // Enter key to send (Shift+Enter for new line)
        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSendMessage();
            }
        });
        
        // Auto-resize textarea as user types
        this.messageInput.addEventListener('input', () => {
            this._autoResizeTextarea();
        });
    }

    /**
     * Auto-resize textarea based on content
     * @private
     */
    _autoResizeTextarea() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
    }

    /**
     * Handle send message action
     */
    async handleSendMessage() {
        const content = this.messageInput.value.trim();
        
        // Validate message content
        if (!content) {
            return;
        }
        
        try {
            // Disable send button to prevent double-sending
            this.sendBtn.disabled = true;
            
            // Send message through MessageManager
            await this.messageManager.sendMessage(content, this.configManager.getDeviceName());
            
            // Clear input field on success
            this.messageInput.value = '';
            this._autoResizeTextarea();
            
        } catch (error) {
            // Error handling is done in MessageManager callbacks
            console.error('Failed to send message:', error);
        } finally {
            // Re-enable send button
            this.sendBtn.disabled = false;
            this.messageInput.focus();
        }
    }
}
