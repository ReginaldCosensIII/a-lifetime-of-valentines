# 🎨 PWA Icon Guide (Adobe Illustrator Edition)

To get that "Native App" look (without the tiny Chrome logo badge), we need to create **Maskable Icons**. 

These are icons with a solid background that fill the entire square. Android automatically crops them into circles, rounded squares, or squircles depending on the user's device.

## The Design: Sparkle Heart 💖

Since you have Adobe Illustrator, this will be easy!

### 1. Setup Your Artboard
1.  Open Adobe Illustrator.
2.  Create a **New File**.
3.  **Dimensions:** `512 px` width x `512 px` height.
4.  **Color Mode:** RGB.
5.  **Raster Effects:** High (300 ppi) or Screen (72 ppi) - (Screen is fine for web, but High is safer for clarity).

### 2. Design the Icon (The "Maskable" Version)
This is the most important file. It prevents the "Chrome Badge" issue.

1.  **Background Layer:**
    *   Draw a Rectangle (`M`) that covers the *entire* 512x512 artboard.
    *   **Fill Color:** `#fff9fa` (The app's off-white background color).
    *   **Stroke:** None.
    *   *Note: It is critical that this background extends to the very edges.*

2.  **Content Layer:**
    *   Paste your **Sparkle Heart Vector** (or high-res Emoji image) into the center.
    *   **Size:** Resize the heart so it fits within the **middle 50%** of the artboard.
    *   *Guide:* Draw a 256x256 square in the absolute center. Your heart should fit tightly inside this box.
    *   *Why?* Android might crop the outer 20-30% of the image into a circle. Keeping the heart in the center ensures it never gets cut off.

3.  **Export (File > Export > Export for Screens):**
    *   **Prefix:** `maskable-` (optional)
    *   **Scale:** `1x`
    *   **Format:** `PNG` (Transparency doesn't matter since we have a solid background).
    *   **Filename:** `maskable-icon.png`

### 3. Design the Standard Icons (192 & 512)
These are used for the splash screen and other contexts where a transparent background might be preferred (though solid looks great too).

1.  **Option A (Solid - Recommended for consistency):** 
    *   Use the exact same design as above.
    *   Export another copy as `pwa-512x512.png`.
    *   Export a smaller copy (Scale `192px` width) as `pwa-192x192.png`.

2.  **Option B (Transparent):**
    *   Hide the Background Layer.
    *   Resize the heart to fill about **80-90%** of the artboard (since no cropping happens here).
    *   Export as `pwa-512x512.png` and `pwa-192x192.png`.

## Final Checklist
You should end up with 3 files in your `public/` folder:

1.  `maskable-icon.png` (512x512, Solid Background `#fff9fa`, Heart in center 50%)
2.  `pwa-512x512.png` (512x512, Solid or Transparent)
3.  `pwa-192x192.png` (192x192, Solid or Transparent)

Once these are safely in `public/`, delete the old SVGs (`vite.svg`, etc.) if you wish, or just leave them. The PWA will prioritize these new PNGs.
