export interface PurchaseRecord {
  CODE: string;
  NAME: string;
  DATE_: string;
  MIKTAR: number;
  BIRIM_FIYAT: number;
  NET_SATIS: number;
  CARI_ADI: string;
  MALZEME_TIPI?: string;
  Birim?: string;
  BIRIM?: string;
  BirimAd?: string;
}

export interface SalesRecord {
  MalzemeKodu: string;
  MalzemeAd: string;
  FATURATAR: string;
  HareketMiktar: number;
  BirimFiyat: number;
  NetTutar: number;
  CUNVANI: string;
  Birim?: string;
  BIRIM?: string;
  BirimAd?: string;
}

export interface StockRecord {
  CODE: string;
  NAME: string;
  STOCK: number;
}

export interface AppData {
  purchases: PurchaseRecord[];
  sales: SalesRecord[];
  stocks: StockRecord[];
}
