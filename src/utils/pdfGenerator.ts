import jsPDF from 'jspdf';
import { Order, StoreSettings } from '../types/index';

export function generateOrderInvoicePDF(order: Order, settings?: StoreSettings) {
  const doc = new jsPDF({
    unit: 'pt',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const storeName = settings?.storeName || 'NovaMart Ghana';
  const storeEmail = settings?.storeEmail || 'support@novamart.com.gh';
  const storePhone = settings?.storePhone || '+233 24 555 0199';
  const storeAddress = settings?.businessAddress || 'Independence Ave, Airport City, Accra, Ghana';
  const currencySymbol = 'GH₵';

  // 1. Header Background Banner
  doc.setFillColor(15, 23, 42); // Slate-900
  doc.rect(0, 0, pageWidth, 100, 'F');

  // Brand Name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(storeName, 40, 50);

  // Subtitle
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // Slate-400
  doc.text('OFFICIAL COMMERCIAL TAX INVOICE & RECEIPT', 40, 68);
  doc.text(`TIN: P0028491823 | GRA VAT/NHIL COMPLIANT`, 40, 82);

  // Invoice Title Right
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(52, 211, 153); // Emerald-400
  doc.text('PAID INVOICE', pageWidth - 40, 50, { align: 'right' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(`Invoice Ref: ${order.orderNumber}`, pageWidth - 40, 68, { align: 'right' });
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-GB')}`, pageWidth - 40, 82, { align: 'right' });

  // 2. Billing & Shipping Metadata
  let y = 130;
  doc.setTextColor(30, 41, 59); // Slate-800
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('BILLED TO:', 40, y);
  doc.text('MERCHANT / SELLER:', pageWidth / 2 + 20, y);

  y += 18;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(order.customerName || 'Customer', 40, y);
  doc.text(storeName, pageWidth / 2 + 20, y);

  y += 14;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Phone: ${order.customerPhone}`, 40, y);
  doc.text(`Phone: ${storePhone}`, pageWidth / 2 + 20, y);

  y += 14;
  doc.text(`Email: ${order.customerEmail || 'N/A'}`, 40, y);
  doc.text(`Email: ${storeEmail}`, pageWidth / 2 + 20, y);

  y += 14;
  const addressText = order.deliveryAddress
    ? `${order.deliveryAddress.address || ''}, ${order.deliveryAddress.city || ''}, ${order.deliveryAddress.region || 'Greater Accra'}`
    : 'Standard Delivery, Ghana';
  doc.text(`Delivery Address: ${addressText}`, 40, y, { maxWidth: pageWidth / 2 - 60 });
  doc.text(`Location: ${storeAddress}`, pageWidth / 2 + 20, y, { maxWidth: pageWidth / 2 - 60 });

  // Payment Status & Method Box
  y += 40;
  doc.setFillColor(241, 245, 249); // Slate-100
  doc.roundedRect(40, y, pageWidth - 80, 36, 6, 6, 'F');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`Payment Method: ${order.paymentMethod.toUpperCase().replace('_', ' ')}`, 55, y + 22);
  doc.text(`Status: ${order.paymentStatus.toUpperCase()}`, pageWidth / 2 - 20, y + 22);
  doc.text(`Txn Ref: ${order.paymentReference || 'NVM-TXN-' + order.id.slice(0, 8)}`, pageWidth - 55, y + 22, { align: 'right' });

  // 3. Table Header
  y += 55;
  doc.setFillColor(226, 232, 240); // Slate-200
  doc.rect(40, y, pageWidth - 80, 24, 'F');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text('ITEM DESCRIPTION', 50, y + 16);
  doc.text('QTY', pageWidth - 220, y + 16, { align: 'center' });
  doc.text('UNIT PRICE', pageWidth - 140, y + 16, { align: 'right' });
  doc.text('TOTAL AMOUNT', pageWidth - 50, y + 16, { align: 'right' });

  // Table Body Rows
  y += 24;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);

  order.items.forEach((item, index) => {
    const rowColor = index % 2 === 0 ? 255 : 248;
    doc.setFillColor(rowColor, rowColor, rowColor);
    doc.rect(40, y, pageWidth - 80, 22, 'F');

    const itemTitle = item.variationName
      ? `${item.productName} (${item.variationName})`
      : item.productName;

    doc.text(itemTitle.length > 40 ? itemTitle.substring(0, 38) + '...' : itemTitle, 50, y + 15);
    doc.text(String(item.quantity), pageWidth - 220, y + 15, { align: 'center' });
    doc.text(`${currencySymbol} ${item.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, pageWidth - 140, y + 15, { align: 'right' });
    doc.text(`${currencySymbol} ${(item.total || (item.unitPrice * item.quantity)).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, pageWidth - 50, y + 15, { align: 'right' });

    y += 22;
  });

  // 4. Totals Summary Section
  y += 15;
  const totalsX = pageWidth - 220;

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Subtotal:', totalsX, y);
  doc.setTextColor(30, 41, 59);
  doc.text(`${currencySymbol} ${order.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, pageWidth - 50, y, { align: 'right' });

  if (order.discount > 0) {
    y += 16;
    doc.setTextColor(225, 29, 72); // Rose-600
    doc.text('Coupon Discount:', totalsX, y);
    doc.text(`-${currencySymbol} ${order.discount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, pageWidth - 50, y, { align: 'right' });
  }

  y += 16;
  doc.setTextColor(100, 116, 139);
  doc.text('Delivery Fee:', totalsX, y);
  doc.setTextColor(30, 41, 59);
  doc.text(order.deliveryFee === 0 ? 'FREE' : `${currencySymbol} ${order.deliveryFee.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, pageWidth - 50, y, { align: 'right' });

  y += 16;
  doc.setTextColor(100, 116, 139);
  doc.text('VAT / NHIL (3.5% Incl):', totalsX, y);
  doc.setTextColor(30, 41, 59);
  doc.text(`${currencySymbol} ${order.tax.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, pageWidth - 50, y, { align: 'right' });

  // Grand Total Highlight Box
  y += 20;
  doc.setFillColor(16, 185, 129); // Emerald-500
  doc.roundedRect(totalsX - 10, y, pageWidth - totalsX - 30, 28, 4, 4, 'F');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('TOTAL PAID:', totalsX, y + 18);
  doc.text(`${currencySymbol} ${order.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, pageWidth - 50, y + 18, { align: 'right' });

  // 5. Courier Waybill & Dispatch Notice
  y += 50;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.line(40, y, pageWidth - 40, y);

  y += 20;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('COURIER DISPATCH & DELIVERY WAYBILL', 40, y);

  y += 15;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Tracking Reference: ${order.trackingNumber || 'GH-EXP-' + order.orderNumber}`, 40, y);
  doc.text(`Courier Partner: NovaExpress Courier Ghana`, 240, y);
  doc.text(`Courier Phone: +233 55 123 4567`, pageWidth - 40, y, { align: 'right' });

  // Footer Note
  y += 35;
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Thank you for shopping with NovaMart Ghana! For returns or warranty claims, contact support@novamart.com.gh', pageWidth / 2, y, { align: 'center' });
  doc.text('Goods received in good condition. Official computerized receipt verified.', pageWidth / 2, y + 12, { align: 'center' });

  // Download PDF file
  doc.save(`Invoice_${order.orderNumber}.pdf`);
}
