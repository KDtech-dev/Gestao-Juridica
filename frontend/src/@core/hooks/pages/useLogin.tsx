import { useEffect, useState } from "react";
import { useAuth } from "src/hooks/useAuth";
import { useSettings } from "src/@core/hooks/useSettings";
import { useMediaQuery, useTheme } from "@mui/system";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  schemaFormLogin,
  schemaFormLoginType,
} from "src/validations/auth/schemaFormLogin";
import toast from "react-hot-toast";
import { postReenviarEmailVerificacao } from "src/api/apiAuth";
import { useRouter } from "next/router";

const defaultValues = {
  password: "",
  email: "",
  recaptcha_token: "",
};

interface ApiError {
  response?: {
    status: number;
    data?: {
      error?: string;
    };
  };
}

export const useLogin = () => {
  const router = useRouter();
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState<boolean>(false);

  useEffect(() => {
    const saved = localStorage.getItem("rememberMe");
    if (saved) {
      setRememberMe(saved === "true");
    }
  }, []);

  const auth = useAuth();
  const theme = useTheme();
  const {
    settings: { skin },
  } = useSettings();
  const hidden = useMediaQuery(theme.breakpoints.down("md"));
  const imageSource =
    skin === "bordered"
      ? "auth-v2-login-illustration-bordered"
      : "auth-v2-login-illustration";

  const form = useForm<schemaFormLoginType>({
    defaultValues,
    mode: "onChange",
    resolver: zodResolver(schemaFormLogin),
  });

  const onSubmit = async (data: schemaFormLoginType) => {
    setIsLoading(true);

    try {
      const { email, password, recaptcha_token } = data;
      await new Promise<void>((resolve, reject) => {
        auth.login(
          { email, password, rememberMe, recaptcha_token },
          (error: ApiError | null) => {
            if (error) {
              if (error.response?.status === 403) {
                setUnverifiedEmail(email);
                toast.error(
                  "E-mail não verificado. Reenvie a confirmação para continuar.",
                );
                router.push({ pathname: "/verify-email", query: { email } });
              } else if (
                error.response?.status === 400 &&
                error.response.data?.error
              ) {
                toast.error(error.response.data.error);
              } else {
                toast.error("Email ou senha inválido");
                form.setError("email", {
                  type: "manual",
                  message: "Email ou senha inválido",
                });
              }
              reject(error);
            } else {
              setUnverifiedEmail(null);
              resolve();
            }
          },
        );
      });
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!unverifiedEmail) return;
    try {
      setResendLoading(true);
      await postReenviarEmailVerificacao(unverifiedEmail);
      toast.success("E-mail de verificação reenviado!");
    } catch (err) {
      toast.error("Não foi possível reenviar o e-mail. Tente novamente.");
    } finally {
      setResendLoading(false);
    }
  };

  type ProvidersType = {
    [k in "google"]: {
      name: Capitalize<k>;
      color: `#${string}` | `${string}.${number}`;
    };
  };

  const providers: ProvidersType = {
    google: {
      name: "Google",
      color: "#db4437",
    },
  };

  return {
    rememberMe,
    setRememberMe,
    hidden,
    imageSource,
    form,
    onSubmit,
    skin,
    theme,
    providers,
    setRecaptchaToken: form.setValue,
    isLoading,
    unverifiedEmail,
    resendLoading,
    handleResendVerification,
  };
};
