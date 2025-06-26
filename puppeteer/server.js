const express = require("express");
const puppeteer = require("puppeteer");
const app = express();
const HTTP_PORT = 3000;

app.use(express.json());

app.post("/puppeteer", async (req, res) => {
    try {
        const { inputValues } = req.body;
        if (!inputValues) {
            return res.status(400).json({ error: "Input values are required" });
        }

        const inputElements = [
            "desktop_pc_quantity",
            "laptop_pc_quantity",
            "network_device_quantity",
            "telecom_quantity",
            "server_quantity",
            "desktop_pc_age",
            "laptop_pc_age",
            "network_device_age",
            "telecom_age",
            "server_age",
        ];

        const resultElements = [
            "total_pickup_cost",
            "total_service_fees",
            "total_value_recovery",
            "net_financial_settlement",
        ];

        // go to itad calculator
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto("https://calculator.itadusa.com/");

        // input values in all fields
        for (const input of inputElements) {
            const element = await page.$(`#${input}`);
            await element.click({ clickCount: 3 });
            await element.type(inputValues[input]);
        }

        // click submit
        await page.click("#button_submit");

        // get results after submission
        const resultValues = {};
        setTimeout(async () => {
            for (const result of resultElements) {
                const element = await page.$(`#${result}`);
                const resultText = await page.evaluate((el) => el.value, element);
                resultValues[result] = resultText;
            }
        }, 1000);

        // return results
        res.status(200).json({ resultValues });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Something went wrong",
        });
    }
});

app.get("/", (req, res) => {
    res.status(200).json({ message: "Hello World" });
});

app.listen(HTTP_PORT, () => {
    console.log("Server running on", HTTP_PORT);
});
