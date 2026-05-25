import {
  Box,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createClienteSchema,
  CreateClientePayload,
} from "@/schemas/ClienteSchema";
import { Icon } from "@/components/AppIcon";
import { ClienteType } from "@/components/publications/types";
import { useEffect } from "react";

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

const titleMap: Record<DialogMode, string> = {
  create: "Novo cliente",
  edit: "Editar cliente",
  view: "Dados do cliente",
};

const confirmTextMap = (submitting: boolean): Record<DialogMode, string> => ({
  create: submitting ? "Adicionando..." : "Adicionar cliente",
  edit: submitting ? "Salvando..." : "Salvar alterações",
  view: "",
});

export function DialogCliente({
  open,
  onClose,
  onSubmit,
  submitting = false,
  mode = "create",
  cliente = null,
}: Props) {
  const isView = mode === "view";
  const isDisabled = submitting || isView;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateClientePayload>({
    resolver: zodResolver(createClienteSchema),
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
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontWeight: 700,
          pb: 1,
        }}
      >
        {titleMap[mode]}
        <IconButton onClick={handleClose} disabled={submitting}>
          <Icon icon="mdi:close" width={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box
          id={formId}
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
            gap: 2,
            pt: 1,
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
                required={!isView}
                disabled={isDisabled}
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
                required={!isView}
                disabled={isDisabled}
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
                disabled={isDisabled}
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
                disabled={isDisabled}
                label="Data de Nascimento"
                type="date"
                InputLabelProps={{ shrink: true }}
                error={!!errors.data_nascimento}
                helperText={errors.data_nascimento?.message}
              />
            )}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={handleClose}
          disabled={submitting}
          sx={{ textTransform: "none", borderRadius: "8px" }}
        >
          {isView ? "Fechar" : "Cancelar"}
        </Button>

        {!isView && (
          <Button
            type="submit"
            form={formId}
            variant="contained"
            disabled={submitting}
            sx={{ textTransform: "none", borderRadius: "8px" }}
          >
            {confirmTextMap(submitting)[mode]}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default DialogCliente;
