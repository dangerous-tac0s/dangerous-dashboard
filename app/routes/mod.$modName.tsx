import { useLoaderData, useNavigate, useSearchParams } from "@remix-run/react";
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
  ListSubheader,
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
import { LegendMenu } from "~/src/UseCaseLegend";

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
  const [searchParams, setSearchParams] = useSearchParams();
  const targetFeature = searchParams.getAll("chip"); // There should only be one

  const Content = () => {
    let content: any[] = [];
    console.log(targetFeature);
    if (targetFeature.length === 0) {
      content = [
        <ListItem>
          <ListItemText
            primary={"Install Method"}
            secondary={
              <span style={{ paddingLeft: "1rem" }}>{mod?.install_method}</span>
            }
          />
        </ListItem>,
        <ListItem>
          <ListItemText
            primary={"Chip(s)"}
            secondary={
              <span style={{ paddingLeft: "1rem" }}>
                {mod?.chip.map((e) => e.name).join(", ")}
              </span>
            }
          />
        </ListItem>,
        <ListItem>
          <ListItemText
            primary={"Description"}
            secondary={
              <span style={{ paddingLeft: "1rem" }}>{mod?.description}</span>
            }
          />
        </ListItem>,
      ];
    } else {
      console.log(targetFeature[0], !mod?.features[targetFeature[0]].supported);
      if (!mod?.features[targetFeature[0]].supported) {
        content.push(
          <ListItem>
            <ListItemText secondary={"Not supported."} />
          </ListItem>,
        );
      } else {
        switch (targetFeature[0]) {
          case "smartphone":
            content.push(
              <ListItem>
                <ListItemText
                  primary={"Relevant ISO(s)"}
                  secondary={
                    <span style={{ paddingLeft: "1rem" }}>
                      {mod?.details["smartphone"]
                        .map((iso, i) => iso)
                        .join(", ")}
                    </span>
                  }
                />
              </ListItem>,
            );

            break;
          case "":
            break;
          default:
            console.log("Not found");
        }
      }
    }

    return <List className={"list-disc pl-10"}>{content}</List>;
  };

  return mod === null ? (
    <Typography variant={"h4"} mt={5}>
      Implant Not Found
    </Typography>
  ) : (
    <>
      <Grid container mt={"1rem"}>
        {/* Left Column (1/6 width) */}
        <Grid
          size={{ md: 3, xs: 12 }}
          alignContent={"center"}
          textAlign={{ xs: "center", lg: "end" }}
          justifyContent={{ xs: "center", lg: "end" }}
          sx={{
            mb: { xs: 0, xl: 2 },
            mt: { xs: 4, xl: 0 },
          }}
        >
          {/* Back Button and Page Title */}
          <Typography variant={"h4"}>{modName.replace("DT ", "")}</Typography>
          Annual Change in Popularity
        </Grid>

        {/* Center Column (2/3 width) */}
        <Grid size={{ md: 6, xs: 12 }}>
          {/* Your display content goes here */}
          <ModDetailChart mod={mod as ModInterface} rawData={rawData} />
        </Grid>

        {/* Right Column (1/6 width) */}

        <Grid size={{ md: 3, xs: 12 }}>&nbsp;</Grid>
        {/* Card for sections */}
        <Grid
          flexDirection={"column"}
          alignItems={"center"}
          size={{ xl: 6, xs: 12 }}
          offset={{ xs: 0, xl: 3 }}
          container
          gap={5}
        >
          {mod.mod_type.toLowerCase() === "chip" ? (
            <Box
              component={Paper}
              sx={{
                p: "1rem",
                borderRadius: 3,
                mt: ".5rem",
              }}
            >
              {/*<UseCaseLegend props={{ name: mod.name }} />*/}
              <LegendMenu onlyOne={true} mod={mod} />
            </Box>
          ) : (
            ""
          )}
          <Box
            component={Paper}
            sx={{
              p: 3,
              borderRadius: 3,
              width: { xs: "100%", md: "auto" },
              minWidth: "360px",
            }}
          >
            <Typography variant={"h5"}>
              {targetFeature.length > 0
                ? targetFeature[0]
                    .split("_")
                    .map((e) => e[0].toUpperCase() + e.slice(1))
                    .join(" ")
                : "Overview"}
            </Typography>
            <Content />
          </Box>
        </Grid>
      </Grid>
    </>
  );
}

export default ModDetailRoute;
