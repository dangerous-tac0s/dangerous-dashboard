import * as React from "react";
import Box from "@mui/material/Box";
import Copyright from "./Copyright";
import {
  AppBar,
  Divider,
  SwipeableDrawer as Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
  Grid,
  Breadcrumbs,
  Select,
  MenuItem,
  OutlinedInput,
  Container,
  Paper,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from "@mui/material";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useLocation, Link, useSearchParams } from "@remix-run/react";
import { faChevronRight } from "@fortawesome/pro-regular-svg-icons";
import { faGear } from "@fortawesome/pro-regular-svg-icons/faGear";
import { faChartSimpleHorizontal } from "@fortawesome/pro-regular-svg-icons/faChartSimpleHorizontal";
import { faMagnifyingGlass } from "@fortawesome/pro-regular-svg-icons/faMagnifyingGlass";
import { faMagnet } from "@fortawesome/pro-light-svg-icons/faMagnet";
import { faMicrochip } from "@fortawesome/pro-light-svg-icons/faMicrochip";
import { LegendMenu } from "~/src/UseCaseLegend";

const navItems = [
  // { name: "About", route: "/about" },
  {
    name: "Chart",
    route: "/chart",
    icon: <FontAwesomeIcon icon={faChartSimpleHorizontal} />,
  },
  {
    name: "Finder",
    route: "/finder",
    icon: <FontAwesomeIcon icon={faMagnifyingGlass} />,
  },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const path = decodeURIComponent(location.pathname);
  const leading = path.slice(0, 5);

  const GenerateBreadcrumbs = () => {
    const text: React.ReactNode[] = [
      <Link key="/" style={{ textDecoration: "none" }} to={"/"}>
        <Typography display={{ lg: "block", xs: "none" }}>Home</Typography>
      </Link>,
    ];

    switch (leading) {
      case "/":
        text[0] = (
          <Box key="/">
            <Typography display={{ md: "block", xs: "none", sm: "none" }}>
              Dangerous Dashboard
            </Typography>
          </Box>
        );
        break;
      case "/abou":
        text.push(<Typography key="about">About</Typography>);
        break;
      case "/char":
        text.push(<Typography key="chart">Chart</Typography>);
        break;
      case "/mod/":
        text.push(
          <Link key="mod-link" style={{ textDecoration: "none" }} to={"/chart"}>
            Chart
          </Link>,
        );
        text.push(
          <Typography key="mod-name">
            {path.slice(5).replace(/^(DT|VK)/, "")}
          </Typography>,
        );
        break;
      default:
        text.push(<Typography key="unknown">Unknown Route</Typography>);
    }

    return (
      <Breadcrumbs
        maxItems={3}
        separator={<FontAwesomeIcon icon={faChevronRight} />}
        aria-label="breadcrumb"
        sx={{ marginRight: "1rem" }}
      >
        {text.map((item, i) => (
          <div key={i}>{item}</div>
        ))}
      </Breadcrumbs>
    );
  };

  const typeFilterIconMap = {
    chips: <FontAwesomeIcon size={"sm"} icon={faMicrochip} />,
    magnets: <FontAwesomeIcon size={"sm"} icon={faMagnet} />,
  };

  const FilterComponent = () => {
    const periods = ["overall", "2019", "2020", "2021", "2022", "2023", "2024"];
    const types = ["chips", "magnets"];
    const chipFeatures = [];
    const [searchParams, setSearchParams] = useSearchParams();

    const toggleChipFilter = (chipName: string) => {
      const chipFilters = searchParams
        .getAll(chipName)
        .filter((e) => e.length > 0);
      if (chipFilters.includes("chip")) {
        setSearchParams((prev) => {
          prev.delete("chip", chipName);
          return prev;
        });
      } else {
        setSearchParams((prev) => {
          prev.append("chip", chipName);
          return prev;
        });
      }
    };

    const handlePeriodChange = (event: SelectChangeEvent<string>) => {
      searchParams.set("period", event.target?.value ?? "overall");

      setSearchParams(searchParams);
    };

    const toggleTypeFilter = (event: SelectChangeEvent<string[]>) => {
      event.preventDefault();

      const type = event.target?.value ?? [];
      searchParams.delete("type");

      if (type.length === 1) {
        searchParams.set("type", type[0]);
      } else if (type.length > 1) {
        searchParams.set("type", type[1]);
      }

      setSearchParams(searchParams);
    };

    switch (path) {
      case "/chart":
        let typeFilters: string[] = [];

        if (searchParams.has("type")) {
          typeFilters = searchParams.getAll("type");
        }

        const period = searchParams.get("period") ?? "overall";

        return (
          <>
            {/*  < container sx={{ flexDirection: "row", flex: 2 }} spacing={2}>*/}
            {typeFilters.length === 1 && typeFilters.includes("chips") ? (
              <LegendMenu />
            ) : (
              ""
            )}
            <Grid
              container
              sx={{
                flexDirection: {
                  lg: "row",
                  xs: "column",
                },
              }}
            >
              <Grid>
                <FormControl
                  sx={{
                    m: 1,
                    width: 200,
                  }}
                  size={"small"}
                >
                  <InputLabel id="type-filter-label">Type</InputLabel>
                  <Select
                    labelId="type-filter-label"
                    id="type-filter"
                    multiple
                    value={typeFilters}
                    name={"type"}
                    onChange={toggleTypeFilter}
                    input={<OutlinedInput label="Type" />}
                  >
                    {types.map((type, i) => {
                      return (
                        <MenuItem
                          key={i}
                          value={type}
                          selected={typeFilters.includes(type)}
                        >
                          {type[0].toUpperCase() + type.slice(1)}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Grid>
              <Grid container alignItems={"center"}>
                <FormControl sx={{ m: 1, width: 200 }} size={"small"}>
                  <InputLabel id="type-filter-label">Period</InputLabel>
                  <Select
                    size={"small"}
                    name={"period"}
                    value={period}
                    defaultValue={"overall"}
                    onChange={handlePeriodChange}
                    sx={{
                      pr: 2,
                      py: 0,
                    }}
                    input={<OutlinedInput label="Type" />}
                  >
                    {periods.map((period, i: number) => (
                      <MenuItem
                        key={i}
                        value={period}
                        selected={period === period}
                      >
                        {period[0].toUpperCase() + period.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            {/*</Grid>*/}
          </>
        );
      default:
        return null;
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  // TODO: Decide if this is going to be helpful... Maybe show the full filtering config?
  const drawer = (
    <Grid
      container
      onClick={handleDrawerToggle}
      sx={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Divider />
      <FilterComponent />
      <List>
        {navItems.map((item, i) => (
          <ListItem key={i} disablePadding>
            <ListItemButton
              sx={{ textAlign: "center" }}
              role={"button"}
              component={Link}
              to={item.route}
            >
              <Button
                variant={"outlined"}
                fullWidth={true}
                disabled={item.route === path}
              >
                <ListItemText primary={item.name} />
              </Button>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Grid>
  );

  return (
    <Box>
      <AppBar component="nav" position="static">
        <Toolbar component={Paper}>
          <Box>
            <GenerateBreadcrumbs />
          </Box>
          {/* TODO: Switch to hamburger menu on small screens*/}
          <Box
            sx={{
              display: "flex",
              flexGrow: 1,
              justifyContent: "flex-end",
            }}
          >
            {!["/chart"].includes(location.pathname) ? (
              navItems.map((item, i) => (
                <Button
                  component={Link}
                  key={i}
                  sx={{ color: "#fff" }}
                  to={item.route}
                  disabled={item.name.toLowerCase() === "finder"}
                >
                  {item.icon ?? item.name}
                  <Typography display={{ xs: "none", sm: "block" }} pl={1}>
                    {item.name}
                  </Typography>
                </Button>
              ))
            ) : (
              <FilterComponent />
            )}
          </Box>
          <Button onClick={handleDrawerToggle} disabled>
            <FontAwesomeIcon icon={faGear} />
          </Button>
        </Toolbar>
      </AppBar>

      <nav>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          onOpen={handleDrawerToggle}
          anchor={"top"}
          ModalProps={{ keepMounted: true }}
        >
          {drawer}
        </Drawer>
      </nav>

      <Grid
        container
        direction="column"
        spacing={2}
        flex={1}
        alignItems="center"
        pb={10}
      >
        {children}
      </Grid>
      <Container
        component={Paper}
        sx={{
          padding: 2,
          textAlign: "center",
          position: "fixed",
          bottom: 0,
          px: 0,
          mx: 0,
          minWidth: "100vw",
        }}
      >
        <Copyright />
      </Container>
    </Box>
  );
}
