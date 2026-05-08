"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
} from "@mui/material";
import { useEffect, useState } from "react";
import { Client } from "@/services/clientService";
import { ChangeEvent } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Client>) => Promise<unknown> | void;
  initialData?: Partial<Client> | null;
  isEn?: boolean;
};

export function ClientFormModal({
  open,
  onClose,
  onSubmit,
  initialData,
  isEn,
}: Props) {
  const [form, setForm] = useState<Partial<Client>>(initialData || {});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm(initialData || {});
  }, [initialData, open]);

  const handleChange =
    (key: keyof Client) => (e: ChangeEvent<HTMLInputElement>) =>
      setForm((s) => ({ ...s, [key]: e.target.value }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit(form);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {initialData
          ? isEn
            ? "Edit Client"
            : "Editar Cliente"
          : isEn
            ? "New Client"
            : "Novo Cliente"}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label={isEn ? "Name / Company" : "Nome / Razão Social"}
            fullWidth
            value={form.name || ""}
            onChange={handleChange("name")}
          />
          <TextField
            label={isEn ? "CPF / CNPJ" : "CPF / CNPJ"}
            fullWidth
            value={form.cpfCnpj || ""}
            onChange={handleChange("cpfCnpj")}
          />
          <TextField
            label={isEn ? "E-mail" : "E-mail"}
            fullWidth
            value={form.email || ""}
            onChange={handleChange("email")}
          />
          <TextField
            label={isEn ? "Phone" : "Telefone"}
            fullWidth
            value={form.phone || ""}
            onChange={handleChange("phone")}
          />
          <TextField
            label={isEn ? "Contact Name" : "Pessoa de Contato"}
            fullWidth
            value={form.contactName || ""}
            onChange={handleChange("contactName")}
          />
          <TextField
            select
            label={isEn ? "Status" : "Status"}
            value={form.status || "Ativo"}
            onChange={handleChange("status")}
          >
            <MenuItem value="Ativo">{isEn ? "Active" : "Ativo"}</MenuItem>
            <MenuItem value="Inativo">{isEn ? "Inactive" : "Inativo"}</MenuItem>
            <MenuItem value="Prospect">
              {isEn ? "Prospect" : "Prospect"}
            </MenuItem>
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>{isEn ? "Cancel" : "Cancelar"}</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          {initialData ? (isEn ? "Save" : "Salvar") : isEn ? "Create" : "Criar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ClientFormModal;
