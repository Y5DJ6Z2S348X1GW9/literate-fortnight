# Design Document

## Overview

This design addresses the GitHub Pages deployment path issue by implementing a centralized path configuration system. The solution automatically detects the deployment base path and provides utilities for all components to resolve paths correctly. This ensures the application works seamlessly on both root domains and GitHub Pages subdirectories.

## Architecture

### Path Detection Strategy

The application will use a two-tier approach:
1. **Auto-detection**: Extract base path from `document.currentScript.src` or `window.location.pathname`
2. **Manual override**: Allow configuration through a `config.js` file for custom deployments

### Component Integration

```
┌─────────────────────────────────────────┐
│         PathConfig Module               │
│  - Detects base path                    │
│  - Provides path resolution utilities   │
└─────────────────┬───────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
┌───────▼────────┐  ┌──────▼──────────┐
│ NotificationMgr │  │  Service Worker │
│ - SW registration│  │  - Cache paths  │
└────────────────┘  └─────────────────┘
        │                   │
        └─────────┬─────────┘
                  │
        ┌─────────▼─────────┐
        │   manifest.json   │
        │  - Relative paths │
        └───────────────────┘
```

## Components and Interfaces

### 1. PathConfig Module (`js/config/PathConfig.js`)

**Purpose**: Centralized path configuration and resolution

**Interface**:
```javascript
class PathConfig {
    constructor()
    getBasePath(): string
    resolvePath(relativePath: string): string
    resolveAssetPath(assetPath: string): string
}
```

**Implementation Details**:
- Detects base path by analyzing the script tag's `src` attribute
- Falls back to parsing `window.location.pathname` if needed
- Normalizes paths to ensure they start and end correctly
- Caches the detected base path for performance

**Path Detection Algorithm**:
```javascript
// 1. Try to get base path from script tag
const scriptSrc = document.currentScript?.src;
if (scriptSrc) {
    const url = new URL(scriptSrc);
    // Extract path up to /js/
    basePath = url.pathname.substring(0, url.pathname.indexOf('/js/'));
}

// 2. Fallback: analyze current location
if (!basePath) {
    const path = window.location.pathname;
    // If path contains index.html, extract directory
    if (path.includes('index.html')) {
        basePath = path.substring(0, path.lastIndexOf('/'));
    }
}

// 3. Normalize
basePath = basePath || '';
if (basePath && !basePath.endsWith('/')) {
    basePath += '/';
}
```

### 2. NotificationManager Updates

**Changes Required**:
- Import PathConfig module
- Use `pathConfig.resolvePath()` for service worker registration
- Use `pathConfig.resolveAssetPath()` for icon paths

**Modified Service Worker Registration**:
```javascript
import { pathConfig } from '../config/PathConfig.js';

async initialize() {
    const swPath = pathConfig.resolvePath('service-worker.js');
    const swScope = pathConfig.getBasePath() || '/';
    
    this.registration = await navigator.serviceWorker.register(swPath, {
        scope: swScope
    });
}
```

### 3. Service Worker Updates

**Changes Required**:
- Inject base path at build time or detect from registration scope
- Update all cached URLs to use relative paths
- Update icon paths in notifications

**Path Handling Strategy**:
```javascript
// At the top of service-worker.js
const BASE_PATH = self.registration.scope;

// Update cache URLs
const urlsToCache = [
    './',
    './index.html',
    './styles/main.css',
    // ... relative paths
];

// Resolve paths for caching
const resolvedUrls = urlsToCache.map(url => new URL(url, BASE_PATH).href);
```

### 4. Manifest.json Updates

**Changes Required**:
- Convert all absolute paths to relative paths
- Remove leading slashes from URLs

**Updated Structure**:
```json
{
  "start_url": "./",
  "scope": "./",
  "icons": [
    {
      "src": "icons/icon.svg",
      "sizes": "any"
    }
  ],
  "shortcuts": [
    {
      "url": "./",
      "icons": [{"src": "icons/icon.svg"}]
    }
  ]
}
```

### 5. Build Configuration (Optional)

**Purpose**: Allow manual base path configuration for special deployments

**File**: `config.js` (optional, in root directory)
```javascript
window.APP_CONFIG = {
    basePath: '/my-repo/' // Override auto-detection
};
```

## Data Models

### PathConfig State
```javascript
{
    basePath: string,        // e.g., "/repo-name/" or "/"
    isAutoDetected: boolean, // true if auto-detected, false if manually configured
    detectionMethod: string  // "script-src" | "location" | "manual"
}
```

## Error Handling

### Service Worker Registration Failures

**Scenario**: Service worker file not found (404)
**Handling**:
- Log descriptive error with attempted path
- Continue application initialization without service worker
- Disable notification features gracefully
- Show user-friendly message if notifications are attempted

**Implementation**:
```javascript
try {
    await this.initialize();
} catch (error) {
    console.warn('[NotificationManager] Service worker unavailable:', error);
    this.isSupported = false;
    // Application continues without push notifications
}
```

### Path Detection Failures

**Scenario**: Unable to detect base path
**Handling**:
- Default to root path ("/")
- Log warning message
- Application continues with root path assumption

### Asset Loading Failures

**Scenario**: Icons or other assets fail to load
**Handling**:
- Use fallback icon (data URI or CDN)
- Log warning with attempted path
- Continue without visual assets

## Testing Strategy

### Unit Tests

1. **PathConfig Module**
   - Test base path detection from various script locations
   - Test path resolution with different base paths
   - Test edge cases (root deployment, deep subdirectories)

2. **Path Resolution Utilities**
   - Test relative path conversion
   - Test absolute path handling
   - Test URL normalization

### Integration Tests

1. **Service Worker Registration**
   - Mock different deployment URLs
   - Verify correct service worker path construction
   - Test scope configuration

2. **Asset Loading**
   - Verify icons load correctly
   - Test manifest.json parsing
   - Verify cached resources

### Manual Testing Scenarios

1. **Local Development** (`http://localhost:8080/`)
   - Verify all features work
   - Check service worker registration
   - Test notifications

2. **GitHub Pages Root** (`https://username.github.io/`)
   - Deploy to root domain
   - Verify all paths resolve correctly
   - Test PWA installation

3. **GitHub Pages Subdirectory** (`https://username.github.io/repo-name/`)
   - Deploy to repository subdirectory
   - Verify service worker registration
   - Test all asset loading
   - Verify PWA installation

## Implementation Notes

### Migration Strategy

1. Create PathConfig module first
2. Update NotificationManager to use PathConfig
3. Update service-worker.js with relative paths
4. Update manifest.json to relative paths
5. Test locally, then deploy to GitHub Pages

### Backward Compatibility

- The solution maintains backward compatibility with root deployments
- No breaking changes to existing functionality
- Graceful degradation if service worker fails

### Performance Considerations

- Path detection happens once at initialization
- Results are cached to avoid repeated calculations
- No impact on runtime performance

### Browser Compatibility

- Path detection uses standard APIs (URL, location)
- Service worker features require modern browsers (already a requirement)
- Fallback behavior for browsers without service worker support
