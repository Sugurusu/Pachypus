"use client";

import { Badge, Button, Card, Field, GhostButton, IconButton, Input, Select, Textarea } from "@/components/ui";
import { PlantMark } from "@/components/plant-mark";
import { getMetrics, percent, shortDate, yen } from "@/lib/calculations";
import { usePortfolioStore } from "@/lib/storage";
import type { DocumentCheckStatus, PaymentStatus, Plant, PlantStatus, SaleChannel } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  BookOpenCheck,
  CircleDollarSign,
  ClipboardList,
  Pencil,
  Flower2,
  History,
  Leaf,
  Minus,
  PackagePlus,
  Plus,
  ReceiptText,
  RotateCcw,
  Trash2,
  Search,
  Sprout,
  Store,
  WalletCards
} from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";

type Tab = "dashboard" | "garden" | "plants" | "lots" | "sale" | "expense" | "documents" | "history";
type QuickEntryKind = "仲介手数料" | "その他費用";
type DashboardBreakdown = "inventoryValuation" | "expenses" | null;

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "収益", icon: BarChart3 },
  { id: "garden", label: "庭", icon: Sprout },
  { id: "plants", label: "個体", icon: Leaf },
  { id: "lots", label: "ロット", icon: PackagePlus },
  { id: "sale", label: "販売", icon: CircleDollarSign },
  { id: "expense", label: "費用", icon: ReceiptText },
  { id: "documents", label: "書類", icon: BookOpenCheck },
  { id: "history", label: "履歴", icon: History }
];

const statuses: PlantStatus[] = ["在庫", "販売中", "売約済", "入金済", "売却済", "枯死", "返品"];
const documentStatuses: DocumentCheckStatus[] = ["未確認", "確認中", "確認済", "不足あり"];

function SectionTitle({ eyebrow, title, action }: { eyebrow: string; title: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-leaf">{eyebrow}</p>
        <h2 className="mt-1 text-2xl font-bold text-ink sm:text-3xl">{title}</h2>
      </div>
      {action}
    </div>
  );
}

function MetricCard({ label, value, sub, tone = "default" }: { label: string; value: string; sub?: string; tone?: "default" | "dark" | "green" }) {
  return (
    <Card className={cn("p-4", tone === "dark" && "bg-ink text-bone", tone === "green" && "border-moss bg-moss text-bone")}>
      <p className={cn("text-xs font-bold text-leaf", tone !== "default" && "text-bone/70")}>{label}</p>
      <p className="mt-2 break-words text-2xl font-black tabular-nums">{value}</p>
      {sub ? <p className={cn("mt-1 text-xs text-sumi/65", tone !== "default" && "text-bone/70")}>{sub}</p> : null}
    </Card>
  );
}

function MetricCardButton({
  label,
  value,
  sub,
  onClick
}: {
  label: string;
  value: string;
  sub?: string;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="w-full text-left">
      <Card className="p-4 transition hover:-translate-y-0.5 hover:border-moss">
        <p className="text-xs font-bold text-leaf">{label}</p>
        <p className="mt-2 break-words text-2xl font-black tabular-nums">{value}</p>
        {sub ? <p className="mt-1 text-xs text-sumi/65">{sub}</p> : null}
      </Card>
    </button>
  );
}

function StatusBadge({ status }: { status: PlantStatus }) {
  const classes: Record<PlantStatus, string> = {
    在庫: "border-moss/30 bg-leaf/10 text-moss",
    販売中: "border-gold bg-gold/20 text-ink",
    売約済: "border-clay bg-clay/15 text-clay",
    入金済: "border-ink bg-ink text-bone",
    売却済: "border-stone bg-stone/30 text-sumi",
    枯死: "border-stone bg-stone/40 text-sumi",
    返品: "border-clay bg-clay/10 text-clay"
  };
  return <Badge className={classes[status]}>{status}</Badge>;
}

function PlantCard({ plant, onSelect, onStatus }: { plant: Plant; onSelect: (plant: Plant) => void; onStatus: (id: string, status: PlantStatus) => void }) {
  return (
    <Card className="overflow-hidden p-3">
      <button className="grid w-full gap-3 text-left" onClick={() => onSelect(plant)}>
        <div className="rounded-md bg-washi p-4">
          <PlantMark status={plant.status} />
        </div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-black text-ink">{plant.plantCode}</p>
            <p className="text-sm text-sumi/70">{plant.name}</p>
          </div>
          <StatusBadge status={plant.status} />
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-xs text-sumi/55">原価</p>
            <p className="font-bold">{yen(plant.purchaseCost)}</p>
          </div>
          <div>
            <p className="text-xs text-sumi/55">純利益</p>
            <p className="font-bold">{yen(plant.netProfit)}</p>
          </div>
        </div>
      </button>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <GhostButton className="px-2 text-xs" onClick={() => onStatus(plant.id, plant.status === "販売中" ? "在庫" : "販売中")}>
          {plant.status === "販売中" ? "在庫へ" : "販売中へ"}
        </GhostButton>
        <GhostButton className="px-2 text-xs" onClick={() => onStatus(plant.id, "枯死")}>
          枯死
        </GhostButton>
      </div>
    </Card>
  );
}

