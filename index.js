const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();

const app = express();

const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// mongodb connection uri

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qow90.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const run = async () => {
  try {
    await client.connect();
    const database = client.db("technicable");
    const blogCollection = database.collection("blogs");

    // get all blogs
    app.get("/blogs", async (req, res) => {
      const cursor = blogCollection.find({});
      const blogs = await cursor.toArray();
      res.send(blogs);
    });
    // get single blog
    app.get("/blogs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const blog = await blogCollection.findOne(query);
      res.send(blog);
    });

    // add blog
    app.post("/blog", async (req, res) => {
      const blog = req.body;
      console.log(blog);
      const result = await blogCollection.insertOne(blog);
      res.send(result);
    });

    // delete blog
    app.delete("/blog/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await blogCollection.deleteOne(query);
      res.send(result);
    });
    // update blog
    app.put("/blog/:id", async (req, res) => {
      const id = req.params.id;
      const updatedBlog = req.body;

      const filter = { _id: ObjectId(id) };
      console.log(filter);
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          title: updatedBlog.title,
          img: updatedBlog.img,
          author: updatedBlog.author,
          category: updatedBlog.category,
          timeToRead: updatedBlog.timeToRead,
          creditLink: updatedBlog.creditLink,
          tags: updatedBlog.tags,
          description: updatedBlog.description,
        },
      };
      const result = await blogCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
};

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Technicable server is running");
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
