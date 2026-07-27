
"use client";

import { useState, useMemo } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label as UILabel } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ArrowLeft, 
  Plus, 
  Wallet, 
  Trash2, 
  Pencil, 
  DollarSign,
  Calendar as CalendarIcon,
  Tag,
  Calculator as CalculatorIcon,
  Coins
} from "lucide-react";
import Link from "next/link";
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { cn } from "@/lib/utils";
import { Expense } from "@/lib/types";
import { DraggableCalculator } from "@/components/draggable-calculator";

const EXPENSE_CATEGORIES = [
  "Food & Drink",
  "Transport",
  "Utilities",
  "Rent",
  "Shopping",
  "Entertainment",
  "Health",
  "Travel",
  "Other"
];

const SUPPORTED_CURRENCIES = [
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
  { code: "GBP", symbol: "£" },
  { code: "JPY", symbol: "¥" },
  { code: "INR", symbol: "₹" },
  { code: "CAD", symbol: "C$" },
  { code: "AUD", symbol: "A$" },
];

export default function ExpensesPage() {
  const { expenses, addExpense, updateExpense, deleteExpense, isInitialized } = useTasks();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    category: EXPENSE_CATEGORIES[0],
    currency: SUPPORTED_CURRENCIES[0].code,
    date: format(new Date(), "yyyy-MM-dd")
  });

  const currentMonthExpenses = useMemo(() => {
    const start = startOfMonth(new Date());
    const end = endOfMonth(new Date());
    return expenses.filter(e => {
      const d = parseISO(e.date);
      return isWithinInterval(d, { start, end });
    });
  }, [expenses]);

  const currencyTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    currentMonthExpenses.forEach(e => {
      totals[e.currency] = (totals[e.currency] || 0) + e.amount;
    });
    return totals;
  }, [currentMonthExpenses]);

  const handleOpenDialog = (expense: Expense | null = null) => {
    if (expense) {
      setEditingExpense(expense);
      setFormData({
        amount: expense.amount.toString(),
        description: expense.description,
        category: expense.category,
        currency: expense.currency || SUPPORTED_CURRENCIES[0].code,
        date: expense.date
      });
    } else {
      setEditingExpense(null);
      setFormData({
        amount: "",
        description: "",
        category: EXPENSE_CATEGORIES[0],
        currency: SUPPORTED_CURRENCIES[0].code,
        date: format(new Date(), "yyyy-MM-dd")
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || !formData.description.trim()) return;

    if (editingExpense) {
      updateExpense(editingExpense.id, {
        amount,
        currency: formData.currency,
        description: formData.description,
        category: formData.category,
        date: formData.date
      });
    } else {
      addExpense({
        amount,
        currency: formData.currency,
        description: formData.description,
        category: formData.category,
        date: formData.date
      });
    }
    setIsDialogOpen(false);
  };

  const getCurrencySymbol = (code: string) => {
    return SUPPORTED_CURRENCIES.find(c => c.code === code)?.symbol || "$";
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground font-black text-[10px] uppercase tracking-widest">Loading Finances...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex flex-col items-center">
      {isCalculatorOpen && <DraggableCalculator onClose={() => setIsCalculatorOpen(false)} />}
      
      <header className="w-full max-w-5xl flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white shadow-sm">
              <ArrowLeft className="w-6 h-6" />
            </Button>
          </Link>
          <div className="bg-emerald-600 text-white p-2.5 rounded-xl shadow-lg shadow-emerald-200 shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-primary tracking-tight">Expense Tracker</h1>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Multi-Currency Management</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsCalculatorOpen(!isCalculatorOpen)}
            className={cn("h-12 rounded-xl px-4 gap-2 border-primary/20 hover:bg-primary/5 transition-all", isCalculatorOpen && "bg-primary/10 border-primary text-primary")}
          >
            <CalculatorIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Calc</span>
          </Button>
          <Button onClick={() => handleOpenDialog()} className="h-12 rounded-xl px-6 gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-200">
            <Plus className="w-5 h-5" />
            Log Expense
          </Button>
        </div>
      </header>

      <main className="w-full max-w-5xl space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="shadow-2xl shadow-emerald-100 border-white/50 bg-emerald-50/30 backdrop-blur-sm lg:col-span-2">
            <CardHeader className="pb-2">
              <CardDescription className="font-black text-[10px] uppercase tracking-[0.2em] text-emerald-700/60">Monthly Spending Totals</CardDescription>
              <div className="flex flex-wrap gap-6 mt-2">
                {Object.keys(currencyTotals).length > 0 ? (
                  Object.entries(currencyTotals).map(([code, total]) => (
                    <div key={code} className="flex flex-col">
                      <span className="text-[10px] font-black text-emerald-600/60 uppercase">{code}</span>
                      <span className="text-2xl font-black text-emerald-700">
                        {getCurrencySymbol(code)}{total.toFixed(2)}
                      </span>
                    </div>
                  ))
                ) : (
                  <CardTitle className="text-3xl font-black text-emerald-700 flex items-center gap-1">
                    <Coins className="w-6 h-6" />
                    0.00
                  </CardTitle>
                )}
              </div>
            </CardHeader>
          </Card>
          <Card className="shadow-xl shadow-primary/5 border-white/40 bg-white/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardDescription className="font-black text-[10px] uppercase tracking-[0.2em]">Transaction Count</CardDescription>
              <CardTitle className="text-3xl font-black text-primary">
                {currentMonthExpenses.length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card className="shadow-2xl shadow-primary/5 border-white/50 bg-white/80 backdrop-blur-xl rounded-[2rem] overflow-hidden">
          <CardHeader className="border-b bg-white/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-black text-primary">Transaction History</CardTitle>
                <CardDescription>Chronological record of your financial activity</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              {expenses.length === 0 ? (
                <div className="h-[400px] flex flex-col items-center justify-center text-center gap-6 p-8">
                  <div className="w-20 h-20 bg-muted rounded-[2rem] flex items-center justify-center text-muted-foreground/30">
                    <Wallet className="w-10 h-10" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-black text-primary">No Expenses Recorded</h3>
                    <p className="text-muted-foreground text-sm font-medium max-w-[280px]">Take control of your finances by logging your first transaction today.</p>
                  </div>
                  <Button onClick={() => handleOpenDialog()} variant="outline" className="rounded-xl border-dashed">
                    Add First Entry
                  </Button>
                </div>
              ) : (
                <div className="divide-y">
                  {expenses.map((expense) => (
                    <div 
                      key={expense.id} 
                      className="group flex items-center justify-between p-4 md:p-6 hover:bg-emerald-50/30 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-white p-3 rounded-2xl shadow-sm border group-hover:border-emerald-200 transition-colors">
                          <Tag className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-black text-primary text-sm md:text-base">{expense.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-black uppercase tracking-widest bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                              {expense.category}
                            </span>
                            <span className="text-[10px] font-bold text-muted-foreground/60 flex items-center gap-1">
                              <CalendarIcon className="w-3 h-3" />
                              {format(parseISO(expense.date), "MMM d, yyyy")}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="flex items-baseline gap-1">
                          <span className="font-black text-emerald-700 text-lg">
                            -{getCurrencySymbol(expense.currency)}{expense.amount.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9 rounded-xl hover:bg-white"
                            onClick={() => handleOpenDialog(expense)}
                          >
                            <Pencil className="w-4 h-4 text-primary" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9 rounded-xl hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => deleteExpense(expense.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl">
          <div className="p-8 space-y-8">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-primary tracking-tight">
                {editingExpense ? "Update Transaction" : "Record Spending"}
              </DialogTitle>
              <DialogDescription className="text-[10px] font-black uppercase tracking-widest">
                Multi-currency entry supported
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="space-y-2">
                <UILabel htmlFor="amount" className="text-[10px] font-black uppercase tracking-widest text-primary/60">Amount & Currency</UILabel>
                <div className="flex gap-2">
                  <div className="w-24 shrink-0">
                    <Select 
                      value={formData.currency} 
                      onValueChange={(val) => setFormData(prev => ({ ...prev, currency: val }))}
                    >
                      <SelectTrigger className="h-14 rounded-2xl bg-emerald-50/50 border-emerald-100 text-lg font-black text-emerald-700">
                        <SelectValue placeholder="USD" />
                      </SelectTrigger>
                      <SelectContent>
                        {SUPPORTED_CURRENCIES.map(curr => (
                          <SelectItem key={curr.code} value={curr.code} className="rounded-lg">
                            {curr.code} ({curr.symbol})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 font-bold text-xl">
                      {getCurrencySymbol(formData.currency)}
                    </span>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="0.00"
                      className="h-14 pl-10 text-2xl font-black text-emerald-700 bg-emerald-50/50 border-emerald-100 rounded-2xl focus:ring-emerald-200"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <UILabel htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-primary/60">Description</UILabel>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="What was this for?"
                  className="h-12 rounded-xl bg-muted/30 border-transparent focus:bg-white focus:border-primary/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <UILabel className="text-[10px] font-black uppercase tracking-widest text-primary/60">Category</UILabel>
                  <Select 
                    value={formData.category} 
                    onValueChange={(val) => setFormData(prev => ({ ...prev, category: val }))}
                  >
                    <SelectTrigger className="h-12 rounded-xl bg-muted/30 border-transparent">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat} className="rounded-lg">
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <UILabel htmlFor="date" className="text-[10px] font-black uppercase tracking-widest text-primary/60">Date</UILabel>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="h-12 rounded-xl bg-muted/30 border-transparent"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="flex gap-3">
              <Button variant="ghost" className="h-12 px-6 rounded-xl font-bold uppercase text-[10px] tracking-widest" onClick={() => setIsDialogOpen(false)}>
                Discard
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={!formData.amount || !formData.description.trim()}
                className="h-12 px-8 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-200 flex-1"
              >
                {editingExpense ? "Save Changes" : "Confirm Log"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
