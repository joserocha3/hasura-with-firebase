import * as yup from 'yup'
import { AuthorizationError, ValidationError } from 'apollo-server'

const USER_BY_EMAIL_ADDRESS = `
  query user($email_address: String!) {
    user(where: {email_address: {_eq: $email_address}}) {
      id
      first_name
      last_name
      email_address
      role
    }
  }
`

const USER_BY_ID = `
  query user($id: ID!) {
    user(where: {id: {_eq: $id}}) {
      id
      first_name
      last_name
      email_address
      role
    }
  }
`

const INSERT_USER = `
  mutation insert_user(
    $email_address: String!
    $first_name: String! 
    $last_name: String!
  ) {
    insert_user(
      objects: {
        email_address: $email_address
        first_name: $first_name
        last_name: $last_name
        role: "MOBILE"
      }
    ) {
      returning {
        id
        first_name
        last_name
        email_address
        role
      }
    }
  }
`

const UPDATE_USER = `
  mutation update_user(
    $id: ID!
    $email_address: String!
    $first_name: String! 
    $last_name: String!
    $role: String!
  ){
    update_user(
      where: { id : { _eq: $id } }
      _set: {
        email_address: $email_address
        first_name: $first_name
        last_name: $last_name
        role: $role
      }
    ) {
      returning {
        id
        first_name
        last_name
        email_address
        role
      }
    }
  }
`

const createUserSchema = yup.object().shape({
  email_address: yup.string().required('Email address is required').email('Email address is incorrectly formatted'),
  first_name: yup.string().required('First name is required'),
  last_name: yup.string().required('Last name is required'),
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters long'),
  role: yup.string().matches(/(ADMIN|CLIENT|MOBILE)/, 'Invalid role').required('Role is required'),
})

const updateUserSchema = yup.object().shape({
  id: yup.string().required('ID is required'),
  email: yup.string().email('Email address is incorrectly formatted'),
  firstName: yup.string(),
  lastName: yup.string(),
  password: yup.string().nullable().min(6, 'Password must be at least 6 characters long'),
  roles: yup.string().matches(/(ADMIN|CLIENT|MOBILEE)/, 'Invalid role'),
})

const createUser = async (root, args, { graphql, auth }) => {
  // Validate
  await createUserSchema.validate(args)

  const exists1 = await auth.getUserByEmail(args.email_address)
  if (exists1) throw new ValidationError('Email address is already in use')

  const exists2 = await graphql.request(USER_BY_EMAIL_ADDRESS, { email_address: args.email_address })
  if (exists2.user[0]) throw new ValidationError('Email address is already in use')

  // Create in database
  const user = await graphql.request(INSERT_USER, {
    email_address: args.email_address,
    first_name: args.first_name,
    last_name: args.last_name,
  })

  const { id } = user.insert_user.returning[0]

  // Create in firebase
  const claims = {
    'https://hasura.io/jwt/claims': {
      'x-hasura-default-role': 'user',
      'x-hasura-allowed-roles': ['user'],
      'x-hasura-user-id': id,
    },
  }

  if (args.role === 'ADMIN') {
    claims.admin = true
    claims['https://hasura.io/jwt/claims']['x-hasura-default-role'] = 'admin'
    claims['https://hasura.io/jwt/claims']['x-hasura-allowed-roles'] = ['admin', 'client', 'mobile']
  } else if (args.role === 'CLIENT') {
    claims.client = true
    claims['https://hasura.io/jwt/claims']['x-hasura-default-role'] = 'client'
    claims['https://hasura.io/jwt/claims']['x-hasura-allowed-roles'] = ['client', 'mobile']
  } else if (args.role === 'MOBILE') {
    claims.mobile = true
    claims['https://hasura.io/jwt/claims']['x-hasura-default-role'] = 'mobile'
    claims['https://hasura.io/jwt/claims']['x-hasura-allowed-roles'] = ['mobile']
  }

  await auth.createUser({ uid: id, email: args.email_address, password: args.password })
  await auth.setCustomUserClaims(id, claims)

  return user.insert_user.returning[0]
}

const updateUser = async (root, args, { graphql, headers, auth }) => {
  // Validate
  await updateUserSchema.validate(args)

  const user = await auth.getUser(headers)
  const result = await graphql.request(USER_BY_ID, { id: args.id })
  const currentUser = result.user[0]
  if (!user.admin && user.id !== currentUser.id) throw new AuthorizationError('Not allowed to update other users')

  if (args.email_address !== currentUser.email_address) {
    const exists1 = await auth.getUserByEmail(args.email_address)
    if (exists1) throw new ValidationError('Email address is already in use')

    const exists2 = await graphql.request(USER_BY_EMAIL_ADDRESS, { email_address: args.email_address })
    if (exists2.user[0]) throw new ValidationError('Email address is already in use')
  }

  // Update in database (without password)
  const databaseUser = await graphql.request(UPDATE_USER, {
    id: args.id,
    email_address: args.email_address || currentUser.email_address,
    first_name: args.first_name || currentUser.first_name,
    last_name: args.last_name || currentUser.last_name,
    role: args.role || currentUser.role,
  })

  // Update in firebase
  if (args.role !== currentUser.role) {
    const claims = {
      'https://hasura.io/jwt/claims': {
        'x-hasura-default-role': 'user',
        'x-hasura-allowed-roles': ['user'],
        'x-hasura-user-id': args.id,
      },
    }

    if (args.role === 'ADMIN') {
      claims.admin = true
      claims['https://hasura.io/jwt/claims']['x-hasura-default-role'] = 'admin'
      claims['https://hasura.io/jwt/claims']['x-hasura-allowed-roles'] = ['admin', 'client', 'mobile']
    } else if (args.role === 'CLIENT') {
      claims.client = true
      claims['https://hasura.io/jwt/claims']['x-hasura-default-role'] = 'client'
      claims['https://hasura.io/jwt/claims']['x-hasura-allowed-roles'] = ['client', 'mobile']
    } else if (args.role === 'MOBILE') {
      claims.mobile = true
      claims['https://hasura.io/jwt/claims']['x-hasura-default-role'] = 'mobile'
      claims['https://hasura.io/jwt/claims']['x-hasura-allowed-roles'] = ['mobile']
    }

    const fbUser = await auth.getUserByEmail(currentUser.email_address)
    await auth.setCustomUserClaims(fbUser.uid, claims)
  }

  if (args.email_address !== currentUser.email_address || args.password) {
    const firebaseData = {}
    if (args.email_address) firebaseData.email = args.email_address // this will always be populated
    if (args.password) firebaseData.password = args.password
    const fbUser = await auth.getUserByEmail(currentUser.email_address)
    await auth.updateUser(fbUser.uid, firebaseData)
  }

  return databaseUser.update_user.returning[0]
}

const Mutation = {
  createUser,
  updateUser,
}

export default Mutation
