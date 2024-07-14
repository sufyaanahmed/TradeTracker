const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
require('dotenv').config();
const admin = require('firebase-admin');



app.use(cors({
  origin: 'https://trade-tracker-nine.vercel.app/',
}));
app.use(express.json());

const serviceAccount = require('./credentials.json');

app.get('/', (req, res) => {
  res.send('Welcome to the API!');
});

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});


// Your routes here
const tradesRoute = require('./routes/trades');
app.use('/api', tradesRoute);

// Database connection
const uri = process.env.MONGO_URL;
mongoose.connect(uri)
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

const port =  5000;
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});




module.exports = admin; 

/*const express = require('express');
const cors = require('cors');

const trades = require('./routes/trades');


const Trade = require('./models/trade.js');
const mongoose = require('mongoose');
require('dotenv').config();
const app = express();
app.use(cors());
app.use(express.json());




app.post('/api/trade',async (req,res)=>{
    await mongoose.connect(process.env.MONGO_URL);
    const {name,date,reason,pl}=req.body;
    const trade = await Trade.create({name,date,reason,pl})
    res.json(trade);
});


app.get('/api/trades',async (req,res)=>{
    await mongoose.connect(process.env.MONGO_URL);
    const trades = await Trade.find();
    res.json(trades);
});


const port = 4040;
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
*/
