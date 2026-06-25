import { Typography } from "@mui/material";
import { styled } from "@mui/system";
import {
  ChangeEventHandler,
  FocusEventHandler,
  useEffect,
  useState,
} from "react";
import { useFormContext } from "react-hook-form";

const CompactContainer = styled("div")(() => ({
  display: "flex",
  alignItems: "center",
  gap: "8px",
  cursor: "pointer",
}));

const ColorCircle = styled("div")(() => ({
  width: "28px",
  height: "28px",
  borderRadius: "50%",
  overflow: "hidden",
  border: "2px solid rgba(255,255,255,0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexShrink: 0,
}));

const ColorInput = styled("input")(() => ({
  padding: 0,
  margin: 0,
  border: "none",
  height: "200%",
  width: "200%",
  outline: "none",
  cursor: "pointer",
  boxShadow: "none",
}));

type Props = {
  name: string;
  defaultColor?: string;
};

const PickColor = ({ name, defaultColor }: Props) => {
  const { watch, setValue } = useFormContext();

  const watchedColor = watch(name);
  const [colorCode, setColorCode] = useState(
    watchedColor || defaultColor || "#9e9e9e",
  );
  useEffect(() => {
    if (watchedColor) {
      setColorCode(watchedColor);
    }
  }, [watchedColor]);
  const handleUpdateColor: ChangeEventHandler<HTMLInputElement> = (e) => {
    setColorCode(e.target.value);
  };

  const handleBlurCapture: FocusEventHandler<HTMLInputElement> = (e) => {
    if (!(e.target instanceof HTMLInputElement)) return;

    setValue(name, e.target.value, { shouldDirty: true });
  };

  return (
    <CompactContainer>
      <ColorCircle>
        <ColorInput
          type="color"
          title="Cor do perfil"
          value={colorCode}
          name={name}
          onChange={handleUpdateColor}
          onBlur={handleBlurCapture}
        />
      </ColorCircle>

      <Typography
        variant="caption"
        sx={{
          color: "rgba(255,255,255,0.8)",
          fontSize: "0.7rem",
          letterSpacing: 1,
        }}
      >
        {colorCode.toUpperCase()}
      </Typography>
    </CompactContainer>
  );
};

export default PickColor;
