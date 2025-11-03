// Storage Manager
// Handles local storage of messages and configuration

export class StorageManager {
    constructor() {
        this.MESSAGES_KEY = 'messaging_app_messages';
        this.CONFIG_KEY = 'messaging_app_config';
        this.MAX_MESSAGES = 100;
    }

    /**
     * Save a message to local storage
     * Maintains a maximum of 100 messages (oldest are removed)
     * @param {Object} message - Message object to save
     */
    saveMessage(message) {
        try {
            const messages = this.getMessages(this.MAX_MESSAGES);
            
            // Add new message to the beginning
            messages.unshift(message);
            
            // Keep only the most recent MAX_MESSAGES
            const trimmedMessages = messages.slice(0, this.MAX_MESSAGES);
            
            localStorage.setItem(this.MESSAGES_KEY, JSON.stringify(trimmedMessages));
        } catch (error) {
            console.error('Failed to save message:', error);
            throw new Error('Failed to save message to storage');
        }
    }

    /**
     * Get messages from local storage
     * Returns messages in reverse chronological order (newest first)
     * @param {number} limit - Maximum number of messages to return (default: 100)
     * @returns {Array} Array of message objects
     */
    getMessages(limit = 100) {
        try {
            const messagesStr = localStorage.getItem(this.MESSAGES_KEY);
            
            if (!messagesStr) {
                return [];
            }
            
            const messages = JSON.parse(messagesStr);
            
            // Return limited number of messages
            return messages.slice(0, limit);
        } catch (error) {
            console.error('Failed to load messages:', error);
            return [];
        }
    }

    /**
     * Clear all messages from local storage
     */
    clearMessages() {
        try {
            localStorage.removeItem(this.MESSAGES_KEY);
        } catch (error) {
            console.error('Failed to clear messages:', error);
            throw new Error('Failed to clear messages from storage');
        }
    }

    /**
     * Save configuration to local storage
     * @param {Object} config - Configuration object
     */
    saveConfig(config) {
        try {
            localStorage.setItem(this.CONFIG_KEY, JSON.stringify(config));
        } catch (error) {
            console.error('Failed to save config:', error);
            throw new Error('Failed to save configuration to storage');
        }
    }

    /**
     * Get configuration from local storage
     * @returns {Object|null} Configuration object or null if not found
     */
    getConfig() {
        try {
            const configStr = localStorage.getItem(this.CONFIG_KEY);
            
            if (!configStr) {
                return null;
            }
            
            return JSON.parse(configStr);
        } catch (error) {
            console.error('Failed to load config:', error);
            return null;
        }
    }
}
