import express from 'express';
import routes from './routes/routes'
import path from 'path';

const server = express();

server.set('view engine', 'pug');
server.set('views', path.join(__dirname, '../client/views'));

server.use(express.urlencoded({ extended: true }));
server.use(express.json());

server.use('/avatars', express.static(path.join(__dirname, '../../public/avatars')));
server.use('/photos', express.static(path.join(__dirname, '../../public/photos')));
server.use('/css',  express.static(path.join(__dirname, '../../dist/css')));
server.use('/', routes);

server.listen(3000);