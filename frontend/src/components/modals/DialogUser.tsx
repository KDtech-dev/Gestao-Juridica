"use client";

import { useEffect } from "react";
import { useForm, FormProvider, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Autocomplete,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import { BaseModal } from "@/components/modals/BaseModal";
import { createUserSchema, updateUserSchema } from "@/schemas/UserSchema";
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
  const isEdit = mode === "edit";
  const isView = mode === "view";
  const isReadOnly = isView;

  const [categorias, setCategorias] = useState<CategoriaType[]>([]);
  const [visiblePasswords, setVisiblePasswords] = useState({
    password: false,
    confirmation: false,
  });

  const methods = useForm<CreateUserPayload | UpdateUserPayload>({
    resolver: zodResolver(isEdit ? updateUserSchema : createUserSchema),
    defaultValues: buildDefaultValues(user, isEdit),
  });

  const {
    handleSubmit,
    reset,
    setValue,
    formState: { isValid },
  } = methods;

  const role = useWatch({ control: methods.control, name: "role" }) as
    | RoleType
    | undefined;
  const especialidades = useWatch({
    control: methods.control,
    name: "advogado.especialidade",
  }) as string[] | undefined;

  useEffect(() => {
    getCategorias()
      .then(setCategorias)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (open) reset(buildDefaultValues(user, isEdit));
  }, [open, user, isEdit, reset]);

  const togglePasswordVisibility = (
    field: keyof typeof visiblePasswords,
  ) => {
    setVisiblePasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  useEffect(() => {
    if (role !== "advogado") {
      setValue("advogado.oab_numero" as never, "" as never);
      setValue("advogado.oab_uf" as never, "" as never);
      setValue("advogado.especialidade" as never, [] as never);
    }
    if (role !== "funcionario") {
      setValue("funcionario.celular" as never, "" as never);
      setValue("funcionario.data_nascimento" as never, "" as never);
      setValue("funcionario.resumo_pessoal" as never, "" as never);
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
        confirmDisabled={submitting || (!isView && !isValid)}
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
            disabled={isReadOnly}
          />
          <InputBasico
            field="email"
            label={t("fields.email")}
            type="email"
            disabled={isReadOnly}
          />

          {!isEdit && !isView && (
            <InputBasico
              field="cpf"
              label={t("fields.cpf")}
              maxLength={11}
              disabled={isReadOnly}
            />
          )}
          {(isEdit || isView) && user?.cpf && (
            <InputBasico
              field="cpf"
              label={t("fields.cpf")}
              disabled
              value={user.cpf}
            />
          )}

          {role === "funcionario" && (
            <>
              <InputBasico
                field="funcionario.celular"
                label={t("fields.mobile")}
                maxLength={20}
                disabled={isReadOnly}
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
              <InputBasico
                field="advogado.celular"
                label={t("fields.mobile")}
                maxLength={20}
                disabled={isReadOnly}
              />
              <InputBasico
                field="advogado.data_nascimento"
                label={t("fields.birthDate")}
                type="date"
                disabled={isReadOnly}
              />
              <Stack direction="row" spacing={1.5}>
                <InputBasico
                  field="advogado.oab_numero"
                  label={t("fields.oabNumber")}
                  maxLength={20}
                  disabled={isReadOnly}
                />
                <InputBasico
                  field="advogado.oab_uf"
                  label={t("fields.oabUf")}
                  maxLength={2}
                  disabled={isReadOnly}
                  sx={{ width: 100 }}
                />
              </Stack>
              <Autocomplete
                multiple
                freeSolo
                options={categorias.map((c) => c.nome)}
                disabled={isReadOnly}
                value={especialidades ?? []}
                onChange={(_, value) =>
                  setValue(
                    "advogado.especialidade" as never,
                    value.map(String).filter(Boolean) as never,
                  )
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t("fields.specialties")}
                    placeholder={t("fields.addSpecialty")}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                )}
              />
              <InputBasico
                field="advogado.resumo_pessoal"
                label={t("fields.personalSummary")}
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
  const role = user?.roles?.[0] as RoleType | undefined;

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
            especialidade: Array.isArray(user?.advogado?.especialidade)
              ? user.advogado.especialidade
              : [],
            resumo_pessoal: user?.advogado?.resumo_pessoal ?? "",
          }
        : undefined,
  };
}
