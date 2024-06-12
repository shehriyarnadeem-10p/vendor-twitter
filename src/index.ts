import {checkRequestBin} from'./notes';
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const EventEmitter = require('events');

const app = express();
const port = 80;
app.use(bodyParser.json());


// Poll RequestBin at regular intervals
setInterval(checkRequestBin, 5000); // Check every 5 seconds

// Endpoint to manually trigger the check
app.get('/check-messages', async (req:any, res:any) => {
    await checkRequestBin();
    res.send('Checked for messages');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});