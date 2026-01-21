import gql from 'graphql-tag';

const typeDefs = gql`
  type Task {
    id: ID
    description: String
    duration: Int
    difficulty: String
    status: String
    assignedTo: String
  }

  type User {
    id: String
    username: String
    email: String
    rol: String
    tasks: [Task]
  }

  # Tipo para el informe de Aggregate
  type TareasAgrupadas {
    _id: String 
    tareas: [Task]
  }

  type Query {
    getUsers: [User]
    getTareasAgrupadas: [TareasAgrupadas]
  }

  type Mutation {
    agregarTarea(description: String!, duration: Int!, difficulty: String!, assignedTo: String!): Task
  }
`;

export default typeDefs;