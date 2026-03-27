const fs = require('fs');

async function run() {
    try {
        const loginRes = await fetch('http://localhost:3000/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@erp.com', password: '123' })
        });
        const loginData = await loginRes.json();
        const token = loginData.token;

        const initialFormData = {
            name: "Test Frontend Form",
            cpf_cnpj: "55566677788",
            email: "testform@test.com",
            phone: "88888888",
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
        
        let formDataBody = '';
        const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
        for (const [key, value] of Object.entries(initialFormData)) {
            formDataBody += `--${boundary}\r\n`;
            formDataBody += `Content-Disposition: form-data; name="${key}"\r\n\r\n`;
            formDataBody += `${value}\r\n`;
        }
        formDataBody += `--${boundary}--\r\n`;

        const res = await fetch('http://localhost:3000/clients', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': `multipart/form-data; boundary=${boundary}`
            },
            body: formDataBody
        });
        
        const text = await res.text();
        console.log("STATUS:", res.status);
        console.log("RESPONSE:", text);
    } catch (err) {
        console.error("Fetch Error:", err);
    }
}
run();
