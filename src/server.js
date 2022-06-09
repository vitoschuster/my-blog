import express from "express";
import bodyParser from "body-parser";
import { MongoClient } from "mongodb"; 
import path from "path";

const app = express();

app.use(express.static(path.join(__dirname, "/build")));
app.use(bodyParser.json());

/**
 * Reusable function for connecting to MongoDB
 * @param {function} operations crud operation functions
 * @param {Response} res http response
 */
const withDB = async (operations, res) => {
  const client = new MongoClient("mongodb://localhost:27017");
  try {
    await client.connect();
    console.log("connection made");
    const db = client.db("my-blog"); // connect to my database
    await operations(db);
  } catch (error) {
    res.status(500).json({ message: "Error conneting to mongoDB", error });
  } finally {
    client.close();
    console.log("connection closed");
  }
};

app.get("/api/articles/:name", async (req, res) => {
  withDB(async (db) => {
    const articleName = req.params.name;
    const articleInfo = await db
      .collection("articles")
      .findOne({ name: articleName });
    res.status(200).json(articleInfo);
  }, res);
});


app.post("/api/articles/:name/upvote", async (req, res) => {
  withDB(async (db) => {
    const articleName = req.params.name; // get article name

    const articleInfo = await db
      .collection("articles")
      .findOne({ name: articleName }); //find article
    await db.collection("articles").updateOne(
      { name: articleName },
      {
        $set: {
          upvotes: articleInfo.upvotes + 1,
        },
      }
    );

    const updatedArticle = await db
      .collection("articles")
      .findOne({ name: articleName });

    res.status(200).json(updatedArticle);
  }, res);
});

/**
 * POST - add a comment to the database
 */
app.post("/api/articles/:name/add-comment", async (req, res) => {
  const articleName = req.params.name;
  const { username, text } = req.body;
  withDB(async (db) => {
    const articleInfo = await db
      .collection("articles")
      .findOne({ name: articleName });
    await db.collection("articles").updateOne(
      { name: articleName },
      {
        $set: {
          comments: articleInfo.comments.concat({ username, text }),
        },
      }
    );
    const updatedArticle = await db
      .collection("articles")
      .findOne({ name: articleName });
    res.status(200).json(updatedArticle);
  }, res);
});


app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build/index.html"));
});

app.listen(8000, () => console.log("Listening on port 8000"));
