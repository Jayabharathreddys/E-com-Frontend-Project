/**
 * Build a jsPDF A4 receipt document from provided receipt data.
 *
 * @param {object} data - Receipt fields.
 * @param {string} data.orderId - Razorpay order ID.
 * @param {string} data.paymentId - Razorpay payment ID.
 * @param {string} data.customerName - Buyer name.
 * @param {string} data.customerEmail - Buyer email.
 * @param {Array<{title?: string, name?: string, quantity?: number, price?: number|string}>} data.items - Cart items; each item may include title/name, quantity, and price.
 * @param {number|string} data.totalAmount - Grand total in rupees.
 * @param {string} data.date - ISO date string.
 * @param {Function} jsPDFClass - jsPDF constructor to create the document (injected for testability).
 * @returns {object} The constructed jsPDF document instance.
 */
export function generateReceipt(data, jsPDFClass) {
    const { orderId, paymentId, customerName, customerEmail, items, totalAmount, date } = data;

    const doc = new jsPDFClass({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 20;
    const col1 = margin;
    const col2 = 100;
    const col3 = 140;
    const col4 = 175;

    // ── Header band ──────────────────────────────────────────────────────────
    doc.setFillColor(61, 90, 153); // #3d5a99
    doc.rect(0, 0, pageW, 28, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('JBE Commerce', margin, 12);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Payment Receipt', margin, 20);

    // ── Receipt meta ─────────────────────────────────────────────────────────
    doc.setTextColor(40, 40, 40);
    let y = 40;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Date:', col1, y);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date(date).toLocaleString('en-IN'), col1 + 20, y);

    doc.setFont('helvetica', 'bold');
    doc.text('Order ID:', col2, y);
    doc.setFont('helvetica', 'normal');
    doc.text(orderId || '—', col2 + 22, y);
    y += 7;

    doc.setFont('helvetica', 'bold');
    doc.text('Payment ID:', col1, y);
    doc.setFont('helvetica', 'normal');
    doc.text(paymentId || '—', col1 + 26, y);
    y += 12;

    // ── Customer info ─────────────────────────────────────────────────────────
    doc.setFillColor(240, 243, 250);
    doc.rect(margin, y - 4, pageW - margin * 2, 16, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Bill To:', col1, y + 2);
    doc.setFont('helvetica', 'normal');
    doc.text(customerName || '—', col1 + 18, y + 2);
    doc.text(customerEmail || '—', col1 + 18, y + 8);
    y += 22;

    // ── Items table header (extracted so it can be re-drawn on new pages) ────
    const drawTableHeader = (yPos) => {
        doc.setFillColor(61, 90, 153);
        doc.rect(margin, yPos - 4, pageW - margin * 2, 10, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text('Item', col1, yPos + 2);
        doc.text('Qty', col2, yPos + 2);
        doc.text('Unit Price', col3, yPos + 2);
        doc.text('Total', col4, yPos + 2);
        return yPos + 12;
    };

    y = drawTableHeader(y);

    // ── Items rows — with page overflow guard (Fix CR#3) ─────────────────────
    doc.setTextColor(40, 40, 40);
    doc.setFont('helvetica', 'normal');

    // Reserve space for the grand-total block (~24 mm) + footer (~14 mm)
    const rowBottomLimit = pageH - margin - 38;

    items.forEach((item, idx) => {
        const unitPrice = parseFloat(item.price) || 0;
        const qty = item.quantity || 1;
        const lineTotal = unitPrice * qty;

        // If the next row would overflow, add a new page and re-draw the header
        if (y > rowBottomLimit) {
            doc.addPage();
            y = margin + 10;
            y = drawTableHeader(y);
            doc.setTextColor(40, 40, 40);
            doc.setFont('helvetica', 'normal');
        }

        if (idx % 2 === 0) {
            doc.setFillColor(248, 249, 252);
            doc.rect(margin, y - 4, pageW - margin * 2, 8, 'F');
        }

        // Truncate long titles so they don't overflow
        const title = doc.splitTextToSize(item.title || item.name || 'Product', 70)[0];
        doc.text(title, col1, y);
        doc.text(String(qty), col2, y);
        doc.text(`Rs. ${unitPrice.toFixed(2)}`, col3, y);
        doc.text(`Rs. ${lineTotal.toFixed(2)}`, col4, y);
        y += 9;
    });

    // ── Total row ─────────────────────────────────────────────────────────────
    y += 2;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageW - margin, y);
    y += 6;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Grand Total:', col3 - 10, y);
    doc.setTextColor(61, 90, 153);
    doc.text(`Rs. ${Number(totalAmount).toFixed(2)}`, col4, y);
    y += 16;

    // ── Footer ────────────────────────────────────────────────────────────────
    doc.setTextColor(120, 120, 120);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.text('Thank you for shopping with JBE Commerce!', pageW / 2, y, { align: 'center' });
    doc.text(
        'This is a computer-generated receipt and does not require a signature.',
        pageW / 2,
        y + 5,
        {
            align: 'center',
        }
    );

    return doc;
}

/**
 * Generate a PDF receipt from payment data and trigger a browser download.
 *
 * Builds a receipt PDF using the provided payment and customer fields and saves
 * it as `JBE-Receipt-<orderId|timestamp>.pdf` to initiate a browser download.
 *
 * @param {Object} data - Receipt data.
 * @param {string} [data.orderId] - Order identifier.
 * @param {string} [data.paymentId] - Payment identifier.
 * @param {string} [data.customerName] - Customer's full name.
 * @param {string} [data.customerEmail] - Customer's email address.
 * @param {Array<Object>} [data.items] - Line items, each with `title`/`name`, `price`, and `quantity`.
 * @param {number|string} [data.totalAmount] - Grand total amount.
 * @param {string|number|Date} [data.date] - Date to display on the receipt.
 */
export async function downloadReceipt(data) {
    const { jsPDF } = await import('jspdf');
    const doc = generateReceipt(data, jsPDF);
    const fileName = `JBE-Receipt-${data.orderId || Date.now()}.pdf`;
    doc.save(fileName);
}
