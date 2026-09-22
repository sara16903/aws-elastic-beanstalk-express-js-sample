FROM node:16

WORKDIR /app

# Copy dependency manifests first so Docker can cache npm install
COPY package*.json ./
RUN npm install --production

# Copy the rest of the application source
COPY . .

EXPOSE 8080

CMD ["npm", "start"]
