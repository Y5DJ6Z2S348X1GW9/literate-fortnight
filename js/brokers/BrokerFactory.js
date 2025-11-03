// Broker Factory
// Creates appropriate broker instance based on configuration

import { AblyBroker } from './AblyBroker.js';
import { PusherBroker } from './PusherBroker.js';

/**
 * Factory class for creating message broker instances
 */
export class BrokerFactory {
    /**
     * Create a broker instance based on configuration
     * @param {ConfigManager} configManager - Configuration manager instance
     * @returns {IMessageBroker} Broker instance (AblyBroker or PusherBroker)
     */
    static create(configManager) {
        const brokerType = configManager.getBrokerType();
        
        switch (brokerType) {
            case 'ably':
                return new AblyBroker();
            case 'pusher':
                return new PusherBroker();
            default:
                throw new Error(`Unknown broker type: ${brokerType}`);
        }
    }

    /**
     * Get connection configuration for the specified broker type
     * @param {ConfigManager} configManager - Configuration manager instance
     * @returns {Object} Configuration object for the broker
     */
    static getConnectionConfig(configManager) {
        const brokerType = configManager.getBrokerType();
        const channelName = configManager.getChannelName();
        const deviceName = configManager.getDeviceName();
        
        switch (brokerType) {
            case 'ably':
                return {
                    apiKey: configManager.getAblyConfig().apiKey,
                    channelName: channelName,
                    deviceName: deviceName
                };
            case 'pusher':
                const pusherConfig = configManager.getPusherConfig();
                return {
                    key: pusherConfig.key,
                    cluster: pusherConfig.cluster,
                    channelName: channelName,
                    deviceName: deviceName
                };
            default:
                throw new Error(`Unknown broker type: ${brokerType}`);
        }
    }
}
