FROM : node:latest
COPY : package.json .
RUN : npm install --quiet
COPY : app.js .
COPY : ./views .
ENTRYPOINT : npm start