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
import { LegendMenu } from "~/src/UseCaseLegend";
import { Chip } from "~/models/chip";

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

type Stub = string | boolean | string[];
// @ts-ignore
type Nested = Record<string, Stub | Nested>;
interface FlatItem {
  key: string;
  depth: number;
  value: Stub;
}

function flattenNestedObject(obj: Nested, depth = 0, prefix = ""): FlatItem[] {
  const result: FlatItem[] = [];

  for (const key in obj) {
    const fullKey = prefix && prefix !== "data" ? `${prefix}.${key}` : key;
    const value = obj[key];

    if (
      typeof value === "string" ||
      typeof value === "boolean" ||
      (Array.isArray(value) && value.every((item) => typeof item === "string"))
    ) {
      result.push({
        key: fullKey,
        depth,
        value,
      });
    } else if (
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(value)
    ) {
      result.push(...flattenNestedObject(value as Nested, depth + 1, fullKey));
    } else if (
      Array.isArray(value) &&
      value.every((item) => item instanceof Chip)
    ) {
      result.push({
        key: fullKey,
        depth: 1,
        value: value.map((chip) => chip.name),
      });
    } else {
      throw new Error(`Unsupported value at ${fullKey}`);
    }
  }

  return result;
}

const formatWikiLink = (key: string, value: string): string => {
  let link = "https://wiki.dangerousthings.com/";
  key = key
    .toLowerCase()
    .replace("dt ", "")
    .replace("vivokey ", "")
    .replaceAll(" ", "_")
    .replace("chips", "chip");
  value = value
    .toLowerCase()
    .replace("dt ", "")
    .replace("vivokey ", "")
    .replaceAll(" ", "-");

  if (key.includes(".")) {
    link += key.split(".")[0];
  } else {
    link += `${key}/${value}`;
  }

  return link;
};

const NestedListItems = (data: Record<string, any>) => {
  if (!data) {
    return null;
  }
  const listItems = flattenNestedObject(data);

  return (
    <div key={`${data.toString()}`}>
      {listItems
        .filter(
          (item) =>
            (item.value && !item.key.includes("supported")) ||
            item.key.toLowerCase() === "enabled",
        )
        .map((item, i) =>
          Array.isArray(item.value) ? (
            <ListItem key={`header-${item.key}-${i}`}>
              <ListItemText
                primary={item.key
                  .replace(".", "_")
                  .split("_")
                  .map((e) => e[0].toUpperCase() + e.slice(1))
                  .join(" ")}
                secondary={
                  <>
                    {item.value.map((subItem) => (
                      <div
                        key={`${item.key}-${subItem}-item-${i}`}
                        style={{
                          paddingLeft: `${item.depth}rem`,
                        }}
                      >
                        <a href={formatWikiLink(item.key, subItem)}>
                          {subItem
                            .split(" ")
                            .map((e) => e[0].toUpperCase() + e.slice(1))
                            .join(" ")}
                        </a>
                      </div>
                    ))}
                  </>
                }
              />
            </ListItem>
          ) : (
            <ListItem key={`${item.key}-header-${i}`}>
              <ListItemText
                primary={item.key
                  .replace(".", "_")
                  .split("_")
                  .map((e) => e[0].toUpperCase() + e.slice(1))
                  .join(" ")}
                secondary={
                  <span
                    key={`${item.key}-item-${i}`}
                    style={{
                      paddingLeft: `${item.depth}rem`,
                    }}
                  >
                    {typeof item.value === "string" ? (
                      <a href={formatWikiLink(item.key, item.value)}>
                        {item.value}
                      </a>
                    ) : null}
                    {typeof item.value === "boolean"
                      ? item.value.toString()[0].toUpperCase() +
                        item.value.toString().slice(1)
                      : null}
                  </span>
                }
              />
            </ListItem>
          ),
        )}
    </div>
  );
};

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
  const targetFeature = searchParams.getAll("feature"); // There should only be one

  const Content = () => {
    // TODO: Make this more modular so it works better with magnets etc
    let content: any[] = [];

    if (targetFeature.length === 0) {
      content = [
        <ListItem>
          <ListItemText
            primary={"Mod Type"}
            secondary={
              <span style={{ paddingLeft: "1rem" }}>{mod?.mod_type}</span>
            }
          />
        </ListItem>,
        <ListItem>
          <ListItemText
            primary={"Install Method"}
            secondary={
              <span style={{ paddingLeft: "1rem" }}>
                <a
                  href={`https://wiki.dangerousthings.com/install_method/${mod?.install_method.toLowerCase().replace(" ", "-")}`}
                >
                  {mod?.install_method}
                </a>
              </span>
            }
          />
        </ListItem>,
      ];
      if (mod?.mod_type === "chip") {
        content.push(
          <ListItem>
            <ListItemText
              primary={"Description"}
              secondary={
                <span style={{ paddingLeft: "1rem" }}>{mod?.description}</span>
              }
            />
          </ListItem>,
        );
      }
      content.push(
        <ListItem>
          <ListItemText
            primary={"Description"}
            secondary={
              <span style={{ paddingLeft: "1rem" }}>{mod?.description}</span>
            }
          />
        </ListItem>,
      );
      content.push(
        <ListItem>
          <ListItemText
            primary={"Links"}
            secondary={
              <>
                <div style={{ paddingLeft: "1rem" }}>
                  <a
                    href={`https://dngr.us/${mod?.name.toLowerCase().replace("dt ", "").replace("vivokey ", "").replace(" ", "-")}`}
                  >
                    Buy a {mod?.name.replace("DT ", "")}
                  </a>
                </div>
                <div style={{ paddingLeft: "1rem" }}>
                  <a
                    href={`https://wiki.dangerousthings.com/implant-o-pedia/${mod?.name.toLowerCase().replace("dt ", "").replace("vivokey ", "").replace(" ", "-")}`}
                  >
                    Learn more at the wiki
                  </a>
                </div>
              </>
            }
          />
        </ListItem>,
      );
    } else {
      if (!mod?.features[targetFeature[0]].supported) {
        content.push(
          <ListItem>
            <ListItemText secondary={"Not supported."} />
          </ListItem>,
        );
      } else {
        let level = 0;
        switch (targetFeature[0] ?? null) {
          case "smartphone":
          case "legacy_access_control":
          case "digital_security":
          case "data_sharing":
          case "cryptography":
          case "sensors":
          case "blink":
          case "payment":
            content.push(
              // @ts-expect-error
              <NestedListItems data={mod?.details[targetFeature[0]]} />,
            );
            break;
          case "magic":
            Object.keys(mod.details.magic).forEach((key) => {
              content.push(<Typography sx={{ ml: ".5rem" }}>{key}</Typography>);
              content.push(<NestedListItems data={mod?.details.magic[key]} />);
            });
            break;
          default:
            content.push(
              <ListItem>
                <ListItemText secondary={"Supported"} />
              </ListItem>,
            );
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
          flexGrow={0}
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
              <LegendMenu onlyOne={true} mod={mod} />
            </Box>
          ) : (
            <Box minWidth={"360px"}>&nbsp;</Box>
          )}
          <Box
            component={Paper}
            sx={{
              p: 3,
              borderRadius: 3,
              width: { xs: "100%", md: "inherit" },
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
