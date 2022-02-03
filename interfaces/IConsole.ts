import { RowDataPacket } from 'mysql2';

export default interface IConsole extends RowDataPacket {
  id_console: number;
  name: string;
}
