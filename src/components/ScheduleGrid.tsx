import React, { useState, useEffect, useCallback, ReactElement } from "react";
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
import ScheduleRow from "./ScheduleRow";
import mlbWeeks from "../utils/mlbWeeks";
import teamAbbreviations from "../utils/teamAbbreviations";

/**
 * Parses the schedule data returned from the API and returns a map of each team and its
 * MlbGames (or null if no game is on that day) for the week
 * @param scheduleData The schedule data returned from the API
 * @returns A map where the team name is the key and the value is an array of either null or MlbGame objects
 * representing that team's schedule
 */
const parseScheduleData = (scheduleData: MlbDay[]) => {
  const teamMap = new Map<string, (MlbGame | null)[]>();

  teamAbbreviations.forEach((teamAbbr, teamName) => {
    teamMap.set(teamName, []);
  });

  let dayCount = 0;
  scheduleData.forEach((day) => {
    // For each day, if the game hasn't been postponed,
    // insert the game into both the home and away team's schedule array
    day.games.forEach((game) => {
      if (game.status.detailedState === "Postponed") {
        return;
      }
      teamMap.get(game.teams.home.team.name)?.push(game);
      teamMap.get(game.teams.away.team.name)?.push(game);
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

/**
 * Takes a date string formatted as yyyy-mm-dd and returns a corresponding DateTime object.
 * @param dateString The date string formatted as yyyy-mm-dd
 * @returns A DateTime object matching this date.
 */
const getDateTimeFromDateString = (dateString: string): DateTime => {
  const [year, month, day] = dateString.split("-");
  const dateTime = DateTime.local(
    parseInt(year),
    parseInt(month),
    parseInt(day)
  );

  return dateTime;
};

function ScheduleGrid() {
  const [data, setData] = useState<Map<string, (MlbGame | null)[]> | null>(
    null
  );

  const startingWeek = mlbWeeks.find(
    (weekDateString) =>
      DateTime.now().startOf("day") <=
      getDateTimeFromDateString(weekDateString.split(";")[1]).startOf("day")
  );

  const [days, setDays] = useState<string[]>([]);
  const [todayIndex, setTodayIndex] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState<string>(
    startingWeek || mlbWeeks[0]
  );
  const [includeOdds, setIncludeOdds] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getSchedule = useCallback(async () => {
    try {
      setIsLoading(true);
      const [startDate, endDate] = dateRange.split(";");
      const url = `${process.env.REACT_APP_BASE_API_URL}/schedule?startDate=${startDate}&endDate=${endDate}&includeOdds=${includeOdds}`;
      const response = await axios.get(url);
      setData(parseScheduleData(response.data));

      const daysArray: string[] = [];
      setTodayIndex(null);
      response.data.forEach((mlbDate: MlbDay, index: number) => {
        const dateTime = getDateTimeFromDateString(mlbDate.date);
        if (dateTime.hasSame(DateTime.local(), "day")) {
          setTodayIndex(index);
        }
        daysArray.push(mlbDate.date.slice(5)); // Omit the year so it's just formatted as mm-dd
      });
      setDays(daysArray);
    } catch (e) {
      if (e instanceof AxiosError) {
        toast.error(
          `An unexpected error occurred: ${e.response?.data.message}`
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

  const scheduleRows: ReactElement[] = [];
  if (data) {
    data.forEach((games, teamName) => {
      scheduleRows.push(
        <ScheduleRow
          key={teamName /* eslint-disable-line react/no-array-index-key */}
          teamName={teamName}
          games={games}
          todayIndex={todayIndex}
        />
      );
    });
  }

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
        {isLoading && <CircularProgress />}
        {data && (
          <table>
            <thead>
              <tr>
                <th />
                {days.map((day) => (
                  <th key={day}>{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>{scheduleRows}</tbody>
          </table>
        )}
      </Box>
    </>
  );
}

export default ScheduleGrid;
