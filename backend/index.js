const express = require('express');
const connection = require('./config/connexionDB'); 

const cors = require('cors');  


const app = express();
app.use(express.json());
connection();

app.use(cors())


app.use('/auth',require('./routes/userRoutes'))
app.use('/lead',require('./routes/leadRoutes'))
app.use('/notifications', require('./routes/notificationRoutes'));
app.use('/notes', require('./routes/noteRoutes'));



app.listen(5000, () => {
  console.log('Server is running on http://localhost:5000');
});
