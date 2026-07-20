FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY apps/shell/package.json apps/shell/package.json
COPY apps/events/package.json apps/events/package.json
COPY apps/host-dashboard/package.json apps/host-dashboard/package.json
RUN npm ci
COPY apps/host-dashboard apps/host-dashboard
RUN npm run build --workspace=@eventhub/host-dashboard
FROM nginx:1.27-alpine
COPY --from=build /app/apps/host-dashboard/dist /usr/share/nginx/html
