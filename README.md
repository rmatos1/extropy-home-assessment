# Personal Expense Tracker

A full-stack personal expense tracker built as part of the Extropy Home Assessment.

The application allows users to authenticate, manage expenses and categories, filter expenses, visualize spending, and receive AI-assisted category suggestions based on expense descriptions.

## Live Application

- Frontend: https://extropy-home-assessment.vercel.app
- API: https://zpi4rbmxil.execute-api.us-east-1.amazonaws.com
- Repository: https://github.com/rmatos1/extropy-home-assessment

## Features

### Authentication

- Sign up and login with email and password
- JWT-based authentication
- HTTP-only session cookie
- Protected dashboard routes
- Logout

### Expense Management

- Create, edit, and delete expenses
- List expenses and filter by date range and category
- Expense fields: amount, description, category, and date

### Category Management

- Predefined categories: Bills, Entertainment, Food, Health, Shopping, Transport, and Other
- Create custom categories
- Client-side category caching with Zustand

### Reporting

- Current month spending
- Current year spending
- Monthly spending chart
- Spending breakdown by category
- Recent expenses

### AI-Assisted Categorization

When the user enters or changes an expense description, the application can suggest a category using OpenAI.

The suggestion request is triggered only after the user stops typing for a short debounce period. This reduces unnecessary API calls, latency, and cost.

The OpenAI request is performed exclusively by the Expenses Lambda, keeping the API key private. The backend provides the expense description and available categories to the model and parses the result into a category ID and confidence score.

AI is not required for the core expense workflow. If the suggestion fails, the user can continue by selecting a category manually.

## Architecture

```text
                         ┌────────────────────┐
                         │       Vercel       │
                         │   React + Vite     │
                         │      Frontend      │
                         └─────────┬──────────┘
                                   │ HTTPS
                                   ▼
                         ┌────────────────────┐
                         │    API Gateway     │
                         │     HTTP API       │
                         └─────────┬──────────┘
                                   │
        ┌──────────────────────────┼──────────────┌
        │             │            │              │
        ▼             ▼            ▼              ▼
   ┌─────────┐  ┌───────────┐ ┌────────────┐ ┌────────────┐
   │  Auth   │  │ Expenses  │ │ Categories │ │  Spending  │
   │ Lambda  │  │  Lambda   │ │   Lambda   │ │   Report   │
   └────┬────┘  └─────┬─────┘ └──────┬─────┘ │   Lambda   │
        │             │              │       └─────┬──────┘
        │             │              │             │
        │             │              │             │
        │             ▼              │             │
        │       ┌────────────┐       │             │
        │       │  OpenAI    │       │             │
        │       │    API     │       │             │
        │       └────────────┘       │             │
        │                            │             │
        └──────────────┬─────────────┴─────────────┘
                       ▼
                ┌───────────────┐
                │    DynamoDB   │
                │               │
                │ Users         │
                │ Expenses      │
                │ Categories    │
                └───────────────┘
```

### Repository Structure

```text
.
├── apps/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── lambdas/
│   │   │   └── dynamodb/
│   │   │
│   │   └── serverless.ts
│   │
│   └── frontend/
│       ├── src/
│       │   ├── components/
|       |   ├── helpers/
|       |   ├── icons/
│       │   ├── pages/
│       │   ├── router/
│       │   ├── services/
│       │   └── store/
│       └── vite.config.ts
│
├── packages/
│   └── shared/
│       └── src/
│
├── package.json
├── pnpm-workspace.yaml
└── pnpm-lock.yaml
```

## Technology Stack

### Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Zustand
- Recharts
- React Testing Library
- Vitest

### Backend

- Node.js 22
- TypeScript
- AWS Lambda
- API Gateway HTTP API
- DynamoDB
- Serverless Framework
- JWT authentication
- OpenAI API

### Infrastructure

- AWS Lambda
- API Gateway
- DynamoDB
- IAM
- Serverless Framework

## Prerequisites

- Node.js 22+
- pnpm 11+
- AWS CLI
- An AWS account with permission to deploy the Serverless stack
- OpenAI API key

Verify the installed versions:

```bash
node --version
pnpm --version
aws --version
```

## Environment Variables

The project uses separate environment files for the frontend and backend.

### Backend

Create:

```text
apps/backend/.env
```

Example:

```env
JWT_SECRET=your-jwt-secret
OPENAI_API_KEY=your-openai-api-key
```

