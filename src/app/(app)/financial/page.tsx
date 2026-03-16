"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminGuard } from "@/components/admin-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Wallet,
} from "lucide-react";

interface Patient {
  id: string;
  name: string;
}

interface Transaction {
  id: string;
  date: string;
  type: string;
  description: string;
  patientId: string | null;
  patient: { id: string; name: string } | null;
  amount: number;
  category: string | null;
}

interface Summary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactionCount: number;
}

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function formatBRL(amount: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
}

function formatDateBR(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("pt-BR");
}

export default function FinancialPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<Summary>({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    transactionCount: 0,
  });
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formType, setFormType] = useState("income");
  const [formDescription, setFormDescription] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formPatientId, setFormPatientId] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [txRes, sumRes] = await Promise.all([
      fetch(`/api/financial?month=${month}&year=${year}`),
      fetch(`/api/financial/summary?month=${month}&year=${year}`),
    ]);
    if (txRes.ok) setTransactions(await txRes.json());
    if (sumRes.ok) setSummary(await sumRes.json());
    setLoading(false);
  }, [month, year]);

  const fetchPatients = useCallback(async () => {
    const res = await fetch("/api/patients");
    if (res.ok) setPatients(await res.json());
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  function navigateMonth(offset: number) {
    let m = month + offset;
    let y = year;
    if (m > 12) { m = 1; y++; }
    if (m < 1) { m = 12; y--; }
    setMonth(m);
    setYear(y);
  }

  function openNewDialog() {
    setFormType("income");
    setFormDescription("");
    setFormAmount("");
    setFormDate(
      `${year}-${String(month).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
    );
    setFormCategory("");
    setFormPatientId("");
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!formDescription || !formAmount || !formDate) return;
    setSaving(true);
    try {
      await fetch("/api/financial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: formType,
          description: formDescription,
          amount: Number(formAmount),
          date: formDate,
          category: formCategory || undefined,
          patientId: formPatientId || undefined,
        }),
      });
      setDialogOpen(false);
      fetchData();
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminGuard>
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Wallet className="h-6 w-6 text-teal-400" />
          Financeiro
        </h1>
        <Button
          onClick={openNewDialog}
          className="bg-teal-600 hover:bg-teal-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Transação
        </Button>
      </div>

      {/* Month Navigator */}
      <Card className="bg-[#111118] border-[#1e1e2e]">
        <CardContent className="flex items-center justify-between py-4">
          <Button
            variant="ghost"
            onClick={() => navigateMonth(-1)}
            className="text-gray-400 hover:text-white"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Anterior
          </Button>
          <p className="text-lg font-semibold text-gray-200">
            {MONTHS[month - 1]} {year}
          </p>
          <Button
            variant="ghost"
            onClick={() => navigateMonth(1)}
            className="text-gray-400 hover:text-white"
          >
            Próximo
            <ChevronRight className="h-5 w-5 ml-1" />
          </Button>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#111118] border-[#1e1e2e]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Receitas
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-green-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-400">
              {formatBRL(summary.totalIncome)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#111118] border-[#1e1e2e]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Despesas
            </CardTitle>
            <TrendingDown className="h-5 w-5 text-red-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-400">
              {formatBRL(summary.totalExpenses)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#111118] border-[#1e1e2e]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Saldo
            </CardTitle>
            <DollarSign
              className={`h-5 w-5 ${
                summary.balance >= 0 ? "text-teal-400" : "text-red-400"
              }`}
            />
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-bold ${
                summary.balance >= 0 ? "text-teal-400" : "text-red-400"
              }`}
            >
              {formatBRL(summary.balance)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card className="bg-[#111118] border-[#1e1e2e]">
        <CardHeader>
          <CardTitle className="text-gray-200">Transações</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-[#1e1e2e]">
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-gray-500 py-8"
                  >
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-gray-500 py-8"
                  >
                    Nenhuma transação neste período
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((tx) => (
                  <TableRow key={tx.id} className="border-[#1e1e2e]">
                    <TableCell className="text-gray-400">
                      {formatDateBR(tx.date)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          tx.type === "income"
                            ? "bg-green-500/20 text-green-400 border-green-500/30"
                            : "bg-red-500/20 text-red-400 border-red-500/30"
                        }
                      >
                        {tx.type === "income" ? "Receita" : "Despesa"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-200">
                      {tx.description}
                    </TableCell>
                    <TableCell className="text-gray-400">
                      {tx.patient?.name || "—"}
                    </TableCell>
                    <TableCell className="text-gray-400">
                      {tx.category || "—"}
                    </TableCell>
                    <TableCell
                      className={`text-right font-medium ${
                        tx.type === "income"
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {formatBRL(tx.amount)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* New Transaction Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#111118] border-[#1e1e2e] text-gray-200 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Transação</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-400">Tipo</Label>
              <Select value={formType} onValueChange={(v) => setFormType(v ?? "")}>
                <SelectTrigger className="bg-[#0a0a0f] border-[#1e1e2e]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#111118] border-[#1e1e2e]">
                  <SelectItem value="income">Receita</SelectItem>
                  <SelectItem value="expense">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-gray-400">Descrição</Label>
              <Input
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Descrição da transação"
                className="bg-[#0a0a0f] border-[#1e1e2e]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-400">Valor (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  placeholder="0,00"
                  className="bg-[#0a0a0f] border-[#1e1e2e]"
                />
              </div>
              <div>
                <Label className="text-gray-400">Data</Label>
                <Input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="bg-[#0a0a0f] border-[#1e1e2e]"
                />
              </div>
            </div>

            <div>
              <Label className="text-gray-400">Categoria</Label>
              <Select value={formCategory} onValueChange={(v) => setFormCategory(v ?? "")}>
                <SelectTrigger className="bg-[#0a0a0f] border-[#1e1e2e]">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent className="bg-[#111118] border-[#1e1e2e]">
                  <SelectItem value="Consulta">Consulta</SelectItem>
                  <SelectItem value="Medicamento">Medicamento</SelectItem>
                  <SelectItem value="Aluguel">Aluguel</SelectItem>
                  <SelectItem value="Material">Material</SelectItem>
                  <SelectItem value="Outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-gray-400">Paciente (opcional)</Label>
              <Select value={formPatientId} onValueChange={(v) => setFormPatientId(v ?? "")}>
                <SelectTrigger className="bg-[#0a0a0f] border-[#1e1e2e]">
                  <SelectValue placeholder="Selecione um paciente" />
                </SelectTrigger>
                <SelectContent className="bg-[#111118] border-[#1e1e2e]">
                  <SelectItem value="none">Nenhum</SelectItem>
                  {patients.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button
                variant="ghost"
                onClick={() => setDialogOpen(false)}
                className="text-gray-400"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || !formDescription || !formAmount || !formDate}
                className="bg-teal-600 hover:bg-teal-700"
              >
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </AdminGuard>
  );
}
