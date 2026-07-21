FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY apps/events/package.json apps/events/package.json
RUN npm ci --workspace=@eventhub/events
COPY apps/events apps/events
RUN npm run build --workspace=@eventhub/events
FROM nginx:1.27-alpine
COPY --from=build /app/apps/events/dist /usr/share/nginx/html
