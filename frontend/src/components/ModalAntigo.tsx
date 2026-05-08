"use client";

import {
  Dialog,
  DialogContent,
  Button,
  TextField,
  IconButton,
  MenuItem,
  Typography,
  Box,
  InputAdornment,
} from "@mui/material";
import { Icon } from "@iconify/react";
import { useState } from "react";
import auth from "@/configs/auth";

type Variant =
  | "newCase"
  | "editCase"
  | "newClient"
  | "editClient"
  | "newAppointment"
  | "editAppointment";

interface Props {
  open: boolean;
  onClose: () => void;
  variant: Variant;
  onSubmit?: (variant: Variant) => void;
}

const sharedImage =
  "https://images.unsplash.com/photo-1589829545856-d10d557cf95f";

export function Modal({ open, onClose, variant, onSubmit }: Props) {
  const [type, setType] = useState<"presencial" | "video">("presencial");
  const handleSetTypePresencial = () => setType("presencial");
  const handleSetTypeVideo = () => setType("video");
  const storedUser =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem(auth.userDataKeyName) || "null")
      : null;

  const modalConfig = {
    newCase: {
      image: sharedImage,
      title: "Adicionar Novo Caso",
      button: "Criar Caso",
      fields: (
        <>
          <Box sx={{ gridColumn: "1 / -1" }}>
            <TextField
              fullWidth
              label="Título do Caso *"
              placeholder="Ex: Ação Trabalhista - Empresa X"
            />
          </Box>

          <Box>
            <TextField
              fullWidth
              label="Número do Processo"
              placeholder="0000000-00.0000.0.00.0000"
            />
          </Box>

          <Box>
            <TextField select fullWidth label="Cliente *" defaultValue="">
              <MenuItem value="">Selecione um cliente</MenuItem>
            </TextField>
          </Box>

          <Box>
            <TextField
              select
              fullWidth
              label="Área do Direito *"
              defaultValue=""
            >
              <MenuItem value="">Selecione uma área</MenuItem>
            </TextField>
          </Box>

          <Box>
            <TextField
              select
              fullWidth
              label="Advogado Responsável *"
              defaultValue=""
            >
              <MenuItem value="">Selecione um advogado</MenuItem>
            </TextField>
          </Box>

          <Box>
            <TextField
              select
              fullWidth
              label="Status *"
              defaultValue="Em Andamento"
            >
              <MenuItem value="Em Andamento">Em Andamento</MenuItem>
              <MenuItem value="Pendente">Pendente</MenuItem>
              <MenuItem value="Concluído">Concluído</MenuItem>
            </TextField>
          </Box>

          <Box>
            <TextField
              fullWidth
              label="Data de Abertura *"
              placeholder="dd / mm / aaaa"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Icon icon="mdi:calendar-outline" width={20} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box sx={{ gridColumn: "1 / -1" }}>
            <TextField
              multiline
              rows={4}
              fullWidth
              label="Descrição do Caso"
              placeholder="Descreva os detalhes e objetivos do caso..."
            />
          </Box>
        </>
      ),
    },
    editCase: {
      image: sharedImage,
      title: "Editar Caso",
      button: "Salvar Alterações",
      fields: (
        <>
          <Box sx={{ gridColumn: "1 / -1" }}>
            <TextField
              fullWidth
              label="Título do Caso *"
              placeholder="Ex: Ação Trabalhista - Empresa X"
            />
          </Box>

          <Box>
            <TextField
              fullWidth
              label="Número do Processo"
              placeholder="0000000-00.0000.0.00.0000"
            />
          </Box>

          <Box>
            <TextField select fullWidth label="Cliente *" defaultValue="">
              <MenuItem value="">Selecione um cliente</MenuItem>
            </TextField>
          </Box>

          <Box>
            <TextField
              select
              fullWidth
              label="Área do Direito *"
              defaultValue=""
            >
              <MenuItem value="">Selecione uma área</MenuItem>
            </TextField>
          </Box>

          <Box>
            <TextField
              select
              fullWidth
              label="Advogado Responsável *"
              defaultValue=""
            >
              <MenuItem value="">Selecione um advogado</MenuItem>
            </TextField>
          </Box>

          <Box>
            <TextField
              select
              fullWidth
              label="Status *"
              defaultValue="Em Andamento"
            >
              <MenuItem value="Em Andamento">Em Andamento</MenuItem>
              <MenuItem value="Pendente">Pendente</MenuItem>
              <MenuItem value="Concluído">Concluído</MenuItem>
            </TextField>
          </Box>

          <Box>
            <TextField
              fullWidth
              label="Data de Abertura *"
              placeholder="dd / mm / aaaa"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Icon icon="mdi:calendar-outline" width={20} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box sx={{ gridColumn: "1 / -1" }}>
            <TextField
              multiline
              rows={4}
              fullWidth
              label="Descrição do Caso"
              placeholder="Descreva os detalhes e objetivos do caso..."
            />
          </Box>
        </>
      ),
    },

    newClient: {
      image: sharedImage,
      title: "Adicionar Novo Cliente",
      button: "Adicionar Cliente",
      fields: (
        <>
          <Box sx={{ gridColumn: "1 / -1" }}>
            <TextField fullWidth label="Nome / Razão Social *" />
          </Box>

          <Box>
            <TextField fullWidth label="CPF / CNPJ *" />
          </Box>

          <Box>
            <TextField fullWidth label="E-mail *" />
          </Box>

          <Box>
            <TextField fullWidth label="Telefone *" />
          </Box>

          <Box>
            <TextField fullWidth label="Pessoa de Contato" />
          </Box>

          <Box>
            <TextField select fullWidth label="Status" defaultValue="ativo">
              <MenuItem value="ativo">Ativo</MenuItem>
              <MenuItem value="inativo">Inativo</MenuItem>
            </TextField>
          </Box>

          <Box sx={{ gridColumn: "1 / -1" }}>
            <TextField fullWidth label="Endereço Completo" />
          </Box>

          <Box sx={{ gridColumn: "1 / -1" }}>
            <TextField multiline rows={4} fullWidth label="Observações" />
          </Box>
        </>
      ),
    },
    editClient: {
      image: sharedImage,
      title: "Editar Cliente",
      button: "Salvar Alterações",
      fields: (
        <>
          <Box sx={{ gridColumn: "1 / -1" }}>
            <TextField fullWidth label="Nome / Razão Social *" />
          </Box>

          <Box>
            <TextField fullWidth label="CPF / CNPJ *" />
          </Box>

          <Box>
            <TextField fullWidth label="E-mail *" />
          </Box>

          <Box>
            <TextField fullWidth label="Telefone *" />
          </Box>

          <Box>
            <TextField fullWidth label="Pessoa de Contato" />
          </Box>

          <Box>
            <TextField select fullWidth label="Status" defaultValue="ativo">
              <MenuItem value="ativo">Ativo</MenuItem>
              <MenuItem value="inativo">Inativo</MenuItem>
            </TextField>
          </Box>

          <Box sx={{ gridColumn: "1 / -1" }}>
            <TextField fullWidth label="Endereço Completo" />
          </Box>

          <Box sx={{ gridColumn: "1 / -1" }}>
            <TextField multiline rows={4} fullWidth label="Observações" />
          </Box>
        </>
      ),
    },

    newAppointment: {
      image: sharedImage,
      title: "Novo Compromisso",
      button: "Agendar Compromisso",
      fields: (
        <>
          <Box sx={{ gridColumn: "1 / -1" }}>
            <TextField fullWidth label="Título do Compromisso *" />
          </Box>

          <Box>
            <TextField select fullWidth label="Cliente *" defaultValue="">
              <MenuItem value="">Selecione um cliente</MenuItem>
            </TextField>
          </Box>

          <Box>
            <TextField fullWidth label="Local *" />
          </Box>

          <Box sx={{ gridColumn: "1 / -1" }}>
            <Box display="flex" gap={1.25}>
              <Button
                variant={type === "presencial" ? "contained" : "outlined"}
                onClick={handleSetTypePresencial}
                sx={{ textTransform: "none", borderRadius: 2 }}
              >
                Presencial
              </Button>

              <Button
                variant={type === "video" ? "contained" : "outlined"}
                onClick={handleSetTypeVideo}
                sx={{ textTransform: "none", borderRadius: 2 }}
              >
                Videoconferência
              </Button>
            </Box>
          </Box>

          <Box>
            <TextField
              fullWidth
              label="Data *"
              placeholder="dd / mm / aaaa"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Icon icon="mdi:calendar-outline" width={20} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box>
            <TextField fullWidth label="Horário *" placeholder="00:00" />
          </Box>

          <Box>
            <TextField select fullWidth label="Duração *" defaultValue="60">
              <MenuItem value="15">15 minutos</MenuItem>
              <MenuItem value="30">30 minutos</MenuItem>
              <MenuItem value="60">1 hora</MenuItem>
            </TextField>
          </Box>

          <Box sx={{ gridColumn: "1 / -1" }}>
            <TextField multiline rows={4} fullWidth label="Descrição/Pauta" />
          </Box>

          {/* <Box sx={{ gridColumn: "1 / -1" }}>
                        <FormControlLabel
                            control={<Checkbox />}
                            label="Enviar lembrete 15 minutos antes"
                        />
                    </Box> */}
        </>
      ),
    },
    editAppointment: {
      image: sharedImage,
      title: "Editar Compromisso",
      button: "Salvar Alterações",
      fields: (
        <>
          <Box sx={{ gridColumn: "1 / -1" }}>
            <TextField fullWidth label="Título do Compromisso *" />
          </Box>

          <Box>
            <TextField select fullWidth label="Cliente *" defaultValue="">
              <MenuItem value="">Selecione um cliente</MenuItem>
            </TextField>
          </Box>

          <Box>
            <TextField fullWidth label="Local *" />
          </Box>

          <Box sx={{ gridColumn: "1 / -1" }}>
            <Box display="flex" gap={1.25}>
              <Button
                variant={type === "presencial" ? "contained" : "outlined"}
                onClick={handleSetTypePresencial}
                sx={{ textTransform: "none", borderRadius: 2 }}
              >
                Presencial
              </Button>

              <Button
                variant={type === "video" ? "contained" : "outlined"}
                onClick={handleSetTypeVideo}
                sx={{ textTransform: "none", borderRadius: 2 }}
              >
                Videoconferência
              </Button>
            </Box>
          </Box>

          <Box>
            <TextField
              fullWidth
              label="Data *"
              placeholder="dd / mm / aaaa"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Icon icon="mdi:calendar-outline" width={20} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box>
            <TextField fullWidth label="Horário *" placeholder="00:00" />
          </Box>

          <Box>
            <TextField select fullWidth label="Duração *" defaultValue="60">
              <MenuItem value="15">15 minutos</MenuItem>
              <MenuItem value="30">30 minutos</MenuItem>
              <MenuItem value="60">1 hora</MenuItem>
            </TextField>
          </Box>

          <Box sx={{ gridColumn: "1 / -1" }}>
            <TextField multiline rows={4} fullWidth label="Descrição/Pauta" />
          </Box>
        </>
      ),
    },
  };

  const config = modalConfig[variant];
  const handleSubmit = () => {
    onSubmit?.(variant);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: "hidden",
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Box
          sx={{
            display: "flex",
            minHeight: {
              xs: "md",
            },
          }}
        >
          <Box
            sx={{
              width: { xs: 0, md: "38%" },
              backgroundImage: `url(${config.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              position: "relative",
              display: { xs: "none", md: "block" },
            }}
          >
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, rgba(15,23,42,0.25) 0%, rgba(15,23,42,0.82) 100%)",
              }}
            />

            <Box
              sx={{
                position: "absolute",
                left: 24,
                right: 24,
                bottom: 24,
                color: "#fff",
              }}
            >
              <Typography fontWeight={700} fontSize="1.3rem" mb={0.5}>
                Central jurídica
              </Typography>
              <Typography fontSize="0.95rem" sx={{ opacity: 0.92 }}>
                Gestão jurídica inteligente
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              width: {
                xs: "100%",
                md: "62%",
              },
              display: "flex",
              flexDirection: "column",
              bgcolor: "#fff",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 3,
                borderBottom: "1px solid #d6deea",
              }}
            >
              <Typography fontWeight={700} fontSize="2rem" color="#0f172a">
                {config.title}
              </Typography>

              <IconButton onClick={onClose} sx={{ color: "#94a3b8" }}>
                <Icon icon="mdi:close" width={22} />
              </IconButton>
            </Box>

            <Box sx={{ px: 3, py: 3, flex: 1 }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                  },
                  gap: 2,
                  "& .MuiFormControl-root": {
                    gap: 0.7,
                  },
                  "& .MuiInputLabel-root": {
                    position: "static",
                    transform: "none",
                    color: "#334155",
                    fontWeight: 600,
                    fontSize: "0.98rem",
                    lineHeight: 1.2,
                  },
                  "& .MuiInputLabel-shrink": {
                    transform: "none",
                  },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    bgcolor: "#ffffff",
                    minHeight: 48,
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#b8c6d8",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#94a3b8",
                      borderWidth: "1px",
                    },
                  },
                  "& .MuiInputBase-input, & .MuiSelect-select": {
                    fontSize: "1rem",
                    color: "#1e293b",
                    px: "14px",
                    py: "12px",
                  },
                  "& .MuiInputBase-input::placeholder": {
                    color: "#8b97a8",
                    opacity: 1,
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#bfccdc",
                  },
                  "& .MuiInputAdornment-root": {
                    color: "#64748b",
                  },
                  "& .MuiOutlinedInput-root.MuiInputBase-multiline": {
                    minHeight: 124,
                    alignItems: "flex-start",
                  },
                  "& .MuiInputBase-inputMultiline": {
                    py: "12px",
                  },
                }}
              >
                {config.fields}
              </Box>
            </Box>

            <Box
              sx={{
                px: 3,
                py: 2.5,
                borderTop: "1px solid #d6deea",
                display: "flex",
                justifyContent: "flex-end",
                gap: 1,
              }}
            >
              <Button
                onClick={onClose}
                sx={{
                  textTransform: "none",
                  color: "#334155",
                  fontWeight: 600,
                }}
              >
                Cancelar
              </Button>

              <Button
                variant="contained"
                onClick={handleSubmit}
                sx={{
                  textTransform: "none",
                  borderRadius: 1.8,
                  px: 3,
                  py: 1,
                  fontWeight: 700,
                  bgcolor: undefined,
                  "&:hover": {
                    bgcolor: undefined,
                  },
                }}
              >
                {config.button}
              </Button>
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
