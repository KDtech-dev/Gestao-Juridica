"use client";

import { getAxios } from "@/configs/axios";

// Reuse the shared axios instance (adds Bearer token + honors Next rewrites).
const api = getAxios();

export type UserType = "admin" | "advogado" | "funcionario";

export type User = {
  id: number | string;
  name: string;
  email: string;
  phone?: string | null;
  type: UserType;
  oabNumber?: string | null;
  areas?: string[] | null;
  position?: string | null;
  active: boolean;
  roles?: string[];
};

type UnknownRecord = Record<string, unknown>;

function toArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((v) => String(v));
  if (value == null) return [];
  // Laravel collections can serialize as object with numeric keys
  if (typeof value === "object")
    return Object.values(value as UnknownRecord).map(String);
  return [String(value)];
}

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" ? (value as UnknownRecord) : {};
}

function asOptionalString(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return null;
}

function normalizeUser(raw: unknown): User {
  const obj = asRecord(raw);

  const roles = toArray(obj.roles ?? obj.role_names ?? obj.role);
  const typeFromRoles = roles.includes("admin")
    ? "admin"
    : roles.includes("advogado")
      ? "advogado"
      : roles.includes("funcionario")
        ? "funcionario"
        : undefined;

  const rawAreas = obj.areas ?? obj.practice_areas;
  const areas = Array.isArray(rawAreas)
    ? rawAreas.map((x) => String(x))
    : typeof rawAreas === "string"
      ? rawAreas
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : null;

  const activeRaw = obj.active ?? obj.is_active ?? obj.status;
  const active =
    typeof activeRaw === "boolean"
      ? activeRaw
      : typeof activeRaw === "string"
        ? activeRaw.toLowerCase() === "ativo" ||
          activeRaw.toLowerCase() === "active"
        : true;

  const idRaw = obj.id;
  const id =
    typeof idRaw === "number" || typeof idRaw === "string" ? idRaw : "";

  const typeRaw = obj.type ?? obj.user_type ?? typeFromRoles;
  const type: UserType =
    typeRaw === "admin" ||
    typeRaw === "advogado" ||
    typeRaw === "funcionario"
      ? typeRaw
      : "funcionario";

  return {
    id,
    name: typeof obj.name === "string" ? obj.name : "",
    email: typeof obj.email === "string" ? obj.email : "",
    phone: asOptionalString(obj.phone ?? obj.telefone),
    type,
    oabNumber: asOptionalString(obj.oabNumber ?? obj.oab_number),
    areas,
    position: asOptionalString(obj.position ?? obj.cargo),
    active,
    roles,
  };
}

function normalizeListResponse(raw: unknown): {
  items: unknown[];
  total: number;
} {
  if (Array.isArray(raw)) return { items: raw, total: raw.length };
  const obj = asRecord(raw);
  const data = obj.data;
  const items = Array.isArray(data) ? data : [];
  const meta = asRecord(obj.meta);
  const totalRaw = meta.total;
  const total = typeof totalRaw === "number" ? totalRaw : items.length;
  return { items, total };
}

export async function listUsers(params?: {
  search?: string;
  type?: UserType | "all";
  page?: number;
  limit?: number;
  sortBy?: "name" | "email" | "phone" | "type" | "active";
  sortDir?: "asc" | "desc";
}) {
  const { sortBy, sortDir, ...rest } = params ?? {};
  const res = await api.get("/usuarios", {
    params: {
      ...rest,
      ...(sortBy ? { sort_by: sortBy } : {}),
      ...(sortDir ? { sort_dir: sortDir } : {}),
    },
  });
  const { items, total } = normalizeListResponse(res.data);
  return { items: items.map(normalizeUser), total };
}

export async function createUser(payload: {
  name: string;
  email: string;
  phone?: string;
  type: UserType;
  cpf?: string;
  password: string;
  oabNumber?: string;
  areas?: string[];
  position?: string;
  active?: boolean;
}) {
  const res = await api.post("/usuarios", {
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    cpf: payload.cpf,
    type: payload.type,
    role: payload.type,
    password: payload.password,
    oab_number: payload.oabNumber,
    oab: payload.oabNumber,
    areas: payload.areas,
    position: payload.position,
    cargo: payload.position,
    is_active: payload.active,
  });
  return normalizeUser(res.data?.data ?? res.data?.user ?? res.data);
}

export async function updateUser(
  id: number | string,
  payload: Partial<{
    name: string;
    email: string;
    phone?: string;
    type: UserType;
    cpf?: string;
    password?: string;
    oabNumber?: string;
    areas?: string[];
    position?: string;
    active?: boolean;
  }>,
) {
  const res = await api.put(`/usuarios/${id}`, {
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    cpf: payload.cpf,
    type: payload.type,
    role: payload.type,
    password: payload.password,
    oab_number: payload.oabNumber,
    oab: payload.oabNumber,
    areas: payload.areas,
    position: payload.position,
    cargo: payload.position,
    is_active: payload.active,
  });
  return normalizeUser(res.data?.data ?? res.data?.user ?? res.data);
}

export async function deleteUser(id: number | string) {
  const res = await api.delete(`/usuarios/${id}`);
  return res.data;
}

export default {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
};
