import { IUser } from "../interfaces/IUser"

export const checkIfUserIsMentor = (user: IUser) => {
    let isMentor = false
  
    user.roles[0] === 'Mentor' ?
      isMentor = true :
      isMentor = false
  
    return isMentor
  }
