# rxthrowdown

## Local Development

### Prerequisites
- Node.js (v18+ recommended)
- npm (comes with Node.js)
- MongoDB (running locally or provide a connection string in `.env`)

### 1. Install dependencies

From the project root, run:

```sh
npm install
cd client && npm install
cd ../server && npm install
```

### 2. Set up environment variables

Create a `.env` file in the `server` directory. Example:

```
MONGO_URI=mongodb://localhost:27017/rxthrowdown
JWT_SECRET=your_jwt_secret
PORT=5000
```

### 3. Start the backend server

From the `server` directory:

```sh
npm run dev
```
The backend will run on [http://localhost:5000](http://localhost:5000)

### 4. Start the frontend (React) client

From the `client` directory:

```sh
npm start
```
The frontend will run on [http://localhost:3000](http://localhost:3000) and proxy API requests to the backend.

---
For development, keep both the client and server running in separate terminals.