| Variable         | Description                                                     |
| ---------------- | --------------------------------------------------------------- |
| `JWT_SECRET`     | Secret used to sign and verify JWT session tokens               |
| `OPENAI_API_KEY` | API key used by the backend for AI-powered category suggestions |

### Frontend

Create:

```text
apps/frontend/.env
```

Example:

```env
VITE_API_URL=https://your-api-url
```

| Variable       | Description                  |
| -------------- | ---------------------------- |
| `VITE_API_URL` | Base URL of the deployed API |

`VITE_API_URL` is intentionally public because it is required by the browser to communicate with the API. Do not store secrets in `VITE_*` variables.

## Installation

Clone the repository:

```bash
git clone https://github.com/rmatos1/extropy-home-assessment.git

cd extropy-home-assessment
```

Install all workspace dependencies:

```bash
pnpm install
```

## Development

Create the required .env files for frontend and backend, and run the development environment from the repository root:

```bash
pnpm run dev
```

The frontend is available at:

```text
http://localhost:5173
```

## Build

Build the workspace from the repository root:

```bash
pnpm run build
```

The frontend production build is generated in:

```text
apps/frontend/dist
```

## Testing

Run the test suite from the repository root:

```bash
pnpm test
```

Tests cover critical frontend and backend functionality, including components, hooks, services, loaders, actions, stores, Lambda handlers, and business logic.

## Linting

Run ESLint:

```bash
pnpm --filter frontend lint
```

To automatically fix supported issues:

```bash
pnpm --filter frontend exec eslint . --fix
```

## Type Checking

Run TypeScript checks:

```bash
pnpm --filter frontend exec tsc -b
```

## Deployment

### Backend

The backend is deployed to AWS using Serverless Framework.

Configure AWS credentials first and verify them with:

```bash
aws sts get-caller-identity
```

Deploy the backend:

```bash
pnpm exec serverless deploy --aws-profile YOUR_AWS_PROFILE
```

The deployment creates the API Gateway endpoints, Lambda functions, DynamoDB tables, and IAM resources.

### Frontend

The frontend is deployed to Vercel.

The Vercel project uses:

```text
Framework: Vite
Root Directory: /
Install Command: pnpm install
Build Command: pnpm --filter frontend build
Output Directory: apps/frontend/dist
```

Configure the following production environment variable in Vercel:

```text
VITE_API_URL=https://zpi4rbmxil.execute-api.us-east-1.amazonaws.com
```

## Key Design Decisions

### Monorepo

A pnpm workspace keeps frontend, backend, and shared types in separate packages while allowing code reuse through `@extropy/shared`.

### Serverless Architecture

AWS Lambda and API Gateway were chosen to provide a simple architecture without managing servers. DynamoDB uses pay-per-request billing and fits the application's access patterns.

### State Management

Zustand is used for lightweight client-side state such as authentication information and cached categories.

### Authentication

Authentication uses JWTs stored in an HTTP-only session cookie. This keeps the token inaccessible to client-side JavaScript and allows the browser to send it automatically with authenticated API requests.

### AI Usage

AI is used for a focused task where it provides direct user value: suggesting expense categories from natural-language descriptions.

The request is debounced to avoid unnecessary calls, handled server-side to protect the API key, and treated as an optional enhancement rather than a dependency of the core workflow.

## API Endpoints

### Authentication

```text
GET    /auth/me
PATCH  /auth/me
POST   /auth/signup
POST   /auth/login
POST   /auth/logout
```

### Expenses

```text
GET    /expenses
POST   /expenses
PUT    /expenses/{id}
DELETE /expenses/{id}
POST   /expenses/suggest-category
```

### Categories

```text
GET    /categories
POST   /categories
```

### Reporting

```text
GET    /spending-report
```

## Troubleshooting

### Missing environment variables

Verify that the correct `.env` files exist:

```text
apps/backend/.env
apps/frontend/.env
```

### AWS authentication errors

Verify the active AWS credentials:

```bash
aws sts get-caller-identity
```

If using a specific AWS profile:

```bash
aws sts get-caller-identity --profile YOUR_AWS_PROFILE
```

Deploy with the same profile:

```bash
pnpm exec serverless deploy --stage prod --aws-profile YOUR_AWS_PROFILE
```

### CORS errors

The backend must allow the origin from which the frontend is served.

For local development:

```text
http://localhost:5173
```

For the deployed frontend, configure the production frontend origin in `serverless.ts`.

## Required Quality Checks

Before submitting the project, verify:

```bash
pnpm install
pnpm run build
pnpm test
pnpm --filter frontend lint
```

All commands should complete successfully before submission.
