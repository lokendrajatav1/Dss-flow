export interface ProductCategory {
  id: string;
  name: string;
  description: string;
  color?: string;
  productCount: number;
  createdAt?: string;
}

export interface CreateCategoryPayload {
  name: string;
  description?: string;
  color?: string;
}

export interface UpdateCategoryPayload {
  name: string;
  description?: string;
  color?: string;
}
