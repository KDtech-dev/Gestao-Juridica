import { useEffect, useState } from "react";
import { Box, Chip, MenuItem } from "@mui/material";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCasoSchema, CreateCasoPayload } from "@/schemas/CasoSchema";
import { CasoType, CategoriaType } from "@/@core/types";
import { BaseModal } from "@/components/modals/BaseModal";
import { useTranslations } from "next-intl";
import InputBasico from "./InputBasico";
import { getCategorias } from "@/api/ApiCategorias";

type DialogMode = "create" | "edit" | "view";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCasoPayload) => void;
  submitting?: boolean;
  mode?: DialogMode;
  caso?: CasoType | null;
};

const formId = "caso-form";

const STATUS_OPTIONS = [
  "aberto",
  "em_andamento",
  "encerrado",
  "arquivado",
] as const;

export function DialogCaso({
  open,
  onClose,
  onSubmit,
  submitting = false,
  mode = "create",
  caso = null,
}: Props) {
  const t = useTranslations("internal.cases.dialog");
  const tValidation = useTranslations("validation");
  const isView = mode === "view";
  const isDisabled = submitting || isView;

  const [categorias, setCategorias] = useState<CategoriaType[]>([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);

  const titleMap: Record<DialogMode, string> = {
    create: t("title.create"),
    edit: t("title.edit"),
    view: t("title.view"),
  };
  const confirmTextMap: Record<DialogMode, string> = {
    create: submitting ? t("actions.adding") : t("actions.add"),
    edit: submitting ? t("actions.saving") : t("actions.saveChanges"),
    view: t("actions.close"),
  };

  const methods = useForm<CreateCasoPayload>({
    resolver: zodResolver(createCasoSchema(tValidation)),
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

  const { handleSubmit, reset } = methods;

  useEffect(() => {
    const loadCategorias = async () => {
      try {
        const { data } = await getCategorias();
        setCategorias(data);
      } catch {}
    };

    loadCategorias();
  }, []);

  useEffect(() => {
    if (open && caso) {
      reset({
        numero_processo: caso.numero_processo ?? "",
        titulo: caso.titulo ?? "",
        descricao: caso.descricao ?? "",
        status: caso.status ?? "aberto",
        categorias: caso.categorias?.map((c) => c.id) ?? [],
        data_abertura: caso.data_abertura ?? "",
        data_encerramento: caso.data_encerramento ?? "",
      });
    }

    if (open && !caso) {
      reset({
        numero_processo: "",
        titulo: "",
        descricao: "",
        status: "aberto",
        categorias: [],
        data_abertura: "",
        data_encerramento: "",
      });
    }
  }, [open, caso, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <BaseModal
      open={open}
      onClose={handleClose}
      title={titleMap[mode]}
      maxWidth="md"
      confirmType={isView ? "button" : "submit"}
      confirmFormId={isView ? undefined : formId}
      confirmText={confirmTextMap[mode]}
      confirmDisabled={submitting}
      onSubmit={isView ? handleClose : undefined}
      cancelText={isView ? undefined : t("actions.cancel")}
    >
      <FormProvider {...methods}>
        <Box
          id={formId}
          component="form"
          onSubmit={handleSubmit(onSubmit)}
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
              disabled={isDisabled}
              maxLength={255}
            />
          </Box>

          <InputBasico
            field="numero_processo"
            label={t("fields.processNumber")}
            disabled={isDisabled}
          />

          <InputBasico
            field="status"
            label={t("fields.status")}
            select
            disabled={isDisabled}
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
            disabled={isDisabled}
          />

          <InputBasico
            field="data_encerramento"
            label={t("fields.closingDate")}
            type="date"
            disabled={isDisabled}
          />

          <Box sx={{ gridColumn: "1 / -1" }}>
            <InputBasico
              field="categorias"
              label={t("fields.categories")}
              select
              disabled={isDisabled || loadingCategorias}
              SelectProps={{
                multiple: true,
                renderValue: (selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {(selected as number[]).map((id) => {
                      const categoria = categorias.find((c) => c.id === id);
                      return (
                        <Chip
                          key={id}
                          label={categoria?.nome ?? id}
                          size="small"
                        />
                      );
                    })}
                  </Box>
                ),
              }}
            >
              {loadingCategorias && (
                <MenuItem value="" disabled>
                  {t("fields.loadingCategories")}
                </MenuItem>
              )}

              {!loadingCategorias && categorias.length === 0 && (
                <MenuItem value="" disabled>
                  {t("fields.noCategories")}
                </MenuItem>
              )}

              {categorias.map((categoria) => (
                <MenuItem key={categoria.id} value={categoria.id}>
                  {categoria.nome}
                </MenuItem>
              ))}
            </InputBasico>
          </Box>

          <Box sx={{ gridColumn: "1 / -1" }}>
            <InputBasico
              field="descricao"
              label={t("fields.description")}
              disabled={isDisabled}
              multiline
              minRows={3}
            />
          </Box>
        </Box>
      </FormProvider>
    </BaseModal>
  );
}

export default DialogCaso;
