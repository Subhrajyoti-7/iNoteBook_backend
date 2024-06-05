const express = require('express');
const connectToMongo = require('./db');
var cors = require('cors')

connectToMongo();

const app = express()
const port = 5000

app.use(cors());
app.use(express.json());

//Routers
app.use('/api/auth', require('./routes/auth'));
app.use('/api/note', require('./routes/notes'));

app.get('/', (req, res) => {
    res.send('Hello World!')
})


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})