import React, { useState, useEffect, useCallback, ReactElement } from "react";
import axios from "axios";
import { DateTime } from "luxon";
import MlbDay from "../types/MlbDay";
import MlbGame from "../types/MlbGame";
import ScheduleRow from "./ScheduleRow";

const parseScheduleData = (scheduleData: MlbDay[]) => {
  const teamMap = new Map<string, (MlbGame | null)[]>([
    ["Arizona Diamondbacks", []],
    ["Atlanta Braves", []],
    ["Baltimore Orioles", []],
    ["Boston Red Sox", []],
    ["Chicago White Sox", []],
    ["Chicago Cubs", []],
    ["Cincinnati Reds", []],
    ["Cleveland Guardians", []],
    ["Colorado Rockies", []],
    ["Detroit Tigers", []],
    ["Houston Astros", []],
    ["Kansas City Royals", []],
    ["Los Angeles Angels", []],
    ["Los Angeles Dodgers", []],
    ["Miami Marlins", []],
    ["Milwaukee Brewers", []],
    ["Minnesota Twins", []],
    ["New York Yankees", []],
    ["New York Mets", []],
    ["Oakland Athletics", []],
    ["Philadelphia Phillies", []],
    ["Pittsburgh Pirates", []],
    ["San Diego Padres", []],
    ["San Francisco Giants", []],
    ["Seattle Mariners", []],
    ["St. Louis Cardinals", []],
    ["Tampa Bay Rays", []],
    ["Texas Rangers", []],
    ["Toronto Blue Jays", []],
    ["Washington Nationals", []],
  ]);

  let dayCount = 0;
  scheduleData.forEach((day) => {
    day.games.forEach((game) => {
      teamMap.get(game.teams.home.team.name)?.push(game);
      teamMap.get(game.teams.away.team.name)?.push(game);
    });

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
  const [data, setData] = useState<Map<string, (MlbGame | null)[]> | null>(
    null
  );
  const [days, setDays] = useState<string[]>([]);
  const [todayIndex, setTodayIndex] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState<string>("2023-03-30;2023-04-09"); // TODO initialize this to the current week.

  const getSchedule = useCallback(async () => {
    try {
      // TODO fix this hard coded value
      const [startDate, endDate] = dateRange.split(";");
      const url = `http://localhost:6060/schedule?startDate=${startDate}&endDate=${endDate}&includeOdds=false`;
      const response = await axios.get(url);
      setData(parseScheduleData(response.data));

      const daysArray: string[] = [];
      setTodayIndex(null);
      response.data.forEach((mlbDate: MlbDay, index: number) => {
        const [year, month, day] = mlbDate.date.split("-");
        const dateTime = DateTime.local(
          parseInt(year),
          parseInt(month),
          parseInt(day)
        );
        if (dateTime.hasSame(DateTime.local(), "day")) {
          setTodayIndex(index);
        }
        daysArray.push(mlbDate.date.slice(5)); // Omit the year so it's just formatted as mm-dd
      });
      setDays(daysArray);
    } catch (e) {
      // TODO error handling
      alert("Something went wrong, check the console."); // eslint-disable-line
      console.error(e); // eslint-disable-line
    }
  }, [dateRange]);

  useEffect(() => {
    getSchedule();
  }, [dateRange, getSchedule]);

  if (!data) {
    return null;
  }

  const scheduleRows: ReactElement[] = [];
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

  return (
    <div>
      <select
        onChange={(event) => {
          setDateRange(event.target.value);
        }}
      >
        <option value="2023-03-30;2023-04-09">Week 1 (Mar 30 - Apr 9)</option>
        <option value="2023-04-10;2023-04-16">Week 2 (Apr 10 - Apr 16)</option>
        <option value="2023-04-17;2023-04-23">Week 3 (Apr 17 - Apr 23)</option>
        <option value="2023-04-24;2023-04-30">Week 4 (Apr 24 - Apr 30)</option>
        <option value="2023-05-01;2023-05-07">Week 5 (May 1 - May 7)</option>
        <option value="2023-05-08;2023-05-14">Week 6 (May 8 - May 14)</option>
        <option value="2023-05-15;2023-05-21">Week 7 (May 15 - May 21)</option>
        <option value="2023-05-22;2023-05-28">Week 8 (May 22 - May 28)</option>
        <option value="2023-05-29;2023-06-04">Week 9 (May 29 - Jun 4)</option>
        <option value="2023-06-05;2023-06-11">Week 10 (Jun 5 - Jun 11)</option>
        <option value="2023-06-12;2023-06-18">Week 11 (Jun 12 - Jun 18)</option>
        <option value="2023-06-19;2023-06-25">Week 12 (Jun 19 - Jun 25)</option>
        <option value="2023-06-26;2023-07-02">Week 13 (Jun 26 - Jul 2)</option>
        <option value="2023-07-03;2023-07-09">Week 14 (Jul 3 - Jul 9)</option>
        <option value="2023-07-10;2023-07-16">Week 15 (Jul 10 - Jul 16)</option>
        <option value="2023-07-17;2023-07-23">Week 16 (Jul 17 - Jul 23)</option>
        <option value="2023-07-24;2023-07-30">Week 17 (Jul 24 - Jul 30)</option>
        <option value="2023-07-31;2023-08-06">Week 18 (Jul 31 - Aug 6)</option>
        <option value="2023-08-07;2023-08-13">Week 19 (Aug 7 - Aug 13)</option>
        <option value="2023-08-14;2023-08-20">Week 20 (Aug 14 - Aug 20)</option>
        <option value="2023-08-21;2023-08-27">Week 21 (Aug 21 - Aug 27)</option>
        <option value="2023-08-28;2023-09-03">Week 22 (Aug 28 - Sep 3)</option>
        <option value="2023-09-04;2023-09-10">Week 23 (Sep 4 - Sep 10)</option>
        <option value="2023-09-11;2023-09-17">Week 24 (Sep 11 - Sep 17)</option>
        <option value="2023-09-18;2023-09-24">Week 25 (Sep 18 - Sep 24)</option>
      </select>
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
    </div>
  );
}

export default ScheduleGrid;
