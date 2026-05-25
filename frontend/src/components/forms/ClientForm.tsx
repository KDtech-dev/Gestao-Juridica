"use client";

import { Box, TextField } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClienteSchema, CreateClientePayload } from "@/schemas/ClienteSchema";
import { useEffect } from "react";
import { ClienteType } from "@/components/publications/types";

type Props = {
  id: string;
  initialValues?: Partial<ClienteType>;
  disabled?: boolean;
  onSubmit: (data: CreateClientePayload) => void;
};

export function ClientForm({ id, initialValues, disabled = false, onSubmit }: Props) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateClientePayload>({
    resolver: zodResolver(createClienteSchema),
    defaultValues: {
      name:            initialValues?.name            ?? "",
      cpf_cnpj:        initialValues?.cpf_cnpj        ?? "",
      email:           initialValues?.email           ?? "",
      telefone:        initialValues?.telefone        ?? "",
      data_nascimento: initialValues?.data_nascimento ?? "",
    },
  });

  useEffect(() => {
    if (initialValues) {
      reset({
        name:            initialValues.name            ?? "",
        cpf_cnpj:        initialValues.cpf_cnpj        ?? "",
        email:           initialValues.email           ?? "",
        telefone:        initialValues.telefone        ?? "",
        data_nascimento: initialValues.data_nascimento ?? "",
      });
    }
  }, [initialValues, reset]);

  return (
    <Box
      id={id}
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
        gap: 2,
      }}
    >
      <Box sx={{ gridColumn: "1 / -1" }}>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              required
              disabled={disabled}
              label="Nome / Razão Social"
              error={!!errors.name}
              helperText={errors.name?.message}
            />
          )}
        />
      </Box>

      <Controller
        name="cpf_cnpj"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            required
            disabled={disabled}
            label="CPF / CNPJ"
            error={!!errors.cpf_cnpj}
            helperText={errors.cpf_cnpj?.message}
          />
        )}
      />

      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            required
            disabled={disabled}
            label="E-mail"
            error={!!errors.email}
            helperText={errors.email?.message}
          />
        )}
      />

      <Controller
        name="telefone"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            disabled={disabled}
            label="Telefone"
            error={!!errors.telefone}
            helperText={errors.telefone?.message}
          />
        )}
      />

      <Controller
        name="data_nascimento"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            disabled={disabled}
            label="Data de Nascimento"
            type="date"
            InputLabelProps={{ shrink: true }}
            error={!!errors.data_nascimento}
            helperText={errors.data_nascimento?.message}
          />
        )}
      />
    </Box>
  );
}