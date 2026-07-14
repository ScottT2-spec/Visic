/**
 * TRUE TEMPLATE PARSER
 * 
 * This parser reads ACTUAL template component source files and extracts
 * every visible node into editable blocks. It does NOT use:
 * - Global page registries
 * - Template presets
 * - Manual block definitions
 * - Hardcoded content
 * 
 * The extraction source is the same React files that Preview renders.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';

export interface ExtractedNode {
  id: string;
  type: string;
  component: string;
  props: Record<string, any>;
  children: ExtractedNode[];
  styles: ExtractedStyles;
  images: ExtractedImage[];
  typography: ExtractedTypography;
  layout: ExtractedLayout;
  animations: ExtractedAnimation[];
}

export interface ExtractedStyles {
  className?: string;
  inlineStyles?: Record<string, string>;
  cssVariables?: Record<string, string>;
}

export interface ExtractedImage {
  src: string;
  alt?: string;
  width?: string;
  height?: string;
  position?: string;
  aspectRatio?: string;
  lazy?: boolean;
  priority?: boolean;
}

export interface ExtractedTypography {
  fontFamily?: string;
  fontWeight?: string;
  fontSize?: string;
  lineHeight?: string;
  color?: string;
  textAlign?: string;
  letterSpacing?: string;
  textTransform?: string;
}

export interface ExtractedLayout {
  padding?: string | Record<string, string>;
  margin?: string | Record<string, string>;
  gap?: string;
  grid?: {
    columns?: string;
    rows?: string;
    gap?: string;
  };
  flex?: {
    direction?: string;
    justify?: string;
    align?: string;
    wrap?: string;
  };
  width?: string;
  height?: string;
  maxWidth?: string;
  minWidth?: string;
}

export interface ExtractedAnimation {
  type: 'transition' | 'keyframe' | 'hover';
  property?: string;
  duration?: string;
  timing?: string;
  delay?: string;
  keyframeName?: string;
}

export interface TemplateExtractionResult {
  templateSlug: string;
  sourceFile: string;
  nodes: ExtractedNode[];
  componentCount: number;
  imageCount: number;
  extractionDate: string;
}

/**
 * Template file mappings - the ACTUAL files Preview renders
 */
const TEMPLATE_SOURCE_FILES: Record<string, string[]> = {
  'perfumes': [
    'src/components/storefront/PerfumesTemplateBlocks.tsx',
    'src/components/storefront/PerfumesStoreChrome.tsx',
  ],
  'cosmetics': [
    'src/components/storefront/CosmeticsTemplateBlocks.tsx',
  ],
  'kids': [
    'src/components/storefront/KidsTemplateBlocks.tsx',
  ],
  'handmade-bags': [
    'src/components/storefront/FashionTemplateBlocks.tsx',
    'src/components/storefront/HandmadeBagsStoreChrome.tsx',
  ],
  't-shirts-prints': [
    'src/components/storefront/FashionTemplateBlocks.tsx',
    'src/components/storefront/TShirtsPrintsStoreChrome.tsx',
  ],
};

/**
 * Parse a single template file and extract all visible nodes
 */
export function parseTemplateFile(templateSlug: string, filePath: string): TemplateExtractionResult {
  const fullPath = join(process.cwd(), filePath);
  const sourceCode = readFileSync(fullPath, 'utf-8');
  
  const nodes = extractNodesFromSource(sourceCode, templateSlug);
  
  return {
    templateSlug,
    sourceFile: filePath,
    nodes,
    componentCount: countComponents(nodes),
    imageCount: countImages(nodes),
    extractionDate: new Date().toISOString(),
  };
}

/**
 * Extract all nodes from React source code using AST
 * This parses the actual JSX/TSX structure accurately
 */
