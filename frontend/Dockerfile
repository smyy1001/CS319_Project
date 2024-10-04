FROM node:14 AS build

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
COPY .env /usr/src/app/.env
COPY . .
RUN npm run build
EXPOSE 7117

FROM nginx:stable-alpine
COPY nginx/nginx.default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /usr/src/app/build /usr/share/nginx/html

# CMD ["npm", "start"]