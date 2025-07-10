# command breakdown: 
# run a docker container, the -d flag means detached meaning that the terminal is not attached to the container
# if we use the -p flag than running this command would attach the terminal and behave more like nextjs dev server
# -p 3000:3000 specifies 3000 on the host to port 3000 in the container
# --env-file docker.env loads environment variables from docker.env
# notion-clone:latest uses the notion-clone image for the contianer, this image is defined with docker build -t notion-clone .
docker run -d --name notion-clone-container -p 3000:3000 --env-file docker.env notion-clone:latest

docker start notion_clone-postgres

docker start notion-clone-redis