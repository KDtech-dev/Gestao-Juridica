import { CategoriaType } from "@/@core/types";
import { ArrayResponseType } from "@/@core/types"; 
import { getAxios } from "@/configs/axios";

const getCategorias = async (): Promise<ArrayResponseType<CategoriaType>> => {
  const response = await getAxios().get<ArrayResponseType<CategoriaType>>("/categorias");
  return response.data;
};

export { getCategorias };