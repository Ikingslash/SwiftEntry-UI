FROM node:20 AS build

WORKDIR /app

COPY package*.json ./

RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:${PATH}"

RUN bun install
RUN bun add react-router-dom
RUN bun add @types/react-router-dom

COPY . .

RUN bun run build

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
