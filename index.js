const express = require("express");
const cors = require("cors");
const app = express();
app.use(express.json());
// used to allow scripts to interact with origins of differnt sources
app.use(cors());
require("dotenv").config();

// this line displays the static files from /dist folder
// in this case they're the minified frontend production build version of the site
// once this is in use the route for `app.get("/")` is overwritten
app.use(express.static("dist"));

const Note = require("./models/note");

// // test data at the start, to comment out when not needed
// let notes = [
//   {
//     id: 1,
//     content: "HTML is easy",
//     important: true,
//   },
//   {
//     id: 2,
//     content: "Browser can execute only JavaScript",
//     important: false,
//   },
//   {
//     id: 3,
//     content: "GET and POST are the most important methods of HTTP protocol",
//     important: true,
//   },
// ];

app.get("/", (req, res) => {
  res.send("<h1>Hello VVorld!</h1>");
});

app.get("/api/notes", (req, res) => {
  Note.find({}).then((notes) => {
    res.json(notes);
  });
});

// // first version of get by id route
// app.get("/api/notes/:id", (req, res) => {
//   const id = parseInt(req.params.id);
//   const note = notes.find((note) => {
//     // console.log(`${note.id}, ${typeof note.id}, ${id}, ${typeof id}, ${note.id === id}`)
//     return note.id === id;
//   });

//   if (note) {
//     res.json(note);
//   } else {
//     res.status(404).end();
//   }
// });

// get by id route using mongoose
app.get("/api/notes/:id", (request, response, next) => {
  Note.findById(request.params.id)
    .then((note) => {
      if (note) {
        response.json(note);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => {
      // console.log(error);
      // response.status(400).send({ error: "malformatted id" });
      next(error)
    });
});

// // first version of delete route
// app.delete("/api/notes/:id", (req, res) => {
//   const id = parseInt(req.params.id);
//   notes = notes.filter((note) => note.id !== id);
//   res.status(204).end();
// });

app.delete('/api/notes/:id', (request, response, next) => {
  Note.findByIdAndDelete(request.params.id)
    .then(result => {
      // TODO write something that checks if item is rly deleted cos currently a 
      // note that doesnt exist will also return the same 204
      response.status(204).end()
    })
    .catch(error => next(error))
})

// // for generation of id without mongodb
// const generateId = () => {
//   const maxId = notes.length > 0 ? Math.max(...notes.map((n) => n.id)) : 0;
//   return maxId + 1;
// };

// // first version of post route
// app.post("/api/notes", (req, res) => {
//   const body = req.body;

//   if (!body.content) {
//     return res.status(400).json({
//       error: "content missing",
//     });
//   }

//   const note = {
//     id: generateId(),
//     content: body.content,
//     important: body.important || false,
//   };

//   notes = notes.concat(note);
//   res.json(note);
// });

app.post("/api/notes", (request, response, next) => {
  const body = request.body;

  if (body.content === undefined) {
    return response.status(400).json({ error: "content missing" });
  }

  const note = new Note({
    content: body.content,
    important: body.important || false,
  });

  note.save()
    .then((savedNote) => {
      response.json(savedNote);
    })
    .catch(error => next(error));
});

app.put('/api/notes/:id', (request, response, next) => {
  const body = request.body

  const note = {
    content: body.content,
    important: body.important,
  }

  Note.findByIdAndUpdate(
    request.params.id, 
    note, 
    { new: true, runValidators: true, context: 'query' })
    .then(updatedNote => {
      response.json(updatedNote)
    })
    .catch(error => next(error))
})

// middleware for handling unsupported routes should be here, after all the routes
// are defined and just before the errorhandler function


const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message})
  }

  next(error)
}

// this has to be the last loaded middleware.
app.use(errorHandler)

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server started at ${new Date()}, running on port ${PORT}`);
});
