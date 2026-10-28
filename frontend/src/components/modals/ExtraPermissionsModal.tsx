"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
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
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (open) {
      setDraft(selected);
      setSearch("");
    }
  }, [open, selected]);

  const labelFor = (name: string) => {
    const permission = catalog.find((item) => item.name === name);
    return permission
      ? `${permission.group_label} · ${permission.action_label}`
      : name;
  };

  const filteredCatalog = catalog.filter((permission) =>
    [permission.name, permission.group_label, permission.action_label]
      .some((value) => value.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase())),
  );
  const groups = filteredCatalog.reduce<Record<string, PermissionCatalogEntry[]>>(
    (result, permission) => {
      (result[permission.group_label] ??= []).push(permission);
      return result;
    },
    {},
  );

  const togglePermission = (name: string, checked: boolean) => {
    setDraft((current) =>
      checked
        ? current.includes(name) ? current : [...current, name]
        : current.filter((permission) => permission !== name),
    );
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
        <TextField
          fullWidth
          label={t("permissions.field")}
          placeholder={t("permissions.placeholder")}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <Typography variant="caption" color="text.secondary">
          {t("permissions.selectedCount", { count: draft.length })}
        </Typography>
        <Box sx={{ maxHeight: "50vh", overflowY: "auto", pr: 1 }}>
          {Object.entries(groups).length ? (
            <Stack spacing={2}>
              {Object.entries(groups).map(([groupLabel, permissions]) => (
                <Box key={groupLabel}>
                  <Typography variant="subtitle2" fontWeight={700} mb={0.5}>
                    {groupLabel}
                  </Typography>
                  <FormGroup>
                    {permissions.map((permission) => (
                      <FormControlLabel
                        key={permission.name}
                        control={
                          <Checkbox
                            checked={draft.includes(permission.name)}
                            onChange={(event) =>
                              togglePermission(permission.name, event.target.checked)
                            }
                          />
                        }
                        label={labelFor(permission.name)}
                        sx={{ ml: 0, minHeight: 40 }}
                      />
                    ))}
                  </FormGroup>
                </Box>
              ))}
            </Stack>
          ) : (
            <Typography color="text.secondary" py={2}>
              {t("permissions.noResults")}
            </Typography>
          )}
        </Box>
      </Stack>
    </BaseModal>
  );
}
