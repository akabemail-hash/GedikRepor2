import React, { useState, useMemo } from 'react';
import { useData } from '../lib/dataContext';
import { Search, X, TrendingUp, TrendingDown, Package, ChevronLeft, ChevronRight } from 'lucide-react';

export default function DetailedReport() {
  const { data } = useData();
  const [search, setSearch] = useState('');
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  
  // Pagination for main grid
  const [currentGridPage, setCurrentGridPage] = useState(1);
  const gridItemsPerPage = 24;

  // Pagination for modal lists
  const [currentPurchasePage, setCurrentPurchasePage] = useState(1);
  const [currentSalePage, setCurrentSalePage] = useState(1);
  const modalItemsPerPage = 10;

  const uniqueStocks = useMemo(() => {
    if (!data) return [];
    const stockMap = new Map<string, { code: string, name: string }>();
    data.stocks.forEach(s => stockMap.set(s.CODE, { code: s.CODE, name: s.NAME }));
    data.purchases.forEach(p => stockMap.set(p.CODE, { code: p.CODE, name: p.NAME }));
    data.sales.forEach(s => stockMap.set(s.MalzemeKodu, { code: s.MalzemeKodu, name: s.MalzemeAd }));
    
    return Array.from(stockMap.values()).filter(s => 
      s.code?.toString().toLowerCase().includes(search.toLowerCase()) ||
      s.name?.toString().toLowerCase().includes(search.toLowerCase())
    ).sort((a, b) => (a.name?.toString() || '').localeCompare(b.name?.toString() || ''));
  }, [data, search]);

  const totalGridPages = Math.ceil(uniqueStocks.length / gridItemsPerPage);
  const paginatedGrid = uniqueStocks.slice(
    (currentGridPage - 1) * gridItemsPerPage,
    currentGridPage * gridItemsPerPage
  );

  const stockDetails = useMemo(() => {
    if (!data || !selectedStock) return null;
    
    const stockCode = selectedStock;
    const stockInfo = data.stocks.find(s => s.CODE === stockCode);
    const purchases = data.purchases.filter(p => p.CODE === stockCode).sort((a, b) => new Date(b.DATE_).getTime() - new Date(a.DATE_).getTime());
    const sales = data.sales.filter(s => s.MalzemeKodu === stockCode).sort((a, b) => new Date(b.FATURATAR).getTime() - new Date(a.FATURATAR).getTime());

    const lastPurchasePrice = purchases.length > 0 ? purchases[0].BIRIM_FIYAT : null;
    const lastSalePrice = sales.length > 0 ? sales[0].BirimFiyat : null;
    const currentStock = stockInfo ? stockInfo.STOCK : 0;
    const name = purchases[0]?.NAME || sales[0]?.MalzemeAd || stockInfo?.NAME || stockCode;
    const lastPurchasePriceUSD = lastPurchasePrice/1.7;

    return {
      code: stockCode,
      name,
      currentStock,
      lastPurchasePrice,
      lastPurchasePriceUSD,
      lastSalePrice,
      purchases,
      sales
    };
  }, [data, selectedStock]);

  const totalPurchasePages = stockDetails ? Math.ceil(stockDetails.purchases.length / modalItemsPerPage) : 0;
  const paginatedPurchases = stockDetails ? stockDetails.purchases.slice(
    (currentPurchasePage - 1) * modalItemsPerPage,
    currentPurchasePage * modalItemsPerPage
  ) : [];

  const totalSalePages = stockDetails ? Math.ceil(stockDetails.sales.length / modalItemsPerPage) : 0;
  const paginatedSales = stockDetails ? stockDetails.sales.slice(
    (currentSalePage - 1) * modalItemsPerPage,
    currentSalePage * modalItemsPerPage
  ) : [];

  if (!data) return null;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Ətraflı Hesabat</h2>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Məhsul axtar..." 
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentGridPage(1); }}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {paginatedGrid.map((stock, i) => (
          <div 
            key={i} 
            onClick={() => { 
              setSelectedStock(stock.code); 
              setCurrentPurchasePage(1);
              setCurrentSalePage(1);
            }}
            className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:border-blue-400 hover:shadow-md transition-all group"
          >
            <div className="text-xs text-slate-400 font-mono mb-1 group-hover:text-blue-500 transition-colors">{stock.code}</div>
            <div className="font-medium text-slate-800 line-clamp-2">{stock.name}</div>
          </div>
        ))}
        {paginatedGrid.length === 0 && (
          <div className="col-span-full p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
            Axtarışa uyğun məhsul tapılmadı.
          </div>
        )}
      </div>

      {totalGridPages > 1 && (
        <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-sm text-slate-500 font-medium">
            Cəmi {uniqueStocks.length} məhsuldan {(currentGridPage - 1) * gridItemsPerPage + 1} - {Math.min(currentGridPage * gridItemsPerPage, uniqueStocks.length)} göstərilir
          </span>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentGridPage(p => Math.max(1, p - 1))}
              disabled={currentGridPage === 1}
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setCurrentGridPage(p => Math.min(totalGridPages, p + 1))}
              disabled={currentGridPage === totalGridPages}
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {selectedStock && stockDetails && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
              <div>
                <div className="text-sm text-slate-500 font-mono mb-1">{stockDetails.code}</div>
                <h3 className="text-xl font-bold text-slate-900">{stockDetails.name}</h3>
              </div>
              <button onClick={() => setSelectedStock(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-2 text-blue-600 mb-2">
                    <Package className="w-4 h-4" />
                    <span className="text-sm font-medium uppercase tracking-wider">Cari Stok</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-900">{stockDetails.currentStock?.toFixed(2)}</div>
                </div>
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                  <div className="flex items-center gap-2 text-emerald-600 mb-2">
                    <TrendingDown className="w-4 h-4" />
                    <span className="text-sm font-medium uppercase tracking-wider">Son Alış</span>
                  </div>
                  <div className="text-2xl font-bold text-emerald-900">
                    {stockDetails.lastPurchasePrice !== null ? `${Number(stockDetails.lastPurchasePrice).toFixed(2)} ₼` : '-'}
                  </div>
                </div>

  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                  <div className="flex items-center gap-2 text-emerald-600 mb-2">
                    <TrendingDown className="w-4 h-4" />
                    <span className="text-sm font-medium uppercase tracking-wider">Son Alış USD</span>
                  </div>
                  <div className="text-2xl font-bold text-emerald-900">
                    {stockDetails.lastPurchasePrice !== null ? `${Number(stockDetails.lastPurchasePriceUSD).toFixed(2)} USD` : '-'}
                  </div>
                </div>
                
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                  <div className="flex items-center gap-2 text-amber-600 mb-2">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-medium uppercase tracking-wider">Son Satış</span>
                  </div>
                  <div className="text-2xl font-bold text-amber-900">
                    {stockDetails.lastSalePrice !== null ? `${Number(stockDetails.lastSalePrice).toFixed(2)} ₼` : '-'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Purchase Details */}
                <div>
                  <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-emerald-600" />
                    Alış Detayları
                  </h4>
                  <div className="border border-slate-200 rounded-xl overflow-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="p-4 font-semibold text-slate-600 text-xs">Tarix</th>
                          <th className="p-4 font-semibold text-slate-600 text-xs">Təchizatçı</th>
                          <th className="p-4 font-semibold text-slate-600 text-xs text-right">Miqdar</th>
                          <th className="p-4 font-semibold text-slate-600 text-xs text-right">Qiymət</th>
                           <th className="p-4 font-semibold text-slate-600 text-xs text-right">Qiymət USD</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedPurchases.map((p, i) => (
                          <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                            <td className="p-3 text-sm text-slate-600">{new Date(p.DATE_).toLocaleDateString()}</td>
                            <td className="p-3 text-sm text-slate-800 truncate max-w-[120px]" title={p.CARI_ADI}>{p.CARI_ADI}</td>
                            <td className="p-3 text-sm text-slate-800 text-right">{p.MIKTAR}</td>
                            <td className="p-3 text-sm text-slate-800 text-right font-medium">{Number(p.BIRIM_FIYAT || 0).toFixed(2)} ₼</td>
                              <td className="p-3 text-sm text-slate-800 text-right font-medium">{Number(p.BIRIM_FIYAT/1.7 || 0).toFixed(2)} USD</td>
                          </tr>
                        ))}
                        {stockDetails.purchases.length === 0 && (
                          <tr>
                            <td colSpan={5} className="p-6 text-center text-slate-500 text-sm">Alış tarixçəsi tapılmadı.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                    
                    {totalPurchasePages > 1 && (
                      <div className="p-2 border-t border-slate-100 flex items-center justify-between bg-slate-50">
                        <span className="text-xs text-slate-500 pl-2">
                          {currentPurchasePage} / {totalPurchasePages}
                        </span>
                        <div className="flex gap-1">
                          <button 
                            onClick={() => setCurrentPurchasePage(p => Math.max(1, p - 1))}
                            disabled={currentPurchasePage === 1}
                            className="p-1 border border-slate-200 rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                          >
                            <ChevronLeft className="w-4 h-4 text-slate-600" />
                          </button>
                          <button 
                            onClick={() => setCurrentPurchasePage(p => Math.min(totalPurchasePages, p + 1))}
                            disabled={currentPurchasePage === totalPurchasePages}
                            className="p-1 border border-slate-200 rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                          >
                            <ChevronRight className="w-4 h-4 text-slate-600" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sales Details */}
                <div>
                  <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-amber-600" />
                    Satış Detayları
                  </h4>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="p-4 font-semibold text-slate-600 text-xs">Tarix</th>
                          <th className="p-4 font-semibold text-slate-600 text-xs">Müştəri</th>
                          <th className="p-4 font-semibold text-slate-600 text-xs text-right">Miqdar</th>
                          <th className="p-4 font-semibold text-slate-600 text-xs text-right">Qiymət</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedSales.map((s, i) => (
                          <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                            <td className="p-4 text-sm text-slate-600">{new Date(s.FATURATAR).toLocaleDateString()}</td>
                            <td className="p-4 text-sm text-slate-800 truncate max-w-[120px]" title={s.CUNVANI}>{s.CUNVANI}</td>
                            <td className="p-4 text-sm text-slate-800 text-right">{s.HareketMiktar}</td>
                            <td className="p-4 text-sm text-slate-800 text-right font-medium">{Number(s.BirimFiyat || 0).toFixed(2)} ₼</td>
                          </tr>
                        ))}
                        {stockDetails.sales.length === 0 && (
                          <tr>
                            <td colSpan={4} className="p-6 text-center text-slate-500 text-sm">Satış tarixçəsi tapılmadı.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                    
                    {totalSalePages > 1 && (
                      <div className="p-2 border-t border-slate-100 flex items-center justify-between bg-slate-50">
                        <span className="text-xs text-slate-500 pl-2">
                          {currentSalePage} / {totalSalePages}
                        </span>
                        <div className="flex gap-1">
                          <button 
                            onClick={() => setCurrentSalePage(p => Math.max(1, p - 1))}
                            disabled={currentSalePage === 1}
                            className="p-1 border border-slate-200 rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                          >
                            <ChevronLeft className="w-4 h-4 text-slate-600" />
                          </button>
                          <button 
                            onClick={() => setCurrentSalePage(p => Math.min(totalSalePages, p + 1))}
                            disabled={currentSalePage === totalSalePages}
                            className="p-1 border border-slate-200 rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                          >
                            <ChevronRight className="w-4 h-4 text-slate-600" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
