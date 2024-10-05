// api.js
class Api {
    static async authenticate() {
        const response = await fetch(authenticateUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
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
