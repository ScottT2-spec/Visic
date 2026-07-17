/**
 * AI Store Generator — Industry Image Pools
 * 
 * Curated Unsplash image sets per industry category.
 * Each slot (hero, about, lifestyle, product showcase) has 6-10 options.
 * The generator picks randomly so no two AI stores look identical.
 */

export interface IndustryImageSet {
  hero: string[];        // Full-width hero banners
  about: string[];       // Story / about us lifestyle shots
  lifestyle: string[];   // Secondary lifestyle / imageText blocks
  showcase: string[];    // Product showcase / gallery images
  banner: string[];      // CTA / promo banner backgrounds
}

const POOLS: Record<string, IndustryImageSet> = {
  fashion: {
    hero: [
      "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1920&h=900&fit=crop",
      "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1920&h=900&fit=crop",
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&h=900&fit=crop",
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1920&h=900&fit=crop",
      "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1920&h=900&fit=crop",
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=900&fit=crop",
    ],
    about: [
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&h=600&fit=crop",
    ],
    lifestyle: [
      "https://images.unsplash.com/photo-1434389677669-e08b4cda3b2f?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1581044777550-4cfa60707998?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=800&h=600&fit=crop",
    ],
    showcase: [
      "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1434389677669-e08b4cda3b2f?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1581044777550-4cfa60707998?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&h=700&fit=crop",
    ],
    banner: [
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=600&fit=crop",
      "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1920&h=600&fit=crop",
      "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1920&h=600&fit=crop",
    ],
  },

  electronics: {
    hero: [
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&h=900&fit=crop",
      "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1920&h=900&fit=crop",
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1920&h=900&fit=crop",
      "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1920&h=900&fit=crop",
      "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1920&h=900&fit=crop",
      "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1920&h=900&fit=crop",
    ],
    about: [
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1588508065123-287b28e013da?w=800&h=600&fit=crop",
    ],
    lifestyle: [
      "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&h=600&fit=crop",
    ],
    showcase: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1588508065123-287b28e013da?w=600&h=700&fit=crop",
    ],
    banner: [
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&h=600&fit=crop",
      "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1920&h=600&fit=crop",
      "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1920&h=600&fit=crop",
    ],
  },

  beauty: {
    hero: [
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1920&h=900&fit=crop",
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1920&h=900&fit=crop",
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=1920&h=900&fit=crop",
      "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=1920&h=900&fit=crop",
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1920&h=900&fit=crop",
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=1920&h=900&fit=crop",
    ],
    about: [
      "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1583241475880-083f84372725?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1608979048467-6194b5e0e01f?w=800&h=600&fit=crop",
    ],
    lifestyle: [
      "https://images.unsplash.com/photo-1540555700478-4be289fbec6d?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1631730486572-226d1f595b68?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1576426863848-c21f53c60b19?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&h=600&fit=crop",
    ],
    showcase: [
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1608979048467-6194b5e0e01f?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1583241475880-083f84372725?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1540555700478-4be289fbec6d?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1631730486572-226d1f595b68?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1576426863848-c21f53c60b19?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&h=700&fit=crop",
    ],
    banner: [
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1920&h=600&fit=crop",
      "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=1920&h=600&fit=crop",
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1920&h=600&fit=crop",
    ],
  },

  food: {
    hero: [
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&h=900&fit=crop",
      "https://images.unsplash.com/photo-1543353071-087092ec169a?w=1920&h=900&fit=crop",
      "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=1920&h=900&fit=crop",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&h=900&fit=crop",
      "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1920&h=900&fit=crop",
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1920&h=900&fit=crop",
    ],
    about: [
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1428515613728-6b4607e44363?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1605522469906-3fe226b356bc?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1470784790053-6c2f15e06e3e?w=800&h=600&fit=crop",
    ],
    lifestyle: [
      "https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1543362906-acfc16c67564?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1547592180-85f173990554?w=800&h=600&fit=crop",
    ],
    showcase: [
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1547592180-85f173990554?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1543362906-acfc16c67564?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=600&h=700&fit=crop",
    ],
    banner: [
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&h=600&fit=crop",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&h=600&fit=crop",
      "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=1920&h=600&fit=crop",
    ],
  },

  health: {
    hero: [
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&h=900&fit=crop",
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1920&h=900&fit=crop",
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1920&h=900&fit=crop",
      "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=1920&h=900&fit=crop",
      "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=1920&h=900&fit=crop",
      "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=1920&h=900&fit=crop",
    ],
    about: [
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1511688878353-3a2f5be94cd7?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=600&fit=crop",
    ],
    lifestyle: [
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=600&fit=crop",
    ],
    showcase: [
      "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1612208695882-02f2322b7fee?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1583209814683-c023dd293cc6?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1511688878353-3a2f5be94cd7?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=600&h=700&fit=crop",
    ],
    banner: [
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1920&h=600&fit=crop",
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1920&h=600&fit=crop",
      "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=1920&h=600&fit=crop",
    ],
  },

  "real-estate": {
    hero: [
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&h=900&fit=crop",
      "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1920&h=900&fit=crop",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&h=900&fit=crop",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&h=900&fit=crop",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1920&h=900&fit=crop",
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1920&h=900&fit=crop",
    ],
    about: [
      "https://images.unsplash.com/photo-1560520031-3a4dc4e9de0c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800&h=600&fit=crop",
    ],
    lifestyle: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800&h=600&fit=crop",
    ],
    showcase: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1560520031-3a4dc4e9de0c?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=600&h=700&fit=crop",
    ],
    banner: [
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&h=600&fit=crop",
      "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1920&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&h=600&fit=crop",
    ],
  },

  kids: {
    hero: [
      "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1920&h=900&fit=crop",
      "https://images.unsplash.com/photo-1472162072942-cd5147eb3902?w=1920&h=900&fit=crop",
      "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=1920&h=900&fit=crop",
      "https://images.unsplash.com/photo-1607453998774-d533f65dac99?w=1920&h=900&fit=crop",
      "https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=1920&h=900&fit=crop",
      "https://images.unsplash.com/photo-1540479859555-17af45c78602?w=1920&h=900&fit=crop",
    ],
    about: [
      "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1472162072942-cd5147eb3902?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1607453998774-d533f65dac99?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1585435421671-0c16764628ce?w=800&h=600&fit=crop",
    ],
    lifestyle: [
      "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1540479859555-17af45c78602?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1566004100477-7b3b6bb44c27?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=800&h=600&fit=crop",
    ],
    showcase: [
      "https://images.unsplash.com/photo-1607453998774-d533f65dac99?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1585435421671-0c16764628ce?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1472162072942-cd5147eb3902?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1540479859555-17af45c78602?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1566004100477-7b3b6bb44c27?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1587654780490-2742e832bc91?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1560785496-3c9d27877182?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1576016770956-debb63d92058?w=600&h=700&fit=crop",
    ],
    banner: [
      "https://images.unsplash.com/photo-1472162072942-cd5147eb3902?w=1920&h=600&fit=crop",
      "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=1920&h=600&fit=crop",
      "https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=1920&h=600&fit=crop",
    ],
  },

  grocery: {
    hero: [
      "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1920&h=900&fit=crop",
      "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1920&h=900&fit=crop",
      "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1920&h=900&fit=crop",
      "https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=1920&h=900&fit=crop",
      "https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=1920&h=900&fit=crop",
      "https://images.unsplash.com/photo-1573246123716-6b1782bfc499?w=1920&h=900&fit=crop",
    ],
    about: [
      "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1582284540020-8acbe03f4924?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1610348725531-acac202b9706?w=800&h=600&fit=crop",
    ],
    lifestyle: [
      "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1573246123716-6b1782bfc499?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=800&h=600&fit=crop",
    ],
    showcase: [
      "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1573246123716-6b1782bfc499?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1610348725531-acac202b9706?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1582284540020-8acbe03f4924?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1580913428706-c311e67898b3?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=600&h=700&fit=crop",
    ],
    banner: [
      "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1920&h=600&fit=crop",
      "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1920&h=600&fit=crop",
      "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1920&h=600&fit=crop",
    ],
  },

  interior: {
    hero: [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920&h=900&fit=crop",
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1920&h=900&fit=crop",
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1920&h=900&fit=crop",
      "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=1920&h=900&fit=crop",
      "https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=1920&h=900&fit=crop",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1920&h=900&fit=crop",
    ],
    about: [
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&h=600&fit=crop",
    ],
    lifestyle: [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1616137466211-f736a5909600?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1617104678098-de229db51175?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7c5a38?w=800&h=600&fit=crop",
    ],
    showcase: [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1616137466211-f736a5909600?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1617104678098-de229db51175?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7c5a38?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=600&h=700&fit=crop",
    ],
    banner: [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920&h=600&fit=crop",
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1920&h=600&fit=crop",
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1920&h=600&fit=crop",
    ],
  },

  services: {
    hero: [
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1920&h=900&fit=crop",
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1920&h=900&fit=crop",
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1920&h=900&fit=crop",
      "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1920&h=900&fit=crop",
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&h=900&fit=crop",
      "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=1920&h=900&fit=crop",
    ],
    about: [
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop",
    ],
    lifestyle: [
      "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=600&fit=crop",
    ],
    showcase: [
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&h=700&fit=crop",
      "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=600&h=700&fit=crop",
    ],
    banner: [
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1920&h=600&fit=crop",
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1920&h=600&fit=crop",
      "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1920&h=600&fit=crop",
    ],
  },
};