export default function Home() {
  const { data, actions } = usePortfolioStore();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"すべて" | PlantStatus>("すべて");

  const metrics = useMemo(() => getMetrics(data), [data]);
  const filteredPlants = useMemo(() => {
    return data.plants
      .filter((plant) => (statusFilter === "すべて" ? true : plant.status === statusFilter))
      .filter((plant) => `${plant.plantCode} ${plant.name} ${plant.lotId}`.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => b.netProfit - a.netProfit);
  }, [data.plants, query, statusFilter]);
  const availablePlants = data.plants.filter((plant) => !["売却済", "入金済", "枯死", "返品"].includes(plant.status));
  const soldPlants = data.plants.filter((plant) => ["売却済", "入金済"].includes(plant.status));
  const gardenPlants = data.plants.filter((plant) => ["在庫", "販売中", "売約済", "枯死"].includes(plant.status));
  const recentSale = data.sales[data.sales.length - 1];
  const topProfitPlants = [...data.plants].sort((a, b) => b.netProfit - a.netProfit).slice(0, 3);

  return (
    <main className="min-h-screen">
      <header className="border-b border-stone/70 bg-bone/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-ink text-bone">
                <Flower2 className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-black text-ink">Pachypus Portfolio Manager</h1>
                <p className="text-sm text-sumi/65">高額植物の仕入れ、販売、利益、証明書を一元管理</p>
              </div>
            </div>
            <IconButton title="デモデータに戻す" onClick={actions.resetDemoData}>
              <RotateCcw className="h-4 w-4" />
            </IconButton>
          </div>
          <nav className="grid grid-cols-4 gap-2 md:grid-cols-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex min-h-14 flex-col items-center justify-center gap-1 rounded-md border px-2 text-xs font-bold transition",
                    activeTab === tab.id ? "border-ink bg-ink text-bone" : "border-stone bg-bone text-sumi hover:border-moss"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {activeTab === "dashboard" ? (
          <Dashboard
            metrics={metrics}
            plants={data.plants}
            lots={data.lots}
            sales={data.sales}
            expenses={data.expenses}
            recentSaleLabel={recentSale ? `${data.plants.find((plant) => plant.id === recentSale.plantId)?.plantCode ?? ""} / ${yen(recentSale.salePrice)}` : "まだ販売なし"}
            topProfitPlants={topProfitPlants}
            onAddExpense={actions.addExpense}
            onUpdateCommission={actions.updateSaleCommission}
            onSavePlant={actions.upsertPlant}
            onUpdateExpense={actions.updateExpense}
            onDeleteExpense={actions.deleteExpense}
          />
        ) : null}

        {activeTab === "garden" ? (
          <Garden
            metrics={metrics}
            gardenPlants={gardenPlants}
            soldPlants={soldPlants}
            onSelect={setSelectedPlant}
          />
        ) : null}

        {activeTab === "plants" ? (
          <PlantsView
            plants={filteredPlants}
            query={query}
            statusFilter={statusFilter}
            onQuery={setQuery}
            onStatusFilter={setStatusFilter}
            onSelect={setSelectedPlant}
            onStatus={actions.setPlantStatus}
          />
        ) : null}

        {activeTab === "lots" ? <LotsView data={data} onAdd={actions.addLot} onUpdate={actions.updateLot} /> : null}
        {activeTab === "sale" ? <SaleForm plants={availablePlants} onAdd={actions.addSale} /> : null}
        {activeTab === "expense" ? <ExpenseForm plants={data.plants} lots={data.lots} expenses={data.expenses} onAdd={actions.addExpense} onUpdateExpense={actions.updateExpense} onDeleteExpense={actions.deleteExpense} /> : null}
        {activeTab === "documents" ? <DocumentsView data={data} onUpdate={actions.updateDocument} /> : null}
        {activeTab === "history" ? <HistoryView data={data} /> : null}
      </div>

      {selectedPlant ? (
        <PlantDetail plant={selectedPlant} lotName={data.lots.find((lot) => lot.id === selectedPlant.lotId)?.name ?? ""} onClose={() => setSelectedPlant(null)} onSave={actions.upsertPlant} />
      ) : null}
    </main>
  );
}

