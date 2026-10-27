"use client";

import { useEffect, useState } from "react";
import { Autocomplete, Stack, TextField, Typography } from "@mui/material";
import { useTranslations } from "next-intl";
import { BaseModal } from "@/components/modals/BaseModal";
import type { PermissionCatalogEntry } from "@/api/ApiUsers";

type Props = {
  open: boolean;
  catalog: PermissionCatalogEntry[];
  selected: string[];
  onClose: () => void;
  onSave: (permissions: string[]) => void;
};

export default function ExtraPermissionsModal({
  open,
  catalog,
  selected,
  onClose,
  onSave,
}: Props) {
  const t = useTranslations("internal.users.form");
  const [draft, setDraft] = useState(selected);

  useEffect(() => {
    if (open) setDraft(selected);
  }, [open, selected]);

  const labelFor = (name: string) => {
    const permission = catalog.find((item) => item.name === name);
    return permission
      ? `${permission.group_label} · ${permission.action_label}`
      : name;
  };

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title={t("permissions.title")}
      confirmText={t("permissions.save")}
      cancelText={t("permissions.cancel")}
      onSubmit={() => onSave(draft)}
      maxWidth="md"
    >
      <Stack spacing={2}>
        <Typography color="text.secondary">
          {t("permissions.description")}
        </Typography>
        <Autocomplete
          multiple
          options={catalog.map((permission) => permission.name)}
          value={draft}
          onChange={(_, value) => setDraft(value)}
          getOptionLabel={labelFor}
          groupBy={(name) => catalog.find((item) => item.name === name)?.group_label ?? "Outros"}
          renderInput={(params) => (
            <TextField
              {...params}
              label={t("permissions.field")}
              placeholder={t("permissions.placeholder")}
            />
          )}
        />
      </Stack>
    </BaseModal>
  );
}
