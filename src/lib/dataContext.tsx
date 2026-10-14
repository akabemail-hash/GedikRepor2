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
              dynamicTyping: true,
              skipEmptyLines: true,
              complete: (results) => resolve(results.data),
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
        // MERGE
        // -------------------------
        const purchases = [...archivePurchases, ...currentPurchases];
        const sales = [...archiveSales, ...currentSales];

        // STOCK = ONLY LIVE
        const finalStocks = stocks;

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
