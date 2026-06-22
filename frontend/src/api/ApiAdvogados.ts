import { AdvogadoPublicoType, ArrayResponseType } from "@/@core/types";
import { getAxios } from "@/configs/axios";

const getAdvogadosPublicos = async (): Promise<
  ArrayResponseType<AdvogadoPublicoType>
> => {
  const response = await getAxios().get("/advogados/publico");
  return response.data;
};

export { getAdvogadosPublicos };
