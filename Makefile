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
#*                            August - Ocotober 2024                         */
#* ************************************************************************* */

#========================================#
#================ DOCKER ================#
#========================================#

NAME			=	TranscendancingQueens
CONTAINER		:=	Trans-container
IMAGE			:=	Trans-image
LIST_CONTAINERS	:= $(shell docker ps -qa)
LIST_IMAGES 	:= $(shell docker images -qa)
LIST_VOLUMES 	:= $(shell docker volume ls -q)

#========================================#
#================ RULES =================#
#========================================#

all:	up
		@docker compose up --build
		@echo "$(P)$(BOLD)======================== DONE BUILDING =========================$(RESET)"
		@echo "\n$(W)~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~$(RESET)\n"
		@echo "$(BOLD)$(Y)$@ $(G)$@ $(B)$@ $(P)$@ $(R)$@$(RESET)"
		@echo "\n$(W)~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~$(RESET)\n"

# build or update the docker images
build:
		@docker compose build
		@echo "$(BOLD)$(G)Docker containers are now build! $(RESET)$(Y)*but not running!$(RESET)"

# build and start the containers
up:		build
		docker compose up
		@echo "$(BOLD)$(G)Docker containers are now build and up running!$(RESET)"

# start the containers
start:
		docker compose start
		@echo "$(BOLD)$(G)Docker containers are now started and up running!$(RESET)"

# stop the running containers without removing them (sends SIGTERM)
# gracefully cleaning up
# start them again with "start"
stop:
		docker compose stop
		@echo "$(BOLD)$(P)Docker containers are now stopped!$(RESET)"

# immediately and forcecfully kill the running containers and network (sends SIGKILL)
# without removing the containers!
# and without cleanup.
kill:
		docker compose kill
		@echo "$(BOLD)$(P)Docker containers are now killed!$(RESET)"

# stop and REMOVE the containers, network, volumes and images created by up and the docker-compose.yml file
# carefull with this one!
# to start them again, create first with ("build" and) "up"
down:
		@docker compose down
		@echo "$(BOLD)$(P)Docker containers are now down and removed!$(RESET)"

# stop all running containers and REMOVE them, remove all images and volumes.
# carefull with this one!
# the (|| true) is used so the Makefile doesn't exit when there's an error:
# if there are no containers running to prevent the make command from stopping.
clean: 
		@docker stop $(LIST_CONTAINERS) || true
		@docker rm $(LIST_CONTAINERS) || true
		@docker rmi -f $(LIST_IMAGES) || true
		@docker volume rm $(LIST_VOLUMES) || true
		@echo "$(BOLD)$(R)Docker containers and volumes deleted!$(RESET)"

# carefull with this one!
re:		down all

gclean:
		@rm -f *.DS_Store ./.DS_Store
		@rm -rf *.dSYM
		@echo "$(C)$(BOLD)DELETED:    $(RESET)$(C)*._DS_Store and *.dSYM files"
		git status
		git add *
		git status
		@echo "$(G)$(BOLD)======================== READY TO COMMIT ========================$(RESET)"

docker-pwd:
	docker run \
	-p 8081:8081 \
	-p 8082:8082 \
	-p 8083:8083 \
	--name $(CONTAINER) \
	-it \
	--rm \
	--init \
	-v "$$PWD:/pwd" \
	--cap-add=SYS_PTRACE \
	--security-opt seccomp=unconfined \
	-e CXX="clang++" \
	-e CXXFLAGS="-Wall -Wextra -Werror -std=c++20 -g -gdwarf-4 -gstrict-dwarf" \
	-e LDFLAGS="-g -gdwarf-4 -gstrict-dwarf" \
	$(IMAGE) sh -c "cd /pwd; bash"

docker-clean:
	docker run \
	-p 8081:8081 \
	--name $(CONTAINER) \
	-it \
	--rm \
	--init \
	-v "$$PWD:/pwd" \
	--cap-add=SYS_PTRACE \
	--security-opt seccomp=unconfined \
	-e CXX="clang++" \
	-e CXXFLAGS="-Wall -Wextra -Werror -std=c++20" \
	-e LDFLAGS="" \
	$(IMAGE) sh -c "cd /pwd; bash"

docker-build:
	docker build -t $(IMAGE) .

docker-exec:
	docker exec -it $(CONTAINER) sh -c "cd /pwd; bash"

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