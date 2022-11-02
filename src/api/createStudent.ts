import { AxiosResponse } from 'axios'
import { marketplaceApi } from '.'
import { Student, User } from '../interfaces/marketplaceApi/user'

interface ICreateUser {
  username?: string
  externalId: string
  roles: 'Student'
}

const createUser = async (user: ICreateUser) => {
  const { data } = (await marketplaceApi.post(
    '/api/user',
    user
  )) as AxiosResponse<User>
  return data
}

interface ICreateStudent {
  userId: number
  firstName: string
  lastName: string
  email: string
}

export const createStudent = async (student: ICreateStudent) => {
  const { data } = (await marketplaceApi.post(
    '/api/student',
    student
  )) as AxiosResponse<Student>
  return data
}

export type ICreateUserStudent = ICreateUser & Omit<ICreateStudent, 'userId'>

export const createUserStudent = async (userStudent: ICreateUserStudent) => {
  const { email, externalId, firstName, lastName, roles, username } =
    userStudent

  const user = await createUser({ externalId, roles, username })
  const userId = user.id
  const student = await createStudent({ email, firstName, lastName, userId })
  return student
}
