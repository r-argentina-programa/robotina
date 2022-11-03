import { AxiosResponse } from 'axios'
import { marketplaceApi } from '.'
import { ITask } from '../interfaces/marketplaceApi/task'

export const getTasks = async (classNumber: string) => {
  const { data } = (await marketplaceApi.get(
    `/api/task?filter[lessonId]=${classNumber}`
  )) as AxiosResponse<ITask[]>
  return data
}
