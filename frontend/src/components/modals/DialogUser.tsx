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
import type { CreateUserPayload, UpdateUserPayload } from "@/schemas/UserSchema";
import InputBasico from "@/components/InputBasico";
import type { UserType, RoleType, CategoriaType } from "@/@core/types";
import { getCategorias } from "@/api/ApiCategorias";
import { useState } from "react";

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
  const isEdit     = mode === "edit";
  const isView     = mode === "view";
  const isReadOnly = isView;

  const [categorias, setCategorias] = useState<CategoriaType[]>([]);

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

  const role = useWatch({ control: methods.control, name: "role" }) as RoleType | undefined;
  const especialidades = useWatch({ control: methods.control, name: "advogado.especialidade" }) as string[] | undefined;

  useEffect(() => {
    getCategorias().then(setCategorias).catch(() => {});
  }, []);

  useEffect(() => {
    if (open) reset(buildDefaultValues(user, isEdit));
  }, [open, user, isEdit, reset]);

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
    mode === "create" ? "Novo usuário" :
    mode === "edit"   ? "Editar usuário" :
                        "Visualizar usuário";

  return (
    <FormProvider {...methods}>
      <BaseModal
        open={open}
        onClose={() => { if (!submitting) onClose(); }}
        title={title}
        confirmText={submitting ? "Salvando..." : isEdit ? "Salvar" : "Criar"}
        cancelText={isView ? "Fechar" : "Cancelar"}
        confirmDisabled={submitting || (!isView && !isValid)}
        onSubmit={isView ? onClose : handleSubmit(onSubmit)}
        maxWidth="md"
      >
        <Stack spacing={2.5}>

          <FormControl fullWidth disabled={isReadOnly}>
            <InputLabel shrink>Perfil</InputLabel>
            <Select
              label="Perfil"
              value={role ?? ""}
              onChange={(e) => setValue("role", e.target.value as RoleType)}
            >
              <MenuItem value="admin">Administrador</MenuItem>
              <MenuItem value="advogado">Advogado</MenuItem>
              <MenuItem value="funcionario">Funcionário</MenuItem>
            </Select>
          </FormControl>

          <InputBasico field="name"  label="Nome"   disabled={isReadOnly} />
          <InputBasico field="email" label="E-mail" type="email" disabled={isReadOnly} />

          {!isEdit && !isView && (
            <InputBasico field="cpf" label="CPF" maxLength={11} disabled={isReadOnly} />
          )}
          {(isEdit || isView) && user?.cpf && (
            <InputBasico field="cpf" label="CPF" disabled value={user.cpf} />
          )}

          {role === "funcionario" && (
            <>
              <InputBasico field="funcionario.celular"        label="Celular"           maxLength={20} disabled={isReadOnly} />
              <InputBasico field="funcionario.data_nascimento" label="Data de nascimento" type="date"   disabled={isReadOnly} />
              <InputBasico field="funcionario.resumo_pessoal"  label="Resumo pessoal"    multiline rows={3} disabled={isReadOnly} />
            </>
          )}

          {role === "advogado" && (
            <>
              <InputBasico field="advogado.celular"         label="Celular"           maxLength={20} disabled={isReadOnly} />
              <InputBasico field="advogado.data_nascimento" label="Data de nascimento" type="date"   disabled={isReadOnly} />
              <Stack direction="row" spacing={1.5}>
                <InputBasico field="advogado.oab_numero" label="OAB Número" maxLength={20} disabled={isReadOnly} />
                <InputBasico field="advogado.oab_uf"     label="UF"         maxLength={2}  disabled={isReadOnly} sx={{ width: 100 }} />
              </Stack>
              <Autocomplete
                multiple
                freeSolo
                options={categorias.map((c) => c.nome)}
                disabled={isReadOnly}
                value={especialidades ?? []}
                onChange={(_, value) =>
                  setValue("advogado.especialidade" as never, value.map(String).filter(Boolean) as never)
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Especialidades"
                    placeholder="Adicionar especialidade..."
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                )}
              />
              <InputBasico field="advogado.resumo_pessoal" label="Resumo pessoal" multiline rows={3} disabled={isReadOnly} />
            </>
          )}

          {!isEdit && !isView && (
            <>
              <InputBasico field="password"              label="Senha"           type="password" autoComplete="new-password" />
              <InputBasico field="password_confirmation" label="Confirmar senha" type="password" autoComplete="new-password" />
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
    name:  user?.name  ?? "",
    email: user?.email ?? "",
    cpf:   user?.cpf   ?? "",
    ...(isEdit ? {} : { password: "", password_confirmation: "" }),

    funcionario: role === "funcionario" ? {
      celular:          user?.funcionario?.celular          ?? "",
      data_nascimento:  user?.funcionario?.data_nascimento  ?? "",
      resumo_pessoal:   user?.funcionario?.resumo_pessoal   ?? "",
    } : undefined,

    advogado: role === "advogado" ? {
      celular:          user?.advogado?.celular          ?? "",
      oab_numero:       user?.advogado?.oab_numero       ?? "",
      oab_uf:           user?.advogado?.oab_uf           ?? "",
      especialidade:    Array.isArray(user?.advogado?.especialidade)
                          ? user.advogado.especialidade
                          : [],
      resumo_pessoal:   user?.advogado?.resumo_pessoal   ?? "",
    } : undefined,
  };
}
