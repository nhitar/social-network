import https from 'https';
import express from 'express';
import routes from './routes/routes'
import fs from 'fs';
import path from 'path';
import open from 'open'

const server = express();

const projectRoot = process.cwd();

const options = {
    key: fs.readFileSync(path.join(projectRoot, './keys/server.key')),
    cert: fs.readFileSync(path.join(projectRoot, './keys/server.cert'))
  };

server.set('view engine', 'pug');
server.set('views', path.join(projectRoot, 'src/client/views'));

server.use(express.urlencoded({ extended: true }));
server.use(express.json());

server.use('/avatars', express.static(path.join(projectRoot, 'public/avatars')));
server.use('/photos', express.static(path.join(projectRoot, 'public/photos')));
server.use('/favicon', express.static(path.join(projectRoot, 'public/favicon')));
server.use('/css', express.static(path.join(__dirname, '../css'))); // in production version
server.use('/', routes);

https.createServer(options, server).listen(3000, () => {
    open('https://localhost:3000');
});