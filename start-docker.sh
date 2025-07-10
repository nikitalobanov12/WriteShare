docker run -d --name notion-clone-container -p 3000:3000 --env-file .env notion-clone:latest

docker start notion_clone-postgres

docker start notion-clone-redis