// ─── Keyword → Industry mapping ─────────────────────────────

const INDUSTRY_KEYWORDS: Record<string, string[]> = {
  fashion: ["fashion", "clothing", "apparel", "clothes", "wear", "boutique", "outfit", "garment", "textile", "sneaker", "shoe", "dress", "shirt", "trouser", "jacket"],
  electronics: ["electronics", "tech", "gadget", "phone", "laptop", "computer", "device", "digital", "smart", "gaming", "accessory", "charger", "earphone", "headphone"],
  beauty: ["beauty", "cosmetic", "makeup", "skincare", "skin", "hair", "nail", "perfume", "fragrance", "spa", "salon", "glow", "cream", "lotion"],
  food: ["food", "restaurant", "bakery", "cafe", "catering", "meal", "cook", "kitchen", "snack", "drink", "beverage", "juice", "smoothie", "pastry", "pizza"],
  health: ["health", "wellness", "fitness", "gym", "supplement", "vitamin", "organic", "natural", "yoga", "pharma", "medical", "therapy", "nutrition"],
  "real-estate": ["real estate", "property", "housing", "apartment", "rental", "land", "building", "construction", "home", "house", "estate", "realtor", "agent", "plot"],
  kids: ["kids", "children", "baby", "toddler", "toy", "playful", "nursery", "infant", "child", "school"],
  grocery: ["grocery", "supermarket", "vegetable", "fruit", "farm", "produce", "market", "fresh"],
  interior: ["interior", "furniture", "decor", "home decor", "decoration", "living", "design", "curtain", "rug", "lamp"],
  services: ["service", "consulting", "agency", "freelance", "cleaning", "laundry", "repair", "plumber", "electric", "church", "ministry", "faith", "worship", "religious", "nonprofit", "charity", "foundation", "ngo", "community", "event", "photography", "studio", "art", "craft", "education", "training", "tutorial", "school", "academy", "institute", "logistics", "transport", "delivery", "auto", "car", "mechanic", "travel", "tour", "hotel", "booking"],
};

