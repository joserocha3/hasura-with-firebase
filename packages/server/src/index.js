import { ApolloServer } from 'apollo-server'

import resolvers from './resolvers'
import typeDefs from './typeDefs'
import graphql from './utils/graphql'
import * as auth from './utils/auth'

const server = new ApolloServer({
  introspection: process.env.APOLLO_INTROSPECTION || false,
  playground: process.env.APOLLO_PLAYGROUND || false,
  typeDefs,
  resolvers,
  context: async ({ req }) => ({
    ...req,
    graphql,
    auth,
  }),
})

const port = process.env.PORT || 4000 // heroku might not run on 4000
server.listen({ port }).then(({ url }) => (console.log(`🚀  Server ready at ${url}`)))
