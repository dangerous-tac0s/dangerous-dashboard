import * as React from "react";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";

export default function Copyright() {
  return (
    <Typography
      variant="subtitle2"
      align="center"
      sx={{
        color: "text.secondary",
      }}
    >
      {"Copyright © "}
      <Link color="inherit" href="https://dangerousthings.com/">
        Dangerous Things
      </Link>{" "}
      {new Date().getFullYear()}.
    </Typography>
  );
}
