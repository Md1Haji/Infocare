# Introduction - how to read this doc

1. [SQL databases](#1-database)
2. [React SPA development](#2-react-spa)
3. [Backend API development on Node](#3-backend-api-development-on-node)
4. [Set-up Installation](#4-set-up-Installation)

## 1. Database

<details>
1. **Created user Table**:

- Columns: id (Primary key), username , email
- This table stores unique user information, ensuring each user is represented only once.
- 
2. **Created home Table**:

- Columns: id (Primary Key), street_address, and other relevant home attributes.
- This table stores unique home information.

- 
3. **Created user_home_relationship Junction Table**:

- Columns: id (Primary Key), username(Foreingn key), home_id(foreign key)
- Established a many-to-many relationship between users and homes by using foreign keys to reference the user and home tables.
  Populated the Tables:

- Migrated data from the original user_home_relationship table into the newly created tables, ensuring all relationships were preserved.

- Created 99_final_db_dump.sql to reflect all changes, ensuring the database transitions from its initial state to the normalized structure.\

**SQL Script Execution**:
- The script 99_final_db_dump.sql can be executed to transform the database into the normalized state. This script includes the creation of the new tables, 
  foreign key relationships, and migration of existing data.

## 2. React SPA

-**. User-Home Relationships**

    . Purpose: Show which homes a user is interested in and which users are interested in a given home.

  -  **API Design**:
       . /user/find-all: Fetch all users.
       . /home/find-by-user/{userId}: Fetch all homes related to a specific user.
       . /user/find-by-home/{homeId}: Fetch all users related to a specific home.
       . /home/update-users: Update the users associated with a specific home.

2. **Frontend (React)**
        . Navbar (User Dropdown):

      .  Dropdown to select a user from the list.
        Fetch all users from the backend using the /user/find-all API.
        When a user is selected, display all homes related to that user.
        Home List (Home Cards):

      .  For the selected user, fetch and display a list of homes they're interested in, using /home/find-by-user/{userId}.
        Display details of each home such as name, price, state, etc.
        Include an "Edit Users" button for each home to update the users associated with it.
        Edit User Modal:

      .  Modal to modify the users associated with a home.
        Fetch users associated with the home using /user/find-by-home/{homeId}.
        Allow selection (checkboxes) to update users.
        Submit the updated users list to the backend using /home/update-users.

3. **Backend (Node.js with TypeORM)**
      Tables:

      user: Contains user details like username and email.
      home: Contains home details like id, name, list_price, etc.
      user_home_relationship: A junction table that stores relationships between users and homes.
      API Endpoints:

      /user/find-all: Returns all users from the database.
      /home/find-by-user/{userId}: Returns all homes associated with a given user.
      /user/find-by-home/{homeId}: Returns all users associated with a given home.
      /home/update-users: Updates the users associated with a given home by sending a list of usernames and home ID.
      Data Flow:

      When a user selects a home and clicks on "Edit Users", the modal opens with the current list of users associated with that  
       home.
      The user can modify the list of users and submit changes.
      On submission, the backend updates the user_home_relationship table to reflect the new associations.

4. **Redux Integration**
      State Management:

      Use Redux to manage the state of users and homes.
      Dispatch actions to fetch and store users and homes in the Redux store.
      Use selectors to get the current state of users and homes.
      API Requests:

      Use Redux Thunks or Redux Toolkit Query to handle API requests for fetching and updating data.


> 

## 3. Backend API development on Node

User Home API Documentation

To enable effective interaction between the web app and the database, the following solution points have been implemented:
## User Home APIs

  - **/user/find-all**: Retrieve all users.
  - **/user/find-by-home**: Retrieve users associated with a specific home.
  - **/home/find-by-user**: Retrieve homes associated with a specific user (with pagination).
  - **/home/update-users**: Update the list of users associated with a specific home.

  - **HTTP Methods**: Used appropriate HTTP methods (GET, POST, PUT, DELETE) for different operations.

  - **JSON Interface**: Ensured all APIs use JSON format for both requests and responses.

  - **Error Handling**: Implemented robust error handling with appropriate status codes and messages.

  - **Database Interaction**:
        ORM/Database Library: Utilized TypeORM (or another ORM like Prisma or Sequelize) for database interactions to simplify CRUD 
        operations and maintain code readability.
        Sanitization: Ensured that data sent in requests is sanitized to prevent SQL injection and other security vulnerabilities.
        Data Validation: Validated incoming data to ensure it meets expected formats and constraints.

  - **Idempotency**
       Idempotent Operations: Ensured operations like /home/update-users are idempotent, meaning multiple identical
         requests produce the same result as a single request.

## Endpoint: /user/find-all

- **Method:** Get
- **Summary:** Retrieve all users from the database
- **Operation ID:** cgetAllUsers
- **Tags:** User
- **Responses:**
  - **200:** List of all users
    ### Example:
```bash
[
  {
    "id": "1",
    "username": "johndoe",
    "email": "johndoe@example.com"
  },
  {
    "id": "2",
    "username": "janedoe",
    "email": "janedoe@example.com"
  }
]


fetch("http://baseUrl/user/find-all", {
  method: "GET",
  headers: {
    "Content-Type": "application/json"
  }
})
  .then(response => response.json())
  .then(result => console.log(result))
  .catch(error => console.error(error));

```

## Endpoint: /home/find-by-user

- **Method:** Get
- **Summary:** Retrieve all homes related to a specific user with pagination support
- **Operation ID:** getHomesByUser
- **Tags:** Home
- **Parameters:**
- **userId:** The ID of the user to retrieve homes for
- **page:** The page number for pagination (optional, default: 1)

- **Responses:**
  - **200:** 200: List of homes related to the user
    ### Example:
```bash
{
  "homes": [
    {
      "id": "101",
      "street_address": "123 Elm Street",
      "city": "Springfield",
      "state": "IL",
      "zip": "62701"
    },
    {
      "id": "102",
      "street_address": "456 Oak Avenue",
      "city": "Springfield",
      "state": "IL",
      "zip": "62702"
    }
  ],
  "page": 1,
  "pageSize": 50,
  "totalItems": 100
}

fetch("http://baseUrl/home/find-by-user?userId=1&page=1&pageSize=50", {
  method: "GET",
  headers: {
    "Content-Type": "application/json"
  }
})
  .then(response => response.json())
  .then(result => console.log(result))
  .catch(error => console.error(error));


```

## Endpoint: /user/find-by-home

- **Method:** Get
- **Summary:** Retrieve all users related to a specific home
- **Operation ID:** getUsersByHome
- **Tags:** User
- **Parameters:**
- **homeId**: ID of the home to retrieve users for (query parameter)

- **Responses:**
  - **200:** List of users related to the home
    ### Example:
```bash
[
  {
    "id": "1",
    "username": "johndoe",
    "email": "johndoe@example.com"
  },
  {
    "id": "2",
    "username": "janedoe",
    "email": "janedoe@example.com"
  }
]

fetch("http://baseUrl/user/find-by-home?homeId=101", {
  method: "GET",
  headers: {
    "Content-Type": "application/json"
  }
})
  .then(response => response.json())
  .then(result => console.log(result))
  .catch(error => console.error(error));



```

## Endpoint: /home/update-users

- **Method:** PUT
- **Summary:** Update the list of users associated with a specific home
- **Operation ID:** updateUsersByHome
- **Tags:** Home
- **Request Body:**
- **homeId**: ID of the home to update (string)
- **usernames**: Array of usernames to be associated with the home (array of strings)


- **Responses:**
  - **200:** Users updated successfully
  - **400:** Invalid request body
  - **404**: Home or users not found


    ### Example:
```bash
const myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");

const raw = JSON.stringify({
  "homeId": "101",
  "usernames": ["johndoe", "janedoe"]
});

const requestOptions = {
  method: "PUT",
  headers: myHeaders,
  body: raw,
  redirect: "follow"
};

fetch("http://baseUrl/home/update-users", requestOptions)
  .then(response => response.json())
  .then(result => console.log(result))
  .catch(error => console.error(error));

```

## 4. Set-up Installation
To set up the installation, you will need to follow these steps:
1. Clone the repository using the command `git clone https://github.com/username/repository.git`
2. Navigate to the project directory using the command `cd repository`
3. Install the required dependencies 
cd frontend/home_assessment-main
   `npm install`

cd backend/HomeTorm
    `npm install`

4. Run the frontend and backend:
    1. Run the frontend and backend:
      # Start the backend server (Node.js):
        . cd backend/HomeTorm
        `npx tsc`
        `node dist/app.js`

      # Start the fronted React:
        . cd frontend/home_assessment-main
          `npm start`



### frontend & backend

- all frontend / backend code should go entirely in the `./frontend` / `./backend` directories
- we are fine with testing your solution in either `dev` or `production` mode, just make sure the instructions are properly documented

> [!CAUTION]
> make sure to **commit the .env files** for both backend & frontend, if they are needed to run your solutions



