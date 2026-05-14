# 01 - Update seed

As a QA
I want to have a method to load the data into the database
So that I can refresh the database each time I am going to run the e2e tests

## Description

At this moment, the `frontend/prisma/seed.ts` file contains the instructions to create all the data into the database. But, if we run twice this script, we will receive errors because it is trying to create the same data more than once.

In this ticket, we want to update the `frontend/prisma/seed.ts` file to remove all the data from the database before adding new data. This way, every time we run the script, we will have a fresh database, ready to be used for testing.

## Command to run the data creation

```bash
cd backend
npx ts-node ./prisma/seed.ts
```