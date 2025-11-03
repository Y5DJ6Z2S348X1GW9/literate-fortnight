// Main application entry point
import { ConfigManager } from './config/ConfigManager.js';
import { ConfigWizard } from './ui/ConfigWizard.js';
import { StorageManager } from './storage/StorageManager.js';
import { BrokerFactory } from './brokers/BrokerFactory.js';
import { MessageManager } from './messaging/MessageManager.js';
import { ConnectionManager } from './messaging/ConnectionManager.js';
import { UIController } from './ui/UIController.js';

// Global references for broker switching
let connectionManager = null;
let messageManager = null;

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    console.log('Application starting...');
    
    // Initialize configuration manager
    const configManager = new ConfigManager();
    
    // Initialize configuration wizard
    const configWizard = new ConfigWizard(configManager);
    
    // Check if configuration is needed
    if (configWizard.checkAndShow()) {
        console.log('Configuration wizard shown');
        
        // Wait for configuration to complete before initializing other modules
        window.addEventListener('config-complete', () => {
            console.log('Configuration complete, initializing app...');
            initializeApp(configManager);
        }, { once: true });
    } else {
        console.log('Configuration exists, initializing app...');
        initializeApp(configManager);
    }
});

/**
 * Initialize the main application
 * @param {ConfigManager} configManager - Configuration manager instance
 */
async function initializeApp(configManager) {
    try {
        // Initialize storage manager
        const storageManager = new StorageManager();
        
        // Create initial broker instance
        const broker = BrokerFactory.create(configManager);
        
        // Initialize message manager (without subscribing yet)
        messageManager = new MessageManager(broker, storageManager);
        
        // Initialize UI controller
        const uiController = new UIController(messageManager, configManager);
        
        // Initialize UI (service worker, notifications, etc.)
        await uiController.initialize();
        
        // Set up message confirmation callbacks
        uiController.setupMessageConfirmation();
        
        // Load and display message history (Task 9.1)
        const messageHistory = messageManager.getMessageHistory(100);
        uiController.loadMessageHistory(messageHistory);
        console.log(`Loaded ${messageHistory.length} messages from history`);
        
        // Initialize connection manager with auto-connect
        connectionManager = new ConnectionManager(broker, configManager, uiController);
        
        // Automatically connect on startup (Task 6.1)
        console.log('Auto-connecting to message broker...');
        await connectionManager.connect();
        
        // Set up message subscription AFTER connection is established
        console.log('Setting up message subscription...');
        messageManager.setupMessageSubscription();
        
        // Listen for broker change events (from settings panel)
        window.addEventListener('broker-changed', async (event) => {
            console.log('Broker changed to:', event.detail.brokerType);
            
            try {
                // Create new broker instance
                const newBroker = BrokerFactory.create(configManager);
                
                // Create new message manager with new broker
                messageManager = new MessageManager(newBroker, storageManager);
                
                // Update UI controller with new message manager
                uiController.messageManager = messageManager;
                uiController.setupMessageConfirmation();
                
                // Switch connection manager to new broker (this will connect)
                await connectionManager.switchBroker(newBroker);
                
                // Set up message subscription AFTER connection is established
                console.log('Setting up message subscription after broker switch...');
                messageManager.setupMessageSubscription();
                
                uiController.showSuccessMessage('已切换到 ' + event.detail.brokerType.toUpperCase());
            } catch (error) {
                console.error('Failed to switch broker:', error);
                uiController.showErrorMessage('切换服务失败: ' + error.message);
            }
        });
        
        console.log('Application initialized with config:', {
            deviceName: configManager.getDeviceName(),
            brokerType: configManager.getBrokerType(),
            channelName: configManager.getChannelName()
        });
    } catch (error) {
        console.error('Failed to initialize application:', error);
        alert('应用初始化失败: ' + error.message);
    }
}
