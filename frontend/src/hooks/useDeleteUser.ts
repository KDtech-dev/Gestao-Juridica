"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { deleteUser } from "@/api/ApiUsers";
import { toast } from "@/utils/toast";

interface UserRow {
  id: string;
  name: string;
}

export function useDeleteUser(onSuccess?: () => void) {
  const t = useTranslations("internal.users");
  const [userToDelete, setUserToDelete] = useState<UserRow | null>(null);
  const [loading, setLoading] = useState(false);

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    setLoading(true);
    try {
      await deleteUser(userToDelete.id);
      toast.success(t("toast.deleted"));
      setUserToDelete(null);
      onSuccess?.();
    } catch (error: any) {
      const errorCode = error?.response?.data?.error_code;

      if (errorCode === "last_admin") {
        toast.error(t("errors.lastAdmin"));
      } else {
        toast.error(t("errors.delete"));
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    userToDelete,
    setUserToDelete,
    loading,
    handleConfirmDelete,
  };
}
