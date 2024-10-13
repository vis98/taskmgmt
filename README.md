download nodejs >16
clone url https://github.com/vis98/taskmgmt.git
do npm i[will install reqd things] then

in env file
set below fields

DB_USER=postgres
DB_HOST=localhost
DB_NAME=
DB_PASSWORD=
DB_PORT=

JWT_SECRET=
AWS_REGION=
SQS_QUEUE_URL=
AWS_ACCESS_KEY=
AWS_SECRET_KEY=


open terminal . it require 2 command prompt one to run consumer independently and other is for running nodejs server which indirectly producess data

1 st terminal open go till src/pubsub then run command node consumer.js
then do cd ../.. then run command node app.js

followed  by 3 routes to create update and query the task
