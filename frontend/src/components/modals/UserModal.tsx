"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Autocomplete,
  Box,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
} from "@mui/material";
import type { User, UserType } from "@/services/userService";
import { BaseModal } from "@/components/modals/BaseModal";

const practiceAreaOptions = [
  "Direito Civil",
  "Direito Trabalhista",
  "Direito Tributário",
  "Direito Penal",
  "Direito Empresarial",
  "Direito Administrativo",
  "Direito Previdenciário",
  "Direito de Família",
  "Propriedade Intelectual",
  "Contratos",
];

type FormState = {
  type: UserType;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  oabNumber: string;
  areas: string[];
  position: string;
  active: boolean;
  password: string;
  confirmPassword: string;
  changePassword: boolean;
};

function normalizeCpf(value: string): string {
  return value.replace(/\D/g, "").slice(0, 11);
}

function validateEmail(value: string): boolean {
  if (!value.trim()) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function initialFormFromUser(initial?: Partial<User> | null): FormState {
  const type = (initial?.type ?? "funcionario") as UserType;
  return {
    type,
    name: initial?.name ?? "",
    email: initial?.email ?? "",
    cpf: "",
    phone: initial?.phone ? String(initial.phone) : "",
    oabNumber: initial?.oabNumber ? String(initial.oabNumber) : "",
    areas: Array.isArray(initial?.areas) ? initial!.areas!.filter(Boolean) : [],
    position: initial?.position ? String(initial.position) : "",
    active: initial?.active ?? true,
    password: "",
    confirmPassword: "",
    changePassword: false,
  };
}

export type UserFormSubmitPayload = {
  type: UserType;
  name: string;
  email: string;
  cpf?: string;
  phone?: string;
  oabNumber?: string;
  areas?: string[];
  position?: string;
  active: boolean;
  password?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: UserFormSubmitPayload) => Promise<void> | void;
  initialData?: User | null;
};

