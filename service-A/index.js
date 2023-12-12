const express = require("express");
const sendMessage = require("./mq");
const axios = require("axios");

const app = express();
const serviceName = "Service-A";

app.use(express.json());

app.get("/:message", async (req, res) => {
  const reply = await sendMessage(req.params.message);

  res.send(reply);
});

app.listen(5001, () => {
  console.log("listening on port: 5001");
  axios
    .post(`http://localhost:5000/${serviceName}/5001`)
    .then((response) => {
      console.log(response.data);
    })
    .catch((err) => {
      console.log("-->", err);
    });
});
