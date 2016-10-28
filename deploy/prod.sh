#!/bin/bash

SRC_DIR="./src"
DEST_DIR="/var/www/node-anime-directory/"

rsync -rvz --progress -e "ssh -p ${SSH_PORT}" $SRC_DIR $REMOTE_USER@$REMOTE_HOST:$DEST_DIR
