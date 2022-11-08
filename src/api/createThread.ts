import { AxiosResponse } from 'axios'
import { marketplaceApi } from '.'
import { IThread } from '../interfaces/IThread'

export interface ICreateThread {
  authorId: string
  taskId: number
  text: string
  studentId: number
  timestamp: string
}

export const createThread = async (thread: ICreateThread) => {
  const { data } = (await marketplaceApi.post(
    '/api/thread',
    thread
  )) as AxiosResponse<IThread>
  return data
}
