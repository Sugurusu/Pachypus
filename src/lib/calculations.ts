import type { DashboardMetrics, Plant, PortfolioData, Sale } from "@/lib/types";

export function yen(value: number) {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0
  }).format(Number.isFinite(value) ? value : 0);
}

export function percent(value: number) {
  return `${(Number.isFinite(value) ? value : 0).toFixed(1)}%`;
}

export function calculatePlantProfit(plant: Plant): Plant {
  const actualSalePrice = Number(plant.actualSalePrice) || 0;
  const purchaseCost = Number(plant.purchaseCost) || 0;
  const commissionRate = Number(plant.commissionRate) || 0;
  const commissionAmount = actualSalePrice * (commissionRate / 100);
  const otherCost = Number(plant.otherCost) || 0;
  const grossProfit = actualSalePrice > 0 ? actualSalePrice - purchaseCost : 0;
  const netProfit = actualSalePrice > 0 ? actualSalePrice - purchaseCost - commissionAmount - otherCost : 0;
  const profitMargin = actualSalePrice > 0 ? (netProfit / actualSalePrice) * 100 : 0;

  return {
    ...plant,
    commissionAmount,
    grossProfit,
    netProfit,
    profitMargin
  };
}

export function calculateSaleProfit(sale: Sale, plant: Plant): Sale {
  const salePrice = Number(sale.salePrice) || 0;
  const commissionRate = Number(sale.commissionRate) || 0;
  const commissionAmount = salePrice * (commissionRate / 100);
  const otherCost = (Number(sale.otherCost) || 0) + (Number(sale.shippingCost) || 0);
  const netProfit = salePrice - plant.purchaseCost - commissionAmount - otherCost;

  return {
    ...sale,
    commissionAmount,
    receivedAmount: salePrice - commissionAmount - otherCost,
    netProfit
  };
}

export function getMetrics(data: PortfolioData): DashboardMetrics {
  const totalPurchaseCost = data.lots.reduce((sum, lot) => sum + lot.totalPurchaseCost, 0);
  const totalSales = data.sales.reduce((sum, sale) => sum + sale.salePrice, 0);
  const totalCommission = data.sales.reduce((sum, sale) => sum + sale.commissionAmount, 0);
  const totalExpenses = data.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalGrossProfit = data.plants.reduce((sum, plant) => sum + plant.grossProfit, 0);
  const totalPlantCount = data.plants.length;
  const soldCount = data.plants.filter((plant) => ["売却済", "入金済"].includes(plant.status)).length;
  const inventoryCount = data.plants.filter((plant) => ["在庫", "販売中"].includes(plant.status)).length;
  const onSaleCount = data.plants.filter((plant) => plant.status === "販売中").length;
  const soldPlants = data.plants.filter((plant) => plant.actualSalePrice > 0);
  const totalNetProfit = totalSales - totalPurchaseCost - totalCommission - totalExpenses;
  const averageSalePrice = soldPlants.length ? totalSales / soldPlants.length : 0;
  const averageProfitMargin = soldPlants.length
    ? soldPlants.reduce((sum, plant) => sum + plant.profitMargin, 0) / soldPlants.length
    : 0;
  const recoveryRate = totalPurchaseCost > 0 ? (totalSales / totalPurchaseCost) * 100 : 0;
  const inventoryValuation = data.plants
    .filter((plant) => ["在庫", "販売中", "売約済"].includes(plant.status))
    .reduce((sum, plant) => sum + plant.expectedSalePrice, 0);
  const pendingDocumentCount = data.documents.filter((document) => document.status !== "確認済").length;

  return {
    totalPurchaseCost,
    totalSales,
    totalCommission,
    totalExpenses,
    totalGrossProfit,
    totalNetProfit,
    totalPlantCount,
    soldCount,
    inventoryCount,
    onSaleCount,
    averageSalePrice,
    averageProfitMargin,
    recoveryRate,
    inventoryValuation,
    pendingDocumentCount
  };
}

export function nextPlantCode(plants: Plant[]) {
  const maxNumber = plants.reduce((max, plant) => {
    const match = plant.plantCode.match(/PACHY-(\d+)/);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);

  return `PACHY-${String(maxNumber + 1).padStart(3, "0")}`;
}

export function shortDate(value: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("ja-JP", {
    month: "2-digit",
    day: "2-digit"
  }).format(new Date(value));
}
