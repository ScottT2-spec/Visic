/**
 * Utility to serialize Prisma Decimal values to plain numbers for client components
 * Client Components cannot receive Decimal objects from Server Components
 */

export function serializeProductForClient(product: any): any {
  if (!product) return null;
  
  const serialized = { ...product };
  
  // Convert Decimal fields to numbers
  if (serialized.price !== undefined) {
    serialized.price = Number(serialized.price);
  }
  if (serialized.compareAtPrice !== undefined) {
    serialized.compareAtPrice = Number(serialized.compareAtPrice);
  }
  if (serialized.costPrice !== undefined) {
    serialized.costPrice = Number(serialized.costPrice);
  }
  if (serialized.recurringPrice !== undefined) {
    serialized.recurringPrice = Number(serialized.recurringPrice);
  }
  
  // Handle nested objects
  if (serialized.variants && Array.isArray(serialized.variants)) {
    serialized.variants = serialized.variants.map(serializeProductForClient);
  }
  
  return serialized;
}

export function serializeProductsForClient(products: any[]): any[] {
  if (!Array.isArray(products)) return [];
  return products.map(serializeProductForClient);
}
