"use client";

import { getAxios } from "@/configs/axios";

const api = getAxios();

export type Lawyer = {
  id: number | string;
  name: string;
  email?: string | null;
  oabNumber?: string | null;
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

function normalizeLawyer(raw: unknown): Lawyer {
  const obj = asRecord(raw);
  const id = obj.id;

  return {
    id: typeof id === "number" || typeof id === "string" ? id : "",
    name: asOptionalString(obj.name) ?? "",
    email: asOptionalString(obj.email),
    oabNumber: asOptionalString(obj.oab_number ?? obj.oabNumber),
  };
}

export async function listLawyers(params?: { search?: string }) {
  const res = await api.get("/lawyers", { params });
  const data = res.data?.data ?? res.data;
  const items = Array.isArray(data) ? data : [];

  return items.map(normalizeLawyer);
}
