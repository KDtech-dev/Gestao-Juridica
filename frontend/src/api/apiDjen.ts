import { getAxios } from "@/configs/axios";


export type ResponseType<T> = {
  status: boolean;
  message: string;
  data: T;
};

export type ArrayResponseType<T> = {
  status: boolean;
  message: string;
  data: T[];
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
  texto: string | null; 
  link: string | null;
  lida: boolean;
  lida_em: string | null;
  caso: ComunicacaoDjenCaso | null;
  created_at: string | null;
};

export type FiltrosComunicacaoDjen = {
  somente_nao_lidas?: boolean;
  caso_id?: string;
  sigla_tribunal?: string;
  data_inicio?: string;
  data_fim?: string;
  por_pagina?: number;
};

export type SincronizarDjenResultado = {
  sincronizadas: number;
};

export const ApiDjen = {
  listar: (filtros?: FiltrosComunicacaoDjen) =>
    getAxios().get<ArrayResponseType<ComunicacaoDjen>>("/comunicacoes-djen", {
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
    getAxios().post<ResponseType<SincronizarDjenResultado>>(
      `/casos/${casoId}/sincronizar-djen`,
    ),

  sincronizarAdvogado: (advogadoId: string) =>
    getAxios().post<ResponseType<SincronizarDjenResultado>>(
      `/advogados/${advogadoId}/sincronizar-djen`,
    ),
};