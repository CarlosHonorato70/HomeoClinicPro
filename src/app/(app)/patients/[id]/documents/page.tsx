"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Plus, FileText, Eye, Trash2, PenLine, CheckCircle2, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface DocumentItem {
  id: string;
  type: string;
  title: string;
  createdAt: string;
}

const typeConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className: string }> = {
  tcle: { label: "TCLE", variant: "default", className: "bg-blue-600 hover:bg-blue-700" },
  prescription: { label: "Receituário", variant: "default", className: "bg-teal-600 hover:bg-teal-700" },
  certificate: { label: "Atestado", variant: "default", className: "bg-yellow-600 hover:bg-yellow-700" },
  report: { label: "Relatório", variant: "default", className: "bg-purple-600 hover:bg-purple-700" },
};

export default function DocumentsListPage() {
  const { id: patientId } = useParams<{ id: string }>();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [patientName, setPatientName] = useState("");
  const [signing, setSigning] = useState<string | null>(null);
  const [signedDocs, setSignedDocs] = useState<Set<string>>(new Set());

  const fetchDocuments = useCallback(async () => {
    const res = await fetch(`/api/documents?patientId=${patientId}`);
    if (res.ok) {
      const data = await res.json();
      setDocuments(data);
    }
    setLoading(false);
  }, [patientId]);

  useEffect(() => {
    fetchDocuments();
    fetch(`/api/patients/${patientId}`)
      .then((r) => r.json())
      .then((d) => setPatientName(d.name || ""));
  }, [fetchDocuments, patientId]);

  async function handleSign(docId: string) {
    setSigning(docId);
    try {
      const res = await fetch("/api/documents/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: docId }),
      });
      if (res.ok) {
        toast.success("Documento assinado digitalmente!");
        setSignedDocs((prev) => new Set([...prev, docId]));
      } else {
        const err = await res.json();
        toast.error(err.error || "Erro ao assinar");
      }
    } catch {
      toast.error("Erro ao assinar documento");
    } finally {
      setSigning(null);
    }
  }

  async function handleDelete(docId: string) {
    const res = await fetch(`/api/documents/${docId}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Documento excluído com sucesso!");
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    } else {
      toast.error("Erro ao excluír documento");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/patients/${patientId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-teal-400" />
            Documentos
          </h1>
          {patientName && (
            <span className="text-gray-400">— {patientName}</span>
          )}
        </div>
        <Link href={`/patients/${patientId}/documents/new`}>
          <Button className="bg-teal-600 hover:bg-teal-700">
            <Plus className="h-4 w-4 mr-2" />
            Novo Documento
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="text-gray-500">Carregando...</div>
      ) : documents.length === 0 ? (
        <Card className="bg-[#111118] border-[#1e1e2e]">
          <CardContent className="text-center py-12 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum documento registrado</p>
            <Link href={`/patients/${patientId}/documents/new`}>
              <Button variant="link" className="text-teal-400 mt-2">
                Criar primeiro documento
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-[#111118] border-[#1e1e2e]">
          <Table>
            <TableHeader>
              <TableRow className="border-[#1e1e2e]">
                <TableHead>Tipo</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => {
                const config = typeConfig[doc.type] || { label: doc.type, variant: "secondary" as const, className: "" };
                return (
                  <TableRow key={doc.id} className="border-[#1e1e2e]">
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Badge className={config.className}>{config.label}</Badge>
                        {signedDocs.has(doc.id) && (
                          <Badge className="bg-green-600/20 text-green-400 text-[10px]">
                            <CheckCircle2 className="h-3 w-3 mr-0.5" /> Assinado
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{doc.title}</TableCell>
                    <TableCell className="text-gray-400">
                      {formatDate(doc.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/patients/${patientId}/documents/${doc.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        {!signedDocs.has(doc.id) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-teal-400 hover:text-teal-300"
                            disabled={signing === doc.id}
                            onClick={() => handleSign(doc.id)}
                            title="Assinar digitalmente"
                          >
                            {signing === doc.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <PenLine className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger>
                            <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-[#111118] border-[#1e1e2e]">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir documento?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir o documento &quot;{doc.title}&quot;? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(doc.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
