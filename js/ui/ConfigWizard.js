// Configuration Wizard
// Handles the first-time setup wizard UI

export class ConfigWizard {
    constructor(configManager) {
        this.configManager = configManager;
        this.wizardElement = document.getElementById('config-wizard');
        this.mainAppElement = document.getElementById('main-app');
        this.deviceNameInput = document.getElementById('device-name');
        this.channelNameInput = document.getElementById('channel-name');
        this.saveButton = document.getElementById('save-config-btn');
        
        this.bindEvents();
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        this.saveButton.addEventListener('click', () => this.handleSaveConfig());
        
        // Allow Enter key to submit
        this.deviceNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSaveConfig();
            }
        });
        
        this.channelNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSaveConfig();
            }
        });
    }

    /**
     * Show the configuration wizard
     */
    show() {
        this.wizardElement.classList.remove('hidden');
        this.mainAppElement.classList.add('hidden');
        
        // Generate a default channel name
        const defaultChannel = this.configManager.generateChannelName();
        this.channelNameInput.placeholder = `留空自动生成 (${defaultChannel.substring(0, 20)}...)`;
        
        // Focus on device name input
        this.deviceNameInput.focus();
    }

    /**
     * Hide the configuration wizard
     */
    hide() {
        this.wizardElement.classList.add('hidden');
        this.mainAppElement.classList.remove('hidden');
    }

    /**
     * Handle save configuration button click
     */
    handleSaveConfig() {
        const deviceName = this.deviceNameInput.value.trim();
        let channelName = this.channelNameInput.value.trim();
        
        // Validate device name
        if (!deviceName) {
            this.showError('请输入设备名称');
            this.deviceNameInput.focus();
            return;
        }
        
        // Generate channel name if not provided
        if (!channelName) {
            channelName = this.configManager.generateChannelName();
        }
        
        // Validate channel name length
        if (channelName.length < 3) {
            this.showError('频道名称至少需要3个字符');
            this.channelNameInput.focus();
            return;
        }
        
        try {
            // Save configuration
            this.configManager.setDeviceName(deviceName);
            this.configManager.setChannelName(channelName);
            
            // Hide wizard and show main app
            this.hide();
            
            // Dispatch event to notify app that config is complete
            window.dispatchEvent(new CustomEvent('config-complete'));
            
        } catch (error) {
            this.showError('保存配置失败: ' + error.message);
        }
    }

    /**
     * Show error message
     * @param {string} message - Error message to display
     */
    showError(message) {
        // Create or update error message element
        let errorElement = this.wizardElement.querySelector('.error-message');
        
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            this.saveButton.parentElement.insertBefore(errorElement, this.saveButton);
        }
        
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        // Hide error after 3 seconds
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 3000);
    }

    /**
     * Check if configuration is needed and show wizard if necessary
     * @returns {boolean} True if wizard was shown, false otherwise
     */
    checkAndShow() {
        if (!this.configManager.isConfigured()) {
            this.show();
            return true;
        }
        return false;
    }
}
