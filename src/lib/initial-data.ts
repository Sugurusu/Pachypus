import { calculatePlantProfit, calculateSaleProfit } from "@/lib/calculations";
import type { PortfolioData } from "@/lib/types";

const now = "2026-05-17T00:00:00.000Z";
const purchaseDate = "2026-05-01";
const lotId = "lot-202605-ishigaki";

const lot = {
  id: lotId,
  name: "2026年5月 石垣島パキプス3本",
  purchaseDate,
  supplier: "石垣島の仲介業者",
  originCountry: "マダガスカル",
  importRoute: "マダガスカル → 石垣島 → 購入者",
  totalPurchaseCost: 450000,
  quantity: 3,
  unitCost: 150000,
  documentStatus: "確認中" as const,
  memo: "初期デモロット。高額個体として証明書確認を継続。",
  createdAt: now,
  updatedAt: now
};

const basePlant = {
  lotId,
  purchaseDate,
  supplier: "石垣島の仲介業者",
  originCountry: "マダガスカル",
  purchaseCost: 150000,
  expectedSalePrice: 700000,
  actualSalePrice: 0,
  imageUrl: "",
  width: "幹幅 9cm",
  height: "高さ 28cm",
  rootingStatus: "発根管理中" as const,
  conditionMemo: "管理良好。日照と水やりを記録中。",
  location: "温室 A 棚",
  sellerAgent: "",
  commissionRate: 0,
  commissionAmount: 0,
  otherCost: 0,
  grossProfit: 0,
  netProfit: 0,
  profitMargin: 0,
  saleDate: "",
  paymentDate: "",
  buyerMemo: "",
  memo: "",
  createdAt: now,
  updatedAt: now
};

const plants = [
  calculatePlantProfit({
    ...basePlant,
    id: "plant-pachy-001",
    plantCode: "PACHY-001",
    name: "石垣島選抜 001",
    status: "売却済",
    actualSalePrice: 700000,
    saleDate: "2026-05-12",
    paymentDate: "2026-05-14",
    buyerMemo: "Instagram経由。支払い確認済み。",
    memo: "粗利益 550,000 円。"
  }),
  calculatePlantProfit({
    ...basePlant,
    id: "plant-pachy-002",
    plantCode: "PACHY-002",
    name: "石垣島選抜 002",
    status: "在庫"
  }),
  calculatePlantProfit({
    ...basePlant,
    id: "plant-pachy-003",
    plantCode: "PACHY-003",
    name: "石垣島選抜 003",
    status: "在庫",
    location: "温室 B 棚",
    rootingStatus: "発根済み"
  })
];

const sale = calculateSaleProfit(
  {
    id: "sale-pachy-001",
    plantId: "plant-pachy-001",
    saleDate: "2026-05-12",
    salePrice: 700000,
    channel: "Instagram",
    sellerAgent: "",
    commissionRate: 0,
    commissionAmount: 0,
    shippingCost: 0,
    otherCost: 0,
    receivedAmount: 700000,
    netProfit: 550000,
    paymentStatus: "入金済",
    buyerMemo: "Instagram DM 経由",
    memo: "初回デモ販売記録",
    createdAt: now,
    updatedAt: now
  },
  plants[0]
);

export const initialData: PortfolioData = {
  lots: [lot],
  plants,
  sales: [sale],
  expenses: [
    {
      id: "expense-pot-001",
      date: "2026-05-03",
      plantId: "plant-pachy-002",
      lotId,
      category: "鉢",
      amount: 12000,
      memo: "展示用の鉢",
      createdAt: now,
      updatedAt: now
    }
  ],
  documents: plants.flatMap((plant) => [
    {
      id: `doc-cites-${plant.id}`,
      plantId: plant.id,
      lotId,
      documentType: "CITES書類",
      status: plant.plantCode === "PACHY-001" ? ("確認済" as const) : ("確認中" as const),
      fileUrl: "",
      memo: "",
      createdAt: now,
      updatedAt: now
    },
    {
      id: `doc-quarantine-${plant.id}`,
      plantId: plant.id,
      lotId,
      documentType: "植物検疫書類",
      status: "確認済" as const,
      fileUrl: "",
      memo: "",
      createdAt: now,
      updatedAt: now
    }
  ]),
  activityLogs: [
    {
      id: "activity-lot-001",
      type: "仕入",
      plantId: "",
      lotId,
      description: "2026年5月 石垣島パキプス3本を仕入れ",
      date: purchaseDate,
      createdAt: now
    },
    {
      id: "activity-sale-001",
      type: "販売",
      plantId: "plant-pachy-001",
      lotId,
      description: "PACHY-001 を 700,000円で販売",
      date: "2026-05-12",
      createdAt: now
    }
  ]
};
