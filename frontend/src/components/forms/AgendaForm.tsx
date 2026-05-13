"use client";

import {
  Box,
  Button,
  Checkbox,
  Chip,
  ListItemText,
  MenuItem,
  TextField,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  AppointmentPayload,
  AppointmentStatus,
  AppointmentType,
} from "@/services/appointmentService";
import { Lawyer, listLawyers } from "@/services/lawyerService";

export type AppointmentFormValues = {
  title: string;
  type: AppointmentType;
  clientName: string;
  location: string;
  videoUrl: string;
  startsAt: Date | null;
  status: AppointmentStatus;
  description: string;
  lawyerIds: string[];
};

type Props = {
  id: string;
  initialValues?: Partial<AppointmentFormValues>;
  disabled?: boolean;
  onSubmit: (payload: AppointmentPayload) => void;
};

const defaultValues: AppointmentFormValues = {
  title: "",
  type: "presencial",
  clientName: "",
  location: "",
  videoUrl: "",
  startsAt: new Date(),
  status: "Pendente",
  description: "",
  lawyerIds: [],
};

export function AppointmentForm({
  id,
  initialValues,
  disabled = false,
  onSubmit,
}: Props) {
  const resolvedInitialValues = useMemo(
    () => ({ ...defaultValues, ...initialValues }),
    [initialValues],
  );
  const [values, setValues] = useState<AppointmentFormValues>(
    resolvedInitialValues,
  );
  const [submitted, setSubmitted] = useState(false);
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [loadingLawyers, setLoadingLawyers] = useState(false);
  const type = values.type;

  useEffect(() => {
    let active = true;

    async function loadLawyers() {
      try {
        setLoadingLawyers(true);
        const data = await listLawyers();
        if (active) setLawyers(data);
      } catch {
        if (active) setLawyers([]);
      } finally {
        if (active) setLoadingLawyers(false);
      }
    }

    void loadLawyers();

    return () => {
      active = false;
    };
  }, []);

  function updateValue<K extends keyof AppointmentFormValues>(
    name: K,
    value: AppointmentFormValues[K],
  ) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);

    const title = values.title.trim();
    const startsAt = values.startsAt;
    const location = values.location.trim();
    const videoUrl = values.videoUrl.trim();

    if (!title || !startsAt) return;
    if (values.type === "presencial" && !location) return;
    if (values.type === "online" && !videoUrl) return;

    onSubmit({
      title,
      type: values.type,
      clientName: values.clientName.trim(),
      location,
      videoUrl,
      startsAt: startsAt.toISOString(),
      status: values.status,
      description: values.description.trim(),
      lawyerIds: values.lawyerIds,
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
      <Box sx={{ gridColumn: "1 / -1", display: "flex", gap: 1 }}>
        <Button
          variant={type === "presencial" ? "contained" : "outlined"}
          disabled={disabled}
          onClick={() => updateValue("type", "presencial")}
        >
          Presencial
        </Button>

        <Button
          variant={type === "online" ? "contained" : "outlined"}
          disabled={disabled}
          onClick={() => updateValue("type", "online")}
        >
          Online
        </Button>
      </Box>
      <Box sx={{ gridColumn: "1 / -1" }}>
        <TextField
          fullWidth
          required
          disabled={disabled}
          label="Título do Compromisso"
          value={values.title}
          error={submitted && !values.title.trim()}
          helperText={
            submitted && !values.title.trim() ? "Informe o título." : undefined
          }
          onChange={(event) => updateValue("title", event.target.value)}
        />
      </Box>

      <DateTimePicker
        label="Data do Compromisso"
        name="startsAt"
        sx={{ width: "100%" }}
        format="dd/MM/yyyy HH:mm"
        value={values.startsAt}
        disabled={disabled}
        ampm={false}
        onChange={(value) => updateValue("startsAt", value)}
        slotProps={{
          toolbar: {
            hidden: false,
          },
          textField: {
            fullWidth: true,
            required: true,
            error: submitted && !values.startsAt,
            helperText:
              submitted && !values.startsAt
                ? "Informe data e horário."
                : undefined,
          },
        }}
      />
      <TextField
        select
        fullWidth
        disabled={disabled}
        label="Status"
        value={values.status}
        onChange={(event) =>
          updateValue("status", event.target.value as AppointmentStatus)
        }
      >
        <MenuItem value="Pendente">Pendente</MenuItem>
        <MenuItem value="Confirmado">Confirmado</MenuItem>
      </TextField>

      {type === "presencial" && (
        <TextField
          fullWidth
          required
          disabled={disabled}
          label="Local"
          value={values.location}
          error={submitted && !values.location.trim()}
          helperText={
            submitted && !values.location.trim()
              ? "Informe o local."
              : undefined
          }
          onChange={(event) => updateValue("location", event.target.value)}
        />
      )}
      {type === "online" && (
        <TextField
          fullWidth
          required
          disabled={disabled}
          label="Link da Videoconferência"
          value={values.videoUrl}
          error={submitted && !values.videoUrl.trim()}
          helperText={
            submitted && !values.videoUrl.trim()
              ? "Informe o link da videoconferência."
              : undefined
          }
          onChange={(event) => updateValue("videoUrl", event.target.value)}
        />
      )}
      <Box sx={{ gridColumn: "1 / -1" }}>
        <TextField
          fullWidth
          disabled={disabled}
          label="Cliente"
          value={values.clientName}
          onChange={(event) => updateValue("clientName", event.target.value)}
        />
      </Box>
      <Box sx={{ gridColumn: "1 / -1" }}>
        <TextField
          select
          fullWidth
          disabled={disabled || loadingLawyers}
          label="Advogados associados"
          value={values.lawyerIds}
          SelectProps={{
            multiple: true,
            renderValue: (selected) => {
              const selectedIds = selected as string[];
              const selectedLawyers = lawyers.filter((lawyer) =>
                selectedIds.includes(String(lawyer.id)),
              );

              if (selectedLawyers.length === 0) return "Nenhum advogado";

              return (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selectedLawyers.map((lawyer) => (
                    <Chip key={lawyer.id} label={lawyer.name} size="small" />
                  ))}
                </Box>
              );
            },
          }}
          helperText={
            loadingLawyers
              ? "Carregando advogados..."
              : "Advogados vinculados ao compromisso."
          }
          onChange={(event) => {
            const value = event.target.value as string[] | string;
            updateValue(
              "lawyerIds",
              typeof value === "string"
                ? value.split(",")
                : value.map((lawyerId) => String(lawyerId)),
            );
          }}
        >
          {lawyers.map((lawyer) => {
            const lawyerId = String(lawyer.id);

            return (
              <MenuItem key={lawyer.id} value={lawyerId}>
                <Checkbox checked={values.lawyerIds.includes(lawyerId)} />
                <ListItemText
                  primary={lawyer.name}
                  secondary={
                    lawyer.oabNumber ? `OAB ${lawyer.oabNumber}` : lawyer.email
                  }
                />
              </MenuItem>
            );
          })}
        </TextField>
      </Box>
      <Box sx={{ gridColumn: "1 / -1" }}>
        <TextField
          multiline
          rows={4}
          fullWidth
          disabled={disabled}
          label="Descrição/Pauta"
          value={values.description}
          onChange={(event) => updateValue("description", event.target.value)}
        />
      </Box>
    </Box>
  );
}
