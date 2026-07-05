const express = require('express')
const fs = require('fs').promises
const path = require('path')
const app = express()

app.get('/', (req, res) => {
  res.send('Hello from express')
})

app.get('/list', async(req, res) => {
 
  const targetPath = 'D:\\MC servers';
  
  try {
    const entries = await fs.readdir(targetPath, {withFileTypes: true});

    const directories = entries
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);


    res.json({ directories });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error reading directory');
  }
});

app.listen(3000, () => {
  console.log("Listening on port 3000")
})