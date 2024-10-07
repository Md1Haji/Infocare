// // src/data-source.ts
import { DataSource } from 'typeorm';
import { Home } from './entities/Home';
import { HomeUser } from './entities/HomeUser';
import { User } from './entities/User';

export const AppDataSource = new DataSource({
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'db_user',
    password: '6equj5_db_user',
    database: 'home_db',
    synchronize: false,  // Set to false to use migrations
    dropSchema: false,  // Do not drop schema automatically
    logging: ['query', 'error'],
    entities: [User, Home, HomeUser],
    migrations: ['./src/migrations/AddNewColumns.ts'],  // Path to migration files
    subscribers: [],
});



// import { DataSource } from 'typeorm';
// import { Home } from './entities/Home';
// import { HomeUser } from './entities/HomeUser';
// import { User } from './entities/User';

// export const AppDataSource = new DataSource({
//     type: 'mysql',
//     host: 'localhost',
//     port: 3306,
//     username: 'db_user',
//     password: '6equj5_db_user',
//     database: 'home_db',
//     synchronize: false,  // Avoid data loss  // Set to false in production
//     dropSchema: false,  // Force dropping the schema
//     logging: false , //['query', 'error'],
//     entities: [User, Home, HomeUser],
//     migrations: [],
//     subscribers: [],
// });

