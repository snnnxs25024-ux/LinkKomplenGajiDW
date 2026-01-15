
import React, { useState, useEffect, useRef } from 'react';
import { Complaint, ComplaintType, MissingSalaryComplaint, ComplaintStatus, Worker } from '../types';

interface Props {
  workers: Worker[];
  previousComplaints: Complaint[];
  onSubmit: (complaint: Complaint) => void;
  onBack: () => void;
}

const FormMissingSalary: React.FC<Props> = ({ workers, previousComplaints, onSubmit, onBack }) => {
  const [formData, setFormData] = useState({
    opsId: '',
    fullName: '',
    whatsappNumber: '',
    bankAccountNumber: '',
    bankAccountName: '',
    bankName: '',
    period: '',
    alreadyFilledLink: ''
  });

  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [isAutofilled, setIsAutofilled] = useState(false);
  const [suggestions, setSuggestions] = useState<Worker[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [periodOptions, setPeriodOptions] = useState<string[]>([]);
  const suggestionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const getPeriods = () => {
      const now = new Date();
      const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
      const currentMonthIdx = now.getMonth();
      const currentYear = now.getFullYear();
      const prevMonthIdx = currentMonthIdx === 0 ? 11 : currentMonthIdx - 1;
      const prevYear = currentMonthIdx === 0 ? currentYear - 1 : currentYear;

      return [
        `1-15 ${months[currentMonthIdx]} ${currentYear}`,
        `16-30/31 ${months[prevMonthIdx]} ${prevYear}`,
        `1-15 ${months[prevMonthIdx]} ${prevYear}`,
        `16-30/31 ${months[currentMonthIdx]} ${currentYear}`
      ];
    };
    setPeriodOptions(getPeriods());

    // Click outside handler
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpsIdChange = (val: string) => {
    const upperVal = val.toUpperCase();
    setFormData(prev => ({ ...prev, opsId: upperVal, fullName: '', whatsappNumber: '', bankAccountNumber: '', bankAccountName: '', bankName: '' }));
    setIsAutofilled(false);
    
    if (upperVal.length > 1) {
      const filtered = workers.filter(w => w.opsId.includes(upperVal) || w.fullName.toUpperCase().includes(upperVal));
      setSuggestions(filtered.slice(0, 5));
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }

    const worker = workers.find(w => w.opsId === upperVal);
    if (worker) {
      applyWorkerData(worker);
    } else {
      setIsVerified(val.length > 0 ? false : null);
    }
  };

  const applyWorkerData = (worker: Worker) => {
    // Check for previous complaints to get bank info
    const lastComplaint = previousComplaints.find(c => c.opsId === worker.opsId);
    
    if (lastComplaint) {
      setFormData(prev => ({
        ...prev,
        opsId: worker.opsId,
        fullName: worker.fullName,
        whatsappNumber: lastComplaint.whatsappNumber,
        bankAccountNumber: lastComplaint.bankAccountNumber,
        bankAccountName: lastComplaint.bankAccountName,
        bankName: lastComplaint.bankName
      }));
      setIsAutofilled(true);
    } else {
      setFormData(prev => ({ ...prev, opsId: worker.opsId, fullName: worker.fullName }));
      setIsAutofilled(false);
    }
    
    setIsVerified(true);
    setShowSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isVerified) {
      alert("OpsID tidak valid! Harap masukkan OpsID yang terdaftar.");
      return;
    }
    const complaint: MissingSalaryComplaint = {
      ...formData,
      id: Math.random().toString(36).substr(2, 9),
      type: ComplaintType.MISSING_SALARY,
      status: ComplaintStatus.PENDING,
      timestamp: new Date().toISOString()
    };
    onSubmit(complaint);
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-sm border animate-fadeIn">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#EE4D2D] flex items-center">
          <span className="mr-2">📋</span> Form Komplen Belum Turun Gaji
        </h2>
        <p className="text-slate-500 text-xs mt-1">Sistem akan otomatis mengisi data jika Anda pernah komplain sebelumnya.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative" ref={suggestionRef}>
            <label className="block text-sm font-semibold text-slate-700 mb-1">OpsID</label>
            <div className="relative">
              <input 
                required 
                type="text" 
                value={formData.opsId} 
                onChange={e => handleOpsIdChange(e.target.value)} 
                onFocus={() => formData.opsId.length > 1 && setShowSuggestions(true)}
                placeholder="Contoh: SPX123" 
                className={`w-full px-4 py-3 rounded-lg border transition-all outline-none ${
                  isVerified === true ? 'border-green-500 bg-green-50' : 
                  isVerified === false ? 'border-red-500 bg-red-50' : 'border-slate-200 focus:ring-2 focus:ring-[#EE4D2D]'
                }`}
              />
              {isVerified === true && <span className="absolute right-3 top-3 text-green-600">✅</span>}
              {isVerified === false && <span className="absolute right-3 top-3 text-red-600">❌</span>}
            </div>
            
            {showSuggestions && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-fadeIn">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => applyWorkerData(s)}
                    className="w-full px-4 py-3 text-left hover:bg-slate-50 flex justify-between items-center group transition-colors"
                  >
                    <div className="flex flex-col">
                      <span className="font-black text-xs text-[#EE4D2D]">{s.opsId}</span>
                      <span className="text-sm font-bold text-slate-700">{s.fullName}</span>
                    </div>
                    <svg className="w-4 h-4 text-slate-300 group-hover:text-[#EE4D2D]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                  </button>
                ))}
              </div>
            )}

            <p className={`text-[10px] mt-1 font-bold uppercase ${isVerified === true ? 'text-green-600' : isVerified === false ? 'text-red-500' : 'text-slate-400'}`}>
              {isVerified === true ? (isAutofilled ? 'Data & Rekening Terdeteksi' : 'Karyawan Terdaftar') : isVerified === false ? 'ID Tidak Terdaftar' : 'Masukkan OpsID Anda'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Nomor WhatsApp (Aktif)</label>
            <input required type="tel" value={formData.whatsappNumber} onChange={e => setFormData({...formData, whatsappNumber: e.target.value})} placeholder="0812..." className={`w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#EE4D2D] outline-none transition-all ${isAutofilled ? 'bg-blue-50/50' : ''}`} />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Lengkap</label>
          <input 
            readOnly 
            required 
            type="text" 
            value={formData.fullName} 
            placeholder={isVerified === false ? "ID Tidak Valid" : "Otomatis terisi setelah OpsID benar"} 
            className={`w-full px-4 py-3 rounded-lg border outline-none font-bold ${
              isVerified === true ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-100 border-slate-100 text-slate-400 cursor-not-allowed'
            }`} 
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Bank</label>
            <select required value={formData.bankName} onChange={e => setFormData({...formData, bankName: e.target.value})} className={`w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#EE4D2D] outline-none bg-white transition-all ${isAutofilled ? 'bg-blue-50/50' : ''}`}>
              <option value="">Pilih Bank</option>
              <option value="BCA">BCA</option>
              <option value="MANDIRI">MANDIRI</option>
              <option value="BNI">BNI</option>
              <option value="BRI">BRI</option>
              <option value="SEABANK">SEABANK</option>
              <option value="LAINNYA">LAINNYA</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Nomor Rekening</label>
            <input required type="number" value={formData.bankAccountNumber} onChange={e => setFormData({...formData, bankAccountNumber: e.target.value})} placeholder="Nomor Rekening" className={`w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#EE4D2D] outline-none transition-all ${isAutofilled ? 'bg-blue-50/50' : ''}`} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Penerima di Rekening</label>
          <input required type="text" value={formData.bankAccountName} onChange={e => setFormData({...formData, bankAccountName: e.target.value})} placeholder="Harus Rekening Pribadi" className={`w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#EE4D2D] outline-none transition-all ${isAutofilled ? 'bg-blue-50/50' : ''}`} />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Periode Masuk (Tanggal Kerja)</label>
          <select 
            required 
            value={formData.period} 
            onChange={e => setFormData({...formData, period: e.target.value})} 
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#EE4D2D] outline-none bg-white"
          >
            <option value="">Pilih Periode Gaji</option>
            {periodOptions.map((p, i) => (
              <option key={i} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Apakah Sudah Isi Link Gaji Sebelumnya?</label>
          <div className="flex space-x-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="radio" name="filled" value="SUDAH" checked={formData.alreadyFilledLink === 'SUDAH'} onChange={e => setFormData({...formData, alreadyFilledLink: e.target.value})} className="w-4 h-4 text-[#EE4D2D] focus:ring-0" />
              <span className="text-sm font-medium">Sudah</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="radio" name="filled" value="BELUM" checked={formData.alreadyFilledLink === 'BELUM'} onChange={e => setFormData({...formData, alreadyFilledLink: e.target.value})} className="w-4 h-4 text-[#EE4D2D] focus:ring-0" />
              <span className="text-sm font-medium">Belum</span>
            </label>
          </div>
        </div>

        <div className="pt-4 flex flex-col space-y-3">
          <button 
            type="submit" 
            disabled={!isVerified}
            className={`w-full py-4 rounded-xl font-bold transition-all shadow-lg ${
              isVerified ? 'bg-[#EE4D2D] text-white hover:bg-[#d73a1c] shadow-orange-200 active:scale-[0.98]' : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            Kirim Komplen
          </button>
          <button type="button" onClick={onBack} className="w-full py-2 text-slate-400 font-medium text-sm">Kembali</button>
        </div>
      </form>
    </div>
  );
};

export default FormMissingSalary;
