import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  FileText,
  AlertCircle,
  CheckCircle,
  Eye,
  Save,
  Search,
  Building2,
  Ship,
  Sparkles,
  Info,
  Calendar,
  Box,
  Truck,
  RotateCcw,
  Check,
} from 'lucide-react';
import { api } from '../../services/api';
import { Invoice, Party, Job, Container, CONTAINER_SIZES } from '../../types/index';
import { formatCurrency, numberToIndianWords } from '../../utils/currency';
import { ForwardingBillPrintView } from './ForwardingBillPrintView';

interface ForwardingBillFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (savedInvoice: Invoice) => void;
  initialParty?: Partial<Party> | null;
}

export interface ForwardingChargeItem {
  id: string;
  srNo: number;
  description: string;
  hsnSacCode: string;
  quantity: number;
  rate: number;
  taxableAmount: number;
  gstRate: number;
  gstAmount: number;
}

export const EXCEL_DEFAULT_SERVICES = [
  { id: 'srv-1', description: 'Ocean Freight', hsnSacCode: '996511', defaultRate: 0, defaultGstRate: 18 },
  { id: 'srv-2', description: 'Transportation Charges', hsnSacCode: '996511', defaultRate: 0, defaultGstRate: 18 },
  { id: 'srv-3', description: 'CFS Charges', hsnSacCode: '996719', defaultRate: 0, defaultGstRate: 18 },
  { id: 'srv-4', description: 'Terminal Handling Charges', hsnSacCode: '996719', defaultRate: 0, defaultGstRate: 18 },
  { id: 'srv-5', description: 'Port / Terminal Charges', hsnSacCode: '996719', defaultRate: 0, defaultGstRate: 18 },
  { id: 'srv-6', description: 'Documentation Charges', hsnSacCode: '996719', defaultRate: 0, defaultGstRate: 18 },
  { id: 'srv-7', description: 'Customs Clearance Charges', hsnSacCode: '996719', defaultRate: 0, defaultGstRate: 18 },
  { id: 'srv-8', description: 'CHA / Agency Charges', hsnSacCode: '996719', defaultRate: 0, defaultGstRate: 18 },
  { id: 'srv-9', description: 'Loading / Unloading', hsnSacCode: '996719', defaultRate: 0, defaultGstRate: 18 },
  { id: 'srv-10', description: 'Stuffing / Destuffing', hsnSacCode: '996719', defaultRate: 0, defaultGstRate: 18 },
  { id: 'srv-11', description: 'Detention / Demurrage', hsnSacCode: '996719', defaultRate: 0, defaultGstRate: 18 },
  { id: 'srv-12', description: 'Other Logistics Charges', hsnSacCode: '996719', defaultRate: 0, defaultGstRate: 18 },
];

