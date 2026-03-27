const fs = require('fs');

async function run() {
    try {
        console.log("Authenticating...");
        const loginRes = await fetch('http://localhost:3000/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@erp.com', password: '123' })
        });
        
        const loginData = await loginRes.json();
        const token = loginData.token;
        
        if (!token) {
            console.error("Login failed:", loginData);
            // If failed because doesn't exist, create user
            console.log("Creating user...");
            const registerRes = await fetch('http://localhost:3000/users/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Admin', email: 'admin@erp.com', password: '123', role: 'admin' })
            });
            const regData = await registerRes.json();
            
            const loginRes2 = await fetch('http://localhost:3000/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'admin@erp.com', password: '123' })
            });
            const loginData2 = await loginRes2.json();
            var finalToken = loginData2.token;
        } else {
            finalToken = token;
        }

        console.log("Got token. Sending FormData to create client...");
        
        // Build multipart/form-data manually since Node fetch doesn't have FormData natively in older versions or might behave differently
        // We can just use the built-in FormData if on Node 18+
        const formData = new FormData();
        const initialFormData = {
            name: "Test Client API",
            cpf_cnpj: "11122233344",
            email: "testapi@test.com",
            phone: "99999999",
            fantasy_name: "",
            contact_name: "",
            ddd: "",
            street: "",
            number: "",
            neighborhood: "",
            complement: "",
            city: "",
            state: "",
            zip_code: "",
            active: "true"
        };
        
        for (const key in initialFormData) {
            formData.append(key, initialFormData[key]);
        }
        
        const res = await fetch('http://localhost:3000/clients', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${finalToken}`
            },
            body: formData
        });
        
        const text = await res.text();
        console.log("STATUS:", res.status);
        console.log("RESPONSE:", text);
        
    } catch (err) {
        console.error("Fetch Error:", err);
    }
}

run();
