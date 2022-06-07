import express from 'express';
import bodyParser from 'body-parser';

const app = express();

app.use(bodyParser.json());

app.get('/hello', (req, res) => res.send('helo'));
app.post('/hello', (req, res) => res.send(`Hello ${req.body.name}`));

/* url / route parameter */
app.get('/hello/:name', (req, res) => res.send(`Hello ${req.params.name}`));

app.listen(8000, () => console.log('listening on port 8000'));


/* adding upvotes and comments without a databse */

/* upvote post request */
app.post('/api/articles/:name/upvote', (req, res) => { //get the response 
    const articleName = req.params.name; // name from url params from request
    articlesInfo[articleName].upvotes++; // increment upvotes property from object with the key
    res.status(200).send(`${articleName} now has ${articlesInfo[articleName].upvotes} upvotes`); // send status
})

/* add comments with post request */
app.post('/api/articles/:name/add-comment', (req, res) => { //get the response
    const { username, text } = req.body; // extract username and text from body of the request
    const articleName = req.params.name; // name from url params from request
    articlesInfo[articleName].comments.push({ username, text }); // push comments to the array in object with the key 
    res.status(200).send(articlesInfo[articleName]); // send the json object or use .json()
})