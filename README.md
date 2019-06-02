## This exercise is connecting to remote server using nodeJs net package

## How to run
``` node app.js```

## What it is doing
* Login to server and unqiuely identify the each connection
* Accept the {"request":"time"} command
* Accept the {"request":"count"} command
* Accept the [{"request":"count"}{"request":"time"}] command
* Handle heartbeat and on failure reconnect