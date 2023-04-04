import { useState, useEffect, ReactElement } from 'react';
import axios from 'axios';
import MlbDay from '../types/MlbDay';
import MlbGame from '../types/MlbGame';
import ScheduleRow from './ScheduleRow';

const parseScheduleData = (scheduleData: MlbDay[]) => {
    const teamMap = new Map<string, (MlbGame | null)[]>([
        ['Arizona Diamondbacks', []],
        ['Atlanta Braves', []],
        ['Baltimore Orioles' , []],
        ['Boston Red Sox', []],
        ['Chicago White Sox', []],
        ['Chicago Cubs', []],
        ['Cincinnati Reds', []],
        ['Cleveland Guardians', []],
        ['Colorado Rockies', []],
        ['Detroit Tigers', []],
        ['Houston Astros', []],
        ['Kansas City Royals', []],
        ['Los Angeles Angels', []],
        ['Los Angeles Dodgers', []],
        ['Miami Marlins', []],
        ['Milwaukee Brewers', []],
        ['Minnesota Twins', []],
        ['New York Yankees', []],
        ['New York Mets', []],
        ['Oakland Athletics', []],
        ['Philadelphia Phillies', []],
        ['Pittsburgh Pirates', []],
        ['San Diego Padres', []],
        ['San Francisco Giants', []],
        ['Seattle Mariners', []],
        ['St. Louis Cardinals', []],
        ['Tampa Bay Rays', []],
        ['Texas Rangers', []],
        ['Toronto Blue Jays', []],
        ['Washington Nationals', []],
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
        }) 
    });

    return teamMap;
}

const ScheduleGrid = () => {
    const [data, setData] = useState<Map<string, (MlbGame | null)[]> | null>(null);
    const [days, setDays] = useState<string[]>([]);

    const getSchedule = async () => {
        try {
            // TODO fix this hard coded value
            const url = 'http://localhost:6060/schedule?startDate=2023-03-30&endDate=2023-04-09&includeOdds=false';
            const response = await axios.get(url);
            setData(parseScheduleData(response.data));

            const daysArray: string[] = [];
            response.data.forEach((day: MlbDay) => {
                daysArray.push(day.date.slice(5)); // Omit the year so it's just formatted as mm-dd
            });
            setDays(daysArray);
        } catch (e) {
            alert('Something went wrong, check the console.');
            console.error(e);
        }
    }

    useEffect(() => {
        getSchedule();
    }, []);

    if (!data) {
        return null;
    }

    const scheduleRows: ReactElement[] = [];
    data.forEach((games, teamName) => {
        scheduleRows.push((
            <ScheduleRow
                key={teamName}
                teamName={teamName}
                games={games}
            />
        ));
    });

    return (
        <table>
            <thead>
                <tr>
                    <th></th>
                    {days.map((day) => <th key={day}>{day}</th>)}
                </tr>
            </thead>
            <tbody>
                {scheduleRows}
            </tbody>
        </table>
    );
}

export default ScheduleGrid;