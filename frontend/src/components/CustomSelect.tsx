import {
  Checkbox,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectProps,
} from "@mui/material";

export type CustomSelectItems = {
  [key: string]: string;
};

export type CustomSelectProps = {
  items: CustomSelectItems;
  none?: { value: string; text: string };
  checkBox?: boolean;
  handleChange: (selected: string[]) => void;
} & SelectProps<string[]>;

const CustomSelect = ({
  items,
  none,
  checkBox,
  handleChange,
  label,
  fullWidth,
  ...props
}: CustomSelectProps) => {
  return (
    <FormControl fullWidth={fullWidth}>
      <InputLabel>{label}</InputLabel>
      <Select<string[]>
        label={label}
        {...props}
        renderValue={(selected) =>
          selected
            .map((value) => (value == none?.value ? none.text : items[value]))
            .sort()
            .join(", ")
        }
        onChange={({ target: { value } }) => {
          let values = typeof value === "string" ? value.split(",") : value;

          if (none) {
            if (values.length > 1 && values.includes(none.value))
              if (values[values.length - 1] === none.value)
                values = [none.value];
              else values = values.filter((value) => value !== none.value);
            if (values.length == 0) values = [none.value];
          }
          handleChange(values);
        }}
      >
        {none && [
          <MenuItem key="select-none-item" value={none.value}>
            {checkBox && (
              <Checkbox
                checked={!!(props.value && props.value.includes(none.value))}
              />
            )}
            {none.text}
          </MenuItem>,
          <Divider key="divider" />,
        ]}
        {Object.keys(items).map((data) => {
          return (
            <MenuItem key={data} value={data}>
              {checkBox && <Checkbox checked={props.value?.includes(data)} />}
              {items[data]}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
};

export default CustomSelect;
