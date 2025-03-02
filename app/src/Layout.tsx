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
} from "@mui/material";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useLocation, Link } from "@remix-run/react";
import { faChevronRight } from "@fortawesome/pro-regular-svg-icons";
import { faCalendar } from "@fortawesome/pro-regular-svg-icons/faCalendar";
import { faGear } from "@fortawesome/pro-regular-svg-icons/faGear";
import { useLayout } from "./LayoutContext"; // Import LayoutContext
import { defaults } from "./LayoutContext";
import theme from "~/src/theme";
import { faChartSimpleHorizontal } from "@fortawesome/pro-regular-svg-icons/faChartSimpleHorizontal";

const navItems = [
  // { name: "About", route: "/about" },
  {
    name: "Chart",
    route: "/chart",
    icon: <FontAwesomeIcon icon={faChartSimpleHorizontal} />,
  },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { filters, setFilters, setTypeFilter } = useLayout();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const path = decodeURIComponent(location.pathname);
  const leading = path.slice(0, 5);

  const GenerateBreadcrumbs = () => {
    const text: React.ReactNode[] = [
      <Link key="/" style={{ textDecoration: "none" }} to={"/"}>
        <Typography display={{ md: "block", xs: "none", sm: "none" }}>
          Dangerous Dashboard
        </Typography>
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

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  // TODO: Decide if this is going to be helpful... Maybe show the full filtering config?
  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
      <Divider />
      <List>
        {navItems.map((item, i) => (
          <ListItem key={i} disablePadding>
            <ListItemButton
              sx={{ textAlign: "center" }}
              role={"button"}
              component={Link}
              to={item.route}
            >
              <ListItemText primary={item.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const FilterComponent = () => {
    switch (location.pathname) {
      case "/chart":
        return (
          <Grid container sx={{ flexDirection: "row", flex: 1 }}>
            <Box>
              <FormControl sx={{ m: 1, width: 300 }} size={"small"}>
                <InputLabel id="type-filter-label">Type</InputLabel>
                <Select
                  labelId="type-filter-label"
                  id="type-filter"
                  multiple
                  value={filters["/chart"]["type"]
                    .filter((t: { name: string; active: boolean }) =>
                      t.name === "" ? !t.active : t.active,
                    )
                    .map((t: { name: string; active: boolean }) => t.name)}
                  onChange={setTypeFilter}
                  input={<OutlinedInput label="Type" />}
                >
                  {filters["/chart"]["type"].map(
                    (
                      type: {
                        name: string;
                        active: boolean;
                        icon?: React.ReactNode;
                      },
                      i: number,
                    ) => (
                      <MenuItem
                        key={i}
                        value={type.name}
                        selected={type.active}
                      >
                        {type.name[0].toUpperCase() + type.name.slice(1)}
                      </MenuItem>
                    ),
                  )}
                </Select>
              </FormControl>
            </Box>
            <Grid container alignItems={"center"} pl={2}>
              <FontAwesomeIcon icon={faCalendar} size={"xl"} />
              <FormControl sx={{ m: 1, width: 300 }} size={"small"}>
                <InputLabel id="type-filter-label">Period</InputLabel>
                <Select
                  size={"small"}
                  name={"period"}
                  value={
                    filters["/chart"]["period"].find(
                      (e: { name: string; active: boolean }) => e.active,
                    ).name
                  }
                  onChange={(e) => {
                    setFilters((prev: any) => ({
                      ...prev,
                      [location.pathname]: {
                        ...filters[location.pathname],
                        period: [
                          ...defaults["/chart"]["period"].map((p) => ({
                            name: p.name,
                            active: p.name === e.target.value,
                          })),
                        ],
                      },
                    }));
                  }}
                  sx={{
                    pr: 2,
                    py: 0,
                  }}
                  input={<OutlinedInput label="Type" />}
                >
                  {filters[location.pathname]["period"].map(
                    (item: { name: string; active: boolean }, i: number) => (
                      <MenuItem
                        key={i}
                        value={item.name}
                        selected={item.active}
                      >
                        {item.name[0].toUpperCase() + item.name.slice(1)}
                      </MenuItem>
                    ),
                  )}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );
      default:
        return null;
    }
  };

  return (
    <Box>
      <AppBar
        component="nav"
        position="static"
        sx={{ backgroundColor: theme.palette.action.active }}
      >
        <Toolbar>
          <Box flexGrow={1}>
            <GenerateBreadcrumbs />
          </Box>

          {/* TODO: Switch to hamburger menu on small screens*/}
          <Box>
            {!["/chart"].includes(location.pathname) ? (
              navItems.map((item, i) => (
                <Button
                  component={Link}
                  key={i}
                  sx={{ color: "#fff" }}
                  to={item.route}
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
