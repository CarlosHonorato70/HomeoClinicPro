import { FileQuestion } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-teal-500/10 p-4">
            <FileQuestion className="h-12 w-12 text-teal-400" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-white">404</h1>
          <h2 className="text-xl font-semibold text-white">
            Página não encontrada
          </h2>
          <p className="text-sm text-gray-400">
            A página que você está procurando não existe ou foi movida.
          </p>
        </div>

        <div>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-teal-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-teal-700 transition-colors"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}
