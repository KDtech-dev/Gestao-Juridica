"use client";

import { useMemo, useState } from "react";
import { Alert, Stack, TextField, Typography } from "@mui/material";
import { BaseModal } from "@/components/modals/BaseModal";
import auth from "@/configs/auth";
import { getPublicApiOrigin } from "@/configs/apiUrl";
import { z } from "zod";

type Feedback = {
  severity: "success" | "error" | "info";
  message: string;
};

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Informe a senha atual."),
    newPassword: z.string().min(6, "A nova senha deve ter pelo menos 6 caracteres."),
    confirmPassword: z.string().min(1, "Confirme a nova senha."),
  })
  .superRefine(({ newPassword, confirmPassword }, ctx) => {
    if (newPassword !== confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "As senhas precisam ser iguais.",
      });
    }
  });

type Props = {
  open: boolean;
  onClose: () => void;
};

export function ChangePasswordModal({ open, onClose }: Props) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<"currentPassword" | "newPassword" | "confirmPassword", string>>
  >({});

  const passwordsMismatch = useMemo(
    () => confirmPassword.length > 0 && confirmPassword !== newPassword,
    [confirmPassword, newPassword],
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
    setFeedback(null);
    setSaving(false);
    setFieldErrors({});
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
      setFeedback({
        severity: "error",
        message: "Revise os campos destacados.",
      });
      return;
    }

    setSaving(true);
    setFeedback(null);
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
        setFeedback({
          severity: "success",
          message: data?.message ?? "Senha atualizada com sucesso.",
        });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const fallbackMessage = "Não foi possível atualizar a senha.";
        const serverMessage =
          data?.message || extractErrorMessage(data?.errors) || fallbackMessage;
        setFeedback({
          severity: "error",
          message: serverMessage,
        });
      }
    } catch (error) {
      console.error(error);
      setFeedback({
        severity: "error",
        message:
          "Não foi possível conectar ao servidor. Tente novamente mais tarde.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <BaseModal
      open={open}
      onClose={handleClose}
      title="Alterar Senha"
      confirmText={saving ? "Atualizando..." : "Salvar"}
      confirmDisabled={saving}
      onSubmit={handleSubmit}
      maxWidth="sm"
    >
      <Stack spacing={2}>
        <Stack spacing={0.5}>
          <Typography color="text.secondary" fontSize="0.92rem">
            Mantenha sua conta segura escolhendo uma senha forte.
          </Typography>
        </Stack>

        {feedback ? (
          <Alert severity={feedback.severity}>{feedback.message}</Alert>
        ) : null}

        <TextField
          label="Senha atual"
          type="password"
          value={currentPassword}
          onChange={(event) => {
            setCurrentPassword(event.target.value);
            if (fieldErrors.currentPassword) {
              setFieldErrors((prev) => ({ ...prev, currentPassword: undefined }));
            }
          }}
          fullWidth
          autoComplete="current-password"
          error={!!fieldErrors.currentPassword}
          helperText={fieldErrors.currentPassword ?? ""}
        />
        <TextField
          label="Nova senha"
          type="password"
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
        />
        <TextField
          label="Confirmar nova senha"
          type="password"
          value={confirmPassword}
          onChange={(event) => {
            setConfirmPassword(event.target.value);
            if (fieldErrors.confirmPassword) {
              setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
            }
          }}
          fullWidth
          autoComplete="new-password"
          error={!!fieldErrors.confirmPassword || passwordsMismatch}
          helperText={
            fieldErrors.confirmPassword ??
            (passwordsMismatch ? "As senhas precisam ser iguais." : "")
          }
        />
      </Stack>
    </BaseModal>
  );
}

export default ChangePasswordModal;
