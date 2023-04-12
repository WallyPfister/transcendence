FROM node:18-alpine3.16

WORKDIR /app

COPY ./package.json .

COPY . .

RUN set -eux && \
	npm install && \
	npm install prisma --save-dev

RUN npx prisma generate

RUN	npm run build

CMD ["npm", "run", "start:dev"]
# CMD ["tail", "-f"]
# RUN mkdir -p /app
# WORKDIR /var/app

# COPY package*.json .
# COPY ../../. .
# RUN set -eux && \
# 	apk update && \
# 	apk add npm
# CMD ["node", "dist/main.js"]
# FROM node:14-alpine

# WORKDIR /app

# COPY package*.json ./
# # COPY . .
# COPY ./entrypoint.sh /entrypoint.sh
# RUN chmod +x /entrypoint.sh
# ENTRYPOINT ["/entrypoint.sh"]
# CMD ["npm", "run", "start:prod"]
