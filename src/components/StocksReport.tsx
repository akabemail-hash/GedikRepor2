import React, { useState, useMemo } from 'react';
import { useData } from '../lib/dataContext';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

export default function StocksReport() {
  const { data } = useData();
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const filteredStocks = useMemo(() => {
    if (!data) return [];
    return data.stocks.filter(s => 
      s.CODE?.toString().toLowerCase().includes(search.toLowerCase()) ||
      s.NAME?.toString().toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  const totalPages = Math.ceil(filteredStocks.length / itemsPerPage);
  const paginatedStocks = filteredStocks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (!data) return null;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Stok Siyahısı</h2>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Kod və ya ad ilə axtar..." 
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 font-medium text-gray-600 text-sm">Stok Kodu</th>
                <th className="p-4 font-medium text-gray-600 text-sm">Stok Adı</th>
                <th className="p-4 font-medium text-gray-600 text-sm text-right">Miqdar</th>
              </tr>
            </thead>
            <tbody>
              {paginatedStocks.map((stock, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 text-sm text-gray-800 font-mono">{stock.CODE}</td>
                  <td className="p-4 text-sm text-gray-800">{stock.NAME}</td>
                  <td className="p-4 text-sm text-gray-800 text-right font-medium">{stock.STOCK}</td>
                </tr>
              ))}
              {filteredStocks.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-gray-500">Axtarışınıza uyğun stok tapılmadı.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Cəmi {filteredStocks.length} qeyddən {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredStocks.length)} göstərilir
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
