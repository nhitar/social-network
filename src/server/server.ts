import express from 'express';
import routes from './routes/routes'
import path from 'path';

const server = express();

const projectRoot = process.cwd();

server.set('view engine', 'pug');
server.set('views', path.join(projectRoot, 'src/client/views'));

server.use(express.urlencoded({ extended: true }));
server.use(express.json());

server.use('/avatars', express.static(path.join(projectRoot, 'public/avatars')));
server.use('/photos', express.static(path.join(projectRoot, 'public/photos')));
server.use('/css', express.static(path.join(__dirname, '../css'))); // in production version
server.use('/', routes);

server.listen(3000);