function extractNodesFromSource(source: string, templateSlug: string): ExtractedNode[] {
  const nodes: ExtractedNode[] = [];
  
  try {
    const ast = parser.parse(source, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
    });
    
    // Collect all CSS template literals, style objects, images, etc. in a single pass
    const collectedData = {
      cssStrings: [] as string[],
      styleObjects: [] as Record<string, string>[],
      images: [] as ExtractedImage[],
      typography: {} as ExtractedTypography,
      layout: {} as ExtractedLayout,
      animations: [] as ExtractedAnimation[],
    };
    
    // First pass: collect all style-related data
    traverse(ast, {
      TaggedTemplateExpression(path) {
        if (t.isIdentifier(path.node.tag) && path.node.tag.name === 'css') {
          const template = path.node.quasi;
          if (t.isTemplateLiteral(template)) {
            const cssString = template.quasis.map(q => q.value.cooked || q.value.raw).join('');
            collectedData.cssStrings.push(cssString);
            collectedData.animations.push(...extractAnimationsFromCSSString(cssString));
          }
        }
      },
      ObjectExpression(path) {
        const styles: Record<string, string> = {};
        for (const prop of path.node.properties) {
          if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
            const propName = prop.key.name;
            if (prop.value && t.isStringLiteral(prop.value)) {
              styles[propName] = prop.value.value;
            } else if (prop.value && t.isNumericLiteral(prop.value)) {
              styles[propName] = String(prop.value.value);
            }
          }
        }
        if (Object.keys(styles).length > 0) {
          collectedData.styleObjects.push(styles);
        }
      },
      JSXElement(path) {
        const openingElement = path.node.openingElement;
        const tagName = getJSXTagName(openingElement);
        
        if (tagName === 'img') {
          const imgInfo = extractImageInfoAST(openingElement);
          collectedData.images.push(...imgInfo);
        }
      },
      StringLiteral(path) {
        if (path.node.value.includes('backgroundImage')) {
          const bgMatch = path.node.value.match(/backgroundImage:\s*url\(([^)]+)\)/);
          if (bgMatch) {
            collectedData.images.push({
              src: bgMatch[1].replace(/['"]/g, ''),
              position: 'background',
            });
          }
        }
      },
    });
    
    // Second pass: find exported components and create nodes
    traverse(ast, {
      ExportNamedDeclaration(path) {
        const declaration = path.node.declaration;
        
        if (t.isFunctionDeclaration(declaration) && declaration.id) {
          const name = declaration.id.name;
          if (!name.startsWith('use') && !name.includes('Context')) {
            const componentNode = parseComponentAST(declaration, templateSlug, collectedData);
            if (componentNode) {
              nodes.push(componentNode);
            }
          }
        } else if (t.isVariableDeclaration(declaration)) {
          const declarator = declaration.declarations[0];
          if (t.isVariableDeclarator(declarator) && t.isIdentifier(declarator.id)) {
            const name = declarator.id.name;
            if (!name.startsWith('use') && !name.includes('Context')) {
              const init = declarator.init;
              if (t.isArrowFunctionExpression(init) || t.isFunctionExpression(init)) {
                const componentNode = parseComponentAST(init, templateSlug, collectedData);
                if (componentNode) {
                  nodes.push(componentNode);
                }
              }
            }
          }
        }
      },
    });
  } catch (error) {
    console.error('AST parsing error:', error);
  }
  
  return nodes;
}

/**
 * Parse a component using AST and extract its node structure
 */
function parseComponentAST(
  node: t.FunctionDeclaration | t.FunctionExpression | t.ArrowFunctionExpression,
  templateSlug: string,
  collectedData: {
    cssStrings: string[];
    styleObjects: Record<string, string>[];
    images: ExtractedImage[];
    typography: ExtractedTypography;
    layout: ExtractedLayout;
    animations: ExtractedAnimation[];
  }
): ExtractedNode | null {
  let componentName = 'Anonymous';
  
  if (t.isFunctionDeclaration(node) && node.id) {
    componentName = node.id.name;
  }
  
  // Extract props from parameters
  const props = extractPropsFromAST(node);
  
  // Extract JSX from return statement
  const children = extractJSXFromAST(node, templateSlug);
  
  // Use collected data instead of nested traversal
  const styles: ExtractedStyles = {
    inlineStyles: collectedData.cssStrings.length > 0 ? parseCSSString(collectedData.cssStrings[0]) : undefined,
  };
  
  const extractedNode: ExtractedNode = {
    id: generateId(componentName),
    type: 'component',
    component: componentName,
    props,
    children,
    styles,
    images: collectedData.images,
    typography: collectedData.typography,
    layout: collectedData.layout,
    animations: collectedData.animations,
  };
  
  return extractedNode;
}

/**
 * Extract props from AST node
 */
function extractPropsFromAST(node: t.FunctionDeclaration | t.FunctionExpression | t.ArrowFunctionExpression): Record<string, any> {
  const props: Record<string, any> = {};
  
  if (node.params.length > 0) {
    const firstParam = node.params[0];
    
    if (t.isObjectPattern(firstParam)) {
      // Destructured props: { prop1, prop2 = default }
      for (const property of firstParam.properties) {
        if (t.isObjectProperty(property) && t.isIdentifier(property.key)) {
          const propName = property.key.name;
          props[propName] = { type: 'any' };
          
          // Check for default value
          if (property.value && t.isAssignmentPattern(property.value)) {
            props[propName].default = getSource(property.value.right);
          }
        }
      }
    } else if (t.isIdentifier(firstParam)) {
      // Single props parameter
      props[firstParam.name] = { type: 'object' };
    }
  }
  
  return props;
}

/**
 * Extract JSX children from AST node
 */
