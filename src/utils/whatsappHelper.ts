import { CartItem, DeliveryAddress, Product, ProductVariation } from '../types/index';

export function generateWhatsAppProductLink(product: Product, variation?: ProductVariation, storePhone: string = '233245550199'): string {
  const cleanPhone = storePhone.replace(/[^0-9]/g, '');
  const price = variation ? (variation.discountPrice || variation.price) : (product.discountPrice || product.price);
  const variationText = variation ? ` (${variation.name})` : '';

  const message = `Hello NovaMart! 🛒\n\nI want to order this item:\n*Product:* ${product.name}${variationText}\n*Price:* GH₵ ${price.toLocaleString()}\n*Product Link:* ${window.location.origin}/#product-${product.id}\n\nPlease confirm availability and delivery to my location in Ghana.`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function generateWhatsAppCartOrderLink(
  items: CartItem[],
  total: number,
  address?: DeliveryAddress,
  customerName?: string,
  storePhone: string = '233245550199'
): string {
  const cleanPhone = storePhone.replace(/[^0-9]/g, '');

  const itemsList = items
    .map((item, idx) => `${idx + 1}. *${item.name}* ${item.variationName ? `(${item.variationName})` : ''} x ${item.quantity} = GH₵ ${(item.price * item.quantity).toLocaleString()}`)
    .join('\n');

  const addressText = address
    ? `\n*Delivery To:* ${address.address}, ${address.city}, ${address.region} (Phone: ${address.phone})`
    : '';

  const customerText = customerName ? `*Customer:* ${customerName}\n` : '';

  const message = `Hello NovaMart! 🇬🇭\n\nI would like to place an order via WhatsApp:\n\n${customerText}*Items:*\n${itemsList}\n\n*Total Amount:* GH₵ ${total.toLocaleString()}${addressText}\n\nPlease process my order and send Mobile Money payment instructions.`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
