#!/bin/bash

SRC_DIR="./src"
DEST_DIR="~"

rsync -avz -e "ssh -p ${SSH_PORT}" $SRC_DIR $REMOTE_USER@$REMOTE_HOST:$DEST_DIR
