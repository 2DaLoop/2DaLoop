import { supabase } from '../supabase/supabaseClient.js';

document.querySelector('.calculate-btn').addEventListener('click', async () => {
    // get all data from form
    const quantityInputs = document.querySelectorAll('.quantity-input');
    const ageInputs = document.querySelectorAll('.age-input');

    const noPackingResult = await submitAssetsNoPacking(quantityInputs, ageInputs);
    const packingResult = await submitAssetsPackingServices(quantityInputs, ageInputs);
    console.log(noPackingResult, packingResult);

    storeData(quantityInputs, ageInputs);
})

async function submitAssetsNoPacking(quantityInputs, ageInputs) {
    // use puppeteer to calculate totals
    return await fetch('http://localhost:3000/itad/no_packing', {
        method: 'POST',
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({
            inputValues: {
                desktop_pc_quantity: quantityInputs[0].value || 0,
                laptop_pc_quantity: quantityInputs[1].value || 0,
                network_device_quantity: quantityInputs[2].value || 0,
                telecom_quantity: quantityInputs[3].value || 0,
                server_quantity: quantityInputs[4].value || 0,
                desktop_pc_age: ageInputs[0].value || 0,
                laptop_pc_age: ageInputs[1].value || 0,
                network_device_age: ageInputs[2].value || 0,
                telecom_age: ageInputs[3].value || 0,
                server_age: ageInputs[4].value || 0
            }
        })
    })
    .then(response => response.json())
}

async function submitAssetsPackingServices(quantityInputs, ageInputs) {
    // use puppeteer to calculate totals
    return await fetch('http://localhost:3000/itad/packing_services', {
        method: 'POST',
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({
            inputValues: {
                desktop_pc_quantity: quantityInputs[0].value || 0,
                laptop_pc_quantity: quantityInputs[1].value || 0,
                network_device_quantity: quantityInputs[2].value || 0,
                telecom_quantity: quantityInputs[3].value || 0,
                server_quantity: quantityInputs[4].value || 0,
                desktop_pc_age: ageInputs[0].value || 0,
                laptop_pc_age: ageInputs[1].value || 0,
                network_device_age: ageInputs[2].value || 0,
                telecom_age: ageInputs[3].value || 0,
                server_age: ageInputs[4].value || 0
            }
        })
    })
    .then(response => response.json())
}

async function storeData(quantityInputs, ageInputs) {
    // store in supabase
    const { error } = await supabase
        .from('tblAssetSubmission')
        .insert({
            desktop_quantity: quantityInputs[0].value || 0,
            laptop_quantity: quantityInputs[1].value || 0,
            network_device_quantity: quantityInputs[2].value || 0,
            telecom_quantity: quantityInputs[3].value || 0,
            server_quantity: quantityInputs[4].value || 0,
            desktop_age: ageInputs[0].value || 0,
            laptop_age: ageInputs[1].value || 0,
            network_device_age: ageInputs[2].value || 0,
            telecom_age: ageInputs[3].value || 0,
            server_age: ageInputs[4].value || 0
        })
}