function Dashboard({
  metrics,
  plants,
  lots,
  sales,
  expenses,
  recentSaleLabel,
  topProfitPlants,
  onAddExpense,
  onUpdateCommission,
  onSavePlant,
  onUpdateExpense,
  onDeleteExpense
}: {
  metrics: ReturnType<typeof getMetrics>;
  plants: Plant[];
  lots: ReturnType<typeof usePortfolioStore>["data"]["lots"];
  sales: ReturnType<typeof usePortfolioStore>["data"]["sales"];
  expenses: ReturnType<typeof usePortfolioStore>["data"]["expenses"];
  recentSaleLabel: string;
  topProfitPlants: Plant[];
  onAddExpense: ReturnType<typeof usePortfolioStore>["actions"]["addExpense"];
  onUpdateCommission: ReturnType<typeof usePortfolioStore>["actions"]["updateSaleCommission"];
  onSavePlant: ReturnType<typeof usePortfolioStore>["actions"]["upsertPlant"];
  onUpdateExpense: ReturnType<typeof usePortfolioStore>["actions"]["updateExpense"];
  onDeleteExpense: ReturnType<typeof usePortfolioStore>["actions"]["deleteExpense"];
}) {
  const [breakdown, setBreakdown] = useState<DashboardBreakdown>(null);
  const inventoryPlants = plants.filter((plant) => ["在庫", "販売中", "売約済"].includes(plant.status));
  const [editingInventoryPlantId, setEditingInventoryPlantId] = useState("");
  const [editingInventoryValue, setEditingInventoryValue] = useState("");
  const [editingExpenseId, setEditingExpenseId] = useState("");
  const [editingExpenseAmount, setEditingExpenseAmount] = useState("");

  return (
    <div className="grid gap-6">
      <SectionTitle eyebrow="Dashboard" title="収益と在庫を一目で見る" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="総売上" value={yen(metrics.totalSales)} tone="dark" />
        <MetricCard label="純利益" value={yen(metrics.totalNetProfit)} tone="green" />
        <MetricCard label="在庫本数" value={`${metrics.inventoryCount}本`} sub={`販売中 ${metrics.onSaleCount}本`} />
        <MetricCard label="販売済み本数" value={`${metrics.soldCount}本`} sub={`総仕入 ${metrics.totalPlantCount}本`} />
        <MetricCard label="総仕入額" value={yen(metrics.totalPurchaseCost)} />
        <MetricCard label="粗利益" value={yen(metrics.totalGrossProfit)} />
        <MetricCard label="投資回収率" value={percent(metrics.recoveryRate)} />
        <MetricCard label="平均販売単価" value={yen(metrics.averageSalePrice)} />
        <MetricCard label="平均利益率" value={percent(metrics.averageProfitMargin)} />
        <MetricCardButton label="未販売在庫の評価額" value={yen(metrics.inventoryValuation)} sub="押すと内訳を表示" onClick={() => setBreakdown((current) => current === "inventoryValuation" ? null : "inventoryValuation")} />
        <MetricCard label="手数料合計" value={yen(metrics.totalCommission)} />
        <MetricCardButton label="その他費用合計" value={yen(metrics.totalExpenses)} sub="押すと内訳を表示" onClick={() => setBreakdown((current) => current === "expenses" ? null : "expenses")} />
      </div>
      {breakdown === "inventoryValuation" ? (
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black text-ink">未販売在庫の評価額の内訳</p>
              <p className="text-xs text-sumi/60">在庫中の個体の想定販売価格を合計しています。</p>
            </div>
            <GhostButton onClick={() => setBreakdown(null)}>閉じる</GhostButton>
          </div>
          <div className="mt-4 grid gap-3">
            {inventoryPlants.map((plant) => (
              <div key={plant.id} className="grid gap-2 rounded-md border border-stone bg-washi p-3 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                <div>
                  <p className="font-black">{plant.plantCode}</p>
                  <p className="text-sm text-sumi/65">{plant.name}</p>
                </div>
                {editingInventoryPlantId === plant.id ? (
                  <Input type="number" inputMode="numeric" value={editingInventoryValue} onChange={(event) => setEditingInventoryValue(event.target.value)} />
                ) : (
                  <StatusBadge status={plant.status} />
                )}
                <div className="flex items-center justify-end gap-2">
                  {editingInventoryPlantId === plant.id ? (
                    <>
                      <GhostButton
                        className="px-3 text-xs"
                        onClick={() => {
                          onSavePlant({ ...plant, expectedSalePrice: Number(editingInventoryValue) || 0 });
                          setEditingInventoryPlantId("");
                          setEditingInventoryValue("");
                        }}
                      >
                        保存
                      </GhostButton>
                      <GhostButton className="px-3 text-xs" onClick={() => { setEditingInventoryPlantId(""); setEditingInventoryValue(""); }}>
                        戻す
                      </GhostButton>
                    </>
                  ) : (
                    <>
                      <p className="font-bold">{yen(plant.expectedSalePrice)}</p>
                      <IconButton
                        className="h-8 w-8"
                        title="想定販売価格を編集"
                        onClick={() => {
                          setEditingInventoryPlantId(plant.id);
                          setEditingInventoryValue(String(plant.expectedSalePrice));
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </IconButton>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
      {breakdown === "expenses" ? (
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black text-ink">その他費用合計の内訳</p>
              <p className="text-xs text-sumi/60">どの個体に、どの費用が入っているかをここで確認できます。</p>
            </div>
            <GhostButton onClick={() => setBreakdown(null)}>閉じる</GhostButton>
          </div>
          <div className="mt-4 grid gap-3">
            {expenses.map((expense) => {
              const plant = plants.find((item) => item.id === expense.plantId);
              return (
                <div key={expense.id} className="grid gap-2 rounded-md border border-stone bg-washi p-3 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                  <div>
                    <p className="font-black">{plant?.plantCode ?? "関連個体なし"} / {expense.category}</p>
                    <p className="text-sm text-sumi/65">{expense.memo || shortDate(expense.date)}</p>
                  </div>
                  <p className="text-sm text-sumi/70">{shortDate(expense.date)}</p>
                  <div className="flex items-center justify-end gap-2">
                    {editingExpenseId === expense.id ? (
                      <>
                        <Input className="w-28" type="number" inputMode="numeric" value={editingExpenseAmount} onChange={(event) => setEditingExpenseAmount(event.target.value)} />
                        <GhostButton
                          className="px-3 text-xs"
                          onClick={() => {
                            onUpdateExpense(expense.id, { ...expense, amount: Number(editingExpenseAmount) || 0 });
                            setEditingExpenseId("");
                            setEditingExpenseAmount("");
                          }}
                        >
                          保存
                        </GhostButton>
                      </>
                    ) : (
                      <>
                        <p className="font-bold">{yen(expense.amount)}</p>
                        <IconButton className="h-8 w-8" title="費用を編集" onClick={() => { setEditingExpenseId(expense.id); setEditingExpenseAmount(String(expense.amount)); }}>
                          <Pencil className="h-3.5 w-3.5" />
                        </IconButton>
                        <IconButton className="h-8 w-8" title="費用を削除" onClick={() => onDeleteExpense(expense.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </IconButton>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ) : null}
      <QuickDashboardEntry plants={plants} lots={lots} sales={sales} onAddExpense={onAddExpense} onUpdateCommission={onUpdateCommission} />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5">
          <p className="text-sm font-bold text-leaf">最近売れた個体</p>
          <p className="mt-2 text-2xl font-black">{recentSaleLabel}</p>
        </Card>
        <Card className="p-5 lg:col-span-2">
          <p className="text-sm font-bold text-leaf">利益ランキング</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {topProfitPlants.map((plant) => (
              <div key={plant.id} className="rounded-md border border-stone bg-washi p-3">
                <p className="font-black">{plant.plantCode}</p>
                <p className="mt-1 text-sm text-sumi/65">{yen(plant.netProfit)}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function QuickDashboardEntry({
  plants,
  lots,
  sales,
  onAddExpense,
  onUpdateCommission
}: {
  plants: Plant[];
  lots: ReturnType<typeof usePortfolioStore>["data"]["lots"];
  sales: ReturnType<typeof usePortfolioStore>["data"]["sales"];
  onAddExpense: ReturnType<typeof usePortfolioStore>["actions"]["addExpense"];
  onUpdateCommission: ReturnType<typeof usePortfolioStore>["actions"]["updateSaleCommission"];
}) {
  const soldPlantIds = new Set(sales.map((sale) => sale.plantId));
  const soldPlants = plants.filter((plant) => soldPlantIds.has(plant.id));
  const defaultPlant = soldPlants[0] ?? plants[0];
  const [kind, setKind] = useState<QuickEntryKind>("仲介手数料");
  const [plantId, setPlantId] = useState(defaultPlant?.id ?? "");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("鉢");

  const selectedPlant = plants.find((plant) => plant.id === plantId);
  const targetPlants = kind === "仲介手数料" ? soldPlants : plants;
  const disabled = !plantId || !amount || Number(amount) < 0 || (kind === "仲介手数料" && !soldPlantIds.has(plantId));

  function saveQuickEntry() {
    const numericAmount = Number(amount);
    if (!selectedPlant || disabled) return;

    if (kind === "仲介手数料") {
      onUpdateCommission(selectedPlant.id, numericAmount);
    } else {
      onAddExpense({
        date: new Date().toISOString().slice(0, 10),
        plantId: selectedPlant.id,
        lotId: selectedPlant.lotId || lots[0]?.id || "",
        category,
        amount: numericAmount,
        memo: "ダッシュボードから入力"
      });
    }

    setAmount("");
  }

  return (
    <Card className="grid gap-4 p-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-black text-ink">かんたん入力</p>
          <p className="text-xs text-sumi/60">集計画面から、個体を選んで費用や手数料をすぐ反映できます。</p>
        </div>
        <Badge>{selectedPlant?.plantCode ?? "個体未選択"}</Badge>
      </div>
      <div className="grid gap-3 lg:grid-cols-[180px_1fr_160px_160px_auto]">
        <Field label="入力するもの">
          <Select
            value={kind}
            onChange={(event) => {
              const nextKind = event.target.value as QuickEntryKind;
              const nextPlants = nextKind === "仲介手数料" ? soldPlants : plants;
              setKind(nextKind);
              setPlantId(nextPlants[0]?.id ?? "");
            }}
          >
            <option>仲介手数料</option>
            <option>その他費用</option>
          </Select>
        </Field>
        <Field label="対象のパキプス">
          <Select value={plantId} onChange={(event) => setPlantId(event.target.value)}>
            {targetPlants.map((plant) => (
              <option key={plant.id} value={plant.id}>
                {plant.plantCode} / {plant.name}
              </option>
            ))}
          </Select>
        </Field>
        {kind === "その他費用" ? (
          <Field label="費用カテゴリ">
            <Select value={category} onChange={(event) => setCategory(event.target.value)}>
              {["鉢", "土", "薬剤", "送料", "撮影費", "管理費", "移動費", "植替え費", "その他"].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </Select>
          </Field>
        ) : (
          <div className="hidden lg:block" />
        )}
        <Field label="金額">
          <Input type="number" min="0" inputMode="numeric" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="例: 35000" />
        </Field>
        <div className="flex items-end">
          <Button className="w-full whitespace-nowrap" disabled={disabled} onClick={saveQuickEntry}>
            反映
          </Button>
        </div>
      </div>
      {kind === "仲介手数料" && soldPlants.length === 0 ? (
        <p className="text-sm text-clay">販売済みの個体がまだないため、先に販売入力をしてください。</p>
      ) : null}
    </Card>
  );
}

function Garden({
  metrics,
  gardenPlants,
  soldPlants,
  onSelect
}: {
  metrics: ReturnType<typeof getMetrics>;
  gardenPlants: Plant[];
  soldPlants: Plant[];
  onSelect: (plant: Plant) => void;
}) {
  return (
    <div className="grid gap-6">
      <SectionTitle eyebrow="Garden View" title="保有本数と販売済み本数が増えていく庭" />
      <div className="grid gap-3 sm:grid-cols-3">
        <MetricCard label="総仕入本数" value={`${metrics.totalPlantCount}本`} />
        <MetricCard label="保有中" value={`${metrics.inventoryCount}本`} tone="green" />
        <MetricCard label="売却済み" value={`${metrics.soldCount}本`} tone="dark" />
      </div>
      <Card className="overflow-hidden">
        <div className="border-b border-stone bg-moss px-5 py-4 text-bone">
          <p className="font-black">保有している庭</p>
          <p className="text-sm text-bone/70">販売中は金の縁取り、枯死はグレー表示</p>
        </div>
        <div
          className="relative grid min-h-[320px] grid-cols-2 gap-4 overflow-hidden p-4 sm:grid-cols-3 lg:grid-cols-5"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(20,23,18,0.16), rgba(251,250,246,0.92) 46%, rgba(243,240,232,0.98)), url('pachypus-shelf.jpg')",
            backgroundPosition: "center 36%",
            backgroundSize: "cover"
          }}
        >
          <div className="pointer-events-none absolute inset-x-0 bottom-16 h-4 bg-[#8a6848]/70 shadow-[0_18px_28px_rgba(20,23,18,0.22)]" />
          {gardenPlants.map((plant) => (
            <button
              key={plant.id}
              onClick={() => onSelect(plant)}
              className="relative rounded-lg border border-stone bg-bone/95 p-4 text-center shadow-soft backdrop-blur-sm transition hover:-translate-y-1 hover:border-moss"
            >
              <PlantMark status={plant.status} className="h-36 w-28" />
              <p className="mt-3 font-black">{plant.plantCode}</p>
              <StatusBadge status={plant.status} />
            </button>
          ))}
        </div>
      </Card>
      <Card className="overflow-hidden">
        <div className="border-b border-stone bg-ink px-5 py-4 text-bone sm:flex sm:items-end sm:justify-between">
          <div>
            <p className="font-black">販売履歴の棚</p>
            <p className="text-sm text-bone/70">売却済み個体は販売実績として棚に残る</p>
          </div>
          <p className="mt-2 text-2xl font-black tabular-nums sm:mt-0">{soldPlants.length}本 SOLD</p>
        </div>
        <div className="relative grid min-h-[220px] grid-cols-2 gap-4 bg-[#171815] p-4 sm:grid-cols-4 lg:grid-cols-6">
          <div className="pointer-events-none absolute inset-x-0 top-24 h-3 bg-[#6f5038]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-10 h-3 bg-[#6f5038]" />
          {soldPlants.map((plant) => (
            <button
              key={plant.id}
              onClick={() => onSelect(plant)}
              className="relative rounded-md border border-[#b99a5b]/60 bg-[#f4f0e7] p-3 text-center shadow-[0_18px_32px_rgba(0,0,0,0.28)] transition hover:-translate-y-1"
            >
              <div className="absolute right-2 top-2 rounded-full bg-ink px-2 py-1 text-[10px] font-black text-bone">SOLD</div>
              <PlantMark status={plant.status} className="h-24 w-20" />
              <p className="mt-2 text-sm font-black">{plant.plantCode}</p>
              <p className="text-xs font-bold text-leaf">{yen(plant.actualSalePrice)}</p>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}

function PlantsView({
  plants,
  query,
  statusFilter,
  onQuery,
  onStatusFilter,
  onSelect,
  onStatus
}: {
  plants: Plant[];
  query: string;
  statusFilter: "すべて" | PlantStatus;
  onQuery: (value: string) => void;
  onStatusFilter: (value: "すべて" | PlantStatus) => void;
  onSelect: (plant: Plant) => void;
  onStatus: (id: string, status: PlantStatus) => void;
}) {
  return (
    <div className="grid gap-6">
      <SectionTitle eyebrow="Plants" title="個体一覧とステータス管理" />
      <Card className="grid gap-3 p-4 sm:grid-cols-[1fr_220px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-sumi/45" />
          <Input value={query} onChange={(event) => onQuery(event.target.value)} placeholder="個体ID、名前、ロットで検索" className="pl-9" />
        </div>
        <Select value={statusFilter} onChange={(event) => onStatusFilter(event.target.value as "すべて" | PlantStatus)}>
          <option>すべて</option>
          {statuses.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </Select>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plants.map((plant) => (
          <PlantCard key={plant.id} plant={plant} onSelect={onSelect} onStatus={onStatus} />
        ))}
      </div>
    </div>
  );
}

function LotsView({
  data,
  onAdd,
  onUpdate
}: {
  data: ReturnType<typeof usePortfolioStore>["data"];
  onAdd: ReturnType<typeof usePortfolioStore>["actions"]["addLot"];
  onUpdate: ReturnType<typeof usePortfolioStore>["actions"]["updateLot"];
}) {
  const [open, setOpen] = useState(false);
  const [editingLotId, setEditingLotId] = useState("");
  const [form, setForm] = useState({
    name: "",
    purchaseDate: new Date().toISOString().slice(0, 10),
    supplier: "",
    originCountry: "マダガスカル",
    importRoute: "",
    totalPurchaseCost: 0,
    quantity: 1,
    documentStatus: "未確認" as DocumentCheckStatus,
    memo: ""
  });
  const [editForm, setEditForm] = useState(form);

  function startLotEdit(lot: ReturnType<typeof usePortfolioStore>["data"]["lots"][number]) {
    setEditingLotId(lot.id);
    setEditForm({
      name: lot.name,
      purchaseDate: lot.purchaseDate,
      supplier: lot.supplier,
      originCountry: lot.originCountry,
      importRoute: lot.importRoute,
      totalPurchaseCost: lot.totalPurchaseCost,
      quantity: lot.quantity,
      documentStatus: lot.documentStatus,
      memo: lot.memo
    });
  }

  return (
    <div className="grid gap-6">
      <SectionTitle eyebrow="Lots" title="ロット管理" action={<Button onClick={() => setOpen((value) => !value)}><Plus className="h-4 w-4" />ロット追加</Button>} />
      {open ? (
        <Card className="grid gap-4 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="ロット名"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="仕入日"><Input type="date" value={form.purchaseDate} onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })} /></Field>
            <Field label="仕入先"><Input value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} /></Field>
            <Field label="原産国"><Input value={form.originCountry} onChange={(e) => setForm({ ...form, originCountry: e.target.value })} /></Field>
            <Field label="総仕入額"><Input type="text" inputMode="numeric" pattern="[0-9]*" value={form.totalPurchaseCost} onChange={(e) => setForm({ ...form, totalPurchaseCost: Number(e.target.value.replace(/\D/g, "")) })} /></Field>
            <Field label="仕入本数"><Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} /></Field>
          </div>
          <Field label="輸入経路"><Input value={form.importRoute} onChange={(e) => setForm({ ...form, importRoute: e.target.value })} /></Field>
          <Field label="メモ"><Textarea value={form.memo} onChange={(e) => setForm({ ...form, memo: e.target.value })} /></Field>
          <Button onClick={() => { onAdd(form); setOpen(false); }}>本数分の個体を自動生成して保存</Button>
        </Card>
      ) : null}
      <div className="grid gap-4 lg:grid-cols-2">
        {data.lots.map((lot) => {
          const plants = data.plants.filter((plant) => plant.lotId === lot.id);
          const sold = plants.filter((plant) => ["売却済", "入金済"].includes(plant.status)).length;
          const minimumQuantity = Math.max(sold, 1);
          const profit = plants.reduce((sum, plant) => sum + plant.netProfit, 0);
          const isEditing = editingLotId === lot.id;
          return (
            <Card key={lot.id} className="p-5">
              {isEditing ? (
                <div className="grid gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black">ロットを編集</p>
                      <p className="mt-1 text-sm text-sumi/65">本数を減らすと、未販売の個体から削除されます。売却済みの個体は履歴として残ります。</p>
                    </div>
                    <Badge>{yen(editForm.totalPurchaseCost / Math.max(editForm.quantity, 1))} / 本</Badge>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="ロット名"><Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} /></Field>
                    <Field label="仕入日"><Input type="date" value={editForm.purchaseDate} onChange={(e) => setEditForm({ ...editForm, purchaseDate: e.target.value })} /></Field>
                    <Field label="仕入先"><Input value={editForm.supplier} onChange={(e) => setEditForm({ ...editForm, supplier: e.target.value })} /></Field>
                    <Field label="原産国"><Input value={editForm.originCountry} onChange={(e) => setEditForm({ ...editForm, originCountry: e.target.value })} /></Field>
                    <Field label="総仕入額"><Input type="text" inputMode="numeric" pattern="[0-9]*" value={editForm.totalPurchaseCost} onChange={(e) => setEditForm({ ...editForm, totalPurchaseCost: Number(e.target.value.replace(/\D/g, "")) })} /></Field>
                    <Field label="仕入本数">
                      <div className="grid grid-cols-[44px_1fr_44px] gap-2">
                        <IconButton
                          title="1本減らす"
                          disabled={editForm.quantity <= minimumQuantity}
                          onClick={() => setEditForm({ ...editForm, quantity: Math.max(minimumQuantity, editForm.quantity - 1) })}
                        >
                          <Minus className="h-4 w-4" />
                        </IconButton>
                        <Input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={editForm.quantity}
                          onChange={(e) => {
                            const numericValue = Number(e.target.value.replace(/\D/g, ""));
                            setEditForm({ ...editForm, quantity: numericValue || minimumQuantity });
                          }}
                          onBlur={() => setEditForm({ ...editForm, quantity: Math.max(minimumQuantity, editForm.quantity || minimumQuantity) })}
                        />
                        <IconButton title="1本増やす" onClick={() => setEditForm({ ...editForm, quantity: editForm.quantity + 1 })}>
                          <Plus className="h-4 w-4" />
                        </IconButton>
                      </div>
                    </Field>
                    <Field label="書類確認"><Select value={editForm.documentStatus} onChange={(e) => setEditForm({ ...editForm, documentStatus: e.target.value as DocumentCheckStatus })}>{documentStatuses.map((status) => <option key={status}>{status}</option>)}</Select></Field>
                  </div>
                  {minimumQuantity > 1 ? <p className="text-xs text-sumi/60">販売済みが {sold}本あるため、{minimumQuantity}本未満にはできません。</p> : null}
                  <Field label="輸入経路"><Input value={editForm.importRoute} onChange={(e) => setEditForm({ ...editForm, importRoute: e.target.value })} /></Field>
                  <Field label="メモ"><Textarea value={editForm.memo} onChange={(e) => setEditForm({ ...editForm, memo: e.target.value })} /></Field>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Button
                      onClick={() => {
                        onUpdate(lot.id, editForm);
                        setEditingLotId("");
                      }}
                    >
                      保存
                    </Button>
                    <GhostButton onClick={() => setEditingLotId("")}>戻す</GhostButton>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black">{lot.name}</p>
                      <p className="mt-1 text-sm text-sumi/65">{lot.supplier} / {lot.originCountry}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge>{lot.documentStatus}</Badge>
                      <IconButton className="h-8 w-8" title="ロットを編集" onClick={() => startLotEdit(lot)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </IconButton>
                    </div>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-5">
                    <div><p className="text-sumi/55">総仕入額</p><p className="font-bold">{yen(lot.totalPurchaseCost)}</p></div>
                    <div><p className="text-sumi/55">1本原価</p><p className="font-bold">{yen(lot.unitCost)}</p></div>
                    <div><p className="text-sumi/55">本数</p><p className="font-bold">{lot.quantity}本</p></div>
                    <div><p className="text-sumi/55">売却済</p><p className="font-bold">{sold}本</p></div>
                    <div><p className="text-sumi/55">利益</p><p className="font-bold">{yen(profit)}</p></div>
                  </div>
                </>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function SaleForm({ plants, onAdd }: { plants: Plant[]; onAdd: ReturnType<typeof usePortfolioStore>["actions"]["addSale"] }) {
  const [form, setForm] = useState({
    plantId: plants[0]?.id ?? "",
    saleDate: new Date().toISOString().slice(0, 10),
    salePrice: 700000,
    channel: "Instagram" as SaleChannel,
    sellerAgent: "",
    commissionRate: 0,
    shippingCost: 0,
    otherCost: 0,
    paymentStatus: "入金済" as PaymentStatus,
    buyerMemo: "",
    memo: ""
  });
  const plant = plants.find((item) => item.id === form.plantId);
  const commission = form.salePrice * (form.commissionRate / 100);
  const net = plant ? form.salePrice - plant.purchaseCost - commission - form.shippingCost - form.otherCost : 0;

  return (
    <div className="grid gap-6">
      <SectionTitle eyebrow="Sales" title="販売入力と自動利益計算" />
      <Card className="grid gap-4 p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="個体"><Select value={form.plantId} onChange={(e) => setForm({ ...form, plantId: e.target.value })}>{plants.map((plant) => <option key={plant.id} value={plant.id}>{plant.plantCode} / {plant.name}</option>)}</Select></Field>
          <Field label="販売日"><Input type="date" value={form.saleDate} onChange={(e) => setForm({ ...form, saleDate: e.target.value })} /></Field>
          <Field label="販売価格"><Input type="number" value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: Number(e.target.value) })} /></Field>
          <Field label="仲介手数料率"><Input type="number" value={form.commissionRate} onChange={(e) => setForm({ ...form, commissionRate: Number(e.target.value) })} /></Field>
          <Field label="送料"><Input type="number" value={form.shippingCost} onChange={(e) => setForm({ ...form, shippingCost: Number(e.target.value) })} /></Field>
          <Field label="その他費用"><Input type="number" value={form.otherCost} onChange={(e) => setForm({ ...form, otherCost: Number(e.target.value) })} /></Field>
          <Field label="販売チャネル"><Select value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value as SaleChannel })}>{["Instagram", "直接販売", "仲介業者", "その他"].map((value) => <option key={value}>{value}</option>)}</Select></Field>
          <Field label="入金状況"><Select value={form.paymentStatus} onChange={(e) => setForm({ ...form, paymentStatus: e.target.value as PaymentStatus })}>{["未入金", "一部入金", "入金済"].map((value) => <option key={value}>{value}</option>)}</Select></Field>
        </div>
        <Field label="購入者メモ"><Textarea value={form.buyerMemo} onChange={(e) => setForm({ ...form, buyerMemo: e.target.value })} /></Field>
        <div className="grid gap-3 sm:grid-cols-3">
          <MetricCard label="手数料額" value={yen(commission)} />
          <MetricCard label="原価" value={yen(plant?.purchaseCost ?? 0)} />
          <MetricCard label="純利益" value={yen(net)} tone="green" />
        </div>
        <Button disabled={!form.plantId} onClick={() => onAdd(form)}>販売記録を保存</Button>
      </Card>
    </div>
  );
}

function ExpenseForm({
  plants,
  lots,
  expenses,
  onAdd,
  onUpdateExpense,
  onDeleteExpense
}: {
  plants: Plant[];
  lots: ReturnType<typeof usePortfolioStore>["data"]["lots"];
  expenses: ReturnType<typeof usePortfolioStore>["data"]["expenses"];
  onAdd: ReturnType<typeof usePortfolioStore>["actions"]["addExpense"];
  onUpdateExpense: ReturnType<typeof usePortfolioStore>["actions"]["updateExpense"];
  onDeleteExpense: ReturnType<typeof usePortfolioStore>["actions"]["deleteExpense"];
}) {
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), plantId: plants[0]?.id ?? "", lotId: lots[0]?.id ?? "", category: "鉢", amount: 0, memo: "" });
  const [editingExpenseId, setEditingExpenseId] = useState("");
  const [editingAmount, setEditingAmount] = useState("");
  return (
    <div className="grid gap-6">
      <SectionTitle eyebrow="Expenses" title="費用入力" />
      <Card className="grid gap-4 p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="日付"><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
          <Field label="費用カテゴリ"><Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{["鉢", "土", "薬剤", "送料", "撮影費", "管理費", "移動費", "植替え費", "その他"].map((value) => <option key={value}>{value}</option>)}</Select></Field>
          <Field label="関連個体"><Select value={form.plantId} onChange={(e) => setForm({ ...form, plantId: e.target.value })}>{plants.map((plant) => <option key={plant.id} value={plant.id}>{plant.plantCode}</option>)}</Select></Field>
          <Field label="関連ロット"><Select value={form.lotId} onChange={(e) => setForm({ ...form, lotId: e.target.value })}>{lots.map((lot) => <option key={lot.id} value={lot.id}>{lot.name}</option>)}</Select></Field>
          <Field label="金額"><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} /></Field>
        </div>
        <Field label="メモ"><Textarea value={form.memo} onChange={(e) => setForm({ ...form, memo: e.target.value })} /></Field>
        <Button onClick={() => onAdd(form)}>費用を保存</Button>
      </Card>
      <Card className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black text-ink">登録済み費用一覧</p>
            <p className="text-xs text-sumi/60">この一覧が、ダッシュボードの「その他費用合計」の中身です。</p>
          </div>
          <Badge>{expenses.length}件</Badge>
        </div>
        <div className="mt-4 grid gap-3">
          {expenses.map((expense) => {
            const plant = plants.find((item) => item.id === expense.plantId);
            const lot = lots.find((item) => item.id === expense.lotId);
            return (
              <div key={expense.id} className="grid gap-2 rounded-md border border-stone bg-washi p-3 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <p className="font-black">{plant?.plantCode ?? "関連個体なし"} / {expense.category}</p>
                  <p className="text-sm text-sumi/65">{lot?.name ?? "ロット未設定"} / {expense.memo || shortDate(expense.date)}</p>
                </div>
                <div className="flex items-center justify-end gap-2">
                  {editingExpenseId === expense.id ? (
                    <>
                      <Input className="w-28" type="number" inputMode="numeric" value={editingAmount} onChange={(event) => setEditingAmount(event.target.value)} />
                      <GhostButton
                        className="px-3 text-xs"
                        onClick={() => {
                          onUpdateExpense(expense.id, { ...expense, amount: Number(editingAmount) || 0 });
                          setEditingExpenseId("");
                          setEditingAmount("");
                        }}
                      >
                        保存
                      </GhostButton>
                    </>
                  ) : (
                    <>
                      <div className="text-right">
                        <p className="text-sm text-sumi/60">{shortDate(expense.date)}</p>
                        <p className="font-bold">{yen(expense.amount)}</p>
                      </div>
                      <IconButton className="h-8 w-8" title="費用を編集" onClick={() => { setEditingExpenseId(expense.id); setEditingAmount(String(expense.amount)); }}>
                        <Pencil className="h-3.5 w-3.5" />
                      </IconButton>
                      <IconButton className="h-8 w-8" title="費用を削除" onClick={() => onDeleteExpense(expense.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </IconButton>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function DocumentsView({ data, onUpdate }: { data: ReturnType<typeof usePortfolioStore>["data"]; onUpdate: ReturnType<typeof usePortfolioStore>["actions"]["updateDocument"] }) {
  return (
    <div className="grid gap-6">
      <SectionTitle eyebrow="Documents" title="証明書管理" />
      <div className="grid gap-3">
        {data.documents.map((document) => {
          const plant = data.plants.find((item) => item.id === document.plantId);
          return (
            <Card key={document.id} className="grid gap-3 p-4 sm:grid-cols-[1fr_180px] sm:items-center">
              <div>
                <p className="font-black">{plant?.plantCode} / {document.documentType}</p>
                <p className="text-sm text-sumi/65">{document.memo || "添付ファイルは Phase 2 で追加予定。確認ステータスを先に管理できます。"}</p>
              </div>
              <Select value={document.status} onChange={(e) => onUpdate(document.id, e.target.value as DocumentCheckStatus)}>
                {documentStatuses.map((status) => <option key={status}>{status}</option>)}
              </Select>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function HistoryView({ data }: { data: ReturnType<typeof usePortfolioStore>["data"] }) {
  const monthlySales = data.sales.reduce<Record<string, { sales: number; profit: number; count: number }>>((acc, sale) => {
    const month = sale.saleDate.slice(0, 7);
    acc[month] = acc[month] ?? { sales: 0, profit: 0, count: 0 };
    acc[month].sales += sale.salePrice;
    acc[month].profit += sale.netProfit;
    acc[month].count += 1;
    return acc;
  }, {});

  return (
    <div className="grid gap-6">
      <SectionTitle eyebrow="History" title="仕入・販売・費用・ステータス履歴" />
      <Card className="p-5">
        <p className="font-black">月別推移</p>
        <div className="mt-4 grid gap-3">
          {Object.entries(monthlySales).map(([month, item]) => (
            <div key={month} className="grid gap-2 rounded-md border border-stone bg-washi p-3 sm:grid-cols-4">
              <p className="font-bold">{month}</p>
              <p>売上 {yen(item.sales)}</p>
              <p>利益 {yen(item.profit)}</p>
              <p>累計販売 {item.count}本</p>
            </div>
          ))}
        </div>
      </Card>
      <div className="grid gap-3">
        {[...data.activityLogs].sort((a, b) => b.date.localeCompare(a.date)).map((log) => (
          <Card key={log.id} className="flex items-center gap-3 p-4">
            <Badge>{log.type}</Badge>
            <div>
              <p className="font-bold">{log.description}</p>
              <p className="text-sm text-sumi/60">{shortDate(log.date)}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function PlantDetail({ plant, lotName, onClose, onSave }: { plant: Plant; lotName: string; onClose: () => void; onSave: (plant: Plant) => void }) {
  const [draft, setDraft] = useState(plant);
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/45 p-4 backdrop-blur-sm">
      <Card className="mx-auto grid max-w-3xl gap-5 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-leaf">Plant Detail</p>
            <h3 className="mt-1 text-2xl font-black">{draft.plantCode}</h3>
            <p className="text-sm text-sumi/65">{lotName}</p>
          </div>
          <GhostButton onClick={onClose}>閉じる</GhostButton>
        </div>
        <div className="grid gap-5 md:grid-cols-[220px_1fr]">
          <div className="rounded-md bg-washi p-6"><PlantMark status={draft.status} className="h-36 w-28" /></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="個体名"><Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></Field>
            <Field label="ステータス"><Select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as PlantStatus })}>{statuses.map((status) => <option key={status}>{status}</option>)}</Select></Field>
            <Field label="想定販売価格"><Input type="number" value={draft.expectedSalePrice} onChange={(e) => setDraft({ ...draft, expectedSalePrice: Number(e.target.value) })} /></Field>
            <Field label="実売価格"><Input type="number" value={draft.actualSalePrice} onChange={(e) => setDraft({ ...draft, actualSalePrice: Number(e.target.value) })} /></Field>
            <Field label="幹幅"><Input value={draft.width} onChange={(e) => setDraft({ ...draft, width: e.target.value })} /></Field>
            <Field label="高さ"><Input value={draft.height} onChange={(e) => setDraft({ ...draft, height: e.target.value })} /></Field>
            <Field label="発根状況"><Select value={draft.rootingStatus} onChange={(e) => setDraft({ ...draft, rootingStatus: e.target.value as Plant["rootingStatus"] })}>{["未発根", "発根管理中", "発根済み"].map((value) => <option key={value}>{value}</option>)}</Select></Field>
            <Field label="管理場所"><Input value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} /></Field>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-4">
          <MetricCard label="原価" value={yen(draft.purchaseCost)} />
          <MetricCard label="粗利益" value={yen(draft.actualSalePrice - draft.purchaseCost)} />
          <MetricCard label="手数料" value={yen(draft.actualSalePrice * (draft.commissionRate / 100))} />
          <MetricCard label="利益率" value={percent(draft.actualSalePrice ? ((draft.actualSalePrice - draft.purchaseCost - draft.actualSalePrice * (draft.commissionRate / 100) - draft.otherCost) / draft.actualSalePrice) * 100 : 0)} />
        </div>
        <Field label="状態メモ"><Textarea value={draft.conditionMemo} onChange={(e) => setDraft({ ...draft, conditionMemo: e.target.value })} /></Field>
        <Field label="備考"><Textarea value={draft.memo} onChange={(e) => setDraft({ ...draft, memo: e.target.value })} /></Field>
        <Button onClick={() => { onSave(draft); onClose(); }}>保存</Button>
      </Card>
    </div>
  );
}
