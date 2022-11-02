import { AxiosResponse } from 'axios'
import { marketplaceApi } from '.'

interface ITask {
  id: number
  title: string
  resolutionType: 'Link' | 'Code'
}

export const getTasks = async (classNumber: string) => {
  const { data } = (await marketplaceApi(
    `/api/task?filter[lessonId]=${classNumber}`
  )) as AxiosResponse<ITask[]>
  return data
}
