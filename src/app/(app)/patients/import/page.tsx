"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Download,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import Papa from "papaparse";

interface ImportResult {
  imported: number;
  errors: { row: number; error: string }[];
}

export default function PatientImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setResult(null);

    Papa.parse(f, {
      header: false,
      preview: 6,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as string[][];
        if (data.length > 0) {
          setHeaders(data[0]);
          setPreview(data.slice(1, 6));
        }
      },
    });
  }

  async function handleImport() {
    if (!file) return;
    setImporting(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/patients/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        setResult({ imported: 0, errors: [{ row: 0, error: data.error || "Erro desconhecido" }] });
      }
    } catch {
      setResult({ imported: 0, errors: [{ row: 0, error: "Erro de conexão" }] });
    }

    setImporting(false);
  }

  function downloadTemplate() {
    const csv = "Nome,CPF,RG,Data Nascimento,Sexo,Telefone,Email,Endereco,Profissao,Convenio,Notas\nJoao Silva,123.456.789-00,,01/01/1980,M,(11) 99999-0000,joao@email.com,Rua A 123,Engenheiro,Unimed,Paciente exemplo";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "modelo-importacao-pacientes.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/patients">
            <Button variant="ghost" size="sm" className="text-gray-400">
              <ArrowLeft className="h-4 w-4 mr-1" /> Pacientes
            </Button>
          </Link>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Upload className="h-5 w-5 text-teal-400" />
            Importar Pacientes
          </h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={downloadTemplate}
          className="border-[#1e1e2e] text-gray-400"
        >
          <Download className="h-4 w-4 mr-1" />
          Baixar Modelo CSV
        </Button>
      </div>

      {/* Instructions */}
      <Card className="bg-[#111118] border-[#1e1e2e]">
        <CardHeader className="py-3">
          <CardTitle className="text-sm text-gray-300">Instruções</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 text-sm text-gray-400 space-y-2">
          <p>Prepare um arquivo CSV com as colunas: <strong className="text-gray-300">Nome</strong> (obrigatorio), CPF, RG, Data Nascimento (DD/MM/AAAA), Sexo (M/F), Telefone, Email, Endereco, Profissao, Convenio, Notas.</p>
          <p>O sistema reconhece automaticamente nomes de coluna em portugues e ingles. CPFs duplicados serao ignorados.</p>
          <p>Dados sensiveis serao criptografados automaticamente com AES-256-GCM.</p>
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card className="bg-[#111118] border-[#1e1e2e]">
        <CardContent className="py-8">
          <div
            className="border-2 border-dashed border-[#1e1e2e] rounded-xl p-8 text-center cursor-pointer hover:border-teal-500/30 transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />
            {file ? (
              <div className="space-y-2">
                <FileSpreadsheet className="h-10 w-10 text-teal-400 mx-auto" />
                <p className="text-gray-200 font-medium">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024).toFixed(1)} KB — Clique para trocar
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-10 w-10 text-gray-600 mx-auto" />
                <p className="text-gray-400">Clique para selecionar um arquivo CSV</p>
                <p className="text-xs text-gray-600">ou arraste e solte aqui</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pré-visualização */}
      {preview.length > 0 && (
        <Card className="bg-[#111118] border-[#1e1e2e]">
          <CardHeader className="py-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-indigo-400" />
              Pré-visualização (primeiras {preview.length} linhas)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  {headers.map((h, i) => (
                    <th key={i} className="text-left text-gray-400 font-semibold px-2 py-1 border-b border-[#1e1e2e]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <td key={ci} className="text-gray-300 px-2 py-1 border-b border-[#1e1e2e] max-w-32 truncate">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Import Button */}
      {file && !result && (
        <div className="flex justify-end">
          <Button
            onClick={handleImport}
            disabled={importing}
            className="bg-teal-600 hover:bg-teal-700"
          >
            {importing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Importando...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Importar Pacientes
              </>
            )}
          </Button>
        </div>
      )}

      {/* Results */}
      {result && (
        <Card className="bg-[#111118] border-[#1e1e2e]">
          <CardHeader className="py-3">
            <CardTitle className="text-sm">Resultado da Importação</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            {result.imported > 0 && (
              <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-sm text-green-300">
                  {result.imported} paciente(s) importado(s) com sucesso
                </span>
              </div>
            )}

            {result.errors.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-amber-400">
                  <AlertCircle className="h-4 w-4" />
                  {result.errors.length} erro(s)
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {result.errors.map((e, i) => (
                    <div key={i} className="text-xs text-gray-400 flex items-center gap-2 py-1">
                      <Badge variant="outline" className="text-xs border-red-500/30 text-red-400 shrink-0">
                        Linha {e.row}
                      </Badge>
                      <span>{e.error}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Link href="/patients">
                <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                  Ver Pacientes
                </Button>
              </Link>
              <Button
                size="sm"
                variant="outline"
                className="border-[#1e1e2e] text-gray-400"
                onClick={() => { setFile(null); setPreview([]); setHeaders([]); setResult(null); }}
              >
                Importar Outro
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
