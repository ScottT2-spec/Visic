# New Builder Interface - Prokip Sites OS Architecture

## Overview

A complete rebuild of the customization/editing interface following the prokip-sites-os architecture. This implementation provides a state-driven, hybrid client-server rendering model with instant WYSIWYG feedback while ensuring rigorous schema conformity and modular state separation.

## Architecture

### High-Level Structure

```
┌────────────────────────────────────────────────────────────────────────┐
│                              Application UI                            │
├────────────────────┬───────────────────────────────────────────────────┤
│                    │                                                   │
│   Left Sidebar     │                 Center Canvas                     │
│  (Design, Blocks,  │       (Interactive Sandbox & Preview Frame)       │
│   Navigator, AI)   │                                                   │
│                    │                                                   │
└────────────────────┴───────────────────────────────────────────────────┘
                                      │
                         Dispatches Immutable State
                                      │
                                      ▼
                        ┌──────────────────────────┐
                        │   State Manager (React)  │
                        └─────────────┬────────────┘
                                      │
                                      ▼
                        ┌──────────────────────────┐
                        │      Theme & Page        │
                        │    Variables Mapper      │
                        └─────────────┬────────────┘
                                      │
                                      ▼
                        ┌──────────────────────────┐
                        │   Dynamic CSS Injector   │
                        │  (CSS Custom Variables)  │
                        └─────────────┬────────────┘
                                      │
                                      ▼
                        ┌──────────────────────────┐
                        │    Template Renderer     │
                        └──────────────────────────┘
```

## Components Created

### 1. Type Definitions (`src/types/index.ts`)

Added comprehensive type definitions for the Prokip Sites OS architecture:

- **ProkipSite**: Main site structure with theme, sections, pages, media library
- **ProkipTheme**: Theme configuration with design system
- **DesignSystem**: Colors, fonts, typography, border radius
- **TypographySystem**: Font styles for h1, h2, h3, body, button, menu
- **SectionStyleOverrides**: Elementor-level styling control (margins, padding, borders, shadows, backgrounds, responsive visibility)
- **Page**: Multi-page support with system page protection
- **Section**: Modular content blocks with style overrides
- **GOOGLE_FONTS_DATABASE**: Pre-configured font registry

### 2. ThemeProvider (`src/components/builder/ThemeProvider.tsx`)

Implements dynamic CSS variable injection and lazy font loading:

- **CSS Variable Injection**: Converts design system to CSS custom properties (`--pk-primary`, `--pk-secondary`, etc.)
- **Dynamic Typography CSS**: Generates CSS rules for typography scales
- **Lazy Font Loading**: Loads Google Fonts on-demand using the font registry
- **Memory Management**: Cleans up font links on unmount

### 3. Left Sidebar (`src/components/builder/LeftSidebar.tsx`)

Structured exactly like the reference site with collapsible panels:

- **Design Panel**: Global color palette, font selection, typography scales, border radius, custom CSS
- **Blocks Panel**: Categorized block palette (Basic, Layout, Commerce, Social, Marketing)
- **Page Manager**: Collapsible panel below blocks for page selection, creation, duplication, deletion
- **Navigator Panel**: Tree-view of page structure with click-to-scroll
- **AI Panel**: AI assistant for theme generation

### 4. Right Sidebar (`src/components/builder/RightSidebar.tsx`)

Switchable Simple/Advanced styling tabs (not displayed simultaneously):

- **Content Tab**: Edit section content (headings, text, buttons, images, badges, custom classes)
- **Advanced Tab**: Complete dimensional overrides:
  - Colors & Background (solid, gradient, image, video with overlays)
  - Spacing (margin/padding with directional controls)
  - Borders (style, color, width, radius)
  - Shadows (box shadow)
  - Motion FX (transitions, hover effects)
  - Responsive Visibility (desktop/tablet/mobile toggles)
  - Section-level Custom CSS

### 5. TemplateRenderer (`src/components/builder/TemplateRenderer.tsx`)

Section rendering with right-click context menu:

- **Section Rendering**: Renders 15+ block types (heading, text, button, image, columns, grid, products, whatsapp, social, countdown, testimonial, CTA, etc.)
- **Style Application**: Applies SectionStyleOverrides dynamically
- **Right-Click Context Menu**: Edit, Duplicate, Move Up/Down, Delete
- **Viewport Support**: Desktop, tablet, mobile responsive rendering
- **Selection Indicators**: Visual feedback for selected sections

### 6. Media Library (`src/components/builder/MediaLibrary.tsx`)

Preset assets + user upload functionality:

- **Preset Categories**: Fashion, Beauty, Grocery, Electronics, Interior
- **Search Functionality**: Filter images by URL
- **File Upload**: Drag-and-drop or file picker with Base64 conversion
- **User Uploads Tab**: View and select uploaded images
- **Integration**: Seamless binding to section properties

### 7. BuilderWorkspace (`src/components/builder/BuilderWorkspace.tsx`)

Main workspace integrating all components:

- **State Management**: Immutable state updates with undo/redo stack (24 steps)
- **Multi-Page System**: Page selection, creation, duplication, deletion with system page protection
- **Viewport Controls**: Desktop, tablet, mobile preview modes
- **Copy/Paste Styles**: Copy style overrides between sections
- **Auto-Save**: Manual save with loading states
- **Keyboard Shortcuts**: ⌘Z (undo), ⌘⇧Z (redo), ⌘S (save), Del (delete), Esc (deselect)

### 8. Builder Page (`src/app/builder-new/[siteId]/page.tsx`)

New builder page using the workspace component:

