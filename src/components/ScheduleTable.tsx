import React, { ReactElement } from "react";
import { DateTime, Interval } from "luxon";
import ScheduleRow from "./ScheduleRow";
import MlbGame from "../types/MlbGame";
import { getDateTimeFromDateString } from "../utils/utils";

interface ScheduleTableProps {
  scheduleData: Map<string, (MlbGame | null)[]>;
  dateRange: string; // TODO could we pull this out of scheduleData instead?
}

function ScheduleTable({ scheduleData, dateRange }: ScheduleTableProps) {
  const [startDate, endDate] = dateRange.split(";");
  const days = Interval.fromDateTimes(
    getDateTimeFromDateString(startDate).startOf("day"),
    getDateTimeFromDateString(endDate).endOf("day")
  )
    .splitBy({ day: 1 })
    .map((d) => d.start?.toFormat("LL-dd"));

  const todayIndex = days.findIndex((day) => {
    const dateTime = getDateTimeFromDateString(`2023-${day}`);
    return dateTime.hasSame(DateTime.local(), "day");
  });

  const scheduleRows: ReactElement[] = [];
  scheduleData.forEach((games, teamName) => {
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
  );
}

export default ScheduleTable;
