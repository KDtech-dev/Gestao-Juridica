import { useCallback, useEffect, useRef, useState } from "react";
import * as clientService from "@/services/clientService";

export type Client = clientService.Client;

export function useClients(initialPage = 1, initialLimit = 10) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | undefined>(undefined);

  const debounceRef = useRef<number | null>(null);

  type ListOpts = {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  };
  const fetchClients = useCallback(
    async (opts?: ListOpts) => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          page: opts?.page ?? page,
          limit: opts?.limit ?? limit,
          search: opts?.search ?? search,
          status: opts?.status ?? status,
        };

        const data = await clientService.listClients(params);

        // expected shape: { data: Client[], meta: { total, page, limit } }
        const items = (data as { data?: Client[] })?.data ?? data;
        const meta = (data as { meta?: { total?: number } })?.meta ?? null;

        setClients(items || []);
        setTotal(meta?.total ?? (Array.isArray(items) ? items.length : 0));
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Erro ao buscar clientes";
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [page, limit, search, status],
  );

  // immediate fetch when page/limit/status change
  useEffect(() => {
    fetchClients();
  }, [fetchClients, page, limit, status]);

  // debounce search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      setPage(1);
      fetchClients({ page: 1, limit, search, status });
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const refresh = useCallback(
    () => fetchClients({ page, limit, search, status }),
    [fetchClients, page, limit, search, status],
  );

  const createClient = useCallback(
    async (payload: Partial<Client>) => {
      setLoading(true);
      try {
        const res = await clientService.createClient(payload);
        await fetchClients({ page: 1, limit, search, status });
        return res;
      } catch (err) {
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchClients, limit, search, status],
  );

  const updateClient = useCallback(
    async (id: number | string, payload: Partial<Client>) => {
      setLoading(true);
      try {
        const res = await clientService.updateClient(id, payload);
        await fetchClients({ page, limit, search, status });
        return res;
      } catch (err) {
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchClients, page, limit, search, status],
  );

  const deleteClient = useCallback(
    async (id: number | string) => {
      setLoading(true);
      try {
        const res = await clientService.deleteClient(id);
        // refetch current page
        await fetchClients({ page, limit, search, status });
        return res;
      } catch (err) {
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchClients, page, limit, search, status],
  );

  return {
    clients,
    loading,
    error,
    page,
    limit,
    total,
    setPage,
    setLimit,
    search,
    setSearch,
    status,
    setStatus,
    refresh,
    createClient,
    updateClient,
    deleteClient,
  };
}

export default useClients;
