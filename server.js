const express= require('express');
const { ApolloServer } = require('apollo-server-express');
const { buildGraphbackAPI } = require('graphback');
const { createKnexDbProvider } = require('@graphback/runtime-knex');
const Knex = require('knex');
 
const app = express();
 
const schema = `
"""
@model
"""
type ExchangeOffice {
    id: ID!
    name: String!
    country: String!
    exchanges: [Exchange!]!
    rates: [Rate!]!
    country: Country!
}
  
type Exchange {
    from: String!
    to: String!
    ask: Float!
    date: DateTime!
}
  
type Rate {
    from: String!
    to: String!
    in: Float!
    out: Float!
    reserve: Int!
    date: DateTime!
}

type Country {
    code = UKR
    name = Ukraine
}

type Query {
    exchangeOffices(id: ID!): ExchangeOffice
}
  
schema {
    query: Query
}
`

const knex = Knex({
  client: 'pg',
  connection: {
    host: 'localhost',
    user: 'postgres',
    password: 'postgres',
    database: 'shipnext',
  },
})

const knexProviderCreator = createKnexDbProvider(knex);

const { typeDefs, resolvers, contextCreator } = buildGraphbackAPI(schema, {
    dataProviderCreator: knexProviderCreator
  });

const exchangeResolvers = {
  Query: {
    exchangeOffices: (parent, args, context) => {
      return context.db.exchangeOffices(args.id);
    }
  }
}
 
async function startServer() {
    const server = new ApolloServer({
        typeDefs,
        resolvers: [resolvers, exchangeResolvers],
        context: contextCreator
    });
    await server.start();
    
    server.applyMiddleware({ app });
}
startServer();
 
app.listen({ port: 4000 }, () => {
  console.log('Apollo Server on http://localhost:4000/graphql');
});