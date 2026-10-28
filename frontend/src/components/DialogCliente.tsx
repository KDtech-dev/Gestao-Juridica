import { Box, TextField } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createClienteSchema,
  CreateClientePayload,
} from "@/schemas/ClienteSchema";
import { ClienteType } from "@/@core/types";
import { BaseModal } from "@/components/modals/BaseModal";
import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { formatCpfCnpj, formatTelefone } from "@/@core/format";
import LocalizedDatePicker from "@/components/LocalizedDatePicker";

type DialogMode = "create" | "edit" | "view";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateClientePayload) => void;
  submitting?: boolean;
  mode?: DialogMode;
  cliente?: ClienteType | null;
};

const formId = "cliente-form";

export function DialogCliente({
  open,
  onClose,
  onSubmit,
  submitting = false,
  mode = "create",
  cliente = null,
}: Props) {
  const t = useTranslations("internal.clients.dialog");
  const tv = useTranslations("validation");
  const isView = mode === "view";
  const isDisabled = submitting || isView;
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

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateClientePayload>({
    resolver: zodResolver(createClienteSchema(tv)),
    defaultValues: {
      name: "",
      cpf_cnpj: "",
      email: "",
      telefone: "",
      data_nascimento: "",
    },
  });

  useEffect(() => {
    if (open && cliente) {
      reset({
        name: cliente.name ?? "",
        cpf_cnpj: cliente.cpf_cnpj ?? "",
        email: cliente.email ?? "",
        telefone: cliente.telefone ?? "",
        data_nascimento: cliente.data_nascimento ?? "",
      });
    }

    if (open && !cliente) {
      reset({
        name: "",
        cpf_cnpj: "",
        email: "",
        telefone: "",
        data_nascimento: "",
      });
    }
  }, [open, cliente, reset]);

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
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                required={!isView}
                disabled={isDisabled}
                label={t("fields.name")}
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
              required={!isView}
              disabled={isDisabled}
              label={t("fields.document")}
              error={!!errors.cpf_cnpj}
              helperText={errors.cpf_cnpj?.message}
              onChange={(event) =>
                field.onChange(formatCpfCnpj(event.target.value))
              }
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
              required={!isView}
              disabled={isDisabled}
              label={t("fields.email")}
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
              disabled={isDisabled}
              label={t("fields.phone")}
              error={!!errors.telefone}
              helperText={errors.telefone?.message}
              inputProps={{ maxLength: 15 }}
              onChange={(e) => field.onChange(formatTelefone(e.target.value))}
            />
          )}
        />

        <Controller
          name="data_nascimento"
          control={control}
          render={({ field }) => (
            <LocalizedDatePicker
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              disabled={isDisabled}
              label={t("fields.birthDate")}
              error={!!errors.data_nascimento}
              helperText={errors.data_nascimento?.message}
            />
          )}
        />
      </Box>
    </BaseModal>
  );
}

export default DialogCliente;
