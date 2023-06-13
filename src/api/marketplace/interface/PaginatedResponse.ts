export interface PaginatedResponse<Resource> {
  count: number;

  next: string;

  previous: string;

  results: Resource[];
}
