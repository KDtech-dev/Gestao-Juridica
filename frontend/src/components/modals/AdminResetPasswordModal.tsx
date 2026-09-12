"use client";

import { useMemo, useState } from "react";
import { Stack, TextField, Typography } from "@mui/material";
import { BaseModal } from "@/components/modals/BaseModal";
import { resetUserPassword } from "@/api/ApiUsers";
import { z } from "zod";
import { toast, formatToastErrorMessage } from "@/utils/toast";
import { useTranslations } from "next-intl";
import PasswordVisibilityAdornment from "@/components/PasswordVisibilityAdornment";
import type { UserType } from "@/@core/types";

type Props = {
    open: boolean;
    onClose: () => void;
    targetUser: UserType | null;
};

export function AdminResetPasswordModal({ open, onClose, targetUser }: Props) {
    const t = useTranslations("internal.users.resetPasswordModal");
    const [adminPassword, setAdminPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [visiblePasswords, setVisiblePasswords] = useState({
        admin: false,
        new: false,
        confirm: false,
    });
    const [saving, setSaving] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Partial<Record<"adminPassword" | "newPassword" | "confirmPassword", string>>>({});

    const passwordsMismatch = useMemo(
        () => confirmPassword.length > 0 && confirmPassword !== newPassword,
        [confirmPassword, newPassword],
    );

    const schema = useMemo(
        () =>
            z
                .object({
                    adminPassword: z.string().min(1, t("validation.adminRequired")),
                    newPassword: z.string().min(8, t("validation.newMin")),
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

    const togglePasswordVisibility = (field: keyof typeof visiblePasswords) => {
        setVisiblePasswords((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    const resetForm = () => {
        setAdminPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setVisiblePasswords({ admin: false, new: false, confirm: false });
        setSaving(false);
        setFieldErrors({});
    };

    const handleClose = () => {
        if (saving) return;
        resetForm();
        onClose();
    };

    const handleSubmit = async () => {
        if (!targetUser) return;

        const parsed = schema.safeParse({ adminPassword, newPassword, confirmPassword });

        if (!parsed.success) {
            const nextErrors: typeof fieldErrors = {};
            for (const issue of parsed.error.issues) {
                const key = issue.path?.[0];
                if (key === "adminPassword" || key === "newPassword" || key === "confirmPassword") {
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
            const response = await resetUserPassword(String(targetUser.id), {
                admin_password: adminPassword,
                new_password: newPassword,
                new_password_confirmation: confirmPassword,
            });
            toast.success(response.message ?? t("toast.success"));
            handleClose();
        } catch (err) {
            toast.error(formatToastErrorMessage(err, t("errors.update")));
        } finally {
            setSaving(false);
        }
    };

    return (
        <BaseModal
            open={open}
            onClose={handleClose}
            title={t("title", { name: targetUser?.name ?? "" })}
            confirmText={saving ? t("actions.updating") : t("actions.save")}
            confirmDisabled={saving}
            onSubmit={handleSubmit}
            maxWidth="sm"
        >
            <Stack spacing={2}>
                <Typography color="text.secondary" fontSize="0.92rem">
                    {t("description", { name: targetUser?.name ?? "" })}
                </Typography>

                <TextField
                    label={t("fields.adminPassword")}
                    type={visiblePasswords.admin ? "text" : "password"}
                    value={adminPassword}
                    onChange={(e) => {
                        setAdminPassword(e.target.value);
                        if (fieldErrors.adminPassword) {
                            setFieldErrors((prev) => ({ ...prev, adminPassword: undefined }));
                        }
                    }}
                    fullWidth
                    autoComplete="current-password"
                    error={!!fieldErrors.adminPassword}
                    helperText={fieldErrors.adminPassword ?? ""}
                    InputProps={{
                        endAdornment: (
                            <PasswordVisibilityAdornment
                                visible={visiblePasswords.admin}
                                onToggle={() => togglePasswordVisibility("admin")}
                                disabled={saving}
                            />
                        ),
                    }}
                />
                <TextField
                    label={t("fields.newPassword")}
                    type={visiblePasswords.new ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => {
                        setNewPassword(e.target.value);
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
                    onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (fieldErrors.confirmPassword) {
                            setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
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

export default AdminResetPasswordModal;