// ─── Public API ─────────────────────────────────────────────

/**
 * Detect industry from business type / description keywords.
 * Returns the best-match industry key or "fashion" as default.
 */
export function detectIndustry(businessType: string, description?: string): string {
  const text = `${businessType} ${description || ""}`.toLowerCase();

  let bestMatch = "fashion";
  let bestScore = 0;

  for (const [industry, keywords] of Object.entries(INDUSTRY_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      if (text.includes(kw)) score += kw.length; // longer keyword = stronger signal
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = industry;
    }
  }

  return bestMatch;
}

/**
 * Get a full randomized image set for an industry.
 * Picks one random image per slot from the pool so every store looks unique.
 */
export function getRandomIndustryImages(industry: string): {
  hero: string;
  about: string;
  lifestyle: string;
  showcase: string[];
  banner: string;
} {
  const pool = POOLS[industry] || POOLS.fashion;

  const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
  
  // Fisher-Yates shuffle for proper randomization
  const shuffle = <T>(arr: T[]): T[] => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // Get ALL showcase images shuffled — used for product carousels, category cards, promo tiles
  const shuffledShowcase = shuffle(pool.showcase);

  return {
    hero: pick(pool.hero),
    about: pick(pool.about),
    lifestyle: pick(pool.lifestyle),
    showcase: shuffledShowcase,
    banner: pick(pool.banner),
  };
}

/**
 * Get the full pool for an industry (for cases where you need multiple unique picks).
 */
export function getIndustryPool(industry: string): IndustryImageSet {
  return POOLS[industry] || POOLS.fashion;
}
