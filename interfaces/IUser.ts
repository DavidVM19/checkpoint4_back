import { RowDataPacket } from 'mysql2';

export default interface IUser extends RowDataPacket {
  id_user: number;
  pseudo: string;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  hash_password: string;
  birthday_date: number;
  phone: number;
  picture: string;
  wallet: number;
  playstation_account: string;
  xbox_account: string;
  nintendo_account: string;
  steam_account: string;
  is_admin: number;
  country: string;
}
