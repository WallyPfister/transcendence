COMPOSE_SRC = ./docker-compose.yml

.PHONY : all
all : build
	@ mkdir -p $(VOLUME_PATH)/example_path
	@ sudo docker compose -f $(COMPOSE_SRC) up -d

.PHONY : dev
dev : build
	@ sudo docker compose -f $(COMPOSE_SRC) up

.PHONY : build
build :
	@ sudo docker compose -f $(COMPOSE_SRC) build --progress=plain

.PHONY : stop
stop :
	@ sudo docker compose -f $(COMPOSE_SRC) stop

.PHONY : restart
restart :
	@ sudo docker compose -f $(COMPOSE_SRC) restart

.PHONY : clean
clean :
	@ sudo docker compose -f $(COMPOSE_SRC) down \
	--remove-orphans --rmi all -v

.PHONY : fclean
fclean : clean

.PHONY : re
re :
	make fclean
	make all
