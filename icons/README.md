# App Icons

This directory contains the application icons for the PWA.

## Required Icon Sizes

The following icon sizes are required for optimal PWA support:

- 72x72 - Android small icon
- 96x96 - Android medium icon
- 128x128 - Android large icon
- 144x144 - Android extra large icon
- 152x152 - iOS icon
- 192x192 - Android standard icon (maskable)
- 384x384 - Android extra large icon
- 512x512 - Android splash screen icon (maskable)

## Generating Icons

You can use online tools like:
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/imageGenerator

Or use ImageMagick to generate from a source image:

```bash
# Example with ImageMagick
convert source.png -resize 72x72 icon-72.png
convert source.png -resize 96x96 icon-96.png
convert source.png -resize 128x128 icon-128.png
convert source.png -resize 144x144 icon-144.png
convert source.png -resize 152x152 icon-152.png
convert source.png -resize 192x192 icon-192.png
convert source.png -resize 384x384 icon-384.png
convert source.png -resize 512x512 icon-512.png
```

## Maskable Icons

For maskable icons (192x192 and 512x512), ensure the important content is within the safe zone (80% of the icon area centered).

## Temporary Placeholder

Until proper icons are created, you can use a simple colored square or the browser's default icon.
