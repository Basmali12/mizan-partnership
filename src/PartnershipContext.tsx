import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
export type Branch = "Baghdad" | "Najaf";
export type TransactionType = "capital" | "expense" | "withdrawal" | "revenue";
export interface Transaction {
  id: string;
  date: string;
  branch: Branch;
  type: TransactionType;
  amount: number;
  description: string;
  partner?: "Wesam" | "Hussein";
}
export type NewTransaction = Omit<Transaction, "id" | "date">;
export interface BranchTotals {
  Baghdad: number;
  Najaf: number;
  total: number;
}
const empty = (): BranchTotals => ({ Baghdad: 0, Najaf: 0, total: 0 });
const initial: Transaction[] = [
  {
    id: "1",
    date: "2026-10-01T09:00:00Z",
    branch: "Baghdad",
    type: "capital",
    amount: 5000000,
    description: "رأس المال التأسيسي لفرع بغداد",
  },
  {
    id: "2",
    date: "2026-10-01T10:00:00Z",
    branch: "Najaf",
    type: "capital",
    amount: 3000000,
    description: "رأس المال التأسيسي لفرع النجف",
  },
  {
    id: "3",
    date: "2026-10-02T09:00:00Z",
    branch: "Baghdad",
    type: "expense",
    amount: 1200000,
    description: "شراء مواد وبضاعة للفرع",
  },
  {
    id: "4",
    date: "2026-10-03T09:00:00Z",
    branch: "Najaf",
    type: "expense",
    amount: 800000,
    description: "شراء مستلزمات وتغليف",
  },
  {
    id: "5",
    date: "2026-10-04T09:00:00Z",
    branch: "Baghdad",
    type: "withdrawal",
    amount: 300000,
    description: "سحب شخصي لوسام",
    partner: "Wesam",
  },
  {
    id: "6",
    date: "2026-10-05T09:00:00Z",
    branch: "Najaf",
    type: "withdrawal",
    amount: 200000,
    description: "سحب شخصي لحسين",
    partner: "Hussein",
  },
];
function calculate(transactions: Transaction[]) {
  const totals: Record<TransactionType, BranchTotals> = {
    capital: empty(),
    expense: empty(),
    withdrawal: empty(),
    revenue: empty(),
  };
  for (const t of transactions) {
    totals[t.type][t.branch] += t.amount;
    totals[t.type].total += t.amount;
  }
  const netBalances = empty();
  for (const b of ["Baghdad", "Najaf"] as const)
    netBalances[b] =
      totals.capital[b] +
      totals.revenue[b] -
      totals.expense[b] -
      totals.withdrawal[b];
  netBalances.total = netBalances.Baghdad + netBalances.Najaf;
  const difference = netBalances.Baghdad - netBalances.Najaf;
  const from: Branch | null =
    difference === 0 ? null : difference > 0 ? "Baghdad" : "Najaf";
  const to: Branch | null =
    from === null ? null : from === "Baghdad" ? "Najaf" : "Baghdad";
  return {
    totalCapital: totals.capital,
    totalExpenses: totals.expense,
    totalWithdrawals: totals.withdrawal,
    totalRevenues: totals.revenue,
    netBalances,
    reconciliationStatus: {
      status: difference === 0 ? "balanced" : "payment_required",
      from,
      to,
      gap: Math.abs(difference),
      amount: Math.abs(difference) / 2,
    },
  };
}
type ContextValue = ReturnType<typeof calculate> & {
  transactions: readonly Transaction[];
  addTransaction: (t: NewTransaction) => void;
  resetDemo: () => void;
};
export const PartnershipContext = createContext<ContextValue | undefined>(
  undefined,
);
export function PartnershipProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    initial.map((t) => ({ ...t })),
  );
  const addTransaction = useCallback((t: NewTransaction) => {
    if (
      !["Baghdad", "Najaf"].includes(t.branch) ||
      !["capital", "expense", "withdrawal", "revenue"].includes(t.type)
    )
      throw Error("اختر الفرع ونوع الحركة.");
    if (!Number.isSafeInteger(t.amount) || t.amount <= 0)
      throw Error("أدخل مبلغاً صحيحاً موجباً بالدينار العراقي.");
    if (!t.description.trim()) throw Error("أدخل وصف الحركة.");
    if (
      t.type === "withdrawal" &&
      !["Wesam", "Hussein"].includes(t.partner ?? "")
    )
      throw Error("اختر الشريك صاحب السحب.");
    const next: Transaction = {
      ...t,
      description: t.description.trim(),
      partner: t.type === "withdrawal" ? t.partner : undefined,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
    };
    setTransactions((prev) => [...prev, next]);
  }, []);
  const resetDemo = useCallback(
    () => setTransactions(initial.map((t) => ({ ...t }))),
    [],
  );
  const calculations = useMemo(() => calculate(transactions), [transactions]);
  const value = useMemo(
    () => ({ ...calculations, transactions, addTransaction, resetDemo }),
    [calculations, transactions, addTransaction, resetDemo],
  );
  return (
    <PartnershipContext.Provider value={value}>
      {children}
    </PartnershipContext.Provider>
  );
}
export function usePartnership() {
  const value = useContext(PartnershipContext);
  if (!value) throw Error("PartnershipProvider is required");
  return value;
}
