# Cross-Device Messaging Application

A Progressive Web App (PWA) for sending messages and notifications across devices using real-time messaging brokers.

## Features

- Real-time cross-device messaging
- Push notifications support
- PWA installation capability
- Offline functionality with service workers
- Support for multiple messaging brokers (Pusher, Ably)

## Deployment

This application supports deployment to various environments including local development, root domains, and GitHub Pages subdirectories.

### Auto-Detection Behavior

The application automatically detects its deployment path using the `PathConfig` module. No configuration is required for most deployment scenarios.

**Detection Strategy:**

1. **Manual Configuration** (highest priority): Checks for `window.APP_CONFIG.basePath`
2. **Script Source Detection**: Analyzes the script tag's `src` attribute to extract the base path
3. **Location Detection**: Falls back to parsing `window.location.pathname`
4. **Default**: Uses root path (`/`) if detection fails

**Supported Deployment Scenarios:**

- **Local Development**: `http://localhost:8080/` → Base path: `/`
- **Root Domain**: `https://example.com/` → Base path: `/`
- **GitHub Pages (User/Org)**: `https://username.github.io/` → Base path: `/`
- **GitHub Pages (Repository)**: `https://username.github.io/repo-name/` → Base path: `/repo-name`
- **Subdirectory**: `https://example.com/app/` → Base path: `/app`

### Manual Configuration (Optional)

For custom deployment scenarios or to override auto-detection, create a `config.js` file in the root directory:

```javascript
// config.js
window.APP_CONFIG = {
    basePath: '/my-custom-path'
};
```

**Important:** Load this file BEFORE the main application scripts in `index.html`:

```html
<script src="config.js"></script>
<script type="module" src="js/app.js"></script>
```

**Base Path Format Rules:**
- Must start with `/` (e.g., `/repo-name`)
- Must NOT end with `/` (e.g., NOT `/repo-name/`)
- Use empty string `''` or `/` for root deployment

### Deployment Examples

#### GitHub Pages (Repository)

1. **Enable GitHub Pages** in repository settings
2. **Select source**: `main` branch, `/` (root)
3. **Deploy**: Push your code to the main branch
4. **Access**: `https://username.github.io/repository-name/`

No configuration needed - the application will auto-detect the base path `/repository-name`.

#### GitHub Pages (Custom Domain)

1. **Configure custom domain** in repository settings
2. **Add CNAME file** with your domain
3. **Deploy**: Push your code
4. **Access**: `https://yourdomain.com/`

No configuration needed - the application will use root path `/`.

#### Subdirectory Deployment

If deploying to a subdirectory on your own server:

1. **Place files** in the subdirectory (e.g., `/var/www/html/myapp/`)
2. **Access**: `https://example.com/myapp/`

No configuration needed - auto-detection will work.

For custom paths that don't match the URL structure, use manual configuration:

```javascript
// config.js
window.APP_CONFIG = {
    basePath: '/custom-path'
};
```

## Troubleshooting

### Service Worker Registration Fails

**Symptom**: Console shows "Service worker registration failed" or 404 errors for `service-worker.js`

**Possible Causes:**
1. Incorrect base path detection
2. Service worker file not accessible
3. HTTPS requirement not met (except localhost)

**Solutions:**

1. **Check the detected base path:**
   ```javascript
   // Open browser console and run:
   console.log(pathConfig.getConfig());
   ```
   
   Expected output:
   ```javascript
   {
       basePath: "/repo-name",  // or "" for root
       isAutoDetected: true,
       detectionMethod: "script-src",
       isValid: true
   }
   ```

2. **Verify service worker URL:**
   - Open DevTools → Network tab
   - Look for `service-worker.js` request
   - Check if the URL is correct (should be `https://username.github.io/repo-name/service-worker.js`)

3. **Use manual configuration:**
   ```javascript
   // config.js
   window.APP_CONFIG = {
       basePath: '/correct-repo-name'
   };
   ```

