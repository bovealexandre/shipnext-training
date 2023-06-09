const express= require('express');
const { ApolloServer } = require('apollo-server-express');
const { buildGraphbackAPI } = require('graphback');
const { createKnexDbProvider } = require('@graphback/runtime-knex');
const Knex = require('knex');
 
const app = express();
 
const schema = `
scalar GraphbackDateTime

type ExchangeOffice {
    id: ID!
    name: String!
    exchanges: [Exchange!]!
    rates: [Rate!]!
    country: Country!
}
  
type Exchange {
    from: String!
    to: String!
    ask: Float!
    date: GraphbackDateTime!
}
  
type Rate {
    from: String!
    to: String!
    in: Float!
    out: Float!
    reserve: Int!
    date: GraphbackDateTime!
}

type Country {
    id: ID!
    code: String!
    name: String!
}

type Query {
    exchangeOffices(id: ID!): ExchangeOffice
    getTopCurrencyExchangers: [ExchangeOffice]
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
    },
    getTopCurrencyExchangers: (parent, args, context) => {
        const exchangeOffices = context.db.getTopCurrencyExchangers();

        const profitsByCountry = {};

        exchangeOffices.forEach((exchangeOffice) => {
            const { id, name, country, exchanges } = exchangeOffice;
            let totalProfit = 0;

            exchanges.forEach((exchange) => {
            const baseCurrency = 'USD';

            const pairProfit = calculatePairProfit(exchange, baseCurrency);

            totalProfit += pairProfit;
            });

            if (profitsByCountry[country]) {
            profitsByCountry[country].push({
                id,
                name,
                profit: totalProfit,
            });
            } else {
            profitsByCountry[country] = [{
                id,
                name,
                profit: totalProfit,
            }];
            }
        });

        for (const country in profitsByCountry) {
            profitsByCountry[country].sort((a, b) => b.profit - a.profit);
        }

        const topCurrencyExchangers = {};

        for (const country in profitsByCountry) {
            topCurrencyExchangers[country] = profitsByCountry[country].slice(0, 3);
        }

        return topCurrencyExchangers;
      },
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