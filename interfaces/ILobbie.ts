import { RowDataPacket } from 'mysql2';

export default interface IConsole extends RowDataPacket {
  id_lobbie: number;
  price: number;
  id_user_local: number;
  id_user_away: number;
  id_game_console: number;
  score_local: number;
  score_away: number;
  date: string;
}
