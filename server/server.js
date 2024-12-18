require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 3500;
const MONGODB_URL = process.env.MONGO_URL;

const app = express();

// Connect to MongoDB
mongoose.connect(MONGODB_URL)
  .then(() => {
    console.log('Database is connected');
  })
  .catch((err) => {
    console.error('Error connecting to the database:', err.message);
  });


// Middleware
app.use(cors());
app.use(express.json());

// API Routes

//User Login And Regsiter
app.use('/auth', require('./router/AuthRouter')); 

//
app.use('/Payment',require('./router/PaymentRouter'))


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
