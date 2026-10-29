"use client";

import { Box, Divider, Stack, Typography } from "@mui/material";
import { Icon } from "@/components/AppIcon";
import { BaseModal } from "@/components/modals/BaseModal";
import { useTranslation } from "@/hooks/useTranslation";
import type { Compromisso } from "@/api/apiCompromissos";
import {
    compromissoDate,
    formatTime,
    statusChip,
    tipoIcon,
    tipoLabel,
} from "@/utils/compromisso";

type Props = {
    event: Compromisso | null;
    onClose: () => void;
    onEdit: (event: Compromisso) => void;
};

export function CompromissoViewModal({ event, onClose, onEdit }: Props) {
    const { t, language } = useTranslation();

    return (
        <BaseModal
            open={!!event}
            onClose={onClose}
            title={t("agenda.viewModal.title")}
            confirmText={t("agenda.actions.edit")}
            cancelText={t("agenda.actions.close")}
            maxWidth="sm"
            onSubmit={() => event && onEdit(event)}
        >
            {event && (
                <Stack spacing={2}>
                    <Stack direction="row" alignItems="center" gap={1.2}>
                        <Box
                            sx={{
                                width: 42,
                                height: 42,
                                borderRadius: "12px",
                                display: "grid",
                                placeItems: "center",
                                bgcolor: "primary.main",
                                color: "#fff",
                            }}
                        >
                            <Icon icon={tipoIcon(event.tipo)} width={22} />
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                            <Typography fontWeight={800} color="text.primary">
                                {event.titulo}
                            </Typography>
                            <Typography fontSize="0.86rem" color="text.secondary">
                                {tipoLabel(event.tipo, t)}
                            </Typography>
                        </Box>
                    </Stack>

                    <Divider />

                    <Stack spacing={1.2}>
                        <Stack direction="row" gap={1} alignItems="center">
                            <Icon icon="mdi:clock-outline" width={18} />
                            <Typography fontSize="0.9rem">
                                {compromissoDate(event).toLocaleDateString(language)}{" "}
                                {t("agenda.viewModal.at")} {formatTime(event)}
                            </Typography>
                        </Stack>
                        <Stack direction="row" gap={1} alignItems="center">
                            <Icon icon="mdi:account-outline" width={18} />
                            <Typography fontSize="0.9rem">
                                {event.criador.nome || t("agenda.creatorUnknown")}
                            </Typography>
                        </Stack>
                        <Stack direction="row" gap={1} alignItems="center">
                            <Icon icon="mdi:flag-outline" width={18} />
                            <Typography fontSize="0.9rem">
                                {statusChip(event.status, t).label}
                            </Typography>
                        </Stack>
                    </Stack>

                    {event.descricao && (
                        <Box sx={{ p: 1.5, borderRadius: "12px", bgcolor: "action.hover" }}>
                            <Typography color="text.secondary" fontSize="0.9rem">
                                {event.descricao}
                            </Typography>
                        </Box>
                    )}
                </Stack>
            )}
        </BaseModal>
    );
}   