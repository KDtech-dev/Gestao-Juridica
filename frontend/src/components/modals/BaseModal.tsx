"use client";

import { Dialog, DialogContent, Button, Typography, Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { BRANDING } from "@/configs/branding";

interface BaseModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSubmit?: () => void;
  confirmFormId?: string;
  confirmType?: "button" | "submit";
  confirmText?: string;
  cancelText?: string;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
  confirmDisabled?: boolean;
}

export function BaseModal({
  open,
  onClose,
  title,
  children,
  onSubmit,
  confirmFormId,
  confirmType = "button",
  confirmText,
  cancelText,
  maxWidth = "lg",
  confirmDisabled = false,
}: BaseModalProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: "90vh",
          overflow: "hidden",
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ display: "flex", height: "100%" }}>
          <Box
            sx={{
              width: { xs: 0, md: "40%" },
              display: { xs: "none", md: "block" },
              backgroundImage: `url(${BRANDING.modalImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              position: "relative",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, rgba(15,23,42,0.25) 0%, rgba(15,23,42,0.85) 100%)",
              }}
            />

            <Box
              sx={{
                position: "absolute",
                bottom: 24,
                left: 24,
                right: 24,
                color: "#fff",
              }}
            >
              <Typography fontWeight={700} fontSize="1.3rem">
                {BRANDING.appName}
              </Typography>

              <Typography fontSize="0.95rem" sx={{ opacity: 0.9 }}>
                {BRANDING.tagline}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              width: { xs: "100%", md: "60%" },
              display: "flex",
              flexDirection: "column",
              bgcolor: "background.paper",
            }}
          >
            <Box
              sx={{
                px: 3,
                py: 2,
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography fontWeight={700}>{title}</Typography>
            </Box>

            <Box
              sx={{
                px: 3,
                py: 3,
                flex: 1,
                overflowY: "auto",
              }}
            >
              {children}
            </Box>

            <Box
              sx={{
                px: 3,
                py: 2,
                borderTop: "1px solid",
                borderColor: "divider",
                display: "flex",
                justifyContent: "flex-end",
                gap: 1,
              }}
            >
              <Button onClick={onClose} color={isDark ? "inherit" : "primary"}>
                {cancelText ?? BRANDING.modal?.cancelText ?? "Cancelar"}
              </Button>

              <Button
                onClick={
                  confirmType === "submit" ? undefined : (onSubmit ?? onClose)
                }
                type={confirmType}
                form={confirmFormId}
                variant="contained"
                disabled={confirmDisabled}
              >
                {confirmText ?? BRANDING.modal?.confirmText ?? "Salvar"}
              </Button>
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
