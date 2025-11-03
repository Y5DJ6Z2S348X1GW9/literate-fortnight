// Connection Manager
// Handles automatic connection and reconnection logic

import { ConnectionStatus } from '../brokers/IMessageBroker.js';

export class ConnectionManager {
    constructor(broker, configManager, uiController) {
        this.broker = broker;
        this.configManager = configManager;
        this.uiController = uiController;
        this.reconnectInterval = null;
        this.reconnectDelay = 5000; // 5 seconds
        this.isManualDisconnect = false;
        
        // Set up connection state monitoring
        this._setupConnectionMonitoring();
    }

    /**
     * Set up connection state monitoring
     * @private
     */
    _setupConnectionMonitoring() {
        if (this.broker) {
            this.broker.onConnectionChange((status) => {
                console.log('Connection status changed:', status);
                
                // Update UI
                this.uiController.updateConnectionStatus(status);
                
                // Handle reconnection logic
                if (status === ConnectionStatus.DISCONNECTED || status === ConnectionStatus.FAILED) {
                    if (!this.isManualDisconnect) {
                        this._startReconnection();
                    }
                } else if (status === ConnectionStatus.CONNECTED) {
                    this._stopReconnection();
                    // Show reconnection success message if we were reconnecting
                    if (this.reconnectInterval) {
                        this.uiController.showSuccessMessage('连接已恢复');
                    }
                }
            });
        }
    }

    /**
     * Connect to the message broker
     * @returns {Promise<void>}
     */
    async connect() {
        try {
            console.log('Connecting to message broker...');
            this.isManualDisconnect = false;
            
            // Get broker configuration
            const brokerType = this.configManager.getBrokerType();
            const config = this._getBrokerConfig(brokerType);
            
            // Update UI to show connecting status
            this.uiController.updateConnectionStatus(ConnectionStatus.CONNECTING);
            
            // Connect to broker
            await this.broker.connect(config);
            
            console.log('Connected successfully');
        } catch (error) {
            console.error('Connection failed:', error);
            this.uiController.showErrorMessage('连接失败: ' + error.message);
            
            // Start reconnection attempts
            this._startReconnection();
            
            throw error;
        }
    }

    /**
     * Disconnect from the message broker
     */
    disconnect() {
        console.log('Disconnecting from message broker...');
        this.isManualDisconnect = true;
        this._stopReconnection();
        
        if (this.broker) {
            this.broker.disconnect();
        }
    }

    /**
     * Start automatic reconnection attempts
     * @private
     */
    _startReconnection() {
        // Don't start if already reconnecting
        if (this.reconnectInterval) {
            return;
        }
        
        console.log('Starting reconnection attempts...');
        this.uiController.showErrorMessage('连接已断开，正在重连...');
        
        this.reconnectInterval = setInterval(async () => {
            console.log('Attempting to reconnect...');
            
            try {
                await this.connect();
            } catch (error) {
                console.log('Reconnection attempt failed, will retry in 5 seconds');
            }
        }, this.reconnectDelay);
    }

    /**
     * Stop automatic reconnection attempts
     * @private
     */
    _stopReconnection() {
        if (this.reconnectInterval) {
            console.log('Stopping reconnection attempts');
            clearInterval(this.reconnectInterval);
            this.reconnectInterval = null;
        }
    }

    /**
     * Get broker configuration based on broker type
     * @private
     * @param {string} brokerType - 'ably' or 'pusher'
     * @returns {Object} Broker configuration
     */
    _getBrokerConfig(brokerType) {
        const deviceName = this.configManager.getDeviceName();
        const channelName = this.configManager.getChannelName();
        
        if (brokerType === 'ably') {
            return {
                apiKey: this.configManager.getAblyConfig().apiKey,
                deviceName: deviceName,
                channelName: channelName
            };
        } else if (brokerType === 'pusher') {
            const pusherConfig = this.configManager.getPusherConfig();
            return {
                key: pusherConfig.key,
                cluster: pusherConfig.cluster,
                deviceName: deviceName,
                channelName: channelName
            };
        } else {
            throw new Error(`Unknown broker type: ${brokerType}`);
        }
    }

    /**
     * Handle broker type change (switch between Pusher and Ably)
     * @param {string} newBrokerType - New broker type
     * @param {Object} newBroker - New broker instance
     */
    async switchBroker(newBroker) {
        console.log('Switching broker...');
        
        // Disconnect from current broker
        this.disconnect();
        
        // Update broker reference
        this.broker = newBroker;
        
        // Set up monitoring for new broker
        this._setupConnectionMonitoring();
        
        // Connect to new broker
        await this.connect();
    }
}
