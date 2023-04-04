import classNames from "classnames"
import MlbGame from "../types/MlbGame"
import teamAbbreviations from "../utils/teamAbbreviations"

interface ScheduleRowProps {
    teamName: string,
    games: (MlbGame | null)[],
    todayIndex: number | null,
}

const ScheduleRow = ({ teamName, games, todayIndex }: ScheduleRowProps) => {
    return (
        <tr>
            <td>{teamAbbreviations.get(teamName)}</td>
            {
                games.map((game, index) => {
                    if (game === null) {
                        return <td key={index}></td>;
                    }

                    const isHome = game.teams.home.team.name === teamName;
                    const team = isHome ? game.teams.home : game.teams.away;
                    const opponent = isHome ? game.teams.away.team.name : game.teams.home.team.name;

                    const content = [
                        <div key={`${game.gameDate}-opponent`}>{`${isHome ? '' : '@'}${teamAbbreviations.get(opponent)}`}</div>
                    ];

                    if (team.probablePitcher) {
                        content.push(<div key={`${game.gameDate}-pitcher`}>{team.probablePitcher.fullName.split(' ').at(-1)}</div>);
                    }

                    if (game.odds) {
                        const odds = game.odds[0].name === teamName ? game.odds[0].price : game.odds[1].price;

                        content.push(
                            <div
                                className={classNames('odds', { 'favored': parseInt(odds) < 0 })}
                                key={`${game.gameDate}-odds`
                            }>
                                {odds}
                            </div>
                        );
                    }
                    
                    return (
                        <td
                            key={`${game.gameDate}`}
                            className={classNames({ 'schedule-today': index === todayIndex })}
                        >
                            {content}
                        </td>
                    );
                })
            }
        </tr>
    );
}

export default ScheduleRow;