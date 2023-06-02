FROM node:18

EXPOSE 3000

WORKDIR /usr/src/app

COPY . .

RUN apt-get update

RUN set -eux && \
	npm install

COPY ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]

CMD ["npm", "run", "start"]