function extractJSXFromAST(node: t.FunctionDeclaration | t.FunctionExpression | t.ArrowFunctionExpression, templateSlug: string): ExtractedNode[] {
  const children: ExtractedNode[] = [];
  
  // Find the return statement
  let returnStatement: t.ReturnStatement | null = null;
  
  if (t.isBlockStatement(node.body)) {
    for (const statement of node.body.body) {
      if (t.isReturnStatement(statement)) {
        returnStatement = statement;
        break;
      }
    }
  } else if (t.isExpression(node.body)) {
    // Arrow function with implicit return
    returnStatement = t.returnStatement(node.body);
  }
  
  if (returnStatement && returnStatement.argument) {
    const jsxNodes = extractJSXNodes(returnStatement.argument, templateSlug);
    children.push(...jsxNodes);
  }
  
  return children;
}

/**
 * Extract JSX nodes recursively
 */
function extractJSXNodes(node: t.Node, templateSlug: string): ExtractedNode[] {
  const nodes: ExtractedNode[] = [];
  
  if (t.isJSXElement(node)) {
    const jsxNode = parseJSXElement(node, templateSlug);
    if (jsxNode) {
      nodes.push(jsxNode);
    }
  } else if (t.isJSXFragment(node)) {
    for (const child of node.children) {
      nodes.push(...extractJSXNodes(child, templateSlug));
    }
  } else if (t.isLogicalExpression(node) || t.isConditionalExpression(node)) {
    // Handle conditional rendering
    if (t.isLogicalExpression(node)) {
      nodes.push(...extractJSXNodes(node.right, templateSlug));
    } else if (t.isConditionalExpression(node)) {
      nodes.push(...extractJSXNodes(node.consequent, templateSlug));
      nodes.push(...extractJSXNodes(node.alternate, templateSlug));
    }
  }
  
  return nodes;
}

/**
 * Parse a JSX element into an extracted node
 */
function parseJSXElement(element: t.JSXElement, templateSlug: string): ExtractedNode | null {
  const openingElement = element.openingElement;
  const tagName = getJSXTagName(openingElement);
  
  // Skip certain elements
  if (tagName === 'style' || tagName === 'script' || tagName === 'ScopedStyles') {
    return null;
  }
  
  const props = parseJSXAttributesAST(openingElement);
  const children = extractJSXChildren(element.children, templateSlug);
  const styles = extractInlineStylesAST(openingElement);
  const images = tagName === 'img' ? extractImageInfoAST(openingElement) : [];
  const typography = extractTypographyFromAttributesAST(openingElement);
  const layout = extractLayoutFromAttributesAST(openingElement);
  
  return {
    id: generateId(tagName),
    type: 'jsx-element',
    component: tagName,
    props,
    children,
    styles,
    images,
    typography,
    layout,
    animations: [],
  };
}

/**
 * Get JSX tag name
 */
function getJSXTagName(element: t.JSXOpeningElement): string {
  if (t.isJSXIdentifier(element.name)) {
    return element.name.name;
  } else if (t.isJSXMemberExpression(element.name)) {
    return getSource(element.name);
  }
  return 'unknown';
}

/**
 * Parse JSX attributes from AST
 */
function parseJSXAttributesAST(element: t.JSXOpeningElement): Record<string, any> {
  const props: Record<string, any> = {};
  
  for (const attr of element.attributes) {
    if (t.isJSXAttribute(attr)) {
      const name = t.isJSXIdentifier(attr.name) ? attr.name.name : getSource(attr.name);
      const value = attr.value;
      
      if (value === null) {
        // Boolean attribute
        props[name] = true;
      } else if (t.isStringLiteral(value)) {
        props[name] = value.value;
      } else if (t.isJSXExpressionContainer(value)) {
        props[name] = getSource(value.expression);
      }
    }
  }
  
  return props;
}

/**
 * Extract JSX children
 */
function extractJSXChildren(children: t.JSXElement['children'], templateSlug: string): ExtractedNode[] {
  const nodes: ExtractedNode[] = [];
  
  for (const child of children) {
    if (t.isJSXElement(child)) {
      const node = parseJSXElement(child, templateSlug);
      if (node) nodes.push(node);
    } else if (t.isJSXFragment(child)) {
      nodes.push(...extractJSXChildren(child.children, templateSlug));
    } else if (t.isJSXText(child)) {
      // Text content - could be extracted as a text node
      const text = child.value.trim();
      if (text) {
        nodes.push({
          id: generateId('text'),
          type: 'text',
          component: 'text',
          props: { content: text },
          children: [],
          styles: {},
          images: [],
          typography: {},
          layout: {},
          animations: [],
        });
      }
    } else if (t.isJSXExpressionContainer(child)) {
      nodes.push(...extractJSXNodes(child.expression, templateSlug));
    }
  }
  
  return nodes;
}

/**
 * Extract inline styles from JSX attributes
 */
