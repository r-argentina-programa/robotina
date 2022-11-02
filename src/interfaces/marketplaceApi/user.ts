export interface User {
  id: number
  username: string
  externalId: string
  roles: 'Student' | 'Company'
  student?: Student
}

export interface Student {
  id: number
  firstName: string
  lastName: string
  email: string
}
