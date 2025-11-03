/**
 * PathConfig - Centralized path configuration and resolution
 * 
 * Automatically detects the application's base path for deployment
 * to different environments (root domain, GitHub Pages subdirectory, etc.)
 * 
 * AUTO-DETECTION BEHAVIOR:
 * The module uses a multi-strategy approach to detect the base path:
 * 
 * 1. Manual Configuration (highest priority):
 *    - Checks for window.APP_CONFIG.basePath
 *    - Allows override via config.js file
 *    - Example: window.APP_CONFIG = { basePath: '/my-repo' };
 * 
 * 2. Script Source Detection:
 *    - Analyzes document.currentScript.src
 *    - Extracts path before /js/ directory
 *    - Works when script is loaded via <script type="module" src="js/app.js">
 *    - Example: https://user.github.io/repo/js/app.js → base path: /repo
 * 
 * 3. Location Detection (fallback):
 *    - Parses window.location.pathname
 *    - Handles index.html and directory paths
 *    - Example: https://user.github.io/repo/index.html → base path: /repo
 * 
 * 4. Default (last resort):
 *    - Uses root path (empty string)
 *    - Suitable for root domain deployments
 * 
 * DEPLOYMENT SCENARIOS:
 * - Local: http://localhost:8080/ → base path: ""
 * - Root: https://example.com/ → base path: ""
 * - GitHub Pages (repo): https://user.github.io/repo/ → base path: "/repo"
 * - Subdirectory: https://example.com/app/ → base path: "/app"
 * 
 * MANUAL CONFIGURATION:
 * Create a config.js file and load it before app.js:
 * 
 *   // config.js
 *   window.APP_CONFIG = {
 *       basePath: '/custom-path'  // Must start with /, no trailing /
 *   };
 * 
 *   // index.html
 *   <script src="config.js"></script>
 *   <script type="module" src="js/app.js"></script>
 * 
 * TROUBLESHOOTING:
 * - Check detection: console.log(pathConfig.getConfig())
 * - Verify paths: console.log(pathConfig.resolvePath('service-worker.js'))
 * - Enable manual config if auto-detection fails
 * - Ensure base path format: starts with /, no trailing /
 */
class PathConfig {
    constructor() {
        this.basePath = '';
        this.isAutoDetected = false;
        this.detectionMethod = 'unknown';
        
        this._detectBasePath();
    }

    /**
     * Detects the base path using multiple strategies
     * @private
     */
    _detectBasePath() {
        // Check for manual configuration first
        if (window.APP_CONFIG && window.APP_CONFIG.basePath) {
            this.basePath = this._normalizePath(window.APP_CONFIG.basePath);
            this.isAutoDetected = false;
            this.detectionMethod = 'manual';
            console.log('[PathConfig] Using manual base path:', this.basePath);
            return;
        }

        // Strategy 1: Detect from script source URL
        const scriptBasePath = this._detectFromScriptSource();
        if (scriptBasePath !== null) {
            this.basePath = scriptBasePath;
            this.isAutoDetected = true;
            this.detectionMethod = 'script-src';
            console.log('[PathConfig] Detected base path from script source:', this.basePath);
            return;
        }

        // Strategy 2: Detect from window.location
        const locationBasePath = this._detectFromLocation();
        if (locationBasePath !== null) {
            this.basePath = locationBasePath;
            this.isAutoDetected = true;
            this.detectionMethod = 'location';
            console.log('[PathConfig] Detected base path from location:', this.basePath);
            return;
        }

        // Default: root path
        this.basePath = '';
        this.isAutoDetected = true;
        this.detectionMethod = 'default';
        console.log('[PathConfig] Using default root path');
    }

    /**
     * Detects base path from the script tag's src attribute
     * @private
     * @returns {string|null} Detected base path or null if detection fails
     */
    _detectFromScriptSource() {
        try {
            // Get the current script element
            const scriptElement = document.currentScript;
            if (!scriptElement || !scriptElement.src) {
                return null;
            }

            const scriptUrl = new URL(scriptElement.src);
            const pathname = scriptUrl.pathname;

            // Look for /js/ in the path to extract the base
            const jsIndex = pathname.indexOf('/js/');
            if (jsIndex !== -1) {
                const basePath = pathname.substring(0, jsIndex);
                return this._normalizePath(basePath);
            }

            // If /js/ not found, try to extract directory from full path
            const lastSlash = pathname.lastIndexOf('/');
            if (lastSlash > 0) {
                const basePath = pathname.substring(0, lastSlash);
                // Remove /js if it's at the end
                const cleanPath = basePath.endsWith('/js') 
                    ? basePath.substring(0, basePath.length - 3) 
                    : basePath;
                return this._normalizePath(cleanPath);
            }

            return null;
        } catch (error) {
            console.warn('[PathConfig] Failed to detect from script source:', error);
            return null;
        }
    }

