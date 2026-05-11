"use client";

import React, { useState } from "react";
import { getPublicApiOrigin } from "@/configs/apiUrl";

type CsvResult = {
  row: number;
  email: string;
  status: "created" | "skipped" | "error";
  message?: string;
};

export default function RegisterView() {
  const [role, setRole] = useState<string>("cliente");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [csvResults, setCsvResults] = useState<CsvResult[] | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setCsvResults(null);

    try {
      setLoading(true);

      const base = getPublicApiOrigin();

      if (csvFile) {
        const fd = new FormData();
        fd.append("csv", csvFile);
        // optional default role if CSV rows don't have it
        fd.append("default_role", role);

        const res = await fetch(`${base}/api/register/csv`, {
          method: "POST",
          body: fd,
          credentials: "include",
        });

        const data = await res.json();
        if (!res.ok) {
          setMessage(data.message || "Erro ao enviar CSV");
        } else {
          setMessage(data.message || "CSV processado");
          setCsvResults(data.results || null);
        }
      } else {
        const res = await fetch(`${base}/api/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            password,
            phone,
            role,
          }),
          credentials: "include",
        });

        const data = await res.json();
        if (!res.ok) {
          setMessage(data.message || "Erro ao cadastrar");
        } else {
          setMessage(data.message || "Cadastro realizado com sucesso");
        }
      }
    } catch (err) {
      setMessage("Erro de conexão");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">
        Cadastro — Advogados / Funcionários
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Tipo</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mt-1 rounded-md"
          >
            <option value="advogado">Advogado</option>
            <option value="funcionario">Funcionário</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Nome</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">
            Senha (apenas para cadastro único)
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Telefone</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 w-full rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">
            Anexo CSV (opcional) — colunas: name,email,role,password,phone
          </label>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => setCsvFile(e.target.files?.[0] ?? null)}
            className="mt-1"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {csvFile ? "Enviar CSV" : "Cadastrar"}
          </button>
          <span className="text-sm text-gray-600">
            {loading ? "Enviando..." : null}
          </span>
        </div>
      </form>

      {message ? <p className="mt-4 text-sm">{message}</p> : null}

      {csvResults && (
        <div className="mt-6">
          <h2 className="font-semibold">Resultados do CSV</h2>
          <table className="w-full mt-2 border-collapse">
            <thead>
              <tr>
                <th className="text-left">Linha</th>
                <th className="text-left">Email</th>
                <th className="text-left">Status</th>
                <th className="text-left">Mensagem</th>
              </tr>
            </thead>
            <tbody>
              {csvResults.map((r) => (
                <tr key={r.row}>
                  <td>{r.row}</td>
                  <td>{r.email}</td>
                  <td>{r.status}</td>
                  <td>{r.message ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
