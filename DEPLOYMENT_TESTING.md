# Deployment Testing Guide

This guide provides step-by-step instructions for testing the GitHub Pages deployment functionality of the Cross-Device Messaging Application.

## Overview

This testing guide covers all deployment scenarios to ensure the application works correctly with the PathConfig module across different environments.

## Prerequisites

- Git installed
- GitHub account
- Modern web browser (Chrome, Edge, Firefox, or Safari)
- Local web server (Python, Node.js, or similar)

## Test Scenarios

### 1. Local Development Server Testing

#### Setup

1. **Start a local web server:**

   ```bash
   # Option 1: Python 3
   python -m http.server 8080
   
   # Option 2: Node.js http-server
   npx http-server -p 8080
   
   # Option 3: PHP
   php -S localhost:8080
   ```

2. **Open the application:**
   - Navigate to: `http://localhost:8080/`

#### Verification Steps

1. **Check Path Detection:**
   - Open browser DevTools (F12)
   - Go to Console tab
   - Look for: `[PathConfig] Detected base path: (empty/root)`
   - Run: `console.log(pathConfig.getConfig())`
   - Expected output:
     ```javascript
     {
       basePath: "",
       isAutoDetected: true,
       detectionMethod: "script-src",
       isValid: true
     }
     ```

2. **Verify Service Worker Registration:**
   - In DevTools, go to: Application → Service Workers
   - Should show: `service-worker.js` with status "activated and running"
   - Check Console for: `[NotificationManager] Service worker registered successfully`

3. **Check Asset Loading:**
   - Go to: Network tab in DevTools
   - Reload the page (Ctrl+R or Cmd+R)
   - Verify all resources load successfully (no 404 errors):
     - ✅ `index.html` (200)
     - ✅ `manifest.json` (200)
     - ✅ `service-worker.js` (200)
     - ✅ `js/app.js` (200)
     - ✅ `js/config/PathConfig.js` (200)
     - ✅ `styles/main.css` (200)
     - ✅ `icons/icon.svg` (200)

4. **Test PWA Manifest:**
   - In DevTools, go to: Application → Manifest
   - Verify all fields are populated:
     - Name: "Cross-Device Messaging"
     - Start URL: "./"
     - Icons: Should show icon.svg
   - No errors or warnings should appear

5. **Test Notification Functionality:**
   - Click "Allow" when prompted for notification permission
   - Open two browser windows/tabs
   - Configure both with the same channel name
   - Send a message from one window
   - Minimize the receiving window
   - Verify desktop notification appears

6. **Test Path Resolution:**
   - In Console, run:
     ```javascript
     console.log('Service Worker:', pathConfig.resolvePath('service-worker.js'));
     console.log('Icon:', pathConfig.resolveAssetPath('icons/icon.svg'));
     console.log('Manifest:', pathConfig.resolvePath('manifest.json'));
     ```
   - Expected output:
     ```
     Service Worker: /service-worker.js
     Icon: /icons/icon.svg
     Manifest: /manifest.json
     ```

#### Expected Results

- ✅ Base path detected as empty/root
- ✅ Service worker registered successfully
- ✅ All assets load without errors
- ✅ PWA manifest valid
- ✅ Notifications work correctly
- ✅ No 404 errors in Network tab

---

### 2. GitHub Pages Subdirectory Deployment

#### Setup

1. **Create a test repository:**
   ```bash
   # Create a new repository on GitHub (e.g., "messaging-app-test")
   git init
   git add .
   git commit -m "Initial commit for GitHub Pages testing"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/messaging-app-test.git
   git push -u origin main
   ```

2. **Enable GitHub Pages:**
   - Go to repository Settings → Pages
   - Source: "Deploy from a branch"
   - Branch: `main`
   - Folder: `/ (root)`
   - Click "Save"
   - Wait 1-2 minutes for deployment

3. **Access the deployed application:**
   - URL: `https://YOUR_USERNAME.github.io/messaging-app-test/`

#### Verification Steps

1. **Check Path Detection:**
   - Open browser DevTools (F12)
   - Go to Console tab
   - Look for: `[PathConfig] Detected base path from script source: /messaging-app-test`
   - Run: `console.log(pathConfig.getConfig())`
   - Expected output:
     ```javascript
     {
       basePath: "/messaging-app-test",
       isAutoDetected: true,
       detectionMethod: "script-src",
       isValid: true
     }
     ```

