import { AdvogadoPublicoType, ArrayResponseType } from "@/@core/types";
import { getAxios } from "@/configs/axios";



const getAdvogadosPublicos = async (
  categoriaId?: string | number,
): Promise<ArrayResponseType<AdvogadoPublicoType>> => {
  const response = await getAxios().get<ArrayResponseType<AdvogadoPublicoType>>("/advogados", {
    params: categoriaId ? { categoria: categoriaId } : undefined,
  });

  return response.data;
};

export { getAdvogadosPublicos };