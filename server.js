const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("."));
app.post("/api/vin", async (req, res) => {
    try {
        const vin = String(req.body.vin || "")
            .trim()
            .toUpperCase();
        if (vin.length !== 17) {
            return res.status(400).json({
                error: "VIN يجب أن يكون 17 خانة"
            });
        }
        const response = await fetch(
            `https://apiauctions.io/api/v1/get-car-vin?vin_number=${encodeURIComponent(vin)}`,
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.API_TOKEN}`,
                    "Accept": "application/json"
                }
            }
        );
        const data = await response.json();
        if (!response.ok) {
            return res.status(response.status).json(data);
        }
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "حدث خطأ في الاتصال بالخدمة"
        });
    }
});
const PORT = 3000;
app.listen(PORT, () => {
    console.log(
        `CarCost يعمل على http://localhost:${PORT}`
    );
});