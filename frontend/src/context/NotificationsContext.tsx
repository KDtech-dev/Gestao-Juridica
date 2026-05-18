"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  clearNotificacoes,
  listNotificacoes,
  markAllNotificacoesAsRead,
  markNotificacaoAsRead,
  type NotificationKind,
} from "@/services/notificacaoService";
import { toast } from "@/utils/toast";

export type NotificationItem = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  read: boolean;
  type?: NotificationKind;
};

type NotificationsContextValue = {
  notifications: NotificationItem[];
  unreadCount: number;
  addNotification: (payload: { title: string; description: string }) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
};

const NotificationsContext = createContext<
  NotificationsContextValue | undefined
>(undefined);

export function NotificationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, loading } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      queueMicrotask(() => setNotifications([]));
      return;
    }

    let active = true;

    listNotificacoes()
      .then((items) => {
        if (active) setNotifications(items);
      })
      .catch(() => {
        if (active) setNotifications([]);
      });

    return () => {
      active = false;
    };
  }, [isAuthenticated, loading]);

  const value = useMemo<NotificationsContextValue>(() => {
    return {
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,

      addNotification: ({ title, description }) => {
        const message = description ? `${title}: ${description}` : title;
        const isError = /erro|error|falha/i.test(title);

        if (isError) {
          toast.error(message);
          return;
        }

        toast.success(message);
      },

      markAsRead: (id) => {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
        );
        void markNotificacaoAsRead(id).catch(() => {
          void listNotificacoes().then(setNotifications);
        });
      },

      markAllAsRead: () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        void markAllNotificacoesAsRead().catch(() => {
          void listNotificacoes().then(setNotifications);
        });
      },

      clearAll: () => {
        setNotifications([]);
        void clearNotificacoes().catch(() => {
          void listNotificacoes().then(setNotifications);
        });
      },
    };
  }, [notifications]);

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx)
    throw new Error(
      "useNotifications deve ser usado com NotificationsProvider.",
    );
  return ctx;
}
