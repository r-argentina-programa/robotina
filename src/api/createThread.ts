import { marketplaceApi } from '.'

export interface ICreateThread {
  authorId: string
  taskId: number
  text: string
  studentId: number
  timestamp: string
}

export const createThread = async (thread: ICreateThread) => {
  const { data } = await marketplaceApi.post('/api/thread', thread)
  return data
}
