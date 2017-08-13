#!/bin/bash

SRC_DIR="./src"
DEST_DIR="/var/www/node-anime-directory/builds"
DATE=$(date +"%Y%m%d%H%M")
ARCHIVE_DIR="api_server"_$(date +"%Y%m%d%H%M")
ARCHIVE_FILE_NAME=$ARCHIVE_DIR.tar.gz

DEPLOY_CMD="cd /var/www/node-anime-directory/builds \
&& mkdir $ARCHIVE_DIR \
&& tar -zxvf $ARCHIVE_FILE_NAME -C $ARCHIVE_DIR \
&& cd $ARCHIVE_DIR \
&& yarn \
&& ln -nfs /var/www/node-anime-directory/builds/$ARCHIVE_DIR /var/www/node-anime-directory/current"

tar -zcvf /tmp/$ARCHIVE_FILE_NAME --exclude=./.git --exclude=./*.tar.gz --exclude=./.idea --exclude=./node_modules --exclude=./tests --exclude=./media --exclude=./config.json .
scp -P $SSH_PORT /tmp/$ARCHIVE_FILE_NAME $REMOTE_USER@$REMOTE_HOST:$DEST_DIR/$ARCHIVE_FILE_NAME
ssh -p $SSH_PORT $REMOTE_USER@$REMOTE_HOST -t $DEPLOY_CMD
