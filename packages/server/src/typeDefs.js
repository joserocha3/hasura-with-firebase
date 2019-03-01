import { gql } from 'apollo-server'

const typeDefs = gql`
  type User {
    id: ID!
    first_name: String!
    last_name: String!
    email_address: String!
    role: String!
  }

  type Query {
    me: User!
  }

  type Mutation {
    createUser(
      email_address: String!
      first_name: String!
      last_name: String!
      password: String!
      role: String!
    ): User!

    updateUser(
      id: ID!
      email_address: String
      first_name: String
      last_name: String
      password: String
      role: String
    ): User!

    createGeofence: User!

    createReward: User!
  }
`

export default typeDefs