export function UserModal({ open, onClose, onSubmit, initialData }: Props) {
  const isEdit = !!initialData?.id;
  const [form, setForm] = useState<FormState>(() =>
    initialFormFromUser(initialData),
  );
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!open) return;
    setForm(initialFormFromUser(initialData));
    setTouched({});
    setLoading(false);
  }, [open, initialData]);

  const passwordMismatch =
    (isEdit ? form.changePassword : true) &&
    form.confirmPassword.length > 0 &&
    form.password !== form.confirmPassword;

  const cpfInvalid = useMemo(() => {
    if (isEdit) return false;
    if (!touched.cpf) return false;
    const digits = normalizeCpf(form.cpf);
    return digits.length !== 11;
  }, [form.cpf, isEdit, touched.cpf]);

  const emailInvalid = useMemo(() => {
    if (!touched.email) return false;
    return !validateEmail(form.email);
  }, [form.email, touched.email]);

  const canSubmit = useMemo(() => {
    if (!form.name.trim()) return false;
    if (!validateEmail(form.email)) return false;
    if (!isEdit) {
      if (normalizeCpf(form.cpf).length !== 11) return false;
      if (form.password.length < 6) return false;
      if (form.password !== form.confirmPassword) return false;
    }
    if (isEdit && form.changePassword) {
      if (form.password.length < 6) return false;
      if (form.password !== form.confirmPassword) return false;
    }
    if (form.type === "funcionario" && !form.position.trim()) return false;
    return true;
  }, [form, isEdit]);

  const title = isEdit ? "Editar usuário" : "Novo usuário";

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  const handleSubmit = async () => {
    setTouched((prev) => ({
      ...prev,
      name: true,
      email: true,
      cpf: true,
      position: true,
      password: true,
      confirmPassword: true,
    }));
    if (!canSubmit) return;

    setLoading(true);
    try {
      await onSubmit({
        type: form.type,
        name: form.name.trim(),
        email: form.email.trim(),
        cpf: isEdit ? undefined : normalizeCpf(form.cpf),
        phone: form.phone.trim() || undefined,
        oabNumber:
          form.type === "advogado" ? form.oabNumber.trim() || undefined : undefined,
        areas:
          form.type === "advogado"
            ? form.areas.length
              ? form.areas
              : undefined
            : undefined,
        position:
          form.type === "funcionario"
            ? form.position.trim() || undefined
            : undefined,
        active: form.active,
        password: !isEdit
          ? form.password
          : form.changePassword
            ? form.password
            : undefined,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal
      open={open}
      onClose={handleClose}
      title={title}
      confirmText={loading ? "Salvando..." : isEdit ? "Salvar" : "Criar"}
      confirmDisabled={loading || !canSubmit}
      cancelText="Cancelar"
      onSubmit={handleSubmit}
      maxWidth="md"
    >
      <Stack spacing={2}>
        <FormControl fullWidth>
          <InputLabel>Tipo</InputLabel>
          <Select
            label="Tipo"
            value={form.type}
            onChange={(e) => {
              const next = e.target.value as UserType;
              setForm((prev) => ({
                ...prev,
                type: next,
                oabNumber: next === "advogado" ? prev.oabNumber : "",
                areas: next === "advogado" ? prev.areas : [],
                position: next === "funcionario" ? prev.position : "",
              }));
            }}
          >
            <MenuItem value="advogado">Advogado</MenuItem>
            <MenuItem value="funcionario">Funcionário</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Nome"
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          onBlur={() => setTouched((p) => ({ ...p, name: true }))}
          error={!!touched.name && !form.name.trim()}
          
          fullWidth
        />

        <TextField
          label="E-mail"
          value={form.email}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, email: e.target.value }))
          }
          onBlur={() => setTouched((p) => ({ ...p, email: true }))}
          error={emailInvalid}
          fullWidth
        />

        {!isEdit ? (
          <TextField
            label="CPF"
            value={form.cpf}
            onChange={(e) => setForm((prev) => ({ ...prev, cpf: e.target.value }))}
            onBlur={() => setTouched((p) => ({ ...p, cpf: true }))}
            error={cpfInvalid}
            fullWidth
          />
        ) : null}

        <TextField
          label="Telefone"
          value={form.phone}
          onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
          fullWidth
        />

        {form.type === "advogado" ? (
          <>
            <TextField
              label="OAB"
              value={form.oabNumber}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, oabNumber: e.target.value }))
              }
              fullWidth
            />

            <Autocomplete
              multiple
              freeSolo
              options={practiceAreaOptions}
              value={form.areas}
              onChange={(_, value) =>
                setForm((prev) => ({
                  ...prev,
                  areas: value.map((v) => String(v)).filter(Boolean),
                }))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Especialidades"
                  placeholder="Adicionar Especialidade..."
                />
              )}
            />
          </>
        ) : null}

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.6 }}>
          {isEdit ? (
            <FormControlLabel
              control={
                <Switch
                  checked={form.changePassword}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      changePassword: e.target.checked,
                      password: "",
                      confirmPassword: "",
                    }))
                  }
                />
              }
              label="Definir nova senha"
            />
          ) : null}
        </Box>

        {!isEdit || form.changePassword ? (
          <>
            <TextField
              label="Senha"
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, password: e.target.value }))
              }
              onBlur={() => setTouched((p) => ({ ...p, password: true }))}
              error={
                (!!touched.password &&
                  form.password.length > 0 &&
                  form.password.length < 6) ||
                passwordMismatch
              }
              autoComplete="new-password"
            />

            <TextField
              label="Confirmar senha"
              type="password"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
              }
              onBlur={() => setTouched((p) => ({ ...p, confirmPassword: true }))}
              error={passwordMismatch}
              fullWidth
              autoComplete="new-password"
            />
          </>
        ) : null}
      </Stack>
    </BaseModal>
  );
}

export default UserModal;
