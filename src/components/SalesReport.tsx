import React, { useState, useMemo } from 'react';
import { useData } from '../lib/dataContext';
import { Search, ChevronLeft, ChevronRight, Calendar, TrendingUp, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { SalesRecord } from '../types';

export default function SalesReport() {
  const { data } = useData();
  const [search, setSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [viewMode, setViewMode] = useState<'detailed' | 'monthly' | 'comparative'>('detailed');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Sorting state
  const [sortField, setSortField] = useState<string>('FATURATAR');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const filteredSales = useMemo(() => {
    if (!data) return [];
    return data.sales.filter(s => {
      const matchSearch = s.MalzemeKodu?.toString().toLowerCase().includes(search.toLowerCase()) ||
                          s.MalzemeAd?.toString().toLowerCase().includes(search.toLowerCase());
      
      const matchCustomer = s.CUNVANI?.toString().toLowerCase().includes(customerSearch.toLowerCase());
      
      let matchDate = true;
      if (dateFrom || dateTo) {
        const sDate = new Date(s.FATURATAR);
        if (dateFrom && new Date(dateFrom) > sDate) matchDate = false;
        if (dateTo && new Date(dateTo) < sDate) matchDate = false;
      }
      
      return matchSearch && matchCustomer && matchDate;
    });
  }, [data, search, customerSearch, dateFrom, dateTo]);

  const sortedSales = useMemo(() => {
    const list = [...filteredSales];
    list.sort((a, b) => {
      let aVal: any = a[sortField as keyof SalesRecord];
      let bVal: any = b[sortField as keyof SalesRecord];

      if (sortField === 'FATURATAR') {
        aVal = new Date(a.FATURATAR).getTime();
        bVal = new Date(b.FATURATAR).getTime();
      } else if (sortField === 'Birim') {
        aVal = String(a.Birim || a.BIRIM || a.BirimAd || '').toLowerCase();
        bVal = String(b.Birim || b.BIRIM || b.BirimAd || '').toLowerCase();
      } else if (typeof aVal === 'string' || typeof bVal === 'string') {
        aVal = String(aVal || '').toLowerCase();
        bVal = String(bVal || '').toLowerCase();
      } else {
        aVal = Number(aVal || 0);
        bVal = Number(bVal || 0);
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [filteredSales, sortField, sortDirection]);

  const monthlyData = useMemo(() => {
    const monthly: Record<string, { month: string, totalQty: number, totalAmount: number }> = {};
    filteredSales.forEach(s => {
      const date = new Date(s.FATURATAR);
      if (isNaN(date.getTime())) return;
      
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthly[monthKey]) {
        monthly[monthKey] = { month: monthKey, totalQty: 0, totalAmount: 0 };
      }
      monthly[monthKey].totalQty += (s.HareketMiktar || 0);
      monthly[monthKey].totalAmount += (s.NetTutar || 0);
    });
    const result = Object.values(monthly);
    result.sort((a, b) => {
      let aVal = a[sortField as keyof typeof a];
      let bVal = b[sortField as keyof typeof b];
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [filteredSales, sortField, sortDirection]);

  const comparativeData = useMemo(() => {
    const sortedMonthly = [...monthlyData].sort((a, b) => a.month.localeCompare(b.month));
    const mapped = sortedMonthly.map((current, index) => {
      const previous = index > 0 ? sortedMonthly[index - 1] : null;
      const growth = previous && previous.totalAmount > 0 
        ? ((current.totalAmount - previous.totalAmount) / previous.totalAmount) * 100 
        : 0;
      
      return {
        ...current,
        prevAmount: previous ? previous.totalAmount : 0,
        growth
      };
    });
    mapped.sort((a, b) => {
      let aVal = a[sortField as keyof typeof a];
      let bVal = b[sortField as keyof typeof b];
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return mapped;
  }, [monthlyData, sortField, sortDirection]);

  const currentData = viewMode === 'detailed' ? sortedSales : 
                      viewMode === 'monthly' ? monthlyData : comparativeData;
                      
  const totalPages = Math.ceil(currentData.length / itemsPerPage);
  const paginatedData = currentData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const renderSortIcon = (field: string) => {
    if (sortField !== field) return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 inline ml-1 opacity-60" />;
    return sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-gedik-600 inline ml-1" /> : <ArrowDown className="w-3.5 h-3.5 text-gedik-600 inline ml-1" />;
  };

  if (!data) return null;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Satış Hesabatı</h2>
        <div className="flex bg-slate-100 p-1 rounded-lg overflow-x-auto max-w-full">
          <button 
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${viewMode === 'detailed' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => { setViewMode('detailed'); setSortField('FATURATAR'); setSortDirection('desc'); setCurrentPage(1); }}
          >
            Ətraflı
          </button>
          <button 
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${viewMode === 'monthly' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => { setViewMode('monthly'); setSortField('month'); setSortDirection('desc'); setCurrentPage(1); }}
          >
            Aylıq
          </button>
          <button 
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${viewMode === 'comparative' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => { setViewMode('comparative'); setSortField('month'); setSortDirection('desc'); setCurrentPage(1); }}
          >
            Müqayisəli
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-semibold text-slate-500 mb-1.5">Məhsul (Kod / Ad)</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Axtar..." 
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-semibold text-slate-500 mb-1.5">Müştəri</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Müştəri adı..." 
              value={customerSearch}
              onChange={e => { setCustomerSearch(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5">Başlanğıc Tarixi</label>
          <input 
            type="date" 
            value={dateFrom}
            onChange={e => { setDateFrom(e.target.value); setCurrentPage(1); }}
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5">Bitiş Tarixi</label>
          <input 
            type="date" 
            value={dateTo}
            onChange={e => { setDateTo(e.target.value); setCurrentPage(1); }}
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          {viewMode === 'detailed' && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 select-none">
                  <th onClick={() => handleSort('FATURATAR')} className="p-4 font-semibold text-slate-600 text-sm cursor-pointer hover:bg-slate-100 transition-colors">
                    Tarix {renderSortIcon('FATURATAR')}
                  </th>
                  <th onClick={() => handleSort('MalzemeKodu')} className="p-4 font-semibold text-slate-600 text-sm cursor-pointer hover:bg-slate-100 transition-colors">
                    Kod {renderSortIcon('MalzemeKodu')}
                  </th>
                  <th onClick={() => handleSort('MalzemeAd')} className="p-4 font-semibold text-slate-600 text-sm cursor-pointer hover:bg-slate-100 transition-colors">
                    Ad {renderSortIcon('MalzemeAd')}
                  </th>
                  <th onClick={() => handleSort('Birim')} className="p-4 font-semibold text-slate-600 text-sm cursor-pointer hover:bg-slate-100 transition-colors">
                    Birim {renderSortIcon('Birim')}
                  </th>
                  <th onClick={() => handleSort('CUNVANI')} className="p-4 font-semibold text-slate-600 text-sm cursor-pointer hover:bg-slate-100 transition-colors">
                    Müştəri {renderSortIcon('CUNVANI')}
                  </th>
                  <th onClick={() => handleSort('HareketMiktar')} className="p-4 font-semibold text-slate-600 text-sm text-right cursor-pointer hover:bg-slate-100 transition-colors">
                    Miqdar {renderSortIcon('HareketMiktar')}
                  </th>
                  <th onClick={() => handleSort('BirimFiyat')} className="p-4 font-semibold text-slate-600 text-sm text-right cursor-pointer hover:bg-slate-100 transition-colors">
                    Qiymət {renderSortIcon('BirimFiyat')}
                  </th>
                  <th onClick={() => handleSort('NetTutar')} className="p-4 font-semibold text-slate-600 text-sm text-right cursor-pointer hover:bg-slate-100 transition-colors">
                    Məbləğ {renderSortIcon('NetTutar')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {(paginatedData as SalesRecord[]).map((s, i) => {
                  const birimVal = s.Birim || s.BIRIM || s.BirimAd || 'Ədəd';
                  return (
                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 text-sm text-slate-600 whitespace-nowrap">{new Date(s.FATURATAR).toLocaleDateString()}</td>
                      <td className="p-4 text-sm text-slate-800 font-mono">{s.MalzemeKodu}</td>
                      <td className="p-4 text-sm text-slate-800">{s.MalzemeAd}</td>
                      <td className="p-4 text-sm text-slate-600 font-medium">{s.BIRIM}</td>
                      <td className="p-4 text-sm text-slate-600 truncate max-w-[200px]" title={s.CUNVANI}>{s.CUNVANI}</td>
                      <td className="p-4 text-sm text-slate-800 text-right">{s.HareketMiktar}</td>
                      <td className="p-4 text-sm text-slate-800 text-right">{Number(s.BirimFiyat || 0).toFixed(2)} ₼</td>
                      <td className="p-4 text-sm text-slate-800 text-right font-medium">{Number(s.NetTutar || 0).toFixed(2)} ₼</td>
                    </tr>
                  );
                })}
                {paginatedData.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500">Satış tapılmadı.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {viewMode === 'monthly' && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 select-none">
                  <th onClick={() => handleSort('month')} className="p-4 font-semibold text-slate-600 text-sm cursor-pointer hover:bg-slate-100 transition-colors">
                    Ay {renderSortIcon('month')}
                  </th>
                  <th onClick={() => handleSort('totalQty')} className="p-4 font-semibold text-slate-600 text-sm text-right cursor-pointer hover:bg-slate-100 transition-colors">
                    Cəmi Satılan Miqdar {renderSortIcon('totalQty')}
                  </th>
                  <th onClick={() => handleSort('totalAmount')} className="p-4 font-semibold text-slate-600 text-sm text-right cursor-pointer hover:bg-slate-100 transition-colors">
                    Cəmi Gəlir {renderSortIcon('totalAmount')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {(paginatedData as any[]).map((m, i) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 text-sm text-slate-800 font-medium flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {m.month}
                    </td>
                    <td className="p-4 text-sm text-slate-800 text-right">{m.totalQty.toFixed(2)}</td>
                    <td className="p-4 text-sm text-slate-800 text-right font-medium text-emerald-600">{m.totalAmount.toFixed(2)} ₼</td>
                  </tr>
                ))}
                {paginatedData.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-slate-500">Məlumat tapılmadı.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {viewMode === 'comparative' && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 select-none">
                  <th onClick={() => handleSort('month')} className="p-4 font-semibold text-slate-600 text-sm cursor-pointer hover:bg-slate-100 transition-colors">
                    Ay {renderSortIcon('month')}
                  </th>
                  <th onClick={() => handleSort('totalAmount')} className="p-4 font-semibold text-slate-600 text-sm text-right cursor-pointer hover:bg-slate-100 transition-colors">
                    Cari Ay Gəliri {renderSortIcon('totalAmount')}
                  </th>
                  <th onClick={() => handleSort('prevAmount')} className="p-4 font-semibold text-slate-600 text-sm text-right cursor-pointer hover:bg-slate-100 transition-colors">
                    Öncəki Ay Gəliri {renderSortIcon('prevAmount')}
                  </th>
                  <th onClick={() => handleSort('growth')} className="p-4 font-semibold text-slate-600 text-sm text-right cursor-pointer hover:bg-slate-100 transition-colors">
                    Böyümə / Fərq {renderSortIcon('growth')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {(paginatedData as any[]).map((c, i) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 text-sm text-slate-800 font-medium">{c.month}</td>
                    <td className="p-4 text-sm text-slate-800 text-right font-medium">{c.totalAmount.toFixed(2)} ₼</td>
                    <td className="p-4 text-sm text-slate-500 text-right">{c.prevAmount > 0 ? `${c.prevAmount.toFixed(2)} ₼` : '-'}</td>
                    <td className="p-4 text-sm text-right">
                      {c.prevAmount > 0 ? (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${c.growth >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {c.growth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
                          {Math.abs(c.growth).toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
                {paginatedData.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500">Məlumat tapılmadı.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
            <span className="text-sm text-slate-500 font-medium">
              Cəmi {currentData.length} qeyddən {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, currentData.length)} göstərilir
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed bg-white shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed bg-white shadow-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
