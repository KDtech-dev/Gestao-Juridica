"use client";

import {
  Autocomplete,
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Icon } from "@/components/AppIcon";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { HeaderDashboard } from "@/components/HeaderADM";
import { SidebarDashboard } from "@/components/Sidebar";
import { useAuth } from "@/hooks/useAuth";
import { createUser, type UserType } from "@/services/userService";
import {
  newUserSchema,
  type NewUserInput,
  type NewUserPayload,
} from "@/schemas/user.schema";
import { formatToastErrorMessage, toast } from "@/utils/toast";

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

type FormState = NewUserInput;
type FormErrors = Partial<Record<keyof FormState, string>>;

function normalizeCpf(value: string): string {
  return value.replace(/\D/g, "").slice(0, 11);
}

function getValidationErrors(payload: NewUserInput): FormErrors {
  const parsed = newUserSchema.safeParse(payload);
  if (parsed.success) return {};

  return parsed.error.issues.reduce<FormErrors>((acc, issue) => {
    const field = issue.path[0];
    if (typeof field === "string" && !acc[field as keyof FormState]) {
      acc[field as keyof FormState] = issue.message;
    }
    return acc;
  }, {});
}

function toCreatePayload(payload: NewUserPayload) {
  return {
    name: payload.name,
    email: payload.email,
    phone: payload.phone || undefined,
    type: payload.type,
    cpf: payload.cpf,
    password: payload.password,
    oabNumber:
      payload.type === "advogado" ? payload.oabNumber || undefined : undefined,
    areas:
      payload.type === "advogado" && payload.areas?.length
        ? payload.areas
        : undefined,
  };
}

const initialForm: FormState = {
  type: "funcionario",
  name: "",
  email: "",
  cpf: "",
  phone: "",
  oabNumber: "",
  areas: [],
  position: "",
  password: "",
  confirmPassword: "",
};

export default function NewUserView() {
  const router = useRouter();
  const { hasRole } = useAuth();
  const isAdmin = hasRole("admin");
  const [form, setForm] = useState<FormState>(initialForm);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => {
    return newUserSchema.safeParse(form).success;
  }, [form]);

  const getFieldError = (field: keyof FormState) =>
    touched[field] ? formErrors[field] : undefined;

  const updateForm = <Field extends keyof FormState>(
    field: Field,
    value: FormState[Field],
  ) => {
    const nextForm = { ...form, [field]: value };
    setForm(nextForm);
    setFormErrors(getValidationErrors(nextForm));
  };

  const markRequiredTouched = () => {
    setTouched((prev) => ({
      ...prev,
      name: true,
      email: true,
      cpf: true,
      position: true,
      password: true,
      confirmPassword: true,
    }));
  };

  const handleSubmit = async () => {
    markRequiredTouched();
    const parsed = newUserSchema.safeParse(form);
    setFormErrors(parsed.success ? {} : getValidationErrors(form));
    if (!parsed.success || loading) return;

    setLoading(true);

    try {
      await createUser(toCreatePayload(parsed.data));
      toast.success("Usuário criado.");
      router.push("/admin/users");
    } catch (err) {
      toast.error(
        formatToastErrorMessage(err, "Não foi possível criar usuário."),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <SidebarDashboard activeKey="admin-users" />

      <Box sx={{ ml: { xs: 0, md: "280px" }, minWidth: 0 }}>
        <HeaderDashboard showSearch={false} />

        <Container maxWidth={false} sx={{ px: { xs: 2, md: 4 }, py: 3.2 }}>
          <Stack spacing={2.4}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
              gap={1.5}
            >
              <Box>
                <Typography variant="h4" fontWeight={700} color="text.primary">
                  Novo usuário
                </Typography>
                <Typography color="text.secondary" fontSize="0.95rem">
                  Cadastre administradores, advogados e funcionários.
                </Typography>
              </Box>

              <Button
                component={Link}
                href="/admin/users"
                startIcon={<Icon icon="mdi:arrow-left" width={20} />}
                sx={{ textTransform: "none", borderRadius: "12px" }}
              >
                Voltar
              </Button>
            </Stack>

            {!isAdmin ? (
              <Paper
                sx={{
                  p: 3,
                  borderRadius: "16px",
                  border: "1px solid",
                  borderColor: "divider",
                  boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
                }}
                elevation={0}
              >
                <Typography variant="h5" fontWeight={600} mb={1}>
                  Acesso restrito
                </Typography>
                <Typography color="text.secondary">
                  Somente administradores podem criar usuários.
                </Typography>
              </Paper>
            ) : (
              <Paper
                sx={{
                  p: { xs: 2, md: 3 },
                  borderRadius: "16px",
                  border: "1px solid",
                  borderColor: "divider",
                  boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
                }}
                elevation={0}
              >
                <Stack spacing={3}>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        md: "repeat(2, minmax(0, 1fr))",
                      },
                      gap: 2,
                    }}
                  >
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
                            oabNumber:
                              next === "advogado" ? form.oabNumber : "",
                            areas: next === "advogado" ? form.areas : [],
                            position:
                              next === "funcionario" ? form.position : "",
                          };
                          setForm(nextForm);
                          setFormErrors(getValidationErrors(nextForm));
                        }}
                      >
                        <MenuItem value="admin">Administrador</MenuItem>
                        <MenuItem value="advogado">Advogado</MenuItem>
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
                      type="email"
                      value={form.email}
                      onChange={(e) => updateForm("email", e.target.value)}
                      onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                      error={!!getFieldError("email")}
                      helperText={getFieldError("email")}
                      fullWidth
                    />

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

                    <TextField
                      label="Senha"
                      type="password"
                      value={form.password}
                      onChange={(e) => updateForm("password", e.target.value)}
                      onBlur={() =>
                        setTouched((p) => ({ ...p, password: true }))
                      }
                      error={
                        !!getFieldError("password") ||
                        !!getFieldError("confirmPassword")
                      }
                      helperText={getFieldError("password")}
                      autoComplete="new-password"
                      fullWidth
                    />
                    <TextField
                      label="Telefone"
                      value={form.phone}
                      onChange={(e) => updateForm("phone", e.target.value)}
                      fullWidth
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
                      autoComplete="new-password"
                      fullWidth
                    />
                  </Box>

                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "stretch", sm: "center" }}
                    gap={1.5}
                  >
                    <Stack direction={{ xs: "column", sm: "row" }} gap={1}>
                      <Button
                        component={Link}
                        href="/admin/users"
                        color="inherit"
                        disabled={loading}
                        sx={{ textTransform: "none" }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={loading || !canSubmit}
                        sx={{ textTransform: "none", borderRadius: "12px" }}
                      >
                        {loading ? "Criando..." : "Criar usuário"}
                      </Button>
                    </Stack>
                  </Stack>
                </Stack>
              </Paper>
            )}
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
