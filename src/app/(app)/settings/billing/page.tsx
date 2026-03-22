"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CreditCard, TrendingUp, Users, FileText, Calendar } from "lucide-react";

interface BillingStatus {
  subscriptionStatus: string;
  currentPeriodEnd: string | null;
  trialEndsAt: string | null;
  hasStripeCustomer: boolean;
  hasSubscription: boolean;
  plan: {
    key: string;
    name: string;
  };
  usage: {
    patients: number;
    consultationsThisMonth: number;
  };
  limits: {
    maxPatients: number;
    maxUsers: number;
    maxConsultationsPerMonth: number;
  };
}

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" ; className: string }> = {
  trialing: { label: "Período de Teste", variant: "outline", className: "border-yellow-500 text-yellow-400 bg-yellow-500/10" },
  active: { label: "Ativa", variant: "outline", className: "border-green-500 text-green-400 bg-green-500/10" },
  past_due: { label: "Pagamento Pendente", variant: "destructive", className: "bg-red-500/10 text-red-400 border-red-500" },
  canceled: { label: "Cancelada", variant: "secondary", className: "bg-gray-500/10 text-gray-400 border-gray-500" },
  incomplete: { label: "Incompleta", variant: "outline", className: "border-orange-500 text-orange-400 bg-orange-500/10" },
};

function formatLimit(value: number): string {
  return value === -1 ? "Ilimitado" : value.toString();
}

function UsageMeter({ label, current, max, icon: Icon }: { label: string; current: number; max: number; icon: React.ElementType }) {
  const isUnlimited = max === -1;
  const percentage = isUnlimited ? 0 : Math.min((current / max) * 100, 100);
  const isWarning = !isUnlimited && percentage >= 80;
  const isExceeded = !isUnlimited && percentage >= 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Icon className="h-4 w-4" />
          <span>{label}</span>
        </div>
        <span className="text-sm font-medium text-gray-200">
          {current} / {formatLimit(max)}
        </span>
      </div>
      {!isUnlimited && (
        <div className="h-2 w-full rounded-full bg-[#1e1e2e]">
          <div
            className={`h-2 rounded-full transition-all ${
              isExceeded
                ? "bg-red-500"
                : isWarning
                  ? "bg-yellow-500"
                  : "bg-teal-500"
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default function BillingPage() {
  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    fetchBillingStatus();
  }, []);

  async function fetchBillingStatus() {
    try {
      const res = await fetch("/api/billing/status");
      if (!res.ok) throw new Error("Erro ao carregar dados de cobrança");
      const data = await res.json();
      setBilling(data);
    } catch {
      toast.error("Erro ao carregar dados de cobrança");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpgrade() {
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: "professional",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao iniciar checkout");
      }

      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao iniciar checkout"
      );
    } finally {
      setCheckoutLoading(false);
    }
  }

  async function handleManageSubscription() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/billing/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao abrir portal");
      }

      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao abrir portal"
      );
    } finally {
      setPortalLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
      </div>
    );
  }

  if (!billing) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-gray-400">
        Erro ao carregar dados de cobrança.
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[billing.subscriptionStatus] ?? {
    label: billing.subscriptionStatus,
    variant: "secondary" as const,
    className: "bg-gray-500/10 text-gray-400 border-gray-500",
  };

  const isFree = billing.plan.key === "free";

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <CreditCard className="h-6 w-6 text-teal-500" />
        <h1 className="text-2xl font-bold text-gray-100">Cobrança e Assinatura</h1>
      </div>

      {/* Current Plan */}
      <Card className="border-[#1e1e2e] bg-[#111118]">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-gray-100">
            <span>Plano Atual</span>
            <Badge variant={statusConfig.variant} className={statusConfig.className}>
              {statusConfig.label}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-teal-500" />
            <span className="text-lg font-semibold text-gray-100">
              {billing.plan.name}
            </span>
          </div>

          {billing.currentPeriodEnd && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Calendar className="h-4 w-4" />
              <span>
                Período atual até:{" "}
                {new Date(billing.currentPeriodEnd).toLocaleDateString("pt-BR")}
              </span>
            </div>
          )}

          {billing.trialEndsAt && billing.subscriptionStatus === "trialing" && (
            <div className="flex items-center gap-2 text-sm text-yellow-400">
              <Calendar className="h-4 w-4" />
              <span>
                Teste expira em:{" "}
                {new Date(billing.trialEndsAt).toLocaleDateString("pt-BR")}
              </span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            {isFree && (
              <Button
                onClick={handleUpgrade}
                disabled={checkoutLoading}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                {checkoutLoading ? "Redirecionando..." : "Upgrade para Profissional"}
              </Button>
            )}

            {billing.hasSubscription && (
              <Button
                onClick={handleManageSubscription}
                disabled={portalLoading}
                variant="outline"
                className="border-[#1e1e2e] text-gray-300 hover:bg-[#1e1e2e] hover:text-gray-100"
              >
                {portalLoading ? "Redirecionando..." : "Gerenciar Assinatura"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Usage */}
      <Card className="border-[#1e1e2e] bg-[#111118]">
        <CardHeader>
          <CardTitle className="text-gray-100">Uso Atual</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <UsageMeter
            label="Pacientes"
            current={billing.usage.patients}
            max={billing.limits.maxPatients}
            icon={Users}
          />
          <UsageMeter
            label="Consultas este mês"
            current={billing.usage.consultationsThisMonth}
            max={billing.limits.maxConsultationsPerMonth}
            icon={FileText}
          />
        </CardContent>
      </Card>

      {/* Plan comparison */}
      <Card className="border-[#1e1e2e] bg-[#111118]">
        <CardHeader>
          <CardTitle className="text-gray-100">Limites do Plano</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-gray-400">Recurso</div>
            <div className="text-gray-400 text-center">Limite</div>
            <div className="text-gray-400 text-center">Usado</div>

            <div className="text-gray-200">Pacientes</div>
            <div className="text-center text-gray-300">
              {formatLimit(billing.limits.maxPatients)}
            </div>
            <div className="text-center text-gray-300">
              {billing.usage.patients}
            </div>

            <div className="text-gray-200">Consultas/mês</div>
            <div className="text-center text-gray-300">
              {formatLimit(billing.limits.maxConsultationsPerMonth)}
            </div>
            <div className="text-center text-gray-300">
              {billing.usage.consultationsThisMonth}
            </div>

            <div className="text-gray-200">Usuários</div>
            <div className="text-center text-gray-300">
              {formatLimit(billing.limits.maxUsers)}
            </div>
            <div className="text-center text-gray-300">-</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
