#* ************************************************************************* */
#*																			 */
#*	           --------------------------------------------------            */
#*     					    TRANSCENDANCING QUEENS     			             */
#*	           --------------------------------------------------            */
#*																			 */
#* JEROEN VAN HALDEREN   FELICIA KOOLHOVEN   FLEN HUISMAN   MARES VERBRUGGE  */
#*       jvan-hal             fkoolhov         fhuisman       mverbrug       */
#*                                                                           */
#*          Codam Coding College        part of 42 network                   */
#*                            August - December 2024                         */
#* ************************************************************************* */

#========================================#
#================ DOCKER ================#
#========================================#

NAME			=	transcendence
LIST_CONTAINERS	:= $(shell docker ps -qa)
LIST_IMAGES 	:= $(shell docker images -qa)
LIST_VOLUMES 	:= $(shell docker volume ls -q)

#========================================#
#================ RULES =================#
#========================================#

all:	up

# build or update the docker images
build:
		@docker compose build
		@echo "\n$(W)~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~$(RESET)\n"
		@echo "$(BOLD)$(Y)$(NAME)$(G)$(NAME)$(B)$(NAME)$(P)$(NAME)$(R)$(NAME)$(RESET)"
		@echo "\n$(W)~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~$(RESET)\n"
		@echo "$(BOLD)$(G)Docker containers are now built! $(RESET)$(Y)*but not running!$(RESET)"

# build and start the containers
up:		build
		docker compose up
		@echo "$(BOLD)$(G)Docker containers are now built and up running!$(RESET)"

# start the containers
start:
		docker compose start
		@docker compose logs -f backend
		@echo "$(BOLD)$(G)Docker containers are now started and up running!$(RESET)"

# stop the running containers without removing them (sends SIGTERM)
# gracefully cleaning up
# start them again with "start"
stop:
		docker compose stop
		@echo "$(BOLD)$(P)Docker containers are now stopped!$(RESET)"

# immediately and forcefully kill the running containers and network (sends SIGKILL)
# without removing the containers!
# and without cleanup.
kill:
		docker compose kill
		@echo "$(BOLD)$(P)Docker containers are now killed!$(RESET)"

# stop and REMOVE the containers, network, volumes and images created by up and the docker-compose.yml file
# careful with this one!
# to start them again, create first with ("build" and) "up"
down:
		@docker compose down
		make clean
		@echo "$(BOLD)$(P)Docker containers are now down and removed!$(RESET)"

# careful with this one!
re:		down all

# stop all running containers and REMOVE them, remove all images and volumes.
# careful with this one!
# the (|| true) is used so the Makefile doesn't exit when there's an error:
# if there are no containers running to prevent the make command from stopping.
clean:
		@rm -rf ./backend/dist
		@rm -rf ./backend/node_modules
		@rm -rf ./frontend/node_modules
		@docker stop $(LIST_CONTAINERS) || true
		@docker rm $(LIST_CONTAINERS) || true
		@docker rmi -f $(LIST_IMAGES) || true
		@docker volume rm $(LIST_VOLUMES) || true
		@echo "$(BOLD)$(R)Docker containers and volumes deleted!$(RESET)"

check_database:
		@docker exec -it trans-database psql -U Transcendancingqueens -d pongdb
# en erna \dt
# om te zien of migration is gelukt

# run prisma studio on port 5555
studio:
		@export DATABASE_URL="postgresql://Transcendancingqueens:8:uizdY5._r-Pe+@localhost:5432/pongdb?schema=public"
		@echo ${DATABASE_URL}
		@npx prisma studio --schema ./backend/src/prisma/schema.prisma

#========================================#
#=============== FOR GIT ================#
#========================================#

gclean:
		@rm -f *.DS_Store ./.DS_Store
		@rm -rf *.dSYM
		@echo "$(C)$(BOLD)DELETED:    $(RESET)$(C)*._DS_Store and *.dSYM files$(RESET)\n"
		git status
		git add *
		git status
		@echo "$(G)$(BOLD)======================== READY TO COMMIT ========================$(RESET)"

#========================================#
#=============== COLOURS ================#
#========================================#

BOLD      := \033[1m
RESET     := \033[0m
C         := \033[36m
P         := \033[35m
B         := \033[34m
Y         := \033[33m
G         := \033[32m
R         := \033[31m
W         := \033[0m
