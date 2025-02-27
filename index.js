const express = require('express');
const bodyparser = require('body-parser');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const axios = require('axios');
const cors = require('cors');

async function startServer() {
    const app = express();
    const server = new ApolloServer({
        typeDefs: `
        type User {
            id: ID!
            name: String!
            username: String!
            email: String!
            phone: String!
        }

        type Todo {
            id: ID!
            title: String!
            user: User
            completed: Boolean
        }

        type Query {
            getTodos: [Todo]
            getAllUsers: [User]
        }
        `,

        resolvers: {
            Todo: {
                user: async function(todo) {
                    try {
                        const response = await axios.get(`https://jsonplaceholder.typicode.com/users/${todo.userId}`);
                        return response.data;
                    } catch (error) {
                        console.error('Error fetching user:', error);
                        return null;
                    }
                }
            },
            Query: {
                getTodos: async function() {
                    try {
                        const response = await axios.get('https://jsonplaceholder.typicode.com/todos');
                        return response.data;
                    } catch (error) {
                        console.error('Error fetching todos:', error);
                        return [];
                    }
                },
                getAllUsers: async function() {
                    try {
                        const response = await axios.get('https://jsonplaceholder.typicode.com/users');
                        return response.data;
                    } catch (error) {
                        console.error('Error fetching users:', error);
                        return [];
                    }
                }
            }
        }
    });

    app.use(bodyparser.json());
    app.use(cors());

    await server.start();

    app.use('/graphql', expressMiddleware(server));

    app.listen(8000, () => 
        console.log('Server is running on port 8000')
    );
}

startServer();
