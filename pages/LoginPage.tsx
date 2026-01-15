
import React, { useState } from 'react';

interface LoginPageProps {
  onLoginSuccess: () => void;
  onBack: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onBack }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Kredensial sesuai permintaan user
    if (username === 'admin' && password === '123') {
      onLoginSuccess();
    } else {
      setError('ID atau Password salah!');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 animate-fadeIn">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-[#EE4D2D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Akses Admin</h2>
          <p className="text-slate-500 text-sm mt-1">Silahkan masuk untuk melihat data respons</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium text-center border border-red-100">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">ID Admin</label>
            <input 
              required
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan ID"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#EE4D2D] focus:border-transparent outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
            <input 
              required
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan Password"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#EE4D2D] focus:border-transparent outline-none transition-all"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-[#EE4D2D] text-white py-3.5 rounded-xl font-bold hover:bg-[#d73a1c] transition-all shadow-lg shadow-orange-100 active:scale-[0.98]"
          >
            Masuk Sekarang
          </button>
        </form>

        <button 
          onClick={onBack}
          className="w-full mt-4 py-2 text-slate-400 hover:text-slate-600 text-sm font-medium transition-colors"
        >
          Kembali ke Beranda
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
