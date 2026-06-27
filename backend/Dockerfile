FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies needed for sharp
RUN apk add --no-cache python3 make g++

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

RUN npx prisma generate
RUN npx tsc

FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./
COPY --from=builder /app/docker-entrypoint.sh ./
COPY --from=builder /app/migrate-folders.js ./

EXPOSE 3001

ENTRYPOINT ["./docker-entrypoint.sh"]
