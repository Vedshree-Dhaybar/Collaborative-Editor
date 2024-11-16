const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/docsDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const docSchema = new mongoose.Schema({
  title: String,
  content: String,
});

const Document = mongoose.model("Document", docSchema);

app.get("/documents", async (req, res) => {
  const documents = await Document.find();
  res.json(documents);
});

app.post("/documents", async (req, res) => {
  const newDocument = new Document(req.body);
  await newDocument.save();
  res.json(newDocument);
});

app.delete("/documents/:id", async (req, res) => {
  await Document.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

app.listen(5000, () => {
  console.log("Server is running on http://localhost:5000");
});