4. **Ensure HTTPS:**
   - Service workers require HTTPS (except on localhost)
   - GitHub Pages automatically provides HTTPS

### Assets Not Loading (404 Errors)

**Symptom**: Icons, images, or other assets fail to load with 404 errors

**Possible Causes:**
1. Incorrect path resolution
2. Assets not deployed to the correct location
3. Base path mismatch

**Solutions:**

1. **Check asset paths in DevTools:**
   - Open DevTools → Network tab
   - Look for failed requests (red entries)
   - Verify the requested URL matches your deployment structure

2. **Verify PathConfig is working:**
   ```javascript
   // In browser console:
   console.log(pathConfig.resolveAssetPath('icons/icon.svg'));
   // Should output: "/repo-name/icons/icon.svg" or "/icons/icon.svg"
   ```

3. **Check manifest.json paths:**
   - All paths in `manifest.json` should be relative (no leading `/`)
   - Example: `"src": "icons/icon.svg"` ✓
   - Not: `"src": "/icons/icon.svg"` ✗

4. **Verify file structure:**
   ```
   repo-name/
   ├── index.html
   ├── manifest.json
   ├── service-worker.js
   ├── icons/
   │   └── icon.svg
   ├── js/
   │   └── ...
   └── styles/
       └── ...
   ```

### PWA Installation Not Working

**Symptom**: "Install App" prompt doesn't appear or installation fails

**Possible Causes:**
1. Manifest.json not loading correctly
2. Service worker not registered
3. HTTPS requirement not met
4. PWA criteria not met

**Solutions:**

1. **Check manifest.json:**
   - Open DevTools → Application tab → Manifest
   - Verify all fields are populated correctly
   - Check for errors or warnings

2. **Verify service worker:**
   - Open DevTools → Application tab → Service Workers
   - Should show "activated and running"
   - If not, see "Service Worker Registration Fails" above

3. **Check PWA criteria:**
   - HTTPS enabled ✓
   - Valid manifest.json ✓
   - Service worker registered ✓
   - At least one icon (192x192 or larger) ✓

4. **Test installation:**
   - Chrome: Look for install icon in address bar
   - Edge: Click "..." → "Apps" → "Install this site as an app"
   - Mobile: "Add to Home Screen" option in browser menu

### Path Detection Issues

**Symptom**: Application works locally but fails on deployment

**Possible Causes:**
1. Auto-detection failing in production environment
2. Different URL structure than expected
3. Server configuration issues

**Solutions:**

1. **Enable debug logging:**
   - Open browser console
   - Look for `[PathConfig]` messages
   - Check which detection method was used

2. **Test detection methods:**
   ```javascript
   // In browser console:
   const config = pathConfig.getConfig();
   console.log('Detection method:', config.detectionMethod);
   console.log('Base path:', config.basePath);
   console.log('Is valid:', config.isValid);
   ```

3. **Force manual configuration:**
   ```javascript
   // config.js
   window.APP_CONFIG = {
       basePath: '/your-repo-name'  // Replace with your actual path
   };
   ```

4. **Verify URL structure:**
   - Check your actual deployment URL
   - Ensure it matches the expected pattern
   - For GitHub Pages: `https://username.github.io/repo-name/`

### Invalid Base Path Warning

**Symptom**: Console shows "Invalid base path" warning

**Possible Causes:**
1. Base path doesn't start with `/`
2. Base path ends with `/`
3. Malformed manual configuration

**Solutions:**

1. **Check manual configuration:**
   ```javascript
   // CORRECT:
   window.APP_CONFIG = {
       basePath: '/repo-name'  // ✓
   };
   
   // INCORRECT:
   window.APP_CONFIG = {
       basePath: 'repo-name'   // ✗ Missing leading /
   };
   
   window.APP_CONFIG = {
       basePath: '/repo-name/' // ✗ Trailing /
   };
   ```

