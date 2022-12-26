import express from "express";
import {
  macysSelectProducts,
  configBrowser,
  configLoginData,
} from "./macys.js";
const app = express();
const port = 3000;

app.get("/session/:id", async (req, res) => {
  const id = req.params.id;
  const response = await configLoginData({
    id,
    email: "fabianmedina09@gmail.com",
    password: "yEvP2*+3E#G$77g",
  });
  if (response?.error) res.json({ error: response?.error });
  res.json({ message: "Done for " + id });
});

app.get("/", async (req, res) => {
  macysSelectProducts({
    userData: {
      id: "15705386798",
      email: "fabianmedina09@gmail.com",
      password: "yEvP2*+3E#G$77g",
    },
    products: [
      {
        url: "https://www.macys.com/shop/product/club-room-cashmere-crew-neck-sweater-created-for-macys?ID=1500400&CategoryID=9559&swatchColor=College%20Red&swatchColor=College%20Red",
        color: 3,
        size: 1,
      },
      {
        url: "https://www.macys.com/shop/product/alfani-mens-cable-sweater-created-for-macys?ID=14078434&CategoryID=4286&swatchColor=Port",
        color: 2,
        size: 3,
      },
    ],
  });
  res.send("Hello World!");
});

app.get("/browser", async (req, res) => {
  configBrowser({ id: "15705386798" });
  res.send("Open browser Done!");
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
