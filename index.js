const express           = require('express');
const bodyParser        = require('body-parser');
const pug               = require('pug');
const sql               = require('sqlite');
const server            = express();

server.set('view engine', 'pug');
server.set('views', './views');
server.disable('x-powered-by');
server.use(express.static(__dirname + '/static'));
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));
sql.open('../eros/db/Eros.db'); //Comment this
//sql.open('./db/Resources.db'); //Uncomment if snek's files are in the same directory
//sql.open('../snek/db/Resources.db'); //Uncomment if snek's files are in its own directory

const recentVisitors = new Map();

server.get('/', (req, res) => require('./routes/browser').execute(req, res));
server.get('/dashboard', (req, res) => require('./routes/dashboard').execute(req, res));
server.get('/justmonika', (req, res) => require('./routes/justmonika').execute(req, res));
server.get('/wae', (req, res) => require('./routes/wae').execute(req, res));
server.get('/latest', (req, res) => require('./routes/latest').execute(req, res));
server.get('/player/:id/:ep/:res', (req, res) => require('./routes/player').execute(req, res, recentVisitors));

server.post('/redirect', (req, res) => require('./routes/redirect').execute(req, res));

server.all('*', (req, res) => res.send('|Eros|403: Access Denied.'));

server.listen(80);
console.log('Listening to http://localhost:80');

process.on('unhandledRejection', err => console.error(`${new Date().toLocaleString()} | Uncaught Promise Error: \n${err.stack}`));