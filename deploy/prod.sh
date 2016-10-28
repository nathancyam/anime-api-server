#!/bin/bash

SRC_DIR="./../src"
DEST_DIR="~"

rsync -avz $SRC_DIR $REMOTE_USER@$REMOTE_HOST:$DEST_DIR
