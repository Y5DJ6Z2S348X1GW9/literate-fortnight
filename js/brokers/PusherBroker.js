// Pusher Broker Implementation
// Implements IMessageBroker for Pusher service

import { IMessageBroker, ConnectionStatus } from './IMessageBroker.js';

export class PusherBroker extends IMessageBroker {
    constructor() {
        super();
        this.pusher = null;
        this.channel = null;
        this.connectionStatus = ConnectionStatus.DISCONNECTED;
        this.connectionChangeCallbacks = [];
    }

    async connect(config) {
        try {
            this.updateConnectionStatus(ConnectionStatus.CONNECTING);
            
            // Create Pusher instance
            // Note: Pusher channels must be prefixed with 'private-' or 'presence-' for client events
            this.pusher = new Pusher(config.key, {
                cluster: config.cluster,
                authEndpoint: null, // No auth endpoint needed for public channels
            });

            // Set up connection state listeners
            this.pusher.connection.bind('connected', () => {
                this.updateConnectionStatus(ConnectionStatus.CONNECTED);
            });

            this.pusher.connection.bind('disconnected', () => {
                this.updateConnectionStatus(ConnectionStatus.DISCONNECTED);
            });

            this.pusher.connection.bind('unavailable', () => {
                this.updateConnectionStatus(ConnectionStatus.DISCONNECTED);
            });

            this.pusher.connection.bind('failed', () => {
                this.updateConnectionStatus(ConnectionStatus.FAILED);
            });

            // Subscribe to the channel
            // For client events to work, channel must be private or presence
            const channelName = config.channelName.startsWith('private-') 
                ? config.channelName 
                : `private-${config.channelName}`;
            
            this.channel = this.pusher.subscribe(channelName);

            // Wait for connection to be established
            await new Promise((resolve, reject) => {
                if (this.pusher.connection.state === 'connected') {
                    resolve();
                } else {
                    this.pusher.connection.bind('connected', resolve);
                    this.pusher.connection.bind('failed', reject);
                    
                    // Timeout after 10 seconds
                    setTimeout(() => reject(new Error('Connection timeout')), 10000);
                }
            });
        } catch (error) {
            this.updateConnectionStatus(ConnectionStatus.FAILED);
            throw new Error(`Pusher connection failed: ${error.message}`);
        }
    }

    disconnect() {
        if (this.pusher) {
            if (this.channel) {
                this.pusher.unsubscribe(this.channel.name);
                this.channel = null;
            }
            this.pusher.disconnect();
            this.pusher = null;
            this.updateConnectionStatus(ConnectionStatus.DISCONNECTED);
        }
    }

    subscribe(channelName, callback) {
        if (!this.channel) {
            throw new Error('Not connected to Pusher. Call connect() first.');
        }

        // Bind to the 'client-message' event (client events must be prefixed with 'client-')
        this.channel.bind('client-message', (data) => {
            callback(data);
        });
    }

    async publish(channelName, message) {
        if (!this.channel) {
            throw new Error('Not connected to Pusher. Call connect() first.');
        }

        try {
            // Trigger client event (must be prefixed with 'client-')
            // Note: Client events require the channel to be private or presence
            this.channel.trigger('client-message', message);
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
