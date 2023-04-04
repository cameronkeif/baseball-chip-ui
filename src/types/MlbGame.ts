import MlbApiGame from "./MlbApiGame";

export type MlbGame = MlbApiGame & {
    odds?: Array<{ name: string, price: number }>
};

export default MlbGame;
