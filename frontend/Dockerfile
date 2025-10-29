FROM node:20-alpine AS build
WORKDIR /app

# Clear any proxy settings
RUN npm config delete proxy \
    && npm config delete https-proxy \
    && npm config set registry https://registry.npmjs.org/

COPY package*.json ./
RUN npm install --legacy-peer-deps --include=dev

COPY . .
RUN npx vite build

FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
