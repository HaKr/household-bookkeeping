FROM node:current-alpine

RUN mkdir webserver && cd webserver

USER node

EXPOSE 8088

VOLUME [ "webserver" ]

CMD [ "npm", "start" ]