2. **Let auto-detection handle it:**
   - Remove manual configuration
   - Let the application detect the path automatically

### Notifications Not Working

**Symptom**: Push notifications don't appear or fail to send

**Possible Causes:**
1. Service worker not registered
2. Notification permissions not granted
3. Broker configuration issues
4. Icon paths incorrect

**Solutions:**

1. **Check service worker status:**
   - See "Service Worker Registration Fails" section above

2. **Verify notification permissions:**
   ```javascript
   // In browser console:
   console.log(Notification.permission);
   // Should be "granted"
   ```

3. **Grant permissions:**
   - Click the notification icon in the address bar
   - Or go to browser settings → Site permissions

4. **Check icon paths:**
   - Notification icons use `pathConfig.resolveAssetPath()`
   - Verify icons are loading correctly (see "Assets Not Loading" section)

## Development

### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/username/repo-name.git
   cd repo-name
   ```

2. **Start a local server:**
   ```bash
   # Using Python 3
   python -m http.server 8080
   
   # Using Node.js (http-server)
   npx http-server -p 8080
   
   # Using PHP
   php -S localhost:8080
   ```

3. **Open in browser:**
   ```
   http://localhost:8080/
   ```

### Testing

#### Deployment Testing

For comprehensive deployment testing across all scenarios (local, GitHub Pages, PWA installation, etc.), see:

**[DEPLOYMENT_TESTING.md](DEPLOYMENT_TESTING.md)** - Complete guide covering:
- Local development server testing
- GitHub Pages subdirectory deployment
- Service worker registration verification
- PWA installation testing
- Notification functionality testing
- Asset loading verification
- Automated verification scripts

#### Quick Path Configuration Test

To quickly test the path configuration:

1. **Test auto-detection:**
   ```javascript
   // Open browser console
   console.log(pathConfig.getConfig());
   ```

2. **Test path resolution:**
   ```javascript
   console.log(pathConfig.resolvePath('service-worker.js'));
   console.log(pathConfig.resolveAssetPath('icons/icon.svg'));
   ```

3. **Run automated verification:**
   ```javascript
   // Copy and paste the verification script from DEPLOYMENT_TESTING.md
   await verifyDeployment();
   ```

#### Functional Testing

For testing the messaging and notification features, see:
- [TESTING.md](TESTING.md) - Detailed testing guide
- [QUICK_TEST_GUIDE.md](QUICK_TEST_GUIDE.md) - Quick testing reference

## Configuration Reference

### PathConfig API

The `PathConfig` module provides the following methods:

#### `getBasePath()`
Returns the detected or configured base path.

```javascript
const basePath = pathConfig.getBasePath();
// Returns: "/repo-name" or ""
```

#### `resolvePath(relativePath)`
Resolves a relative path with the base path.

```javascript
const swPath = pathConfig.resolvePath('service-worker.js');
// Returns: "/repo-name/service-worker.js" or "/service-worker.js"
```

#### `resolveAssetPath(assetPath)`
Resolves an asset path (images, icons, etc.).

```javascript
const iconPath = pathConfig.resolveAssetPath('icons/icon.svg');
// Returns: "/repo-name/icons/icon.svg" or "/icons/icon.svg"
```

#### `getConfig()`
Returns configuration details for debugging.

```javascript
const config = pathConfig.getConfig();
// Returns: { basePath, isAutoDetected, detectionMethod, isValid }
```

#### `validateBasePath()`
Validates the base path format.

```javascript
const isValid = pathConfig.validateBasePath();
// Returns: true or false
```

### Manual Configuration Options

```javascript
// config.js
window.APP_CONFIG = {
    // Base path for the application
    // Must start with / and not end with /
    // Use '' or '/' for root deployment
    basePath: '/repo-name'
};
```

## License

[Your License Here]

## Contributing

[Your Contributing Guidelines Here]
