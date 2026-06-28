"use client";
import {
  alpha,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Theme,
} from "@mui/material";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/AppIcon";

const DIALOG_RADIUS = "18px";
const ICON_BOX_RADIUS = "14px";
const BUTTON_RADIUS = "8px";

const dialogPaperSx = {
  borderRadius: DIALOG_RADIUS,
  backgroundImage: "none",
  bgcolor: "background.paper",
  boxShadow: (theme: Theme) =>
    theme.palette.mode === "dark"
      ? "0 24px 60px rgba(0,0,0,0.55)"
      : "0 24px 60px rgba(15,23,42,0.18)",
} as const;

const iconBoxSx = (theme: Theme) => ({
  width: 52,
  height: 52,
  borderRadius: ICON_BOX_RADIUS,
  display: "grid",
  placeItems: "center",
  color: "error.main",
  bgcolor: alpha(theme.palette.error.main, 0.08),
  border: "1px solid",
  borderColor: alpha(theme.palette.error.main, 0.2),
});

const cancelButtonSx = (theme: Theme) => ({
  borderRadius: BUTTON_RADIUS,
  textTransform: "none",
  fontWeight: 500,
  whiteSpace: "nowrap",
  minWidth: 100,
  borderColor:
    theme.palette.mode === "dark" ? "rgba(255,255,255,0.2)" : "primary.main",
  "&:hover": {
    borderColor:
      theme.palette.mode === "dark" ? "rgba(255,255,255,0.35)" : "primary.dark",
  },
});

const confirmButtonSx = {
  borderRadius: BUTTON_RADIUS,
  textTransform: "none",
  fontWeight: 500,
  whiteSpace: "nowrap",
  minWidth: 100,
  boxShadow: "none",
  "&:hover": { boxShadow: "none" },
} as const;

type Props = {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmText,
  cancelText,
  loading = false,
  onConfirm,
  onClose,
}: Props) {
  const tCommon = useTranslations("common");
  const resolvedConfirmText = confirmText ?? tCommon("confirm");
  const resolvedCancelText = cancelText ?? tCommon("cancel");

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: dialogPaperSx }}
    >
      <DialogTitle
        sx={{
          px: 3,
          pt: 4,
          pb: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: 2,
        }}
      >
        <Box sx={iconBoxSx}>
          <Icon icon="mdi:alert-outline" width={26} />
        </Box>
        <Box
          component="span"
          sx={{
            fontWeight: 500,
            fontSize: "0.9375rem",
            lineHeight: 1.3,
            color: "text.primary",
          }}
        >
          {title}
        </Box>
      </DialogTitle>

      {description && (
        <DialogContent sx={{ px: 3, pt: 1, pb: 0, textAlign: "center" }}>
          <DialogContentText
            sx={{
              whiteSpace: "pre-line",
              fontSize: "0.875rem",
              lineHeight: 1.6,
            }}
          >
            {description}
          </DialogContentText>
        </DialogContent>
      )}

      <DialogActions
        sx={{
          px: 3,
          pb: 3,
          pt: 3,
          gap: 1,
          justifyContent: "center",
        }}
      >
        <Button
          onClick={onClose}
          disabled={loading}
          variant="outlined"
          sx={cancelButtonSx}
        >
          {resolvedCancelText}
        </Button>

        <Button
          variant="contained"
          color="error"
          onClick={onConfirm}
          disabled={loading}
          startIcon={
            loading ? (
              <CircularProgress color="inherit" size={15} thickness={5} />
            ) : (
              <Icon icon="mdi:trash-can-outline" width={17} />
            )
          }
          sx={confirmButtonSx}
        >
          {resolvedConfirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmDialog;
