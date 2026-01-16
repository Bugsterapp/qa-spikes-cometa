<div align="center">
    <a href="https://www.getcometa.com/">
        <img src="https://uploads-ssl.webflow.com/6323af3a160e0a067e91428a/6335c386196555f5d769e84d_Cometa_Logo-50.svg" alt="Cometa" width="200px">
    </a>
    <br/>
    <br/>
</div>

<div align="center">
  • <a href="#set-up">Set Up</a>
  • <a href="#start-backend">Start backend</a>
  • <a href="#environments">Environments</a>
</div>

## Set up

To clone and run this application, you'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/download) From your command line:

```bash
# Clone this repository
$ git clone git@github.com:getcometa/cometa-frontend.git

```

Prerequisites -

Before you begin, make sure you have the following dependencies installed:

- Node.js (v16 or later)
- npm (v8.6.0 or later)
- vercel cli

## Installation

To install the required dependencies and set up the project, follow these steps:

Clone the repository or download the zip file to your local machine.

### Setup your Vercel credentials

To be able to pull the environment variables for the projects you should get your [Vercel token](https://vercel.com/account/tokens).

Set up your token in the scope for `Cometa` and set it to never expire, save it to a local `.env` file at the root of this repository under the variable `VERCEL_TOKEN`.

#### Important

If you have a different clone url for cometa (ie, `git@github.com-cometa:getcometa/cometa-frontend.git`):

1. Go to `.git/config`
2. Change the url temporarily to `git@github.com:getcometa/cometa-frontend.git`
3. Finish the steps
4. Rollback the url change

Open a terminal and navigate to the root directory of the project.
Run the following command to install the dependencies:

```bash
npm install
npx playwright install
```

#### _What if I don't have a Vercel account?_

If you don't have a Vercel account yet or don't plan to have one, you can skip this step by running `npm install` and setting the `VERCEL` environment variable to `1`.

```sh
VERCEL=1 && npm run install
```

### Pull environment variables

Run the script

```bash
npm run pull_envs
```

Download the environment variables for `dashboard` and `guardian-portal` and ta-da!

## Guardian

### Running the Project

To start the development server and access the project in a web browser, follow these steps:

In the terminal, navigate to the root directory of the project.
Run the following command to start the development server for the guardian:

```bash
npm run dev:guardian
```

The project will be available at http://localhost:3000/

## Dashboard

### Running the Project

To start the development server and access the project in a web browser, follow these steps:

In the terminal, navigate to the root directory of the project.

Run the following command to start the development server for the dashboard:

```bash
npm run dev:dashboard
```

The project will be available at http://localhost:3001/

## Environments

In `.env.development` file you can browse all variables related with the enviroment . You can see this file inside each project directory.

## Testing

#To run all test ejecute on terminal this command
ENV=local npx playwright test

To more detailed explanation of how we code and run our tests, visit this wiki https://www.notion.so/cometa/Como-automatizamos-con-playwright-pruebas-de-integraci-n-regresi-n-78d2dcf3f16a4fa4a07375a4661bac41
