"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Users, UserPlus, Mail, Clock, Loader2, X } from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
}

interface Invite {
  id: string;
  email: string;
  role: string;
  expiresAt: string;
  createdAt: string;
}

export default function TeamPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("doctor");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (session?.user?.role !== "admin") {
      router.push("/dashboard");
      return;
    }
    fetchData();
  }, [session, router]);

  async function fetchData() {
    try {
      const [membersRes, invitesRes] = await Promise.all([
        fetch("/api/settings/team/members"),
        fetch("/api/invites"),
      ]);

      if (membersRes.ok) {
        const membersData = await membersRes.json();
        setMembers(membersData);
      }

      if (invitesRes.ok) {
        const invitesData = await invitesRes.json();
        setInvites(invitesData);
      }
    } catch {
      toast.error("Erro ao carregar dados da equipe");
    } finally {
      setLoading(false);
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao enviar convite");
      }

      toast.success(`Convite enviado para ${inviteEmail}`);
      setInviteEmail("");
      setInviteRole("doctor");
      setDialogOpen(false);
      fetchData();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erro ao enviar convite";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancelInvite(inviteId: string) {
    try {
      const res = await fetch(`/api/invites/${inviteId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Erro ao cancelar convite");
      }

      toast.success("Convite cancelado");
      fetchData();
    } catch {
      toast.error("Erro ao cancelar convite");
    }
  }

  const roleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrador";
      case "doctor":
        return "Médico";
      default:
        return role;
    }
  };

  const roleBadgeClass = (role: string) => {
    return role === "admin"
      ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
      : "bg-teal-500/10 text-teal-400 border-teal-500/20";
  };

  if (session?.user?.role !== "admin") {
    return null;
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Equipe</h1>
        <p className="text-gray-400">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Equipe</h1>
          <p className="text-gray-400 mt-1">
            Gerencie os membros e convites da sua cl&iacute;nica
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger>
            <Button className="bg-teal-600 hover:bg-teal-700 text-white">
              <UserPlus className="h-4 w-4 mr-2" />
              Convidar Membro
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#111118] border-[#1e1e2e] text-gray-200">
            <DialogHeader>
              <DialogTitle className="text-gray-200">
                Convidar Novo Membro
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleInvite} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label className="text-gray-300">Email</Label>
                <Input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  required
                  className="bg-[#0a0a0f] border-white/10 text-gray-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Perfil</Label>
                <Select value={inviteRole} onValueChange={(v) => setInviteRole(v ?? "doctor")}>
                  <SelectTrigger className="bg-[#0a0a0f] border-white/10 text-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111118] border-[#1e1e2e]">
                    <SelectItem value="doctor">M&eacute;dico</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  className="border-white/10 text-gray-300 hover:bg-white/5"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Enviando...
                    </span>
                  ) : (
                    "Enviar Convite"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Team Members */}
      <Card className="bg-[#111118] border-white/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-teal-400" />
            <CardTitle className="text-gray-200">Membros da Equipe</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <p className="text-gray-500 text-sm">
              Nenhum membro encontrado.
            </p>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#0a0a0f] border border-[#1e1e2e]"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-teal-500/10 flex items-center justify-center">
                      <span className="text-teal-400 font-medium text-sm">
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-200 font-medium">{member.name}</p>
                      <p className="text-gray-500 text-sm">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={roleBadgeClass(member.role)}
                    >
                      {roleLabel(member.role)}
                    </Badge>
                    {!member.active && (
                      <Badge
                        variant="outline"
                        className="bg-red-500/10 text-red-400 border-red-500/20"
                      >
                        Inativo
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Invites */}
      <Card className="bg-[#111118] border-white/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-teal-400" />
            <CardTitle className="text-gray-200">Convites Pendentes</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {invites.length === 0 ? (
            <p className="text-gray-500 text-sm">
              Nenhum convite pendente.
            </p>
          ) : (
            <div className="space-y-3">
              {invites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#0a0a0f] border border-[#1e1e2e]"
                >
                  <div>
                    <p className="text-gray-200">{invite.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="outline"
                        className={roleBadgeClass(invite.role)}
                      >
                        {roleLabel(invite.role)}
                      </Badge>
                      <span className="text-gray-500 text-xs flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Expira em{" "}
                        {new Date(invite.expiresAt).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCancelInvite(invite.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
