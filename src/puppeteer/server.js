import express from 'express';
import cors from 'cors';
import puppeteer from 'puppeteer';

const app = express();
const HTTP_PORT = 3000;

app.use(cors());
app.use(express.json());

const sleep = ms => new Promise(res => setTimeout(res, ms));

app.post("/calculate/budget", async (req, res) => {
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
            await element.type(inputValues[input].toString());
        }

        // click submit
        await page.click("#button_submit");

        // result object for both
        const resultValues = {
            noPacking: {},
            packing: {},
        };

        // get results for no packing services
        await sleep(1000);
        for (const result of resultElements) {
            const element = await page.$(`#${result}`);
            const resultText = await page.evaluate((el) => el.value, element);
            resultValues.noPacking[result] = resultText;
        }

        // toggle button for packing services
        await page.click('#btn_service');
        await page.click("#button_submit");

        // get results after submission
        await sleep(1000);
        for (const result of resultElements) {
            const element = await page.$(`#${result}`);
            const resultText = await page.evaluate((el) => el.value, element);
            resultValues.packing[result] = resultText;
        }

        // return results
        res.status(200).json({ data: resultValues });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Something went wrong",
        });
    }
});

app.post("/itad/packing_services", async (req, res) => {
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

        // toggle button
        await page.click('#btn_service');

        // input values in all fields
        for (const input of inputElements) {
            const element = await page.$(`#${input}`);
            await element.click({ clickCount: 3 });
            await element.type(inputValues[input].toString());
        }

        // click submit
        await page.click("#button_submit");

        // get results after submission
        await sleep(1000);
        const resultValues = {};
        for (const result of resultElements) {
            const element = await page.$(`#${result}`);
            const resultText = await page.evaluate((el) => el.value, element);
            resultValues[result] = resultText;
        }

        // return results
        res.status(200).json({ data: resultValues });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Something went wrong",
        });
    }
});

app.post("/calculate/ghg", async (req, res) => {
    try {
        const { inputValues } = req.body;
        if (!inputValues) {
            return res.status(400).json({ error: "Input values are required" });
        }

        const inputPlaceholders = [
            "Laptops",
            "Servers",
            "Desktops",
            "Battery",
            "Mobile",
            "Printers",
            "Storage",
            "Monitors"
        ];

        const resultLabels = [
            "ghg_emissions",
            "powering_houses",
            "removing_cars",
            "solid_waste",
            "air_emissions",
            "water_emissions",
            "gold",
            "platinum",
            "palladium",
            "steel",
            "copper",
            "aluminium"
        ];

        const browser = await puppeteer.launch({
            headless: false,
            defaultViewport: false,
            userDataDir: "./profile"
        });
        const page = await browser.newPage();
        await page.goto("https://www.greenteksolutionsllc.com/itad-environmental-impact-calculator/");

        // mouse needs to hover on site to work
        await sleep(1000);
        await page.mouse.move(100, 100);

        // click 'calculate by num of assets' btn
        await page.click('xpath=//button[contains(., "Calculate By Number Of Assets")]');

        await sleep(1000);

        // fill in input fields
        for (const input of inputPlaceholders) {
            // account for fields with multiple words
            let fullInput;
            if (input == "Battery") {
                fullInput = "Battery Backups";
            } else if (input == "Mobile") {
                fullInput = "Mobile Devices";
            } else if (input == "Storage") {
                fullInput = "Storage Arrays";
            } else {
                fullInput = input;
            }

            // input values
            await page.type(`xpath=//input[@placeholder="# of ${fullInput}"]`, inputValues[input].toString());
        }

        // click 'calculate' btn
        await page.click('xpath=//button[contains(@class, "secondary-button") and contains(., "Calculate")]');

        // get results
        await sleep(1000);
        const results = await page.$$eval('span.number', (spans, labels) => {
            const data = {};

            spans.forEach((span, index) => {
                const numberText = span.textContent.trim();
                const label = labels[index] || `unknown_${index}`;
                data[label] = numberText;
            });

            const totalEstWeight = document.querySelector('span.font-bold');
            if (totalEstWeight) {
                data['total_est_weight'] = totalEstWeight.textContent.split(" ")[0];
            }

            return data;
        }, resultLabels);

        res.status(200).json({ data: results });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Something went wrong",
        });
    }    
})

app.get("/", (req, res) => {
    res.status(200).json({ message: "Hello World" });
});

app.listen(HTTP_PORT, () => {
    console.log("Server running on", HTTP_PORT);
});