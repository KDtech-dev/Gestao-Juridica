"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  clearNotificacoes,
  clearSelectedNotificacoes,
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
  menuNotifications: NotificationItem[];
  unreadCount: number;
  menuUnreadCount: number;
  addNotification: (payload: { title: string; description: string }) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearMenu: () => void;
  clearAll: () => void;
  clearSelected: (ids: string[]) => void;
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
  const [hiddenMenuIds, setHiddenMenuIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      queueMicrotask(() => setNotifications([]));
      queueMicrotask(() => setHiddenMenuIds(new Set()));
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
      menuNotifications: notifications.filter((n) => !hiddenMenuIds.has(n.id)),
      unreadCount: notifications.filter((n) => !n.read).length,
      menuUnreadCount: notifications.filter(
        (n) => !n.read && !hiddenMenuIds.has(n.id),
      ).length,

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
        const notification = notifications.find((n) => n.id === id);

        if (!notification || notification.read) return;

        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
        );
        void markNotificacaoAsRead(id).catch(() => {
          void listNotificacoes().then(setNotifications);
        });
      },

      markAllAsRead: () => {
        if (!notifications.some((n) => !n.read)) return;

        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        void markAllNotificacoesAsRead().catch(() => {
          void listNotificacoes().then(setNotifications);
        });
      },

      clearMenu: () => {
        if (notifications.length === 0) return;

        setHiddenMenuIds(new Set(notifications.map((n) => n.id)));
      },

      clearAll: () => {
        if (notifications.length === 0) return;

        setNotifications([]);
        setHiddenMenuIds(new Set());
        void clearNotificacoes().catch(() => {
          void listNotificacoes().then(setNotifications);
        });
      },

      clearSelected: (ids) => {
        const selectedIds = new Set(ids);

        if (selectedIds.size === 0) return;

        setNotifications((prev) => prev.filter((n) => !selectedIds.has(n.id)));
        setHiddenMenuIds((prev) => {
          const next = new Set(prev);
          ids.forEach((id) => next.delete(id));

          return next;
        });
        void clearSelectedNotificacoes(ids).catch(() => {
          void listNotificacoes().then(setNotifications);
        });
      },
    };
  }, [hiddenMenuIds, notifications]);

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
