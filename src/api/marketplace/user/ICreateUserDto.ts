export interface ICreateUserDto {
  username?: string;
  externalId: string;
  roles: string[];
}
