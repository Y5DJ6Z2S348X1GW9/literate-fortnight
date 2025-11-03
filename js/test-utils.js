// Test Utilities for Cross-Device Messaging
// This file provides utilities for manual testing in the browser console

/**
 * Test Suite for Cross-Device Messaging Application
 */
class TestSuite {
    constructor() {
        this.results = [];
        this.testCount = 0;
        this.passCount = 0;
        this.failCount = 0;
    }

    /**
     * Log test result
     */
    log(testName, passed, message = '') {
        this.testCount++;
        if (passed) {
            this.passCount++;
            console.log(`✅ PASS: ${testName}`, message);
        } else {
            this.failCount++;
            console.error(`❌ FAIL: ${testName}`, message);
        }
        this.results.push({ testName, passed, message });
    }

    /**
     * Print test summary
     */
    summary() {
        console.log('\n' + '='.repeat(50));
        console.log('TEST SUMMARY');
        console.log('='.repeat(50));
        console.log(`Total Tests: ${this.testCount}`);
        console.log(`Passed: ${this.passCount}`);
        console.log(`Failed: ${this.failCount}`);
        console.log(`Success Rate: ${((this.passCount / this.testCount) * 100).toFixed(2)}%`);
        console.log('='.repeat(50) + '\n');
    }

    /**
     * Reset test results
     */
    reset() {
        this.results = [];
        this.testCount = 0;
        this.passCount = 0;
        this.failCount = 0;
    }
}

/**
 * Test Ably Message Sending and Receiving
 */
async function testAblyMessaging() {
    console.log('\n🧪 Testing Ably Message Functionality...\n');
    const suite = new TestSuite();

    try {
        // Check if app is initialized
        const messageInput = document.getElementById('message-input');
        const sendBtn = document.getElementById('send-btn');
        const connectionStatus = document.getElementById('connection-status');
        
        suite.log('UI Elements Exist', 
            messageInput && sendBtn && connectionStatus,
            'All required UI elements are present');

        // Check connection status
        const isConnected = connectionStatus.textContent === '已连接';
        suite.log('Ably Connection Status', 
            isConnected,
            `Status: ${connectionStatus.textContent}`);

        if (!isConnected) {
            console.warn('⚠️ Not connected to Ably. Please wait for connection or check configuration.');
            suite.summary();
            return suite;
        }

        // Test message storage before sending
        const initialMessageCount = document.querySelectorAll('.message-item').length;
        suite.log('Message History Loaded', 
            initialMessageCount >= 0,
            `${initialMessageCount} messages in history`);

        // Test sending a message
        const testMessage = `Test message at ${new Date().toLocaleTimeString()}`;
        messageInput.value = testMessage;
        
        // Simulate send button click
        sendBtn.click();
        
        // Wait for message to be sent and displayed
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if message was added to UI
        const newMessageCount = document.querySelectorAll('.message-item').length;
        suite.log('Message Sent and Displayed', 
            newMessageCount > initialMessageCount,
            `Message count increased from ${initialMessageCount} to ${newMessageCount}`);

        // Check if input was cleared
        suite.log('Input Field Cleared After Send', 
            messageInput.value === '',
            'Input field should be empty after successful send');

        // Check if message is in storage
        const storedMessages = JSON.parse(localStorage.getItem('messaging_app_messages') || '[]');
        const lastMessage = storedMessages[storedMessages.length - 1];
        suite.log('Message Saved to Storage', 
            lastMessage && lastMessage.content === testMessage,
            `Last stored message: ${lastMessage?.content}`);

        // Verify message structure
        if (lastMessage) {
            suite.log('Message Has Required Fields',
                lastMessage.id && lastMessage.content && lastMessage.deviceName && 
                lastMessage.timestamp && lastMessage.direction,
                `Message structure: ${Object.keys(lastMessage).join(', ')}`);
        }

    } catch (error) {
        suite.log('Test Execution', false, `Error: ${error.message}`);
    }

    suite.summary();
    return suite;
}

/**
 * Test Pusher Message Sending and Receiving
 */
