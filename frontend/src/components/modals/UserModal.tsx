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
import { userModalSchema } from "@/schemas/user.schema";

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
type FormErrors = Partial<Record<keyof FormState, string>>;

function normalizeCpf(value: string): string {
  return value.replace(/\D/g, "").slice(0, 11);
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

function getValidationErrors(form: FormState, isEdit: boolean): FormErrors {
  const parsed = userModalSchema.safeParse({ ...form, isEdit });
  if (parsed.success) return {};

  return parsed.error.issues.reduce<FormErrors>((acc, issue) => {
    const field = issue.path[0];
    if (typeof field === "string" && !acc[field as keyof FormState]) {
      acc[field as keyof FormState] = issue.message;
    }
    return acc;
  }, {});
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
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!open) return;
    setForm(initialFormFromUser(initialData));
    setTouched({});
    setFormErrors({});
    setLoading(false);
  }, [open, initialData]);

  const canSubmit = useMemo(() => {
    return userModalSchema.safeParse({ ...form, isEdit }).success;
  }, [form, isEdit]);

  const getFieldError = (field: keyof FormState) =>
    touched[field] ? formErrors[field] : undefined;

  const updateForm = <Field extends keyof FormState>(
    field: Field,
    value: FormState[Field],
  ) => {
    const nextForm = { ...form, [field]: value };
    setForm(nextForm);
    setFormErrors(getValidationErrors(nextForm, isEdit));
  };

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
    const validationErrors = getValidationErrors(form, isEdit);
    setFormErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    try {
      await onSubmit({
        type: form.type,
        name: form.name.trim(),
        email: form.email.trim(),
        cpf: isEdit ? undefined : normalizeCpf(form.cpf),
        phone: form.phone.trim() || undefined,
        oabNumber:
          form.type === "advogado"
            ? form.oabNumber.trim() || undefined
            : undefined,
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
              const nextForm: FormState = {
                ...form,
                type: next,
                oabNumber: next === "advogado" ? form.oabNumber : "",
                areas: next === "advogado" ? form.areas : [],
                position: next === "funcionario" ? form.position : "",
              };
              setForm(nextForm);
              setFormErrors(getValidationErrors(nextForm, isEdit));
            }}
          >
            <MenuItem value="advogado">Advogado</MenuItem>
            <MenuItem value="admin">Administrador</MenuItem>
            <MenuItem value="funcionario">Funcionário</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Nome"
          value={form.name}
          onChange={(e) => updateForm("name", e.target.value)}
          onBlur={() => setTouched((p) => ({ ...p, name: true }))}
          error={!!getFieldError("name")}
          helperText={getFieldError("name")}
          fullWidth
        />

        <TextField
          label="E-mail"
          value={form.email}
          onChange={(e) => updateForm("email", e.target.value)}
          onBlur={() => setTouched((p) => ({ ...p, email: true }))}
          error={!!getFieldError("email")}
          helperText={getFieldError("email")}
          fullWidth
        />

        {!isEdit ? (
          <TextField
            label="CPF"
            value={form.cpf}
            onChange={(e) =>
              updateForm("cpf", normalizeCpf(e.target.value))
            }
            onBlur={() => setTouched((p) => ({ ...p, cpf: true }))}
            error={!!getFieldError("cpf")}
            helperText={getFieldError("cpf")}
            fullWidth
          />
        ) : null}

        <TextField
          label="Telefone"
          value={form.phone}
          onChange={(e) => updateForm("phone", e.target.value)}
          fullWidth
        />

        {form.type === "funcionario" ? (
          <TextField
            label="Cargo/Função"
            value={form.position}
            onChange={(e) => updateForm("position", e.target.value)}
            onBlur={() => setTouched((p) => ({ ...p, position: true }))}
            error={!!getFieldError("position")}
            helperText={getFieldError("position")}
            fullWidth
          />
        ) : null}

        {form.type === "advogado" ? (
          <>
            <TextField
              label="OAB"
              value={form.oabNumber}
              onChange={(e) =>
                updateForm("oabNumber", e.target.value)
              }
              fullWidth
            />

            <Autocomplete
              multiple
              freeSolo
              options={practiceAreaOptions}
              value={form.areas}
              onChange={(_, value) =>
                updateForm(
                  "areas",
                  value.map((v) => String(v)).filter(Boolean),
                )
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
                  onChange={(e) => {
                    const nextForm = {
                      ...form,
                      changePassword: e.target.checked,
                      password: "",
                      confirmPassword: "",
                    };
                    setForm(nextForm);
                    setFormErrors(getValidationErrors(nextForm, isEdit));
                  }}
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
              onChange={(e) => updateForm("password", e.target.value)}
              onBlur={() => setTouched((p) => ({ ...p, password: true }))}
              error={!!getFieldError("password")}
              helperText={getFieldError("password")}
              autoComplete="new-password"
            />

            <TextField
              label="Confirmar senha"
              type="password"
              value={form.confirmPassword}
              onChange={(e) =>
                updateForm("confirmPassword", e.target.value)
              }
              onBlur={() =>
                setTouched((p) => ({ ...p, confirmPassword: true }))
              }
              error={!!getFieldError("confirmPassword")}
              helperText={getFieldError("confirmPassword")}
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
