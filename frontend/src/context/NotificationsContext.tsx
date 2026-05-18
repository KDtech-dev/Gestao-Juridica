"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type NotificationItem = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  read: boolean;
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

const STORAGE_KEY = "lawmanager-notifications";

const seed: NotificationItem[] = [
  {
    id: "n1",
    title: "Novo prazo próximo",
    description: "Processo 0000000-00 tem audiência em 2 dias.",
    createdAt: "2026-03-29T12:00:00.000Z",
    read: false,
  },
];

const getInitialNotifications = () => {
  if (typeof window === "undefined") return seed;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as NotificationItem[]) : seed;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return seed;
  }
};

export function NotificationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    getInitialNotifications,
  );

  useEffect(() => {
    if (notifications.length === 0) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications]);

  const value = useMemo<NotificationsContextValue>(() => {
    return {
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,

      addNotification: ({ title, description }) => {
        setNotifications((prev) => [
          {
            id: `n${Date.now()}`,
            title,
            description,
            createdAt: new Date().toISOString(),
            read: false,
          },
          ...prev,
        ]);
      },

      markAsRead: (id) => {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
        );
      },

      markAllAsRead: () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      },

      clearAll: () => {
        setNotifications([]);
        localStorage.removeItem(STORAGE_KEY);
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
