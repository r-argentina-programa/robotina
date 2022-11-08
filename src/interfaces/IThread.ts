import { IMessage } from './IMessage'
import { IReply } from './IReply'
import { IStudent } from './IStudent'
import { ITask } from './ITask'

export interface IThread extends IMessage {
  id: number
  studentId: number
  taskId: number
  student?: IStudent
  task?: ITask
  replies?: IReply
}
