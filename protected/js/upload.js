function formatDate(dateString) {
    // Exemplo de formatação de data no formato DD/MM/YYYY
    const dateParts = dateString.split('/');
    if (dateParts.length === 3) {
        // Retorna a data formatada
        return `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`; // Formato YYYY-MM-DD
    }
    return null; // Retorna null se a data não estiver no formato esperado
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('uploadForm').onsubmit = async function(event) {
        event.preventDefault();

        const formData = new FormData(this);
        const finalizeRegistrationButton = document.getElementById('finalizeRegistration');

        // Verifica se o UI está definido e limpa a saída
        if (typeof UI !== 'undefined') {
            UI.clearOutput();
            UI.clearGrid();
            finalizeRegistrationButton.classList.add('d-none');
        }

        try {
            const response = await fetch(uploadUrl, { method: 'POST', body: formData });
            const textResponse = await response.text(); // Lê a resposta como texto
            console.log('Texto da resposta:', textResponse); // Log do texto da resposta

            const data = JSON.parse(textResponse); // Converte o texto em JSON
            console.log('Dados recebidos:', data); // Log dos dados recebidos

            // Verifica se a resposta contém erros
            if (data.errors && data.errors.length > 0) {
                // Exibe as mensagens de erro no HTML
                if (typeof UI !== 'undefined') {
                    UI.showErrors(data.errors);
                }
            } else if (data && data.length > 0) {
                if (typeof UI !== 'undefined') {
                    UI.updateGrid(data);
                }
                finalizeRegistrationButton.classList.remove('d-none');

                finalizeRegistrationButton.onclick = async function() {
                    // Passar os dados dos clientes para a função de registro
                    await authenticateAndRegister(data);
                };
            } else {
                // Exiba uma mensagem de erro se não houver dados válidos
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

    async function authenticateAndRegister(data) {
        let authData;
        const storedToken = localStorage.getItem('accessToken');

        if (storedToken) {
            authData = { accessToken: storedToken }; // Usa o token armazenado
        } else {
            authData = await Api.authenticate();
            if (authData.accessToken) {
                localStorage.setItem('accessToken', authData.accessToken); // Armazena o novo token
            } else {
                throw new Error(authData.error || 'Erro ao autenticar');
            }
        }

        const successResults = [];
        const errorResults = [];
        const totalClients = data.length;

        showProgressBar(); // Exibir a barra de progresso ao iniciar o cadastro

        const registerPromises = data.map(async (cliente, index) => {
            const maritalStatusMap = {
                'married': 'C',
                'single': 'S',
                'divorced': 'D',
                'widowed': 'V',
                'not informed': null // 'null' será enviado como valor nulo
            };

            // Cria um objeto com os dados do cliente
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

            // Verifica se o cliente é pessoa jurídica (CNPJ presente) ou física (CPF)
            if (cliente[6]) { // Se CNPJ está presente
                clienteObj.legalPerson = {
                    cnpj: cliente[6],
                    foundationDate: cliente[5] ? formatDate(cliente[5]) : null,
                    municipalInscription: cliente[42] || null, // Preencha conforme necessário
                    stateInscription: cliente[41] || null // Preencha conforme necessário
                };
            } else {
                // Ajuste na data de nascimento
                const birthDate = cliente[9];
                clienteObj.naturalPerson = {
                    cpf: cliente[7] || null,
                    rg: cliente[8] || null,
                    birthDate: birthDate ? formatDate(birthDate) : null, // Formata a data corretamente
                    issuingAuthority: cliente[10] || null,
                    maritalStatus: maritalStatusMap[cliente[47]] || null // Mapeia o estado civil
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
                    // Exiba um erro específico para validação
                    errorResults.push({ name: clienteObj.name, error: 'Erro de validação: ' + error.message });
                } else {
                    errorResults.push({ name: clienteObj.name, error: 'Erro inesperado: ' + error.message });
                }
            }

            // Atualiza a barra de progresso após cada cadastro
            const percentage = Math.round(((index + 1) / totalClients) * 100);
            updateProgressBar(percentage);
        });

        await Promise.all(registerPromises);
        hideProgressBar(); // Oculta a barra de progresso ao final do cadastro

        // Exibir a tela de sucesso ou relatório
        if (typeof UI !== 'undefined') {
            UI.displayRegistrationReport(successResults, errorResults); // Exibe o relatório de cadastro
        }

        // Exibir modal de sucesso
        $('#successModal').modal('show'); // Mostra o modal de sucesso

        // Limpa o localStorage após todos os cadastros serem realizados
        localStorage.removeItem('accessToken');
        console.log('Token removido do localStorage');

        // Se desejar limpar todo o localStorage:
        // localStorage.clear(); // Limpa todo o localStorage
    }
});

function showProgressBar() {
    document.getElementById('progressBarContainer').style.display = 'block';
    updateProgressBar(0); // Reseta a barra de progresso para 0% ao iniciar
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