2. **Verify Service Worker Registration:**
   - In DevTools, go to: Application → Service Workers
   - Should show: `https://YOUR_USERNAME.github.io/messaging-app-test/service-worker.js`
   - Status: "activated and running"
   - Scope: `https://YOUR_USERNAME.github.io/messaging-app-test/`
   - Check Console for: `[NotificationManager] Service worker registered successfully`

3. **Check Asset Loading:**
   - Go to: Network tab in DevTools
   - Reload the page (Ctrl+R or Cmd+R)
   - Verify all resources load with correct paths:
     - ✅ `https://YOUR_USERNAME.github.io/messaging-app-test/index.html` (200)
     - ✅ `https://YOUR_USERNAME.github.io/messaging-app-test/manifest.json` (200)
     - ✅ `https://YOUR_USERNAME.github.io/messaging-app-test/service-worker.js` (200)
     - ✅ `https://YOUR_USERNAME.github.io/messaging-app-test/js/app.js` (200)
     - ✅ `https://YOUR_USERNAME.github.io/messaging-app-test/icons/icon.svg` (200)
   - **No 404 errors should appear**

4. **Test PWA Installation:**
   - Look for install icon in browser address bar (Chrome/Edge)
   - Click the install icon
   - Click "Install" in the dialog
   - Verify app installs successfully
   - Open the installed app
   - Verify it works correctly

5. **Test Notification Functionality:**
   - Grant notification permission when prompted
   - Open two browser tabs with the deployed URL
   - Configure both with the same channel name
   - Send a message from one tab
   - Minimize/unfocus the receiving tab
   - Verify desktop notification appears with correct icon

6. **Test Path Resolution:**
   - In Console, run:
     ```javascript
     console.log('Service Worker:', pathConfig.resolvePath('service-worker.js'));
     console.log('Icon:', pathConfig.resolveAssetPath('icons/icon.svg'));
     console.log('Manifest:', pathConfig.resolvePath('manifest.json'));
     ```
   - Expected output:
     ```
     Service Worker: /messaging-app-test/service-worker.js
     Icon: /messaging-app-test/icons/icon.svg
     Manifest: /messaging-app-test/manifest.json
     ```

7. **Test Service Worker Cache:**
   - In DevTools, go to: Application → Cache Storage
   - Should see cache: `messaging-app-v1`
   - Expand cache and verify cached resources:
     - `https://YOUR_USERNAME.github.io/messaging-app-test/`
     - `https://YOUR_USERNAME.github.io/messaging-app-test/index.html`
     - `https://YOUR_USERNAME.github.io/messaging-app-test/styles/main.css`
     - All other cached resources with correct base path

8. **Test Offline Functionality:**
   - With the app loaded, go to: Network tab → Throttling → Offline
   - Reload the page
   - Verify the app still loads from cache
   - Check Console for: `[Service Worker] Serving from cache`

#### Expected Results

- ✅ Base path detected as `/messaging-app-test`
- ✅ Service worker registered with correct scope
- ✅ All assets load with correct base path
- ✅ No 404 errors in Network tab
- ✅ PWA installs successfully
- ✅ Notifications work with correct icon paths
- ✅ Service worker caches resources correctly
- ✅ Offline functionality works

---

### 3. Service Worker Registration Verification

#### Test in Browser DevTools

1. **Open Application Tab:**
   - DevTools (F12) → Application

2. **Check Service Workers:**
   - Navigate to: Service Workers section
   - Verify:
     - ✅ Source: Correct path with base path
     - ✅ Status: "activated and running"
     - ✅ Scope: Matches deployment path
     - ✅ No errors in status

3. **Check Registration Details:**
   - In Console, run:
     ```javascript
     navigator.serviceWorker.getRegistration().then(reg => {
       console.log('Registration:', reg);
       console.log('Scope:', reg.scope);
       console.log('Active:', reg.active);
       console.log('Installing:', reg.installing);
       console.log('Waiting:', reg.waiting);
     });
     ```
   - Expected output:
     - Scope matches deployment URL
     - Active worker present
     - No installing or waiting workers (unless updating)

4. **Test Service Worker Updates:**
   - Make a small change to `service-worker.js` (e.g., update version)
   - Deploy the change
   - Reload the page
   - In Application → Service Workers:
     - Should see "waiting to activate"
     - Click "skipWaiting" or close all tabs and reopen
     - Verify new version activates

5. **Check Service Worker Console:**
   - In Application → Service Workers
   - Click on the service worker source link
   - Opens service worker console
   - Check for any errors or warnings
   - Verify install and activate events fired

#### Expected Results