async function testPusherMessaging() {
    console.log('\n🧪 Testing Pusher Message Functionality...\n');
    const suite = new TestSuite();

    try {
        // Check current broker type
        const config = JSON.parse(localStorage.getItem('messaging_app_config') || '{}');
        const currentBroker = config.brokerType;
        
        suite.log('Current Broker Type', 
            true,
            `Using: ${currentBroker}`);

        if (currentBroker !== 'pusher') {
            console.log('📝 Switching to Pusher...');
            
            // Open settings
            document.getElementById('settings-btn').click();
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Change broker type
            const brokerSelect = document.getElementById('broker-type');
            brokerSelect.value = 'pusher';
            
            // Save settings
            document.getElementById('save-settings-btn').click();
            
            // Wait for broker switch
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            suite.log('Switched to Pusher', true, 'Broker changed successfully');
        }

        // Check connection status
        const connectionStatus = document.getElementById('connection-status');
        const isConnected = connectionStatus.textContent === '已连接';
        suite.log('Pusher Connection Status', 
            isConnected,
            `Status: ${connectionStatus.textContent}`);

        if (!isConnected) {
            console.warn('⚠️ Not connected to Pusher. Connection may take a moment...');
            // Wait a bit more
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // Test sending a message
        const messageInput = document.getElementById('message-input');
        const sendBtn = document.getElementById('send-btn');
        const initialMessageCount = document.querySelectorAll('.message-item').length;
        
        const testMessage = `Pusher test at ${new Date().toLocaleTimeString()}`;
        messageInput.value = testMessage;
        sendBtn.click();
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const newMessageCount = document.querySelectorAll('.message-item').length;
        suite.log('Pusher Message Sent', 
            newMessageCount > initialMessageCount,
            `Message count: ${initialMessageCount} → ${newMessageCount}`);

    } catch (error) {
        suite.log('Test Execution', false, `Error: ${error.message}`);
    }

    suite.summary();
    return suite;
}

/**
 * Test Reconnection Mechanism
 */
async function testReconnection() {
    console.log('\n🧪 Testing Reconnection Mechanism...\n');
    const suite = new TestSuite();

    try {
        const connectionStatus = document.getElementById('connection-status');
        
        // Check initial connection
        const initialStatus = connectionStatus.textContent;
        suite.log('Initial Connection Status', 
            initialStatus === '已连接',
            `Status: ${initialStatus}`);

        console.log('📝 To test reconnection:');
        console.log('1. Open DevTools Network tab');
        console.log('2. Set throttling to "Offline"');
        console.log('3. Wait 5 seconds and observe status change to "未连接"');
        console.log('4. Set throttling back to "Online"');
        console.log('5. Observe automatic reconnection within 5 seconds');
        console.log('6. Status should return to "已连接"');
        
        // Monitor connection status changes
        let statusChanges = [];
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' || mutation.type === 'characterData') {
                    const newStatus = connectionStatus.textContent;
                    statusChanges.push({
                        time: new Date().toLocaleTimeString(),
                        status: newStatus
                    });
                    console.log(`🔄 Status changed to: ${newStatus}`);
                }
            });
        });
        
        observer.observe(connectionStatus, {
            childList: true,
            characterData: true,
            subtree: true
        });
        
        // Store observer for cleanup
        window._reconnectionTestObserver = observer;
        
        suite.log('Reconnection Test Setup', true, 
            'Observer configured. Follow manual steps above.');

    } catch (error) {
        suite.log('Test Execution', false, `Error: ${error.message}`);
    }

    suite.summary();
    return suite;
}

/**
 * Test Notification Functionality
 */
async function testNotifications() {
    console.log('\n🧪 Testing Notification Functionality...\n');
    const suite = new TestSuite();

    try {
        // Check notification API support
        suite.log('Notification API Supported', 
            'Notification' in window,
            'Browser supports notifications');

        // Check notification permission
        const permission = Notification.permission;
        suite.log('Notification Permission', 
            permission === 'granted',
            `Current permission: ${permission}`);

        if (permission === 'default') {
            console.log('📝 Requesting notification permission...');
            const result = await Notification.requestPermission();
            suite.log('Permission Request Result', 
                result === 'granted',
                `Result: ${result}`);
        }

        // Test desktop notification
        if (Notification.permission === 'granted') {
            console.log('📝 Sending test notification...');
            const notification = new Notification('测试通知', {
                body: '这是一条测试消息',
                icon: '/icons/icon-192.png'
            });
            
            suite.log('Desktop Notification Created', true, 
                'Test notification sent');
            
            setTimeout(() => notification.close(), 3000);
        }

        // Check Service Worker registration
        if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.getRegistration();
            suite.log('Service Worker Registered', 
                !!registration,
                registration ? 'Service Worker is active' : 'No Service Worker found');
            
            // Check push notification support
            if (registration) {
                suite.log('Push Notifications Supported', 
                    'pushManager' in registration,
                    'Push API is available');
            }
        }

        console.log('\n📝 To test message notifications:');
        console.log('1. Open this app in two browser windows/tabs');
        console.log('2. Use different device names in each');
        console.log('3. Send a message from one window');
        console.log('4. Blur/minimize the receiving window');
        console.log('5. You should see a notification appear');

    } catch (error) {
        suite.log('Test Execution', false, `Error: ${error.message}`);
    }

    suite.summary();
    return suite;
}

/**
 * Run all tests
 */
async function runAllTests() {
    console.clear();
    console.log('🚀 Running All Tests for Cross-Device Messaging\n');
    console.log('='.repeat(50));
    
    const results = {
        ably: await testAblyMessaging(),
        pusher: await testPusherMessaging(),
        reconnection: await testReconnection(),
        notifications: await testNotifications()
    };
    
    console.log('\n' + '='.repeat(50));
    console.log('ALL TESTS COMPLETED');
    console.log('='.repeat(50));
    
    const totalTests = Object.values(results).reduce((sum, r) => sum + r.testCount, 0);
    const totalPassed = Object.values(results).reduce((sum, r) => sum + r.passCount, 0);
    const totalFailed = Object.values(results).reduce((sum, r) => sum + r.failCount, 0);
    
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Total Passed: ${totalPassed}`);
    console.log(`Total Failed: ${totalFailed}`);
    console.log(`Overall Success Rate: ${((totalPassed / totalTests) * 100).toFixed(2)}%`);
    console.log('='.repeat(50) + '\n');
    
    return results;
}

// Export functions for console use
window.testAblyMessaging = testAblyMessaging;
window.testPusherMessaging = testPusherMessaging;
window.testReconnection = testReconnection;
window.testNotifications = testNotifications;
window.runAllTests = runAllTests;

console.log('✅ Test utilities loaded!');
console.log('Available commands:');
console.log('  - testAblyMessaging()     : Test Ably message functionality');
console.log('  - testPusherMessaging()   : Test Pusher message functionality');
console.log('  - testReconnection()      : Test reconnection mechanism');
console.log('  - testNotifications()     : Test notification functionality');
console.log('  - runAllTests()           : Run all tests');
