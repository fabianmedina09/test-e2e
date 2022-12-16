import express from "express";
import { macysSelectProducts } from "./macys.js";
const app = express();
const port = 3000;

app.get("/", async (req, res) => {
  macysSelectProducts(
    "https://www.macys.com/shop/product/club-room-cashmere-crew-neck-sweater-created-for-macys?ID=1500400&CategoryID=9559&swatchColor=College%20Red&swatchColor=College%20Red",
    4,
    1
  );
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
