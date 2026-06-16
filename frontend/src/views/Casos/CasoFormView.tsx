"use client";

import { useEffect, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/AppIcon";
import { HeaderDashboard } from "@/components/HeaderADM";
import { SidebarDashboard } from "@/components/Sidebar";
import { toast } from "@/utils/toast";
import { formatCpfCnpj } from "@/@core/format";
import { createCasoSchema, CreateCasoPayload } from "@/schemas/CasoSchema";
import {
  CasoAnexoType,
  CasoType,
  CategoriaType,
  ClienteType,
  PapelClienteCaso,
} from "@/@core/types";
import { getCategorias } from "@/api/ApiCategorias";
import { getAxios } from "@/configs/axios";
import {
  deleteAnexoCaso,
  getCasoById,
  postCaso,
  syncClientesCaso,
  updateCaso,
  uploadAnexosCaso,
} from "@/api/apiCasos";
import InputBasico from "@/components/InputBasico";
import InputSingleFile from "@/components/InputSingleFile";

type ViewMode = "create" | "edit" | "view";

type ClienteSelecionado = {
  cliente: ClienteType;
  papel: PapelClienteCaso | null;
};

const STATUS_OPTIONS = [
  "aberto",
  "em_andamento",
  "encerrado",
  "arquivado",
] as const;

const PAPEL_OPTIONS = ["autor", "réu", "interveniente", "testemunha"] as const;

const ANEXOS_TIPOS = ["pdf", "doc", "docx", "jpg", "jpeg", "png"];

type Props = {
  mode: ViewMode;
  casoId?: string;
};

export default function CasoFormView({ mode, casoId }: Props) {
  const t = useTranslations("internal.cases.form");
  const theme = useTheme();
  const router = useRouter();

  const isView = mode === "view";
  const isCreate = mode === "create";

  const [loading, setLoading] = useState(!isCreate);
  const [saving, setSaving] = useState(false);

  const [categorias, setCategorias] = useState<CategoriaType[]>([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);

  const [clientesDisponiveis, setClientesDisponiveis] = useState<ClienteType[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(true);

  const [clientesSelecionados, setClientesSelecionados] = useState<ClienteSelecionado[]>([]);
  const [clienteParaAdicionar, setClienteParaAdicionar] = useState<ClienteType | null>(null);
  const [papelParaAdicionar, setPapelParaAdicionar] = useState<PapelClienteCaso>("autor");

  const [anexosNovos, setAnexosNovos] = useState<File[]>([]);
  const [anexosExistentes, setAnexosExistentes] = useState<CasoAnexoType[]>([]);
  const [anexosRemovidos, setAnexosRemovidos] = useState<string[]>([]);

  const methods = useForm<CreateCasoPayload>({
    resolver: zodResolver(createCasoSchema),
    defaultValues: {
      numero_processo: "",
      titulo: "",
      descricao: "",
      status: "aberto",
      categorias: [],
      data_abertura: "",
      data_encerramento: "",
    },
  });

  const { handleSubmit, reset, control } = methods;

  useEffect(() => {
    let ativo = true;

    getCategorias()
      .then((data) => {
        if (ativo) setCategorias(data);
      })
      .catch(() => {})
      .finally(() => {
        if (ativo) setLoadingCategorias(false);
      });

    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    let ativo = true;

    getAxios()
      .get("/clientes", { params: { per_page: 999 } })
      .then((response) => {
        if (ativo) setClientesDisponiveis(response.data?.data ?? []);
      })
      .catch(() => {})
      .finally(() => {
        if (ativo) setLoadingClientes(false);
      });

    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    if (isCreate || !casoId) {
      setLoading(false);
      return;
    }

    let ativo = true;
    setLoading(true);

    getCasoById(casoId)
      .then((caso) => {
        if (!ativo) return;

        reset({
          numero_processo: caso.numero_processo ?? "",
          titulo: caso.titulo ?? "",
          descricao: caso.descricao ?? "",
          status: caso.status ?? "aberto",
          categorias: caso.categorias?.map((c) => c.id) ?? [],
          data_abertura: caso.data_abertura ?? "",
          data_encerramento: caso.data_encerramento ?? "",
        });

        setClientesSelecionados(
          (caso.clientes ?? []).map((cliente) => ({
            cliente,
            papel: cliente.papel ?? null,
          })),
        );

        setAnexosExistentes(caso.anexos ?? []);
      })
      .catch(() => {
        toast.error(t("errors.load"));
      })
      .finally(() => {
        if (ativo) setLoading(false);
      });

    return () => {
      ativo = false;
    };
  }, [isCreate, casoId, reset, t]);

  const clientesParaAutocomplete = clientesDisponiveis.filter(
    (cliente) => !clientesSelecionados.some((s) => s.cliente.id === cliente.id),
  );

  const handleAddCliente = () => {
    if (!clienteParaAdicionar) return;
    setClientesSelecionados((prev) => [
      ...prev,
      { cliente: clienteParaAdicionar, papel: papelParaAdicionar },
    ]);
    setClienteParaAdicionar(null);
    setPapelParaAdicionar("autor");
  };

  const handleRemoveCliente = (clienteId: string | number) => {
    setClientesSelecionados((prev) =>
      prev.filter((s) => s.cliente.id !== clienteId),
    );
  };

  const handlePapelChange = (clienteId: string | number, papel: PapelClienteCaso) => {
    setClientesSelecionados((prev) =>
      prev.map((s) => (s.cliente.id === clienteId ? { ...s, papel } : s)),
    );
  };

  const handleRemoveExistingAnexo = (anexoId: string) => {
    setAnexosExistentes((prev) => prev.filter((a) => a.id !== anexoId));
    setAnexosRemovidos((prev) => [...prev, anexoId]);
  };

  const onSubmitForm = async (values: CreateCasoPayload) => {
    setSaving(true);

    try {
      const payload: CreateCasoPayload = {
        ...values,
        numero_processo: values.numero_processo || null,
        data_encerramento: values.data_encerramento || null,
        clientes: clientesSelecionados.map(({ cliente, papel }) => ({
          id: String(cliente.id),
          papel: papel ?? "autor",
        })),
      };

      let caso: CasoType;

      if (isCreate) {
        caso = await postCaso(payload);
      } else {
        caso = await updateCaso(casoId!, payload);
        caso = await syncClientesCaso(caso.id, {
          clientes: payload.clientes ?? [],
        });
      }

      if (anexosNovos.length > 0) {
        await uploadAnexosCaso(caso.id, anexosNovos);
      }

      for (const anexoId of anexosRemovidos) {
        await deleteAnexoCaso(caso.id, anexoId);
      }

      toast.success(isCreate ? t("toast.created") : t("toast.updated"));
      router.push("/casos");
    } catch (err) {
      toast.error(isCreate ? t("errors.create") : t("errors.update"));
    } finally {
      setSaving(false);
    }
  };

  const titleMap: Record<ViewMode, string> = {
    create: t("title.create"),
    edit: t("title.edit"),
    view: t("title.view"),
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <SidebarDashboard activeKey="casos" />

      <Box sx={{ ml: { xs: 0, md: "280px" }, minWidth: 0 }}>
        <HeaderDashboard showSearch={false} />

        <Container maxWidth={false} sx={{ px: { xs: 2, md: 4 }, py: 3.2 }}>
          <Stack direction="row" alignItems="center" spacing={1.5} mb={3.5}>
            <IconButton onClick={() => router.push("/casos")}>
              <Icon icon="mdi:arrow-left" width={22} />
            </IconButton>
            <Typography
              variant="h4"
              fontWeight={800}
              sx={{ color: "primary.main" }}
            >
              {titleMap[mode]}
            </Typography>
          </Stack>

          <FormProvider {...methods}>
            <Box
              component="form"
              onSubmit={handleSubmit(onSubmitForm)}
              sx={{ display: "flex", flexDirection: "column", gap: 3 }}
            >
              <Paper
                elevation={0}
                sx={{
                  borderRadius: "20px",
                  border: `1px solid ${theme.palette.divider}`,
                  p: 3,
                }}
              >
                <Typography fontWeight={700} mb={2}>
                  {t("sections.data")}
                </Typography>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
                    gap: 2,
                  }}
                >
                  <Box sx={{ gridColumn: "1 / -1" }}>
                    <InputBasico
                      field="titulo"
                      label={t("fields.title")}
                      required={!isView}
                      disabled={isView}
                      maxLength={255}
                    />
                  </Box>

                  <InputBasico
                    field="numero_processo"
                    label={t("fields.processNumber")}
                    disabled={isView}
                  />

                  <InputBasico
                    field="status"
                    label={t("fields.status")}
                    select
                    disabled={isView}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <MenuItem key={status} value={status}>
                        {t(`status.${status}`)}
                      </MenuItem>
                    ))}
                  </InputBasico>

                  <InputBasico
                    field="data_abertura"
                    label={t("fields.openingDate")}
                    type="date"
                    required={!isView}
                    disabled={isView}
                  />

                  <InputBasico
                    field="data_encerramento"
                    label={t("fields.closingDate")}
                    type="date"
                    disabled={isView}
                  />

                  <Box sx={{ gridColumn: "1 / -1" }}>
                    <Controller
                      name="categorias"
                      control={methods.control}
                      render={({ field }) => {
                        const selectedIds = Array.isArray(field.value)
                          ? field.value
                          : [];
                        const selectedCategorias = categorias.filter((c) =>
                          selectedIds.includes(c.id),
                        );

                        return (
                          <Autocomplete
                            multiple
                            loading={loadingCategorias}
                            options={categorias}
                            getOptionLabel={(option) => option.nome}
                            isOptionEqualToValue={(option, value) =>
                              option.id === value.id
                            }
                            value={selectedCategorias}
                            onChange={(_, value) => {
                              field.onChange(value.map((c) => c.id));
                            }}
                            disabled={isView || loadingCategorias}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label={t("fields.categories")}
                                placeholder={
                                  selectedCategorias.length
                                    ? ""
                                    : t("fields.categories")
                                }
                                InputLabelProps={{ shrink: true }}
                                InputProps={{
                                  ...params.InputProps,
                                  endAdornment: (
                                    <>
                                      {loadingCategorias && (
                                        <CircularProgress size={18} />
                                      )}
                                      {params.InputProps.endAdornment}
                                    </>
                                  ),
                                }}
                              />
                            )}
                          />
                        );
                      }}
                    />
                  </Box>

                  <Box sx={{ gridColumn: "1 / -1" }}>
                    <InputBasico
                      field="descricao"
                      label={t("fields.description")}
                      disabled={isView}
                      multiline
                      minRows={3}
                    />
                  </Box>
                </Box>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  borderRadius: "20px",
                  border: `1px solid ${theme.palette.divider}`,
                  p: 3,
                }}
              >
                <Typography fontWeight={700} mb={2}>
                  {t("sections.clients")}
                </Typography>

                {!isView && (
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.5}
                    alignItems={{ xs: "stretch", sm: "flex-start" }}
                    mb={2}
                  >
                    <Autocomplete
                      sx={{ flex: 1 }}
                      options={clientesParaAutocomplete}
                      getOptionLabel={(option) =>
                        `${option.name} - ${formatCpfCnpj(option.cpf_cnpj)}`
                      }
                      value={clienteParaAdicionar}
                      onChange={(_, value) => setClienteParaAdicionar(value)}
                      loading={loadingClientes}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={t("fields.selectClient")}
                          placeholder={t("fields.selectClientPlaceholder")}
                        />
                      )}
                    />

                    <Select
                      value={papelParaAdicionar}
                      onChange={(e) =>
                        setPapelParaAdicionar(e.target.value as PapelClienteCaso)
                      }
                      sx={{ minWidth: { xs: "100%", sm: 180 } }}
                    >
                      {PAPEL_OPTIONS.map((papel) => (
                        <MenuItem key={papel} value={papel}>
                          {t(`papel.${papel}`)}
                        </MenuItem>
                      ))}
                    </Select>

                    <Button
                      variant="outlined"
                      onClick={handleAddCliente}
                      disabled={!clienteParaAdicionar}
                      startIcon={<Icon icon="mdi:plus" width={18} />}
                      sx={{ whiteSpace: "nowrap" }}
                    >
                      {t("actions.addClient")}
                    </Button>
                  </Stack>
                )}

                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>{t("table.client")}</TableCell>
                        <TableCell>{t("table.document")}</TableCell>
                        <TableCell>{t("table.role")}</TableCell>
                        {!isView && (
                          <TableCell align="right">{t("table.actions")}</TableCell>
                        )}
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {clientesSelecionados.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={isView ? 3 : 4} align="center">
                            {t("clients.empty")}
                          </TableCell>
                        </TableRow>
                      )}

                      {clientesSelecionados.map(({ cliente, papel }) => (
                        <TableRow key={cliente.id}>
                          <TableCell>
                            <Typography fontWeight={600}>{cliente.name}</Typography>
                          </TableCell>

                          <TableCell sx={{ fontFamily: "monospace" }}>
                            {formatCpfCnpj(cliente.cpf_cnpj)}
                          </TableCell>

                          <TableCell>
                            {isView ? (
                              t(`papel.${papel ?? "autor"}`)
                            ) : (
                              <Select
                                size="small"
                                value={papel ?? "autor"}
                                onChange={(e) =>
                                  handlePapelChange(
                                    cliente.id,
                                    e.target.value as PapelClienteCaso,
                                  )
                                }
                              >
                                {PAPEL_OPTIONS.map((p) => (
                                  <MenuItem key={p} value={p}>
                                    {t(`papel.${p}`)}
                                  </MenuItem>
                                ))}
                              </Select>
                            )}
                          </TableCell>

                          {!isView && (
                            <TableCell align="right">
                              <IconButton
                                size="small"
                                onClick={() => handleRemoveCliente(cliente.id)}
                              >
                                <Icon icon="mdi:close" width={18} />
                              </IconButton>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  borderRadius: "20px",
                  border: `1px solid ${theme.palette.divider}`,
                  p: 3,
                }}
              >
                <Typography fontWeight={700} mb={2}>
                  {t("sections.attachments")}
                </Typography>

                <InputSingleFile
                  multiple
                  values={anexosNovos}
                  onFilesChange={setAnexosNovos}
                  existingFiles={anexosExistentes}
                  onRemoveExistingFile={handleRemoveExistingAnexo}
                  onlyView={isView}
                  tipos_aceitos={ANEXOS_TIPOS}
                  label={t("fields.attachments")}
                  helperText={t("fields.attachmentsHelper")}
                />
              </Paper>

              {!isView && (
                <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
                  <Button
                    variant="outlined"
                    onClick={() => router.push("/casos")}
                  >
                    {t("actions.cancel")}
                  </Button>
                  <Button
                    variant="contained"
                    disabled={saving}
                    onClick={() => handleSubmit(onSubmitForm)()}
                  >
                    {saving
                      ? t("actions.saving")
                      : isCreate
                        ? t("actions.create")
                        : t("actions.save")}
                  </Button>
                </Stack>
              )}
            </Box>
          </FormProvider>
        </Container>
      </Box>
    </Box>
  );
}