# Project Setup Guide

Follow these steps in order to get the project running locally.

---

## Prerequisites

Make sure you have the following installed:
- [Node.js](https://nodejs.org/)
- [Docker](https://www.docker.com/)
- [npx](https://www.npmjs.com/package/npx)

---

## 1. Install Dependencies

In the project root folder, run:

```bash
npm install
```

---

## 2. Start the Qdrant Database (Docker)

Pull and run the Qdrant vector database container:

```bash
docker run -d \
  --name my-qdrant \
  -p 6333:6333 \
  saifmohamed123/qdrant-dataset:v1
```

> This runs the container in the background. Qdrant will be available at `http://localhost:6333`.

---

## 3. Setup Environment File (Angular)

Copy the environment template:

```bash
cp src/environments/environment.template.ts src/environments/environment.ts
```

Then open `src/environments/environment.ts` and replace the placeholder with your real API key:

```typescript
export const environment = {
  production: false,
  apiKey: 'YOUR_REAL_API_KEY_HERE'
};
```

> ⚠️ `environment.ts` is gitignored — never commit your real API key.

---

## 4. Setup Payment Gateway Secrets

Create a `.env` file in the **root** of the project:

```bash
touch .env
```

Then open `.env` and add your payment gateway secrets:

```env
STRIPE_SECRET_KEY=your-stripe-secret-key-here
PORT=your-port-here
```

> ⚠️ `.env` is gitignored — never commit this file.

---

## 5. Start the JSON Server (Database)

Run the local JSON database on port 3001:

```bash
npx json-server --watch data.json --port 3001
```

> The database will be available at `http://localhost:3001`.

---

## 6. Start the Payment Gateway Server

In a separate terminal, run:

```bash
npm run server
```

---

## All Services at a Glance

| Service              | Command                                          | URL                        |
|----------------------|--------------------------------------------------|----------------------------|
| Angular App          | `ng serve`                                       | http://localhost:4200       |
| Qdrant (Docker)      | `docker run ...`                                 | http://localhost:6333       |
| JSON Server          | `npx json-server --watch data.json --port 3001`  | http://localhost:3001       |
| Payment Gateway      | `npm run server`                                 | depends on server config    |

---

## Notes

- Make sure Docker is running before starting the Qdrant container.
- Run each server in a **separate terminal**.
- Never push `environment.ts` or `.env` to GitHub — they contain sensitive keys.
