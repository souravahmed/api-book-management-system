## Project

A RESTful API built with **NestJS** and **TypeORM** to efficiently manage authors and books.  
Supports CRUD operations, pagination, search, and filtering functionalities.

## Features

- **Authors Management**: Create, update, list, and delete authors with validation.
- **Books Management**: Manage books linked to authors with unique ISBN validation.
- **Pagination & Search**: Filter results by title, ISBN, or author with case-insensitive search.
- **Validation & Error Handling**: Robust validation using `class-validator` and meaningful HTTP responses.
- **Relations**: Each book is associated with an author, ensuring data consistency.

## Database

I chose a SQL database (SQLite) for this project because the data is relational — each author can have multiple books, and SQL handles these relationships with foreign keys and constraints naturally. I didn’t use a NoSQL database like MongoDB because managing relational data and enforcing constraints is more complex in a schema-less system.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

```

## Run tests

```bash
# all tests
$ npm run test
```
