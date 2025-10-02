import express from "express";
import bodyParser from "body-parser";
import axios from "axios"

const app = express();
const port = 3000;
const API_URL = "http://localhost:4000"

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("index.ejs", { lat: "", lon: "", radius: "", unit: "", error: undefined, image: undefined });
})

app.post("/search", async (req, res) => {
    let err_msg = ""
    const body = req.body;
    try {
        const result = await axios.post(`${API_URL}/analyze`, {"lat": body.lat, "lon": body.lon});
        console.log(result.data);
    } catch (error) {
        err_msg = error;
    }
    res.render("index.ejs", { lat: body.lat, lon: body.lon, radius: body.radius, unit: body.unit, error: err_msg, image: undefined});
})

app.listen(port, (req, res) => {
    console.log(`Listening Port ${port}`);
})