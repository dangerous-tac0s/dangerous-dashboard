import * as React from "react";
import type { MetaFunction } from "@remix-run/node";
import { Link as RemixLink } from "@remix-run/react";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box";
import { Grid } from "@mui/material";

// https://remix.run/docs/en/main/route/meta
export const meta: MetaFunction = () => [
  { title: "Dangerous Dashboard" },
  {
    name: "description",
    content:
      "Data and information about chip and magnet implants and their popularity.",
  },
];

// https://remix.run/docs/en/main/file-conventions/routes#basic-routes
export default function Index() {
  return (
    <React.Fragment>
      <Grid
        container
        flex={1}
        alignItems="center"
        justifyContent="center"
        spacing={5}
      >
        <Grid size={12} textAlign="center">
          <Typography variant="h2" component={"h5"}>
            Welcome!
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }} spacing={2} container>
          <Typography component="p"></Typography>
          Curious about the popularity of DT and VK's products? Or how that
          demand has changed over time? Coming soon: a new list view.
          <Typography
            sx={{ fontStyle: "italic" }}
            variant="subtitle1"
            component="p"
            flex={1}
            mr={5}
            textAlign={"end"}
          >
            May 30th 2025
          </Typography>
        </Grid>
      </Grid>
    </React.Fragment>
  );
}
