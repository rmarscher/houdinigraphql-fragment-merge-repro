const { ApolloServer } = require('apollo-server');
const gql = require('graphql-tag');
const { connectionFromArray } = require('graphql-relay');
const { ApolloServerPluginLandingPageGraphQLPlayground } = require('apollo-server-core');
const { readFile } = require('fs/promises');
const { PubSub, withFilter } = require('graphql-subscriptions');

// an event broker for our subscription implementation
const pubsub = new PubSub();

// load the data file before we do anything
let data;

const typeDefs = gql`
  type Query {
    allContent: [Content!]!
    node(id: ID!): Node
  }

  interface Node {
    id: ID!
  }

  interface Content {
    name: String!
  }

  type Page implements Content & Node {
    id: ID!
    name: String!
    images: PageImages!
  }

  type Article implements Content & Node {
    id: ID!
    name: String!
    images: ArticleImages!
  }

  type PageImages {
    header: String
    footer: String
  }

  type ArticleImages {
    header: String
    author: String
  }
`;

// the list of favorites
const favorites = [];

const resolvers = {
	Query: {
		allContent(_) {
			return data.content;
		},

	},
};

const server = new ApolloServer({
	typeDefs,
	resolvers,
	plugins: [ApolloServerPluginLandingPageGraphQLPlayground()]
});

readFile('./data/data.json', 'utf-8')
	.then((result) => (data = JSON.parse(result)))
	.then(() => {
		server.listen().then(({ url }) => {
			console.log(`🚀  Server ready at ${url}`);
		});
	});
