import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
const port = 3000;
const API_BASE_URL = "https://ndvi-api-04ii.onrender.com";

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("index.ejs", {
    lat: "",
    lon: "",
    range: "",
    unit: "",
    image: "",
    image_date: "",
    ndvi_avg: ""
  })
});

app.post("/search", async (req, res) => {
  const body = req.body;
  
  try {
    const result = await axios.get(`${API_BASE_URL}/ndvi_heatmap`, { 
      // 邏輯正確：參數放在 params 內
      params: {
        lat: body.lat,
        lon: body.lon,
        buffer_val: body.range,
        buffer_unit: body.unit,
      }
    });

    // *** 修正點 2：存取 API 回傳的資料必須使用 .data 屬性 ***
    const ndviData = result.data; 

    console.log("NDVI API 呼叫成功！");
    console.log(`平均 NDVI: ${ndviData.mean_ndvi}`);
    console.log(`熱力圖 Base64 字串長度: ${ndviData.ndvi_heatmap_png_base64.length}`);

    res.render("index.ejs", {
        lat: body.lat,
        lon: body.lon,
        range: body.range,
        unit: body.unit,
        image: ndviData.ndvi_heatmap_png_base64,
        image_date: ndviData.closest_image_date,
        ndvi_avg: ndviData.mean_ndvi
    })

  } catch (error) {
    // *** 修正點 1：捕獲並處理錯誤 (防止伺服器崩潰) ***
    console.error("呼叫 NDVI API 失敗:", error.message);
    
    // 如果 API 提供了詳細的錯誤響應，將其顯示給使用者
    if (error.response) {
      console.error("API 錯誤細節:", error.response.data);
      res.status(error.response.status || 500).send(`API 錯誤: ${error.response.data.description || '未知錯誤'}`);
    } else {
      // 處理網路連線或 DNS 錯誤
      res.status(503).send("無法連線到 NDVI 服務，請檢查網路連線。");
    }
  }
});

app.listen(port, () => {
  console.log(`Listening Port ${port}`);
});
