FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY apps/shell/package.json apps/shell/package.json
COPY apps/events/package.json apps/events/package.json
COPY apps/host-dashboard/package.json apps/host-dashboard/package.json
RUN npm ci
COPY apps/shell apps/shell
RUN npm run build --workspace=@eventhub/shell

FROM nginx:1.27-alpine
COPY --from=build /app/apps/shell/dist /usr/share/nginx/html
CMD ["/bin/sh", "-c", "envsubst < /usr/share/nginx/html/config.js > /tmp/config.js && cp /tmp/config.js /usr/share/nginx/html/config.js && nginx -g 'daemon off;'"]
