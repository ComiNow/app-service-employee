export interface OrderServiceResponse {
  data: Order[];
  meta: PaginationMetadata;
}

export interface PaginationMetadata {
  total: number;
  page: number;
  lastPage: number;
}


export interface Order {
  id: number;
  totalAmount: number;
  totalItems: number;
  status: OrderStatus;
  paid: boolean;
  paidAt?: Date;
  createdAt: Date;
}

export interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  orderId: number;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  DELIVERED = 'DELIVERED',
}
