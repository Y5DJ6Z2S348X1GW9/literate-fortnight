// Message Broker Interface
// Defines the contract for message broker implementations

/**
 * Connection status enum
 */
export const ConnectionStatus = {
    DISCONNECTED: 'disconnected',
    CONNECTING: 'connecting',
    CONNECTED: 'connected',
    FAILED: 'failed'
};

/**
 * Message Broker Interface
 * All message broker implementations must implement this interface
 */
export class IMessageBroker {
    /**
     * Connect to the message broker service
     * @param {Object} config - Configuration object containing connection details
     * @returns {Promise<void>}
     */
    async connect(config) {
        throw new Error('Method not implemented');
    }

    /**
     * Disconnect from the message broker service
     */
    disconnect() {
        throw new Error('Method not implemented');
    }

    /**
     * Subscribe to a channel and receive messages
     * @param {string} channelName - Name of the channel to subscribe to
     * @param {Function} callback - Callback function to handle received messages
     */
    subscribe(channelName, callback) {
        throw new Error('Method not implemented');
    }

    /**
     * Publish a message to a channel
     * @param {string} channelName - Name of the channel to publish to
     * @param {Object} message - Message object to publish
     * @returns {Promise<void>}
     */
    async publish(channelName, message) {
        throw new Error('Method not implemented');
    }

    /**
     * Register a callback for connection status changes
     * @param {Function} callback - Callback function that receives connection status
     */
    onConnectionChange(callback) {
        throw new Error('Method not implemented');
    }

    /**
     * Get current connection status
     * @returns {string} Current connection status from ConnectionStatus enum
     */
    getConnectionStatus() {
        throw new Error('Method not implemented');
    }
}
