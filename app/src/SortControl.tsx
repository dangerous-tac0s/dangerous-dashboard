import {
  Avatar,
  Divider,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Tooltip,
} from "@mui/material";
import Box from "@mui/material/Box";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleSortUp,
  faCircleSortDown,
  faFilter,
} from "@fortawesome/pro-solid-svg-icons";
import React, { useState } from "react";
import { useLoaderData, useSearchParams } from "@remix-run/react";

export const defaultSort = {
  sorting: "popularity-recent",
  sortOrder: "desc",
};

const SortControl = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [searchParams, setSearchParams] = useSearchParams();
  const sorting = searchParams.get("sort") ?? defaultSort.sorting;
  const sortOrder = searchParams.get("sortOrder") ?? defaultSort.sortOrder;

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
   * @param newSort
   */
  const handleSortChange = (e: React.SyntheticEvent, newSort: string) => {
    setSearchParams((prev) => {
      if (!sorting || sorting === newSort) {
        prev.set("sortOrder", sortOrder !== "desc" ? "desc" : "asc");
      }
      prev.set("sort", newSort);
      return prev;
    });

    handleClose();
  };

  return (
    <Grid>
      <Box sx={{ display: "flex", alignItems: "center", textAlign: "center" }}>
        <Tooltip title="Sorting">
          <IconButton
            onClick={handleClick}
            size="small"
            aria-controls={open ? "sort-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: "white" }}>
              <FontAwesomeIcon
                icon={sortOrder !== "asc" ? faCircleSortDown : faCircleSortUp}
              />
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
        <MenuItem
          selected={sorting === "popularity-recent"}
          onClick={(e) => handleSortChange(e, "popularity-recent")}
        >
          Popularity - Recent
        </MenuItem>
        <MenuItem
          selected={sorting === "popularity-overall"}
          onClick={(e) => handleSortChange(e, "popularity-overall")}
        >
          Popularity - Overall
        </MenuItem>
      </Menu>
    </Grid>
  );
};
export default SortControl;