- **Site Loading**: Loads existing sites or creates new ones
- **Default Structure**: Applies default design system and pages if missing
- **Error Handling**: Graceful error states with navigation
- **Authentication**: Protected route with user verification

### 9. API Routes (`src/app/api/prokip-sites/[siteId]/route.ts`)

CRUD operations for ProkipSite structure:

- **GET**: Loads site and converts to ProkipSite format
- **PUT**: Updates site, theme, settings, and social links
- **POST**: Creates new site with default structure

## Key Features Implemented

### 1. Theme System
- Dynamic CSS variable injection for instant updates
- Google Fonts lazy loading with registry
- Typography scale customization (h1, h2, h3, body, button, menu)
- Color palette management (primary, secondary, accent, background, text, muted, border)
- Border radius presets

### 2. Multi-Page System
- Page manager with collapsible UI
- Create, duplicate, delete pages
- System page protection (Home, About, Contact cannot be deleted)
- Page routing isolation
- Active page state management

### 3. Advanced Styling
- Elementor-level style overrides
- Directional margin/padding controls
- Background types: color, gradient, image, video
- Background overlays
- Border styling (style, color, width, radius)
- Box shadows
- Motion FX (transitions, hover scale, hover opacity, hover shadow)
- Responsive visibility filters (desktop/tablet/mobile)
- Section-level custom CSS injection

### 4. Media Management
- Preset asset registry by category
- User upload with Base64 conversion
- Media library storage in site object
- Search functionality
- Seamless image replacement

### 5. Undo/Redo System
- 24-step history stack
- Immutable state cloning
- Keyboard shortcuts (⌘Z, ⌘⇧Z)
- Visual feedback in UI

### 6. Copy/Paste Styles
- Copy style overrides from any section
- Paste to any other section
- Preserves destination content
- Visual indicator when styles are copied

### 7. Right-Click Context Menu
- Edit Properties
- Duplicate Block
- Move Level Up/Down
- Delete Block
- Native synthetic event capture

### 8. Viewport Controls
- Desktop preview (full width)
- Tablet preview (768px max)
- Mobile preview (375px max)
- Visual border indicators

### 9. AI Assistant
- AI panel in left sidebar
- Theme generation interface
- Placeholder for AI integration

### 10. Custom CSS
- Global custom CSS editor
- Section-level custom CSS
- Live injection into ThemeProvider

## File Structure

```
src/
├── types/
│   └── index.ts (Updated with Prokip types)
├── components/
│   └── builder/
│       ├── ThemeProvider.tsx (NEW)
│       ├── LeftSidebar.tsx (NEW)
│       ├── RightSidebar.tsx (NEW)
│       ├── TemplateRenderer.tsx (NEW)
│       ├── MediaLibrary.tsx (NEW)
│       └── BuilderWorkspace.tsx (NEW)
├── app/
│   ├── builder-new/
│   │   └── [siteId]/
│   │       └── page.tsx (NEW)
│   └── api/
│       └── prokip-sites/
│           └── [siteId]/
│               └── route.ts (NEW)
```

## Usage

### Accessing the New Builder

Navigate to `/builder-new/[siteId]` where `[siteId]` is your site ID.

### Creating a New Site

If the site doesn't exist, the builder will automatically create it with:
- Default design system
- Default pages (Home, About, Contact)
- Default theme configuration

### Editing

1. **Left Sidebar**: Use Design panel for global theme changes, Blocks panel to add sections, Page Manager to switch between pages
2. **Center Canvas**: Click on sections to select them, right-click for context menu
3. **Right Sidebar**: Use Content tab for content editing, Advanced tab for styling
4. **Viewport Controls**: Switch between desktop, tablet, mobile views
5. **Save**: Click Save button or press ⌘S

### Keyboard Shortcuts

- `⌘Z` - Undo
- `⌘⇧Z` - Redo
- `⌘S` - Save
- `Del` - Delete selected section
- `Esc` - Deselect section

## Integration with Existing Database

The new builder integrates with the existing database structure:

- **Sites**: Uses existing `Site` table
- **Themes**: Uses existing `SiteTheme` table
- **Settings**: Uses existing `SiteSettings` table
- **Social Links**: Uses existing `SiteSocialLinks` table
- **Delivery Zones**: Uses existing `DeliveryZone` table
- **Pages**: Uses existing `Page` table

The API routes handle conversion between the existing schema and the new ProkipSite format.

## Future Enhancements

1. **AI Integration**: Connect to AI API for theme generation and content improvement
2. **Section Serialization**: Convert sections to/from page content format
3. **Drag-and-Drop**: Implement drag-and-drop reordering for sections
4. **Block Templates**: Add pre-built block templates
5. **Export/Import**: Add export/import functionality for site configurations
6. **Real-time Collaboration**: Add multi-user editing support
7. **Version History**: Implement persistent version history
8. **Preview Mode**: Add full-screen preview without editing controls

## Technical Notes

- **State Management**: Uses React hooks with immutable state updates
- **CSS Variables**: Leverages CSS custom properties for performance
- **Font Loading**: Lazy loads Google Fonts to prevent performance issues
- **Responsive Design**: Uses Tailwind CSS for styling
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Error Handling**: Graceful error states with user feedback
- **Performance**: Optimized re-renders using React best practices

## Migration from Old Builder

The old builder (`/builder/[pageId]`) remains unchanged. The new builder is available at `/builder-new/[siteId]` for testing and gradual migration.

To migrate:
1. Test the new builder with existing sites
2. Verify all features work as expected
3. Update navigation links to point to the new builder
4. Deprecate the old builder after validation

## Support

For issues or questions about the new builder implementation, refer to the component files and this documentation.
