"use client";

import { useEffect } from "react";
import { useForm, FormProvider, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Autocomplete,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import { BaseModal } from "@/components/modals/BaseModal";
import {
  createUserSchema,
  UF_SIGLAS,
  updateUserSchema,
} from "@/schemas/UserSchema";
import type {
  CreateUserPayload,
  UpdateUserPayload,
} from "@/schemas/UserSchema";
import InputBasico from "@/components/InputBasico";
import type { UserType, RoleType, CategoriaType } from "@/@core/types";
import { getCategorias } from "@/api/ApiCategorias";
import { useState } from "react";
import { useTranslations } from "next-intl";
import PasswordVisibilityAdornment from "@/components/PasswordVisibilityAdornment";
import { Controller } from "react-hook-form";
import { formatCpf, formatTelefone } from "@/@core/format";
import { categoriaNomeParaChave } from "@/constants/categorias";
import { formatToastErrorMessage, toast } from "@/utils/toast";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserPayload | UpdateUserPayload) => Promise<void>;
  submitting: boolean;
  mode: "create" | "edit" | "view";
  user?: UserType | null;
};

export default function DialogUser({
  open,
  onClose,
  onSubmit,
  submitting,
  mode,
  user,
}: Props) {
  const t = useTranslations("internal.users.dialog");
  const tValidation = useTranslations("validation");
  const tPracticeAreas = useTranslations("internal.profile.practiceAreas");
  const isEdit = mode === "edit";
  const isView = mode === "view";
  const isReadOnly = isView;

  const [categorias, setCategorias] = useState<CategoriaType[]>([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);
  const [visiblePasswords, setVisiblePasswords] = useState({
    password: false,
    confirmation: false,
  });
  const methods = useForm<CreateUserPayload | UpdateUserPayload>({
    resolver: zodResolver(
      isEdit ? updateUserSchema(tValidation) : createUserSchema(tValidation),
    ),
    defaultValues: buildDefaultValues(user, isEdit),
    mode: "onChange",
    reValidateMode: "onChange",
  });
  const { handleSubmit, reset, setValue } = methods;

  const role = useWatch({ control: methods.control, name: "role" }) as
    | RoleType
    | undefined;

  useEffect(() => {
    const loadCategorias = async () => {
      try {
        const response = await getCategorias();
        setCategorias(response.data);
      } catch (err) {

        toast.error(
          formatToastErrorMessage(
            err,
            t("toast.loadCategoriesError"),
          ),
        );
      } finally {
        setLoadingCategorias(false);
      }
    };

    loadCategorias();
  }, [t]);

  useEffect(() => {
    if (open) reset(buildDefaultValues(user, isEdit));
  }, [open, user, isEdit, reset]);

  const togglePasswordVisibility = (field: keyof typeof visiblePasswords) => {
    setVisiblePasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  useEffect(() => {
    if (role !== "advogado") {
      setValue("advogado", {
        celular: "",
        data_nascimento: "",
        resumo_pessoal: "",
        oab_numero: "",
        oab_uf: "",
        categorias: [],
      });
    }

    if (role !== "funcionario") {
      setValue("funcionario", {
        celular: "",
        data_nascimento: "",
        resumo_pessoal: "",
      });
    }
  }, [role, setValue]);

  const title =
    mode === "create"
      ? t("title.create")
      : mode === "edit"
        ? t("title.edit")
        : t("title.view");

  const handleClose = () => {
    if (submitting) return;
    setVisiblePasswords({ password: false, confirmation: false });
    onClose();
  };
  return (
    <FormProvider {...methods}>
      <BaseModal
        open={open}
        onClose={handleClose}
        title={title}
        confirmText={
          submitting
            ? t("actions.saving")
            : isEdit
              ? t("actions.save")
              : t("actions.create")
        }
        cancelText={isView ? t("actions.close") : t("actions.cancel")}
        confirmDisabled={submitting}
        onSubmit={isView ? handleClose : handleSubmit(onSubmit)}
        maxWidth="md"
      >
        <Stack spacing={2.5}>
          <FormControl fullWidth disabled={isReadOnly}>
            <InputLabel shrink>{t("fields.role")}</InputLabel>
            <Select
              label={t("fields.role")}
              value={role ?? ""}
              onChange={(e) => setValue("role", e.target.value as RoleType)}
            >
              <MenuItem value="admin">{t("roles.admin")}</MenuItem>
              <MenuItem value="advogado">{t("roles.advogado")}</MenuItem>
              <MenuItem value="funcionario">{t("roles.funcionario")}</MenuItem>
            </Select>
          </FormControl>

          <InputBasico
            field="name"
            label={t("fields.name")}
            placeholder={t("fields.namePlaceholder")}
            disabled={isReadOnly}
          />
          <InputBasico
            field="email"
            label={t("fields.email")}
            type="email"
            placeholder={t("fields.emailPlaceholder")}
            disabled={isReadOnly}
          />

          {!isEdit && !isView && (
            <Controller
              name="cpf"
              control={methods.control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  fullWidth
                  label={t("fields.cpf")}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  inputProps={{ maxLength: 14 }}
                  InputLabelProps={{ shrink: true }}
                  onChange={(e) => field.onChange(formatCpf(e.target.value))}
                />
              )}
            />
          )}

          {role === "funcionario" && (
            <>
              <Controller
                name="funcionario.celular"
                control={methods.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t("fields.mobile")}
                    disabled={isReadOnly}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    inputProps={{ maxLength: 15 }}
                    onChange={(e) =>
                      field.onChange(formatTelefone(e.target.value))
                    }
                  />
                )}
              />
              <InputBasico
                field="funcionario.data_nascimento"
                label={t("fields.birthDate")}
                type="date"
                disabled={isReadOnly}
              />
              <InputBasico
                field="funcionario.resumo_pessoal"
                label={t("fields.personalSummary")}
                multiline
                rows={3}
                disabled={isReadOnly}
              />
            </>
          )}

          {role === "advogado" && (
            <>
              <Controller
                name="advogado.celular"
                control={methods.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ""}
                    fullWidth
                    label={t("fields.mobile")}
                    placeholder={t("fields.mobilePlaceholder")}
                    disabled={isReadOnly}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    inputProps={{ maxLength: 15 }}
                    onChange={(e) =>
                      field.onChange(formatTelefone(e.target.value))
                    }
                  />
                )}
              />
              <InputBasico
                field="advogado.data_nascimento"
                label={t("fields.birthDate")}
                placeholder={t("fields.birthDatePlaceholder")}
                type="date"
                disabled={isReadOnly}
              />
              <Stack
                direction="row"
                spacing={1.5}
                flexWrap="wrap"
                alignItems="stretch"
              >
                <Controller
                  name="advogado.oab_numero"
                  control={methods.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={t("fields.oabNumber")}
                      placeholder={t("fields.oabNumberPlaceholder")}
                      disabled={isReadOnly}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      inputProps={{ maxLength: 20 }}
                      sx={{ flex: 1, minWidth: 150 }}
                    />
                  )}
                />

                <Controller
                  name="advogado.oab_uf"
                  control={methods.control}
                  render={({ field, fieldState }) => (
                    <FormControl
                      sx={{ minWidth: 120, flexShrink: 0 }}
                      error={!!fieldState.error}
                      disabled={isReadOnly}
                    >
                      <InputLabel id="oab-uf-label">
                        {t("fields.oabUf")}
                      </InputLabel>
                      <Select
                        {...field}
                        labelId="oab-uf-label"
                        label={t("fields.oabUf")}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value)}
                      >
                        <MenuItem value="">
                          <em>{t("fields.oabUfPlaceholder")}</em>
                        </MenuItem>
                        {UF_SIGLAS.map((uf) => (
                          <MenuItem key={uf} value={uf}>
                            {uf}
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText sx={{ minHeight: "1.5rem" }}>
                        {fieldState.error?.message || "\u00A0"}
                      </FormHelperText>
                    </FormControl>
                  )}
                />
              </Stack>
              <FormControl fullWidth>
                <Controller
                  name="advogado.categorias"
                  control={methods.control}
                  render={({ field }) => {
                    const selectedIds: (string | number)[] = Array.isArray(
                      field.value,
                    )
                      ? field.value
                      : [];
                    const selectedCategorias = categorias.filter((c) =>
                      selectedIds.includes(c.id),
                    );

                    return (
                      <Autocomplete
                        multiple
                        options={categorias}
                        getOptionLabel={(option) => {
                          if (typeof option === "string") return option;
                          const chave = categoriaNomeParaChave[option.nome];
                          return chave ? tPracticeAreas(chave) : option.nome;
                        }}
                        isOptionEqualToValue={(option, value) =>
                          option.id ===
                          (typeof value === "string" ? value : value.id)
                        }
                        value={selectedCategorias}
                        onChange={(_, value) => {
                          const ids = value.map((c) =>
                            typeof c === "string" ? c : c.id,
                          );
                          field.onChange(ids);
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label={t("fields.specialties")}
                            placeholder={
                              selectedCategorias.length
                                ? ""
                                : t("fields.specialtiesPlaceholder")
                            }
                            error={false}
                            helperText={undefined}
                            InputLabelProps={{ shrink: true }}
                            InputProps={{
                              ...params.InputProps,
                            }}
                          />
                        )}
                      />
                    );
                  }}
                />
              </FormControl>
              <InputBasico
                field="advogado.resumo_pessoal"
                label={t("fields.personalSummary")}
                placeholder={t("fields.personalSummaryPlaceholder")}
                multiline
                rows={3}
                disabled={isReadOnly}
              />
            </>
          )}

          {!isEdit && !isView && (
            <>
              <InputBasico
                field="password"
                label={t("fields.password")}
                type={visiblePasswords.password ? "text" : "password"}
                autoComplete="new-password"
                InputProps={{
                  endAdornment: (
                    <PasswordVisibilityAdornment
                      visible={visiblePasswords.password}
                      onToggle={() => togglePasswordVisibility("password")}
                      disabled={submitting}
                    />
                  ),
                }}
              />
              <InputBasico
                field="password_confirmation"
                label={t("fields.confirmPassword")}
                type={visiblePasswords.confirmation ? "text" : "password"}
                autoComplete="new-password"
                InputProps={{
                  endAdornment: (
                    <PasswordVisibilityAdornment
                      visible={visiblePasswords.confirmation}
                      onToggle={() => togglePasswordVisibility("confirmation")}
                      disabled={submitting}
                    />
                  ),
                }}
              />
            </>
          )}
        </Stack>
      </BaseModal>
    </FormProvider>
  );
}

function buildDefaultValues(
  user: UserType | null | undefined,
  isEdit: boolean,
): Partial<CreateUserPayload | UpdateUserPayload> {
  const role = (user?.roles?.[0] ?? "admin") as RoleType;

  return {
    role,
    name: user?.name ?? "",
    email: user?.email ?? "",
    cpf: user?.cpf ?? "",
    ...(isEdit ? {} : { password: "", password_confirmation: "" }),

    funcionario:
      role === "funcionario"
        ? {
          celular: user?.funcionario?.celular ?? "",
          data_nascimento: user?.funcionario?.data_nascimento ?? "",
          resumo_pessoal: user?.funcionario?.resumo_pessoal ?? "",
        }
        : undefined,

    advogado:
      role === "advogado"
        ? {
          celular: user?.advogado?.celular ?? "",
          oab_numero: user?.advogado?.oab_numero ?? "",
          oab_uf: user?.advogado?.oab_uf ?? "",
          categorias: Array.isArray(user?.advogado?.categorias)
            ? user.advogado.categorias.map((c) =>
              typeof c === "object" ? c.id : c,
            )
            : [],
          resumo_pessoal: user?.advogado?.resumo_pessoal ?? "",
        }
        : undefined,
  };
}
