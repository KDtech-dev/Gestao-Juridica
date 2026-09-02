"use client";

import { useMemo, useState } from "react";
import { Stack, TextField, Typography } from "@mui/material";
import { BaseModal } from "@/components/modals/BaseModal";
import auth from "@/configs/auth";
import { getPublicApiOrigin } from "@/configs/apiUrl";
import { z } from "zod";
import { toast } from "@/utils/toast";
import { useTranslations } from "next-intl";
import PasswordVisibilityAdornment from "@/components/PasswordVisibilityAdornment";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function ChangePasswordModal({ open, onClose }: Props) {
  const t = useTranslations("internal.profile.passwordModal");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [visiblePasswords, setVisiblePasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<
      Record<"currentPassword" | "newPassword" | "confirmPassword", string>
    >
  >({});

  const passwordsMismatch = useMemo(
    () => confirmPassword.length > 0 && confirmPassword !== newPassword,
    [confirmPassword, newPassword],
  );

  const changePasswordSchema = useMemo(
    () =>
      z
        .object({
          currentPassword: z.string().min(1, t("validation.currentRequired")),
          newPassword: z.string().min(6, t("validation.newMin")),
          confirmPassword: z.string().min(1, t("validation.confirmRequired")),
        })
        .superRefine(({ newPassword, confirmPassword }, ctx) => {
          if (newPassword !== confirmPassword) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["confirmPassword"],
              message: t("validation.passwordsMatch"),
            });
          }
        }),
    [t],
  );

  const extractErrorMessage = (errors: unknown): string | undefined => {
    if (!errors || typeof errors !== "object") return undefined;
    const values = Object.values(errors as Record<string, unknown>);
    for (const value of values) {
      if (typeof value === "string") return value;
      if (Array.isArray(value)) {
        const nested = value.find((item) => typeof item === "string");
        if (nested) return nested as string;
      }
    }
    return undefined;
  };

  const resetForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setVisiblePasswords({ current: false, new: false, confirm: false });
    setSaving(false);
    setFieldErrors({});
  };

  const togglePasswordVisibility = (field: keyof typeof visiblePasswords) => {
    setVisiblePasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleClose = () => {
    if (saving) return;
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    const parsed = changePasswordSchema.safeParse({
      currentPassword,
      newPassword,
      confirmPassword,
    });

    if (!parsed.success) {
      const nextErrors: Partial<
        Record<"currentPassword" | "newPassword" | "confirmPassword", string>
      > = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path?.[0];
        if (
          key === "currentPassword" ||
          key === "newPassword" ||
          key === "confirmPassword"
        ) {
          nextErrors[key] = issue.message;
        }
      }
      setFieldErrors(nextErrors);
      toast.error(t("toast.reviewFields"));
      return;
    }

    setSaving(true);
    setFieldErrors({});

    try {
      const base = getPublicApiOrigin();
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem(auth.storageTokenKeyName)
          : null;
      const response = await fetch(`${base}/api/profile/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(data?.message ?? t("toast.success"));
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const fallbackMessage = t("errors.update");
        const serverMessage =
          data?.message || extractErrorMessage(data?.errors) || fallbackMessage;
        toast.error(serverMessage);
      }
    } catch (error) {
      console.error(error);
      toast.error(t("errors.connection"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <BaseModal
      open={open}
      onClose={handleClose}
      title={t("title")}
      confirmText={saving ? t("actions.updating") : t("actions.save")}
      confirmDisabled={saving}
      onSubmit={handleSubmit}
      maxWidth="sm"
    >
      <Stack spacing={2}>
        <Stack spacing={0.5}>
          <Typography color="text.secondary" fontSize="0.92rem">
            {t("description")}
          </Typography>
        </Stack>

        <TextField
          label={t("fields.currentPassword")}
          type={visiblePasswords.current ? "text" : "password"}
          value={currentPassword}
          onChange={(event) => {
            setCurrentPassword(event.target.value);
            if (fieldErrors.currentPassword) {
              setFieldErrors((prev) => ({
                ...prev,
                currentPassword: undefined,
              }));
            }
          }}
          fullWidth
          autoComplete="current-password"
          error={!!fieldErrors.currentPassword}
          helperText={fieldErrors.currentPassword ?? ""}
          InputProps={{
            endAdornment: (
              <PasswordVisibilityAdornment
                visible={visiblePasswords.current}
                onToggle={() => togglePasswordVisibility("current")}
                disabled={saving}
              />
            ),
          }}
        />
        <TextField
          label={t("fields.newPassword")}
          type={visiblePasswords.new ? "text" : "password"}
          value={newPassword}
          onChange={(event) => {
            setNewPassword(event.target.value);
            if (fieldErrors.newPassword) {
              setFieldErrors((prev) => ({ ...prev, newPassword: undefined }));
            }
          }}
          fullWidth
          autoComplete="new-password"
          error={!!fieldErrors.newPassword}
          helperText={fieldErrors.newPassword ?? ""}
          InputProps={{
            endAdornment: (
              <PasswordVisibilityAdornment
                visible={visiblePasswords.new}
                onToggle={() => togglePasswordVisibility("new")}
                disabled={saving}
              />
            ),
          }}
        />
        <TextField
          label={t("fields.confirmPassword")}
          type={visiblePasswords.confirm ? "text" : "password"}
          value={confirmPassword}
          onChange={(event) => {
            setConfirmPassword(event.target.value);
            if (fieldErrors.confirmPassword) {
              setFieldErrors((prev) => ({
                ...prev,
                confirmPassword: undefined,
              }));
            }
          }}
          fullWidth
          autoComplete="new-password"
          error={!!fieldErrors.confirmPassword || passwordsMismatch}
          helperText={
            fieldErrors.confirmPassword ??
            (passwordsMismatch ? t("validation.passwordsMatch") : "")
          }
          InputProps={{
            endAdornment: (
              <PasswordVisibilityAdornment
                visible={visiblePasswords.confirm}
                onToggle={() => togglePasswordVisibility("confirm")}
                disabled={saving}
              />
            ),
          }}
        />
      </Stack>
    </BaseModal>
  );
}

export default ChangePasswordModal;
