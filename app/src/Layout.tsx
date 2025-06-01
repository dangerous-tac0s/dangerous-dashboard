import * as React from "react";
import Box from "@mui/material/Box";
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
  Snackbar,
  Alert,
  IconButton,
  SwipeableDrawer,
} from "@mui/material";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useLocation, Link, useSearchParams } from "@remix-run/react";
import { faChevronRight, faLink } from "@fortawesome/pro-regular-svg-icons";
import { faChartSimpleHorizontal } from "@fortawesome/pro-regular-svg-icons/faChartSimpleHorizontal";
import { faMagnifyingGlass } from "@fortawesome/pro-regular-svg-icons/faMagnifyingGlass";
import { faMagnet } from "@fortawesome/pro-light-svg-icons/faMagnet";
import { faMicrochip } from "@fortawesome/pro-light-svg-icons/faMicrochip";
import { LegendMenu } from "~/src/UseCaseLegend";
import Footer from "./Footer";
import { Fragment } from "react";

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
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackBar, setSnackbar] = React.useState({
    content: "",
    type: "success",
  });
  const [clipboardSuccess, setClipboardSuccess] = React.useState(true);

  const path = decodeURIComponent(location.pathname);
  const leading = path.slice(0, 5);

  const handleSnackbarClose = () => setSnackbarOpen(false);

  const GenerateBreadcrumbs = () => {
    const text: React.ReactNode[] = [
      <Link key="/" style={{ textDecoration: "none" }} to={"/"}>
        <Typography>Home</Typography>
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
        return [
          <Grid
            size={{ xs: 12, md: 8 }}
            mb={{
              xs:
                typeFilters.length === 1 && typeFilters.includes("chips")
                  ? 2
                  : 0,
              md: 0,
            }}
            justifyContent={"center"}
            container
          >
            {/*  < container sx={{ flexDirection: "row", flex: 2 }} spacing={2}>*/}
            {typeFilters.length === 1 && typeFilters.includes("chips") ? (
              <LegendMenu />
            ) : (
              ""
            )}
          </Grid>,
          <Grid
            flex={"row"}
            size={{ xs: 12, md: 4 }}
            container={true}
            spacing={2}
            alignItems="center"
          >
            <Grid size={{ xs: 6 }}>
              <FormControl fullWidth={true} size={"small"}>
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
            <Grid size={{ xs: 6 }}>
              <FormControl
                fullWidth={true}
                // sx={{
                //   m: 1,
                //   // width: { xs: "100%", md: 200 },
                // }}
                size={"small"}
              >
                <InputLabel id="type-filter-label">Period</InputLabel>
                <Select
                  // size={"small"}
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
          </Grid>,
        ];
      // return (
      //   <Grid
      //     flexDirection={{ xs: "column-reverse", md: "row" }}
      //     flex={1}
      //     container
      //     my={{ xs: ".5rem", md: 0 }}
      //     spacing={{ xs: ".5rem", md: 0 }}
      //   >
      //     <Grid size={{ xs: 12, md: 8 }}>
      //       {/*  < container sx={{ flexDirection: "row", flex: 2 }} spacing={2}>*/}
      //       {typeFilters.length === 1 && typeFilters.includes("chips") ? (
      //         <LegendMenu />
      //       ) : (
      //         ""
      //       )}
      //     </Grid>
      //     <Grid
      //       flex={"row"}
      //       size={{ xs: 12, md: 4 }}
      //       container={true}
      //       spacing={2}
      //       alignItems="center"
      //     >
      //       <Grid size={{ xs: 6 }}>
      //         <FormControl fullWidth={true} size={"small"}>
      //           <InputLabel id="type-filter-label">Type</InputLabel>
      //           <Select
      //             labelId="type-filter-label"
      //             id="type-filter"
      //             multiple
      //             value={typeFilters}
      //             name={"type"}
      //             onChange={toggleTypeFilter}
      //             input={<OutlinedInput label="Type" />}
      //           >
      //             {types.map((type, i) => {
      //               return (
      //                 <MenuItem
      //                   key={i}
      //                   value={type}
      //                   selected={typeFilters.includes(type)}
      //                 >
      //                   {type[0].toUpperCase() + type.slice(1)}
      //                 </MenuItem>
      //               );
      //             })}
      //           </Select>
      //         </FormControl>
      //       </Grid>
      //       <Grid size={{ xs: 6 }}>
      //         <FormControl
      //           fullWidth={true}
      //           // sx={{
      //           //   m: 1,
      //           //   // width: { xs: "100%", md: 200 },
      //           // }}
      //           size={"small"}
      //         >
      //           <InputLabel id="type-filter-label">Period</InputLabel>
      //           <Select
      //             // size={"small"}
      //             name={"period"}
      //             value={period}
      //             defaultValue={"overall"}
      //             onChange={handlePeriodChange}
      //             sx={{
      //               pr: 2,
      //               py: 0,
      //             }}
      //             input={<OutlinedInput label="Type" />}
      //           >
      //             {periods.map((period, i: number) => (
      //               <MenuItem
      //                 key={i}
      //                 value={period}
      //                 selected={period === period}
      //               >
      //                 {period[0].toUpperCase() + period.slice(1)}
      //               </MenuItem>
      //             ))}
      //           </Select>
      //         </FormControl>
      //       </Grid>
      //     </Grid>
      //     {/*</Grid>*/}
      //   </Grid>
      // );
      default:
        return null;
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const handleClipboard = async () => {
    let success = true;

    try {
      await navigator.clipboard.writeText(window.location.href);
      setTimeout(() => {
        console.error("Unable to set clipboard!");
      }, 2000); // reset
    } catch (err) {
      success = false;
      console.error("Unable to set clipboard: ensure you are using https", err);
    } finally {
      if (success) {
        setSnackbar({ content: "URL copied to clipboard", type: "success" });
      } else {
        setSnackbar({
          content: "Unable to set clipboard: ensure you are using https",
          type: "error",
        });
      }
      setSnackbarOpen(true);
    }
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
      {/*<List>*/}
      {/*  {navItems.map((item, i) => (*/}
      {/*    <ListItem key={i} disablePadding>*/}
      {/*      <ListItemButton*/}
      {/*        sx={{ textAlign: "center" }}*/}
      {/*        role={"button"}*/}
      {/*        component={Link}*/}
      {/*        to={item.route}*/}
      {/*      >*/}
      {/*        <Button*/}
      {/*          variant={"outlined"}*/}
      {/*          fullWidth={true}*/}
      {/*          disabled={item.route === path}*/}
      {/*        >*/}
      {/*          <ListItemText primary={item.name} />*/}
      {/*        </Button>*/}
      {/*      </ListItemButton>*/}
      {/*    </ListItem>*/}
      {/*  ))}*/}
      {/*</List>*/}

      <Divider />
      <FilterComponent />
    </Grid>
  );

  return (
    <Box>
      <AppBar component="nav" position="static">
        <Toolbar
          component={Paper}
          sx={{ flex: 1, justifyContent: "space-between" }}
        >
          <Box minWidth={{ xs: 80, md: "auto" }}>
            <GenerateBreadcrumbs />
          </Box>
          {/* TODO: Switch to hamburger menu on small screens*/}
          {!["chart"].includes(location.pathname.split("/")[1]) ? (
            <Grid container sx={{ justifyContent: "flex-end", flex: 1 }}>
              {navItems.map((item, i) => (
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
              ))}
              {/*<IconButton*/}
              {/*  onClick={handleClipboard}*/}
              {/*  size={"small"}*/}
              {/*  sx={{ display: { xs: "block", md: "none" } }}*/}
              {/*>*/}
              {/*  <FontAwesomeIcon icon={faLink} color="white" />*/}
              {/*</IconButton>*/}
            </Grid>
          ) : (
            <Fragment>
              <Grid container flex={1} display={{ xs: "none", md: "flex" }}>
                <FilterComponent />
              </Grid>
              <Grid
                container
                ml={2}
                // sx={{ display: { xs: "none", md: "flex" } }}
              >
                {["chart", "mod"].includes(location.pathname.split("/")[1]) ? (
                  <IconButton onClick={handleClipboard} size={"small"}>
                    <FontAwesomeIcon icon={faLink} color="white" />
                  </IconButton>
                ) : (
                  ""
                )}
              </Grid>
            </Fragment>
          )}
        </Toolbar>
      </AppBar>

      <nav>
        <SwipeableDrawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          onOpen={handleDrawerToggle}
          anchor={"top"}
          ModalProps={{ keepMounted: true }}
          disableSwipeToOpen={false}
        >
          {/*{drawer}*/}
          <Grid
            flex={1}
            direction="column-reverse"
            container
            spacing={2}
            mt={2}
            mx={2}
          >
            <FilterComponent />
          </Grid>
        </SwipeableDrawer>
      </nav>

      <Grid
        container
        direction="column"
        spacing={2}
        flex={1}
        mx={"auto"}
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
        <Footer />
      </Container>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={snackbarOpen}
        onClose={handleSnackbarClose}
        message={snackBar.content}
        key={"toast"}
        autoHideDuration={2000}
      >
        {/* @ts-expect-error */}
        <Alert severity={snackBar.type} variant={"filled"}>
          {snackBar.content}
        </Alert>
      </Snackbar>
    </Box>
  );
}
