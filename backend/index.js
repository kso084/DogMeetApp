const express = require('express');

const app = express();
app.use(express.json({limit: '20mb'}));

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Listening to bits on port ${port}`));