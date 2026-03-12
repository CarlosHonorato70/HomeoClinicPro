"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Users, Shield } from "lucide-react";
import { formatCPF, calculateAge } from "@/lib/utils";

interface Patient {
  id: string;
  name: string;
  cpf: string | null;
  birthDate: string | null;
  sex: string | null;
  phone: string | null;
  email: string | null;
  insurance: string | null;
  lgpdConsent: boolean;
  _count: { consultations: number };
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/patients?search=${encodeURIComponent(search)}`);
    if (res.ok) {
      setPatients(await res.json());
    }
    setLoading(false);
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(fetchPatients, 300);
    return () => clearTimeout(timer);
  }, [fetchPatients]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6 text-teal-400" />
          Pacientes
        </h1>
        <Link href="/patients/new">
          <Button className="bg-teal-600 hover:bg-teal-700">
            <Plus className="h-4 w-4 mr-2" />
            Novo Paciente
          </Button>
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar paciente por nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-[#111118] border-[#1e1e2e]"
        />
      </div>

      <Card className="bg-[#111118] border-[#1e1e2e]">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-[#1e1e2e]">
                <TableHead>Paciente</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Idade</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Convênio</TableHead>
                <TableHead>Consultas</TableHead>
                <TableHead>LGPD</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : patients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                    Nenhum paciente encontrado
                  </TableCell>
                </TableRow>
              ) : (
                patients.map((patient) => (
                  <TableRow key={patient.id} className="border-[#1e1e2e]">
                    <TableCell>
                      <Link
                        href={`/patients/${patient.id}`}
                        className="text-teal-400 hover:underline font-medium"
                      >
                        {patient.name}
                      </Link>
                      {patient.email && (
                        <p className="text-xs text-gray-500">{patient.email}</p>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-400">
                      {patient.cpf ? formatCPF(patient.cpf) : "—"}
                    </TableCell>
                    <TableCell className="text-gray-400">
                      {patient.birthDate ? calculateAge(patient.birthDate) : "—"}
                    </TableCell>
                    <TableCell className="text-gray-400">
                      {patient.phone || "—"}
                    </TableCell>
                    <TableCell className="text-gray-400">
                      {patient.insurance || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {patient._count.consultations}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {patient.lgpdConsent ? (
                        <Shield className="h-4 w-4 text-teal-400" />
                      ) : (
                        <Shield className="h-4 w-4 text-gray-600" />
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
