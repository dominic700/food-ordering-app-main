# ---------- build ----------
FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
# npm install (not npm ci) so a lockfile mismatch can never break the build
RUN npm install

COPY . .

# EasyPanel passes environment variables as build args
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# call vite through node so the .bin shortcut permissions cannot matter
RUN node node_modules/vite/bin/vite.js build

# ---------- run ----------
FROM node:22-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/dist ./dist
EXPOSE 3000
# -s = single page app mode (React routes work on refresh)
CMD ["serve", "-s", "dist", "-l", "3000"]
