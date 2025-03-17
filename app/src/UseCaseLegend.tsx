import { Grid, IconButton, Paper, Tooltip } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Stack } from "@mui/system";
import { faKeySkeleton } from "@fortawesome/pro-light-svg-icons/faKeySkeleton";
import { faBinaryLock } from "@fortawesome/pro-light-svg-icons/faBinaryLock";
import { faLightbulb } from "@fortawesome/pro-light-svg-icons/faLightbulb";
import { faCopy } from "@fortawesome/pro-light-svg-icons/faCopy";
import { faCreditCard } from "@fortawesome/pro-light-svg-icons/faCreditCard";
import { faMobileSignal } from "@fortawesome/pro-light-svg-icons/faMobileSignal";
import {
  CHIP_IMPLANT_MAP,
  ChipImplant,
  ChipImplantInterface,
} from "~/models/chip_implant";
import { faThermometer } from "@fortawesome/pro-light-svg-icons/faThermometer";
import { faShareFromSquare } from "@fortawesome/pro-light-svg-icons/faShareFromSquare";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import theme from "~/src/theme";
import Box from "@mui/material/Box";
import { useLayout } from "~/src/LayoutContext";

const makeLegendElements = (): {
  [key: string]: {
    name: string;
    icon: any;
    color: null | string;
    tooltip: null | string;
  };
} => {
  return Object.assign(
    {},
    {
      smartphone: {
        name: "Smartphone",
        icon: <FontAwesomeIcon size="xl" icon={faMobileSignal} />,
        color: null,
        tooltip: null,
      },
      legacy_access_control: {
        name: "Legacy Access Control",
        icon: <FontAwesomeIcon size="xl" icon={faKeySkeleton} />,
        color: null,
        tooltip: null,
      },
      digital_security: {
        name: "Digital Security",
        icon: <FontAwesomeIcon size="xl" icon={faBinaryLock} />,
        color: null,
        tooltip: null,
      },
      data_sharing: {
        name: "Data Sharing",
        icon: <FontAwesomeIcon size="xl" icon={faShareFromSquare} />,
        color: null,
        tooltip: null,
      },
      payment: {
        name: "Payment",
        icon: <FontAwesomeIcon size="xl" icon={faCreditCard} />,
        color: null,
        tooltip: null,
      },
      magic: {
        name: "Magic",
        icon: <FontAwesomeIcon size="xl" icon={faCopy} />,
        color: null,
        tooltip: null,
      },
      blink: {
        name: "Blink",
        icon: <FontAwesomeIcon size="xl" icon={faLightbulb} />,
        color: null,
        tooltip: null,
      },
      temperature: {
        name: "Temperature",
        icon: <FontAwesomeIcon size="xl" icon={faThermometer} />,
        color: null,
        tooltip: null,
      },
    },
  );
};

export const LegendMenu = () => {
  const { filters, toggleChipFilter } = useLayout();
  const chipFilters = filters["/chart"].chip;

  const elements = makeLegendElements();

  return (
    <Grid
      justifyContent={"space-evenly"}
      container
      display={"flex"}
      flexGrow={2}
      alignItems={"center"}
      mx={"1rem"}
    >
      {Object.keys(elements).map((key, i) => (
        <IconButton
          size={"small"}
          key={i}
          onClick={() => toggleChipFilter(key.toLowerCase().replace(" ", "_"))}
        >
          <Typography
            color={
              chipFilters[key.toLowerCase()]
                ? theme.palette.action.active
                : theme.palette.action.disabled
            }
          >
            {elements[key].icon}
          </Typography>
        </IconButton>
      ))}
    </Grid>
  );
};