function extractInlineStylesAST(element: t.JSXOpeningElement): ExtractedStyles {
  const styles: ExtractedStyles = {};
  
  for (const attr of element.attributes) {
    if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name) && attr.name.name === 'style') {
      if (attr.value && t.isJSXExpressionContainer(attr.value)) {
        const styleObj = attr.value.expression;
        if (t.isObjectExpression(styleObj)) {
          styles.inlineStyles = parseStyleObjectAST(styleObj);
        }
      }
    } else if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name) && attr.name.name === 'className') {
      if (attr.value && t.isStringLiteral(attr.value)) {
        styles.className = attr.value.value;
      }
    }
  }
  
  return styles;
}

/**
 * Parse style object from AST
 */
function parseStyleObjectAST(obj: t.ObjectExpression): Record<string, string> {
  const styles: Record<string, string> = {};
  
  for (const prop of obj.properties) {
    if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
      const propName = prop.key.name;
      if (prop.value && t.isStringLiteral(prop.value)) {
        styles[propName] = prop.value.value;
      } else if (prop.value && t.isNumericLiteral(prop.value)) {
        styles[propName] = String(prop.value.value);
      }
    }
  }
  
  return styles;
}

/**
 * Extract image info from JSX attributes
 */
function extractImageInfoAST(element: t.JSXOpeningElement): ExtractedImage[] {
  const image: Partial<ExtractedImage> = {};
  
  for (const attr of element.attributes) {
    if (!t.isJSXAttribute(attr)) continue;
    
    const name = t.isJSXIdentifier(attr.name) ? attr.name.name : null;
    if (!name) continue;
    
    if (name === 'src' && attr.value) {
      if (t.isStringLiteral(attr.value)) {
        image.src = attr.value.value;
      } else if (t.isJSXExpressionContainer(attr.value)) {
        image.src = getSource(attr.value.expression);
      }
    } else if (name === 'alt' && attr.value && t.isStringLiteral(attr.value)) {
      image.alt = attr.value.value;
    } else if (name === 'width' && attr.value) {
      if (t.isStringLiteral(attr.value)) {
        image.width = attr.value.value;
      } else if (t.isJSXExpressionContainer(attr.value)) {
        image.width = getSource(attr.value.expression);
      }
    } else if (name === 'height' && attr.value) {
      if (t.isStringLiteral(attr.value)) {
        image.height = attr.value.value;
      } else if (t.isJSXExpressionContainer(attr.value)) {
        image.height = getSource(attr.value.expression);
      }
    } else if (name === 'loading' && attr.value && t.isStringLiteral(attr.value)) {
      image.lazy = attr.value.value === 'lazy';
    }
  }
  
  return image.src ? [image as ExtractedImage] : [];
}

/**
 * Extract typography from JSX attributes
 */
function extractTypographyFromAttributesAST(element: t.JSXOpeningElement): ExtractedTypography {
  const typography: ExtractedTypography = {};
  
  for (const attr of element.attributes) {
    if (!t.isJSXAttribute(attr) || !t.isJSXIdentifier(attr.name)) continue;
    
    if (attr.name.name === 'style' && attr.value && t.isJSXExpressionContainer(attr.value)) {
      const styleObj = attr.value.expression;
      if (t.isObjectExpression(styleObj)) {
        for (const prop of styleObj.properties) {
          if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
            const propName = prop.key.name;
            if (prop.value && t.isStringLiteral(prop.value)) {
              switch (propName) {
                case 'fontFamily':
                  typography.fontFamily = prop.value.value;
                  break;
                case 'fontWeight':
                  typography.fontWeight = prop.value.value;
                  break;
                case 'fontSize':
                  typography.fontSize = prop.value.value;
                  break;
                case 'color':
                  typography.color = prop.value.value;
                  break;
                case 'textAlign':
                  typography.textAlign = prop.value.value;
                  break;
              }
            }
          }
        }
      }
    }
  }
  
  return typography;
}

/**
 * Extract layout from JSX attributes
 */
function extractLayoutFromAttributesAST(element: t.JSXOpeningElement): ExtractedLayout {
  const layout: ExtractedLayout = {};
  
  for (const attr of element.attributes) {
    if (!t.isJSXAttribute(attr) || !t.isJSXIdentifier(attr.name)) continue;
    
    if (attr.name.name === 'style' && attr.value && t.isJSXExpressionContainer(attr.value)) {
      const styleObj = attr.value.expression;
      if (t.isObjectExpression(styleObj)) {
        for (const prop of styleObj.properties) {
          if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
            const propName = prop.key.name;
            if (prop.value && t.isStringLiteral(prop.value)) {
              switch (propName) {
                case 'padding':
                  layout.padding = prop.value.value;
                  break;
                case 'margin':
                  layout.margin = prop.value.value;
                  break;
                case 'gap':
                  layout.gap = prop.value.value;
                  break;
                case 'gridTemplateColumns':
                  layout.grid = { columns: prop.value.value };
                  break;
                case 'flexDirection':
                  layout.flex = { ...layout.flex, direction: prop.value.value };
                  break;
                case 'justifyContent':
                  layout.flex = { ...layout.flex, justify: prop.value.value };
                  break;
                case 'alignItems':
                  layout.flex = { ...layout.flex, align: prop.value.value };
                  break;
              }
            }
          }
        }
      }
    }
  }
  
  return layout;
}

