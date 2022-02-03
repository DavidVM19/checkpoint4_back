import { RowDataPacket } from 'mysql2';

export default interface IGame extends RowDataPacket {
  id_game: number;
  name: string;
}