- ✅ Service worker registered successfully
- ✅ Correct scope set
- ✅ Active worker present
- ✅ No registration errors
- ✅ Updates work correctly

---

### 4. PWA Installation Testing

#### Desktop Installation (Chrome/Edge)

1. **Check Installation Criteria:**
   - In DevTools, go to: Application → Manifest
   - Verify no errors or warnings
   - Check: Console → Lighthouse → PWA
   - Should pass PWA installability checks

2. **Install the App:**
   - Look for install icon in address bar (⊕ or install icon)
   - Click the icon
   - Click "Install" in the dialog
   - Wait for installation to complete

3. **Verify Installation:**
   - App should open in standalone window
   - Check window title matches app name
   - Verify app icon appears in taskbar/dock
   - Check: chrome://apps (Chrome) or edge://apps (Edge)
   - App should be listed

4. **Test Installed App:**
   - Close and reopen the installed app
   - Verify all functionality works
   - Test messaging between installed app and browser tab
   - Verify notifications work from installed app

#### Mobile Installation (iOS/Android)

1. **iOS (Safari):**
   - Open the deployed URL in Safari
   - Tap Share button
   - Tap "Add to Home Screen"
   - Verify app icon appears on home screen
   - Open app from home screen
   - Verify it opens in standalone mode

2. **Android (Chrome):**
   - Open the deployed URL in Chrome
   - Tap menu (⋮)
   - Tap "Install app" or "Add to Home Screen"
   - Verify app icon appears on home screen
   - Open app from home screen
   - Verify it opens in standalone mode

#### Expected Results

- ✅ PWA installability criteria met
- ✅ Install prompt appears
- ✅ Installation completes successfully
- ✅ App opens in standalone window
- ✅ App icon appears correctly
- ✅ All functionality works in installed app

---

### 5. Notification Functionality Testing

#### Setup

1. **Grant Permissions:**
   - Open the application
   - Click "Allow" when prompted for notification permission
   - Or manually enable in browser settings

2. **Configure Two Devices/Windows:**
   - Window A: Device name "Test Device A"
   - Window B: Device name "Test Device B"
   - Both use the same channel name

#### Test Cases

1. **Basic Notification:**
   - Focus on Window A
   - Minimize or unfocus Window B
   - Send message from Window A: "Test notification"
   - Verify:
     - ✅ Desktop notification appears
     - ✅ Notification shows correct title: "Message from Test Device A"
     - ✅ Notification shows message body: "Test notification"
     - ✅ Notification icon loads correctly

2. **Notification Icon Path:**
   - In Console, run:
     ```javascript
     console.log('Notification icon:', pathConfig.resolveAssetPath('icons/icon.svg'));
     ```
   - Verify path includes base path (if deployed to subdirectory)
   - Check notification actually displays the icon

3. **Notification Click:**
   - Send a message to trigger notification
   - Click on the notification
   - Verify:
     - ✅ Application window focuses/opens
     - ✅ Message is visible in the chat

4. **Multiple Notifications:**
   - Send 3 messages quickly
   - Verify all notifications appear
   - Check they don't overlap or cause errors

5. **Notification Permissions:**
   - Test with permission denied:
     - Block notifications in browser settings
     - Send a message
     - Verify app handles gracefully (no errors)
     - Message still appears in chat

#### Expected Results

- ✅ Notifications appear when window unfocused
- ✅ Notification icons load with correct path
- ✅ Notification content is correct
- ✅ Clicking notification focuses app
- ✅ Multiple notifications work
- ✅ Graceful handling when permissions denied

---

### 6. Asset Loading Verification

#### Complete Asset Check

1. **Open Network Tab:**
   - DevTools (F12) → Network
   - Check "Disable cache"
   - Reload page (Ctrl+Shift+R or Cmd+Shift+R)

2. **Verify All Resources Load:**

   **HTML:**
   - ✅ `index.html` - Status: 200

   **JavaScript:**
   - ✅ `js/app.js` - Status: 200
   - ✅ `js/config/PathConfig.js` - Status: 200
   - ✅ `js/config/ConfigManager.js` - Status: 200
   - ✅ `js/storage/StorageManager.js` - Status: 200
   - ✅ `js/messaging/ConnectionManager.js` - Status: 200
   - ✅ `js/messaging/MessageManager.js` - Status: 200
   - ✅ `js/brokers/PusherBroker.js` - Status: 200
   - ✅ `js/brokers/AblyBroker.js` - Status: 200
   - ✅ `js/ui/UIController.js` - Status: 200
   - ✅ `js/ui/ConfigWizard.js` - Status: 200
   - ✅ `js/ui/NotificationManager.js` - Status: 200

   **CSS:**
   - ✅ `styles/main.css` - Status: 200

   **PWA Files:**
   - ✅ `manifest.json` - Status: 200
   - ✅ `service-worker.js` - Status: 200

   **Icons:**
   - ✅ `icons/icon.svg` - Status: 200

