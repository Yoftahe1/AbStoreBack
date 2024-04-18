export interface IParams {
  id: string;
}

export interface IType {
  color?: string;
  size?: string;
  quantity: number;
}

export interface IReview {
  userId: string;
  review: string;
}

export interface IRate {
  userId: string;
  rating: number;
}

export interface IProduct {
  name: string;
  description: string;
  category: string;
  images: string[];
  price: number;
  types: IType[];
}

export interface IEditProduct {
  id:string;
  name: string;
  description: string;
  category: string;
  price: number;
  types: IType[];
}

export interface IReviewsQuery {
  page: number;
}

export interface IProductQuery {
  page: number;
  filter: { search?: string; rating?: string; category?: string };
}

export interface IRelatedProduct {
  id:string;
}
