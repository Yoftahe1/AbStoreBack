export interface IDriver {
  firstName: string;
  lastName: string;
  email: string;
}

export interface IDriverUpdate {
  firstName: string;
  lastName: string;
}

export interface IDriverQuery {
  page: number;
}

export interface IDriverPassword {
  password: string;
}

export interface IDriverParams {
  id: string;
}

export interface IDriverAuth {
  email: string;
  password: string;
}

export interface IDriverToken {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "Owner" | "Driver";
}
