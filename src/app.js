import express from "express";
import handlebars from "express-handlebars";
import path from "path";
import __dirname from "./utils.js";
import viewsRouter from "./routes/views.router.js";
import productRouter from "./routes/product.router.js";
import mongoose from "mongoose";
import methodOverride from 'method-override';

import dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const PORT = process.env.PORT ?? 8080;
const URL_MONGODB = process.env.URL_MONGODB;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const hbs = handlebars.create({
    helpers: {
        eq: function (a, b, options) {
            if (a === b) {
                return options.fn(this); // Ejecuta el bloque principal si son iguales
            } else if (options.inverse) {
                return options.inverse(this); // Ejecuta el bloque {{else}} si existe
            }
            return ''; // Si no hay bloque {{else}}, devuelve una cadena vacía
        },
    },
});
app.engine("handlebars", hbs.engine);
app.set("views", __dirname + "/views");
app.set("view engine", "handlebars");

app.use(express.static(__dirname + "/public"));

mongoose.connect(URL_MONGODB)
    .then(() => console.log("Connected to MongoDB"))
    .catch((error) => console.log(error));

    
app.use(methodOverride('_method'));

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

app.use("/", viewsRouter);
app.use("/api/product", productRouter);