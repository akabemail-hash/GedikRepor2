import React, { useState, useMemo } from 'react';
import { useData } from '../lib/dataContext';
import { Search, AlertCircle, ChevronLeft, ChevronRight, CalendarX2 } from 'lucide-react';

export default function UnsoldProductsReport() {
  const { data } = useData();
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const unsoldProducts = useMemo(() => {
    if (!data) return [];

    // 1. Find the reference date (max sale date in the dataset) to represent "today"
    let maxSaleDate = new Date();
    if (data.sales.length > 0) {
      const dates = data.sales
        .map(s => new Date(s.FATURATAR).getTime())
        .filter(t => !isNaN(t));
      if (dates.length > 0) {
        maxSaleDate = new Date(Math.max(...dates));
      }
    }

    // Calculate the date 1 year prior to the reference date
    const oneYearAgo = new Date(maxSaleDate);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    // 2. Filter purchases to only include "Commercial Good" (Ticari Mal)
    const commercialPurchases = data.purchases.filter(p => {
      const type = p.MALZEME_TIPI?.toString().toLowerCase() || '';
      return type.includes('ticari') || type.includes('commercial');
    });

    // Extract unique commercial products
    const commercialProductsMap = new Map<string, { code: string, name: string, lastPurchaseDate: Date | null }>();
    commercialPurchases.forEach(p => {
      const pDate = new Date(p.DATE_);
      const existing = commercialProductsMap.get(p.CODE);
      
      if (!existing || (existing.lastPurchaseDate && pDate > existing.lastPurchaseDate)) {
        commercialProductsMap.set(p.CODE, {
          code: p.CODE,
          name: p.NAME,
          lastPurchaseDate: isNaN(pDate.getTime()) ? null : pDate
        });
      }
    });

    // 3. Find the last sale date for each product
    const lastSaleDates = new Map<string, Date>();
    data.sales.forEach(s => {
      const sDate = new Date(s.FATURATAR);
      if (isNaN(sDate.getTime())) return;

      const existing = lastSaleDates.get(s.MalzemeKodu);
      if (!existing || sDate > existing) {
        lastSaleDates.set(s.MalzemeKodu, sDate);
      }
    });

    // 4. Filter products that haven't been sold in the last year AND have stock > 0
    const result = Array.from(commercialProductsMap.values()).map(product => {
      const lastSaleDate = lastSaleDates.get(product.code);
      const currentStock = data.stocks.find(s => s.CODE === product.code)?.STOCK || 0;
      
      return {
        ...product,
        lastSaleDate: lastSaleDate || null,
        currentStock
      };
    }).filter(product => {
      // Satılmayanlar filtresi (Son 1 yıldır satılmamış veya hiç satılmamış)
      const isUnsold = !product.lastSaleDate || product.lastSaleDate < oneYearAgo;
      
      // Stokta sıfırdan büyük olma şartı
      const hasStock = product.currentStock > 0;

      return isUnsold && hasStock;
    });

    // 5. Apply search filter
    return result.filter(p => 
      (p.code?.toString() || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.name?.toString() || '').toLowerCase().includes(search.toLowerCase())
    ).sort((a, b) => (a.name?.toString() || '').localeCompare(b.name?.toString() || ''));

  }, [data, search]);

  const totalPages = Math.ceil(unsoldProducts.length / itemsPerPage);
  const paginatedData = unsoldProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (!data) return null;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <CalendarX2 className="w-6 h-6 text-red-500" />
            Satılmayan Mallar (Stokta Var)
          </h2>
          <p className="text-sm text-slate-500 mt-1">Son 1 ildə satışı olmayan və anbarda stoku olan ticari malların siyahısı</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Məhsul axtar..." 
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 font-semibold text-slate-600 text-sm">Kod</th>
                <th className="p-4 font-semibold text-slate-600 text-sm">Ad</th>
                <th className="p-4 font-semibold text-slate-600 text-sm text-right">Cari Stok</th>
                <th className="p-4 font-semibold text-slate-600 text-sm">Son Alış Tarixi</th>
                <th className="p-4 font-semibold text-slate-600 text-sm">Son Satış Tarixi</th>
                <th className="p-4 font-semibold text-slate-600 text-sm">Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((p, i) => (
                <tr key={i} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 text-sm text-slate-800 font-mono">{p.code}</td>
                  <td className="p-4 text-sm text-slate-800 font-medium">{p.name}</td>
                  <td className="p-4 text-sm text-slate-800 text-right">
                    <span className="px-2 py-1 rounded-md bg-blue-50 text-blue-700 font-semibold">
                      {p.currentStock.toFixed(2)}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-600">
                    {p.lastPurchaseDate ? p.lastPurchaseDate.toLocaleDateString() : '-'}
                  </td>
                  <td className="p-4 text-sm text-slate-600">
                    {p.lastSaleDate ? p.lastSaleDate.toLocaleDateString() : <span className="text-slate-400 italic">Heç satılmayıb</span>}
                  </td>
                  <td className="p-4 text-sm">
                    <div className="flex items-center gap-1.5 text-red-600 bg-red-50 px-2.5 py-1 rounded-full w-fit">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium">Hərəkətsiz Stok</span>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedData.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Göstəriləcək məlumat tapılmadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
            <span className="text-sm text-slate-500 font-medium">
              Cəmi {unsoldProducts.length} qeyddən {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, unsoldProducts.length)} göstərilir
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