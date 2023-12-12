const express = require("express");
const serviceRegistry = require("./registry");

const app = express();
const registry = new serviceRegistry();

app.use(express.json());

app.use((req, res, next) => {
  const forwardedHeader = req.headers["x-forwarded-for"];
  if (forwardedHeader) {
    const ips = forwardedHeader.split(",");
    req.serviceAddress = ips[0].trim();
  } else {
    const remoteAddress = req.socket.remoteAddress;
    req.serviceAddress = remoteAddress.includes(":")
      ? `[${remoteAddress}]`
      : `remoteAddress`;
  }

  next();
});

app.get("/all/:serviceName", (req, res) => {
  registry
    .all(req.params.serviceName)
    .then((d) => res.json(d).status(200))
    .catch((e) => {
      res.status(e.status).json(e);
    });
});

app.get("/:serviceName", (req, res) => {
  registry
    .get(req.params.serviceName)
    .then((d) => res.json(d).status(200))
    .catch((e) => {
      res.status(e.status).json(e);
    });
});

app.get("/services", (req, res) => {
  registry
    .services()
    .then((d) => res.json(d).status(200))
    .catch((e) => {
      res.status(e.status || 400).json(e);
    });
});

app.post("/:serviceName/:port", (req, res) => {
  const serviceAddress = req.serviceAddress + ":" + req.params.port;
  const serviceName = req.params.serviceName;
  registry
    .add(serviceName, serviceAddress)
    .then((d) => res.json(d).status(200))
    .catch((e) => {
      res.status(e.status).json(e);
    });
});

app.delete("/:serviceName/:port", (req, res) => {
  const serviceAddress = req.serviceAddress + ":" + req.params.port;
  const serviceName = req.params.serviceName;
  registry
    .remove(serviceName, serviceAddress)
    .then((d) => res.json(d).status(200))
    .catch((e) => {
      res.status(e.status).json(e);
    });
});

app.listen(5000, () => {
  console.log("listening on port 5000");
});
