COMPOSE_SRC = ./docker-compose.yml

.PHONY : all
all : build
	@ docker-compose -f $(COMPOSE_SRC) up -d

.PHONY : dev
dev : build
	@ docker-compose -f $(COMPOSE_SRC) up

.PHONY : build
build :
	@ docker-compose -f $(COMPOSE_SRC) build --progress=plain

.PHONY : stop
stop :
	@ docker-compose -f $(COMPOSE_SRC) stop

.PHONY : restart
restart :
	@ docker-compose -f $(COMPOSE_SRC) restart

.PHONY : clean
clean :
	@ docker-compose -f $(COMPOSE_SRC) down \
	--remove-orphans --rmi all -v

.PHONY : fclean
fclean : clean

.PHONY : re
re :
	make fclean
	make all
