"use client";

import {
  Autocomplete,
  Box,
  Button,
  Divider,
  Drawer,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";
import type { User, UserType } from "@/services/userService";
import { useTheme } from "@mui/material/styles";

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
  // simple, UI-level validation
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

export function UserFormModal({ open, onClose, onSubmit, initialData }: Props) {
  const theme = useTheme();
  const isSmDown = useMediaQuery(theme.breakpoints.down("sm"));
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
    <Drawer
      open={open}
      onClose={loading ? undefined : onClose}
      anchor="right"
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 520 },
          borderTopLeftRadius: isSmDown ? 0 : "16px",
          borderBottomLeftRadius: isSmDown ? 0 : "16px",
        },
      }}
    >
      <Stack sx={{ height: "100%" }}>
        <Box
          sx={{ px: 2.5, py: 2, display: "flex", alignItems: "center", gap: 1 }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" fontWeight={700} noWrap>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              Advogados e funcionários em um só lugar.
            </Typography>
          </Box>
          <IconButton onClick={onClose} disabled={loading} aria-label="Fechar">
            <Icon icon="mdi:close" width={22} />
          </IconButton>
        </Box>

        <Divider />

        <Box sx={{ p: 2.5, flex: 1, overflow: "auto" }}>
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
              onChange={(e) =>
                setForm((prev) => ({ ...prev, name: e.target.value }))
              }
              onBlur={() => setTouched((p) => ({ ...p, name: true }))}
              error={!!touched.name && !form.name.trim()}
              helperText={
                !!touched.name && !form.name.trim()
                  ? "Nome é obrigatório."
                  : " "
              }
              fullWidth
            />

            <TextField
              label="E-mail"
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, email: e.target.value }))
              }
              onBlur={() => setTouched((p) => ({ ...p, email: true }))}
              error={emailInvalid}
              helperText={emailInvalid ? "Informe um e-mail válido." : " "}
              fullWidth
            />

            {!isEdit ? (
              <TextField
                label="CPF (11 dígitos)"
                value={form.cpf}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    cpf: normalizeCpf(e.target.value),
                  }))
                }
                onBlur={() => setTouched((p) => ({ ...p, cpf: true }))}
                error={cpfInvalid}
                helperText={cpfInvalid ? "CPF deve ter 11 dígitos." : " "}
                fullWidth
                inputProps={{ inputMode: "numeric" }}
              />
            ) : null}

            <TextField
              label="Telefone"
              value={form.phone}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, phone: e.target.value }))
              }
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
                      label="Áreas de atuação"
                      placeholder="Adicionar área..."
                    />
                  )}
                />
              </>
            ) : (
              <TextField
                label="Cargo/Função"
                value={form.position}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, position: e.target.value }))
                }
                onBlur={() => setTouched((p) => ({ ...p, position: true }))}
                error={!!touched.position && !form.position.trim()}
                helperText={
                  !!touched.position && !form.position.trim()
                    ? "Cargo/Função é obrigatório."
                    : " "
                }
                fullWidth
              />
            )}

            <FormControlLabel
              control={
                <Switch
                  checked={form.active}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, active: e.target.checked }))
                  }
                />
              }
              label="Ativo"
            />

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
                  helperText={
                    !!touched.password &&
                    form.password.length > 0 &&
                    form.password.length < 6
                      ? "Mínimo 6 caracteres."
                      : passwordMismatch
                        ? "As senhas precisam ser iguais."
                        : " "
                  }
                  fullWidth
                  autoComplete="new-password"
                />
                <TextField
                  label="Confirmar senha"
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  onBlur={() =>
                    setTouched((p) => ({ ...p, confirmPassword: true }))
                  }
                  error={passwordMismatch}
                  helperText={
                    passwordMismatch ? "As senhas precisam ser iguais." : " "
                  }
                  fullWidth
                  autoComplete="new-password"
                />
              </>
            ) : null}
          </Stack>
        </Box>

        <Divider />

        <Box sx={{ p: 2.5 }}>
          <Stack direction="row" spacing={1.2} justifyContent="flex-end">
            <Button onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading || !canSubmit}
              sx={{ textTransform: "none", borderRadius: "12px" }}
            >
              {loading ? "Salvando..." : isEdit ? "Salvar" : "Criar"}
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Drawer>
  );
}

export default UserFormModal;
