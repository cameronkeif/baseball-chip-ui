import React from 'react';
import classNames from 'classnames';
import MlbGame from '../types/MlbGame';
import teamAbbreviations from '../utils/teamAbbreviations';

interface ScheduleRowProps {
  teamName: string;
  games: (MlbGame | [MlbGame, MlbGame] | null)[];
  todayIndex: number | null;
}

function ScheduleRow({ teamName, games, todayIndex }: ScheduleRowProps) {
  const buildGameContent = (game: MlbGame, appendToKey: string = '') => {
    const isHome = game.teams.home.team.name === teamName;
    const team = isHome ? game.teams.home : game.teams.away;
    const opponent = isHome
      ? game.teams.away.team.name
      : game.teams.home.team.name;

    const content = [
      <div key={`${game.gameDate}-opponent${appendToKey}`}>{`${
        isHome ? '' : '@'
      }${teamAbbreviations.get(opponent)}`}</div>,
    ];

    if (team.probablePitcher) {
      content.push(
        <div key={`${game.gameDate}-pitcher${appendToKey}`}>
          {team.probablePitcher.fullName.split(' ').at(-1)}
        </div>
      );
    }

    if (game.odds && game.status.detailedState !== 'Final') {
      const odds =
        game.odds[0].name === teamName
          ? game.odds[0].price
          : game.odds[1].price;

      content.push(
        <div
          className={classNames('odds', { favored: parseInt(odds) < 0 })}
          key={`${game.gameDate}-odds${appendToKey}`}
        >
          {odds}
        </div>
      );
    }

    return content;
  };

  return (
    <tr>
      <td>{teamAbbreviations.get(teamName)}</td>
      {games.map((game, index) => {
        if (game === null) {
          return (
            <td
              key={index /* eslint-disable-line react/no-array-index-key */}
            />
          );
        }

        let content;
        if (Array.isArray(game)) {
          content = buildGameContent(game[0]);
          content.push(<hr key={`${game[0].gameDate}-hr`} />);
          content = content.concat(buildGameContent(game[1], '2'));
        } else {
          content = buildGameContent(game);
        }

        return (
          <td
            key={`${Array.isArray(game) ? game[0].gameDate : game.gameDate}`}
            className={classNames({ 'schedule-today': index === todayIndex })}
          >
            {content}
          </td>
        );
      })}
    </tr>
  );
}

export default ScheduleRow;
