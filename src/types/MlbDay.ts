import MlbApiGame from "./MlbApiGame";

export type MlbDay = {
  date: string;
  games: Array<MlbApiGame>;
};

export default MlbDay;
