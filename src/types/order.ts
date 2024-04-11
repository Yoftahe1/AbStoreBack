export interface IParams {
  id: String;
}

export interface IType {
  color?: String;
  size?: String;
  quantity: Number;
}

export interface IProduct {
  id: string;
  name: string;
  img: string;
  color: string;
  quantity: number;
  maxQuantity: number;
  price: number;
}


export interface IOrderQuery{
  status:string;
  page:number;
}