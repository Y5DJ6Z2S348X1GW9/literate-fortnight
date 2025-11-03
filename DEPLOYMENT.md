# Deployment Guide

This guide provides detailed instructions for deploying the Cross-Device Messaging Application to various environments.

## Table of Contents

- [Quick Start](#quick-start)
- [GitHub Pages Deployment](#github-pages-deployment)
- [Custom Server Deployment](#custom-server-deployment)
- [Path Configuration](#path-configuration)
- [Troubleshooting](#troubleshooting)
- [Advanced Configuration](#advanced-configuration)

## Quick Start

The application automatically detects its deployment path. For most scenarios, no configuration is needed:

1. Deploy your files to your hosting environment
2. Access the application via your URL
3. The app will auto-detect the base path and configure itself

## GitHub Pages Deployment

### Repository Subdirectory (Most Common)

When deploying to `https://username.github.io/repository-name/`:

1. **Enable GitHub Pages:**
   - Go to repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: `main` (or your default branch)
   - Folder: `/ (root)`
   - Click Save

2. **Deploy:**
   ```bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin main
   ```

3. **Access:**
   - URL: `https://username.github.io/repository-name/`
   - The app will auto-detect base path: `/repository-name`

4. **Verify:**
   - Open browser console
   - Check for: `[PathConfig] Detected base path from script source: /repository-name`
   - No errors should appear

**No configuration file needed!** The application automatically detects the base path.

### User/Organization Site (Root Domain)

When deploying to `https://username.github.io/`:

1. **Create repository:**
   - Repository name MUST be: `username.github.io`
   - Example: `johndoe.github.io`

2. **Enable GitHub Pages:**
   - Settings → Pages
   - Source: Deploy from a branch
   - Branch: `main`
   - Folder: `/ (root)`

3. **Deploy:**
   ```bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin main
   ```

4. **Access:**
   - URL: `https://username.github.io/`
   - Base path: `/` (root)

### Custom Domain on GitHub Pages

1. **Configure custom domain:**
   - Settings → Pages → Custom domain
   - Enter your domain: `example.com`
   - Click Save

2. **Add CNAME file:**
   ```bash
   echo "example.com" > CNAME
   git add CNAME
   git commit -m "Add custom domain"
   git push origin main
   ```

3. **Configure DNS:**
   - Add A records pointing to GitHub's IPs:
     - `185.199.108.153`
     - `185.199.109.153`
     - `185.199.110.153`
     - `185.199.111.153`
   - Or add CNAME record: `username.github.io`

4. **Enable HTTPS:**
   - Settings → Pages → Enforce HTTPS (check the box)
   - Wait for certificate provisioning (can take up to 24 hours)

5. **Access:**
   - URL: `https://example.com/`
   - Base path: `/` (root)

## Custom Server Deployment

### Apache

1. **Upload files:**
   ```bash
   # Upload to your server
   scp -r * user@server:/var/www/html/myapp/
   ```

2. **Configure .htaccess (if needed):**
   ```apache
   # /var/www/html/myapp/.htaccess
   
   # Enable HTTPS (required for service workers)
   RewriteEngine On
   RewriteCond %{HTTPS} off
   RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
   
   # Set proper MIME types
   AddType application/manifest+json .json
   AddType application/javascript .js
   ```

3. **Access:**
   - URL: `https://example.com/myapp/`
   - Base path: `/myapp` (auto-detected)

### Nginx

1. **Upload files:**
   ```bash
   scp -r * user@server:/usr/share/nginx/html/myapp/
   ```

2. **Configure nginx (if needed):**
   ```nginx
   # /etc/nginx/sites-available/default
   
   server {
       listen 443 ssl;
       server_name example.com;
       
       # SSL configuration
       ssl_certificate /path/to/cert.pem;
       ssl_certificate_key /path/to/key.pem;
       
       location /myapp/ {
           alias /usr/share/nginx/html/myapp/;
           try_files $uri $uri/ /myapp/index.html;
           
           # Set proper MIME types
           types {
               application/manifest+json json;
               application/javascript js;
           }
       }
   }
   ```

3. **Reload nginx:**
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

4. **Access:**
   - URL: `https://example.com/myapp/`
   - Base path: `/myapp` (auto-detected)

### Node.js / Express

1. **Serve static files:**
   ```javascript
   const express = require('express');
   const path = require('path');
   const app = express();
   
   // Serve app from /myapp path
   app.use('/myapp', express.static(path.join(__dirname, 'public')));
   
   // Fallback to index.html for SPA routing
   app.get('/myapp/*', (req, res) => {
       res.sendFile(path.join(__dirname, 'public', 'index.html'));
   });
   
   app.listen(3000, () => {
       console.log('Server running on http://localhost:3000/myapp/');
   });
   ```

2. **Access:**
   - URL: `http://localhost:3000/myapp/`
   - Base path: `/myapp` (auto-detected)

## Path Configuration

### Auto-Detection (Recommended)

The application automatically detects the base path using multiple strategies:

1. **Script Source Detection** (primary method)
2. **Location Detection** (fallback)
3. **Default** (root path)

**How it works:**

```javascript
// When you load: https://user.github.io/repo/index.html
// And it includes: <script type="module" src="js/app.js">
// The script URL is: https://user.github.io/repo/js/app.js
// Detected base path: /repo
```

**Verification:**

```javascript
// Open browser console
console.log(pathConfig.getConfig());

// Expected output:
{
    basePath: "/repo-name",
    isAutoDetected: true,
    detectionMethod: "script-src",
    isValid: true
}
```

### Manual Configuration (Optional)

For custom scenarios or to override auto-detection:

1. **Create config.js:**
   ```javascript
   // config.js
   window.APP_CONFIG = {
       basePath: '/my-custom-path'
   };
   ```

2. **Load before app.js:**
   ```html
   <!-- index.html -->
   <script src="config.js"></script>
   <script type="module" src="js/app.js"></script>
   ```

3. **Base path format rules:**
   - ✓ Must start with `/`
   - ✓ Must NOT end with `/`
   - ✓ Use `''` or `'/'` for root
   
   ```javascript
   // CORRECT:
   basePath: '/repo-name'
   basePath: '/app'
   basePath: ''  // root
   
   // INCORRECT:
   basePath: 'repo-name'   // Missing leading /
   basePath: '/repo-name/' // Trailing /
   basePath: '/'           // Use '' instead
   ```

### When to Use Manual Configuration

Use manual configuration when:

- Auto-detection fails in your environment
- You have a complex URL structure
- You're using URL rewriting/proxying
- You need consistent behavior across environments

**Example scenarios:**

```javascript
// Reverse proxy: https://example.com/app/ → http://localhost:3000/
window.APP_CONFIG = { basePath: '/app' };

// CDN with custom path: https://cdn.example.com/v1/app/
window.APP_CONFIG = { basePath: '/v1/app' };

// Development with custom path
window.APP_CONFIG = { basePath: '/dev' };
```

## Troubleshooting

### Service Worker Not Registering

**Symptoms:**
- Console error: "Service worker registration failed"
- 404 error for `service-worker.js`
- No service worker in DevTools → Application → Service Workers

**Diagnosis:**

1. Check detected base path:
   ```javascript
   console.log(pathConfig.getConfig());
   ```

2. Check service worker URL:
   ```javascript
   console.log(pathConfig.resolvePath('service-worker.js'));
   ```

3. Verify in Network tab:
   - Open DevTools → Network
   - Reload page
   - Look for `service-worker.js` request
   - Check if URL is correct

**Solutions:**

1. **If base path is wrong:**
   ```javascript
   // Create config.js
   window.APP_CONFIG = {
       basePath: '/correct-path'
   };
   ```

2. **If file is missing:**
   - Ensure `service-worker.js` is in the root directory
   - Check file permissions
   - Verify deployment included the file

3. **If HTTPS is missing:**
   - Service workers require HTTPS (except localhost)
   - Enable HTTPS on your server
   - GitHub Pages provides HTTPS automatically

### Assets Not Loading (404 Errors)

**Symptoms:**
- Icons not displaying
- Images broken
- CSS/JS files not loading
- Console shows 404 errors

**Diagnosis:**

1. Check asset path resolution:
   ```javascript
   console.log(pathConfig.resolveAssetPath('icons/icon.svg'));
   // Should output: "/repo-name/icons/icon.svg"
   ```

2. Check Network tab:
   - Open DevTools → Network
   - Look for failed requests (red)
   - Compare requested URL with actual file location

3. Verify file structure:
   ```bash
   # Your deployment should look like:
   repo-name/
   ├── index.html
   ├── manifest.json
   ├── service-worker.js
   ├── icons/
   │   └── icon.svg
   ├── js/
   │   ├── app.js
   │   └── config/
   │       └── PathConfig.js
   └── styles/
       └── main.css
   ```

**Solutions:**

1. **If paths are wrong:**
   - Use manual configuration (see above)
   - Verify base path is correct

2. **If files are missing:**
   - Check deployment included all files
   - Verify file names match exactly (case-sensitive)

3. **If manifest.json has absolute paths:**
   ```json
   // WRONG:
   {
       "icons": [
           { "src": "/icons/icon.svg" }
       ]
   }
   
   // CORRECT:
   {
       "icons": [
           { "src": "icons/icon.svg" }
       ]
   }
   ```

### PWA Not Installing

**Symptoms:**
- No "Install" button in browser
- Installation fails
- App doesn't appear in app drawer

**Diagnosis:**

1. Check PWA criteria:
   - Open DevTools → Application → Manifest
   - Look for errors or warnings
   - Verify all required fields are present

2. Check service worker:
   - Open DevTools → Application → Service Workers
   - Should show "activated and running"

3. Check HTTPS:
   - URL must use HTTPS (except localhost)
   - Certificate must be valid

**Solutions:**

1. **Fix manifest.json:**
   - Ensure all paths are relative
   - Include required fields: `name`, `short_name`, `start_url`, `display`, `icons`
   - Include at least one icon ≥192x192

2. **Fix service worker:**
   - See "Service Worker Not Registering" above

3. **Enable HTTPS:**
   - GitHub Pages: Automatic
   - Custom server: Configure SSL certificate

### Path Detection Failing

**Symptoms:**
- App works locally but not in production
- Wrong base path detected
- Console shows unexpected base path

**Diagnosis:**

1. Check detection method:
   ```javascript
   const config = pathConfig.getConfig();
   console.log('Method:', config.detectionMethod);
   console.log('Base path:', config.basePath);
   console.log('Valid:', config.isValid);
   ```

2. Check URL structure:
   - Verify your actual deployment URL
   - Compare with expected pattern

3. Enable debug logging:
   - Look for `[PathConfig]` messages in console
   - Check which detection strategy was used

**Solutions:**

1. **Use manual configuration:**
   ```javascript
   // config.js
   window.APP_CONFIG = {
       basePath: '/your-actual-path'
   };
   ```

2. **Verify script loading:**
   ```html
   <!-- Ensure script is loaded as module -->
   <script type="module" src="js/app.js"></script>
   ```

3. **Check for URL rewriting:**
   - If using reverse proxy or URL rewriting
   - Manual configuration may be required

## Advanced Configuration

### Environment-Specific Configuration

Use different configurations for different environments:

```javascript
// config.js
(function() {
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        // Local development
        window.APP_CONFIG = { basePath: '' };
    } else if (hostname.includes('github.io')) {
        // GitHub Pages - let auto-detection handle it
        window.APP_CONFIG = {};
    } else {
        // Production server
        window.APP_CONFIG = { basePath: '/app' };
    }
})();
```

### Build-Time Configuration

Inject base path during build process:

```javascript
// build.js
const fs = require('fs');
const basePath = process.env.BASE_PATH || '';

const config = `window.APP_CONFIG = { basePath: '${basePath}' };`;
fs.writeFileSync('config.js', config);
```

```bash
# Build for different environments
BASE_PATH=/repo-name npm run build
BASE_PATH=/staging npm run build
BASE_PATH= npm run build  # root
```

### Testing Different Paths Locally

Test different base paths without deploying:

```javascript
// config.js
window.APP_CONFIG = {
    basePath: '/test-repo'  // Simulate GitHub Pages subdirectory
};
```

Then access via: `http://localhost:8080/` (the app will behave as if deployed to `/test-repo`)

### Debugging Path Issues

Add detailed logging:

```javascript
// In browser console
const config = pathConfig.getConfig();
console.log('=== PathConfig Debug ===');
console.log('Base Path:', config.basePath);
console.log('Auto-detected:', config.isAutoDetected);
console.log('Detection Method:', config.detectionMethod);
console.log('Valid:', config.isValid);
console.log('');
console.log('Test Paths:');
console.log('Service Worker:', pathConfig.resolvePath('service-worker.js'));
console.log('Icon:', pathConfig.resolveAssetPath('icons/icon.svg'));
console.log('Manifest:', pathConfig.resolvePath('manifest.json'));
```

## Best Practices

1. **Let auto-detection work:**
   - Don't use manual configuration unless necessary
   - Auto-detection handles most scenarios correctly

2. **Use relative paths:**
   - In manifest.json: `"src": "icons/icon.svg"`
   - Not: `"src": "/icons/icon.svg"`

3. **Test before deploying:**
   - Test locally with different base paths
   - Verify service worker registration
   - Check asset loading

4. **Enable HTTPS:**
   - Required for service workers
   - Required for PWA installation
   - GitHub Pages provides it automatically

5. **Monitor console:**
   - Check for `[PathConfig]` messages
   - Look for 404 errors
   - Verify detected base path

6. **Document your deployment:**
   - Note your base path
   - Document any manual configuration
   - Keep deployment instructions updated

## Testing Your Deployment

After deploying, verify everything works correctly using the comprehensive testing guide:

**[DEPLOYMENT_TESTING.md](DEPLOYMENT_TESTING.md)** - Complete deployment testing guide covering:
- Local development server testing
- GitHub Pages subdirectory deployment verification
- Service worker registration checks
- PWA installation testing
- Notification functionality verification
- Asset loading validation
- Automated verification scripts

Quick verification script (run in browser console):

```javascript
// Quick deployment check
async function quickCheck() {
    console.log('Base path:', pathConfig.getConfig());
    console.log('SW registered:', !!(await navigator.serviceWorker.getRegistration()));
    console.log('Icon path:', pathConfig.resolveAssetPath('icons/icon.svg'));
}
await quickCheck();
```

## Support

If you encounter issues not covered in this guide:

1. Check browser console for errors
2. Verify `pathConfig.getConfig()` output
3. Test with manual configuration
4. Check GitHub Pages documentation
5. Review service worker requirements

For more information, see:
- [DEPLOYMENT_TESTING.md](DEPLOYMENT_TESTING.md) - Comprehensive testing guide
- [README.md](README.md) - General documentation
- [PathConfig.js](js/config/PathConfig.js) - Implementation details
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
