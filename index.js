const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
let self = this;
// Construct a schema, using GraphQL schema language
const typeDefs = gql`
	type File {
		filename: String!
		mimetype: String!
		encoding: String!
	}

	type Query {
		files: String
	}

	type Mutation {
		singleUpload(file: Upload!): File!
	}
`;

const resolvers = {
	Query: {
		files: () => {
			return "not implemented."
		}
	},
	Mutation: {
		async singleUpload( parent, { file } ) {
			self.dataReceived = 0;
			self.chunkCount = 0;
			
			const { createReadStream, filename, mimetype, encoding } = await file;
			const stream = createReadStream();
			
			stream.on('data', (chunk) => {
				self.dataReceived += chunk.length;
				self.chunkCount++;
				if(self.chunkCount % 10 == 0 ) { console.log(`received so far: ${self.dataReceived / 1000}k`); }
			});

			stream.on('close', () => {
				console.log(`stream closed. total received: ${self.dataReceived / 1000}k`);
			});

			return { filename, mimetype, encoding };
		}
	},
};
const server = new ApolloServer({ typeDefs, resolvers });

const app = express();
server.applyMiddleware({ app });
const port = 3000;

app.listen({ port: port }, () =>
	console.log(`🚀 Server ready at http://192.168.50.25:${port}${server.graphqlPath}`)
);