import { GraphQLClient } from 'graphql-request'

const graphql = new GraphQLClient(process.env.HASURA_GRAPHQL_ENDPOINT, {
  headers: {
    'Content-Type': 'application/json',
    'X-Hasura-Admin-Secret': process.env.HASURA_GRAPHQL_ADMIN_SECRET,
  },
})

export default graphql
