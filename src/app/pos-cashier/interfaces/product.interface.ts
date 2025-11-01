export interface ProductsResponse {
  data: Product[];
  meta: {
    totalPages: number;
    page: number;
    lastPage: number;
  };
}

export interface Product {
  id: number;
  name: string;
  categoryId: number | null;
  price: number;
  stock: number;
  image?: string[];
  available: boolean;

}

export interface Category {
  id: number;
  name: string;
  firstImage?: string;
  secondImage?: string;
}