3. **Check for 404 Errors:**
   - Filter Network tab by "Status: 404"
   - Should show: "No requests found"
   - If any 404s appear, investigate:
     - Check the requested URL
     - Verify file exists in deployment
     - Check path resolution

4. **Verify Path Prefixes:**
   - For subdirectory deployment, all URLs should include base path
   - Example for `/messaging-app-test/`:
     - ✅ `https://user.github.io/messaging-app-test/js/app.js`
     - ❌ `https://user.github.io/js/app.js` (missing base path)

5. **Check Manifest.json Content:**
   - In Network tab, click on `manifest.json`
   - Go to Response tab
   - Verify all paths are relative:
     ```json
     {
       "start_url": "./",
       "scope": "./",
       "icons": [
         { "src": "icons/icon.svg" }
       ]
     }
     ```
   - No absolute paths (no leading `/`)

6. **Test Icon Loading:**
   - In Console, run:
     ```javascript
     const img = new Image();
     img.onload = () => console.log('✅ Icon loaded successfully');
     img.onerror = () => console.error('❌ Icon failed to load');
     img.src = pathConfig.resolveAssetPath('icons/icon.svg');
     ```
   - Should see: "✅ Icon loaded successfully"

#### Expected Results

- ✅ All resources return status 200
- ✅ No 404 errors
- ✅ All paths include correct base path
- ✅ Manifest.json uses relative paths
- ✅ Icons load successfully

---

## Comprehensive Test Checklist

### Local Development
- [ ] Base path detected as empty/root
- [ ] Service worker registers successfully
- [ ] All assets load without 404 errors
- [ ] PWA manifest is valid
- [ ] Notifications work correctly
- [ ] Path resolution utilities work
- [ ] Application functions normally

### GitHub Pages Subdirectory
- [ ] Base path detected correctly (e.g., `/repo-name`)
- [ ] Service worker registers with correct scope
- [ ] All assets load with base path prefix
- [ ] No 404 errors in Network tab
- [ ] PWA installs successfully
- [ ] Notifications show correct icon paths
- [ ] Service worker caches resources correctly
- [ ] Offline functionality works
- [ ] Messaging works between devices
- [ ] Configuration persists correctly

### Service Worker
- [ ] Registers successfully in all environments
- [ ] Correct scope set based on deployment
- [ ] Active worker present
- [ ] No registration errors
- [ ] Cache strategy works
- [ ] Offline functionality works
- [ ] Updates apply correctly

### PWA Installation
- [ ] Installability criteria met
- [ ] Install prompt appears
- [ ] Installation completes successfully
- [ ] App opens in standalone mode
- [ ] App icon displays correctly
- [ ] All features work in installed app

### Notifications
- [ ] Notifications appear when window unfocused
- [ ] Notification icons load correctly
- [ ] Notification content is accurate
- [ ] Clicking notification focuses app
- [ ] Multiple notifications work
- [ ] Graceful handling of denied permissions

### Assets
- [ ] All JavaScript files load (200 status)
- [ ] All CSS files load (200 status)
- [ ] All icons load (200 status)
- [ ] Manifest.json loads (200 status)
- [ ] Service worker loads (200 status)
- [ ] No 404 errors
- [ ] Paths include correct base path

---

## Troubleshooting

### Service Worker Not Registering

**Check:**
1. Console for error messages
2. Base path detection: `console.log(pathConfig.getConfig())`
3. Service worker URL: `console.log(pathConfig.resolvePath('service-worker.js'))`
4. HTTPS enabled (required except localhost)

**Fix:**
- Verify `service-worker.js` exists in root directory
- Check file permissions
- Ensure HTTPS is enabled
- Try manual configuration if auto-detection fails

### 404 Errors for Assets

**Check:**
1. Network tab for failed requests
2. Requested URL vs actual file location
3. Base path in URLs

**Fix:**
- Verify all files deployed correctly
- Check file names (case-sensitive)
- Verify base path detection
- Use manual configuration if needed

### PWA Not Installing

**Check:**
1. Application → Manifest for errors
2. Service worker status
3. HTTPS enabled
4. All PWA criteria met

