const express = require("express");
const cors = require("cors")
const app = express();
app.use(express.json());
app.use(cors())

let notes = [
  {
    id: 1,
    content: "HTML is easy",
    important: true,
  },
  {
    id: 2,
    content: "Browser can execute only JavaScript",
    important: false,
  },
  {
    id: 3,
    content: "GET and POST are the most important methods of HTTP protocol",
    important: true,
  },
];

app.get("/", (req, res) => {
  res.send("<h1>Hello VVorld!</h1>");
});

app.get("/api/notes", (req, res) => {
  res.json(notes);
});

app.get("/api/notes/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const note = notes.find((note) => {
    // console.log(`${note.id}, ${typeof note.id}, ${id}, ${typeof id}, ${note.id === id}`)
    return note.id === id;
  });

  if (note) {
    res.json(note);
  } else {
    res.status(404).end();
  }
});

app.delete("/api/notes/:id", (req, res) => {
  const id = parseInt(req.params.id);
  notes = notes.filter((note) => note.id !== id);
  res.status(204).end();
});

const generateId = () => {
  const maxId = notes.length > 0 ? Math.max(...notes.map((n) => n.id)) : 0;
  return maxId + 1
}

app.post("/api/notes", (req, res) => {
  const body = req.body;
  
  if (!body.content) {
    return res.status(400).json({
      error: 'content missing'
    })
  }
  
  const note = {
    id: generateId(),
    content: body.content,
    important: body.important || false,
  }

  notes = notes.concat(note);
  res.json(note);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server started at ${new Date()}, running on port ${PORT}`);
});
