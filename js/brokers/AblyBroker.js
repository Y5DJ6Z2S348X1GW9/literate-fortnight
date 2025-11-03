// Ably Broker Implementation
// Implements IMessageBroker for Ably service

import { IMessageBroker, ConnectionStatus } from './IMessageBroker.js';

export class AblyBroker extends IMessageBroker {
    constructor() {
        super();
        this.ably = null;
        this.channel = null;
        this.connectionStatus = ConnectionStatus.DISCONNECTED;
        this.connectionChangeCallbacks = [];
    }

    async connect(config) {
        try {
            this.updateConnectionStatus(ConnectionStatus.CONNECTING);
            
            // Create Ably Realtime instance with API key
            this.ably = new Ably.Realtime({
                key: config.apiKey,
                clientId: config.deviceName || 'anonymous'
            });

            // Set up connection state listeners
            this.ably.connection.on('connected', () => {
                this.updateConnectionStatus(ConnectionStatus.CONNECTED);
            });

            this.ably.connection.on('disconnected', () => {
                this.updateConnectionStatus(ConnectionStatus.DISCONNECTED);
            });

            this.ably.connection.on('suspended', () => {
                this.updateConnectionStatus(ConnectionStatus.DISCONNECTED);
            });

            this.ably.connection.on('failed', () => {
                this.updateConnectionStatus(ConnectionStatus.FAILED);
            });

            // Get the channel
            this.channel = this.ably.channels.get(config.channelName);

            // Wait for connection to be established
            await new Promise((resolve, reject) => {
                if (this.ably.connection.state === 'connected') {
                    resolve();
                } else {
                    this.ably.connection.once('connected', resolve);
                    this.ably.connection.once('failed', reject);
                }
            });
        } catch (error) {
            this.updateConnectionStatus(ConnectionStatus.FAILED);
            throw new Error(`Ably connection failed: ${error.message}`);
        }
    }

    disconnect() {
        if (this.ably) {
            this.ably.close();
            this.ably = null;
            this.channel = null;
            this.updateConnectionStatus(ConnectionStatus.DISCONNECTED);
        }
    }

    subscribe(channelName, callback) {
        if (!this.channel) {
            throw new Error('Not connected to Ably. Call connect() first.');
        }

        // Subscribe to the 'message' event on the channel
        this.channel.subscribe('message', (message) => {
            callback(message.data);
        });
    }

    async publish(channelName, message) {
        if (!this.channel) {
            throw new Error('Not connected to Ably. Call connect() first.');
        }

        try {
            await this.channel.publish('message', message);
        } catch (error) {
            throw new Error(`Failed to publish message: ${error.message}`);
        }
    }

    onConnectionChange(callback) {
        this.connectionChangeCallbacks.push(callback);
    }

    getConnectionStatus() {
        return this.connectionStatus;
    }

    updateConnectionStatus(status) {
        this.connectionStatus = status;
        this.connectionChangeCallbacks.forEach(callback => {
            try {
                callback(status);
            } catch (error) {
                console.error('Error in connection change callback:', error);
            }
        });
    }
}
