import { getAxios } from "@/configs/axios";


export type ResponseType<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type ArrayResponseType<T> = {
  success: boolean;
  message: string;
  data: T[];
};

export type PaginatedData<T> = {
  items: T[];
  pagination: {
    current_page: number;
    per_page: number;
    last_page: number;
    total: number;
  };
};

export type ComunicacaoDjenCaso = {
  id: string;
  titulo: string;
  numero_processo: string | null;
};

export type ComunicacaoDjen = {
  id: string;
  numero_processo: string | null;
  sigla_tribunal: string | null;
  nome_orgao: string | null;
  tipo_comunicacao: string | null;
  data_disponibilizacao: string | null;
  status_djen?: string | null;
  motivo_cancelamento?: string | null;
  data_cancelamento?: string | null;
  texto: string | null; 
  link: string | null;
  lida: boolean;
  lida_em: string | null;
  caso: ComunicacaoDjenCaso | null;
  created_at: string | null;
};

export type FiltrosComunicacaoDjen = {
  page?: number;
  somente_nao_lidas?: boolean;
  caso_id?: string;
  sigla_tribunal?: string;
  data_inicio?: string;
  data_fim?: string;
  por_pagina?: number;
};

export type DjenSyncRun = {
  id: string;
  target_type: "caso" | "advogado";
  target_id: string;
  status: "queued" | "running" | "completed" | "failed";
  from_date: string;
  checkpoint_at: string | null;
  pages_completed: number;
  items_processed: number;
  items_created: number;
  items_updated: number;
  last_error: string | null;
  started_at: string | null;
  completed_at: string | null;
};

export const ApiDjen = {
  listar: (filtros?: FiltrosComunicacaoDjen) =>
    getAxios().get<ResponseType<PaginatedData<ComunicacaoDjen>>>("/comunicacoes-djen", {
      params: filtros,
    }),

  obter: (id: string) =>
    getAxios().get<ResponseType<ComunicacaoDjen>>(`/comunicacoes-djen/${id}`),

  marcarLida: (id: string) =>
    getAxios().patch<ResponseType<ComunicacaoDjen>>(
      `/comunicacoes-djen/${id}/lida`,
    ),

  vincular: (id: string, casoId: string) =>
    getAxios().post<ResponseType<ComunicacaoDjen>>(
      `/comunicacoes-djen/${id}/vincular`,
      { caso_id: casoId },
    ),

  sincronizarCaso: (casoId: string) =>
    getAxios().post<ResponseType<DjenSyncRun>>(
      `/casos/${casoId}/sincronizar-djen`,
    ),

  sincronizarAdvogado: (advogadoId: string) =>
    getAxios().post<ResponseType<DjenSyncRun>>(
      `/advogados/${advogadoId}/sincronizar-djen`,
    ),

  obterSincronizacao: (runId: string) =>
    getAxios().get<ResponseType<DjenSyncRun>>(`/djen-sync-runs/${runId}`),
};
