import { AdvogadoPublicoType, ArrayResponseType } from "@/@core/types";
import { publicLawyerPhoto } from "@/utils/advogadoPublico";
import { getAxios } from "@/configs/axios";

const getAdvogadosPublicos = async (
  categoriaId?: string | number,
): Promise<ArrayResponseType<AdvogadoPublicoType>> => {
  const response = await getAxios().get<ArrayResponseType<AdvogadoPublicoType>>(
    "/advogados",
    {
      params: categoriaId ? { categoria: categoriaId } : undefined,
    },
  );

  return {
    ...response.data,
    data: response.data.data.map((lawyer) => ({
      ...lawyer,
      foto_perfil_url: publicLawyerPhoto(lawyer.foto_perfil_url),
    })),
  };
};

export { getAdvogadosPublicos };
