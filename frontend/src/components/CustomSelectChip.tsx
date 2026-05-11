import * as React from "react";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import OutlinedInput from "@mui/material/OutlinedInput";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Chip from "@mui/material/Chip";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

type CustomSelectProps = {
  items: { [key: string]: string };
  value: string[];
  handleChange: (selected: string[]) => void;
};

const CustomSelectChip = ({
  items,
  value,
  handleChange,
}: CustomSelectProps) => {
  const theme = useTheme();

  const handleSelectChange = (event: SelectChangeEvent<typeof value>) => {
    const {
      target: { value: selectedValues },
    } = event;

    if (selectedValues.includes("all")) {
      if (value.length === Object.keys(items).length) {
        handleChange([]);
      } else {
        handleChange(Object.keys(items));
      }
    } else {
      handleChange(
        typeof selectedValues === "string"
          ? selectedValues.split(",")
          : selectedValues,
      );
    }
  };

  return (
    <FormControl sx={{ m: 1, width: "100%" }}>
      <Select
        labelId="custom-select-label"
        id="custom-select"
        multiple
        value={value}
        onChange={handleSelectChange}
        input={<OutlinedInput id="select-multiple-chip" />}
        renderValue={(selected) => (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {selected.includes("all") ? (
              <Chip label="Todos" />
            ) : (
              selected.map((val) => (
                <Chip key={val} label={items[val]} color="primary" />
              ))
            )}
          </Box>
        )}
        MenuProps={MenuProps}
      >
        <MenuItem key="all" value="all">
          Todos
        </MenuItem>
        {Object.entries(items).map(([id, title]) => (
          <MenuItem
            key={id}
            value={id}
            style={{
              fontWeight: value.includes(id)
                ? theme.typography.fontWeightMedium
                : theme.typography.fontWeightRegular,
            }}
          >
            {title}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default CustomSelectChip;
