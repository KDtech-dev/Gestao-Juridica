"use client";

import { getAxios } from "@/configs/axios";

const api = getAxios();

export type CompromissoStatus = "PENDENTE" | "CONCLUIDO" | "CANCELADO";
export type CompromissoTipo =
  | "COMPROMISSO"
  | "LEMBRETE"
  | "AUDIENCIA"
  | "PRAZO"
  | "REUNIAO";
export type CompromissoVisao = "publica" | "pessoal";

export type Compromisso = {
  id: number | string;
  titulo: string;
  descricao?: string | null;
  data: string;
  hora?: string | null;
  tipo: CompromissoTipo;
  status: CompromissoStatus;
  anexo?: string | null;
  criador: {
    id?: number | string | null;
    nome?: string | null;
  };
  can?: {
    update?: boolean;
    delete?: boolean;
  };
};

export type CompromissoPayload = {
  titulo: string;
  descricao?: string;
  data: string;
  hora?: string;
  tipo: CompromissoTipo;
  status?: CompromissoStatus;
};

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" ? (value as UnknownRecord) : {};
}

function asOptionalString(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return null;
}

function normalizeTipo(value: unknown): CompromissoTipo {
  const allowed: CompromissoTipo[] = [
    "COMPROMISSO",
    "LEMBRETE",
    "AUDIENCIA",
    "PRAZO",
    "REUNIAO",
  ];

  return allowed.includes(value as CompromissoTipo)
    ? (value as CompromissoTipo)
    : "COMPROMISSO";
}

function normalizeStatus(value: unknown): CompromissoStatus {
  const allowed: CompromissoStatus[] = ["PENDENTE", "CONCLUIDO", "CANCELADO"];

  return allowed.includes(value as CompromissoStatus)
    ? (value as CompromissoStatus)
    : "PENDENTE";
}

function normalizeCompromisso(raw: unknown): Compromisso {
  const obj = asRecord(raw);
  const criador = asRecord(obj.criador);
  const can = asRecord(obj.can);
  const id = obj.id;

  return {
    id: typeof id === "number" || typeof id === "string" ? id : "",
    titulo: asOptionalString(obj.titulo) ?? "",
    descricao: asOptionalString(obj.descricao),
    data: asOptionalString(obj.data) ?? new Date().toISOString().slice(0, 10),
    hora: asOptionalString(obj.hora),
    tipo: normalizeTipo(obj.tipo),
    status: normalizeStatus(obj.status),
    anexo: asOptionalString(obj.anexo),
    criador: {
      id:
        typeof criador.id === "number" || typeof criador.id === "string"
          ? criador.id
          : null,
      nome: asOptionalString(criador.nome),
    },
    can: {
      update: can.update !== false,
      delete: can.delete === true,
    },
  };
}

function normalizeList(raw: unknown): Compromisso[] {
  const obj = asRecord(raw);
  const items = Array.isArray(obj.data)
    ? obj.data
    : Array.isArray(raw)
      ? raw
      : [];

  return items.map(normalizeCompromisso);
}

export async function listCompromissos(visao: CompromissoVisao = "publica") {
  const res = await api.get("/compromissos", {
    params: visao === "pessoal" ? { visao: "pessoal" } : undefined,
  });

  return normalizeList(res.data);
}

export async function createCompromisso(payload: CompromissoPayload) {
  const res = await api.post("/compromissos", payload);

  return normalizeCompromisso(res.data?.data ?? res.data);
}

export async function updateCompromisso(
  id: number | string,
  payload: CompromissoPayload,
) {
  const res = await api.put(`/compromissos/${id}`, payload);

  return normalizeCompromisso(res.data?.data ?? res.data);
}

export async function deleteCompromisso(id: number | string) {
  const res = await api.delete(`/compromissos/${id}`);

  return res.data;
}
