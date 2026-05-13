"use client";

import { Box, MenuItem, TextField } from "@mui/material";
import { FormEvent, useMemo, useState } from "react";
import { Client } from "@/services/clientService";

export type ClientFormValues = {
  name: string;
  cpfCnpj: string;
  email: string;
  phone: string;
  contactName: string;
  status: "Ativo" | "Inativo" | "Prospect";
  address: string;
  notes: string;
};

type Props = {
  id: string;
  initialValues?: Partial<ClientFormValues>;
  disabled?: boolean;
  onSubmit: (payload: Partial<Client>) => void;
};

const defaultValues: ClientFormValues = {
  name: "",
  cpfCnpj: "",
  email: "",
  phone: "",
  contactName: "",
  status: "Ativo",
  address: "",
  notes: "",
};

export function ClientForm({
  id,
  initialValues,
  disabled = false,
  onSubmit,
}: Props) {
  const resolvedInitialValues = useMemo(
    () => ({ ...defaultValues, ...initialValues }),
    [initialValues],
  );
  const [values, setValues] = useState<ClientFormValues>(resolvedInitialValues);
  const [submitted, setSubmitted] = useState(false);

  function updateValue<K extends keyof ClientFormValues>(
    name: K,
    value: ClientFormValues[K],
  ) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);

    if (!values.name.trim() || !values.cpfCnpj.trim() || !values.email.trim()) {
      return;
    }

    onSubmit({
      name: values.name.trim(),
      cpfCnpj: values.cpfCnpj.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      contactName: values.contactName.trim(),
      status: values.status,
      address: values.address.trim(),
      notes: values.notes.trim(),
    });
  }

  return (
    <Box
      id={id}
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
        },
        gap: 2,
      }}
    >
      <Box sx={{ gridColumn: "1 / -1" }}>
        <TextField
          fullWidth
          required
          disabled={disabled}
          label="Nome / Razão Social"
          value={values.name}
          error={submitted && !values.name.trim()}
          helperText={
            submitted && !values.name.trim() ? "Informe o nome." : undefined
          }
          onChange={(event) => updateValue("name", event.target.value)}
        />
      </Box>

      <TextField
        fullWidth
        required
        disabled={disabled}
        label="CPF / CNPJ"
        value={values.cpfCnpj}
        error={submitted && !values.cpfCnpj.trim()}
        helperText={
          submitted && !values.cpfCnpj.trim()
            ? "Informe CPF ou CNPJ."
            : undefined
        }
        onChange={(event) => updateValue("cpfCnpj", event.target.value)}
      />
      <TextField
        fullWidth
        required
        disabled={disabled}
        label="E-mail"
        value={values.email}
        error={submitted && !values.email.trim()}
        helperText={
          submitted && !values.email.trim() ? "Informe o e-mail." : undefined
        }
        onChange={(event) => updateValue("email", event.target.value)}
      />
      <TextField
        fullWidth
        disabled={disabled}
        label="Telefone"
        value={values.phone}
        onChange={(event) => updateValue("phone", event.target.value)}
      />

      <TextField
        fullWidth
        disabled={disabled}
        label="Pessoa de Contato"
        value={values.contactName}
        onChange={(event) => updateValue("contactName", event.target.value)}
      />

      <TextField
        select
        fullWidth
        disabled={disabled}
        label="Status"
        value={values.status}
        onChange={(event) =>
          updateValue(
            "status",
            event.target.value as ClientFormValues["status"],
          )
        }
      >
        <MenuItem value="Ativo">Ativo</MenuItem>
        <MenuItem value="Inativo">Inativo</MenuItem>
        <MenuItem value="Prospect">Prospect</MenuItem>
      </TextField>

      <Box sx={{ gridColumn: "1 / -1" }}>
        <TextField
          fullWidth
          disabled={disabled}
          label="Endereço Completo"
          value={values.address}
          onChange={(event) => updateValue("address", event.target.value)}
        />
      </Box>

      <Box sx={{ gridColumn: "1 / -1" }}>
        <TextField
          multiline
          rows={3}
          fullWidth
          disabled={disabled}
          label="Observações"
          value={values.notes}
          onChange={(event) => updateValue("notes", event.target.value)}
        />
      </Box>
    </Box>
  );
}
