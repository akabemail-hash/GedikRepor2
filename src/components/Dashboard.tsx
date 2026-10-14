import React, { useState } from 'react';
import { useData } from '../lib/dataContext';
import Welcome from './Welcome';
import StocksReport from './StocksReport';
import PurchaseReport from './PurchaseReport';
import SalesReport from './SalesReport';
import DetailedReport from './DetailedReport';
import UnsoldProductsReport from './UnsoldProductsReport';
import { Home, PackageSearch, ShoppingCart, TrendingUp, FileText, LogOut, CalendarX2 } from 'lucide-react';

export default function Dashboard({ onLogout }: { onLogout: () => void }) {
  const { data } = useData();
  const [activeTab, setActiveTab] = useState('welcome');

  const tabs = [
    { id: 'welcome', label: 'Ana Səhifə', icon: Home, disabled: false },
    { id: 'stocks', label: 'Stoklar', icon: PackageSearch, disabled: !data },
    { id: 'purchases', label: 'Alış Hesabatı', icon: ShoppingCart, disabled: !data },
    { id: 'sales', label: 'Satış Hesabatı', icon: TrendingUp, disabled: !data },
    { id: 'unsold', label: 'Satılmayan Mallar', icon: CalendarX2, disabled: !data },
    { id: 'detailed', label: 'Ətraflı Hesabat', icon: FileText, disabled: !data },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'welcome': return <Welcome onNavigate={setActiveTab} onLogout={onLogout} />;
      case 'stocks': return <StocksReport />;
      case 'purchases': return <PurchaseReport />;
      case 'sales': return <SalesReport />;
      case 'unsold': return <UnsoldProductsReport />;
      case 'detailed': return <DetailedReport />;
      default: return <Welcome onNavigate={setActiveTab} onLogout={onLogout} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('welcome')}>
          <img src="https://gedik.com.tr/img/gedik-logo.png" alt="Gedik Logo" className="h-10 object-contain" referrerPolicy="no-referrer" />
          <h1 className="text-xl font-bold text-gedik-600">Gedik Report</h1>
        </div>
        {activeTab !== 'welcome' && (
          <button onClick={() => setActiveTab('welcome')} className="px-3 py-1.5 bg-gedik-50 text-gedik-600 rounded-lg text-sm font-medium flex items-center gap-2 active:bg-gedik-100 transition-colors">
            <Home className="w-4 h-4" />
            Ana Səhifə
          </button>
        )}
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-col w-64 bg-white border-r border-slate-200 sticky top-0 h-screen">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('welcome')}>
             <img src="https://gedik.com.tr/img/gedik-logo.png" alt="Gedik Logo" className="h-10 object-contain" referrerPolicy="no-referrer" />
          <h1 className="text-xl font-bold text-gedik-600">Gedik Report</h1>
        </div>
        
        <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                disabled={tab.disabled}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                  activeTab === tab.id 
                    ? 'bg-gedik-50 text-gedik-700 font-semibold' 
                    : tab.disabled 
                      ? 'opacity-50 cursor-not-allowed text-slate-400' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                }`}
              >
                <Icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-gedik-600' : ''}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-100 mt-auto">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors font-medium"
          >
            <LogOut className="w-5 h-5" />
            Çıxış
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-x-hidden">
        <div className="p-4 md:p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