const UseCaseLegend = ({
  props,
}: {
  props?: {
    name?: string;
    asButtons: { [key: string]: { onClick: any; color: string } };
  };
}) => {
  let mod = null;
  if (props && Object.hasOwn(props, "name")) {
    const { name } = props;
    if (name && Object.keys(CHIP_IMPLANT_MAP).includes(name)) {
      mod = CHIP_IMPLANT_MAP[name]();
    }
  }
  const elements: {
    [key: string]: {
      name: string;
      icon: any;
      color: null | string;
      tooltip: null | string;
    };
  } = makeLegendElements();

  if (mod) {
    const featureMap = { ...elements };

    featureMap["smartphone"]["tooltip"] = "Not Compatible with Smartphones";
    featureMap["legacy_access_control"]["tooltip"] =
      "Not Compatible with Legacy Access Control";
    featureMap["blink"]["tooltip"] = "Doesn't have an LED";
    featureMap["magic"]["tooltip"] = "Doesn't Support Cloning";
    featureMap["data_sharing"]["tooltip"] = "Can't Share Data";
    featureMap["digital_security"]["tooltip"] =
      "Doesn't Offer Digital Security";
    featureMap["payment"]["tooltip"] = "Doesn't Support Payment";
    featureMap["temperature"]["tooltip"] = "Can't Take Temperature";

    mod.summary.forEach((feature) => {
      if (feature.feature === "Frequency") {
        if (feature.value === "LF" || feature.value === "Dual") {
          featureMap["legacy_access_control"]["color"] = "white";
          featureMap["legacy_access_control"]["tooltip"] =
            "Compatible with Legacy Access Control Systems";
        }
        if (feature.value === "HF" || feature.value === "Dual") {
          featureMap["smartphone"]["color"] = "white";
          featureMap["smartphone"]["tooltip"] = "Smartphone Compatible";
        }
      } else if (feature.feature === "Data Sharing") {
        featureMap["data_sharing"]["color"] = "white";
        featureMap["data_sharing"]["tooltip"] =
          `Data Sharing: ${feature.value}`;
      } else if (feature.feature === "Magic") {
        featureMap["magic"]["color"] = "white";
        featureMap["magic"]["tooltip"] = `Magic: ${feature.value}`;
      } else if (feature.feature === "Temperature") {
        featureMap["temperature"]["color"] = "white";
        featureMap["temperature"]["tooltip"] = "Can Take Temperature";
      } else if (feature.feature === "Digital Security") {
        featureMap["digital_security"]["color"] = "white";
        featureMap["digital_security"]["tooltip"] =
          "Has Digital Security Features";
      } else if (feature.feature === "Blink") {
        featureMap["blink"]["color"] = "white";
        featureMap["blink"]["tooltip"] = feature.value;
      } else if (feature.feature === "Payment") {
        featureMap["payment"]["color"] =
          feature.value === "Yes" ? "white" : "yellow";
        featureMap["payment"]["tooltip"] = feature.value;
      }
    });
    return (
      <Grid
        container
        sx={{
          flexDirection: "row",
          justifyContent: "center",
        }}
        gap={{ xs: 3, sm: 0 }}
      >
        <Grid sx={{ xs: 12, md: 6 }} container>
          {Object.keys(featureMap)
            .slice(0, 4)
            .map((e, i) => (
              <Tooltip key={i} title={featureMap[e].tooltip}>
                <Stack color={featureMap[e].color ?? "red"} mx={1}>
                  {featureMap[e].icon}
                </Stack>
              </Tooltip>
            ))}
        </Grid>{" "}
        <Grid sx={{ xs: 12, md: 6 }} container>
          {Object.keys(featureMap)
            .slice(4)
            .map((e, i) => (
              <Tooltip key={i} title={featureMap[e].tooltip}>
                <Stack color={featureMap[e].color ?? "red"} mx={1}>
                  {featureMap[e].icon}
                </Stack>
              </Tooltip>
            ))}
        </Grid>
      </Grid>
    );
  }
  if (props && Object.hasOwn(props, "asButtons")) {
    Object.keys(elements).forEach((key) => {
      elements[key]["onClick"] = props["asButtons"][key].onClick;
      elements[key]["color"] = props["asButtons"][key].color;
    });
  }
  return (
    <Grid
      container
      sx={{
        flexDirection: "row",
        justifyContent: "space-evenly",
      }}
      spacing={1}
    >
      {Object.keys({ ...elements }).map((e, i) => (
        <Tooltip key={i} title={elements[e].name}>
          {Object.hasOwn(elements["hf"], "onClick") ? (
            <IconButton onClick={elements[e].onClick} size={"small"}>
              <Typography component={"p"} sx={{ color: elements[e].color }}>
                {elements[e].icon}
              </Typography>
            </IconButton>
          ) : (
            elements[e].icon
          )}
        </Tooltip>
      ))}
    </Grid>
  );
};

export default UseCaseLegend;
