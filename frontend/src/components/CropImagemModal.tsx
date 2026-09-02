import {
  useState,
  useRef,
  forwardRef,
  ReactElement,
  Ref,
  SyntheticEvent,
} from "react";
import ReactCrop, {
  centerCrop,
  Crop,
  makeAspectCrop,
  PixelCrop,
} from "react-image-crop";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Fade,
  FadeProps,
  IconButton,
  Stack,
} from "@mui/material";
import { Icon } from "@/components/AppIcon";
import "react-image-crop/dist/ReactCrop.css";

const Transition = forwardRef(function Transition(
  props: FadeProps & { children?: ReactElement },
  ref: Ref<unknown>,
) {
  return <Fade ref={ref} {...props} />;
});

type props = {
  show: boolean;
  setShow: (value: boolean) => void;
  src: string;
  onSaveImage: (image: File) => void;
  aspect?: number;
};

const CropImagemModal = ({
  show,
  setShow,
  src,
  onSaveImage,
  aspect,
}: props) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [scale] = useState(1);
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [rotate] = useState(0);

  const handleImageLoad = (event: SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = event.currentTarget;

    if (!aspect) {
      setCrop({ unit: "%", x: 5, y: 5, width: 90, height: 90 });
      return;
    }

    setCrop(
      centerCrop(
        makeAspectCrop(
          {
            unit: "%",
            width: 90,
          },
          aspect,
          width,
          height,
        ),
        width,
        height,
      ),
    );
  };

  const saveImageCropped = (
    image: HTMLImageElement,
    crop: PixelCrop,
    scale = 1,
    rotate = 0,
  ) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No 2d context");

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const pixelRatio = window.devicePixelRatio;

    canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
    canvas.height = Math.floor(crop.height * scaleY * pixelRatio);

    ctx.scale(pixelRatio, pixelRatio);
    ctx.imageSmoothingQuality = "high";

    const cropX = crop.x * scaleX;
    const cropY = crop.y * scaleY;

    const rotateRads = (rotate * Math.PI) / 180;
    const centerX = image.naturalWidth / 2;
    const centerY = image.naturalHeight / 2;

    ctx.save();

    ctx.translate(-cropX, -cropY);
    ctx.translate(centerX, centerY);
    ctx.rotate(rotateRads);
    ctx.scale(scale, scale);
    ctx.translate(-centerX, -centerY);
    ctx.drawImage(
      image,
      0,
      0,
      image.naturalWidth,
      image.naturalHeight,
      0,
      0,
      image.naturalWidth,
      image.naturalHeight,
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], "croppedImage.jpeg", {
          type: "image/jpeg",
        });
        onSaveImage(file);
        setShow(false);
      },
      "image/jpeg",
      1,
    );
  };

  const handleSubmit = () => {
    if (!crop?.width || !completedCrop?.height || !imgRef.current) return;
    saveImageCropped(imgRef.current, completedCrop, scale, rotate);
  };

  return (
    <Dialog
      fullWidth
      open={show}
      maxWidth="md"
      scroll="body"
      onClose={() => setShow(false)}
      TransitionComponent={Transition}
    >
      <DialogContent
        sx={{
          position: "relative",
          pb: 2,
          px: { xs: 2, md: 3 },
          pt: { xs: 6, md: 3 },
        }}
      >
        <IconButton
          size="small"
          onClick={() => setShow(false)}
          sx={{ position: "absolute", right: "1rem", top: "1rem" }}
        >
          <Icon icon="mdi:close" />
        </IconButton>
        <Box sx={{ mb: 2.5, pr: 4 }}>
          <Typography variant="h6" fontWeight={700}>
            Cortar imagem
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ajuste a área visível antes de salvar a imagem.
          </Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            {!!src && (
              <Box
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  bgcolor: "background.default",
                  overflow: "hidden",
                  p: 1,
                  "& .ReactCrop": {
                    display: "block",
                    maxHeight: { xs: "60vh", md: "68vh" },
                  },
                }}
              >
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={aspect}
                >
                  <img
                    ref={imgRef}
                    alt="Imagem a ser cortada"
                    src={src}
                    onLoad={handleImageLoad}
                    style={{
                      display: "block",
                      maxHeight: "66vh",
                      maxWidth: "100%",
                      transform: `scale(${scale}) rotate(${rotate}deg)`,
                      objectFit: "contain",
                    }}
                  />
                </ReactCrop>

                <canvas
                  ref={previewCanvasRef}
                  style={{
                    display: "none",
                    border: "1px solid black",
                    objectFit: "contain",
                    width: completedCrop?.width,
                    height: completedCrop?.height,
                  }}
                />
              </Box>
            )}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions
        sx={{
          justifyContent: "flex-end",
          px: { xs: 2, md: 3 },
          pb: { xs: 2, md: 3 },
        }}
      >
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => setShow(false)}
            sx={{ whiteSpace: "nowrap" }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!completedCrop?.width || !completedCrop?.height}
            sx={{ whiteSpace: "nowrap" }}
          >
            Salvar
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default CropImagemModal;
