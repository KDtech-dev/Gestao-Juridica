"use client";

import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
  Button,
  IconButton,
} from "@mui/material";
import { Icon } from "@/components/AppIcon";
import { useMemo } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function PrivacyPolicyModal({ open, onClose }: Props) {
  const baseSections = useMemo(
    () => [
      {
        title: "Introdução",
        body: "Esta Política de Privacidade descreve como tratamos os dados pessoais dos usuários para fornecer nossos serviços e garantir transparência sobre como as informações são coletadas, usadas e protegidas.",
      },
      {
        title: "Quais dados coletamos",
        body: "Podemos coletar dados como nome, contatos, informações sobre demandas jurídicas, e outras informações necessárias para atendimento, orçamento e acompanhamento de casos.",
      },
      {
        title: "Como utilizamos",
        body: "Utilizamos os dados para prestar serviços jurídicos, comunicar sobre o andamento de demandas, responder solicitações e cumprir obrigações legais.",
      },
      {
        title: "Compartilhamento",
        body: "Poderemos compartilhar dados com parceiros e autoridades apenas quando necessário para cumprir a lei, executar serviços contratados ou proteger direitos, sempre respeitando a legislação aplicável.",
      },
      {
        title: "Segurança e seus direitos",
        body: "Mantemos medidas de segurança para proteger os dados. Você pode solicitar acesso, correção, atualização, exclusão e outras providências relacionadas aos seus dados conforme a legislação.",
      },
    ],
    [],
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
        }}
      >
        <Typography fontWeight={700} fontSize="1.15rem">
          Política de Privacidade
        </Typography>
        <IconButton onClick={onClose} size="small">
          <Icon icon="mdi:close" width={18} />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ px: 3, py: 1.5 }}>
        <Stack spacing={2}>
          {baseSections.map((section) => (
            <Stack key={section.title} spacing={0.4}>
              <Typography fontWeight={600} fontSize="0.95rem">
                {section.title}
              </Typography>
              <Typography color="text.secondary" lineHeight={1.6}>
                {section.body}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="contained" fullWidth>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}


