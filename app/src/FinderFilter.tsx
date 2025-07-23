import {
  Avatar,
  Divider,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Switch,
  Tooltip,
} from "@mui/material";
import Box from "@mui/material/Box";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/pro-solid-svg-icons";
import React from "react";
import { useSearchParams } from "@remix-run/react";

const defaultFilters = {
  only_new: false,
  hide_discontinued: true,
  hide_unreleased: true,
};

const FinderFilter = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [searchParams, setSearchParams] = useSearchParams();

  /**
   * This handles the menu opening
   * @param event
   */
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  /**
   * Menu close
   */
  const handleClose = () => {
    setAnchorEl(null);
  };

  /**
   * Menu option click
   * @param e
   * @param filter
   */
  const handleFilterChange = (e: React.SyntheticEvent, filter: string) => {
    e.preventDefault();
    const newState = !filters[filter];
    let newFilters = { ...filters };
    if (Object.keys(filters).includes("only_new")) {
      newFilters = { ...defaultFilters };
    }
    setFilters({ ...newFilters, [filter]: newState });
    setSearchParams((prev) => {
      if (!newState) {
        prev.delete("filter", filter);
      } else {
        if (filter === "only_new") {
          prev.delete("filter");
        }
        prev.set("filter", filter);
      }
      return prev;
    });
    handleClose();
  };

  const [filters, setFilters] = React.useState<Record<string, boolean>>({
    ...defaultFilters,
  });

  return (
    <Grid>
      <Box sx={{ display: "flex", alignItems: "center", textAlign: "center" }}>
        <Tooltip title="Other Filters">
          <IconButton
            onClick={handleClick}
            size="small"
            aria-controls={open ? "filter-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: "white" }}>
              <FontAwesomeIcon icon={faFilter} />
            </Avatar>
          </IconButton>
        </Tooltip>
      </Box>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              overflow: "visible",
              filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
              mt: 1.5,
              "& .MuiAvatar-root": {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              "&::before": {
                content: '""',
                display: "block",
                position: "absolute",
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: "background.paper",
                transform: "translateY(-50%) rotate(45deg)",
                zIndex: 0,
              },
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem>
          Show only new
          <Switch
            onChange={(e) => handleFilterChange(e, "only_new")}
            checked={filters.only_new}
          />
        </MenuItem>
        <MenuItem
          onClick={(e) => handleFilterChange(e, "show_discontinued")}
          disabled={filters.only_new}
        >
          {filters.show_discontinued ? "Showing" : "Hiding"} Discontinued
        </MenuItem>
        <MenuItem
          onClick={(e) => handleFilterChange(e, "show_unreleased")}
          disabled={filters.only_new}
        >
          {filters.show_unreleased ? "Showing" : "Hiding"} Unreleased
        </MenuItem>
      </Menu>
    </Grid>
  );
};
export default FinderFilter;
