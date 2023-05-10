FROM node:18

WORKDIR /app

COPY . .

RUN apt-get update && apt-get install -y wait-for-it

RUN set -eux && \
	npm install

COPY ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]

CMD ["npm", "run", "build"]
# CMD ["npm", "run", "start:dev"]
