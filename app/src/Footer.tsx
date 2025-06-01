import * as React from "react";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import { Grid } from "@mui/material";
import Button from "@mui/material/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear } from "@fortawesome/pro-regular-svg-icons/faGear";

export default function Footer() {
  return (
    <Grid flexDirection={"row"} container>
      <Grid>
        <Button hidden />
      </Grid>
      <Grid flex={1}>
        <Typography
          variant="subtitle2"
          align="center"
          sx={{
            color: "text.secondary",
          }}
        >
          <Link color="inherit" href="https://dangerousthings.com/">
            Dangerous Things
          </Link>
        </Typography>
      </Grid>
      <Grid>
        <Button disabled>
          <FontAwesomeIcon icon={faGear} />
        </Button>
      </Grid>
    </Grid>
  );
}
