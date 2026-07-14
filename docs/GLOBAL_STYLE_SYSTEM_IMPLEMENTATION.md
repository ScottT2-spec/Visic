# Global Style System Implementation

## Overview

This implementation provides a unified, extensible architecture for applying design settings across all blocks and pages in the builder. It fixes two key issues:

1. **Shop and Blog pages** are now fully editable for design/layout while keeping underlying data dynamic
2. **Design and Advanced panels** now apply all settings (spacing, typography, backgrounds, alignment, etc.) globally

## Architecture

### 1. Global Schema System (`src/lib/builder/block-style-schema.ts`)

A Shopify sections + WordPress block supports inspired schema system that defines:

- **BlockStyleSettings**: Complete interface for all style properties
- **BlockStyleSchema**: Defines which properties each block type supports
- **BLOCK_STYLE_SCHEMAS**: Registry of schemas for different block types
- **resolveBlockStyles()**: Universal resolver that converts settings to CSS

### 2. Enhanced Style Resolver (`src/components/storefront/block-style.ts`)

Updated to use the new schema system:

- `resolveSectionStyleOverrides()`: Maps SectionStyleOverrides to BlockStyleSettings and resolves styles
- Returns: `{ styles, classes, overlayStyles }` for complete style application
- Handles responsive visibility classes and background overlays

### 3. Type Updates

Updated `SectionStyleOverrides` in both:
- `src/lib/builder/editor-types.ts`
- `src/types/index.ts`

Added properties for:
- Typography: fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, textTransform, textAlign
- Layout: display, flexDirection, justifyContent, alignItems, gap, maxWidth, etc.
- Enhanced backgrounds: backgroundOverlayOpacity, transitionTimingFunction
- Hover effects: hoverBackgroundColor, hoverTextColor

### 4. Template Renderer Updates

Updated all template renderers to use the new resolver:
- `FashionPageRenderer.tsx`
- `KidsPageRenderer.tsx`
- `PerfumesPageRenderer.tsx`

Each now uses:
- `getSectionStyles()` - returns CSS styles
- `getSectionClasses()` - returns responsive visibility classes
- `getSectionOverlayStyles()` - returns background overlay styles

### 5. Enhanced RightSidebar

Added new control sections in the Advanced panel:
- **Typography**: Font family, size, weight, line height, letter spacing, text transform, text align
- **Layout**: Display, flex direction, justify content, align items, gap, max width

### 6. Designable Components

Created reusable wrapper components for making dynamic content editable:

- **DesignableWrapper** (`src/components/builder/DesignableWrapper.tsx`):
  - Universal wrapper that applies design settings to any content
  - Handles styles, classes, and overlays automatically

- **DesignableShopPage** (`src/components/builder/DesignableShopPage.tsx`):
  - Wraps ShopPageContent with designable container
  - Product data remains dynamic, layout/appearance is editable

- **DesignableBlogPage** (`src/components/builder/DesignableBlogPage.tsx`):
  - Wraps BlogListingContent with designable container
  - Blog data remains dynamic, layout/appearance is editable

## Usage

### For Existing Blocks

All existing blocks automatically benefit from the new system. The template renderers now apply all style settings that were previously saved but not applied.

### For New Blocks

To make a new block support the style system:

1. Add a schema entry in `BLOCK_STYLE_SCHEMAS`:
```typescript
myCustomBlock: {
  supports: {
    colors: true,
    spacing: true,
    typography: true,
    layout: true,
    // ... other properties
  },
  defaults: {
    textAlign: 'left',
  },
}
```

2. In your renderer, use the resolver:
```typescript
import { resolveSectionStyleOverrides } from "@/components/storefront/block-style";

const { styles, classes, overlayStyles } = resolveSectionStyleOverrides(
  section.styleOverrides,
  section.type
);

return (
  <div className={classes} style={styles}>
    {overlayStyles && <div className="absolute inset-0" style={overlayStyles} />}
    <div className="relative z-10">{content}</div>
  </div>
);
```

### For Shop/Blog Pages

Use the designable components in the builder preview:

```typescript
import { DesignableShopPage } from "@/components/builder/DesignableShopPage";

<DesignableShopPage
  storeSlug={storeSlug}
  storeData={storeData}
  styleOverrides={section.styleOverrides}
/>
```

## Supported Properties

### Colors & Background
- backgroundColor, textColor
- backgroundType (color, gradient, image, video)
- backgroundGradient, backgroundImage, backgroundVideo
- backgroundOverlay, backgroundOverlayOpacity

### Spacing
- paddingY, paddingTop, paddingBottom, paddingLeft, paddingRight
- marginTop, marginBottom, marginLeft, marginRight

### Typography
- fontFamily, fontSize, fontWeight
- lineHeight, letterSpacing
- textTransform, textAlign

### Layout
- display, flexDirection, flexWrap
- justifyContent, alignItems, alignContent
- gap, maxWidth, minWidth
- position, zIndex, overflow

### Borders
- borderStyle, borderWidth, borderColor
- borderRadius

### Shadows
- boxShadow

### Motion
- transitionDuration, transitionTimingFunction
- hoverScale, hoverOpacity, hoverShadow
- hoverBackgroundColor, hoverTextColor

### Responsive
- responsiveVisibility (desktop, tablet, mobile)

### Custom
- customCss

## Benefits

1. **Single Source of Truth**: All style resolution goes through `resolveBlockStyles()`
2. **Extensible**: Easy to add new properties or block types
3. **Type-Safe**: Full TypeScript support with proper interfaces
4. **Backward Compatible**: Existing blocks work without changes
5. **Performance**: Styles are resolved once per render
6. **Maintainable**: Centralized logic, no duplication across renderers

## Testing

To verify the implementation:

1. Open the builder for a cosmetics site
2. Navigate to Home, Shop, Blog, and Terms pages
3. Select any section and open the Design/Advanced panel
4. Test various settings:
   - Change colors (should apply immediately)
   - Adjust spacing (padding, margins)
   - Modify typography (font size, weight, alignment)
   - Set background images with overlays
   - Configure responsive visibility
5. Verify that changes appear in the preview
6. Confirm that live pages (not in builder) still work with sensible defaults

## Future Enhancements

Potential improvements:
- Add more granular control for specific block types
- Implement style inheritance from parent blocks
- Add preset style combinations
- Support for CSS-in-JS libraries
- Animation presets
- Advanced responsive breakpoints
