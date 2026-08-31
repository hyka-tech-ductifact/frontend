export interface Client {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  type?: string;
  description?: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedClientsResponse {
  data: Client[];
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
}

export interface CreateClientDto {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  type?: string;
  description?: string;
}

export type UpdateClientDto = Partial<CreateClientDto>;
