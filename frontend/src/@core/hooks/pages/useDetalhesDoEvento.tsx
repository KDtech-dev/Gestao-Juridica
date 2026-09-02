import { useContext } from "react";
import { DetalhesDoEventoContext } from "src/context/page/DetalhesDoEventoContext";

export const useDetalhesEvento = () => useContext(DetalhesDoEventoContext);
