import TextField, { TextFieldProps } from "@mui/material/TextField";
import { Controller, useFormContext } from "react-hook-form";

export type InputProps = {
  field: string;
  maxLength?: number;
} & TextFieldProps;

const InputBasico = ({ field, maxLength, ...props }: InputProps) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={field}
      control={control}
      render={({ field: controllerField, fieldState }) => (
        <TextField
          fullWidth
          {...props}
          {...controllerField}
          value={controllerField.value ?? ""}
          error={!!fieldState.error}
          helperText={fieldState.error?.message?.toString()}
          inputProps={{
            ...props.inputProps,
            maxLength,
          }}
          InputLabelProps={{ shrink: true }}
        />
      )}
    />
  );
};

export default InputBasico;
