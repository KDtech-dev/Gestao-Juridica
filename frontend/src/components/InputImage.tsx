import { MouseEventHandler, useEffect, useState } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Typography, { TypographyProps } from "@mui/material/Typography";
import { useDropzone } from "react-dropzone";
import { IconButton, useMediaQuery, useTheme } from "@mui/material";
import { Icon } from "@/components/AppIcon";
import { BoxProps } from "@mui/system";
import CropImagemModal from "./CropImagemModal";
import { useTranslations } from "next-intl";
import { getPublicApiOrigin } from "@/configs/apiUrl";

const HeadingTypography = styled(Typography)<TypographyProps>(({ theme }) => ({
  marginBottom: theme.spacing(5),
  [theme.breakpoints.down("sm")]: {
    marginBottom: theme.spacing(4),
  },
}));

type props = {
  onImageChange?: (event: File | undefined) => void;
  value?: File | string;
  cropImage?: boolean;
  aspect?: number;
  subBoxInput?: BoxProps;
  imageHeight?: number | string;
} & BoxProps;

const InputImage = ({
  onImageChange,
  value,
  cropImage,
  aspect,
  subBoxInput,
  imageHeight = 300,
  id,
  ...props
}: props) => {
  const t = useTranslations("internal.publicationForm.imageInput");
  const [file, setFile] = useState<File | string | undefined>(value);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [show, setShow] = useState<boolean>(false);
  const [imagem, setImagem] = useState<string>("");

  const { getRootProps, getInputProps } = useDropzone({
    multiple: false,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
    },
    onDrop: (acceptedFiles: File[]) => {
      if (!cropImage) {
        onSaveImage(acceptedFiles[0]);
      } else {
        setImagem(URL.createObjectURL(acceptedFiles[0]));
        setShow(true);
      }
    },
  });

  function onSaveImage(image: File) {
    setFile(image);
    onImageChange?.(image);
  }

  useEffect(() => {
    setFile(value);
  }, [value]);

  const handleDeleteImage: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    setFile(undefined);
    onImageChange?.(undefined);
  };

  useEffect(() => {
    if (typeof onImageChange !== "undefined" && file instanceof File)
      onImageChange(file);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  const inputProps = getInputProps({ id });
  const backendOrigin = getPublicApiOrigin() || "http://127.0.0.1:8000";

  return (
    <Box {...props} sx={file ? { height: "auto", ...props.sx } : props.sx}>
      <input {...inputProps} />
      <Box
        {...subBoxInput}
        sx={{
          display: "flex",
          justifyContent: "center",
          height: imageHeight,
          border: "3px gainsboro dashed",
          borderRadius: "10px",
          padding: "10px",
          ...subBoxInput?.sx,
        }}
      >
        {file ? (
          <Box
            sx={{
              display: "flex",
              height: "100%",
              width: "100%",
              flexDirection: isMobile ? "column" : "row",
              position: "relative",
            }}
          >
            <Box
              sx={{
                height: "100%",
                flexGrow: "1",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-evenly",
                flexDirection: isMobile ? "row" : "column",
                position: isMobile ? "absolute" : "relative",
                right: isMobile ? 0 : undefined,
                zIndex: isMobile ? 1 : "auto",
                backgroundColor: isMobile
                  ? "rgba(255,255,255,0.7)"
                  : "transparent",
              }}
            >
              <IconButton
                sx={{ marginRight: "8px", marginLeft: "20px" }}
                {...getRootProps({ className: "dropzone" })}
              >
                <Icon icon="mdi:update" width="1.5em" height="1.8em" />
              </IconButton>
              <IconButton
                sx={{ marginRight: "8px", marginLeft: "20px" }}
                onClick={handleDeleteImage}
              >
                <Icon icon="mdi:delete-outline" width="1.5em" height="1.8em" />
              </IconButton>
            </Box>
            <Box
              sx={{
                height: "100%",
                width: "100%",
                overflow: "hidden",
                padding: "10px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                position: "relative",
              }}
              {...getRootProps({ className: "dropzone" })}
            >
              <img
                key={typeof file == "string" ? file : file.name}
                alt={typeof file == "string" ? file : file.name}
                title={typeof file == "string" ? "" : file.name}
                className="single-file-image"
                src={typeof file == "string" ? file : URL.createObjectURL(file)}
                onError={(event) => {
                  if (typeof file !== "string" || !file.startsWith("/storage/")) {
                    return;
                  }

                  const image = event.currentTarget;

                  if (image.dataset.fallbackSrc) {
                    return;
                  }

                  image.dataset.fallbackSrc = "true";
                  image.src = `${backendOrigin.replace(/\/$/, "")}${file}`;
                }}
                style={{
                  maxHeight: "100%",
                  maxWidth: "100%",
                  objectFit: "contain",
                  height: "auto",
                  width: "auto",
                }}
              />
            </Box>
          </Box>
        ) : (
          <Box
            {...getRootProps({ className: "dropzone" })}
            sx={{
              display: "flex",
              flexDirection: ["column", "column", "row"],
              alignItems: "center",
              width: "fit-content",
              height: "100%",
              justifyContent: "center",
            }}
          >
            <IconButton sx={{ marginRight: "8px", marginLeft: "20px" }}>
              <Icon icon="mdi:upload-outline" width="100" height="100" />
            </IconButton>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                textAlign: ["center", "center", "inherit"],
              }}
            >
              <HeadingTypography variant="h5">{t("title")}</HeadingTypography>
              <Typography
                color="textSecondary"
                sx={{
                  "& a": { color: "primary.main", textDecoration: "none" },
                }}
              >
                {t("prefix")}{" "}
                <Link href="/" onClick={(e) => e.preventDefault()}>
                  {t("browse")}
                </Link>{" "}
                {t("suffix")}
              </Typography>
            </Box>
          </Box>
        )}
        {cropImage && (
          <CropImagemModal
            show={show}
            aspect={aspect}
            setShow={setShow}
            src={imagem}
            onSaveImage={onSaveImage}
          />
        )}
      </Box>
    </Box>
  );
};

export default InputImage;
