function formatDate(dateString) {
    const dateParts = dateString.split('/');
    if (dateParts.length === 3) {
        return `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`; 
    }
    return null;
}

let clientData = []; // Variável para armazenar os dados dos clientes

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('uploadForm').onsubmit = async function(event) {
        event.preventDefault();

        const formData = new FormData(this);
        const finalizeRegistrationButton = document.getElementById('finalizeRegistration');

        if (typeof UI !== 'undefined') {
            UI.clearOutput();
            UI.clearGrid();
            finalizeRegistrationButton.classList.add('d-none');
        }

        try {
            const response = await fetch(uploadUrl, { method: 'POST', body: formData });
            const textResponse = await response.text(); 
            console.log('Texto da resposta:', textResponse); 

            clientData = JSON.parse(textResponse); // Armazena os dados dos clientes
            console.log('Dados recebidos:', clientData);

            if (clientData.errors && clientData.errors.length > 0) {
                if (typeof UI !== 'undefined') {
                    UI.showErrors(clientData.errors);
                }
            } else if (clientData && clientData.length > 0) {
                if (typeof UI !== 'undefined') {
                    UI.updateGrid(clientData);
                }
                finalizeRegistrationButton.classList.remove('d-none');

                // Atualiza o onclick para abrir o modal de login
                finalizeRegistrationButton.onclick = function() {
                    document.getElementById('loginModal').style.display = 'block';
                };
            } else {
                if (typeof UI !== 'undefined') {
                    UI.showError('Nenhum dado de cliente retornado.');
                }
            }
        } catch (error) {
            console.error('Erro:', error);
            if (typeof UI !== 'undefined') {
                UI.showError('Ocorreu um erro ao enviar o arquivo. Por favor, tente novamente.');
            }
        }
    };

    async function authenticateAndRegister() {
        let authData;
        const storedToken = localStorage.getItem('accessToken');
        const tokenExpiration = localStorage.getItem('tokenExpiration');
        const now = Math.floor(Date.now() / 1000); // Tempo atual em segundos

        console.log('Token armazenado:', storedToken);
        console.log('Expiração do token:', tokenExpiration);
        console.log('Tempo atual:', now);

        // Verifica se o token armazenado ainda é válido
        if (storedToken && tokenExpiration) {
            console.log('Verificando validade do token...');
            console.log('Token de expiração:', tokenExpiration);
            console.log('Token atual:', now);

            if (now < tokenExpiration) {
                authData = { accessToken: storedToken };
                console.log('Token válido encontrado, utilizando o token existente.');
            } else {
                console.log('Token expirado, solicitando novo token.');
                throw new Error('Token de acesso não encontrado ou expirado.');
            }
        } else {
            // Se não há token válido, solicita novo token
            console.log('Nenhum token encontrado.');
            throw new Error('Token de acesso não encontrado ou expirado.');
        }

        const successResults = [];
        const errorResults = [];
        const totalClients = clientData.length; // Usa a variável clientData

        showProgressBar();

        const registerPromises = clientData.map(async (cliente, index) => {
            const maritalStatusMap = {
                'married': 'C',
                'single': 'S',
                'divorced': 'D',
                'widowed': 'V',
                'not informed': null
            };

            let clienteObj = {
                companyId: parseInt(cliente[49]) || null,
                name: cliente[2],
                tradeName: cliente[3] || "",
                pronunciation: cliente[4] || null,
                fieldOfActivity: cliente[40],
                profession: cliente[46] || null,
                notes: cliente[41],
                cellNumber: cliente[13],
                website: cliente[39],
                hasLoginAccess: false,
                automaticallyIssueNfse: "notIssue",
                notesNfse: cliente[42],
                hasIssRetention: true,
                address: {
                    zipCode: cliente[21],
                    state: cliente[23],
                    city: cliente[22],
                    street: cliente[17],
                    number: cliente[18],
                    neighborhood: cliente[20],
                    additionalDetails: cliente[19]
                },
                phones: cliente[12] ? cliente[12].split(';').map(phone => phone.trim()) : [],
                emailsMessage: cliente[11] ? cliente[11].split(';').map(email => email.trim()) : [],
                emailsFinancialMessages: cliente[10] ? cliente[10].split(';').map(email => email.trim()) : [],
                isNetworkingProfileVisible: true,
                isBlockedBookingCustomerArea: true,
                isAllowedBookingOutsideBusinessHours: false,
                internetPlan: "Plano 20MB",
                businessPresentation: cliente[42],
                offeredServicesProducts: cliente[43],
                receptionOrientations: cliente[45],
                mailingOrientations: "Orientações de correspondência",
                mailingAddress: {
                    zipCode: cliente[29],
                    state: cliente[31],
                    city: cliente[30],
                    street: cliente[25],
                    number: cliente[26],
                    neighborhood: cliente[28],
                    additionalDetails: cliente[27]
                },
                extensionNumbers: []
            };

            if (cliente[6]) {
                clienteObj.legalPerson = {
                    cnpj: cliente[6],
                    foundationDate: cliente[5] ? formatDate(cliente[5]) : null,
                    municipalInscription: cliente[42] || null,
                    stateInscription: cliente[41] || null 
                };
            } else {
                const birthDate = cliente[9];
                clienteObj.naturalPerson = {
                    cpf: cliente[7] || null,
                    rg: cliente[8] || null,
                    birthDate: birthDate ? formatDate(birthDate) : null,
                    issuingAuthority: cliente[10] || null,
                    maritalStatus: maritalStatusMap[cliente[47]] || null 
                };
            }

            try {
                const registerData = await Api.registerCustomer(clienteObj, authData.accessToken);
                if (registerData.success) {
                    successResults.push({ id: registerData.id, name: clienteObj.name });
                } else {
                    throw new Error(registerData.error || 'Erro ao cadastrar cliente');
                }
            } catch (error) {
                if (error.message.includes('400')) { 
                    errorResults.push({ line: index + 1, name: clienteObj.name, error: 'Erro de validação: ' + error.message });
                } else {
                    errorResults.push({ line: index + 1, name: clienteObj.name, error: 'Erro inesperado: ' + error.message });
                }
            }

            const percentage = Math.round(((index + 1) / totalClients) * 100);
            updateProgressBar(percentage);
        });

        await Promise.all(registerPromises);
        hideProgressBar();

        // Exibir a tela de sucesso ou relatório
        if (typeof UI !== 'undefined') {
            UI.displayRegistrationReport(successResults, errorResults);
        }

        $('#successModal').modal('show'); // Mostra o modal de sucesso
    }

    // Adiciona o evento de submit ao formulário de login
    document.getElementById('loginForm').onsubmit = async function(event) {
        event.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
    
        try {
            const authData = await Api.authenticate({ username, password });
            if (authData.accessToken) {
                const tokenExpiration = Math.floor(Date.now() / 1000) + (authData.expiresIn || 3600); // Valor padrão se expiresIn não for fornecido
                console.log('Token de acesso:', authData.accessToken);
                console.log('Duração do token em segundos:', authData.expiresIn);
                console.log('Tempo de expiração do token:', tokenExpiration);
    
                localStorage.setItem('accessToken', authData.accessToken);
                localStorage.setItem('tokenExpiration', tokenExpiration);
    
                document.getElementById('loginModal').style.display = 'none';
                await authenticateAndRegister(); // Chama a função para registrar os clientes com o token obtido
            } else {
                throw new Error('Erro ao autenticar. Verifique suas credenciais.');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Falha na autenticação. Por favor, tente novamente.');
        }
    };
    
    function showProgressBar() {
        document.getElementById('progressBarContainer').style.display = 'block';
        updateProgressBar(0); 
    }

    function updateProgressBar(percentage) {
        const progressBar = document.getElementById('progressBar');
        progressBar.style.width = percentage + '%';
        progressBar.setAttribute('aria-valuenow', percentage);
        progressBar.textContent = percentage + '%';
    }

    function hideProgressBar() {
        document.getElementById('progressBarContainer').style.display = 'none';
    }
});
