# Assets

The header image `header-image.png` is rendered from `header-image.html`.
Requires macOS (the fonts resolve to SF Pro), Google Chrome and `pngquant` (`brew install pngquant`).

Run from the repository root:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless \
  --hide-scrollbars --force-device-scale-factor=1 --default-background-color=00000000 \
  --window-size=1920,640 --screenshot=assets/header-image.png assets/header-image.html
pngquant --quality=85-98 --speed 1 --strip --force --ext .png assets/header-image.png
```
