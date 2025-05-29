import {
  ButtonGroup,
  ClickAwayListener,
  Grid,
  Grow,
  IconButton,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  Tooltip,
} from "@mui/material";
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
import { faShareFromSquare } from "@fortawesome/pro-light-svg-icons/faShareFromSquare";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import theme from "~/src/theme";
import React, { useEffect } from "react";
import { faArrowDown } from "@fortawesome/pro-regular-svg-icons";
import { useSearchParams } from "@remix-run/react";

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

export function SplitButton({
  icon,
  onClickButton,
  buttonActive,
  onOptionClick,
  options,
}) {
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = React.useState(1);
  const [thumbIconOpacity, setThumbIconOpacity] = React.useState(0);
  const [thumbColor, setThumbColor] = React.useState(
    theme.palette.action.disabled,
  );
  const [dropDownDisabled, setDropDownDisabled] = React.useState(true);
  const [buttonBorder, setButtonBorder] = React.useState(0);

  options = options ?? [];

  const handleClick = () => {
    console.info(`You clicked ${options[selectedIndex]}`);
  };

  const handleMenuItemClick = (
    event: React.MouseEvent<HTMLLIElement, MouseEvent>,
    index: number,
  ) => {
    setSelectedIndex(index);
    setOpen(false);
  };

  const handleToggle = () => {
    if (buttonActive && options.length > 0) {
      setOpen((prevOpen) => !prevOpen);
    }
  };

  const handleClose = (event: Event) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }

    setOpen(false);
  };

  useEffect(() => {
    if (buttonActive) {
      if (options.length > 0) {
        setButtonBorder(1);
        setThumbIconOpacity(1);
        setThumbColor(theme.palette.action.active);
        setDropDownDisabled(false);
      }
    }
    if (!buttonActive) {
      setThumbIconOpacity(0);
      setButtonBorder(0);
      setThumbColor(theme.palette.action.disabled);
      setDropDownDisabled(true);
    }
  }, [buttonActive]);

  return (
    <React.Fragment>
      <ButtonGroup
        color={theme.palette.primary.dark}
        ref={anchorRef}
        aria-label="Button group with a nested menu"
      >
        <Button sx={{ border: buttonBorder }} onClick={onClickButton}>
          {icon}
        </Button>
        <Button
          size="small"
          aria-controls={open ? "split-button-menu" : undefined}
          aria-expanded={open ? "true" : undefined}
          aria-haspopup="menu"
          onClick={handleToggle}
          disabled={dropDownDisabled}
          sx={{
            border: buttonBorder,
            "&.Mui-disabled": {
              border: 0, // if you want to override the default opacity
            },
          }}
        >
          <FontAwesomeIcon
            opacity={thumbIconOpacity}
            color={thumbColor}
            icon={faArrowDown}
          />
        </Button>
      </ButtonGroup>
      <Popper
        sx={{ zIndex: 1 }}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === "bottom" ? "center top" : "center bottom",
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id="split-button-menu" autoFocusItem>
                  {options.map((option, index) => (
                    <MenuItem
                      key={index}
                      disabled={index === 2}
                      selected={index === selectedIndex}
                      onClick={(event) => handleMenuItemClick(event, index)}
                    >
                      {option}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </React.Fragment>
  );
}

export const LegendMenu = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const elements = makeLegendElements();
  const chipFilters = searchParams.getAll("chip");

  // let mod = null;
  // if (name && Object.keys(CHIP_IMPLANT_MAP).includes(name)) {
  //   mod = CHIP_IMPLANT_MAP[name]();
  // }

  const toggleChipFilter = (chipName: string) => {
    console.log(chipFilters);
    if (chipFilters.includes(chipName)) {
      setSearchParams(
        (prev) => {
          prev.delete("chip", chipName);
          return prev;
        },
        { replace: true },
      );
    } else {
      setSearchParams(
        (prev) => {
          prev.append("chip", chipName);
          return prev;
        },
        { replace: true },
      );
    }
  };

  return (
    <Grid
      justifyContent={"space-evenly"}
      container
      display={"flex"}
      flexGrow={2}
      alignItems={"center"}
      // mx={"1rem"}
    >
      {Object.keys(elements).map((key, i) => (
        <SplitButton
          key={i}
          icon={
            <Typography
              color={
                chipFilters.includes(key)
                  ? theme.palette.action.active
                  : theme.palette.action.disabled
              }
            >
              {elements[key].icon}
            </Typography>
          }
          buttonActive={() => chipFilters.includes(key)}
          onClickButton={() => toggleChipFilter(key)}
          options={[]}
        />
      ))}
    </Grid>
  );
};

const LegendPopup = () => {
  const elements = makeLegendElements();

  const featureMap = { ...elements };

  featureMap["smartphone"]["tooltip"] = "Not Compatible with Smartphones";
  featureMap["legacy_access_control"]["tooltip"] =
    "Not Compatible with Legacy Access Control";
  featureMap["blink"]["tooltip"] = "Doesn't have an LED";
  featureMap["magic"]["tooltip"] = "Doesn't Support Cloning";
  featureMap["data_sharing"]["tooltip"] = "Can't Share Data";
  featureMap["digital_security"]["tooltip"] = "Doesn't Offer Digital Security";
  featureMap["payment"]["tooltip"] = "Doesn't Support Payment";
  featureMap["temperature"]["tooltip"] = "Can't Take Temperature";

  // mod.summary.forEach((feature) => {
  //   if (feature.feature === "Frequency") {
  //     if (feature.value === "LF" || feature.value === "Dual") {
  //       featureMap["legacy_access_control"]["color"] = "white";
  //       featureMap["legacy_access_control"]["tooltip"] =
  //         "Compatible with Legacy Access Control Systems";
  //     }
  //     if (feature.value === "HF" || feature.value === "Dual") {
  //       featureMap["smartphone"]["color"] = "white";
  //       featureMap["smartphone"]["tooltip"] = "Smartphone Compatible";
  //     }
  //   } else if (feature.feature === "Data Sharing") {
  //     featureMap["data_sharing"]["color"] = "white";
  //     featureMap["data_sharing"]["tooltip"] =
  //       `Data Sharing: ${feature.value}`;
  //   } else if (feature.feature === "Magic") {
  //     featureMap["magic"]["color"] = "white";
  //     featureMap["magic"]["tooltip"] = `Magic: ${feature.value}`;
  //   } else if (feature.feature === "Temperature") {
  //     featureMap["temperature"]["color"] = "white";
  //     featureMap["temperature"]["tooltip"] = "Can Take Temperature";
  //   } else if (feature.feature === "Digital Security") {
  //     featureMap["digital_security"]["color"] = "white";
  //     featureMap["digital_security"]["tooltip"] =
  //       "Has Digital Security Features";
  //   } else if (feature.feature === "Blink") {
  //     featureMap["blink"]["color"] = "white";
  //     featureMap["blink"]["tooltip"] = feature.value;
  //   } else if (feature.feature === "Payment") {
  //     featureMap["payment"]["color"] =
  //       feature.value === "Yes" ? "white" : "yellow";
  //     featureMap["payment"]["tooltip"] = feature.value;
  //   }
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
          justifyContent: "space-evenly",
          flex: 1,
          py: 2,
        }}
        gap={{ xs: 3, sm: 0 }}
      >
        {/*<Grid sx={{ xs: 12, md: 6 }} container>*/}
        {Object.keys(featureMap).map((e, i) => (
          <Tooltip key={i} title={featureMap[e].tooltip}>
            <Stack color={featureMap[e].color ?? "red"} mx={1}>
              {featureMap[e].icon}
            </Stack>
          </Tooltip>
        ))}
        {/*{Object.keys(featureMap)*/}
        {/*  .slice(4)*/}
        {/*  .map((e, i) => (*/}
        {/*    <Tooltip key={i} title={featureMap[e].tooltip}>*/}
        {/*      <Stack color={featureMap[e].color ?? "red"} mx={1}>*/}
        {/*        {featureMap[e].icon}*/}
        {/*      </Stack>*/}
        {/*    </Tooltip>*/}
        {/*  ))}*/}
        {/*</Grid>*/}
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
