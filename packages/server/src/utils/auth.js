import { AuthenticationError } from 'apollo-server'
import * as admin from 'firebase-admin'

import graphql from './graphql'

const USER = `
  query user($email_address: String!) {
    user(where: {email_address: {_eq: $email_address}}) {
      id
      email_address
      first_name
      last_name
      role
    }
  }
`

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  }),
})

const fbAuth = admin.auth()

const getUser = async (headers) => {
  let emailAddress

  // Determine what email to use

  if (process.env.NODE_ENV === 'development' && process.env.TEST_EMAIL) {
    // Use provided email for easy testing while developing
    emailAddress = process.env.TEST_EMAIL
    console.info(`Warning: Authorization will mimic ${process.env.TEST_EMAIL}`)
  } else {
    // Use a token
    const Authorization = headers.authorization ? headers.authorization : ''
    const token = Authorization.replace('Bearer ', '')

    if (!token) throw new AuthenticationError('Not authorized!')

    try {
      const { email: verifiedEmail } = await fbAuth.verifyIdToken(token)
      emailAddress = verifiedEmail
    } catch (error) {
      throw new AuthenticationError(error.code === 'auth/id-token-expired' ? 'Token has expired' : 'Invalid token!')
    }
  }

  try {
    const data = await graphql.request(USER, { email_address: emailAddress })
    const result = await fbAuth.getUserByEmail(data.user[0].email_address)
    return {
      ...result.customClaims,
      ...data.user[0],
    }
  } catch (e) {
    throw new AuthenticationError('No user found!')
  }
}

const getUserByEmail = async (email) => {
  // return null instead of throwing error
  try {
    return await fbAuth.getUserByEmail(email)
  } catch (error) {
    return null
  }
}

const createUser = async (...args) => fbAuth.createUser(...args)

const updateUser = async (...args) => fbAuth.updateUser(...args)

const setCustomUserClaims = async (...args) => fbAuth.setCustomUserClaims(...args)

export {
  createUser,
  updateUser,
  setCustomUserClaims,
  getUserByEmail,
  getUser,
}
