interface IPaginatedMetaResponse {
  page: number;
  take: number;
  itemCount: number;
  pageCount: number;
}

export interface IPaginatedResponse<Entity extends object> {
  data: Entity[];
  meta: IPaginatedMetaResponse;
}
