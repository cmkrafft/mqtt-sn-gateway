FROM node:latest
WORKDIR /usr/src/app
COPY . /usr/src/app
RUN yarn
RUN yarn build
RUN rm -rf spec
RUN rm -rf src
RUN rm -rf .git
CMD ["node", "dist/app.js"]

EXPOSE 1883