    /**
     * Detects base path from window.location
     * @private
     * @returns {string|null} Detected base path or null if detection fails
     */
    _detectFromLocation() {
        try {
            const pathname = window.location.pathname;

            // If we're at index.html, extract the directory
            if (pathname.includes('index.html')) {
                const lastSlash = pathname.lastIndexOf('/');
                if (lastSlash > 0) {
                    const basePath = pathname.substring(0, lastSlash);
                    return this._normalizePath(basePath);
                }
            }

            // If pathname ends with /, it might be the base path
            if (pathname.endsWith('/') && pathname.length > 1) {
                const basePath = pathname.substring(0, pathname.length - 1);
                return this._normalizePath(basePath);
            }

            // If we're at a file in a subdirectory, try to extract base
            if (pathname.includes('/') && !pathname.endsWith('/')) {
                const lastSlash = pathname.lastIndexOf('/');
                if (lastSlash > 0) {
                    const basePath = pathname.substring(0, lastSlash);
                    return this._normalizePath(basePath);
                }
            }

            return null;
        } catch (error) {
            console.warn('[PathConfig] Failed to detect from location:', error);
            return null;
        }
    }

    /**
     * Normalizes a path to ensure consistent format
     * @private
     * @param {string} path - Path to normalize
     * @returns {string} Normalized path
     */
    _normalizePath(path) {
        if (!path) {
            return '';
        }

        let normalized = path;

        // Remove trailing slash
        if (normalized.endsWith('/')) {
            normalized = normalized.substring(0, normalized.length - 1);
        }

        // Ensure leading slash for non-empty paths
        if (normalized && !normalized.startsWith('/')) {
            normalized = '/' + normalized;
        }

        return normalized;
    }

    /**
     * Gets the detected base path
     * @returns {string} Base path (e.g., "/repo-name" or "")
     */
    getBasePath() {
        return this.basePath;
    }

    /**
     * Resolves a relative path with the base path
     * @param {string} relativePath - Relative path to resolve
     * @returns {string} Resolved path
     */
    resolvePath(relativePath) {
        if (!relativePath) {
            return this.basePath || '/';
        }

        // Remove leading slash or ./ from relative path
        let cleanPath = relativePath;
        if (cleanPath.startsWith('./')) {
            cleanPath = cleanPath.substring(2);
        } else if (cleanPath.startsWith('/')) {
            cleanPath = cleanPath.substring(1);
        }

        // Combine base path with relative path
        if (this.basePath) {
            return `${this.basePath}/${cleanPath}`;
        }

        return `/${cleanPath}`;
    }

    /**
     * Resolves an asset path (for images, icons, etc.)
     * @param {string} assetPath - Asset path to resolve
     * @returns {string} Resolved asset path
     */
    resolveAssetPath(assetPath) {
        if (!assetPath) {
            return '';
        }

        // If it's already an absolute URL, return as-is
        if (assetPath.startsWith('http://') || assetPath.startsWith('https://') || assetPath.startsWith('data:')) {
            return assetPath;
        }

        // Remove leading slash or ./ from asset path
        let cleanPath = assetPath;
        if (cleanPath.startsWith('./')) {
            cleanPath = cleanPath.substring(2);
        } else if (cleanPath.startsWith('/')) {
            cleanPath = cleanPath.substring(1);
        }

        // Combine base path with asset path
        if (this.basePath) {
            return `${this.basePath}/${cleanPath}`;
        }

        return `/${cleanPath}`;
    }

    /**
     * Validates the configured base path format
     * @returns {boolean} True if valid, false otherwise
     */
    validateBasePath() {
        // Empty base path is valid (root deployment)
        if (!this.basePath) {
            return true;
        }

        // Should start with / and not end with /
        if (!this.basePath.startsWith('/')) {
            console.warn('[PathConfig] Invalid base path: should start with /');
            return false;
        }

        if (this.basePath.endsWith('/')) {
            console.warn('[PathConfig] Invalid base path: should not end with /');
            return false;
        }

        return true;
    }

    /**
     * Gets configuration information for debugging
     * @returns {object} Configuration details
     */
    getConfig() {
        return {
            basePath: this.basePath,
            isAutoDetected: this.isAutoDetected,
            detectionMethod: this.detectionMethod,
            isValid: this.validateBasePath()
        };
    }
}

// Create and export singleton instance
const pathConfig = new PathConfig();

// Validate on initialization
if (!pathConfig.validateBasePath()) {
    console.error('[PathConfig] Base path validation failed. Application may not work correctly.');
}

export { pathConfig, PathConfig };