**Fix:**
- Fix manifest.json errors
- Ensure service worker registered
- Enable HTTPS
- Add required icons (192x192 minimum)

### Notifications Not Working

**Check:**
1. Notification permissions granted
2. Service worker registered
3. Icon paths correct
4. Window unfocused when testing

**Fix:**
- Grant notification permissions
- Fix service worker registration
- Verify icon paths with `pathConfig.resolveAssetPath()`
- Ensure window is unfocused/minimized

---

## Test Results Documentation

### Test Environment

- **Date:** [Date of testing]
- **Browser:** [Browser name and version]
- **OS:** [Operating system]
- **Deployment URL:** [URL where tested]

### Test Results

| Test Scenario | Status | Notes |
|--------------|--------|-------|
| Local Development | ✅ Pass / ❌ Fail | |
| GitHub Pages Subdirectory | ✅ Pass / ❌ Fail | |
| Service Worker Registration | ✅ Pass / ❌ Fail | |
| PWA Installation | ✅ Pass / ❌ Fail | |
| Notifications | ✅ Pass / ❌ Fail | |
| Asset Loading | ✅ Pass / ❌ Fail | |

### Issues Found

1. **Issue:** [Description]
   - **Severity:** High / Medium / Low
   - **Steps to Reproduce:** [Steps]
   - **Expected:** [Expected behavior]
   - **Actual:** [Actual behavior]
   - **Fix:** [How it was fixed]

---

## Automated Testing Script

Run this script in the browser console to quickly verify deployment:

```javascript
// Deployment Verification Script
async function verifyDeployment() {
    console.log('🔍 Starting Deployment Verification...\n');
    
    const results = {
        passed: 0,
        failed: 0,
        tests: []
    };
    
    function test(name, condition, details = '') {
        const passed = condition;
        results.tests.push({ name, passed, details });
        if (passed) {
            console.log(`✅ ${name}`);
            results.passed++;
        } else {
            console.error(`❌ ${name}`, details);
            results.failed++;
        }
    }
    
    // Test 1: PathConfig loaded
    test('PathConfig module loaded', typeof pathConfig !== 'undefined');
    
    // Test 2: Base path detected
    const config = pathConfig?.getConfig();
    test('Base path detected', config && config.isValid, config);
    
    // Test 3: Service worker registered
    const swReg = await navigator.serviceWorker.getRegistration();
    test('Service worker registered', !!swReg, swReg?.scope);
    
    // Test 4: Service worker active
    test('Service worker active', swReg?.active?.state === 'activated');
    
    // Test 5: Manifest accessible
    const manifestLink = document.querySelector('link[rel="manifest"]');
    test('Manifest link present', !!manifestLink);
    
    // Test 6: Icon path resolution
    const iconPath = pathConfig?.resolveAssetPath('icons/icon.svg');
    test('Icon path resolves', !!iconPath, iconPath);
    
    // Test 7: Notification support
    test('Notifications supported', 'Notification' in window);
    
    // Test 8: Service worker path resolution
    const swPath = pathConfig?.resolvePath('service-worker.js');
    test('Service worker path resolves', !!swPath, swPath);
    
    // Test 9: HTTPS (except localhost)
    const isSecure = location.protocol === 'https:' || location.hostname === 'localhost';
    test('Secure context', isSecure, location.protocol);
    
    // Test 10: No console errors (check manually)
    console.log('\n📊 Test Summary:');
    console.log(`Total: ${results.tests.length}`);
    console.log(`Passed: ${results.passed} ✅`);
    console.log(`Failed: ${results.failed} ❌`);
    console.log(`Success Rate: ${((results.passed / results.tests.length) * 100).toFixed(1)}%`);
    
    if (results.failed === 0) {
        console.log('\n🎉 All tests passed! Deployment verified successfully.');
    } else {
        console.log('\n⚠️ Some tests failed. Check details above.');
    }
    
    return results;
}

// Run verification
await verifyDeployment();
```

---

## Additional Resources

- [DEPLOYMENT.md](DEPLOYMENT.md) - Detailed deployment guide
- [README.md](README.md) - General documentation
- [PathConfig.js](js/config/PathConfig.js) - Path configuration implementation
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [PWA Installation Criteria](https://web.dev/install-criteria/)

---

## Conclusion

This testing guide ensures the application works correctly across all deployment scenarios. Follow each test scenario systematically and document any issues found. The automated verification script provides a quick way to check deployment health.

For any issues not covered in this guide, refer to the troubleshooting section in [DEPLOYMENT.md](DEPLOYMENT.md) or check the browser console for detailed error messages.
