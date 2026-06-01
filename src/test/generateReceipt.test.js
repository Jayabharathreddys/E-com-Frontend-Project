import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateReceipt } from '../utils/generateReceipt';

// ── jsPDF mock ────────────────────────────────────────────────────────────────
// jsPDF is a browser PDF library — we mock it to test our logic in jsdom.
const mockSave = vi.fn();
const mockText = vi.fn();
const mockRect = vi.fn();
const mockLine = vi.fn();
const mockSetFontSize = vi.fn();
const mockSetFont = vi.fn();
const mockSetTextColor = vi.fn();
const mockSetFillColor = vi.fn();
const mockSetDrawColor = vi.fn();
const mockSplitTextToSize = vi.fn((text) => [text]); // return text unchanged

const MockJsPDF = vi.fn(() => ({
    internal: { pageSize: { getWidth: () => 210 } },
    save: mockSave,
    text: mockText,
    rect: mockRect,
    line: mockLine,
    setFontSize: mockSetFontSize,
    setFont: mockSetFont,
    setTextColor: mockSetTextColor,
    setFillColor: mockSetFillColor,
    setDrawColor: mockSetDrawColor,
    splitTextToSize: mockSplitTextToSize,
}));

// ── Shared test data ──────────────────────────────────────────────────────────
const baseData = {
    orderId: 'order_test123',
    paymentId: 'pay_test456',
    customerName: 'Alice Smith',
    customerEmail: 'alice@test.com',
    items: [
        { title: 'Test Sneakers', price: '49.99', quantity: 2 },
        { title: 'Test Backpack', price: '109.99', quantity: 1 },
    ],
    totalAmount: 209.97,
    date: '2025-01-15T10:30:00.000Z',
};

describe('generateReceipt', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns a jsPDF document instance', () => {
        const doc = generateReceipt(baseData, MockJsPDF);
        expect(doc).toBeDefined();
        expect(typeof doc.save).toBe('function');
    });

    it('constructs jsPDF with correct page settings', () => {
        generateReceipt(baseData, MockJsPDF);
        expect(MockJsPDF).toHaveBeenCalledWith({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
        });
    });

    it('renders the brand name "JBE Commerce"', () => {
        generateReceipt(baseData, MockJsPDF);
        const textCalls = mockText.mock.calls.map((c) => c[0]);
        expect(textCalls).toContain('JBE Commerce');
    });

    it('renders "Payment Receipt" heading', () => {
        generateReceipt(baseData, MockJsPDF);
        const textCalls = mockText.mock.calls.map((c) => c[0]);
        expect(textCalls).toContain('Payment Receipt');
    });

    it('renders the order ID', () => {
        generateReceipt(baseData, MockJsPDF);
        const textCalls = mockText.mock.calls.map((c) => c[0]);
        expect(textCalls).toContain('order_test123');
    });

    it('renders the payment ID', () => {
        generateReceipt(baseData, MockJsPDF);
        const textCalls = mockText.mock.calls.map((c) => c[0]);
        expect(textCalls).toContain('pay_test456');
    });

    it('renders the customer name', () => {
        generateReceipt(baseData, MockJsPDF);
        const textCalls = mockText.mock.calls.map((c) => c[0]);
        expect(textCalls).toContain('Alice Smith');
    });

    it('renders the customer email', () => {
        generateReceipt(baseData, MockJsPDF);
        const textCalls = mockText.mock.calls.map((c) => c[0]);
        expect(textCalls).toContain('alice@test.com');
    });

    it('renders all item titles', () => {
        generateReceipt(baseData, MockJsPDF);
        const textCalls = mockText.mock.calls.map((c) => c[0]);
        expect(textCalls).toContain('Test Sneakers');
        expect(textCalls).toContain('Test Backpack');
    });

    it('renders item quantities', () => {
        generateReceipt(baseData, MockJsPDF);
        const textCalls = mockText.mock.calls.map((c) => c[0]);
        expect(textCalls).toContain('2');
        expect(textCalls).toContain('1');
    });

    it('renders unit prices with Rs. prefix', () => {
        generateReceipt(baseData, MockJsPDF);
        const textCalls = mockText.mock.calls.map((c) => c[0]);
        expect(textCalls).toContain('Rs. 49.99');
        expect(textCalls).toContain('Rs. 109.99');
    });

    it('renders line totals (price × quantity)', () => {
        generateReceipt(baseData, MockJsPDF);
        const textCalls = mockText.mock.calls.map((c) => c[0]);
        expect(textCalls).toContain('Rs. 99.98'); // 49.99 × 2
        expect(textCalls).toContain('Rs. 109.99'); // 109.99 × 1
    });

    it('renders the grand total', () => {
        generateReceipt(baseData, MockJsPDF);
        const textCalls = mockText.mock.calls.map((c) => c[0]);
        expect(textCalls).toContain('Rs. 209.97');
    });

    it('renders a thank-you message in the footer', () => {
        generateReceipt(baseData, MockJsPDF);
        const textCalls = mockText.mock.calls.map((c) => c[0]);
        expect(textCalls.some((t) => t.toLowerCase().includes('thank you'))).toBe(true);
    });

    it('draws at least one filled rectangle (header band)', () => {
        generateReceipt(baseData, MockJsPDF);
        // rect(x, y, w, h, 'F') means filled
        const filledRects = mockRect.mock.calls.filter((c) => c[4] === 'F');
        expect(filledRects.length).toBeGreaterThan(0);
    });

    it('handles missing optional fields gracefully', () => {
        const minimalData = {
            orderId: '',
            paymentId: '',
            customerName: '',
            customerEmail: '',
            items: [],
            totalAmount: 0,
            date: new Date().toISOString(),
        };
        expect(() => generateReceipt(minimalData, MockJsPDF)).not.toThrow();
    });

    it('handles items using name field instead of title', () => {
        const dataWithName = {
            ...baseData,
            items: [{ name: 'Named Product', price: '50', quantity: 1 }],
        };
        generateReceipt(dataWithName, MockJsPDF);
        const textCalls = mockText.mock.calls.map((c) => c[0]);
        expect(textCalls).toContain('Named Product');
    });

    it('handles string prices without crashing', () => {
        const dataStringPrice = {
            ...baseData,
            items: [{ title: 'String Price Item', price: '75.50', quantity: 1 }],
        };
        expect(() => generateReceipt(dataStringPrice, MockJsPDF)).not.toThrow();
    });

    it('does not call doc.save() — caller is responsible for saving', () => {
        generateReceipt(baseData, MockJsPDF);
        // generateReceipt returns the doc; downloadReceipt calls .save()
        expect(mockSave).not.toHaveBeenCalled();
    });
});
