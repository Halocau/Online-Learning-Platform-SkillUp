import { jwtDecode } from 'jwt-decode'

//giai ma token
export const decodeToken = (token) => {
  try {
    if (!token) return null
    const decoded = jwtDecode(token)
    return decoded
  } catch (error) {
    console.error('Error decoding token:', error)
    return null
  }
}


export const saveUserFromToken = (accessToken, refreshToken) => {
  const decoded = decodeToken(accessToken)
  
  if (!decoded) {
    console.error('Cannot decode token')
    return false
  }

  
  localStorage.setItem('accessToken', accessToken)
  localStorage.setItem('refreshToken', refreshToken)

  
  const user = {
    userId: decoded.userId,
    email: decoded.email,
    fullname: decoded.fullname,
    roleId: decoded.roleId,
    role: decoded.roleName  
  }

  localStorage.setItem('user', JSON.stringify(user))
  
  return true
}