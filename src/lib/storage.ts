"use client";

import { calculatePlantProfit, calculateSaleProfit } from "@/lib/calculations";
import { initialData } from "@/lib/initial-data";
import type { Expense, Lot, Plant, PlantDocument, PlantStatus, PortfolioData, Sale } from "@/lib/types";
import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "pachypus-portfolio-manager:v1";

function nowIso() {
  return new Date().toISOString();
}

function uid(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function hydrate(): PortfolioData {
  if (typeof window === "undefined") return initialData;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialData;
    return JSON.parse(raw) as PortfolioData;
  } catch {
    return initialData;
  }
}

export function usePortfolioStore() {
  const [data, setData] = useState<PortfolioData>(initialData);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setData(hydrate());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data, ready]);

  const actions = useMemo(
    () => ({
      resetDemoData() {
        setData(initialData);
      },
      addLot(input: Pick<Lot, "name" | "purchaseDate" | "supplier" | "originCountry" | "importRoute" | "totalPurchaseCost" | "quantity" | "documentStatus" | "memo">) {
        const timestamp = nowIso();
        const lot: Lot = {
          ...input,
          id: uid("lot"),
          unitCost: input.quantity > 0 ? input.totalPurchaseCost / input.quantity : 0,
          createdAt: timestamp,
          updatedAt: timestamp
        };

        setData((current) => {
          const maxPlantNumber = current.plants.reduce((max, plant) => {
            const match = plant.plantCode.match(/PACHY-(\d+)/);
            return match ? Math.max(max, Number(match[1])) : max;
          }, 0);
          const generatedPlants: Plant[] = Array.from({ length: lot.quantity }).map((_, index) => {
            const plantCode = `PACHY-${String(maxPlantNumber + index + 1).padStart(3, "0")}`;
            return calculatePlantProfit({
              id: uid("plant"),
              plantCode,
              name: `${lot.name} ${index + 1}`,
              lotId: lot.id,
              purchaseDate: lot.purchaseDate,
              supplier: lot.supplier,
              originCountry: lot.originCountry,
              purchaseCost: lot.unitCost,
              expectedSalePrice: lot.unitCost * 2.5,
              actualSalePrice: 0,
              status: "在庫",
              imageUrl: "",
              width: "",
              height: "",
              rootingStatus: "未発根",
              conditionMemo: "",
              location: "",
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
              createdAt: timestamp,
              updatedAt: timestamp
            });
          });

          return {
            ...current,
            lots: [...current.lots, lot],
            plants: [...current.plants, ...generatedPlants],
            activityLogs: [
              {
                id: uid("activity"),
                type: "仕入",
                plantId: "",
                lotId: lot.id,
                description: `${lot.name} を ${lot.quantity}本仕入れ`,
                date: lot.purchaseDate,
                createdAt: timestamp
              },
              ...current.activityLogs
            ]
          };
        });
      },
      upsertPlant(input: Plant) {
        const timestamp = nowIso();
        const plant = calculatePlantProfit({ ...input, updatedAt: timestamp });
        setData((current) => {
          const exists = current.plants.some((item) => item.id === plant.id);
          return {
            ...current,
            plants: exists
              ? current.plants.map((item) => (item.id === plant.id ? plant : item))
              : [...current.plants, { ...plant, id: uid("plant"), createdAt: timestamp }]
          };
        });
      },
      setPlantStatus(plantId: string, status: PlantStatus) {
        const timestamp = nowIso();
        setData((current) => {
          const plant = current.plants.find((item) => item.id === plantId);
          return {
            ...current,
            plants: current.plants.map((item) => (item.id === plantId ? calculatePlantProfit({ ...item, status, updatedAt: timestamp }) : item)),
            activityLogs: plant
              ? [
                  {
                    id: uid("activity"),
                    type: "ステータス",
                    plantId,
                    lotId: plant.lotId,
                    description: `${plant.plantCode} を ${status} に変更`,
                    date: timestamp.slice(0, 10),
                    createdAt: timestamp
                  },
                  ...current.activityLogs
                ]
              : current.activityLogs
          };
        });
      },
      addSale(input: Omit<Sale, "id" | "commissionAmount" | "receivedAmount" | "netProfit" | "createdAt" | "updatedAt">) {
        const timestamp = nowIso();
        setData((current) => {
          const plant = current.plants.find((item) => item.id === input.plantId);
          if (!plant) return current;

          const sale = calculateSaleProfit(
            {
              ...input,
              id: uid("sale"),
              commissionAmount: 0,
              receivedAmount: 0,
              netProfit: 0,
              createdAt: timestamp,
              updatedAt: timestamp
            },
            plant
          );
          const status = sale.paymentStatus === "入金済" ? "入金済" : "売却済";

          return {
            ...current,
            sales: [...current.sales, sale],
            plants: current.plants.map((item) =>
              item.id === plant.id
                ? calculatePlantProfit({
                    ...item,
                    status,
                    actualSalePrice: sale.salePrice,
                    commissionRate: sale.commissionRate,
                    commissionAmount: sale.commissionAmount,
                    otherCost: sale.otherCost + sale.shippingCost,
                    saleDate: sale.saleDate,
                    paymentDate: sale.paymentStatus === "入金済" ? sale.saleDate : item.paymentDate,
                    sellerAgent: sale.sellerAgent,
                    buyerMemo: sale.buyerMemo,
                    updatedAt: timestamp
                  })
                : item
            ),
            activityLogs: [
              {
                id: uid("activity"),
                type: "販売",
                plantId: plant.id,
                lotId: plant.lotId,
                description: `${plant.plantCode} を ${sale.salePrice.toLocaleString("ja-JP")}円で販売`,
                date: sale.saleDate,
                createdAt: timestamp
              },
              ...current.activityLogs
            ]
          };
        });
      },
      addExpense(input: Omit<Expense, "id" | "createdAt" | "updatedAt">) {
        const timestamp = nowIso();
        const expense: Expense = {
          ...input,
          id: uid("expense"),
          createdAt: timestamp,
          updatedAt: timestamp
        };

        setData((current) => ({
          ...current,
          expenses: [...current.expenses, expense],
          activityLogs: [
            {
              id: uid("activity"),
              type: "費用",
              plantId: expense.plantId,
              lotId: expense.lotId,
              description: `${expense.category} ${expense.amount.toLocaleString("ja-JP")}円を記録`,
              date: expense.date,
              createdAt: timestamp
            },
            ...current.activityLogs
          ]
        }));
      },
      updateSaleCommission(plantId: string, commissionAmount: number) {
        const timestamp = nowIso();
        setData((current) => {
          const targetSale = [...current.sales].reverse().find((sale) => sale.plantId === plantId);
          const plant = current.plants.find((item) => item.id === plantId);
          if (!targetSale || !plant) return current;

          const commissionRate = targetSale.salePrice > 0 ? (commissionAmount / targetSale.salePrice) * 100 : 0;
          const otherCost = targetSale.shippingCost + targetSale.otherCost;
          const netProfit = targetSale.salePrice - plant.purchaseCost - commissionAmount - otherCost;

          return {
            ...current,
            sales: current.sales.map((sale) =>
              sale.id === targetSale.id
                ? {
                    ...sale,
                    commissionRate,
                    commissionAmount,
                    receivedAmount: sale.salePrice - commissionAmount - otherCost,
                    netProfit,
                    updatedAt: timestamp
                  }
                : sale
            ),
            plants: current.plants.map((item) =>
              item.id === plantId
                ? calculatePlantProfit({
                    ...item,
                    commissionRate,
                    commissionAmount,
                    otherCost,
                    updatedAt: timestamp
                  })
                : item
            ),
            activityLogs: [
              {
                id: uid("activity"),
                type: "費用",
                plantId,
                lotId: plant.lotId,
                description: `${plant.plantCode} の仲介手数料を ${commissionAmount.toLocaleString("ja-JP")}円に更新`,
                date: timestamp.slice(0, 10),
                createdAt: timestamp
              },
              ...current.activityLogs
            ]
          };
        });
      },
      updateDocument(documentId: string, status: PlantDocument["status"]) {
        const timestamp = nowIso();
        setData((current) => ({
          ...current,
          documents: current.documents.map((document) =>
            document.id === documentId ? { ...document, status, updatedAt: timestamp } : document
          )
        }));
      }
    }),
    []
  );

  return { data, ready, actions };
}
