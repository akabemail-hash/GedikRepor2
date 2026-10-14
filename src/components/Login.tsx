import React, { useState } from 'react';
import { Lock, User, Building2, ArrowRight } from 'lucide-react';

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin') {
      onLogin();
    } else {
      setError('Səhv məlumatlar. admin/admin istifadə edin');
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Corporate Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Subtle background pattern */}
        <div 
          className="absolute inset-0 opacity-10" 
          style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        ></div>
        
        <div className="relative z-10 flex items-center gap-3">
        <img src="https://gedik.com.tr/img/gedik-logo.png" alt="Gedik Logo" className="h-10 object-contain" referrerPolicy="no-referrer" />
         <span className="text-2xl font-bold tracking-tight">Gedik Report</span>
         </div>

        <div className="relative z-10 max-w-lg">
          <h1 className="text-4xl font-bold leading-tight mb-6">
            Müəssisənizin stok və satış əməliyyatlarını tək mərkəzdən idarə edin.
          </h1>
          <p className="text-slate-400 text-lg mb-8 leading-relaxed">
            Müasir, sürətli və təhlükəsiz hesabat sistemi ilə biznes qərarlarınızı daha dəqiq verin və məlumatlarınızı asanlıqla analiz edin.
          </p>
           
        </div>

        <div className="relative z-10 text-sm text-slate-500 font-medium">
          &copy; {new Date().getFullYear()} Gedik Report. Bütün hüquqlar qorunur.
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-white">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <img src="https://gedik.com.tr/img/gedik-logo.png" alt="Seranit Logo" className="h-10 object-contain" referrerPolicy="no-referrer" />
            <span className="text-2xl font-bold tracking-tight">Gedik Report</span>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Xoş gəlmisiniz</h2>
            <p className="text-slate-500">Davam etmək üçün hesabınıza daxil olun.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0"></div>
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">İstifadəçi adı</label>
                <div className="relative group">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-gedik-600 transition-colors" />
                  <input 
                    type="text" 
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-gedik-600/20 focus:border-gedik-600 transition-all text-slate-900 font-medium"
                    placeholder="admin"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-slate-700">Şifrə</label>
                  <a href="#" className="text-sm font-medium text-gedik-600 hover:text-gedik-700 transition-colors">Şifrəni unutmusunuz?</a>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-gedik-600 transition-colors" />
                  <input 
                    type="password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-gedik-600/20 focus:border-gedik-600 transition-all text-slate-900 font-medium"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 group shadow-lg shadow-slate-900/20 hover:shadow-xl hover:shadow-slate-900/30 active:scale-[0.98]"
            >
              Sistemə daxil ol
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-slate-100 text-center">
            
          </div>
        </div>
      </div>
    </div>
  );
}
