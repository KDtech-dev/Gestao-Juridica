"use client";

import { getAxios } from "@/configs/axios";

const api = getAxios();

export type LegalCase = {
  id: number | string;
  clientId: number | string;
  clientName: string;
  clientSlug: string;
  assignedLawyerId?: number | string | null;
  lawyerName?: string | null;
  title: string;
  caseSlug: string;
  processNumber?: string | null;
  practiceArea?: string | null;
  nextHearing?: string | null;
  description?: string | null;
  status: string;
};

export type CasePayload = {
  title: string;
  processNumber?: string;
  clientId: number | string;
  practiceArea?: string;
  assignedLawyerId?: number | string;
  nextHearing?: string;
  description?: string;
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

function normalizeCase(raw: unknown): LegalCase {
  const obj = asRecord(raw);
  const id = obj.id;
  const clientId = obj.client_id;
  const lawyerId = obj.assigned_lawyer_id;

  return {
    id: typeof id === "number" || typeof id === "string" ? id : "",
    clientId:
      typeof clientId === "number" || typeof clientId === "string"
        ? clientId
        : "",
    clientName: asOptionalString(obj.client_name) ?? "Cliente não informado",
    clientSlug: asOptionalString(obj.client_slug) ?? "",
    assignedLawyerId:
      typeof lawyerId === "number" || typeof lawyerId === "string"
        ? lawyerId
        : null,
    lawyerName: asOptionalString(obj.lawyer_name),
    title: asOptionalString(obj.title ?? obj.case_title) ?? "",
    caseSlug: asOptionalString(obj.case_slug) ?? "",
    processNumber: asOptionalString(obj.process_number),
    practiceArea: asOptionalString(obj.practice_area),
    nextHearing: asOptionalString(obj.next_hearing),
    description: asOptionalString(obj.description),
    status: asOptionalString(obj.status) ?? "open",
  };
}

function normalizeList(raw: unknown) {
  const obj = asRecord(raw);
  const items = Array.isArray(obj.data)
    ? obj.data
    : Array.isArray(raw)
      ? raw
      : [];
  const meta = asRecord(obj.meta);
  const total = typeof meta.total === "number" ? meta.total : items.length;

  return { items: items.map(normalizeCase), total };
}

function toApiPayload(payload: CasePayload) {
  return {
    title: payload.title,
    process_number: payload.processNumber || null,
    client_id: payload.clientId,
    practice_area: payload.practiceArea || null,
    assigned_lawyer_id: payload.assignedLawyerId || null,
    next_hearing: payload.nextHearing || null,
    description: payload.description || null,
  };
}

export async function listCases(params?: {
  page?: number;
  limit?: number;
  search?: string;
  clientId?: number | string;
}) {
  const { clientId, ...rest } = params ?? {};
  const res = await api.get("/cases", {
    params: {
      ...rest,
      ...(clientId ? { client_id: clientId } : {}),
    },
  });

  return normalizeList(res.data);
}

export async function createCase(payload: CasePayload) {
  const res = await api.post("/cases", toApiPayload(payload));
  return normalizeCase(res.data?.data ?? res.data);
}
