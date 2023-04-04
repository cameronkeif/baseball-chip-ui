import MlbGame from "../types/MlbGame"
import teamAbbreviations from "../utils/teamAbbreviations"

interface ScheduleRowProps {
    teamName: string,
    games: (MlbGame | null)[]
}

const ScheduleRow = ({ teamName, games }: ScheduleRowProps) => {
    return (
        <tr>
            <td>{teamAbbreviations.get(teamName)}</td>
            {
                games.map((game) => {
                    if (game === null) {
                        return <td></td>;
                    }

                    const isHome = game.teams.home.team.name === teamName;
                    const team = isHome ? game.teams.home : game.teams.away;
                    const opponent = isHome ? game.teams.away.team.name : game.teams.home.team.name;

                    const content = [<div>{`${isHome ? '' : '@'}${teamAbbreviations.get(opponent)}`}</div>];

                    if (team.probablePitcher) {
                        content.push(<div>{team.probablePitcher.fullName}</div>);
                    }

                    if (game.odds) {
                        const odds = game.odds[0].name === teamName ? game.odds[0].price : game.odds[1].price;
                        content.push(<div>{odds}</div>);
                    }
                    
                    return <td>{content}</td>;
                })
            }
        </tr>
    );
}

export default ScheduleRow;