export const ForwardingBillForm: React.FC<ForwardingBillFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialParty,
}) => {
  // Master Data
  const [parties, setParties] = useState<Party[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loadingMasters, setLoadingMasters] = useState(false);

  // Invoice Metadata (Rows 7 & 8)
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split('T')[0];
  });
  const [placeOfSupply, setPlaceOfSupply] = useState('Maharashtra (27)');
  const [supplyType, setSupplyType] = useState<'AUTO' | 'Intra-state' | 'Inter-state'>('AUTO');
  const [reverseCharge, setReverseCharge] = useState<'No' | 'Yes'>('No');

  // BILL TO: Customer Details (Rows 10 - 14)
  const [partyId, setPartyId] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [customerGstin, setCustomerGstin] = useState('');
  const [stateAndCode, setStateAndCode] = useState('Maharashtra / 27');
  const [selectedPartyStateCode, setSelectedPartyStateCode] = useState('27');

  // CONTAINER / SHIPMENT DETAILS (Rows 10 - 18)
  const [containerNo, setContainerNo] = useState('MSKU3802319');
  const [containerSize, setContainerSize] = useState('40 FT');
  const [jobBookingNo, setJobBookingNo] = useState('JOB-2026-0819');
  const [blAwbNo, setBlAwbNo] = useState('MEDU67201948');
  const [shippingLine, setShippingLine] = useState('MAERSK LINE');
  const [vesselVoyage, setVesselVoyage] = useState('MSC VALENCIA / 241E');
  const [cfsPort, setCfsPort] = useState('Nhava Sheva (INNSA) / Dronagiri CFS');
  const [vehicleNo, setVehicleNo] = useState('MH-46-AR-8812');

  // SERVICE / CHARGES DETAILS (Rows 20 - 33)
  const [chargeItems, setChargeItems] = useState<ForwardingChargeItem[]>([
    {
      id: 'fwd-item-1',
      srNo: 1,
      description: 'Ocean Freight',
      hsnSacCode: '996511',
      quantity: 1,
      rate: 35000,
      taxableAmount: 35000,
      gstRate: 18,
      gstAmount: 6300,
    },
    {
      id: 'fwd-item-2',
      srNo: 2,
      description: 'Transportation Charges',
      hsnSacCode: '996511',
      quantity: 1,
      rate: 14500,
      taxableAmount: 14500,
      gstRate: 18,
      gstAmount: 2610,
    },
    {
      id: 'fwd-item-3',
      srNo: 3,
      description: 'CFS Charges',
      hsnSacCode: '996719',
      quantity: 1,
      rate: 8500,
      taxableAmount: 8500,
      gstRate: 18,
      gstAmount: 1530,
    },
    {
      id: 'fwd-item-4',
      srNo: 4,
      description: 'Terminal Handling Charges',
      hsnSacCode: '996719',
      quantity: 1,
      rate: 6500,
      taxableAmount: 6500,
      gstRate: 18,
      gstAmount: 1170,
    },
    {
      id: 'fwd-item-5',
      srNo: 5,
      description: 'Documentation Charges',
      hsnSacCode: '996719',
      quantity: 1,
      rate: 2500,
      taxableAmount: 2500,
      gstRate: 18,
      gstAmount: 450,
    },
    {
      id: 'fwd-item-6',
      srNo: 6,
      description: 'Customs Clearance Charges',
      hsnSacCode: '996719',
      quantity: 1,
      rate: 5500,
      taxableAmount: 5500,
      gstRate: 18,
      gstAmount: 990,
    },
  ]);

  // UI state
  const [selectedPresetService, setSelectedPresetService] = useState('');
  const [partySearchTerm, setPartySearchTerm] = useState('');
  const [isPartyDropdownOpen, setIsPartyDropdownOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load masters on mount
  useEffect(() => {
    if (!isOpen) return;
    const loadData = async () => {
      setLoadingMasters(true);
      try {
        const [partiesRes, jobsRes, settingsRes] = await Promise.all([
          api.getParties().catch(() => []),
          api.getJobs().catch(() => []),
          api.getSettings().catch(() => null),
        ]);
        setParties(partiesRes);
        setJobs(jobsRes);
        if (settingsRes) setSettings(settingsRes);

        // Preview next sequence number for Forwarding Bill
        try {
          const nextNoRes = await api.getNextInvoiceNumber('FORWARDING');
          if (nextNoRes && nextNoRes.nextInvoiceNumber) {
            setInvoiceNumber(nextNoRes.nextInvoiceNumber);
          }
        } catch {
          // fallback placeholder
          setInvoiceNumber('MSK/FWD/2026-27/0001');
        }

        // Apply initial party if provided
        const partyToUse = initialParty
          ? partiesRes.find((p) => p.id === initialParty.id) || initialParty
          : partiesRes[0];

        if (partyToUse) {
          handleSelectParty(partyToUse);
        }
      } catch (err: any) {
        console.error('Failed to load forwarding bill masters:', err);
      } finally {
        setLoadingMasters(false);
      }
    };
    loadData();
  }, [isOpen, initialParty]);

  const handleSelectParty = (p: Partial<Party>) => {
    if (!p) return;
    setPartyId(p.id || '');
    setCustomerName(p.legalName || p.tradeName || '');
    const addr = p.registeredAddress || p.billingAddress || '';
    setBillingAddress(addr);
    setCustomerGstin(p.gstin || '');
    const stateName = p.state || 'Maharashtra';
    const sCode = p.stateCode || '27';
    setSelectedPartyStateCode(sCode);
    setStateAndCode(`${stateName} / ${sCode}`);
    setPlaceOfSupply(`${stateName} (${sCode})`);
    setIsPartyDropdownOpen(false);
  };

  // Determine whether supply is inter-state
  const companyStateCode = settings?.stateCode || '27';
  const effectiveIsInterState =
    supplyType === 'Inter-state'
      ? true
      : supplyType === 'Intra-state'
      ? false
      : (selectedPartyStateCode || '27').trim() !== companyStateCode.trim();

  const effectiveSupplyTypeLabel = effectiveIsInterState ? 'Inter-state' : 'Intra-state';

  // Recalculate row amounts
  const handleUpdateItem = (index: number, field: keyof ForwardingChargeItem, value: any) => {
    const updated = [...chargeItems];
    const row = { ...updated[index], [field]: value };

    if (field === 'quantity' || field === 'rate' || field === 'gstRate') {
      const q = parseFloat(field === 'quantity' ? value : row.quantity) || 0;
      const r = parseFloat(field === 'rate' ? value : row.rate) || 0;
      const gst = parseFloat(field === 'gstRate' ? value : row.gstRate) || 0;
      row.taxableAmount = Math.round(q * r * 100) / 100;
      row.gstAmount = Math.round(row.taxableAmount * (gst / 100) * 100) / 100;
    }

    updated[index] = row;
    setChargeItems(updated);
  };

  const handleDeleteItem = (index: number) => {
    const updated = chargeItems.filter((_, i) => i !== index).map((item, idx) => ({
      ...item,
      srNo: idx + 1,
    }));
    setChargeItems(updated);
  };

  const handleAddCustomRow = () => {
    const nextSr = chargeItems.length + 1;
    setChargeItems([
      ...chargeItems,
      {
        id: `fwd-custom-${Date.now()}`,
        srNo: nextSr,
        description: 'Logistics Service Charges',
        hsnSacCode: '996719',
        quantity: 1,
        rate: 0,
        taxableAmount: 0,
        gstRate: 18,
        gstAmount: 0,
      },
    ]);
  };

  const handleAddPresetService = (serviceDescription: string) => {
    const preset = EXCEL_DEFAULT_SERVICES.find((s) => s.description === serviceDescription);
    if (!preset) return;
    const nextSr = chargeItems.length + 1;
    setChargeItems([
      ...chargeItems,
      {
        id: `fwd-preset-${Date.now()}-${nextSr}`,
        srNo: nextSr,
        description: preset.description,
        hsnSacCode: preset.hsnSacCode,
        quantity: 1,
        rate: preset.defaultRate,
        taxableAmount: preset.defaultRate,
        gstRate: preset.defaultGstRate,
        gstAmount: Math.round(preset.defaultRate * (preset.defaultGstRate / 100) * 100) / 100,
      },
    ]);
    setSelectedPresetService('');
  };

  const handlePopulateAll12Presets = () => {
    const items: ForwardingChargeItem[] = EXCEL_DEFAULT_SERVICES.map((s, idx) => ({
      id: `fwd-excel-all-${idx + 1}`,
      srNo: idx + 1,
      description: s.description,
      hsnSacCode: s.hsnSacCode,
      quantity: 1,
      rate: 0,
      taxableAmount: 0,
      gstRate: s.defaultGstRate,
      gstAmount: 0,
    }));
    setChargeItems(items);
  };

  // Totals calculations
  const totalTaxableValue = chargeItems.reduce((acc, curr) => acc + (curr.taxableAmount || 0), 0);
  const totalGstAmount = chargeItems.reduce((acc, curr) => acc + (curr.gstAmount || 0), 0);

  const cgstAmount = effectiveIsInterState ? 0 : Math.round((totalGstAmount / 2) * 100) / 100;
  const sgstAmount = effectiveIsInterState ? 0 : Math.round((totalGstAmount - cgstAmount) * 100) / 100;
  const igstAmount = effectiveIsInterState ? Math.round(totalGstAmount * 100) / 100 : 0;

  const rawGrandTotal = totalTaxableValue + totalGstAmount;
  const grandTotal = Math.round(rawGrandTotal);
  const roundOff = Math.round((grandTotal - rawGrandTotal) * 100) / 100;
  const amountInWords = numberToIndianWords(grandTotal);

  // Bank Info from settings or defaults
  const bankName = settings?.bankName || 'ICICI Bank';
  const bankAccountNo = settings?.bankAccountNo || '574005000006';
  const bankIfsc = settings?.bankIfsc || 'ICIC0005740';
  const bankBranch = settings?.bankBranch || 'Dronagiri Node (Nhava Sheva)';

  // Build Preview Invoice Object
  const previewInvoiceData: Invoice = {
    id: 'fwd-preview-id',
    invoiceNumber: invoiceNumber || 'MSK/FWD/2026-27/0001',
    invoiceDate,
    dueDate,
    partyId,
    billType: 'FORWARDING',
    status: 'DRAFT',
    currency: 'INR',
    billToName: customerName,
    billToGstin: customerGstin,
    billToAddress: billingAddress,
    billToState: stateAndCode.split('/')[0]?.trim() || 'Maharashtra',
    billToStateCode: selectedPartyStateCode,
    isInterState: effectiveIsInterState,
    subtotal: totalTaxableValue,
    taxableAmount: totalTaxableValue,
    discountAmount: 0,
    cgstRate: effectiveIsInterState ? 0 : 9,
    cgstAmount,
    sgstRate: effectiveIsInterState ? 0 : 9,
    sgstAmount,
    igstRate: effectiveIsInterState ? 18 : 0,
    igstAmount,
    totalGst: totalGstAmount,
    roundOff,
    grandTotal,
    paidAmount: 0,
    balanceAmount: grandTotal,
    amountInWords,
    vesselVoyage,
    mblHbl: blAwbNo,
    portOfLoading: cfsPort,
    portOfDischarge: cfsPort,
    sbNumbers: jobBookingNo,
    notes: JSON.stringify({
      placeOfSupply,
      supplyType: effectiveSupplyTypeLabel,
      reverseCharge,
      containerNo,
      containerSize,
      jobBookingNo,
      blAwbNo,
      shippingLine,
      vesselVoyage,
      cfsPort,
      vehicleNo,
    }),
    containers: [
      {
        id: 'cont-1',
        invoiceId: 'fwd-preview-id',
        containerNumber: containerNo,
        size: containerSize,
        type: 'GP',
        emptyGroundDays: 0,
        daysAfterCarting: 0,
        loadedGroundDays: 0,
        htCharges: 0,
        logisticsCharges: totalTaxableValue,
        emptyTransportCharges: 0,
      },
    ],
    items: chargeItems.map((ci) => ({
      id: ci.id,
      invoiceId: 'fwd-preview-id',
      srNo: ci.srNo,
      description: ci.description,
      hsnSacCode: ci.hsnSacCode,
      quantity: ci.quantity,
      unit: 'PER_CONTAINER',
      rate: ci.rate,
      amount: ci.taxableAmount,
      discount: 0,
      taxableValue: ci.taxableAmount,
      cgstRate: effectiveIsInterState ? 0 : ci.gstRate / 2,
      cgstAmount: effectiveIsInterState ? 0 : Math.round((ci.gstAmount / 2) * 100) / 100,
      sgstRate: effectiveIsInterState ? 0 : ci.gstRate / 2,
      sgstAmount: effectiveIsInterState ? 0 : Math.round((ci.gstAmount / 2) * 100) / 100,
      igstRate: effectiveIsInterState ? ci.gstRate : 0,
      igstAmount: effectiveIsInterState ? ci.gstAmount : 0,
      totalAmount: ci.taxableAmount + ci.gstAmount,
    })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const handleSaveInvoice = async (finalStatus: 'DRAFT' | 'FINALIZED') => {
    if (!partyId) {
      setErrorMessage('Please select a Customer / Party.');
      return;
    }
    if (chargeItems.length === 0) {
      setErrorMessage('Please add at least one service/charge item.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        invoiceDate,
        dueDate,
        partyId,
        billType: 'FORWARDING',
        status: finalStatus,
        currency: 'INR',
        vesselVoyage,
        mblHbl: blAwbNo,
        portOfLoading: cfsPort,
        sbNumbers: jobBookingNo,
        notes: JSON.stringify({
          placeOfSupply,
          supplyType: effectiveSupplyTypeLabel,
          reverseCharge,
          containerNo,
          containerSize,
          jobBookingNo,
          blAwbNo,
          shippingLine,
          vesselVoyage,
          cfsPort,
          vehicleNo,
        }),
        containers: [
          {
            containerNumber: containerNo,
            size: containerSize,
            type: 'GP',
          },
        ],
        items: chargeItems.map((ci) => ({
          srNo: ci.srNo,
          description: ci.description,
          hsnSacCode: ci.hsnSacCode,
          quantity: ci.quantity,
          unit: 'PER_CONTAINER',
          rate: ci.rate,
          discount: 0,
          cgstRate: effectiveIsInterState ? 0 : ci.gstRate / 2,
          sgstRate: effectiveIsInterState ? 0 : ci.gstRate / 2,
          igstRate: effectiveIsInterState ? ci.gstRate : 0,
        })),
        forceInterState: effectiveIsInterState,
        customTotalGstRate: 18,
      };

      const created = await api.createInvoice(payload);

      // If requested FINALIZED, finalize explicitly to update ledgers & document cache
      let finalInvoice = created;
      if (finalStatus === 'FINALIZED' && created.status !== 'FINALIZED') {
        try {
          finalInvoice = await api.finalizeInvoice(created.id);
        } catch (fe) {
          console.warn('Finalize call returned error, proceeding with created invoice:', fe);
        }
      }

      onSuccess(finalInvoice);
      onClose();
    } catch (err: any) {
      console.error('Error saving forwarding invoice:', err);
      setErrorMessage(err.message || 'Failed to save Forwarding Bill. Please check input values.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[96vh] flex flex-col border border-slate-300 overflow-hidden text-slate-900">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 text-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-md shadow-red-950/40">
                <Ship className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-red-500/30 border border-red-400/40 text-red-200 px-2 py-0.5 rounded">
                    FORWARDING BILL — EXCEL CONTAINER FORMAT
                  </span>
                  <span className="text-xs text-slate-300 font-mono">
                    {invoiceNumber || 'MSK/FWD/...'}
                  </span>
                </div>
                <h2 className="text-lg font-bold tracking-tight text-white mt-0.5">
                  Professional GST Tax Invoice (Forwarding)
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700/80 hover:bg-slate-700 text-slate-100 text-xs font-semibold border border-slate-600 transition-colors shadow-2xs"
              >
                <Eye className="w-4 h-4 text-slate-300" />
                <span>Live Preview</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-white hover:bg-slate-800 p-2 rounded-lg transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Form Scroll Body */}
          <div className="overflow-y-auto p-4 sm:p-6 space-y-5 flex-1 bg-slate-50/50">
            {errorMessage && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* SECTION 1: INVOICE METADATA (Excel Rows 7 & 8) */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
              <div className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-red-600" />
                <span>1. Invoice Metadata & Place of Supply</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Invoice No.
                  </label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    placeholder="MSK/FWD/2026-27/0001"
                    className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Invoice Date
                  </label>
                  <input
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Place of Supply
                  </label>
                  <input
                    type="text"
                    value={placeOfSupply}
                    onChange={(e) => setPlaceOfSupply(e.target.value)}
                    placeholder="e.g. Maharashtra (27)"
                    className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Supply Type
                  </label>
                  <select
                    value={supplyType}
                    onChange={(e: any) => setSupplyType(e.target.value)}
                    className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-red-500"
                  >
                    <option value="AUTO">Auto-detect ({effectiveSupplyTypeLabel})</option>
                    <option value="Intra-state">Intra-state (CGST + SGST)</option>
                    <option value="Inter-state">Inter-state (IGST)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Reverse Charge
                  </label>
                  <select
                    value={reverseCharge}
                    onChange={(e: any) => setReverseCharge(e.target.value)}
                    className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-red-500"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION 2: TWO-COLUMN BOX (BILL TO & CONTAINER/SHIPMENT) (Excel Rows 10 - 18) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Left Column: BILL TO */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-red-600" />
                      <span>BILL TO (Customer Information)</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">Excel Rows 10-14</span>
                  </div>

                  {/* Customer Quick Search Dropdown */}
                  <div className="relative mb-3">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Select Party from Database
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search existing customer / party..."
                        value={customerName}
                        onFocus={() => setIsPartyDropdownOpen(true)}
                        onChange={(e) => {
                          setCustomerName(e.target.value);
                          setPartySearchTerm(e.target.value);
                          setIsPartyDropdownOpen(true);
                        }}
                        className="w-full text-xs font-bold px-3 py-2 rounded-lg border border-slate-300 pl-8 focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    </div>

                    {isPartyDropdownOpen && parties.length > 0 && (
                      <div className="absolute z-20 left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl">
                        {parties
                          .filter(
                            (p) =>
                              !partySearchTerm ||
                              p.legalName.toLowerCase().includes(partySearchTerm.toLowerCase()) ||
                              (p.tradeName && p.tradeName.toLowerCase().includes(partySearchTerm.toLowerCase())) ||
                              (p.gstin && p.gstin.toLowerCase().includes(partySearchTerm.toLowerCase()))
                          )
                          .map((p) => (
                            <div
                              key={p.id}
                              onClick={() => handleSelectParty(p)}
                              className="px-3 py-2 text-xs hover:bg-red-50 hover:text-red-900 cursor-pointer border-b border-slate-50 flex items-center justify-between"
                            >
                              <div>
                                <span className="font-bold text-slate-800">{p.legalName}</span>
                                <span className="text-[11px] text-slate-400 ml-2">({p.state || 'Maharashtra'})</span>
                              </div>
                              <span className="font-mono text-[10px] text-slate-500">{p.gstin || 'No GSTIN'}</span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                        Billing Address
                      </label>
                      <textarea
                        rows={2}
                        value={billingAddress}
                        onChange={(e) => setBillingAddress(e.target.value)}
                        placeholder="Customer full registered / billing address"
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-red-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                          Customer GSTIN
                        </label>
                        <input
                          type="text"
                          value={customerGstin}
                          onChange={(e) => setCustomerGstin(e.target.value)}
                          placeholder="27AABCU9603R1ZM"
                          className="w-full text-xs font-mono font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-red-500 uppercase"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                          State / State Code
                        </label>
                        <input
                          type="text"
                          value={stateAndCode}
                          onChange={(e) => setStateAndCode(e.target.value)}
                          placeholder="Maharashtra / 27"
                          className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-red-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: CONTAINER / SHIPMENT DETAILS */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
                <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Box className="w-3.5 h-3.5 text-red-600" />
                    <span>CONTAINER / SHIPMENT DETAILS</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Excel Rows 11-18</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Container No.
                    </label>
                    <input
                      type="text"
                      value={containerNo}
                      onChange={(e) => setContainerNo(e.target.value.toUpperCase())}
                      placeholder="MSKU3802319"
                      className="w-full text-xs font-mono font-bold px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-red-500 uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Size
                    </label>
                    <select
                      value={containerSize}
                      onChange={(e) => setContainerSize(e.target.value)}
                      className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-red-500"
                    >
                      {CONTAINER_SIZES.map((sz) => (
                        <option key={sz} value={sz}>
                          {sz}
                        </option>
                      ))}
                      <option value="20 FT">20 FT</option>
                      <option value="40 FT">40 FT</option>
                      <option value="40 HC">40 HC</option>
                      <option value="45 FT">45 FT</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Job / Booking No.
                    </label>
                    <input
                      type="text"
                      value={jobBookingNo}
                      onChange={(e) => setJobBookingNo(e.target.value)}
                      placeholder="JOB-2026-0819"
                      className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      BL / AWB No.
                    </label>
                    <input
                      type="text"
                      value={blAwbNo}
                      onChange={(e) => setBlAwbNo(e.target.value)}
                      placeholder="MEDU67201948"
                      className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Shipping Line
                    </label>
                    <input
                      type="text"
                      value={shippingLine}
                      onChange={(e) => setShippingLine(e.target.value)}
                      placeholder="e.g. MAERSK / MSC / CMA CGM"
                      className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Vessel / Voyage
                    </label>
                    <input
                      type="text"
                      value={vesselVoyage}
                      onChange={(e) => setVesselVoyage(e.target.value)}
                      placeholder="MSC VALENCIA / 241E"
                      className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      CFS / Port
                    </label>
                    <input
                      type="text"
                      value={cfsPort}
                      onChange={(e) => setCfsPort(e.target.value)}
                      placeholder="Nhava Sheva (INNSA) / Dronagiri"
                      className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Vehicle No.
                    </label>
                    <input
                      type="text"
                      value={vehicleNo}
                      onChange={(e) => setVehicleNo(e.target.value.toUpperCase())}
                      placeholder="MH-46-AR-8812"
                      className="w-full text-xs font-mono font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-red-500 uppercase"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: SERVICE / CHARGES DETAILS TABLE (Excel Rows 20 - 33) */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-red-600" />
                    <span>SERVICE / CHARGES DETAILS (Excel 8-Column GST Grid)</span>
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    12 default services from template selectable, dynamic row additions, SAC codes, and automated GST calculations.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Quick Select from 12 Defaults */}
                  <select
                    value={selectedPresetService}
                    onChange={(e) => handleAddPresetService(e.target.value)}
                    className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
                  >
                    <option value="">+ Add from 12 Standard Services...</option>
                    {EXCEL_DEFAULT_SERVICES.map((s) => (
                      <option key={s.id} value={s.description}>
                        {s.description} ({s.hsnSacCode})
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={handlePopulateAll12Presets}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 shadow-2xs transition-colors"
                  >
                    <RotateCcw className="w-3 h-3 text-red-600" />
                    <span>Populate All 12</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAddCustomRow}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 shadow-2xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Custom Row</span>
                  </button>
                </div>
              </div>

              {/* 8-Column Grid Table strictly matching Excel Columns A-H */}
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-2 text-center w-12">Sr. No.</th>
                      <th className="py-2 px-3 min-w-[200px]">Description of Service</th>
                      <th className="py-2 px-2 w-24">SAC Code</th>
                      <th className="py-2 px-2 text-right w-16">Qty</th>
                      <th className="py-2 px-2 text-right w-24">Rate (₹)</th>
                      <th className="py-2 px-2 text-right w-28">Taxable Amount (₹)</th>
                      <th className="py-2 px-2 text-center w-20">GST Rate (%)</th>
                      <th className="py-2 px-2 text-right w-28">GST Amount (₹)</th>
                      <th className="py-2 px-2 text-center w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {chargeItems.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-1.5 px-2 text-center font-bold text-slate-500">
                          {idx + 1}
                        </td>
                        <td className="py-1.5 px-3">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleUpdateItem(idx, 'description', e.target.value)}
                            className="w-full text-xs font-medium px-2 py-1 rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-red-500"
                          />
                        </td>
                        <td className="py-1.5 px-2">
                          <input
                            type="text"
                            value={item.hsnSacCode}
                            onChange={(e) => handleUpdateItem(idx, 'hsnSacCode', e.target.value)}
                            className="w-full text-xs font-mono px-1.5 py-1 rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-red-500"
                          />
                        </td>
                        <td className="py-1.5 px-2">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={item.quantity}
                            onChange={(e) => handleUpdateItem(idx, 'quantity', e.target.value)}
                            className="w-full text-xs text-right font-medium px-1.5 py-1 rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-red-500"
                          />
                        </td>
                        <td className="py-1.5 px-2">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={item.rate}
                            onChange={(e) => handleUpdateItem(idx, 'rate', e.target.value)}
                            className="w-full text-xs text-right font-semibold px-1.5 py-1 rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-red-500"
                          />
                        </td>
                        <td className="py-1.5 px-2 text-right font-bold text-slate-900">
                          {formatCurrency(item.taxableAmount, 'INR')}
                        </td>
                        <td className="py-1.5 px-2 text-center">
                          <input
                            type="number"
                            min="0"
                            max="28"
                            step="any"
                            value={item.gstRate}
                            onChange={(e) => handleUpdateItem(idx, 'gstRate', e.target.value)}
                            className="w-14 text-xs text-center font-medium px-1 py-1 rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-red-500 mx-auto"
                          />
                        </td>
                        <td className="py-1.5 px-2 text-right font-bold text-red-700">
                          {formatCurrency(item.gstAmount, 'INR')}
                        </td>
                        <td className="py-1.5 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(idx)}
                            className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                            title="Delete row"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SECTION 4: TOTALS & TAX BREAKDOWN (Excel Rows 34 - 38) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              {/* Left Box: Amount in words & Banking Details */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-1">
                    Amount in Words (Excel Row 40)
                  </label>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 leading-snug">
                    {amountInWords}
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-1">
                    Bank Details (Excel Row 42)
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 text-[10px] block">Bank Name:</span>
                      <span className="font-semibold text-slate-800">{bankName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">A/C No.:</span>
                      <span className="font-mono font-bold text-slate-900">{bankAccountNo}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">IFSC Code:</span>
                      <span className="font-mono font-semibold text-slate-800">{bankIfsc}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Branch:</span>
                      <span className="font-semibold text-slate-800">{bankBranch}</span>
                    </div>
                  </div>
                </div>

                {/* Declaration (Excel Row 46) */}
                <div className="border-t border-slate-100 pt-2 text-[10px] text-slate-500 italic">
                  Declaration: We declare that this invoice shows the actual price of the services described and that all particulars are true and correct.
                </div>
              </div>

              {/* Right Box: Totals Grid matching Excel Rows 34-38 */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
                <div className="text-[11px] font-black uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2 mb-3">
                  Invoice Financial Summary (₹)
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-700">
                    <span className="font-semibold">Total Taxable Value</span>
                    <span className="font-mono font-bold text-slate-900">
                      ₹ {formatCurrency(totalTaxableValue, 'INR')}
                    </span>
                  </div>

                  {!effectiveIsInterState ? (
                    <>
                      <div className="flex justify-between items-center text-slate-700 pl-3 border-l-2 border-red-200">
                        <span>CGST (Central Tax @ 9%)</span>
                        <span className="font-mono font-semibold text-slate-800">
                          ₹ {formatCurrency(cgstAmount, 'INR')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-slate-700 pl-3 border-l-2 border-red-200">
                        <span>SGST (State Tax @ 9%)</span>
                        <span className="font-mono font-semibold text-slate-800">
                          ₹ {formatCurrency(sgstAmount, 'INR')}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between items-center text-slate-700 pl-3 border-l-2 border-blue-400">
                      <span>IGST (Integrated Tax @ 18%)</span>
                      <span className="font-mono font-semibold text-slate-800">
                        ₹ {formatCurrency(igstAmount, 'INR')}
                      </span>
                    </div>
                  )}

                  {roundOff !== 0 && (
                    <div className="flex justify-between items-center text-slate-500 text-[11px]">
                      <span>Round Off</span>
                      <span className="font-mono">
                        {roundOff > 0 ? `+${roundOff.toFixed(2)}` : roundOff.toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="border-t-2 border-slate-900 pt-2 flex justify-between items-center text-slate-900">
                    <span className="text-sm font-black uppercase tracking-tight">Grand Total</span>
                    <span className="text-base font-black font-mono text-red-600">
                      ₹ {formatCurrency(grandTotal, 'INR')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-white shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
              >
                <Eye className="w-4 h-4 text-slate-500" />
                <span>Preview Document</span>
              </button>
              <button
                type="button"
                onClick={() => handleSaveInvoice('DRAFT')}
                disabled={submitting}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 shadow-2xs transition-colors"
              >
                <Save className="w-4 h-4 text-slate-600" />
                <span>Save Draft</span>
              </button>
              <button
                type="button"
                onClick={() => handleSaveInvoice('FINALIZED')}
                disabled={submitting}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white shadow-md shadow-red-950/20 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>{submitting ? 'Generating...' : 'Finalize & Generate Bill'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Live Preview Modal */}
      {isPreviewOpen && (
        <ForwardingBillPrintView
          invoice={previewInvoiceData}
          isOpen={true}
          onClose={() => setIsPreviewOpen(false)}
          companySettings={settings}
          displayMode="modal"
        />
      )}
    </>
  );
};
