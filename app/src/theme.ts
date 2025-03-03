import { createTheme } from "@mui/material/styles";
import { red } from "@mui/material/colors";

// Create a theme instance.
const theme = createTheme({
  palette: { mode: "dark" },
  colorSchemes: {
    dark: true,
  },
  cssVariables: true,
});

export default theme;
