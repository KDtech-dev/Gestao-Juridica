"use client";

import { getAxios } from "@/configs/axios";

const api = getAxios();

export type AppointmentStatus = "Confirmado" | "Pendente";
export type AppointmentType = "presencial" | "online";

export type Appointment = {
  id: number | string;
  title: string;
  type: AppointmentType;
  clientId?: number | string | null;
  clientName?: string | null;
  location?: string | null;
  videoUrl?: string | null;
  startsAt: string;
  status: AppointmentStatus;
  description?: string | null;
  lawyerIds: Array<number | string>;
  lawyers: Array<{
    id: number | string;
    name: string;
    email?: string | null;
    oabNumber?: string | null;
  }>;
};

export type AppointmentPayload = {
  title: string;
  type: AppointmentType;
  clientName?: string;
  location?: string;
  videoUrl?: string;
  startsAt: string;
  status: AppointmentStatus;
  description?: string;
  lawyerIds?: Array<number | string>;
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

function normalizeAppointment(raw: unknown): Appointment {
  const obj = asRecord(raw);
  const id = obj.id;
  const type = obj.type === "online" ? "online" : "presencial";
  const status = obj.status === "Confirmado" ? "Confirmado" : "Pendente";

  const lawyers = Array.isArray(obj.lawyers)
    ? obj.lawyers.map((lawyer) => {
        const lawyerObj = asRecord(lawyer);
        const lawyerId = lawyerObj.id;

        return {
          id:
            typeof lawyerId === "number" || typeof lawyerId === "string"
              ? lawyerId
              : "",
          name: asOptionalString(lawyerObj.name) ?? "",
          email: asOptionalString(lawyerObj.email),
          oabNumber: asOptionalString(
            lawyerObj.oab_number ?? lawyerObj.oabNumber,
          ),
        };
      })
    : [];
  const lawyerIds = Array.isArray(obj.lawyer_ids)
    ? obj.lawyer_ids.filter(
        (lawyerId): lawyerId is number | string =>
          typeof lawyerId === "number" || typeof lawyerId === "string",
      )
    : lawyers.map((lawyer) => lawyer.id);

  return {
    id: typeof id === "number" || typeof id === "string" ? id : "",
    title: asOptionalString(obj.title) ?? "",
    type,
    clientId:
      typeof obj.client_id === "number" || typeof obj.client_id === "string"
        ? obj.client_id
        : null,
    clientName: asOptionalString(obj.client_name),
    location: asOptionalString(obj.location),
    videoUrl: asOptionalString(obj.video_url),
    startsAt: asOptionalString(obj.starts_at) ?? new Date().toISOString(),
    status,
    description: asOptionalString(obj.description),
    lawyerIds,
    lawyers,
  };
}

function normalizeList(raw: unknown): Appointment[] {
  const obj = asRecord(raw);
  const items = Array.isArray(obj.data)
    ? obj.data
    : Array.isArray(raw)
      ? raw
      : [];

  return items.map(normalizeAppointment);
}

function toApiPayload(payload: AppointmentPayload) {
  return {
    title: payload.title,
    type: payload.type,
    client_name: payload.clientName || null,
    location: payload.type === "presencial" ? payload.location || null : null,
    video_url: payload.type === "online" ? payload.videoUrl || null : null,
    starts_at: payload.startsAt,
    status: payload.status,
    description: payload.description || null,
    lawyer_ids: payload.lawyerIds ?? [],
  };
}

export async function listAppointments(params?: {
  from?: string;
  to?: string;
}) {
  const res = await api.get("/appointments", { params });
  return normalizeList(res.data);
}

export async function createAppointment(payload: AppointmentPayload) {
  const res = await api.post("/appointments", toApiPayload(payload));
  return normalizeAppointment(res.data?.data ?? res.data);
}

export async function updateAppointment(
  id: number | string,
  payload: AppointmentPayload,
) {
  const res = await api.put(`/appointments/${id}`, toApiPayload(payload));
  return normalizeAppointment(res.data?.data ?? res.data);
}

export async function deleteAppointment(id: number | string) {
  const res = await api.delete(`/appointments/${id}`);
  return res.data;
}
