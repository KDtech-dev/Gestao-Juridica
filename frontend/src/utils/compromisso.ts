import type { Compromisso } from "@/api/apiCompromissos";
import type { CompromissoFormValues } from "@/components/forms/CompromissoForm";

export type Translate = (path: string) => string;

export function statusChip(status: Compromisso["status"], t: Translate) {
    if (status === "CONCLUIDO") {
        return {
            label: t("agenda.status.completed"),
            color: "#047857",
            bg: "#b8ead2",
        };
    }

    if (status === "CANCELADO") {
        return {
            label: t("agenda.status.cancelled"),
            color: "#991b1b",
            bg: "#fee2e2",
        };
    }

    return { label: t("agenda.status.pending"), color: "#c2410c", bg: "#ffe3bf" };
}

export function tipoLabel(tipo: Compromisso["tipo"], t: Translate) {
    const labels: Record<Compromisso["tipo"], string> = {
        COMPROMISSO: t("agenda.types.appointment"),
        LEMBRETE: t("agenda.types.reminder"),
        AUDIENCIA: t("agenda.types.hearing"),
        PRAZO: t("agenda.types.deadline"),
        REUNIAO: t("agenda.types.meeting"),
    };

    return labels[tipo];
}

export function tipoIcon(tipo: Compromisso["tipo"]) {
    const icons: Record<Compromisso["tipo"], string> = {
        COMPROMISSO: "mdi:calendar-check-outline",
        LEMBRETE: "mdi:bell-outline",
        AUDIENCIA: "mdi:gavel",
        PRAZO: "mdi:timer-sand",
        REUNIAO: "mdi:account-group-outline",
    };

    return icons[tipo];
}

export function timeToMinutes(time: string) {
    const [hh, mm] = (time || "00:00").split(":").map((s) => parseInt(s, 10));

    return (isNaN(hh) ? 0 : hh) * 60 + (isNaN(mm) ? 0 : mm);
}

export function isSameDay(d1: Date, d2: Date) {
    return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
    );
}

export function compromissoDate(compromisso: Compromisso) {
    const datePart = compromisso.data.split(/[T\s]/)[0];
    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, minute] = (compromisso.hora || "00:00").split(":").map(Number);

    if (!year || !month || !day) {
        return new Date();
    }

    return new Date(year, month - 1, day, hour || 0, minute || 0);
}

export function formatTime(compromisso: Compromisso) {
    return (compromisso.hora || "00:00").slice(0, 5);
}

export function compromissoToFormValues(
    compromisso: Compromisso,
): CompromissoFormValues {
    return {
        titulo: compromisso.titulo,
        tipo: compromisso.tipo,
        status: compromisso.status,
        startsAt: compromissoDate(compromisso),
        descricao: compromisso.descricao ?? "",
        userId:
            compromisso.criador.id != null ? String(compromisso.criador.id) : "",
    };
}