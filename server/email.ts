/**
 * NovaMart Email Service
 * ──────────────────────
 * Powered by Nodemailer. Supports:
 *   - Gmail (SMTP with App Password)
 *   - Any SMTP provider (SendGrid, Mailgun, Brevo, etc.)
 *
 * Required .env variables:
 *   EMAIL_HOST      — e.g. smtp.gmail.com
 *   EMAIL_PORT      — e.g. 465 (SSL) or 587 (TLS)
 *   EMAIL_SECURE    — "true" for port 465, "false" for 587
 *   EMAIL_USER      — your sending email address
 *   EMAIL_PASS      — Gmail App Password or SMTP password
 *   EMAIL_FROM_NAME — Sender display name (default: NovaMart Ghana)
 *   APP_URL         — Your app URL for links in emails
 */

import nodemailer from 'nodemailer';

// ── Transporter Setup ──────────────────────────────────────────────────────────
function createTransporter() {
  const host = process.env.EMAIL_HOST;
  const port = parseInt(process.env.EMAIL_PORT || '587', 10);
  const secure = process.env.EMAIL_SECURE === 'true';
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!host || !user || !pass) {
    console.warn('[NovaMart Email] ⚠️  EMAIL_HOST / EMAIL_USER / EMAIL_PASS not set — emails will be logged only.');
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    tls: { rejectUnauthorized: false }
  });
}

const transporter = createTransporter();

const FROM_NAME = process.env.EMAIL_FROM_NAME || 'NovaMart Ghana';
const FROM_EMAIL = process.env.EMAIL_USER || 'noreply@novamart.com.gh';
const APP_URL = process.env.APP_URL || 'https://novamart.com.gh';

// ── Core Send Helper ───────────────────────────────────────────────────────────
async function sendMail(to: string, subject: string, html: string): Promise<void> {
  if (!transporter) {
    // Dev fallback — log instead of crash
    console.log(`\n📧 [NovaMart Email — Dev Mode]\nTo: ${to}\nSubject: ${subject}\n[HTML not shown]\n`);
    return;
  }
  try {
    const info = await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to,
      subject,
      html
    });
    console.log(`[NovaMart Email] ✅ Sent to ${to} | MsgId: ${info.messageId}`);
  } catch (err: any) {
    console.error(`[NovaMart Email] ❌ Failed to send to ${to}:`, err.message);
    // Don't throw — email failure should never crash an API response
  }
}

