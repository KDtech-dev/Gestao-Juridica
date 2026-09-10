import { ArrayResponseType, AdvogadoPublicoType } from "@/@core/types";
import { getAxios } from "@/configs/axios";

const getAdvogadosPublicos = async (): Promise<
  ArrayResponseType<AdvogadoPublicoType>
> => {
  const response = await getAxios().get("/advogados");
  return response.data;
};

export { getAdvogadosPublicos };
