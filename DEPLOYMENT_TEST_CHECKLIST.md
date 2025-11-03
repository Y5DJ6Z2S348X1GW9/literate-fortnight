# Deployment Test Checklist

Quick reference for testing GitHub Pages deployment. Print this or keep it handy during testing.

## 🚀 Quick Start

1. Open application in browser
2. Open DevTools (F12)
3. Run verification script (see below)
4. Check all items in checklist

---

## ✅ Test Checklist

### Local Development (localhost)

- [ ] Application loads at `http://localhost:8080/`
- [ ] Console shows: `[PathConfig] Detected base path: (empty/root)`
- [ ] Base path is empty: `pathConfig.getConfig().basePath === ""`
- [ ] Service worker registered: Check Application → Service Workers
- [ ] All assets load (no 404 errors in Network tab)
- [ ] Manifest valid: Check Application → Manifest
- [ ] Notifications work when window unfocused

### GitHub Pages Subdirectory

- [ ] Application loads at `https://username.github.io/repo-name/`
- [ ] Console shows: `[PathConfig] Detected base path: /repo-name`
- [ ] Base path correct: `pathConfig.getConfig().basePath === "/repo-name"`
- [ ] Service worker registered with correct scope
- [ ] All assets load with base path prefix (no 404 errors)
- [ ] PWA installs successfully
- [ ] Notifications show correct icon paths
- [ ] Offline mode works (Network → Offline)

### Service Worker

- [ ] Status: "activated and running"
- [ ] Scope matches deployment URL
- [ ] No registration errors in console
- [ ] Cache created: Check Application → Cache Storage
- [ ] Cached resources include base path
- [ ] Offline functionality works

### PWA Installation

- [ ] Install icon appears in address bar
- [ ] Installation completes without errors
- [ ] App opens in standalone window
- [ ] App icon displays correctly
- [ ] All features work in installed app

### Notifications

- [ ] Permission granted
- [ ] Notification appears when window unfocused
- [ ] Notification icon loads correctly
- [ ] Notification content is accurate
- [ ] Clicking notification focuses app

### Assets

- [ ] `index.html` - Status 200
- [ ] `manifest.json` - Status 200
- [ ] `service-worker.js` - Status 200
- [ ] `js/app.js` - Status 200
- [ ] `js/config/PathConfig.js` - Status 200
- [ ] `styles/main.css` - Status 200
- [ ] `icons/icon.svg` - Status 200
- [ ] All other JS modules - Status 200
- [ ] **Zero 404 errors**

---

## 🔍 Quick Verification Commands

Run these in browser console:

```javascript
// 1. Check path configuration
console.log(pathConfig.getConfig());
// Expected: { basePath: "/repo-name" or "", isAutoDetected: true, isValid: true }

// 2. Check service worker
navigator.serviceWorker.getRegistration().then(reg => {
    console.log('SW Registered:', !!reg);
    console.log('SW Scope:', reg?.scope);
    console.log('SW Active:', reg?.active?.state);
});

// 3. Check path resolution
console.log('SW Path:', pathConfig.resolvePath('service-worker.js'));
console.log('Icon Path:', pathConfig.resolveAssetPath('icons/icon.svg'));
console.log('Manifest Path:', pathConfig.resolvePath('manifest.json'));

// 4. Test icon loading
const img = new Image();
img.onload = () => console.log('✅ Icon loaded');
img.onerror = () => console.error('❌ Icon failed');
img.src = pathConfig.resolveAssetPath('icons/icon.svg');

// 5. Check notification support
console.log('Notifications:', 'Notification' in window ? '✅ Supported' : '❌ Not supported');
console.log('Permission:', Notification.permission);
```

---

## 🤖 Automated Verification Script

Copy and paste this into browser console:

```javascript
async function verifyDeployment() {
    console.log('🔍 Deployment Verification\n');
    let passed = 0, failed = 0;
    
    const test = (name, condition, details = '') => {
        if (condition) {
            console.log(`✅ ${name}`);
            passed++;
        } else {
            console.error(`❌ ${name}`, details);
            failed++;
        }
    };
    
    test('PathConfig loaded', typeof pathConfig !== 'undefined');
    
    const config = pathConfig?.getConfig();
    test('Base path valid', config?.isValid, config);
    
    const swReg = await navigator.serviceWorker.getRegistration();
    test('Service worker registered', !!swReg, swReg?.scope);
    test('Service worker active', swReg?.active?.state === 'activated');
    
    test('Manifest link present', !!document.querySelector('link[rel="manifest"]'));
    test('Icon path resolves', !!pathConfig?.resolveAssetPath('icons/icon.svg'));
    test('Notifications supported', 'Notification' in window);
    
    const isSecure = location.protocol === 'https:' || location.hostname === 'localhost';
    test('Secure context', isSecure, location.protocol);
    
    console.log(`\n📊 Results: ${passed}/${passed + failed} passed (${((passed / (passed + failed)) * 100).toFixed(1)}%)`);
    
    if (failed === 0) {
        console.log('🎉 All tests passed!');
    } else {
        console.log('⚠️ Some tests failed. Check details above.');
    }
}

await verifyDeployment();
```

---

## 🐛 Common Issues

### Service Worker Not Registering
- Check: `console.log(pathConfig.resolvePath('service-worker.js'))`
- Verify: File exists in root directory
- Ensure: HTTPS enabled (except localhost)

### 404 Errors
- Check: Network tab for failed requests
- Verify: Base path in URLs matches deployment
- Fix: Use manual config if auto-detection fails

### PWA Not Installing
- Check: Application → Manifest for errors
- Verify: Service worker is active
- Ensure: HTTPS enabled
- Confirm: At least one icon ≥192x192

### Notifications Not Working
- Check: Permission granted
- Verify: Service worker registered
- Test: Window must be unfocused
- Check: Icon path with `pathConfig.resolveAssetPath('icons/icon.svg')`

---

## 📝 Manual Configuration (if needed)

Create `config.js` in root directory:

```javascript
window.APP_CONFIG = {
    basePath: '/repo-name'  // Your base path
};
```

Load before app.js in `index.html`:

```html
<script src="config.js"></script>
<script type="module" src="js/app.js"></script>
```

---

## 📚 Full Documentation

- **[DEPLOYMENT_TESTING.md](DEPLOYMENT_TESTING.md)** - Complete testing guide
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deployment instructions
- **[README.md](README.md)** - General documentation

---

## ✨ Success Criteria

All tests pass when:
- ✅ No 404 errors in Network tab
- ✅ Service worker registered and active
- ✅ Base path detected correctly
- ✅ PWA installs successfully
- ✅ Notifications work with correct icons
- ✅ All assets load with correct paths
- ✅ Offline functionality works

---

**Last Updated:** 2024
**Version:** 1.0