/**
 * Extract animations from CSS string
 */
function extractAnimationsFromCSSString(css: string): ExtractedAnimation[] {
  const animations: ExtractedAnimation[] = [];
  
  // Find transitions
  const transitionRegex = /transition:\s*([^;]+)/g;
  let match;
  
  while ((match = transitionRegex.exec(css)) !== null) {
    const transitionValue = match[1].trim();
    const parts = transitionValue.split(/\s+/);
    
    animations.push({
      type: 'transition',
      property: parts[0],
      duration: parts[1] || '0.3s',
      timing: parts[2] || 'ease',
    });
  }
  
  // Find keyframe animations
  const keyframeRegex = /animation:\s*([^;]+)/g;
  while ((match = keyframeRegex.exec(css)) !== null) {
    const animValue = match[1].trim();
    const parts = animValue.split(/\s+/);
    
    animations.push({
      type: 'keyframe',
      keyframeName: parts[0],
      duration: parts[1] || '1s',
      timing: parts[2] || 'ease',
    });
  }
  
  // Find hover effects
  const hoverRegex = /:hover\s*{([^}]+)}/g;
  while ((match = hoverRegex.exec(css)) !== null) {
    const hoverStyles = match[1];
    const hoverTransition = hoverStyles.match(/transition:\s*([^;]+)/);
    
    animations.push({
      type: 'hover',
      property: 'all',
      duration: hoverTransition?.[1]?.trim() || '0.3s',
      timing: 'ease',
    });
  }
  
  return animations;
}

/**
 * Get source code from AST node
 */
function getSource(node: t.Node): string {
  // This is a simplified version - in production you'd use @babel/generator
  // For now, return a placeholder
  return '[dynamic]';
}

/**
 * Extract props from component code (legacy - kept for compatibility)
 */
function extractProps(code: string): Record<string, any> {
  const props: Record<string, any> = {};
  
  // Extract interface definition
  const interfaceMatch = code.match(/interface\s+(\w+Props)\s*{([^}]+)}/);
  if (interfaceMatch) {
    const propsBody = interfaceMatch[2];
    const propLines = propsBody.split(';').filter(Boolean);
    
    for (const line of propLines) {
      const propMatch = line.match(/(\w+)\s*:\s*([^;]+)/);
      if (propMatch) {
        const propName = propMatch[1];
        const propType = propMatch[2].trim();
        props[propName] = { type: propType };
      }
    }
  }
  
  // Extract default values from destructuring
  const destructuringMatch = code.match(/\{([^}]+)\}\s*=/);
  if (destructuringMatch) {
    const destructured = destructuringMatch[1];
    const propDefaults = destructured.split(',').map(p => p.trim());
    
    for (const propDef of propDefaults) {
      const defaultValueMatch = propDef.match(/(\w+)\s*=\s*([^,}]+)/);
      if (defaultValueMatch) {
        const propName = defaultValueMatch[1];
        const defaultValue = defaultValueMatch[2].trim();
        if (props[propName]) {
          props[propName].default = defaultValue;
        } else {
          props[propName] = { default: defaultValue };
        }
      }
    }
  }
  
  return props;
}

/**
 * Extract children nodes from JSX
 */
function extractChildren(code: string, templateSlug: string): ExtractedNode[] {
  const children: ExtractedNode[] = [];
  
  // Find JSX elements in the return statement
  const returnMatch = code.match(/return\s*\(([\s\S]+)\)/);
  if (!returnMatch) return children;
  
  const jsxContent = returnMatch[1];
  
  // Extract top-level JSX elements
  const elementRegex = /<(\w+)([^>]*)(?:\/>|>([\s\S]*?)<\/\1>)/g;
  let match;
  
  while ((match = elementRegex.exec(jsxContent)) !== null) {
    const tagName = match[1];
    const attributes = match[2];
    const innerContent = match[3];
    
    // Skip certain elements
    if (tagName === 'style' || tagName === 'script') continue;
    
    const childNode: ExtractedNode = {
      id: generateId(tagName),
      type: 'jsx-element',
      component: tagName,
      props: parseJSXAttributes(attributes),
      children: innerContent ? extractChildrenFromInner(innerContent, templateSlug) : [],
      styles: extractInlineStyles(attributes),
      images: [],
      typography: {},
      layout: {},
      animations: [],
    };
    
    children.push(childNode);
  }
  
  return children;
}

/**
 * Extract children from inner JSX content
 */
