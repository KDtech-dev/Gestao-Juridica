"use client";

import { Alert, Snackbar } from "@mui/material";
import { useEffect, useState } from "react";
import {
  subscribeToToasts,
  type ToastMessage,
} from "@/utils/toast";

const DEFAULT_AUTO_HIDE_DURATION = 3200;

export default function ToastProvider() {
  const [queue, setQueue] = useState<ToastMessage[]>([]);
  const currentToast = queue[0];

  useEffect(() => {
    return subscribeToToasts((message) => {
      setQueue((prev) => [...prev, message]);
    });
  }, []);

  const handleClose = (_event?: unknown, reason?: string) => {
    if (reason === "clickaway") return;

    setQueue((prev) => prev.slice(1));
  };

  return (
    <Snackbar
      key={currentToast?.id}
      open={Boolean(currentToast)}
      autoHideDuration={
        currentToast?.autoHideDuration ?? DEFAULT_AUTO_HIDE_DURATION
      }
      onClose={handleClose}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      {currentToast ? (
        <Alert
          onClose={handleClose}
          severity={currentToast.severity}
          variant="filled"
          sx={{ width: "100%", maxWidth: 420 }}
        >
          {currentToast.message}
        </Alert>
      ) : undefined}
    </Snackbar>
  );
}
