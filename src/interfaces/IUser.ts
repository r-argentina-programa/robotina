import { IStudent } from './IStudent'

export interface IUser {
  id: number
  username: string
  externalId: string
  roles: 'Student' | 'Company' | 'Mentor' | string[]
  student?: IStudent
}
