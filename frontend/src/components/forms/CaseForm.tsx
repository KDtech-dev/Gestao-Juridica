"use client";

import { Box, MenuItem, TextField } from "@mui/material";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { CasePayload } from "@/services/caseService";
import { Lawyer, listLawyers } from "@/services/lawyerService";
import { teamSpecialties } from "@/data/team";
import { ClienteType } from "../../@core/types";

export type CaseFormValues = {
  title: string;
  processNumber: string;
  clientId: string;
  practiceArea: string;
  assignedLawyerId: string;
  nextHearing: string;
  description: string;
};

type Props = {
  id: string;
  initialValues?: Partial<CaseFormValues>;
  disabled?: boolean;
  onSubmit: (payload: CasePayload) => void;
};

const defaultValues: CaseFormValues = {
  title: "",
  processNumber: "",
  clientId: "",
  practiceArea: "",
  assignedLawyerId: "",
  nextHearing: "",
  description: "",
};


export function CaseForm({
  id,
  initialValues,
  disabled = false,
  onSubmit,
}: Props) {
  const resolvedInitialValues = useMemo(
    () => ({ ...defaultValues, ...initialValues }),
    [initialValues],
  );
  const [values, setValues] = useState<CaseFormValues>(resolvedInitialValues);
  const [submitted, setSubmitted] = useState(false);
  const [clients, setClients] = useState<ClienteType[]>([]);
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

 
  function updateValue<K extends keyof CaseFormValues>(
    name: K,
    value: CaseFormValues[K],
  ) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);

    if (!values.title.trim() || !values.clientId) return;

    onSubmit({
      title: values.title.trim(),
      processNumber: values.processNumber.trim(),
      clientId: values.clientId,
      practiceArea: values.practiceArea,
      assignedLawyerId: values.assignedLawyerId || undefined,
      nextHearing: values.nextHearing.trim(),
      description: values.description.trim(),
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
          label="Título do Caso"
          value={values.title}
          error={submitted && !values.title.trim()}
          helperText={
            submitted && !values.title.trim() ? "Informe o título." : undefined
          }
          onChange={(event) => updateValue("title", event.target.value)}
        />
      </Box>

      <TextField
        fullWidth
        disabled={disabled}
        label="Número do Processo"
        value={values.processNumber}
        onChange={(event) => updateValue("processNumber", event.target.value)}
      />

      <TextField
        select
        fullWidth
        required
        disabled={disabled || loadingOptions}
        label="Cliente"
        value={values.clientId}
        error={submitted && !values.clientId}
        helperText={
          submitted && !values.clientId
            ? "Selecione um cliente."
            : loadingOptions
              ? "Carregando clientes..."
              : undefined
        }
        onChange={(event) => updateValue("clientId", event.target.value)}
      >
        <MenuItem value="">Selecione</MenuItem>
        {clients.map((client) => (
          <MenuItem key={client.id} value={String(client.id)}>
            {client.name}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        fullWidth
        disabled={disabled}
        label="Área do Direito"
        value={values.practiceArea}
        onChange={(event) => updateValue("practiceArea", event.target.value)}
      >
        <MenuItem value="">Selecione</MenuItem>
        {teamSpecialties.map((specialty) => (
          <MenuItem key={specialty} value={specialty}>
            {specialty}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        fullWidth
        disabled={disabled || loadingOptions}
        label="Advogado"
        value={values.assignedLawyerId}
        helperText={loadingOptions ? "Carregando advogados..." : undefined}
        onChange={(event) =>
          updateValue("assignedLawyerId", event.target.value)
        }
      >
        <MenuItem value="">Selecione</MenuItem>
        {lawyers.map((lawyer) => (
          <MenuItem key={lawyer.id} value={String(lawyer.id)}>
            {lawyer.name}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        fullWidth
        disabled={disabled}
        label="Próxima Audiência"
        placeholder="Sem audiência definida"
        value={values.nextHearing}
        onChange={(event) => updateValue("nextHearing", event.target.value)}
      />

      <Box sx={{ gridColumn: "1 / -1" }}>
        <TextField
          multiline
          rows={4}
          fullWidth
          disabled={disabled}
          label="Descrição"
          value={values.description}
          onChange={(event) => updateValue("description", event.target.value)}
        />
      </Box>
    </Box>
  );
}
