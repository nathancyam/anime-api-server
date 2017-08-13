#!/bin/bash

SRC_DIR="./src"
DEST_DIR="/var/www/node-anime-directory/builds"
DATE=$(date +"%Y%m%d%H%M")
ARCHIVE_DIR="api_server"_$(date +"%Y%m%d%H%M")
ARCHIVE_FILE_NAME=$ARCHIVE_DIR.tar.gz

DEPLOY_CMD="cd /var/www/node-anime-directory/builds \
&& tar -zxvf $ARCHIVE_FILE_NAME \
&& cd $ARCHIVE_DIR \
&& yarn \
&& ln -nfs /var/www/node-anime-directory/current ."

tar -zcvf $ARCHIVE_FILE_NAME --exclude=./.git --exclude=./*.tar.gz --exclude=./.idea --exclude=./node_modules --exclude=./tests --exclude=./media --exclude=./config.json .
rsync -rvz --progress -e "ssh -p ${SSH_PORT}" $ARCHIVE_FILE_NAME $REMOTE_USER@$REMOTE_HOST:$DEST_DIR
ssh -t -p $SSH_PORT $REMOTE_USER@$REMOTE_HOST $DEPLOY_CMD
