import { getUser } from '../utils/auth'

const me = async (parent, args, { headers }) => {
  const user = await getUser(headers)
  return user || null
}

const Query = {
  me,
}

export default Query
