import { useEffect, useRef } from "react";
import { AutoresType, UserDataType } from "src/context/types";
import { UseFormSetValue } from "react-hook-form";
import { schemaCriarSubmissaoType } from "src/validations/submissoes/schemaCriarSubmissao";

export const useAutoPopulatePrimaryAuthor = (
  user: UserDataType | null,
  setValue: UseFormSetValue<schemaCriarSubmissaoType>,
  onMissingInstituicao?: () => void,
) => {
  const alreadyWarnedRef = useRef(false);

  useEffect(() => {
    if (!user) return;
    const semInstituicao = !user.instituicao || user.instituicao.trim() === "";
    const autorPrincipal: AutoresType = {
      id: user.id,
      nome: user.name,
      email: user.email,
      instituicao: user.instituicao || "",
      orcid_id: user.orcid_id ?? undefined,
    };
    setValue("autores", [autorPrincipal]);

    if (semInstituicao && onMissingInstituicao && !alreadyWarnedRef.current) {
      alreadyWarnedRef.current = true;
      onMissingInstituicao();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, setValue]);
};
