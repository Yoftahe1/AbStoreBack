export interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  location: string;
  phoneNumber: number;
}

export interface IUserUpdate {
  firstName: string;
  lastName: string;
  location: string;
  phoneNumber: number;
}

export interface IUserParams {
  id: string;
}

export interface IUserBan {
  banReason: string;
}

export interface IUserQuery {
  page: number;
  isBanned:boolean;
}

export interface IUserPassword {
  password: string;
}

export interface IUserAuth {
  email: string;
  password: string;
}

export interface IUserToken {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "User" ;
}