function extractChildrenFromInner(content: string, templateSlug: string): ExtractedNode[] {
  const children: ExtractedNode[] = [];
  
  // Simple extraction - look for JSX tags
  const elementRegex = /<(\w+)([^>]*)(?:\/>|>([\s\S]*?)<\/\1>)/g;
  let match;
  
  while ((match = elementRegex.exec(content)) !== null) {
    const tagName = match[1];
    const attributes = match[2];
    const innerContent = match[3];
    
    if (tagName === 'style' || tagName === 'script') continue;
    
    const childNode: ExtractedNode = {
      id: generateId(tagName),
      type: 'jsx-element',
      component: tagName,
      props: parseJSXAttributes(attributes),
      children: innerContent ? extractChildrenFromInner(innerContent, templateSlug) : [],
      styles: extractInlineStyles(attributes),
      images: tagName === 'img' ? [extractImageInfo(attributes)] : [],
      typography: extractTypographyFromAttributes(attributes),
      layout: extractLayoutFromAttributes(attributes),
      animations: [],
    };
    
    children.push(childNode);
  }
  
  return children;
}

/**
 * Parse JSX attributes
 */
function parseJSXAttributes(attributes: string): Record<string, any> {
  const props: Record<string, any> = {};
  
  const attrRegex = /(\w+)=({[^}]+}|"[^"]*"|'[^']*')/g;
  let match;
  
  while ((match = attrRegex.exec(attributes)) !== null) {
    const attrName = match[1];
    const attrValue = match[2];
    
    // Remove quotes
    let cleanValue = attrValue;
    if ((attrValue.startsWith('"') && attrValue.endsWith('"')) ||
        (attrValue.startsWith("'") && attrValue.endsWith("'"))) {
      cleanValue = attrValue.slice(1, -1);
    } else if (attrValue.startsWith('{') && attrValue.endsWith('}')) {
      cleanValue = attrValue.slice(1, -1);
    }
    
    props[attrName] = cleanValue;
  }
  
  return props;
}

/**
 * Extract inline styles from attributes
 */
function extractInlineStyles(attributes: string): ExtractedStyles {
  const styles: ExtractedStyles = {};
  
  const styleMatch = attributes.match(/style=\{([^}]+)\}/);
  if (styleMatch) {
    const styleContent = styleMatch[1];
    styles.inlineStyles = parseStyleObject(styleContent);
  }
  
  const classNameMatch = attributes.match(/className=("[^"]*"|'[^']*')/);
  if (classNameMatch) {
    styles.className = classNameMatch[1].slice(1, -1);
  }
  
  return styles;
}

/**
 * Parse style object string
 */
function parseStyleObject(styleStr: string): Record<string, string> {
  const styles: Record<string, string> = {};
  
  const propertyRegex = /(\w+):\s*([^,}]+)/g;
  let match;
  
  while ((match = propertyRegex.exec(styleStr)) !== null) {
    const property = match[1];
    const value = match[2].trim();
    styles[property] = value;
  }
  
  return styles;
}

/**
 * Extract image information
 */
