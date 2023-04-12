# VOLUME = ./hyunjcho/data
COMPOSE = docker-compose.yml

all: 
	# @mkdir -p $(VOLUME)
	# @mkdir -p $(VOLUME)/mariadb
	# @mkdir -p $(VOLUME)/wordpress
	docker-compose -f $(COMPOSE) up -d --build

clean:
	docker-compose -f $(COMPOSE) down

fclean:
	docker-compose -f $(COMPOSE) down --rmi all
	docker volume rm $$(docker volume ls -f dangling=true -q)
	# @rm -rf ./hyunjcho

re:
	@make fclean
	make all

.PHONY: all re clean fclean