// Message Manager
// Handles message sending, receiving, and storage

export class MessageManager {
    constructor(broker, storage) {
        this.broker = broker;
        this.storage = storage;
        this.messageReceivedCallbacks = [];
        this.sendSuccessCallbacks = [];
        this.sendErrorCallbacks = [];
        this.isSubscribed = false;
    }

    /**
     * Set up subscription to receive messages from the broker
     * Should be called after the broker is connected
     */
    setupMessageSubscription() {
        if (this.broker && !this.isSubscribed) {
            this.broker.subscribe('', (data) => {
                // Create message object with received data
                const message = {
                    id: data.id,
                    content: data.content,
                    deviceName: data.deviceName,
                    timestamp: data.timestamp,
                    direction: 'received'
                };
                
                // Save to storage
                try {
                    this.storage.saveMessage(message);
                } catch (error) {
                    console.error('Failed to save received message:', error);
                }
                
                // Notify all callbacks
                this.messageReceivedCallbacks.forEach(callback => {
                    try {
                        callback(message);
                    } catch (error) {
                        console.error('Error in message received callback:', error);
                    }
                });
            });
            this.isSubscribed = true;
        }
    }

    /**
     * Send a message
     * @param {string} content - Message content
     * @param {string} deviceName - Name of the sending device
     * @returns {Promise<Object>} The sent message object
     */
    async sendMessage(content, deviceName) {
        if (!content || content.trim() === '') {
            const error = new Error('Message content cannot be empty');
            this._notifySendError(error, content);
            throw error;
        }

        // Create message object
        const message = {
            id: this._generateUUID(),
            content: content.trim(),
            deviceName: deviceName,
            timestamp: Date.now(),
            direction: 'sent'
        };

        try {
            // Publish message through broker
            await this.broker.publish('', message);
            
            // Save to storage
            this.storage.saveMessage(message);
            
            // Notify success callbacks
            this._notifySendSuccess(message);
            
            return message;
        } catch (error) {
            console.error('Failed to send message:', error);
            this._notifySendError(error, content);
            throw error;
        }
    }

    /**
     * Register a callback for when messages are received
     * @param {Function} callback - Callback function that receives the message object
     */
    onMessageReceived(callback) {
        if (typeof callback === 'function') {
            this.messageReceivedCallbacks.push(callback);
        }
    }

    /**
     * Register a callback for when messages are sent successfully
     * @param {Function} callback - Callback function that receives the message object
     */
    onSendSuccess(callback) {
        if (typeof callback === 'function') {
            this.sendSuccessCallbacks.push(callback);
        }
    }

    /**
     * Register a callback for when message sending fails
     * @param {Function} callback - Callback function that receives (error, messageContent)
     */
    onSendError(callback) {
        if (typeof callback === 'function') {
            this.sendErrorCallbacks.push(callback);
        }
    }

    /**
     * Get message history from storage
     * @param {number} limit - Maximum number of messages to retrieve (default: 100)
     * @returns {Array} Array of message objects
     */
    getMessageHistory(limit = 100) {
        return this.storage.getMessages(limit);
    }

    /**
     * Clear all message history
     */
    clearHistory() {
        this.storage.clearMessages();
    }

    /**
     * Notify all send success callbacks
     * @private
     * @param {Object} message - The sent message
     */
    _notifySendSuccess(message) {
        this.sendSuccessCallbacks.forEach(callback => {
            try {
                callback(message);
            } catch (error) {
                console.error('Error in send success callback:', error);
            }
        });
    }

    /**
     * Notify all send error callbacks
     * @private
     * @param {Error} error - The error that occurred
     * @param {string} messageContent - The content that failed to send
     */
    _notifySendError(error, messageContent) {
        this.sendErrorCallbacks.forEach(callback => {
            try {
                callback(error, messageContent);
            } catch (err) {
                console.error('Error in send error callback:', err);
            }
        });
    }

    /**
     * Generate a UUID v4
     * @private
     * @returns {string} UUID string
     */
    _generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}
