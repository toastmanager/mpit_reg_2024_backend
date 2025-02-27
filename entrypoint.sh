#!/bin/bash

yarn prisma db push --accept-data-loss 
yarn start:prod 