import React from 'react';
import { useData } from '../lib/dataContext';
import { PackageSearch, ShoppingCart, TrendingUp, FileText, LogOut } from 'lucide-react';

interface WelcomeProps {
  onNavigate: (tab: string) => void;
  onLogout: () => void;
}

export default function Welcome({ onNavigate, onLogout }: WelcomeProps) {
  const { data, loading, error } = useData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gedik-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Məlumatlar yüklənir...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="bg-red-50 text-red-600 p-6 rounded-xl text-center max-w-md">
          <p className="font-bold mb-2">Xəta baş verdi</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-gradient-to-r from-gedik-600 to-gedik-800 rounded-2xl p-8 md:p-12 text-white shadow-lg mb-8">
        <h1 className="text-3xl md:text-5xl font-bold mb-4">Xoş gəlmisiniz!</h1>
        <p className="text-gedik-100 text-lg md:text-xl max-w-2xl hidden md:block">
          Stok və satış hesabatları sisteminə xoş gəlmisiniz. Sol menyudan istədiyiniz hesabatı seçərək məlumatları analiz edə bilərsiniz.
        </p>
        <p className="text-gedik-100 text-lg md:text-xl max-w-2xl md:hidden">
          Stok və satış hesabatları sisteminə xoş gəlmisiniz. Aşağıdakı menyudan istədiyiniz hesabatı seçin.
        </p>
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden grid grid-cols-1 gap-3 mb-8">
        <h2 className="text-lg font-bold text-slate-800 mb-2 px-1">Menyu</h2>
        <button onClick={() => onNavigate('stocks')} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 active:bg-slate-50 transition-colors text-left">
          <div className="p-3 bg-gedik-50 text-gedik-600 rounded-lg">
            <PackageSearch className="w-6 h-6" />
          </div>
          <span className="font-medium text-slate-800 text-lg">Stoklar</span>
        </button>
        <button onClick={() => onNavigate('purchases')} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 active:bg-slate-50 transition-colors text-left">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <span className="font-medium text-slate-800 text-lg">Alış Hesabatı</span>
        </button>
        <button onClick={() => onNavigate('sales')} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 active:bg-slate-50 transition-colors text-left">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <TrendingUp className="w-6 h-6" />
          </div>
          <span className="font-medium text-slate-800 text-lg">Satış Hesabatı</span>
        </button>
        <button onClick={() => onNavigate('unsold')} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 active:bg-slate-50 transition-colors text-left">
          <div className="p-3 bg-red-50 text-red-500 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M21 13V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><line x1="17" x2="22" y1="17" y2="22"/><line x1="22" x2="17" y1="17" y2="22"/></svg>
          </div>
          <span className="font-medium text-slate-800 text-lg">Satılmayan Mallar</span>
        </button>
        <button onClick={() => onNavigate('detailed')} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 active:bg-slate-50 transition-colors text-left">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <FileText className="w-6 h-6" />
          </div>
          <span className="font-medium text-slate-800 text-lg">Ətraflı Hesabat</span>
        </button>
        <button onClick={onLogout} className="bg-white p-4 rounded-xl shadow-sm border border-red-100 flex items-center gap-4 active:bg-red-50 transition-colors mt-2 text-left">
          <div className="p-3 bg-red-50 text-red-600 rounded-lg">
            <LogOut className="w-6 h-6" />
          </div>
          <span className="font-medium text-red-600 text-lg">Çıxış</span>
        </button>
      </div>

      {data && (
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-4 px-1 md:hidden">Statistika</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="p-4 bg-gedik-50 text-gedik-600 rounded-lg">
                <PackageSearch className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Cəmi Stok</p>
                <p className="text-2xl font-bold text-slate-900">{data.stocks.length}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="p-4 bg-emerald-50 text-emerald-600 rounded-lg">
                <ShoppingCart className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Cəmi Alış</p>
                <p className="text-2xl font-bold text-slate-900">{data.purchases.length}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="p-4 bg-amber-50 text-amber-600 rounded-lg">
                <TrendingUp className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Cəmi Satış</p>
                <p className="text-2xl font-bold text-slate-900">{data.sales.length}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
