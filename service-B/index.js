const express = require("express");
const consumeMessage = require("./mq");
const axios = require("axios");

const app = express();
consumeMessage();
const serviceName = "Service-B";

app.use(express.json());

app.get("/:message", async (req, res) => {
  const reply = await sendMessage(req.params.message);

  res.send(reply);
});

app.listen(5002, () => {
  console.log("listening on port: 5002");
  axios
    .post(`http://localhost:5000/${serviceName}/5002`)
    .then((response) => {
      console.log(response.data);
    })
    .catch((err) => {
      console.log("-->", err);
    });
});
