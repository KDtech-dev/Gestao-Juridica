import { ArrayResponseType, CategoriaType} from "@/@core/types";
import { getAxios } from "@/configs/axios";

const getCategorias = async (): Promise<ArrayResponseType<CategoriaType>> => {
  const response = await getAxios().get("/categorias");
  return response.data;
};


export { getCategorias };
