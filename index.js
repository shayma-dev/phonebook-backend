const express = require("express");
const cors = require('cors');
const morgan = require("morgan");

const app = express();
app.use(cors());
app.use(express.json());

morgan.token("body", (request) => JSON.stringify(request.body));

app.use(
  morgan((tokens, request, responce) => {
    const log = [
      tokens.method(request, responce),
      tokens.url(request, responce),
      tokens.status(request, responce),
      tokens.res(request, responce, "content-length"),
      "-",
      tokens["response-time"](request,responce),
      "ms",
    ].join(" ");

    if (request.method === "POST") {
      return `${log} ${tokens.body(request, responce)}`;
    }

    return log;
  })
);

let persons = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

const generateId = () => {
  const id = Math.floor(Math.random() * 1_000_000);
  return String(id);
};

app.get("/api/persons", (request, responce) => {
  responce.json(persons);
});

app.get("/info", (request, responce) => {
  const count = persons.length;
  const date = new Date();
  const htmlResponse = `<p>Phonebook has info for ${count} people</p><p>${date}</p>`;
  responce.send(htmlResponse);
});

app.get("/api/persons/:id", (request, responce) => {
  const id = request.params.id;
  const person = persons.find((p) => p.id === id);

  if (person) {
    responce.json(person);
  } else {
    responce.status(404).end();
  }
});

app.delete("/api/persons/:id", (request, responce) => {
  const id = request.params.id;
  persons = persons.filter((p) => p.id !== id);

  responce.status(204).end();
});

app.post("/api/persons", (request, responce) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return responce.status(400).json({
      error: "name or number missing",
    });
  }

  const nameExists = persons.some((p) => p.name === body.name);
  if (nameExists) {
    return responce.status(400).json({
      error: "name must be unique",
    });
  }

  const person = {
    id: generateId(),
    name: body.name,
    number: body.number,
  };

  persons = persons.concat(person);

  responce.json(person);
});

const unknownEndpoint = (request, responce) => {
  responce.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});