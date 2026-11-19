import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  PlusCircle,
  List,
  Search,
  Filter,
  Download,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  X,
  Calendar,
  Building2,
  Package,
  Scale,
  UserCheck,
  Briefcase,
  Eye,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { CartingRecord, CartingReferenceData } from '../../types/index';

interface CartingDetailsSectionProps {
  embedded?: boolean; // if true, adapts header for embedding inside DataEntryModule
}

export const CartingDetailsSection: React.FC<CartingDetailsSectionProps> = ({ embedded = false }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  // Sub-tab state: 'form' | 'records'
  const [activeTab, setActiveTab] = useState<'form' | 'records'>('form');

  // Reference Data state
  const [refData, setRefData] = useState<CartingReferenceData>({
    parties: [],
    shippers: [],
    consignees: [],
    chas: [],
    agents: [],
    commodities: [],
    weightUnits: ['KGS', 'MT', 'LBS', 'CBM'],
  });
  const [loadingRef, setLoadingRef] = useState(false);

  // Auto-generated Sr. No. preview
  const [nextSrNo, setNextSrNo] = useState<string>('CRT-2026-0001');

  // Form State: 12 Requested Fields
  const [jobNo, setJobNo] = useState<string>('');
  const [shippingBillNo, setShippingBillNo] = useState<string>('');
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [shipper, setShipper] = useState<string>('');
  const [consignee, setConsignee] = useState<string>('');
  const [cha, setCha] = useState<string>('');
  const [packages, setPackages] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [weightUnit, setWeightUnit] = useState<string>('KGS');
  const [commodity, setCommodity] = useState<string>('');
  const [partyId, setPartyId] = useState<string>('');
  const [partyName, setPartyName] = useState<string>('');
  const [agent, setAgent] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');

  // Form Status
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [lastSavedRecord, setLastSavedRecord] = useState<CartingRecord | null>(null);

  // Records Table State
  const [records, setRecords] = useState<CartingRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [recordsError, setRecordsError] = useState<string | null>(null);
  const [totalRecords, setTotalRecords] = useState(0);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterParty, setFilterParty] = useState('');
  const [filterAgent, setFilterAgent] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  // Modals State
  const [viewingRecord, setViewingRecord] = useState<CartingRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<CartingRecord | null>(null);
  const [updatingRecord, setUpdatingRecord] = useState(false);
  const [deleteConfirmRecord, setDeleteConfirmRecord] = useState<CartingRecord | null>(null);
  const [deletingRecord, setDeletingRecord] = useState(false);

  // Load Reference Data & Next Number on mount
  useEffect(() => {
    let mounted = true;
    setLoadingRef(true);

    Promise.all([
      api.getCartingReferenceData().catch(() => null),
      api.getNextCartingSrNo().catch(() => null),
    ])
      .then(([refRes, nextRes]) => {
        if (!mounted) return;
        if (refRes) {
          setRefData(refRes);
        }
        if (nextRes?.nextSrNo) {
          setNextSrNo(nextRes.nextSrNo);
        }
      })
      .finally(() => {
        if (mounted) setLoadingRef(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Fetch Records
  const fetchRecords = () => {
    setLoadingRecords(true);
    setRecordsError(null);

    const params: Record<string, string | number> = {
      limit: 100,
    };
    if (searchQuery.trim()) params.search = searchQuery.trim();
    if (filterParty) params.partyName = filterParty;
    if (filterAgent) params.agent = filterAgent;
    if (filterStartDate) params.dateFrom = filterStartDate;
    if (filterEndDate) params.dateTo = filterEndDate;

    api.getCartingRecords(params)
      .then((res) => {
        setRecords(res.records || []);
        setTotalRecords(res.totalCount || 0);
      })
      .catch((err) => {
        setRecordsError(err.message || 'Failed to load Carting records.');
      })
      .finally(() => {
        setLoadingRecords(false);
      });
  };

  useEffect(() => {
    if (activeTab === 'records') {
      fetchRecords();
    }
  }, [activeTab, searchQuery, filterParty, filterAgent, filterStartDate, filterEndDate]);

  // Handle Create Record
  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // 1. Validation
    if (!jobNo.trim()) {
      setFormError('Please enter Job No.');
      return;
    }
    if (!shippingBillNo.trim()) {
      setFormError('Please enter Shipping Bill No.');
      return;
    }
    if (!date) {
      setFormError('Please select a Date.');
      return;
    }
    if (!shipper.trim()) {
      setFormError('Please enter Shipper name.');
      return;
    }
    if (!consignee.trim()) {
      setFormError('Please enter Consignee name.');
      return;
    }
    if (!cha.trim()) {
      setFormError('Please enter CHA (Customs House Agent).');
      return;
    }
    if (!packages.trim()) {
      setFormError('Please enter number of packages (Pkgs).');
      return;
    }
    const numWeight = parseFloat(weight);
    if (isNaN(numWeight) || numWeight < 0) {
      setFormError('Please enter a valid weight (e.g. 1500 or 12.5).');
      return;
    }
    if (!commodity.trim()) {
      setFormError('Please enter Commodity description.');
      return;
    }
    if (!partyName.trim()) {
      setFormError('Please select or specify a Party Name.');
      return;
    }
    if (!agent.trim()) {
      setFormError('Please enter Agent name.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        jobNo: jobNo.trim().toUpperCase(),
        shippingBillNo: shippingBillNo.trim().toUpperCase(),
        date,
        shipper: shipper.trim(),
        consignee: consignee.trim(),
        cha: cha.trim(),
        packages: packages.trim(),
        weight: numWeight,
        weightUnit,
        commodity: commodity.trim(),
        partyId: partyId || undefined,
        partyName: partyName.trim(),
        agent: agent.trim(),
        remarks: remarks.trim() || undefined,
      };

      const res = await api.createCartingRecord(payload);
      if (res.success && res.record) {
        setLastSavedRecord(res.record);

        // Fetch refreshed next number
        api.getNextCartingSrNo().then((n) => {
          if (n?.nextSrNo) setNextSrNo(n.nextSrNo);
        }).catch(() => {});

        // Reset form fields while preserving common values (party, agent, CHA)
        setJobNo('');
        setShippingBillNo('');
        setPackages('');
        setWeight('');
        setCommodity('');
        setRemarks('');
      }
    } catch (err: any) {
      setFormError(err.message || 'Failed to save Carting Details record.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Update Record
  const handleUpdateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    setUpdatingRecord(true);
    try {
      const res = await api.updateCartingRecord(editingRecord.id, {
        jobNo: editingRecord.jobNo,
        shippingBillNo: editingRecord.shippingBillNo,
        date: editingRecord.date,
        shipper: editingRecord.shipper,
        consignee: editingRecord.consignee,
        cha: editingRecord.cha,
        packages: editingRecord.packages,
        weight: editingRecord.weight,
        weightUnit: editingRecord.weightUnit,
        commodity: editingRecord.commodity,
        partyName: editingRecord.partyName,
        partyId: editingRecord.partyId,
        agent: editingRecord.agent,
        remarks: editingRecord.remarks,
        version: editingRecord.version,
      });

      if (res.success && res.record) {
        setRecords((prev) => prev.map((r) => (r.id === res.record.id ? res.record : r)));
        setEditingRecord(null);
      }
    } catch (err: any) {
      alert('Update failed: ' + (err.message || 'Unknown error'));
    } finally {
      setUpdatingRecord(false);
    }
  };

  // Handle Delete Record
  const handleDeleteRecord = async () => {
    if (!deleteConfirmRecord) return;
    setDeletingRecord(true);
    try {
      const res = await api.deleteCartingRecord(deleteConfirmRecord.id);
      if (res.success) {
        setRecords((prev) => prev.filter((r) => r.id !== deleteConfirmRecord.id));
        setTotalRecords((prev) => Math.max(0, prev - 1));
        setDeleteConfirmRecord(null);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete record.');
    } finally {
      setDeletingRecord(false);
    }
  };

  // Handle Export CSV
  const handleExportCsv = () => {
    const token = localStorage.getItem('logibill_token') || sessionStorage.getItem('logibill_token');
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append('search', searchQuery.trim());
    if (filterParty) params.append('partyName', filterParty);
    if (filterAgent) params.append('agent', filterAgent);
    if (filterStartDate) params.append('dateFrom', filterStartDate);
    if (filterEndDate) params.append('dateTo', filterEndDate);

    fetch(`/api/carting-details/export/csv?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('CSV export failed');
        return res.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `msk-carting-details-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch((err) => {
        alert('CSV export error: ' + err.message);
      });
  };

  return (
    <div className="space-y-6">
      {/* Sub-navigation tabs: New Carting Entry vs Carting Records */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2 rounded-xl shadow-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('form')}
            className={`flex items-center gap-2 py-2 px-3.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'form'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Carting Entry</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('records')}
            className={`flex items-center gap-2 py-2 px-3.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'records'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <List className="w-4 h-4" />
            <span>Carting Records Listing</span>
            {totalRecords > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeTab === 'records' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {totalRecords}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'records' && (
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV</span>
          </button>
        )}
      </div>

      {/* ============================================================== */}
      {/* TAB 1: NEW CARTING DETAILS ENTRY FORM (ALL 12 FIELDS)          */}
      {/* ============================================================== */}
      {activeTab === 'form' && (
        <div className="max-w-4xl mx-auto space-y-5">
          {/* Success Notification */}
          {lastSavedRecord && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-950">
                    Carting Record Saved: {lastSavedRecord.srNo}
                  </h4>
                  <p className="text-xs text-emerald-700">
                    Job No: <span className="font-mono font-bold">{lastSavedRecord.jobNo}</span> &bull; SB No: <span className="font-mono font-bold">{lastSavedRecord.shippingBillNo}</span> &bull; Party: {lastSavedRecord.partyName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('records')}
                className="px-3 py-1.5 text-xs font-bold bg-white text-emerald-800 border border-emerald-300 rounded-lg hover:bg-emerald-100 transition-colors shadow-2xs"
              >
                View in Records List &rarr;
              </button>
            </div>
          )}

          {/* Form Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-red-50/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-red-600 bg-red-100/70 px-2 py-0.5 rounded">
                    MSK LOGISTIC SOLUTION ERP
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Ref: {nextSrNo}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight mt-1">
                  Carting Details Data Entry Form
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complete all 12 operational fields below to register cargo carting into the database.
                </p>
              </div>

              {/* Sr. No. Auto Badge */}
              <div className="flex items-center gap-2 self-start sm:self-center bg-slate-900 text-white px-3 py-1.5 rounded-xl border border-slate-800 shadow-xs">
                <FileText className="w-4 h-4 text-red-400" />
                <div className="text-left">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block leading-none">Auto Sr. No.</span>
                  <span className="font-mono font-bold text-xs text-white">{nextSrNo}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleCreateRecord} className="p-5 sm:p-6 space-y-5">
              {formError && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-xs font-medium">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Section 1: Core Shipment & Reference (Fields 1, 2, 3, 4) */}
              <div>
                <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-red-600" />
                  <span>1. Shipment Identifiers & Date</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Field 1: Sr. No. (Auto generated / Readonly) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      1. Sr. No. <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={nextSrNo}
                      className="w-full text-xs font-mono font-bold px-3 py-2 rounded-lg border border-slate-300 bg-slate-100 text-slate-600 cursor-not-allowed"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Unique auto-generated reference</span>
                  </div>

                  {/* Field 2: Job No. */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      2. Job No. <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. JOB-2026-0819"
                      value={jobNo}
                      onChange={(e) => setJobNo(e.target.value.toUpperCase())}
                      className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 uppercase"
                    />
                  </div>

                  {/* Field 3: Shipping Bill No. */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      3. Shipping Bill No. <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 6010085/18.08.2026"
                      value={shippingBillNo}
                      onChange={(e) => setShippingBillNo(e.target.value.toUpperCase())}
                      className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 uppercase"
                    />
                  </div>

                  {/* Field 4: Date */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      4. Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  {/* Field 11: Party Name (Select from Database) */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      11. Party Name (Customer from Master) <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <select
                        required
                        value={partyId}
                        onChange={(e) => {
                          const pId = e.target.value;
                          setPartyId(pId);
                          const matched = refData.parties.find((p) => p.id === pId);
                          if (matched) {
                            setPartyName(matched.name);
                          } else if (!pId) {
                            setPartyName('');
                          }
                        }}
                        className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <option value="">-- Select Party from Database --</option>
                        {refData.parties.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} {p.gstin ? `(${p.gstin})` : ''}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Or custom party name"
                        value={partyName}
                        onChange={(e) => {
                          setPartyName(e.target.value);
                          setPartyId('');
                        }}
                        className="w-1/2 text-xs font-medium px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Parties & Logistics Agents (Fields 5, 6, 7, 12) */}
              <div className="border-t border-slate-100 pt-4">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-red-600" />
                  <span>2. Shipper, Consignee & Agents</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Field 5: Shipper */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      5. Shipper <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ABC Textiles Ltd"
                      list="shippers-list"
                      value={shipper}
                      onChange={(e) => setShipper(e.target.value)}
                      className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <datalist id="shippers-list">
                      {refData.shippers.map((s) => (
                        <option key={s} value={s} />
                      ))}
                    </datalist>
                  </div>

                  {/* Field 6: Consignee */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      6. Consignee <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Global Freight Services BV"
                      list="consignees-list"
                      value={consignee}
                      onChange={(e) => setConsignee(e.target.value)}
                      className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <datalist id="consignees-list">
                      {refData.consignees.map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </div>

                  {/* Field 7: CHA */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      7. CHA (Customs House Agent) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. MSK Clearing & Forwarding"
                      list="chas-list"
                      value={cha}
                      onChange={(e) => setCha(e.target.value)}
                      className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <datalist id="chas-list">
                      {refData.chas.map((ch) => (
                        <option key={ch} value={ch} />
                      ))}
                    </datalist>
                  </div>

                  {/* Field 12: Agent */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      12. Agent <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Transworld Logistics Agent"
                      list="agents-list"
                      value={agent}
                      onChange={(e) => setAgent(e.target.value)}
                      className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <datalist id="agents-list">
                      {refData.agents.map((a) => (
                        <option key={a} value={a} />
                      ))}
                    </datalist>
                  </div>
                </div>
              </div>

              {/* Section 3: Cargo Details (Fields 8, 9, 10 & Remarks) */}
              <div className="border-t border-slate-100 pt-4">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-red-600" />
                  <span>3. Cargo Package, Weight & Commodity</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Field 8: Pkgs */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      8. Pkgs (Packages) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 500 PKGS / 250 BOXES"
                      value={packages}
                      onChange={(e) => setPackages(e.target.value)}
                      className="w-full text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  {/* Field 9: Weight & Unit */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      9. Weight & Unit <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="any"
                        min="0"
                        required
                        placeholder="e.g. 14500"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="w-full text-xs font-mono font-bold px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500 text-right"
                      />
                      <select
                        value={weightUnit}
                        onChange={(e) => setWeightUnit(e.target.value)}
                        className="w-24 text-xs font-bold px-2 py-2 rounded-lg border border-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        {refData.weightUnits.map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Field 10: Commodity */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      10. Commodity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Agricultural Rice / Garments / Engineering Spares"
                      list="commodities-list"
                      value={commodity}
                      onChange={(e) => setCommodity(e.target.value)}
                      className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <datalist id="commodities-list">
                      {refData.commodities.map((cm) => (
                        <option key={cm} value={cm} />
                      ))}
                    </datalist>
                  </div>

                  {/* Remarks (Optional) */}
                  <div className="sm:col-span-4">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Remarks / Carting Notes (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Special handling, bay number, truck number or yard location notes..."
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setJobNo('');
                    setShippingBillNo('');
                    setShipper('');
                    setConsignee('');
                    setCha('');
                    setPackages('');
                    setWeight('');
                    setCommodity('');
                    setPartyId('');
                    setPartyName('');
                    setAgent('');
                    setRemarks('');
                    setFormError(null);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Form</span>
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-red-950/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving to Database...</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4" />
                      <span>Save Carting Details Record</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: CARTING RECORDS LISTING (SEARCH, FILTER & DATA TABLE)   */}
      {/* ============================================================== */}
      {activeTab === 'records' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {/* Search input: Job No., Shipping Bill No., or Global */}
              <div className="relative lg:col-span-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Search by Job No. / Shipping Bill No. / Party
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search Job No, SB No, Party, Shipper, CHA..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs font-medium pl-8 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              {/* Party Name Filter */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Filter by Party Name
                </label>
                <select
                  value={filterParty}
                  onChange={(e) => setFilterParty(e.target.value)}
                  className="w-full text-xs font-semibold px-2.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-red-500"
                >
                  <option value="">All Parties</option>
                  {refData.parties.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Agent Filter */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Filter by Agent
                </label>
                <select
                  value={filterAgent}
                  onChange={(e) => setFilterAgent(e.target.value)}
                  className="w-full text-xs font-semibold px-2.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-red-500"
                >
                  <option value="">All Agents</option>
                  {refData.agents.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date From & To */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Filter by Date Range
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="date"
                    value={filterStartDate}
                    onChange={(e) => setFilterStartDate(e.target.value)}
                    className="w-1/2 text-xs font-medium px-2 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-red-500"
                    title="From Date"
                  />
                  <input
                    type="date"
                    value={filterEndDate}
                    onChange={(e) => setFilterEndDate(e.target.value)}
                    className="w-1/2 text-xs font-medium px-2 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-red-500"
                    title="To Date"
                  />
                </div>
              </div>
            </div>

            {/* Quick reset active filters button */}
            {(searchQuery || filterParty || filterAgent || filterStartDate || filterEndDate) && (
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 text-slate-500">
                <span>Active filters applied. Showing matching records: {records.length}</span>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setFilterParty('');
                    setFilterAgent('');
                    setFilterStartDate('');
                    setFilterEndDate('');
                  }}
                  className="text-red-600 font-bold hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>

          {/* Records Data Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {recordsError && (
              <div className="p-4 bg-red-50 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{recordsError}</span>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Sr. No.</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Job No.</th>
                    <th className="py-2.5 px-3">Shipping Bill No.</th>
                    <th className="py-2.5 px-3">Party Name</th>
                    <th className="py-2.5 px-3">Shipper</th>
                    <th className="py-2.5 px-3">Consignee</th>
                    <th className="py-2.5 px-3">CHA</th>
                    <th className="py-2.5 px-2 text-right">Pkgs</th>
                    <th className="py-2.5 px-3 text-right">Weight</th>
                    <th className="py-2.5 px-3">Commodity</th>
                    <th className="py-2.5 px-3">Agent</th>
                    <th className="py-2.5 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loadingRecords ? (
                    <tr>
                      <td colSpan={13} className="py-12 text-center text-slate-400">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-red-600" />
                        <span>Loading Carting Details from database...</span>
                      </td>
                    </tr>
                  ) : records.length === 0 ? (
                    <tr>
                      <td colSpan={13} className="py-12 text-center text-slate-500">
                        <Package className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="font-semibold text-slate-700">No Carting Details found.</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Click "New Carting Entry" above to add the first record.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    records.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                          {r.srNo}
                        </td>
                        <td className="py-2 px-3 text-slate-600 whitespace-nowrap">
                          {new Date(r.date).toLocaleDateString('en-GB')}
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-slate-800 whitespace-nowrap">
                          {r.jobNo}
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-700 whitespace-nowrap">
                          {r.shippingBillNo}
                        </td>
                        <td className="py-2 px-3 font-bold text-slate-900 whitespace-nowrap">
                          {r.partyName}
                        </td>
                        <td className="py-2 px-3 text-slate-700 max-w-[150px] truncate" title={r.shipper}>
                          {r.shipper}
                        </td>
                        <td className="py-2 px-3 text-slate-700 max-w-[150px] truncate" title={r.consignee}>
                          {r.consignee}
                        </td>
                        <td className="py-2 px-3 text-slate-600 whitespace-nowrap">
                          {r.cha}
                        </td>
                        <td className="py-2 px-2 text-right font-medium text-slate-800 whitespace-nowrap">
                          {r.packages}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                          {r.weight.toLocaleString('en-IN')} {r.weightUnit}
                        </td>
                        <td className="py-2 px-3 text-slate-700 max-w-[150px] truncate" title={r.commodity}>
                          {r.commodity}
                        </td>
                        <td className="py-2 px-3 text-slate-600 whitespace-nowrap">
                          {r.agent}
                        </td>
                        <td className="py-2 px-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* View Full Details */}
                            <button
                              type="button"
                              onClick={() => setViewingRecord(r)}
                              className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                              title="View full details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit Record */}
                            <button
                              type="button"
                              onClick={() => setEditingRecord({ ...r })}
                              className="p-1 rounded text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Edit record"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Record */}
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmRecord(r)}
                              className="p-1 rounded text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Showing {records.length} of {totalRecords} Carting records</span>
              <button
                type="button"
                onClick={fetchRecords}
                className="flex items-center gap-1 text-slate-600 hover:text-slate-900 font-semibold"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 1: VIEW COMPLETE CARTING RECORD DETAILS                  */}
      {/* ============================================================== */}
      {viewingRecord && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200 overflow-hidden text-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-600" />
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Carting Record Details: {viewingRecord.srNo}
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Logged on {new Date(viewingRecord.createdAt).toLocaleString('en-GB')}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingRecord(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Sr. No.</span>
                  <span className="font-mono font-bold text-slate-900">{viewingRecord.srNo}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Job No.</span>
                  <span className="font-mono font-bold text-slate-900">{viewingRecord.jobNo}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Shipping Bill No.</span>
                  <span className="font-mono font-bold text-slate-900">{viewingRecord.shippingBillNo}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Date</span>
                  <span className="font-semibold text-slate-800">{new Date(viewingRecord.date).toLocaleDateString('en-GB')}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Party Name</span>
                  <span className="font-bold text-slate-900">{viewingRecord.partyName}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Agent</span>
                  <span className="font-semibold text-slate-800">{viewingRecord.agent}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Shipper Details</span>
                  <p className="font-medium text-slate-800">{viewingRecord.shipper}</p>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Consignee Details</span>
                  <p className="font-medium text-slate-800">{viewingRecord.consignee}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">CHA Agent</span>
                  <p className="font-medium text-slate-800">{viewingRecord.cha}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Packages (Pkgs)</span>
                  <p className="font-bold text-slate-900">{viewingRecord.packages}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Weight & Unit</span>
                  <p className="font-mono font-bold text-slate-900">{viewingRecord.weight} {viewingRecord.weightUnit}</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Commodity</span>
                <p className="font-medium text-slate-800 mt-0.5">{viewingRecord.commodity}</p>
              </div>

              {viewingRecord.remarks && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                  <span className="text-[10px] uppercase font-bold text-amber-700 block">Remarks</span>
                  <p className="mt-0.5">{viewingRecord.remarks}</p>
                </div>
              )}

              {/* Audit Footer */}
              <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-2 flex justify-between">
                <span>Created by: {viewingRecord.createdByName}</span>
                <span>Last updated: {new Date(viewingRecord.updatedAt).toLocaleString('en-GB')}</span>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingRecord(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: EDIT CARTING RECORD                                   */}
      {/* ============================================================== */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200 overflow-hidden text-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900">
                  Edit Carting Record: {editingRecord.srNo}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingRecord(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateRecord} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Job No.</label>
                  <input
                    type="text"
                    required
                    value={editingRecord.jobNo}
                    onChange={(e) => setEditingRecord({ ...editingRecord, jobNo: e.target.value.toUpperCase() })}
                    className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Shipping Bill No.</label>
                  <input
                    type="text"
                    required
                    value={editingRecord.shippingBillNo}
                    onChange={(e) => setEditingRecord({ ...editingRecord, shippingBillNo: e.target.value.toUpperCase() })}
                    className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={editingRecord.date.split('T')[0]}
                    onChange={(e) => setEditingRecord({ ...editingRecord, date: e.target.value })}
                    className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Party Name</label>
                  <input
                    type="text"
                    required
                    value={editingRecord.partyName}
                    onChange={(e) => setEditingRecord({ ...editingRecord, partyName: e.target.value })}
                    className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Shipper</label>
                  <input
                    type="text"
                    required
                    value={editingRecord.shipper}
                    onChange={(e) => setEditingRecord({ ...editingRecord, shipper: e.target.value })}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Consignee</label>
                  <input
                    type="text"
                    required
                    value={editingRecord.consignee}
                    onChange={(e) => setEditingRecord({ ...editingRecord, consignee: e.target.value })}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">CHA</label>
                  <input
                    type="text"
                    required
                    value={editingRecord.cha}
                    onChange={(e) => setEditingRecord({ ...editingRecord, cha: e.target.value })}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Pkgs</label>
                  <input
                    type="text"
                    required
                    value={editingRecord.packages}
                    onChange={(e) => setEditingRecord({ ...editingRecord, packages: e.target.value })}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Weight ({editingRecord.weightUnit})</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={editingRecord.weight}
                    onChange={(e) => setEditingRecord({ ...editingRecord, weight: parseFloat(e.target.value) || 0 })}
                    className="w-full text-xs font-mono px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 text-right"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Commodity</label>
                  <input
                    type="text"
                    required
                    value={editingRecord.commodity}
                    onChange={(e) => setEditingRecord({ ...editingRecord, commodity: e.target.value })}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Agent</label>
                  <input
                    type="text"
                    required
                    value={editingRecord.agent}
                    onChange={(e) => setEditingRecord({ ...editingRecord, agent: e.target.value })}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Remarks</label>
                <textarea
                  rows={2}
                  value={editingRecord.remarks || ''}
                  onChange={(e) => setEditingRecord({ ...editingRecord, remarks: e.target.value })}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-end gap-2 -mx-6 -mb-6 mt-4 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingRecord}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {updatingRecord ? 'Saving...' : 'Update Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: CONFIRM DELETE RECORD                                 */}
      {/* ============================================================== */}
      {deleteConfirmRecord && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 text-center space-y-4 border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Delete Carting Record?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete <span className="font-mono font-bold text-slate-800">{deleteConfirmRecord.srNo}</span> (Job: {deleteConfirmRecord.jobNo})? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmRecord(null)}
                disabled={deletingRecord}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteRecord}
                disabled={deletingRecord}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
              >
                {deletingRecord ? 'Deleting...' : 'Yes, Delete Record'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
