
import React from 'react';
import { ComplaintType } from '../types';

interface FormSelectorProps {
  onSelect: (type: ComplaintType) => void;
  onBack: () => void;
}

const FormSelector: React.FC<FormSelectorProps> = ({ onSelect, onBack }) => {
  return (
    <div className="max-w-2xl mx-auto space-y-8 py-12 animate-fadeIn">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-800">Pilih Jenis Komplen</h2>
        <p className="text-slate-500">Pilih salah satu sesuai dengan permasalahan gaji Anda</p>
      </div>

      <div className="grid gap-6">
        <button 
          onClick={() => onSelect(ComplaintType.MISSING_SALARY)}
          className="group relative bg-white p-8 rounded-2xl border-2 border-slate-100 hover:border-[#EE4D2D] hover:shadow-xl transition-all text-left flex items-center space-x-6"
        >
          <div className="bg-slate-100 group-hover:bg-orange-100 p-4 rounded-xl text-3xl transition-colors">📅</div>
          <div>
            <h3 className="text-xl font-bold text-slate-800 group-hover:text-[#EE4D2D] transition-colors">FORM KOMPLEN BELUM TURUN GAJI</h3>
            <p className="text-slate-500 text-sm mt-1">Gunakan ini jika status gaji Anda belum diterima melewati tanggal yang ditentukan.</p>
          </div>
        </button>

        <button 
          onClick={() => onSelect(ComplaintType.UNDERPAID_SALARY)}
          className="group relative bg-white p-8 rounded-2xl border-2 border-slate-100 hover:border-[#EE4D2D] hover:shadow-xl transition-all text-left flex items-center space-x-6"
        >
          <div className="bg-slate-100 group-hover:bg-orange-100 p-4 rounded-xl text-3xl transition-colors">📉</div>
          <div>
            <h3 className="text-xl font-bold text-slate-800 group-hover:text-[#EE4D2D] transition-colors">FORM KOMPLEN KURANG GAJI</h3>
            <p className="text-slate-500 text-sm mt-1">Gunakan ini jika nominal gaji yang diterima tidak sesuai dengan jumlah hari masuk kerja.</p>
          </div>
        </button>
      </div>

      <div className="text-center">
        <button onClick={onBack} className="text-slate-400 hover:text-slate-600 font-medium"> Kembali ke Halaman Utama</button>
      </div>
    </div>
  );
};

export default FormSelector;
