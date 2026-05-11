import TextField, { TextFieldProps } from "@mui/material/TextField";
import React, { useEffect } from "react";
import { useFormContext } from "react-hook-form";

export type InputProps = {
  field: string;
  maxLength?: number;
} & TextFieldProps;

const InputBasico = ({ field, maxLength, ...props }: InputProps) => {
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext();

  useEffect(() => {
    if (props.defaultValue) setValue(field, props.defaultValue);
  }, [props.defaultValue, setValue, field]);

  return (
    <TextField
      fullWidth
      {...register(field)}
      {...props}
      error={!!errors[field]}
      helperText={errors[field]?.message?.toString()}
      inputProps={{
        ...props.inputProps,
        maxLength,
      }}
      InputLabelProps={{ shrink: true }}
    />
  );
};

export default InputBasico;
