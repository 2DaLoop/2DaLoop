document.getElementById('btnSubmit').addEventListener('click', async function() {
    const desktop_quantity = document.getElementById('desktop-quantity').value

    const response = await fetch('http://localhost:3000/puppeteer', {
        method: 'POST',
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({
            inputValues: {
                desktop_pc_quantity: desktop_quantity,
                laptop_pc_quantity: 7,
                network_device_quantity: 4,
                telecom_quantity: 3,
                server_quantity: 5,
                desktop_pc_age: 1,
                laptop_pc_age: 2,
                network_device_age: 5,
                telecom_age: 1,
                server_age: 4
            }
        })
    })
    .then(response => response.json())

    console.log(response);
})