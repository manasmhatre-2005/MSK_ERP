import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Invoice, CompanySettings } from '../../types/index';
import { Printer, Download, Mail, X, ShieldCheck, Ship, Check } from 'lucide-react';
import { api } from '../../services/api';
import { formatCurrency, numberToIndianWords } from '../../utils/currency';
import { EmailSendModal } from '../email/EmailSendModal';
import { InvoiceWatermark } from '../common/InvoiceWatermark';

interface ForwardingBillPrintViewProps {
  invoice: Invoice;
  isOpen?: boolean;
  onClose?: () => void;
  companySettings?: CompanySettings | null;
  displayMode?: 'modal' | 'inline';
}

export const ForwardingBillPrintView: React.FC<ForwardingBillPrintViewProps> = ({
  invoice,
  isOpen = true,
  onClose = () => {},
  companySettings,
  displayMode = 'modal',
}) => {
  const [settings, setSettings] = useState<CompanySettings | null>(companySettings || null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isEmailOpen, setIsEmailOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!settings) {
      api.getSettings().then(setSettings).catch(() => {});
    }
  }, [settings]);

  // Generate QR code for direct PDF verification
  useEffect(() => {
    const token = invoice.verificationToken;
    const origin = window.location.origin;
    const isLocal = origin.includes('localhost') || origin.includes('127.0.0.1');
    const base = isLocal ? 'https://logistics-rouge-omega.vercel.app' : origin;
    const directPdfUrl = token ? `${base}/bills/${token}.pdf` : `${base}/invoices`;

    QRCode.toDataURL(directPdfUrl, {
      width: 140,
      margin: 1,
      color: { dark: '#0f172a', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    })
      .then(setQrDataUrl)
      .catch(() => {});
  }, [invoice.verificationToken]);

  if (!isOpen) return null;

  // Parse notes if they contain forwarding shipment metadata
  let meta: any = {};
  if (invoice.notes) {
    try {
      meta = JSON.parse(invoice.notes);
    } catch {
      meta = {};
    }
  }

  // Company details
  const companyName = settings?.companyName || 'MSK LOGISTIC SOLUTION';
  const address = settings?.address || 'JNPT Township Colony, Sector - 3, Building No. B/48, Office No. 3';
  const city = settings?.city || 'Navi Mumbai';
  const pincode = settings?.pincode || '400702';
  const phone = settings?.phone || '+91 8104592823';
  const email = settings?.email || 'accounts@msklogisticsolution.com';
  const website = settings?.website || 'www.msklogisticsolution.com';
  const gstin = settings?.gstin || '27AXWPK4562G1ZX';
  const pan = settings?.pan || 'AXWPK4562G';

  const bankName = settings?.bankName || 'ICICI Bank';
  const bankAccountNo = settings?.bankAccountNo || '574005000006';
  const bankIfsc = settings?.bankIfsc || 'ICIC0005740';
  const bankBranch = settings?.bankBranch || 'Dronagiri Node (Nhava Sheva)';

  const formatDate = (d: any) => {
    if (!d) return '-';
    const date = new Date(d);
    if (isNaN(date.getTime())) return '-';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Shipment & Container Details
  const containerNo = meta.containerNo || invoice.containers?.[0]?.containerNumber || '-';
  const containerSize = meta.containerSize || invoice.containers?.[0]?.size || '-';
  const jobBookingNo = meta.jobBookingNo || invoice.sbNumbers || invoice.job?.jobNumber || '-';
  const blAwbNo = meta.blAwbNo || invoice.mblHbl || '-';
  const shippingLine = meta.shippingLine || '-';
  const vesselVoyage = meta.vesselVoyage || invoice.vesselVoyage || '-';
  const cfsPort = meta.cfsPort || invoice.portOfLoading || '-';
  const vehicleNo = meta.vehicleNo || '-';

  // Metadata
  const placeOfSupply = meta.placeOfSupply || (invoice.billToState ? `${invoice.billToState} (${invoice.billToStateCode || '27'})` : 'Maharashtra (27)');
  const supplyType = meta.supplyType || (invoice.isInterState ? 'Inter-state' : 'Intra-state');
  const reverseCharge = meta.reverseCharge || 'No';

  // Financials
  const taxableAmount = invoice.taxableAmount ?? 0;
  const isInterState = invoice.isInterState ?? false;
  const cgstAmount = invoice.cgstAmount ?? 0;
  const sgstAmount = invoice.sgstAmount ?? 0;
  const igstAmount = invoice.igstAmount ?? 0;
  const grandTotal = invoice.grandTotal ?? 0;
  const amountInWords = invoice.amountInWords || numberToIndianWords(grandTotal);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      await api.downloadInvoicePdf(invoice.id, invoice.invoiceNumber);
    } catch (err: any) {
      console.error('PDF download error:', err);
      // Fallback direct url
      window.open(api.getInvoicePdfUrl(invoice.id, 'format-1', true), '_blank');
    } finally {
      setDownloading(false);
    }
  };

  const content = (
    <div className="relative bg-white text-slate-900 border border-slate-700 max-w-4xl mx-auto p-6 sm:p-8 font-sans shadow-lg print:border-none print:shadow-none print:p-0 print:max-w-none">
      {/* Centered Watermark */}
      <InvoiceWatermark />

      {/* TOP HEADER: COMPANY DETAILS (Excel Rows 1, 2, 3) */}
      <div className="text-center border-b border-slate-700 pb-3 mb-2 relative">
        {/* Top QR Code (Right side) */}
        {qrDataUrl && (
          <div className="absolute right-0 top-0 hidden sm:flex flex-col items-center">
            <img src={qrDataUrl} alt="Verification QR" className="w-16 h-16 border border-slate-300 p-0.5 rounded" />
            <span className="text-[8px] font-mono font-bold text-slate-500 mt-0.5">SCAN TO VERIFY</span>
          </div>
        )}

        <h1 className="text-2xl font-black uppercase tracking-wide text-slate-950 font-serif">
          {companyName}
        </h1>
        <p className="text-xs text-slate-600 mt-1 font-medium">
          {address}, {city} - {pincode} | Phone: {phone} | Email: {email} | Web: {website}
        </p>
        <p className="text-xs font-bold text-slate-800 mt-1 tracking-wider">
          GSTIN: <span className="font-mono">{gstin}</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; PAN: <span className="font-mono">{pan}</span>
        </p>
      </div>

      {/* TITLE BAR: TAX INVOICE (Excel Row 5) */}
      <div className="bg-slate-900 text-white text-center py-1.5 px-4 font-black uppercase text-sm tracking-widest border border-slate-900 mb-2">
        TAX INVOICE
      </div>

      {/* METADATA GRID (Excel Rows 7 & 8) */}
      <div className="border border-slate-700 text-xs mb-3">
        <div className="grid grid-cols-12 border-b border-slate-300 divide-x divide-slate-300 bg-slate-50/50">
          <div className="col-span-2 px-2.5 py-1.5 font-bold text-slate-700">Invoice No.</div>
          <div className="col-span-3 px-2.5 py-1.5 font-bold font-mono text-slate-950">{invoice.invoiceNumber}</div>
          <div className="col-span-2 px-2.5 py-1.5 font-bold text-slate-700">Invoice Date</div>
          <div className="col-span-2 px-2.5 py-1.5 font-medium text-slate-900">{formatDate(invoice.invoiceDate)}</div>
          <div className="col-span-1 px-2.5 py-1.5 font-bold text-slate-700">Due Date</div>
          <div className="col-span-2 px-2.5 py-1.5 font-medium text-slate-900">{formatDate(invoice.dueDate)}</div>
        </div>
        <div className="grid grid-cols-12 divide-x divide-slate-300">
          <div className="col-span-2 px-2.5 py-1.5 font-bold text-slate-700">Place of Supply</div>
          <div className="col-span-3 px-2.5 py-1.5 font-medium text-slate-900">{placeOfSupply}</div>
          <div className="col-span-2 px-2.5 py-1.5 font-bold text-slate-700">Supply Type</div>
          <div className="col-span-2 px-2.5 py-1.5 font-medium text-slate-900">{supplyType}</div>
          <div className="col-span-1 px-2.5 py-1.5 font-bold text-slate-700">Rev. Charge</div>
          <div className="col-span-2 px-2.5 py-1.5 font-medium text-slate-900">{reverseCharge}</div>
        </div>
      </div>

      {/* TWO-COLUMN BOX: BILL TO & CONTAINER/SHIPMENT (Excel Rows 10 - 18) */}
      <div className="grid grid-cols-12 border border-slate-700 text-xs mb-3 divide-x divide-slate-700">
        {/* Left Column: BILL TO (Cols 1 to 6) */}
        <div className="col-span-6 flex flex-col">
          <div className="bg-slate-100 px-3 py-1.5 font-black uppercase tracking-wider text-[11px] border-b border-slate-700 text-slate-900">
            BILL TO
          </div>
          <div className="p-3 space-y-1.5 text-xs flex-1">
            <div className="grid grid-cols-12 gap-1">
              <span className="col-span-4 font-bold text-slate-600">Customer Name:</span>
              <span className="col-span-8 font-black text-slate-950">{invoice.billToName || '-'}</span>
            </div>
            <div className="grid grid-cols-12 gap-1">
              <span className="col-span-4 font-bold text-slate-600">Billing Address:</span>
              <span className="col-span-8 text-slate-800 leading-snug">{invoice.billToAddress || '-'}</span>
            </div>
            <div className="grid grid-cols-12 gap-1">
              <span className="col-span-4 font-bold text-slate-600">Customer GSTIN:</span>
              <span className="col-span-8 font-mono font-bold text-slate-950">{invoice.billToGstin || '-'}</span>
            </div>
            <div className="grid grid-cols-12 gap-1">
              <span className="col-span-4 font-bold text-slate-600">State / State Code:</span>
              <span className="col-span-8 text-slate-900">
                {invoice.billToState || 'Maharashtra'} / {invoice.billToStateCode || '27'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: CONTAINER / SHIPMENT DETAILS (Cols 7 to 12) */}
        <div className="col-span-6 flex flex-col">
          <div className="bg-slate-100 px-3 py-1.5 font-black uppercase tracking-wider text-[11px] border-b border-slate-700 text-slate-900">
            CONTAINER / SHIPMENT DETAILS
          </div>
          <div className="p-3 space-y-1 text-xs divide-y divide-slate-100">
            <div className="grid grid-cols-12 gap-1 py-0.5">
              <span className="col-span-5 font-bold text-slate-600">Container No.:</span>
              <span className="col-span-7 font-mono font-bold text-slate-950">{containerNo}</span>
            </div>
            <div className="grid grid-cols-12 gap-1 py-0.5">
              <span className="col-span-5 font-bold text-slate-600">Size:</span>
              <span className="col-span-7 font-bold text-slate-900">{containerSize}</span>
            </div>
            <div className="grid grid-cols-12 gap-1 py-0.5">
              <span className="col-span-5 font-bold text-slate-600">Job / Booking No.:</span>
              <span className="col-span-7 font-mono text-slate-900">{jobBookingNo}</span>
            </div>
            <div className="grid grid-cols-12 gap-1 py-0.5">
              <span className="col-span-5 font-bold text-slate-600">BL / AWB No.:</span>
              <span className="col-span-7 font-mono text-slate-900">{blAwbNo}</span>
            </div>
            <div className="grid grid-cols-12 gap-1 py-0.5">
              <span className="col-span-5 font-bold text-slate-600">Shipping Line:</span>
              <span className="col-span-7 text-slate-900">{shippingLine}</span>
            </div>
            <div className="grid grid-cols-12 gap-1 py-0.5">
              <span className="col-span-5 font-bold text-slate-600">Vessel / Voyage:</span>
              <span className="col-span-7 text-slate-900">{vesselVoyage}</span>
            </div>
            <div className="grid grid-cols-12 gap-1 py-0.5">
              <span className="col-span-5 font-bold text-slate-600">CFS / Port:</span>
              <span className="col-span-7 text-slate-900">{cfsPort}</span>
            </div>
            <div className="grid grid-cols-12 gap-1 py-0.5">
              <span className="col-span-5 font-bold text-slate-600">Vehicle No.:</span>
              <span className="col-span-7 font-mono text-slate-900">{vehicleNo}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SERVICE / CHARGES DETAILS TITLE (Excel Row 20) */}
      <div className="bg-slate-800 text-white text-xs font-black uppercase px-3 py-1 tracking-wider border border-slate-800">
        SERVICE / CHARGES DETAILS
      </div>

      {/* TABLE: 8 COLUMNS STRICTLY MATCHING EXCEL ROWS 21 - 33 */}
      <table className="w-full border-collapse border border-slate-700 text-xs mb-3">
        <thead>
          <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-700 text-[10.5px]">
            <th className="border-r border-slate-700 px-2 py-1.5 text-center w-10">Sr. No.</th>
            <th className="border-r border-slate-700 px-2.5 py-1.5 text-left">Description of Service</th>
            <th className="border-r border-slate-700 px-2 py-1.5 text-center w-20">SAC Code</th>
            <th className="border-r border-slate-700 px-2 py-1.5 text-right w-12">Qty</th>
            <th className="border-r border-slate-700 px-2.5 py-1.5 text-right w-24">Rate (₹)</th>
            <th className="border-r border-slate-700 px-2.5 py-1.5 text-right w-28">Taxable Amount (₹)</th>
            <th className="border-r border-slate-700 px-2 py-1.5 text-center w-20">GST Rate</th>
            <th className="px-2.5 py-1.5 text-right w-28">GST Amount (₹)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-300">
          {invoice.items && invoice.items.length > 0 ? (
            invoice.items.map((item, idx) => {
              const taxableVal = item.taxableValue ?? item.amount ?? (item.quantity * item.rate);
              const gstPct = item.igstRate || (item.cgstRate + item.sgstRate) || 18;
              const gstVal = item.igstAmount || ((item.cgstAmount || 0) + (item.sgstAmount || 0)) || Math.round(taxableVal * (gstPct / 100) * 100) / 100;
              return (
                <tr key={item.id || idx} className="hover:bg-slate-50/50">
                  <td className="border-r border-slate-700 px-2 py-1.5 text-center text-slate-700 font-bold">
                    {item.srNo || idx + 1}
                  </td>
                  <td className="border-r border-slate-700 px-2.5 py-1.5 text-slate-900 font-medium">
                    {item.description}
                  </td>
                  <td className="border-r border-slate-700 px-2 py-1.5 text-center font-mono text-slate-800">
                    {item.hsnSacCode || '996719'}
                  </td>
                  <td className="border-r border-slate-700 px-2 py-1.5 text-right font-medium text-slate-900">
                    {item.quantity}
                  </td>
                  <td className="border-r border-slate-700 px-2.5 py-1.5 text-right font-mono text-slate-900">
                    {formatCurrency(item.rate, 'INR')}
                  </td>
                  <td className="border-r border-slate-700 px-2.5 py-1.5 text-right font-mono font-bold text-slate-950">
                    {formatCurrency(taxableVal, 'INR')}
                  </td>
                  <td className="border-r border-slate-700 px-2 py-1.5 text-center text-slate-800">
                    {gstPct}%
                  </td>
                  <td className="px-2.5 py-1.5 text-right font-mono font-bold text-slate-950">
                    {formatCurrency(gstVal, 'INR')}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={8} className="py-4 text-center text-slate-500 italic">
                No charge items recorded.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* TOTALS SECTION (Excel Rows 34 - 38) */}
      <div className="flex justify-end mb-3">
        <div className="w-80 border border-slate-700 text-xs">
          <div className="flex justify-between px-3 py-1.5 border-b border-slate-300 bg-slate-50">
            <span className="font-bold text-slate-700">Total Taxable Value</span>
            <span className="font-mono font-bold text-slate-950">₹ {formatCurrency(taxableAmount, 'INR')}</span>
          </div>
          {!isInterState ? (
            <>
              <div className="flex justify-between px-3 py-1 border-b border-slate-200">
                <span className="text-slate-700">CGST</span>
                <span className="font-mono font-semibold text-slate-900">₹ {formatCurrency(cgstAmount, 'INR')}</span>
              </div>
              <div className="flex justify-between px-3 py-1 border-b border-slate-200">
                <span className="text-slate-700">SGST</span>
                <span className="font-mono font-semibold text-slate-900">₹ {formatCurrency(sgstAmount, 'INR')}</span>
              </div>
            </>
          ) : (
            <div className="flex justify-between px-3 py-1 border-b border-slate-200">
              <span className="text-slate-700">IGST</span>
              <span className="font-mono font-semibold text-slate-900">₹ {formatCurrency(igstAmount, 'INR')}</span>
            </div>
          )}
          <div className="flex justify-between px-3 py-2 bg-slate-900 text-white font-black text-sm">
            <span>Grand Total</span>
            <span className="font-mono">₹ {formatCurrency(grandTotal, 'INR')}</span>
          </div>
        </div>
      </div>

      {/* AMOUNT IN WORDS (Excel Row 40) */}
      <div className="border border-slate-700 px-3 py-2 text-xs font-bold bg-slate-50 mb-3">
        <span className="text-slate-600">Amount in Words: </span>
        <span className="text-slate-950 uppercase">{amountInWords}</span>
      </div>

      {/* BANK DETAILS (Excel Row 42) */}
      <div className="border border-slate-700 px-3 py-2 text-xs mb-3 bg-white">
        <span className="font-bold text-slate-700">Bank Name: </span>
        <span className="font-semibold text-slate-900">{bankName}</span>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <span className="font-bold text-slate-700">A/C No.: </span>
        <span className="font-mono font-bold text-slate-950">{bankAccountNo}</span>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <span className="font-bold text-slate-700">IFSC: </span>
        <span className="font-mono font-bold text-slate-950">{bankIfsc}</span>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <span className="font-bold text-slate-700">Branch: </span>
        <span className="font-semibold text-slate-900">{bankBranch}</span>
      </div>

      {/* SIGNATURES (Excel Row 44) */}
      <div className="grid grid-cols-2 gap-4 border border-slate-700 p-4 text-xs mb-3">
        <div className="flex flex-col justify-end pt-12 text-center border-r border-slate-300 pr-4">
          <div className="border-t border-slate-400 pt-1 font-bold text-slate-800">
            Customer Signature / Seal
          </div>
        </div>
        <div className="flex flex-col justify-end pt-12 text-center pl-4">
          <div className="border-t border-slate-400 pt-1 font-bold text-slate-800">
            For {companyName} &nbsp;|&nbsp; Authorized Signatory
          </div>
        </div>
      </div>

      {/* DECLARATION (Excel Row 46) */}
      <div className="text-[10px] text-slate-600 italic text-center border-t border-slate-300 pt-2">
        Declaration: We declare that this invoice shows the actual price of the services described and that all particulars are true and correct.
      </div>
    </div>
  );

  if (displayMode === 'inline') {
    return content;
  }

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
        <div className="relative bg-slate-100 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[96vh] flex flex-col border border-slate-300 overflow-hidden">
          {/* Action Bar */}
          <div className="flex items-center justify-between px-6 py-3.5 bg-slate-900 text-white shrink-0">
            <div className="flex items-center gap-2">
              <Ship className="w-5 h-5 text-red-500" />
              <span className="font-bold text-sm">Forwarding Bill — GST Invoice Preview</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={downloading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-xs font-semibold text-white shadow-sm transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>{downloading ? 'Downloading...' : 'Download PDF'}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsEmailOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span>Email</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Document Content View */}
          <div className="overflow-y-auto p-4 sm:p-6 flex-1 bg-slate-200/70">
            {content}
          </div>
        </div>
      </div>

      {isEmailOpen && (
        <EmailSendModal
          isOpen={isEmailOpen}
          onClose={() => setIsEmailOpen(false)}
          invoice={invoice}
          templateId="format-1"
        />
      )}
    </>
  );
};
