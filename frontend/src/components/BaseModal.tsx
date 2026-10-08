// components/BaseModal.tsx
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
  PaperProps,
} from "@mui/material";
import { Icon } from "@/components/AppIcon";
import { ReactNode } from "react";

interface Section {
  title: string;
  body: string;
}

interface BaseModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  sections: Section[];
  headerAction?: ReactNode;
}

export function BaseModal({
  open,
  onClose,
  title,
  sections,
  headerAction,
}: BaseModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={
        {
          elevation: 8,
          sx: {
            borderRadius: 3,
            overflow: "hidden",
          },
        } as PaperProps
      }
      TransitionProps={{ timeout: 300 }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
          pt: 2.5,
          pb: 1.5,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "background.neutral", // se não tiver, pode usar 'grey.50'
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Icon icon="mdi:shield-check" width={24} color="primary.main" />
          <Typography variant="h6" fontWeight={700}>
            {title}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          {headerAction}
          <IconButton
            onClick={onClose}
            size="small"
            sx={{ color: "text.secondary" }}
          >
            <Icon icon="mdi:close" width={20} />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers sx={{ px: 3, py: 2.5 }}>
        <Stack spacing={2.5}>
          {sections.map((section, index) => (
            <Stack
              key={section.title}
              spacing={0.5}
              sx={{
                pb: index < sections.length - 1 ? 2 : 0,
                borderBottom:
                  index < sections.length - 1 ? "1px solid" : "none",
                borderColor: "divider",
              }}
            >
              <Typography
                variant="subtitle1"
                fontWeight={600}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: "text.primary",
                }}
              >
                <Icon icon="mdi:circle-small" width={16} color="primary.main" />
                {section.title}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                lineHeight={1.7}
              >
                {section.body}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2.5, bgcolor: "background.neutral" }}>
        <Button
          onClick={onClose}
          variant="contained"
          fullWidth
          sx={{
            py: 1.2,
            borderRadius: 2,
            fontWeight: 600,
            textTransform: "none",
            boxShadow: 2,
          }}
        >
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
