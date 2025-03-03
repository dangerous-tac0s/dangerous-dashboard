import { Grid, Tooltip } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Stack } from "@mui/system";
import { faKeySkeleton } from "@fortawesome/pro-light-svg-icons/faKeySkeleton";
import { faBinaryLock } from "@fortawesome/pro-light-svg-icons/faBinaryLock";
import { faLightbulb } from "@fortawesome/pro-light-svg-icons/faLightbulb";
import { faCopy } from "@fortawesome/pro-light-svg-icons/faCopy";
import { faCreditCard } from "@fortawesome/pro-light-svg-icons/faCreditCard";
import { faMobileSignal } from "@fortawesome/pro-light-svg-icons/faMobileSignal";
import { CHIP_IMPLANT_MAP } from "~/models/chip_implant";
import { faThermometer } from "@fortawesome/pro-light-svg-icons/faThermometer";

const elements: {
  [key: string]: {
    name: string;
    icon: any;
    color: null | string;
    tooltip: null | string;
  };
} = {
  hf: {
    name: "HF",
    icon: <FontAwesomeIcon size="xl" icon={faMobileSignal} />,
    color: null,
    tooltip: null,
  },
  lf: {
    name: "LF",
    icon: <FontAwesomeIcon size="xl" icon={faKeySkeleton} />,
    color: null,
    tooltip: null,
  },
  smartcard: {
    name: "SmartCard",
    icon: <FontAwesomeIcon size="xl" icon={faBinaryLock} />,
    color: null,
    tooltip: null,
  },
  data_sharing: {
    name: "Data Sharing",
    icon: <FontAwesomeIcon size="xl" icon={faCopy} />,
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
};

const UseCaseLegend = ({ props }: { props?: { name?: string } }) => {
  let mod = null;
  if (props) {
    const { name } = props;
    if (name && Object.keys(CHIP_IMPLANT_MAP).includes(name)) {
      mod = CHIP_IMPLANT_MAP[name]();
      console.log(mod.summary);
    }
  }

  if (mod) {
    const featureMap = { ...elements };

    featureMap["hf"]["tooltip"] = "Not Compatible with Smartphones";
    featureMap["lf"]["tooltip"] = "Not Compatible with Legacy Access Control";
    featureMap["blink"]["tooltip"] = "Doesn't have an LED";
    featureMap["magic"]["tooltip"] = "Doesn't Support Cloning";
    featureMap["data_sharing"]["tooltip"] = "Can't Share Data";
    featureMap["smartcard"]["tooltip"] = "Doesn't Offer Digital Security";
    featureMap["payment"]["tooltip"] = "Doesn't Support Payment";
    featureMap["temperature"]["tooltip"] = "Can't Take Temperature";

    mod.summary.forEach((feature) => {
      console.log(mod.name);
      if (feature.feature === "Frequency") {
        console.log(feature.value);
        if (feature.value === "LF" || feature.value === "Dual") {
          featureMap["lf"]["color"] = "white";
          featureMap["lf"]["tooltip"] =
            "Compatible with Legacy Access Control Systems";
        }
        if (feature.value === "HF" || feature.value === "Dual") {
          featureMap["hf"]["color"] = "white";
          featureMap["hf"]["tooltip"] = "Smartphone Compatible";
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
      }
    });
    return (
      <Grid
        container
        sx={{ flex: 1, flexDirection: "row", justifyContent: "space-evenly" }}
      >
        {Object.keys(featureMap).map((e, i) => (
          <Tooltip key={i} title={featureMap[e].tooltip}>
            <Stack color={featureMap[e].color ?? "red"} mx={1}>
              {featureMap[e].icon}
            </Stack>
          </Tooltip>
        ))}
        <Stack direction="column" alignItems="center" justifyContent="center">
          {/*<FontAwesomeIcon*/}
          {/*  icon={faWifi}*/}
          {/*  style={{ marginTop: "-1.2em", marginRight: "-1.5em" }}*/}
          {/*/>*/}
        </Stack>
      </Grid>
    );
  }
  return (
    <Grid
      container
      sx={{
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-evenly",
        flexGrow: 1,
      }}
    >
      {Object.keys(elements).map((e, i) => (
        <Tooltip key={i} title={elements[e].name}>
          <Stack mx={1}>{elements[e].icon}</Stack>
        </Tooltip>
      ))}
    </Grid>
  );
};

export default UseCaseLegend;
