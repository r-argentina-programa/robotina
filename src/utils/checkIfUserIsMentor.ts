import { IUser } from "../interfaces/IUser"

export const checkIfUserIsMentor = (user: IUser) => (
    user.roles.includes('Mentor')
  )
