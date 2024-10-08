class Api {
    static async authenticate(credentials) {
        const response = await fetch(authenticateUrl, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(credentials)
        });

        // Verifica se a resposta foi ok (status 2xx)
        if (!response.ok) {
            throw new Error('Erro na autenticação: ' + response.statusText);
        }

        const data = await response.json(); // Captura a resposta da API
        console.log('Dados retornados da API:', data); // Log da resposta

        // Valida se o token está presente
        if (!data.accessToken) {
            throw new Error('Token de acesso não retornado.');
        }

        // Usa um valor padrão para expiresIn, se não for fornecido
        const expiresIn = data.expiresIn || 3600; // 3600 segundos como padrão
        const tokenExpiration = Math.floor(Date.now() / 1000) + expiresIn;

        // Armazena o token e a expiração em localStorage
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('tokenExpiration', tokenExpiration);

        return {
            accessToken: data.accessToken,
            expiresIn: expiresIn
        };
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