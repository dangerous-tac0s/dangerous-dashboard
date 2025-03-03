import { useLoaderData, useNavigate } from "@remix-run/react";
import { useState } from "react";
import { CHIP_IMPLANT_MAP } from "~/models/chip_implant";
import { ModInterface } from "~/models/mod";
import { MAGNET_IMPLANT_MAP } from "~/models/magnet_implant";
import rawData from "../data/implants_by_year.json";
import { json } from "@remix-run/node";
import ModDetailChart from "../src/ModDetailChart";
import {
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
} from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faList } from "@fortawesome/pro-regular-svg-icons/faList";
import { faMagnifyingGlass } from "@fortawesome/pro-regular-svg-icons/faMagnifyingGlass";
import { faCamera } from "@fortawesome/pro-regular-svg-icons/faCamera";
import { faCircleNodes } from "@fortawesome/pro-regular-svg-icons/faCircleNodes";
import UseCaseLegend from "~/src/UseCaseLegend";

const getMod = (name: string) => {
  if (Object.keys(MAGNET_IMPLANT_MAP).includes(name)) {
    return MAGNET_IMPLANT_MAP[name]();
  } else if (Object.keys(CHIP_IMPLANT_MAP).includes(name)) {
    return CHIP_IMPLANT_MAP[name]();
  }

  return null;
};

export function BackButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className=" text-gray-500 hover:text-gray-300"
    >
      ←
    </button>
  );
}

/**
 * Loader: fetch the Mod object from ALL_MODS
 * @param param0
 * @returns
 */
export async function loader({ params }: { params: { modName: string } }) {
  // "modName" is the dynamic param from the filename [mod.$modName].tsx
  const { modName } = params;

  if (!modName) {
    throw new Response("Mod name param missing", { status: 400 });
  }
  if (modName === "installMap.js") {
    return;
  }

  return json({ modName, rawData });
}

/**
 * A simple default export component that shows
 * the mod data, or does something interesting with it.
 */
export function ModDetailRoute() {
  // loader returns a `Mod`
  const { modName } = useLoaderData<{
    modName: string;
    modType: string;
  }>();
  const [mod] = useState<ModInterface | null>(getMod(modName));

  return mod === null ? (
    ""
  ) : (
    <>
      <Grid container spacing={2}>
        {/* Left Column (1/6 width) */}
        <Grid
          size={{ xl: 3, xs: 12 }}
          alignContent={"center"}
          textAlign={"end"}
        >
          {/* Back Button and Page Title */}
          Annual Change in Popularity
        </Grid>

        {/* Center Column (2/3 width) */}
        <Grid size={{ xl: 6, xs: 12 }}>
          {/* Your display content goes here */}
          <ModDetailChart mod={mod as ModInterface} rawData={rawData} />
        </Grid>

        {/* Right Column (1/6 width) */}

        <Grid size={{ xl: 3, xs: 12 }}>{/* Empty content on the right */}</Grid>
        {/* Card for sections */}
        <Grid
          flexDirection={"column"}
          alignItems={"center"}
          size={{ xl: 6, xs: 12 }}
          offset={3}
          container
          gap={5}
        >
          {mod.mod_type.toLowerCase() === "chip" ? (
            <Box
              component={Paper}
              sx={{
                p: "1rem",
                borderRadius: 3,
              }}
            >
              <UseCaseLegend props={{ name: mod.name }} />
            </Box>
          ) : (
            ""
          )}
          <Box sx={{ position: "relative", width: 500, height: 550 }}>
            <Box
              component={Paper}
              display={{ xs: "none", lg: "block" }}
              sx={{
                width: "100%",
                height: "100%",
                clipPath:
                  "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box textAlign={"center"}>
                <Typography variant={"h5"}> Coming Soon™</Typography>
                <List className={"list-disc pl-10"}>
                  <ListItem>
                    <ListItemIcon>
                      <FontAwesomeIcon icon={faMagnifyingGlass} />
                    </ListItemIcon>
                    <ListItemText primary={"Detailed views of features"} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <FontAwesomeIcon icon={faList} />
                    </ListItemIcon>
                    <ListItemText primary={"Description of Mod"} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <FontAwesomeIcon icon={faCamera} />
                    </ListItemIcon>
                    <ListItemText primary={"Photo or maybe render"} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <FontAwesomeIcon icon={faCircleNodes} />
                    </ListItemIcon>
                    <ListItemText
                      primary={"List possible similar alternatives"}
                    />
                  </ListItem>
                </List>
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </>
  );
}

export default ModDetailRoute;
