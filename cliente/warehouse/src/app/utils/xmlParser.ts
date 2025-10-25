import { Product } from '../types/Product';

// Parser de un producto desde XML
export function parseProductXML(xmlString: string): Product | null {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'application/xml');
    
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      console.error('XML parsing error:', parserError.textContent);
      return null;
    }
    const productElement = xmlDoc.querySelector('data > product');
    if (!productElement) {
      console.error('Product element not found in XML');
      return null;
    }

    const getTextContent = (selector: string): string => {
      const element = productElement.querySelector(selector);
      return element?.textContent?.trim() || '';
    };

    const getNumberContent = (selector: string): number => {
      const text = getTextContent(selector);
      return parseFloat(text) || 0;
    };

    const product: Product = {
      id: getNumberContent('id'),
      sku: getTextContent('sku'),
      name: getTextContent('name'),
      description: getTextContent('description'),
      price: getNumberContent('price'),
      category: getTextContent('category'),
      stock: getNumberContent('stock'),
      createdAt: getTextContent('createdAt'),
      updatedAt: getTextContent('updatedAt')
    };

    return product;
  } catch (error) {
    console.error('Error parsing XML:', error);
    return null;
  }
}

// parser de lista de productos desde XML
export function parseProductsListXML(xmlString: string): { products: Product[], pagination?: any } {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'application/xml');
    
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      console.error('XML parsing error:', parserError.textContent);
      return { products: [] };
    }

    const productElements = xmlDoc.querySelectorAll('data > products > product');
    const products: Product[] = [];

    productElements.forEach(productElement => {
      const getTextContent = (selector: string): string => {
        const element = productElement.querySelector(selector);
        return element?.textContent?.trim() || '';
      };

      const getNumberContent = (selector: string): number => {
        const text = getTextContent(selector);
        return parseFloat(text) || 0;
      };

      const product: Product = {
        id: getNumberContent('id'),
        sku: getTextContent('sku'),
        name: getTextContent('name'),
        description: getTextContent('description'),
        price: getNumberContent('price'),
        category: getTextContent('category'),
        stock: getNumberContent('stock'),
        createdAt: getTextContent('createdAt') || new Date().toISOString(),
        updatedAt: getTextContent('updatedAt') || new Date().toISOString()
      };

      products.push(product);
    });

    const paginationInfo = {
      page: parseInt(xmlDoc.querySelector('pagination > page')?.textContent || '1'),
      limit: parseInt(xmlDoc.querySelector('pagination > limit')?.textContent || '10'),
      total: parseInt(xmlDoc.querySelector('pagination > total')?.textContent || '0'),
      totalPages: parseInt(xmlDoc.querySelector('pagination > totalPages')?.textContent || '1')
    };

    return { products, pagination: paginationInfo };
  } catch (error) {
    console.error('Error parsing products XML:', error);
    return { products: [] };
  }
}