// ── Shared HTML Wrapper ────────────────────────────────────────────────────────
function emailWrapper(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>NovaMart Ghana</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f1f5f9; }
    .wrapper { max-width: 600px; margin: 0 auto; padding: 24px 16px 48px; }
    .card { background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
    .header { background: linear-gradient(135deg, #065f46 0%, #047857 60%, #059669 100%); padding: 32px 32px 28px; }
    .logo-row { display: flex; align-items: center; gap: 12px; }
    .logo-box { width: 40px; height: 40px; background: rgba(255,255,255,0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
    .logo-text { color: #ffffff; font-size: 22px; font-weight: 900; letter-spacing: -0.5px; }
    .logo-text span { color: #6ee7b7; }
    .tagline { color: rgba(255,255,255,0.7); font-size: 11px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 4px; }
    .body { padding: 32px; }
    .footer { background: #f8fafc; padding: 20px 32px; border-top: 1px solid #e2e8f0; text-align: center; }
    .footer p { color: #94a3b8; font-size: 11px; line-height: 1.8; }
    .footer a { color: #059669; text-decoration: none; font-weight: 600; }
    h1 { font-size: 24px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px; margin-bottom: 8px; }
    p { font-size: 14px; color: #475569; line-height: 1.7; margin-bottom: 12px; }
    .badge { display: inline-block; padding: 4px 12px; background: #ecfdf5; color: #065f46; border-radius: 999px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid #d1fae5; margin-bottom: 20px; }
    .btn { display: inline-block; padding: 14px 28px; background: #059669; color: #ffffff !important; font-weight: 800; font-size: 14px; border-radius: 12px; text-decoration: none; letter-spacing: 0.2px; }
    .btn-secondary { background: #f8fafc; color: #1e293b !important; border: 2px solid #e2e8f0; }
    .divider { height: 1px; background: #f1f5f9; margin: 20px 0; }
    .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 20px; margin: 16px 0; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9; }
    .info-row:last-child { border-bottom: none; }
    .info-label { font-size: 12px; color: #94a3b8; font-weight: 600; }
    .info-value { font-size: 13px; color: #1e293b; font-weight: 700; }
    .order-item { display: flex; justify-content: space-between; align-items: flex-start; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
    .order-item:last-child { border-bottom: none; }
    .item-name { font-size: 13px; font-weight: 700; color: #1e293b; }
    .item-meta { font-size: 11px; color: #94a3b8; margin-top: 2px; }
    .item-price { font-size: 13px; font-weight: 800; color: #059669; }
    .total-row { display: flex; justify-content: space-between; padding: 12px 0; }
    .total-label { font-size: 13px; color: #64748b; font-weight: 600; }
    .total-value { font-size: 13px; font-weight: 700; color: #1e293b; }
    .grand-total { font-size: 16px; font-weight: 900; color: #059669; }
    .status-pill { display: inline-block; padding: 6px 16px; border-radius: 999px; font-size: 12px; font-weight: 800; }
    .status-confirmed { background: #ecfdf5; color: #065f46; border: 1px solid #d1fae5; }
    .status-shipped { background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; }
    .status-delivered { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
    .status-cancelled { background: #fff1f2; color: #9f1239; border: 1px solid #fecdd3; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <div class="logo-row">
          <div class="logo-box">🛒</div>
          <div>
            <div class="logo-text">Nova<span>Mart</span></div>
            <div class="tagline">Ghana's Online Superstore</div>
          </div>
        </div>
      </div>
      <div class="body">
        ${content}
      </div>
      <div class="footer">
        <p>
          © ${new Date().getFullYear()} NovaMart Ghana · Accra &amp; Nationwide Delivery<br/>
          <a href="${APP_URL}">Visit Store</a> · <a href="${APP_URL}/account/orders">My Orders</a> · <a href="${APP_URL}/contact">Contact Support</a>
        </p>
        <p style="margin-top:8px">
          You received this email because you have an account with NovaMart Ghana.<br/>
          Questions? Email us at <a href="mailto:support@novamart.com.gh">support@novamart.com.gh</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// ── Currency Formatter ─────────────────────────────────────────────────────────
function ghc(amount: number): string {
  return `GH₵ ${amount.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ── Status Pill Helper ─────────────────────────────────────────────────────────
function statusPill(status: string): string {
  const statusClass =
    status.toLowerCase().includes('confirm') || status.toLowerCase().includes('placed') ? 'status-confirmed' :
    status.toLowerCase().includes('ship') || status.toLowerCase().includes('dispatch') || status.toLowerCase().includes('transit') ? 'status-shipped' :
    status.toLowerCase().includes('deliver') ? 'status-delivered' :
    status.toLowerCase().includes('cancel') ? 'status-cancelled' : 'status-confirmed';
  return `<span class="status-pill ${statusClass}">${status}</span>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// EMAIL TEMPLATES
// ═══════════════════════════════════════════════════════════════════════════════

// 1. Welcome Email (on registration)
export async function sendWelcomeEmail(
  to: string,
  firstName: string
): Promise<void> {
  const html = emailWrapper(`
    <div class="badge">Welcome to NovaMart! 🎉</div>
    <h1>Hey ${firstName}, you're all set!</h1>
    <p>Your NovaMart account is ready. You now have access to thousands of genuine products — delivered across Ghana.</p>
    <p>Here's what you can do right now:</p>
    <div class="info-box" style="padding: 12px 20px;">
      <p style="margin:6px 0">🛍️ &nbsp;<strong>Browse</strong> thousands of products from top brands</p>
      <p style="margin:6px 0">❤️ &nbsp;<strong>Save</strong> items to your wishlist for later</p>
      <p style="margin:6px 0">💳 &nbsp;<strong>Pay</strong> via MTN MoMo, Telecel Cash, or card</p>
      <p style="margin:6px 0">📦 &nbsp;<strong>Track</strong> your orders in real-time</p>
    </div>
    <div style="margin-top: 24px; margin-bottom: 8px;">
      <a href="${APP_URL}" class="btn">Start Shopping →</a>
    </div>
    <p style="font-size:12px; color:#94a3b8; margin-top:16px;">If you didn't create this account, please ignore this email.</p>
  `);

  await sendMail(to, '🎉 Welcome to NovaMart Ghana — Your account is ready!', html);
}

// 2. Order Confirmation Email
interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: Array<{ name: string; quantity: number; price: number; variantName?: string }>;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  tax: number;
  total: number;
  paymentMethod: string;
  paymentReference: string;
  deliveryAddress: {
    street: string;
    city: string;
    region?: string;
    country?: string;
  };
  estimatedDeliveryDate: string;
  trackingNumber: string;
}

export async function sendOrderConfirmationEmail(
  to: string,
  order: OrderEmailData
): Promise<void> {
  const paymentLabel: Record<string, string> = {
    mtn_momo: 'MTN MoMo',
    telecel_cash: 'Telecel Cash',
    airtel_money: 'AirtelTigo Money',
    paystack: 'Paystack (Card)',
    cash_on_delivery: 'Cash on Delivery'
  };

  const itemRows = order.items.map(item => `
    <div class="order-item">
      <div>
        <div class="item-name">${item.name}</div>
        <div class="item-meta">Qty: ${item.quantity}${item.variantName ? ` · ${item.variantName}` : ''}</div>
      </div>
      <div class="item-price">${ghc(item.price * item.quantity)}</div>
    </div>
  `).join('');

  const deliveryDate = new Date(order.estimatedDeliveryDate).toLocaleDateString('en-GH', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const html = emailWrapper(`
    <div class="badge">Order Confirmed ✅</div>
    <h1>Thank you, ${order.customerName.split(' ')[0]}!</h1>
    <p>Your order has been received and is being processed. You'll receive another email when it ships.</p>

    <div class="info-box">
      <div class="info-row">
        <span class="info-label">Order Number</span>
        <span class="info-value">#${order.orderNumber}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Tracking Number</span>
        <span class="info-value">${order.trackingNumber}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Payment Method</span>
        <span class="info-value">${paymentLabel[order.paymentMethod] || order.paymentMethod}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Payment Ref</span>
        <span class="info-value">${order.paymentReference}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Est. Delivery</span>
        <span class="info-value">${deliveryDate}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Deliver To</span>
        <span class="info-value">${order.deliveryAddress.street}, ${order.deliveryAddress.city}</span>
      </div>
    </div>

    <div class="divider"></div>
    <p style="font-weight:800; color:#1e293b; font-size:13px; margin-bottom:8px;">Order Summary</p>
    ${itemRows}

    <div class="divider"></div>
    <div class="total-row">
      <span class="total-label">Subtotal</span>
      <span class="total-value">${ghc(order.subtotal)}</span>
    </div>
    ${order.discount > 0 ? `
    <div class="total-row">
      <span class="total-label">Coupon Discount</span>
      <span class="total-value" style="color:#059669;">−${ghc(order.discount)}</span>
    </div>` : ''}
    <div class="total-row">
      <span class="total-label">Delivery Fee</span>
      <span class="total-value">${order.deliveryFee === 0 ? 'FREE 🎉' : ghc(order.deliveryFee)}</span>
    </div>
    <div class="total-row">
      <span class="total-label">VAT (3.5%)</span>
      <span class="total-value">${ghc(order.tax)}</span>
    </div>
    <div class="divider"></div>
    <div class="total-row">
      <span class="total-label" style="font-size:15px; font-weight:900; color:#1e293b;">Total Paid</span>
      <span class="total-value grand-total">${ghc(order.total)}</span>
    </div>

    <div style="margin-top:24px; margin-bottom:8px;">
      <a href="${APP_URL}/account/orders" class="btn">Track My Order →</a>
    </div>
    <p style="font-size:12px; color:#94a3b8; margin-top:16px;">
      Have a question? Chat with us at <a href="${APP_URL}/contact" style="color:#059669;">novamart.com.gh/contact</a>
    </p>
  `);

  await sendMail(
    to,
    `✅ Order Confirmed — #${order.orderNumber} | NovaMart Ghana`,
    html
  );
}

// 3. Order Status Update Email
export async function sendOrderStatusUpdateEmail(
  to: string,
  customerName: string,
  orderNumber: string,
  trackingNumber: string,
  newStatus: string,
  note?: string
): Promise<void> {
  const statusMessages: Record<string, { emoji: string; headline: string; body: string }> = {
    'Payment Confirmed': {
      emoji: '💳',
      headline: 'Payment Verified — Your order is queued!',
      body: 'Great news! Your payment has been confirmed and your order is now in our processing queue.'
    },
    'Processing': {
      emoji: '📦',
      headline: 'We\'re packing your order!',
      body: 'Our warehouse team is currently picking and packing your items to ensure everything is in perfect condition.'
    },
    'Shipped': {
      emoji: '🚚',
      headline: 'Your order is on the way!',
      body: 'Your package has been handed over to our delivery team and is heading your way. Get ready!'
    },
    'Out for Delivery': {
      emoji: '🏃',
      headline: 'Out for delivery — expect it today!',
      body: 'Your order is out for delivery right now. Our rider is en route to your address. Please make sure someone is available to receive it.'
    },
    'Delivered': {
      emoji: '🎉',
      headline: 'Delivered! Enjoy your purchase.',
      body: 'Your order has been delivered successfully. We hope you love your purchase! Don\'t forget to leave a review.'
    },
    'Cancelled': {
      emoji: '❌',
      headline: 'Your order has been cancelled.',
      body: 'Your order has been cancelled. If you paid online, your refund will be processed within 3–5 business days.'
    }
  };

  const meta = statusMessages[newStatus] || {
    emoji: '🔔',
    headline: `Order status updated to: ${newStatus}`,
    body: 'Your order status has been updated. Log in to your account to see the latest details.'
  };

  const html = emailWrapper(`
    <div class="badge">${meta.emoji} Order Update</div>
    <h1>${meta.headline}</h1>
    <p>${meta.body}</p>
    ${note ? `<div class="info-box"><p style="margin:0; font-style:italic; color:#475569;">"${note}"</p></div>` : ''}

    <div class="info-box">
      <div class="info-row">
        <span class="info-label">Order Number</span>
        <span class="info-value">#${orderNumber}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Tracking Number</span>
        <span class="info-value">${trackingNumber}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Current Status</span>
        <span class="info-value">${statusPill(newStatus)}</span>
      </div>
    </div>

    <div style="margin-top:24px; margin-bottom:8px;">
      <a href="${APP_URL}/account/orders" class="btn">View Order Details →</a>
    </div>
  `);

  await sendMail(
    to,
    `${meta.emoji} Order #${orderNumber} — ${newStatus} | NovaMart Ghana`,
    html
  );
}

// 4. Password Reset Email
export async function sendPasswordResetEmail(
  to: string,
  firstName: string,
  resetToken: string
): Promise<void> {
  const resetLink = `${APP_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(to)}`;

  const html = emailWrapper(`
    <div class="badge">🔐 Password Reset Request</div>
    <h1>Reset Your Password</h1>
    <p>Hi ${firstName}, we received a request to reset your NovaMart password.</p>
    <p>Click the button below to create a new password. This link is valid for <strong>30 minutes</strong>.</p>

    <div style="margin: 28px 0;">
      <a href="${resetLink}" class="btn">Reset My Password →</a>
    </div>

    <div class="divider"></div>
    <p style="font-size:12px;">
      Or copy and paste this link into your browser:<br/>
      <a href="${resetLink}" style="color:#059669; word-break:break-all; font-size:11px;">${resetLink}</a>
    </p>

    <div style="margin-top:20px; padding: 12px 16px; background:#fff1f2; border-radius:10px; border:1px solid #fecdd3;">
      <p style="margin:0; font-size:12px; color:#9f1239;">
        ⚠️ If you did not request a password reset, please ignore this email or contact our support team immediately.
        Your account remains secure.
      </p>
    </div>
  `);

  await sendMail(to, '🔐 NovaMart Ghana — Password Reset Request', html);
}

// 5. New Vendor Application Notification (to admin)
export async function sendVendorApplicationEmail(
  adminEmail: string,
  vendor: {
    storeName: string;
    ownerName: string;
    email: string;
    phone: string;
    businessType: string;
  }
): Promise<void> {
  const html = emailWrapper(`
    <div class="badge">🏪 New Merchant Application</div>
    <h1>New Vendor Wants to Join!</h1>
    <p>A new merchant has submitted an application to sell on NovaMart Ghana. Please review their details below.</p>

    <div class="info-box">
      <div class="info-row">
        <span class="info-label">Store Name</span>
        <span class="info-value">${vendor.storeName}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Owner</span>
        <span class="info-value">${vendor.ownerName}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Email</span>
        <span class="info-value">${vendor.email}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Phone</span>
        <span class="info-value">${vendor.phone}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Business Type</span>
        <span class="info-value">${vendor.businessType}</span>
      </div>
    </div>

    <div style="margin-top:24px; gap: 12px; display: flex;">
      <a href="${APP_URL}/admin?tab=vendors" class="btn">Review Application →</a>
    </div>
  `);

  await sendMail(adminEmail, `🏪 New Vendor Application: ${vendor.storeName} | NovaMart Admin`, html);
}

export default { sendWelcomeEmail, sendOrderConfirmationEmail, sendOrderStatusUpdateEmail, sendPasswordResetEmail, sendVendorApplicationEmail };
