/* eslint-disable prettier/prettier */
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';

export const graphqlModule = GraphQLModule.forRoot<ApolloDriverConfig>({
    driver: ApolloDriver,
    autoSchemaFile: 'schema.gql',
    playground: false,
    introspection: true,
    debug: true,
    sortSchema: true,
    subscriptions: { 'graphql-ws': true },
    // Disable CSRF protection for development
  csrfPrevention: false,
  plugins: [ApolloServerPluginLandingPageLocalDefault()],
});