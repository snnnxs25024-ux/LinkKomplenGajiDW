
import React, { useState, useMemo } from 'react';
import { Complaint, ComplaintType, ComplaintStatus, Worker } from '../types';

interface DashboardProps {
  complaints: Complaint[];
  workers: Worker[];
  onBack: () => void;
  onUpdateStatus: (id: string, status: ComplaintStatus) => void;
  onAddWorker: (worker: Worker) => void;
  onUpdateWorker: (worker: Worker) => void;
  onDeleteWorker: (opsId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ complaints, workers, onBack, onUpdateStatus, onAddWorker, onUpdateWorker, onDeleteWorker }) => {
  const [activeView, setActiveView] = useState<'laporan' | 'database'>('laporan');
  
  // States for Complaint View
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // States for Database View
  const [workerSearch, setWorkerSearch] = useState('');
  const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);

  const filteredComplaints = complaints.filter(c => {
    const matchesType = filterType === 'ALL' || c.type === filterType;
    const matchesSearch = c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.opsId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const filteredWorkers = workers.filter(w => 
    w.fullName.toLowerCase().includes(workerSearch.toLowerCase()) || 
    w.opsId.toLowerCase().includes(workerSearch.toLowerCase())
  );

  const complaintHistory = useMemo(() => {
    if (!selectedComplaint) return [];
    return complaints
      .filter(c => c.opsId === selectedComplaint.opsId && c.id !== selectedComplaint.id)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [selectedComplaint, complaints]);

  const stats = useMemo(() => ({
    total: complaints.length,
    pending: complaints.filter(c => c.status === ComplaintStatus.PENDING).length,
    processing: complaints.filter(c => c.status === ComplaintStatus.PROCESSING).length,
    resolved: complaints.filter(c => c.status === ComplaintStatus.RESOLVED).length,
    escalated: complaints.filter(c => c.status === ComplaintStatus.ESCALATED).length,
    totalWorkers: workers.length,
  }), [complaints, workers]);

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredComplaints.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredComplaints.map(c => c.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleCopyToClipboard = () => {
    if (selectedIds.size === 0) return;
    const itemsToCopy = complaints.filter(c => selectedIds.has(c.id));
    const formattedText = itemsToCopy.map(c => {
      const header = c.type === ComplaintType.MISSING_SALARY 
        ? `KOMPLEN GAJI PRIODE ${c.period.toUpperCase()}`
        : `KOMPLEN GAJI KURANG PRIODE ${c.period.toUpperCase()}`;
      return `${header}\n\nOpsID : ${c.opsId}\nNama Lengkap : ${c.fullName}\nNomor Rekening : ${c.bankAccountNumber}\nNama Penerima : ${c.bankAccountName}\nJenis Bank : ${c.bankName}\nPeriode : ${c.period}`;
    }).join('\n\n---\n\n');
    navigator.clipboard.writeText(formattedText).then(() => {
      alert(`${selectedIds.size} Data berhasil disalin ke clipboard!`);
    });
  };

  const handleExportCSV = () => {
    const headers = ["OpsID", "Nama Lengkap", "Nomor Rekening", "Nama Penerima", "Jenis Bank", "Periode", "Jenis Komplain", "Info Tambahan"];
    const rows = complaints.map(c => {
      const extraInfo = c.type === ComplaintType.MISSING_SALARY 
        ? `Sudah Isi Link: ${(c as any).alreadyFilledLink}`
        : `Nominal Diterima: ${(c as any).receivedAmount}`;
      return [c.opsId, c.fullName, `'${c.bankAccountNumber}`, c.bankAccountName, c.bankName, c.period, c.type === ComplaintType.MISSING_SALARY ? "BELUM TURUN GAJI" : "KURANG GAJI", extraInfo];
    });
    const csvContent = [headers, ...rows].map(e => e.map(val => `"${val}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Laporan_Komplain_SPX_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleOpenWorkerModal = (worker: Worker | null = null) => {
    setEditingWorker(worker);
    setIsWorkerModalOpen(true);
  };

  const handleWorkerFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const workerData: Worker = {
      opsId: (formData.get('opsId') as string).toUpperCase(),
      fullName: formData.get('fullName') as string,
    };

    if (editingWorker) {
      onUpdateWorker(workerData);
    } else {
      onAddWorker(workerData);
    }
    setIsWorkerModalOpen(false);
  };

  const handleDeleteWorkerClick = (opsId: string) => {
    if (window.confirm(`Anda yakin ingin menghapus karyawan dengan OpsID: ${opsId}?`)) {
        onDeleteWorker(opsId);
    }
  };


  const getStatusStyle = (status: ComplaintStatus) => {
    switch (status) {
      case ComplaintStatus.PENDING: return 'bg-red-100 text-red-700 border-red-200';
      case ComplaintStatus.PROCESSING: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case ComplaintStatus.RESOLVED: return 'bg-green-100 text-green-700 border-green-200';
      case ComplaintStatus.ESCALATED: return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const formatPhoneForWA = (phone: string) => {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.substring(1);
    }
    return cleaned;
  };

  const openWhatsApp = (complaint: Complaint) => {
    const cleanPhone = formatPhoneForWA(complaint.whatsappNumber);
    const msg = `Halo ${complaint.fullName}, saya Admin SPX perihal komplain gaji Anda periode ${complaint.period} (${complaint.type}). Laporan Anda sedang kami proses. Mohon ditunggu ya.`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 uppercase tracking-tight">Management Dashboard</h2>
          <p className="text-slate-500 font-medium">Pusat Kendali Penggajian Daily Worker SPX</p>
        </div>
        <div className="flex flex-wrap gap-2">
           <button onClick={onBack} className="px-6 py-2.5 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-all shadow-md">Logout</button>
        </div>
      </div>
      
      <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm flex space-x-2">
        <button onClick={() => setActiveView('laporan')} className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeView === 'laporan' ? 'bg-[#EE4D2D] text-white shadow-lg shadow-orange-100' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            Laporan Komplen
        </button>
        <button onClick={() => setActiveView('database')} className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeView === 'database' ? 'bg-[#EE4D2D] text-white shadow-lg shadow-orange-100' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>
            Database Karyawan
        </button>
      </div>


      {activeView === 'laporan' ? (
      <>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Laporan', value: stats.total, color: 'blue', icon: '📑' },
            { label: 'Perlu Cek (Pending)', value: stats.pending, color: 'red', icon: '🚨' },
            { label: 'Sedang Proses', value: stats.processing, color: 'yellow', icon: '⚙️' },
            { label: 'Sudah Selesai', value: stats.resolved, color: 'green', icon: '✅' }
          ].map((item, i) => (
            <div key={i} className={`bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4`}>
              <div className={`w-12 h-12 flex items-center justify-center rounded-2xl text-2xl bg-${item.color}-50`}>{item.icon}</div>
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{item.label}</p>
                <p className="text-2xl font-black text-slate-800">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </span>
              <input type="text" placeholder="Cari Nama atau OpsID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-[#EE4D2D] focus:border-transparent outline-none transition-all" />
            </div>
            <div className="flex space-x-2">
              {['ALL', ComplaintType.MISSING_SALARY, ComplaintType.UNDERPAID_SALARY].map((type) => (
                <button key={type} onClick={() => setFilterType(type)} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${filterType === type ? 'bg-[#EE4D2D] text-white border-[#EE4D2D] shadow-lg shadow-orange-100' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}>
                  {type === 'ALL' ? 'Semua' : type === ComplaintType.MISSING_SALARY ? 'Belum Turun' : 'Kurang Gaji'}
                </button>
              ))}
            </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-4 flex justify-between items-center border-b">
              <h3 className="font-bold text-slate-700">Daftar Komplen Masuk</h3>
              <div className="flex gap-2">
                  {selectedIds.size > 0 && (
                    <button onClick={handleCopyToClipboard} className="flex items-center text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all shadow-sm animate-scaleIn">
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                      Salin ({selectedIds.size})
                    </button>
                  )}
                  <button onClick={handleExportCSV} className="flex items-center text-xs px-3 py-1.5 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-all shadow-sm">
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    Export
                  </button>
              </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[11px] uppercase tracking-widest font-black">
                <tr>
                  <th className="px-4 py-5 w-10 text-center"><input type="checkbox" checked={filteredComplaints.length > 0 && selectedIds.size === filteredComplaints.length} onChange={toggleSelectAll} className="w-4 h-4 rounded border-slate-300 text-[#EE4D2D] focus:ring-[#EE4D2D] cursor-pointer" /></th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5">Waktu Masuk</th>
                  <th className="px-6 py-5">Informasi DW</th>
                  <th className="px-6 py-5">Periode</th>
                  <th className="px-6 py-5">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredComplaints.map(c => (
                  <tr key={c.id} className={`hover:bg-slate-50 transition-colors group ${selectedIds.has(c.id) ? 'bg-orange-50/30' : ''}`}>
                    <td className="px-4 py-5 text-center"><input type="checkbox" checked={selectedIds.has(c.id)} onChange={() => toggleSelect(c.id)} className="w-4 h-4 rounded border-slate-300 text-[#EE4D2D] focus:ring-[#EE4D2D] cursor-pointer" /></td>
                    <td className="px-6 py-5"><span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusStyle(c.status)}`}>{c.status}</span></td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-slate-900 font-bold">{new Date(c.timestamp).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</div>
                      <div className="text-[10px] text-slate-400 font-medium uppercase">{new Date(c.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-black text-slate-800 group-hover:text-[#EE4D2D] transition-colors">{c.fullName}</div>
                      <div className="text-[11px] font-bold text-slate-400 tracking-tighter">{c.opsId}</div>
                    </td>
                    <td className="px-6 py-5"><div className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-600 inline-block uppercase">{c.period}</div></td>
                    <td className="px-6 py-5">
                      <div className="flex space-x-2">
                        <button onClick={() => setSelectedComplaint(c)} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-all" title="Lihat Detail"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg></button>
                        <button onClick={() => openWhatsApp(c)} className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-all" title="Kirim WhatsApp"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.067 2.877 1.215 3.076.149.198 2.095 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></button>
                        <select value={c.status} onChange={(e) => onUpdateStatus(c.id, e.target.value as ComplaintStatus)} className="text-xs font-bold py-1 px-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-[#EE4D2D]">
                          {Object.values(ComplaintStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredComplaints.length === 0 && (
              <div className="py-20 text-center flex flex-col items-center">
                <div className="text-5xl mb-4 opacity-20">🔍</div>
                <p className="text-slate-400 font-bold">Data tidak ditemukan.</p>
                <button onClick={() => {setSearchQuery(''); setFilterType('ALL');}} className="mt-2 text-[#EE4D2D] font-bold text-sm">Reset Filter</button>
              </div>
            )}
          </div>
        </div>
      </>
      ) : (
      <>
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </span>
              <input type="text" placeholder="Cari Nama atau OpsID Karyawan..." value={workerSearch} onChange={(e) => setWorkerSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-[#EE4D2D] focus:border-transparent outline-none transition-all" />
            </div>
            <button onClick={() => handleOpenWorkerModal()} className="px-5 py-2.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-md flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
                Tambah Karyawan Baru
            </button>
        </div>
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-bold text-slate-700">Total {stats.totalWorkers} Karyawan Terdaftar</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider font-bold">
                        <tr>
                            <th className="px-6 py-4">OpsID</th>
                            <th className="px-6 py-4">Nama Lengkap</th>
                            <th className="px-6 py-4 text-right">Tindakan</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredWorkers.map(w => (
                            <tr key={w.opsId} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-mono font-bold text-[#EE4D2D]">{w.opsId}</td>
                                <td className="px-6 py-4 font-semibold text-slate-800">{w.fullName}</td>
                                <td className="px-6 py-4">
                                    <div className="flex space-x-2 justify-end">
                                        <button onClick={() => handleOpenWorkerModal(w)} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-blue-100 hover:text-blue-600 transition-all" title="Edit Data"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg></button>
                                        <button onClick={() => handleDeleteWorkerClick(w.opsId)} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-red-100 hover:text-red-600 transition-all" title="Hapus Data"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredWorkers.length === 0 && (
                    <div className="py-20 text-center flex flex-col items-center">
                    <div className="text-5xl mb-4 opacity-20">👥</div>
                    <p className="text-slate-400 font-bold">Karyawan tidak ditemukan.</p>
                    <button onClick={() => setWorkerSearch('')} className="mt-2 text-[#EE4D2D] font-bold text-sm">Reset Pencarian</button>
                    </div>
                )}
            </div>
        </div>
      </>
      )}

      {selectedComplaint && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl ring-1 ring-black/5 animate-scaleIn">
            <div className="p-6 border-b border-slate-50 flex justify-between items-start bg-slate-50/50">
              <div className="space-y-0.5">
                <span className={`px-3 py-0.5 rounded-full text-[9px] font-black uppercase border mb-1 inline-block ${getStatusStyle(selectedComplaint.status)}`}>{selectedComplaint.status}</span>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none">Detail Laporan L-DW</h3>
                <p className="text-slate-400 text-[10px] font-bold tracking-tight">Time: {new Date(selectedComplaint.timestamp).toLocaleString('id-ID')}</p>
              </div>
              <button onClick={() => setSelectedComplaint(null)} className="p-2 bg-white hover:bg-slate-100 rounded-xl transition-all shadow-sm border border-slate-100 group"><svg className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto custom-scrollbar">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3"><div className="flex items-center space-x-2 text-[#EE4D2D]"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg><h4 className="text-[10px] font-black uppercase tracking-widest">Identitas DW</h4></div><div className="space-y-2"><div><label className="text-[9px] font-bold text-slate-400 uppercase block">Nama Lengkap</label><p className="text-sm font-black text-slate-800 leading-tight">{selectedComplaint.fullName}</p></div><div className="grid grid-cols-2 gap-2"><div><label className="text-[9px] font-bold text-slate-400 uppercase block">Ops ID</label><p className="text-xs font-black text-[#EE4D2D]">{selectedComplaint.opsId}</p></div><div><label className="text-[9px] font-bold text-slate-400 uppercase block">WhatsApp</label><p className="text-xs font-black text-slate-700">{selectedComplaint.whatsappNumber}</p></div></div></div></div>
                <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-3"><div className="flex items-center space-x-2 text-blue-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg><h4 className="text-[10px] font-black uppercase tracking-widest">Rekening Gaji</h4></div><div className="space-y-2"><div className="flex justify-between items-end"><div><label className="text-[9px] font-bold text-blue-400 uppercase block">Bank</label><p className="text-sm font-black text-slate-800 uppercase leading-none">{selectedComplaint.bankName}</p></div></div><div><label className="text-[9px] font-bold text-blue-400 uppercase block">Nomor Rekening</label><p className="text-sm font-black text-blue-700 font-mono tracking-wider">{selectedComplaint.bankAccountNumber}</p></div><div><label className="text-[9px] font-bold text-blue-400 uppercase block">Atas Nama</label><p className="text-[11px] font-bold text-slate-600 truncate">an. {selectedComplaint.bankAccountName}</p></div></div></div>
              </div>
              <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100 space-y-4"><div className="flex items-center space-x-2 text-slate-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg><h4 className="text-[10px] font-black uppercase tracking-widest">Detail Keluhan</h4></div><div className="grid grid-cols-3 gap-3"><div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm"><label className="text-[8px] font-bold text-slate-400 uppercase block mb-0.5">Tipe</label><p className={`text-[9px] font-black px-2 py-0.5 rounded inline-block ${selectedComplaint.type === ComplaintType.MISSING_SALARY ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>{selectedComplaint.type === ComplaintType.MISSING_SALARY ? 'BELUM TURUN' : 'KURANG GAJI'}</p></div><div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm"><label className="text-[8px] font-bold text-slate-400 uppercase block mb-0.5">Periode</label><p className="text-[10px] font-black text-slate-800 truncate">{selectedComplaint.period}</p></div><div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">{selectedComplaint.type === ComplaintType.MISSING_SALARY ? (<><label className="text-[8px] font-bold text-slate-400 uppercase block mb-0.5">Isi Link?</label><p className={`text-[10px] font-black ${(selectedComplaint as any).alreadyFilledLink === 'SUDAH' ? 'text-green-600' : 'text-red-600'}`}>{(selectedComplaint as any).alreadyFilledLink}</p></>) : (<><label className="text-[8px] font-bold text-slate-400 uppercase block mb-0.5">Diterima</label><p className="text-[10px] font-black text-blue-600 leading-tight">Rp {Number((selectedComplaint as any).receivedAmount).toLocaleString('id-ID')}</p></>)}</div></div>{selectedComplaint.type === ComplaintType.UNDERPAID_SALARY && (selectedComplaint as any).evidenceUrl && (<div className="space-y-2 pt-1 text-center"><label className="text-[9px] font-bold text-slate-400 uppercase block text-left">Bukti Mutasi Rekening</label><img src={(selectedComplaint as any).evidenceUrl} className="w-full max-h-40 object-contain rounded-xl border-2 border-white shadow-sm cursor-zoom-in" alt="Bukti Mutasi" /></div>)}</div>

              {complaintHistory.length > 0 && (
                <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100 space-y-4">
                  <div className="flex items-center space-x-2 text-slate-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg><h4 className="text-[10px] font-black uppercase tracking-widest">Riwayat Komplain Lainnya</h4></div>
                  <div className="space-y-2">
                    {complaintHistory.map(hist => (
                      <div key={hist.id} className="grid grid-cols-4 gap-2 items-center bg-white p-2 rounded-xl border text-xs">
                        <span className="font-bold">{new Date(hist.timestamp).toLocaleDateString('id-ID', {day: '2-digit', month: 'short', year:'2-digit'})}</span>
                        <span className="font-bold text-slate-500">{hist.period}</span>
                        <span className={`text-center font-black ${hist.type === ComplaintType.MISSING_SALARY ? 'text-red-500' : 'text-blue-500'}`}>{hist.type}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border text-center ${getStatusStyle(hist.status)}`}>{hist.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 bg-slate-50 border-t flex gap-3">
              <button onClick={() => openWhatsApp(selectedComplaint)} className="flex-[2] flex items-center justify-center py-3.5 bg-[#25D366] text-white rounded-2xl font-black text-xs hover:scale-[1.01] transition-all shadow-md active:translate-y-0.5"><svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.067 2.877 1.215 3.076.149.198 2.095 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>WhatsApp</button>
              <button onClick={() => setSelectedComplaint(null)} className="flex-1 py-3.5 bg-white text-slate-800 border border-slate-200 rounded-2xl font-black text-xs hover:bg-slate-50 transition-all shadow-sm active:scale-95">Tutup</button>
            </div>
          </div>
        </div>
      )}
      
      {isWorkerModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl ring-1 ring-black/5 animate-scaleIn">
              <div className="p-6 border-b flex justify-between items-center bg-slate-50">
                  <h3 className="text-lg font-bold text-slate-800">{editingWorker ? 'Edit Data Karyawan' : 'Tambah Karyawan Baru'}</h3>
                  <button onClick={() => setIsWorkerModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full"><svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
              </div>
              <form onSubmit={handleWorkerFormSubmit}>
                  <div className="p-6 space-y-4">
                      <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1">OpsID</label>
                          <input required name="opsId" defaultValue={editingWorker?.opsId} readOnly={!!editingWorker} placeholder="Contoh: SPX12345" className="w-full uppercase px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#EE4D2D] outline-none transition-all disabled:bg-slate-100 disabled:cursor-not-allowed"/>
                      </div>
                       <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                          <input required name="fullName" defaultValue={editingWorker?.fullName} placeholder="Masukkan nama sesuai KTP" className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#EE4D2D] outline-none transition-all"/>
                      </div>
                  </div>
                  <div className="p-4 bg-slate-50 border-t flex justify-end gap-3">
                      <button type="button" onClick={() => setIsWorkerModalOpen(false)} className="px-5 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all">Batal</button>
                      <button type="submit" className="px-5 py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-all">{editingWorker ? 'Simpan Perubahan' : 'Tambahkan Karyawan'}</button>
                  </div>
              </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
