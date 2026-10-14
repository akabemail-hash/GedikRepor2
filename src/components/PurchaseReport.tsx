import React, { useState, useMemo } from 'react';
import { useData } from '../lib/dataContext';
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { PurchaseRecord } from '../types';

export default function PurchaseReport() {
  const { data } = useData();
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [viewMode, setViewMode] = useState<'detailed' | 'summary'>('detailed');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Sorting state
  const [sortField, setSortField] = useState<string>('DATE_');
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

  const filteredPurchases = useMemo(() => {
    if (!data) return [];
    return data.purchases.filter(p => {
      const matchSearch = p.CODE?.toString().toLowerCase().includes(search.toLowerCase()) ||
                          p.NAME?.toString().toLowerCase().includes(search.toLowerCase());
      
      let matchDate = true;
      if (dateFrom || dateTo) {
        const pDate = new Date(p.DATE_);
        if (dateFrom && new Date(dateFrom) > pDate) matchDate = false;
        if (dateTo && new Date(dateTo) < pDate) matchDate = false;
      }
      
      return matchSearch && matchDate;
    });
  }, [data, search, dateFrom, dateTo]);

  const sortedPurchases = useMemo(() => {
    const list = [...filteredPurchases];
    list.sort((a, b) => {
      let aVal: any = a[sortField as keyof PurchaseRecord];
      let bVal: any = b[sortField as keyof PurchaseRecord];

      if (sortField === 'DATE_') {
        aVal = new Date(a.DATE_).getTime();
        bVal = new Date(b.DATE_).getTime();
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
  }, [filteredPurchases, sortField, sortDirection]);

  const summaryData = useMemo(() => {
    const summary: Record<string, { code: string, name: string, totalQty: number, totalAmount: number }> = {};
    filteredPurchases.forEach(p => {
      if (!summary[p.CODE]) {
        summary[p.CODE] = { code: p.CODE, name: p.NAME, totalQty: 0, totalAmount: 0 };
      }
      summary[p.CODE].totalQty += (p.MIKTAR || 0);
      summary[p.CODE].totalAmount += (p.NET_SATIS/1.7 || 0);
    });
    const result = Object.values(summary);
    result.sort((a, b) => {
      let aVal = a[sortField as keyof typeof a];
      let bVal = b[sortField as keyof typeof b];
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = (bVal || '').toLowerCase();
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [filteredPurchases, sortField, sortDirection]);

  const currentData = viewMode === 'detailed' ? sortedPurchases : summaryData;
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
        <h2 className="text-2xl font-bold text-gray-800">Alış Hesabatı</h2>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button 
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'detailed' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => { setViewMode('detailed'); setSortField('DATE_'); setSortDirection('desc'); setCurrentPage(1); }}
          >
            Ətraflı
          </button>
          <button 
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'summary' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => { setViewMode('summary'); setSortField('name'); setSortDirection('asc'); setCurrentPage(1); }}
          >
            Xülasə
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">Kod / Ad axtar</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Axtar..." 
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Başlanğıc Tarixi</label>
          <input 
            type="date" 
            value={dateFrom}
            onChange={e => { setDateFrom(e.target.value); setCurrentPage(1); }}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Bitiş Tarixi</label>
          <input 
            type="date" 
            value={dateTo}
            onChange={e => { setDateTo(e.target.value); setCurrentPage(1); }}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          {viewMode === 'detailed' ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 select-none">
                  <th onClick={() => handleSort('DATE_')} className="p-4 font-medium text-gray-600 text-sm cursor-pointer hover:bg-gray-100 transition-colors">
                    Tarix {renderSortIcon('DATE_')}
                  </th>
                  <th onClick={() => handleSort('CODE')} className="p-4 font-medium text-gray-600 text-sm cursor-pointer hover:bg-gray-100 transition-colors">
                    Kod {renderSortIcon('CODE')}
                  </th>
                  <th onClick={() => handleSort('NAME')} className="p-4 font-medium text-gray-600 text-sm cursor-pointer hover:bg-gray-100 transition-colors">
                    Ad {renderSortIcon('NAME')}
                  </th>
                  <th onClick={() => handleSort('Birim')} className="p-4 font-medium text-gray-600 text-sm cursor-pointer hover:bg-gray-100 transition-colors">
                    Birim {renderSortIcon('Birim')}
                  </th>
                  <th onClick={() => handleSort('CARI_ADI')} className="p-4 font-medium text-gray-600 text-sm cursor-pointer hover:bg-gray-100 transition-colors">
                    Təchizatçı {renderSortIcon('CARI_ADI')}
                  </th>
                  <th onClick={() => handleSort('MIKTAR')} className="p-4 font-medium text-gray-600 text-sm text-right cursor-pointer hover:bg-gray-100 transition-colors">
                    Miqdar {renderSortIcon('MIKTAR')}
                  </th>
                  <th onClick={() => handleSort('BIRIM_FIYAT')} className="p-4 font-medium text-gray-600 text-sm text-right cursor-pointer hover:bg-gray-100 transition-colors">
                    Qiymət USD {renderSortIcon('BIRIM_FIYAT')}
                  </th>
                  <th onClick={() => handleSort('NET_SATIS')} className="p-4 font-medium text-gray-600 text-sm text-right cursor-pointer hover:bg-gray-100 transition-colors">
                    Məbləğ USD {renderSortIcon('NET_SATIS')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {(paginatedData as PurchaseRecord[]).map((p, i) => {
                  const birimVal = p.Birim || p.BIRIM || p.BirimAd || 'Ədəd';
                  return (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 text-sm text-gray-600 whitespace-nowrap">{new Date(p.DATE_).toLocaleDateString()}</td>
                      <td className="p-4 text-sm text-gray-800 font-mono">{p.CODE}</td>
                      <td className="p-4 text-sm text-gray-800">{p.NAME}</td>
                      <td className="p-4 text-sm text-gray-600 font-medium">{birimVal}</td>
                      <td className="p-4 text-sm text-gray-600 truncate max-w-[200px]" title={p.CARI_ADI}>{p.CARI_ADI}</td>
                      <td className="p-4 text-sm text-gray-800 text-right">{p.MIKTAR}</td>
                      <td className="p-4 text-sm text-gray-800 text-right">{Number(p.BIRIM_FIYAT/1.7 || 0).toFixed(2)}</td>
                      <td className="p-4 text-sm text-gray-800 text-right font-medium">{Number(p.NET_SATIS/1.7 || 0).toFixed(2)}</td>
                    </tr>
                  );
                })}
                {paginatedData.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-500">Alış tapılmadı.</td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 select-none">
                  <th onClick={() => handleSort('code')} className="p-4 font-medium text-gray-600 text-sm cursor-pointer hover:bg-gray-100 transition-colors">
                    Kod {renderSortIcon('code')}
                  </th>
                  <th onClick={() => handleSort('name')} className="p-4 font-medium text-gray-600 text-sm cursor-pointer hover:bg-gray-100 transition-colors">
                    Ad {renderSortIcon('name')}
                  </th>
                  <th onClick={() => handleSort('totalQty')} className="p-4 font-medium text-gray-600 text-sm text-right cursor-pointer hover:bg-gray-100 transition-colors">
                    Cəmi Miqdar {renderSortIcon('totalQty')}
                  </th>
                  <th onClick={() => handleSort('totalAmount')} className="p-4 font-medium text-gray-600 text-sm text-right cursor-pointer hover:bg-gray-100 transition-colors">
                    Cəmi Məbləğ {renderSortIcon('totalAmount')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {(paginatedData as any[]).map((s, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 text-sm text-gray-800 font-mono">{s.code}</td>
                    <td className="p-4 text-sm text-gray-800">{s.name}</td>
                    <td className="p-4 text-sm text-gray-800 text-right">{s.totalQty.toFixed(2)}</td>
                    <td className="p-4 text-sm text-gray-800 text-right font-medium">{s.totalAmount.toFixed(2)}</td>
                  </tr>
                ))}
                {paginatedData.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500">Məlumat tapılmadı.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Cəmi {currentData.length} qeyddən {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, currentData.length)} göstərilir
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
