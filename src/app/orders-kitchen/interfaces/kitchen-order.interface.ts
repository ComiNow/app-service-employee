export interface KitchenOrdersResponse {
  data: KitchenOrder[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
  };
}

export interface KitchenOrder {
  id: number;
  table: number;
  totalAmount: number;
  totalItems: number;
  status: OrderStatus;
  paid: boolean;
  paidAt?: Date;
  createdAt: Date;
  items: KitchenOrderItem[];
}

export interface KitchenOrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  orderId: number;
  productImage?: string[];
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  DELIVERED = 'DELIVERED',
}
