# scene

a simple, self-hosted semantic image search and gallery. you can throw your images in here and find them later just by describing them in plain english. it uses some cool deep learning models under the hood to make that happen.

## features

- **semantic search:** find your photos using normal words (like "a cat on a sofa"). we use huggingface transformers and pgvector for this.
- **similar images:** find pictures that look like each other just by comparing their embeddings.
- **background processing:** thumbnail generation and embedding extraction happen quietly in the background so you're not kept waiting.
- **auth:** github or google login only (no passwords to manage).
- **clean ui:** built with react 19, vite, and tailwind css 4. it feels snappy and looks good.
- **solid api:** fast, async backend powered by fastapi and sqlmodel.

## tech stack

### backend
- fastapi
- postgresql with pgvector
- sqlmodel & asyncpg
- pytorch, torchvision, transformers
- authlib & jwt for authentication
- managed with uv

### frontend
- react 19
- vite
- tailwind css 4
- swr
- react router 7

## what you need

- docker & docker compose (for the database and easy deployment)
- python 3.12+ (if you want to run the backend locally)
- node.js 20+ or bun (for local frontend dev)
- uv (for python packages)

## how to run it

### 1. clone the repo
```bash
git clone <repository-url>
cd scene
```

### 2. set up your env
just copy the sample environment file and fill in your details.
```bash
cp .env.sample .env
```
make sure to set some secure strings for `JWT_SECRET` and `SESSION_SECRET`. since it's oauth only, you must configure either your github or google credentials to log in.

### 3. the easy way (docker compose)
if you want to run everything at once, docker compose is your friend.
```bash
docker compose up --build -d
```
this spins up the database, the backend api, the frontend, and pgadmin so you can manage your db.

### 4. running locally (for dev)

start the database first:
```bash
docker compose up db -d
```

**backend:**
install your python packages with uv and start the dev server. the background worker will start up automatically.
```bash
uv sync
uv run fastapi dev app/main.py
```
the api will be chilling at `http://localhost:8000`.

**frontend:**
open another terminal window, go to the `www` folder, install the packages, and run it.
```bash
cd www
npm install
npm run dev
```
the frontend will be up at `http://localhost:5173`.

## project layout

- `/app`: the fastapi backend and async workers
- `/www`: the react frontend
- `/uploads`: where your images and thumbnails hang out
