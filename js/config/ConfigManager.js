// Configuration Manager
// Handles application configuration including device name, broker type, and channel name

export class ConfigManager {
    constructor() {
        this.CONFIG_KEY = 'messaging_app_config';
        this.config = this.loadConfig();
    }

    /**
     * Get the current broker type (pusher or ably)
     * @returns {string} 'pusher' or 'ably'
     */
    getBrokerType() {
        return this.config.brokerType || 'ably';
    }

    /**
     * Set the broker type
     * @param {string} type - 'pusher' or 'ably'
     */
    setBrokerType(type) {
        if (type !== 'pusher' && type !== 'ably') {
            throw new Error('Invalid broker type. Must be "pusher" or "ably"');
        }
        this.config.brokerType = type;
        this.saveConfig();
    }

    /**
     * Get the device name
     * @returns {string} Device name
     */
    getDeviceName() {
        return this.config.deviceName || '';
    }

    /**
     * Set the device name
     * @param {string} name - Device name
     */
    setDeviceName(name) {
        if (!name || name.trim() === '') {
            throw new Error('Device name cannot be empty');
        }
        this.config.deviceName = name.trim();
        this.saveConfig();
    }

    /**
     * Get the channel name
     * @returns {string} Channel name
     */
    getChannelName() {
        return this.config.channelName || '';
    }

    /**
     * Set the channel name
     * @param {string} name - Channel name
     */
    setChannelName(name) {
        if (!name || name.trim() === '') {
            throw new Error('Channel name cannot be empty');
        }
        this.config.channelName = name.trim();
        this.saveConfig();
    }

    /**
     * Get Pusher configuration
     * @returns {Object} Pusher config object
     */
    getPusherConfig() {
        return {
            appId: '2071709',
            key: '623081937d708e9520c1',
            secret: '4093958f84d53ef4cbf3',
            cluster: 'ap1'
        };
    }

    /**
     * Get Ably configuration
     * @returns {Object} Ably config object
     */
    getAblyConfig() {
        return {
            apiKey: '9shR5A.xvkDJA:vM1osbX-TP_GLf2YDSc1idGvHfQn4cRNTo0KCYEUgGY'
        };
    }

    /**
     * Save configuration to LocalStorage
     */
    saveConfig() {
        try {
            localStorage.setItem(this.CONFIG_KEY, JSON.stringify(this.config));
        } catch (error) {
            console.error('Failed to save config:', error);
            throw new Error('Failed to save configuration');
        }
    }

    /**
     * Load configuration from LocalStorage
     * @returns {Object} Configuration object
     */
    loadConfig() {
        try {
            const configStr = localStorage.getItem(this.CONFIG_KEY);
            if (configStr) {
                return JSON.parse(configStr);
            }
        } catch (error) {
            console.error('Failed to load config:', error);
        }
        
        // Return default config if none exists
        return {
            deviceName: '',
            brokerType: 'ably',
            channelName: ''
        };
    }

    /**
     * Check if the application is configured
     * @returns {boolean} True if configured, false otherwise
     */
    isConfigured() {
        return !!(this.config.deviceName && this.config.channelName);
    }

    /**
     * Generate a random channel name
     * @returns {string} Random UUID-like channel name
     */
    generateChannelName() {
        return 'channel-' + this._generateUUID();
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
