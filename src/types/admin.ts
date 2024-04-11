export interface IAdmin {
  firstName: string;
  lastName: string;
  email: string;
}

export interface IAdminUpdate {
  firstName: string;
  lastName: string;
}

export interface IAdminParams {
  id: string;
}

export interface IAdminQuery {
  page: number;
}

export interface IAdminPassword {
  password: string;
}
export interface IAdminAuth {
  email: string;
  password: string;
}
export interface IAdminToken {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "Owner" | "Admin";
}
