// import { migrateDB } from 'graphql-migrations';
const {migrateDB} = require('graphql-migrations')

const dbConfig = {
  client: 'pg',
  connection: {
    host: 'localhost',
    user: 'postgres',
    password: 'postgres',
    database: 'shipnext',
  },
};

const schema = `
"""
@model
"""
type ExchangeOffice {
  id: ID!
  name: String!
  exchanges: [Exchange!]!
  rates: [Rate!]!
  country: Country!
}

"""
@model
"""
type Exchange {
  from: String!
  to: String!
  ask: Float!
  date: String!
}

"""
@model
"""
type Rate {
  from: String!
  to: String!
  in: Float!
  out: Float!
  reserve: Int!
  date: String!
}

"""
@model
"""
type Country {
  id: ID!
  code: String!
  name: String!
}

type Query {
  exchangeOffices(id: ID!): ExchangeOffice
}

schema {
  query: Query
}

`;

migrateDB(dbConfig, schema, {
  debug:true
}).then(() => {
  console.log('Database updated');
});