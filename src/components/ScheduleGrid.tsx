import React, { useState, useEffect, useCallback } from "react";
import axios, { AxiosError } from "axios";
import { DateTime } from "luxon";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import { toast } from "react-toastify";
import MlbDay from "../types/MlbDay";
import MlbGame from "../types/MlbGame";
import ScheduleTable from "./ScheduleTable";
import mlbWeeks from "../utils/mlbWeeks";
import teamAbbreviations from "../utils/teamAbbreviations";
import { getDateTimeFromDateString } from "../utils/utils";

/**
 * Parses the schedule data returned from the API and returns a map of each team and its
 * MlbGames (or null if no game is on that day) for the week
 * @param scheduleData The schedule data returned from the API
 * @returns A map where the team name is the key and the value is an array of either null or MlbGame objects
 * representing that team's schedule
 */
const parseScheduleData = (scheduleData: MlbDay[]) => {
  const teamMap = new Map<string, (MlbGame | [MlbGame, MlbGame] | null)[]>();

  teamAbbreviations.forEach((teamAbbr, teamName) => {
    teamMap.set(teamName, []);
  });

  let dayCount = 0;
  scheduleData.forEach((day) => {
    let doubleHeaderFlag = false;
    day.games.forEach((game) => {
      // For each day, if the game hasn't been postponed,
      // insert the game into both the home and away team's schedule array
      if (game.status.detailedState === "Postponed") {
        return;
      }

      // Doubleheaders will be represented as an array of two games.
      // We'll use the doubleHeaderFlag as an indicator to replace the
      // game with an array.
      if (game.doubleHeader === "Y") {
        if (doubleHeaderFlag) {
          const existingGame = teamMap.get(game.teams.home.team.name)?.pop();
          teamMap.get(game.teams.away.team.name)?.pop();

          if (existingGame && !Array.isArray(existingGame)) {
            teamMap.get(game.teams.home.team.name)?.push([existingGame, game]);
            teamMap.get(game.teams.away.team.name)?.push([existingGame, game]);
          }
          doubleHeaderFlag = false;
        } else {
          teamMap.get(game.teams.home.team.name)?.push(game);
          teamMap.get(game.teams.away.team.name)?.push(game);
          doubleHeaderFlag = true;
        }
      } else {
        teamMap.get(game.teams.home.team.name)?.push(game);
        teamMap.get(game.teams.away.team.name)?.push(game);
      }
    });

    // Then for each team, if they didn't have a game on the current day, insert null
    dayCount++;
    teamMap.forEach((teamGames) => {
      if (teamGames.length < dayCount) {
        teamGames.push(null);
      }
    });
  });

  return teamMap;
};

function ScheduleGrid() {
  const [data, setData] = useState<Map<
    string,
    (MlbGame | [MlbGame, MlbGame] | null)[]
  > | null>(null);

  const startingWeek = mlbWeeks.find(
    (weekDateString) =>
      DateTime.now().startOf("day") <=
      getDateTimeFromDateString(weekDateString.split(";")[1]).startOf("day")
  );

  const [dateRange, setDateRange] = useState<string>(
    startingWeek || mlbWeeks[0]
  );
  const [activeDateRange, setActiveDateRange] = useState<string>(dateRange);
  const [includeOdds, setIncludeOdds] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getSchedule = useCallback(async () => {
    try {
      setIsLoading(true);
      const [startDate, endDate] = dateRange.split(";");
      const url = `${process.env.REACT_APP_BASE_API_URL}/schedule?startDate=${startDate}&endDate=${endDate}&includeOdds=${includeOdds}`;
      const response = await axios.get(url);
      setData(parseScheduleData(response.data));
      setActiveDateRange(dateRange);
    } catch (e) {
      if (e instanceof AxiosError) {
        toast.error(
          `An unexpected error occurred${
            e.response?.data.message ? `: ${e.response?.data.message}` : "."
          }`
        );
      }
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange, includeOdds]);

  useEffect(() => {
    getSchedule();
  }, [includeOdds, dateRange, getSchedule]);

  return (
    <>
      <h2>MLB Schedule</h2>
      <Box display="flex" justifyContent="center" alignItems="center">
        <FormControl variant="standard" sx={{ m: 1, mr: 3, minWidth: 120 }}>
          <Select
            labelId="schedule-grid-week-select-label"
            id="schedule-grid-week-select"
            value={dateRange}
            onChange={(event: SelectChangeEvent<string>) => {
              setDateRange(event.target.value);
            }}
          >
            {mlbWeeks.map((weekDateString, i) => {
              const [startDate, endDate] = weekDateString.split(";");
              const format = "LLL dd";
              const startFormatted =
                getDateTimeFromDateString(startDate).toFormat(format);
              const endFormatted =
                getDateTimeFromDateString(endDate).toFormat(format);
              return (
                <MenuItem value={weekDateString} key={weekDateString}>
                  {`Week ${i + 1} (${startFormatted} - ${endFormatted})`}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
        <FormControlLabel
          label="Include game odds"
          control={
            <Checkbox
              inputProps={{ "aria-label": "Include game odds" }}
              checked={includeOdds}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setIncludeOdds(event.target.checked);
              }}
            />
          }
        />
      </Box>
      <Box display="flex" justifyContent="center">
        {isLoading && <CircularProgress sx={{ m: 1, color: "green" }} />}
      </Box>
      <Box display="flex" justifyContent="center">
        {data && (
          <ScheduleTable scheduleData={data} dateRange={activeDateRange} />
        )}
      </Box>
    </>
  );
}

export default ScheduleGrid;
