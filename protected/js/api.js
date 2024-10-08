// api.js
class Api {
    static async authenticate(credentials) {
        const response = await fetch(authenticateUrl, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(credentials) // Envia as credenciais no corpo da requisição
        });

        if (!response.ok) {
            throw new Error('Erro ao autenticar: ' + response.statusText);
        }

        return response.json();
    }

    static async registerCustomer(clienteObj, token) {
        const response = await fetch(customerUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(clienteObj)
        });
        
        if (!response.ok) {
            throw new Error('Erro ao cadastrar cliente: ' + response.statusText);
        }
        return response.json();
    }
}
