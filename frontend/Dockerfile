FROM docker.io/node:21-alpine as build

USER root
WORKDIR /angular_code

RUN npm install -g @angular/cli

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-save

COPY . ./
RUN ng build --output-hashing none --output-path /angular_build

FROM docker.io/nginx:latest

COPY --from=build /angular_build /static_site
COPY nginx.conf /etc/nginx/
