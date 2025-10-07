import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
const port = 3000;
const API_BASE_URL = "https://ndvi-api-wtsg.onrender.com";

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("index.ejs", {
    currentPath: "home",
    lat: "",
    lon: "",
    range: "",
    unit: "",
    image: "",
    image_date: "",
    ndvi_avg: "",
    error: null,
  })
});

app.post("/search", async (req, res) => {
  const body = req.body;
  
  try {
    const result = await axios.get(`${API_BASE_URL}/ndvi_heatmap`, { 
      params: {
        lat: body.lat,
        lon: body.lon,
        buffer_val: body.range,
        buffer_unit: body.unit,
      }
    });

    const ndviData = result.data; 

    console.log("NDVI API 呼叫成功！");
    console.log(`平均 NDVI: ${ndviData.mean_ndvi}`);
    console.log(`熱力圖 Base64 字串長度: ${ndviData.ndvi_heatmap_png_base64.length}`);

    res.render("index.ejs", {
      currentPath: "home",
      lat: body.lat,
      lon: body.lon,
      range: body.range,
      unit: body.unit,
      image: ndviData.ndvi_heatmap_png_base64,
      image_date: ndviData.closest_image_date,
      ndvi_avg: ndviData.mean_ndvi,
      error: null,
    })

  } catch (error) {
    console.error("呼叫 NDVI API 失敗:", error.message);
    
    // 如果 API 提供了詳細的錯誤響應，將其顯示給使用者
    if (error.response) {
      console.error("API 錯誤細節:", error.response.data);
      res.status(error.response.status || 500).render("index.ejs", {
        currentPath: "home",
        lat: body.lat,
        lon: body.lon,
        range: body.range,
        unit: body.unit,
        image: "",
        image_date: "",
        ndvi_avg: "",
        error: error.response.data.description || "NDVI 服務回傳錯誤",
      });
    } else {
      // 處理網路連線或 DNS 錯誤
      res.status(503).render("index.ejs", {
        currentPath: "home",
        lat: body.lat,
        lon: body.lon,
        range: body.range,
        unit: body.unit,
        image: "",
        image_date: "",
        ndvi_avg: "",
        error: "無法連線到 NDVI 服務，請稍後再試。",
      });
    }
  }
});

app.get("/ndvi", (req, res) => {
  res.render("ndvi.ejs", { currentPath: "ndvi" });
})

app.listen(port, () => {
  console.log(`Listening Port ${port}`);
});
