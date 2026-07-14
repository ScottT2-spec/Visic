# Template Extraction Analysis

## Objective
Build a true template extraction pipeline that reads actual template source files and extracts editable components to replace the manual preset system.

## Approach Attempted
Used AST (@babel/parser) to parse React/JSX source files and extract:
- Component structure and hierarchy
- Props and their types
- Images, typography, layout, animations
- JSX elements and their attributes

## Results

### What Worked
- Successfully parsed 5 target templates (Perfumes, Cosmetics, Kids, Handmade Bags, T-Shirts & Prints)
- Extracted accurate component counts:
  - Perfumes: 240 components, 124 images
  - Cosmetics: 176 components, 200 images
  - Kids: 205 components, 147 images
  - Handmade Bags: 203 components, 160 images
  - T-Shirts & Prints: 153 components, 163 images
- Captured component structure and hierarchy correctly
- Extracted image sources, alt text, and attributes
- Identified component types and prop names

### What Didn't Work
- **AST captures TypeScript types, not runtime values**
- Components need actual data (arrays of slides, product objects, etc.)
- AST extraction produces `{ type: "any" }` instead of actual values
- Runtime error: `slides.map is not a function` because props contained type metadata instead of arrays

## Root Cause
React components require runtime data to render correctly:
- Hero sliders need arrays of slide objects with images, text, links
- Product grids need arrays of product data
- Category cards need category information

AST parsing captures the **structure** of the code (types, interfaces, function signatures) but not the **runtime values** that components actually use. This is a fundamental limitation of static analysis.

## Conclusion
**AST-based extraction is unsuitable for this use case.** The current manual preset system is actually the appropriate solution because:

1. **Runtime data cannot be statically extracted**: Components need actual data values that only exist at runtime
2. **Manual presets provide control**: Developers can specify exactly what data each component should use
3. **Type safety**: Manual presets ensure the data structure matches component expectations
4. **Maintainability**: Manual presets are easier to understand and modify than trying to infer values from code

## Alternative Approaches Considered

### 1. Render and Extract from DOM
- Render templates in a browser environment
- Extract actual rendered DOM structure and data
- **Pros**: Captures actual runtime values
- **Cons**: Complex, requires full browser environment, slow, may capture transient state

### 2. Heuristic Value Inference
- Try to infer default values from code patterns
- Look for default prop values, constant definitions
- **Pros**: Better than pure AST
- **Cons**: Still unreliable, many values are computed or come from context

### 3. Hybrid Approach
- Use AST for component structure and hierarchy
- Keep manual data for runtime values
- **Pros**: Best of both worlds
- **Cons**: Still requires manual data entry

### 4. Accept Manual Presets (Recommended)
- Keep the current manual preset system
- Focus on improving the preset authoring experience
- **Pros**: Reliable, maintainable, type-safe
- **Cons**: Requires manual work

## Recommendation
**Keep the current manual preset system.** The AST extraction approach, while technically impressive, doesn't solve the core problem: components need runtime data that cannot be statically extracted from source code.

The existing preset system with manual block definitions is the right architectural choice for this problem space.

## Files Created (For Reference)
- `src/lib/templates/true-template-parser.ts` - AST-based parser (not used in production)
- `src/lib/templates/component-mapper.ts` - Component mapping logic (not used in production)
- `scripts/extract-true-templates.ts` - Extraction script (not used in production)
- `scripts/serialize-extracted-templates.ts` - Serialization script (not used in production)
- `scripts/update-preset-files.ts` - Preset update script (not used in production)
- `scripts/validate-template-extraction.ts` - Validation script (not used in production)

These files demonstrate the extraction approach but are not integrated into the production system.