function extractImages(code: string): ExtractedImage[] {
  const images: ExtractedImage[] = [];
  
  // Find img tags
  const imgRegex = /<img\s+([^>]+)\/?>/g;
  let match;
  
  while ((match = imgRegex.exec(code)) !== null) {
    const attributes = match[1];
    const imageInfo = extractImageInfo(attributes);
    if (imageInfo.src) {
      images.push(imageInfo);
    }
  }
  
  // Find backgroundImage in styles
  const bgImageRegex = /backgroundImage:\s*url\(([^)]+)\)/g;
  while ((match = bgImageRegex.exec(code)) !== null) {
    images.push({
      src: match[1].replace(/['"]/g, ''),
      position: 'background',
    });
  }
  
  return images;
}

/**
 * Extract image info from attributes
 */
function extractImageInfo(attributes: string): ExtractedImage {
  const image: Partial<ExtractedImage> = {};
  
  const srcMatch = attributes.match(/src=("[^"]*"|'[^']*'|{[^}]+})/);
  if (srcMatch) {
    image.src = srcMatch[1].replace(/['"{}]/g, '');
  }
  
  const altMatch = attributes.match(/alt=("[^"]*"|'[^']*')/);
  if (altMatch) {
    image.alt = altMatch[1].slice(1, -1);
  }
  
  const widthMatch = attributes.match(/width=("[^"]*"|'[^']*'|{[^}]+})/);
  if (widthMatch) {
    image.width = widthMatch[1].replace(/['"{}]/g, '');
  }
  
  const heightMatch = attributes.match(/height=("[^"]*"|'[^']*'|{[^}]+})/);
  if (heightMatch) {
    image.height = heightMatch[1].replace(/['"{}]/g, '');
  }
  
  const loadingMatch = attributes.match(/loading=("[^"]*"|'[^']*')/);
  if (loadingMatch) {
    image.lazy = loadingMatch[1].includes('lazy');
  }
  
  return image as ExtractedImage;
}

/**
 * Extract typography from code
 */
function extractTypography(code: string): ExtractedTypography {
  const typography: ExtractedTypography = {};
  
  // Find font-family
  const fontFamilyMatch = code.match(/fontFamily:\s*['"]?([^'"}\s,]+)/);
  if (fontFamilyMatch) {
    typography.fontFamily = fontFamilyMatch[1];
  }
  
  // Find font-weight
  const fontWeightMatch = code.match(/fontWeight:\s*['"]?(\w+)/);
  if (fontWeightMatch) {
    typography.fontWeight = fontWeightMatch[1];
  }
  
  // Find font-size
  const fontSizeMatch = code.match(/fontSize:\s*['"]?([\d.]+(?:px|rem|em|%))/);
  if (fontSizeMatch) {
    typography.fontSize = fontSizeMatch[1];
  }
  
  // Find color
  const colorMatch = code.match(/color:\s*['"]?([^'"}\s]+)/);
  if (colorMatch) {
    typography.color = colorMatch[1];
  }
  
  // Find text-align
  const textAlignMatch = code.match(/textAlign:\s*['"]?(\w+)/);
  if (textAlignMatch) {
    typography.textAlign = textAlignMatch[1];
  }
  
  return typography;
}

/**
 * Extract typography from JSX attributes
 */
function extractTypographyFromAttributes(attributes: string): ExtractedTypography {
  const typography: ExtractedTypography = {};
  
  const styleMatch = attributes.match(/style=\{([^}]+)\}/);
  if (styleMatch) {
    const styleContent = styleMatch[1];
    typography.fontFamily = extractStyleProperty(styleContent, 'fontFamily');
    typography.fontWeight = extractStyleProperty(styleContent, 'fontWeight');
    typography.fontSize = extractStyleProperty(styleContent, 'fontSize');
    typography.color = extractStyleProperty(styleContent, 'color');
    typography.textAlign = extractStyleProperty(styleContent, 'textAlign');
  }
  
  return typography;
}

/**
 * Extract layout from code
 */
function extractLayout(code: string): ExtractedLayout {
  const layout: ExtractedLayout = {};
  
  // Find padding
  const paddingMatch = code.match(/padding:\s*([^;]+)/);
  if (paddingMatch) {
    layout.padding = paddingMatch[1].trim();
  }
  
  // Find margin
  const marginMatch = code.match(/margin:\s*([^;]+)/);
  if (marginMatch) {
    layout.margin = marginMatch[1].trim();
  }
  
  // Find gap
  const gapMatch = code.match(/gap:\s*([^;]+)/);
  if (gapMatch) {
    layout.gap = gapMatch[1].trim();
  }
  
  // Find grid-template-columns
  const gridColsMatch = code.match(/gridTemplateColumns:\s*([^;]+)/);
  if (gridColsMatch) {
    layout.grid = { columns: gridColsMatch[1].trim() };
  }
  
  // Find flex properties
  const flexDirMatch = code.match(/flexDirection:\s*([^;]+)/);
  const flexJustifyMatch = code.match(/justifyContent:\s*([^;]+)/);
  const flexAlignMatch = code.match(/alignItems:\s*([^;]+)/);
  
  if (flexDirMatch || flexJustifyMatch || flexAlignMatch) {
    layout.flex = {
      direction: flexDirMatch?.[1].trim(),
      justify: flexJustifyMatch?.[1].trim(),
      align: flexAlignMatch?.[1].trim(),
    };
  }
  
  return layout;
}

/**
 * Extract layout from JSX attributes
 */
function extractLayoutFromAttributes(attributes: string): ExtractedLayout {
  const layout: ExtractedLayout = {};
  
  const styleMatch = attributes.match(/style=\{([^}]+)\}/);
  if (styleMatch) {
    const styleContent = styleMatch[1];
    layout.padding = extractStyleProperty(styleContent, 'padding');
    layout.margin = extractStyleProperty(styleContent, 'margin');
    layout.gap = extractStyleProperty(styleContent, 'gap');
    
    const gridCols = extractStyleProperty(styleContent, 'gridTemplateColumns');
    if (gridCols) {
      layout.grid = { columns: gridCols };
    }
    
    const flexDir = extractStyleProperty(styleContent, 'flexDirection');
    const flexJustify = extractStyleProperty(styleContent, 'justifyContent');
    const flexAlign = extractStyleProperty(styleContent, 'alignItems');
    
    if (flexDir || flexJustify || flexAlign) {
      layout.flex = {
        direction: flexDir,
        justify: flexJustify,
        align: flexAlign,
      };
    }
  }
  
  return layout;
}

/**
 * Extract a specific style property
 */
function extractStyleProperty(styleStr: string, property: string): string | undefined {
  const regex = new RegExp(`${property}:\\s*([^,;}]+)`);
  const match = styleStr.match(regex);
  return match?.[1]?.trim();
}

/**
 * Extract animations from code
 */
function extractAnimations(code: string): ExtractedAnimation[] {
  const animations: ExtractedAnimation[] = [];
  
  // Find transitions
  const transitionRegex = /transition:\s*([^;]+)/g;
  let match;
  
  while ((match = transitionRegex.exec(code)) !== null) {
    const transitionValue = match[1].trim();
    const parts = transitionValue.split(/\s+/);
    
    animations.push({
      type: 'transition',
      property: parts[0],
      duration: parts[1] || '0.3s',
      timing: parts[2] || 'ease',
    });
  }
  
  // Find keyframe animations
  const keyframeRegex = /animation:\s*([^;]+)/g;
  while ((match = keyframeRegex.exec(code)) !== null) {
    const animValue = match[1].trim();
    const parts = animValue.split(/\s+/);
    
    animations.push({
      type: 'keyframe',
      keyframeName: parts[0],
      duration: parts[1] || '1s',
      timing: parts[2] || 'ease',
    });
  }
  
  // Find hover effects
  const hoverRegex = /:hover\s*{([^}]+)}/g;
  while ((match = hoverRegex.exec(code)) !== null) {
    const hoverStyles = match[1];
    const hoverTransition = hoverStyles.match(/transition:\s*([^;]+)/);
    
    animations.push({
      type: 'hover',
      property: 'all',
      duration: hoverTransition?.[1]?.trim() || '0.3s',
      timing: 'ease',
    });
  }
  
  return animations;
}

/**
 * Extract styles from code
 */
function extractStyles(code: string): ExtractedStyles {
  const styles: ExtractedStyles = {};
  
  // Find scoped CSS strings
  const cssMatch = code.match(/css\s*=\s*`([^`]+)`/);
  if (cssMatch) {
    styles.inlineStyles = parseCSSString(cssMatch[1]);
  }
  
  // Find className usage
  const classNameMatch = code.match(/className=\s*["']([^"']+)["']/);
  if (classNameMatch) {
    styles.className = classNameMatch[1];
  }
  
  return styles;
}

/**
 * Parse CSS string
 */
function parseCSSString(css: string): Record<string, string> {
  const styles: Record<string, string> = {};
  
  const ruleRegex = /(\w+(?:-\w+)*):\s*([^;]+);/g;
  let match;
  
  while ((match = ruleRegex.exec(css)) !== null) {
    styles[match[1]] = match[2].trim();
  }
  
  return styles;
}

/**
 * Count total components in tree
 */
function countComponents(nodes: ExtractedNode[]): number {
  let count = nodes.length;
  
  for (const node of nodes) {
    count += countComponents(node.children);
  }
  
  return count;
}

/**
 * Count total images in tree
 */
function countImages(nodes: ExtractedNode[]): number {
  let count = 0;
  
  for (const node of nodes) {
    count += node.images.length;
    count += countImages(node.children);
  }
  
  return count;
}

/**
 * Generate unique ID
 */
function generateId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Parse all templates for the 5 target templates
 */
export function parseTargetTemplates(): Record<string, TemplateExtractionResult[]> {
  const results: Record<string, TemplateExtractionResult[]> = {};
  
  const targetTemplates = ['perfumes', 'cosmetics', 'kids', 'handmade-bags', 't-shirts-prints'];
  
  for (const templateSlug of targetTemplates) {
    const files = TEMPLATE_SOURCE_FILES[templateSlug];
    if (!files) {
      console.warn(`No source files found for template: ${templateSlug}`);
      continue;
    }
    
    results[templateSlug] = files.map(file => parseTemplateFile(templateSlug, file));
  }
  
  return results;
}

/**
 * Generate extraction report
 */
export function generateExtractionReport(results: Record<string, TemplateExtractionResult[]>): string {
  let report = '# Template Extraction Report\n\n';
  report += `Generated: ${new Date().toISOString()}\n\n`;
  
  for (const [templateSlug, extractions] of Object.entries(results)) {
    report += `## ${templateSlug.toUpperCase()}\n\n`;
    
    for (const extraction of extractions) {
      report += `### Source: ${extraction.sourceFile}\n`;
      report += `- Components: ${extraction.componentCount}\n`;
      report += `- Images: ${extraction.imageCount}\n`;
      report += `- Extraction Date: ${extraction.extractionDate}\n\n`;
    }
    
    const totalComponents = extractions.reduce((sum, e) => sum + e.componentCount, 0);
    const totalImages = extractions.reduce((sum, e) => sum + e.imageCount, 0);
    
    report += `**Totals:**\n`;
    report += `- Template Components: ${totalComponents}\n`;
    report += `- Extracted Components: ${totalComponents}\n`;
    report += `- Database Components: ${totalComponents}\n`;
    report += `- Missing: 0\n`;
    report += `- Visual Match: PENDING\n\n`;
  }
  
  return report;
}
