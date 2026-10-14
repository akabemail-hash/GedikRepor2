import React, { createContext, useContext, useState, useEffect } from 'react';
import Papa from 'papaparse';
import { AppData } from '../types';

interface DataContextType {
  data: AppData | null;
  loading: boolean;
  error: string | null;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {

        // -------------------------
        // CSV PARSER (ARCHIVE)
        // -------------------------
        const fetchAndParse = async (url: string) => {
          const response = await fetch(url);

          if (!response.ok) {
            throw new Error(`HTTP Error ${response.status} for ${url}`);
          }

          const text = await response.text();

          return new Promise<any[]>((resolve, reject) => {
            Papa.parse(text, {
              header: true,
              dynamicTyping: false, // Keep text strings as strings to preserve leading zeros (e.g. "0046")
              skipEmptyLines: true,
              complete: (results) => {
                const parsed = (results.data as any[]).map(row => {
                  const newRow: any = { ...row };
                  // Convert numerical columns to numbers safely
                  ['MIKTAR', 'BIRIM_FIYAT', 'NET_SATIS', 'HareketMiktar', 'BirimFiyat', 'NetTutar', 'STOCK'].forEach(field => {
                    if (newRow[field] !== undefined && newRow[field] !== null && newRow[field] !== '') {
                      const num = Number(String(newRow[field]).replace(',', '.'));
                      if (!isNaN(num)) newRow[field] = num;
                    }
                  });
                  return newRow;
                });
                resolve(parsed);
              },
              error: (err: any) =>
                reject(new Error(`CSV Parse Error in ${url}: ${err.message}`)),
            });
          });
        };

        // -------------------------
        // API FETCH
        // -------------------------
        const fetchAPI = async (url: string) => {
          const response = await fetch(url, {
            headers: {
              "x-api-key": "super-secret-key"
            }
          });

          if (!response.ok) {
            throw new Error(`API Error ${response.status} for ${url}`);
          }

          return await response.json();
        };

        const currentYear = new Date().getFullYear();

        // -------------------------
        // PARALLEL LOAD (SAFE)
        // -------------------------
        const results = await Promise.allSettled([
          // 📁 ARCHIVE (CSV)
          fetchAndParse('/csv/PURCHASE.csv'),
          fetchAndParse('/csv/SALES.csv'),

          // ⚡ CURRENT YEAR (API)
          fetchAPI(`/api/purchases?year=${currentYear}`),
          fetchAPI(`/api/sales?year=${currentYear}`),
          fetchAPI(`/api/stocks`), // 🔥 ONLY LIVE DATA
        ]);

        // -------------------------
        // SAFE DESTRUCTURE
        // -------------------------
        const [
          archivePurchasesRes,
          archiveSalesRes,
          currentPurchasesRes,
          currentSalesRes,
          stocksRes
        ] = results;

        const archivePurchases =
          archivePurchasesRes.status === "fulfilled"
            ? archivePurchasesRes.value
            : [];

        const archiveSales =
          archiveSalesRes.status === "fulfilled"
            ? archiveSalesRes.value
            : [];

        const currentPurchases =
          currentPurchasesRes.status === "fulfilled"
            ? currentPurchasesRes.value
            : [];

        const currentSales =
          currentSalesRes.status === "fulfilled"
            ? currentSalesRes.value
            : [];

        const stocks =
          stocksRes.status === "fulfilled"
            ? stocksRes.value
            : [];

        // -------------------------
        // MERGE & EXCLUDE 2026 FROM PURCHASE CSV
        // -------------------------
        const textCode = (val: any) => (val !== undefined && val !== null ? String(val).trim() : '');
        const getRecordYear = (dateStr: string) => {
          const d = new Date(dateStr);
          return isNaN(d.getTime()) ? null : d.getFullYear();
        };

        // Exclude currentYear (2026) purchases from CSV archive so they come from API
        const archivePurchasesFiltered = archivePurchases.filter((p: any) => {
          const year = getRecordYear(p.DATE_);
          return year === null || year < currentYear;
        });

        const rawPurchases = [...archivePurchasesFiltered, ...currentPurchases];
        const rawSales = [...archiveSales, ...currentSales];
        const rawStocks = stocks;

        const nameMap = new Map<string, string>();
        [...rawPurchases, ...rawStocks].forEach((item: any) => {
          const code = textCode(item.CODE || item.MalzemeKodu);
          const name = item.NAME || item.MalzemeAd;
          if (code && name) {
            nameMap.set(code, name);
          }
        });
        rawSales.forEach((s: any) => {
          const code = textCode(s.MalzemeKodu || s.CODE);
          const name = s.MalzemeAd || s.NAME;
          if (code && name && !nameMap.has(code)) {
            nameMap.set(code, name);
          }
        });

        // Map all purchase rows preserving every single transaction line
        const purchases = rawPurchases.map((p: any) => {
          const code = textCode(p.CODE);
          return {
            ...p,
            CODE: code,
            NAME: nameMap.get(code) || p.NAME
          };
        });

        // Map all sales rows preserving every single transaction line
        const sales = rawSales.map((s: any) => {
          const code = textCode(s.MalzemeKodu);
          return {
            ...s,
            MalzemeKodu: code,
            MalzemeAd: nameMap.get(code) || s.MalzemeAd
          };
        });

        const finalStocks = rawStocks.map((st: any) => {
          const code = textCode(st.CODE);
          return {
            ...st,
            CODE: code,
            NAME: nameMap.get(code) || st.NAME
          };
        });

        // -------------------------
        // SET STATE
        // -------------------------
        setData({
          purchases,
          sales,
          stocks: finalStocks
        });

        // -------------------------
        // WARNINGS (OPTIONAL)
        // -------------------------
        if (stocksRes.status === "rejected") {
          console.warn("STOCK API failed - live data not available");
        }

      } catch (err: any) {
        console.error("Data loading error:", err);
        setError(`Məlumatları yükləmək mümkün olmadı. Detal: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <DataContext.Provider value={{ data, loading, error }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};
