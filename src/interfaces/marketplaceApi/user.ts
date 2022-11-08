import { IStudent } from './student'

export interface IUser {
  id: number
  username: string
  externalId: string
  roles: 'Student' | 'Company' | string[]
  student?: IStudent
}
