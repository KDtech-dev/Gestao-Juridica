import { useRouter } from "next/router";
import { useLoading } from "./useLoading";
import { useEffect } from "react";

const useCheckPermission = (checkPermission: Promise<boolean>) => {
  const { loading, stopLoading } = useLoading(true);
  const router = useRouter();

  useEffect(() => {
    checkPermission
      .then((success) => {
        if (success) stopLoading();
      })
      .catch(() => router.replace("/403"));
  }, [checkPermission, router, stopLoading]);

  return { loading };
};

export default useCheckPermission;
