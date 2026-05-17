export type PlantStatus =
  | "在庫"
  | "販売中"
  | "売約済"
  | "入金済"
  | "売却済"
  | "枯死"
  | "返品";

export type RootingStatus = "未発根" | "発根管理中" | "発根済み";
export type PaymentStatus = "未入金" | "一部入金" | "入金済";
export type SaleChannel = "Instagram" | "直接販売" | "仲介業者" | "その他";
export type DocumentCheckStatus = "未確認" | "確認中" | "確認済" | "不足あり";

export type Lot = {
  id: string;
  name: string;
  purchaseDate: string;
  supplier: string;
  originCountry: string;
  importRoute: string;
  totalPurchaseCost: number;
  quantity: number;
  unitCost: number;
  documentStatus: DocumentCheckStatus;
  memo: string;
  createdAt: string;
  updatedAt: string;
};

export type Plant = {
  id: string;
  plantCode: string;
  name: string;
  lotId: string;
  purchaseDate: string;
  supplier: string;
  originCountry: string;
  purchaseCost: number;
  expectedSalePrice: number;
  actualSalePrice: number;
  status: PlantStatus;
  imageUrl: string;
  width: string;
  height: string;
  rootingStatus: RootingStatus;
  conditionMemo: string;
  location: string;
  sellerAgent: string;
  commissionRate: number;
  commissionAmount: number;
  otherCost: number;
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
  saleDate: string;
  paymentDate: string;
  buyerMemo: string;
  memo: string;
  createdAt: string;
  updatedAt: string;
};

export type Sale = {
  id: string;
  plantId: string;
  saleDate: string;
  salePrice: number;
  channel: SaleChannel;
  sellerAgent: string;
  commissionRate: number;
  commissionAmount: number;
  shippingCost: number;
  otherCost: number;
  receivedAmount: number;
  netProfit: number;
  paymentStatus: PaymentStatus;
  buyerMemo: string;
  memo: string;
  createdAt: string;
  updatedAt: string;
};

export type Expense = {
  id: string;
  date: string;
  plantId: string;
  lotId: string;
  category: string;
  amount: number;
  memo: string;
  createdAt: string;
  updatedAt: string;
};

export type PlantDocument = {
  id: string;
  plantId: string;
  lotId: string;
  documentType: string;
  status: DocumentCheckStatus;
  fileUrl: string;
  memo: string;
  createdAt: string;
  updatedAt: string;
};

export type ActivityLog = {
  id: string;
  type: "仕入" | "販売" | "費用" | "ステータス" | "書類";
  plantId: string;
  lotId: string;
  description: string;
  date: string;
  createdAt: string;
};

export type PortfolioData = {
  lots: Lot[];
  plants: Plant[];
  sales: Sale[];
  expenses: Expense[];
  documents: PlantDocument[];
  activityLogs: ActivityLog[];
};

export type DashboardMetrics = {
  totalPurchaseCost: number;
  totalSales: number;
  totalCommission: number;
  totalExpenses: number;
  totalGrossProfit: number;
  totalNetProfit: number;
  totalPlantCount: number;
  soldCount: number;
  inventoryCount: number;
  onSaleCount: number;
  averageSalePrice: number;
  averageProfitMargin: number;
  recoveryRate: number;
  inventoryValuation: number;
  pendingDocumentCount: number;
};
