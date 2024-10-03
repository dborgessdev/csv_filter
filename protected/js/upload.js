document.getElementById('uploadForm').onsubmit = function(event) {
    event.preventDefault(); // Previne o comportamento padrão do formulário

    var formData = new FormData(this);
    var output = document.getElementById('output'); // Onde mensagens serão exibidas
    var gridBody = document.getElementById('gridBody'); // Onde a tabela será exibida
    var finalizeRegistrationButton = document.getElementById('finalizeRegistration'); // Botão de concluir cadastro

    // Limpar o conteúdo anterior (mensagens de erro/sucesso e tabela)
    output.innerHTML = ''; 
    gridBody.innerHTML = '';
    finalizeRegistrationButton.classList.add('d-none'); // Ocultar o botão até que seja necessário

    // Enviar a requisição de upload do arquivo CSV
    fetch(uploadUrl, { // URL do endpoint para upload
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        console.log(data); // Verifique a resposta do servidor no console

        if (data.error) {
            alert(data.error); // Alerta para erro geral
            output.innerHTML = '<p>' + data.error + '</p>';
        } else if (data.errors) {
            alert("Erros encontrados: " + data.errors.join(', ')); // Alerta para erros na planilha
            output.innerHTML = '<p>' + data.errors.join('<br>') + '</p>';
        } else {
            if (Array.isArray(data) && data.length > 0) {
                var table = '<table class="table table-striped table-bordered" id="dataGrid"><thead><tr>';

                // Lista de cabeçalhos atualizada
                var headers = [
                    'ID do Cliente', 'Dia de vencimento *', 'Razão social ou Nome completo *', 'Nome fantasia',
                    'Pronúncia', 'Data de nascimento ou fundação', 'CNPJ *', 'CPF *', 'RG', 'Órgão expedidor',
                    'E-mail de financeiro *', 'E-mail de recado', 'Telefone', 'Celular *', 'DDR', 
                    'Ramal exclusivo', 'Caixa postal', 'Rua *', 'Número *', 'Complemento *', 'Bairro *', 
                    'CEP *', 'Cidade *', 'Estado (UF) *', 'País', 'Rua de correspondência', 
                    'Número de correspondência', 'Complemento de correspondência', 'Bairro de correspondência', 
                    'CEP de correspondência', 'Cidade de correspondência', 'Estado (UF) de correspondência', 
                    'Passaporte', 'Multa por atraso (%)', 'Juros por dia (%)', 'Dias de atraso para bloqueio', 
                    'Retentor ISS', 'Inscrição municipal', 'Inscrição estadual', 'Site', 'Ramo de atividade', 
                    'Observações', 'Apresentação', 'Descrição de produtos/serviços', 'Tratamento', 
                    'Orientação para atendimento', 'Profissão', 'Estado civil', 'Data do cadastro', 
                    'ID da Unidade'
                ];

                // Preenche o cabeçalho da tabela
                headers.forEach((header) => {
                    table += '<th>' + header + '</th>';
                });

                table += '</tr></thead><tbody>';

                // Popula a tabela com os dados
                data.forEach((row) => {
                    table += '<tr>';
                    row.forEach((cell) => {
                        table += '<td>' + (cell !== undefined ? cell : '') + '</td>'; // Preenche cada célula da linha
                    });
                    table += '</tr>';
                });

                table += '</tbody></table>';

                // Insere a tabela no elemento gridBody
                gridBody.innerHTML = table;

                // Exibe o botão "Concluir Cadastro" após a tabela ser exibida
                finalizeRegistrationButton.classList.remove('d-none');

                // Lógica para cadastro dos clientes após o upload
                finalizeRegistrationButton.onclick = function() {
                    var dataToRegister = parseTableData(gridBody); // Extrai os dados da tabela

                    // Autentica e registra os dados na API intermediária
                    authenticateAndRegister(dataToRegister);
                };

            } else {
                output.innerHTML = '<p>Nenhum dado foi retornado.</p>';
            }
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Ocorreu um erro ao enviar o arquivo. Por favor, tente novamente.');
    });
};

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('finalizeRegistration').onclick = function() {
        var gridBody = document.getElementById('gridBody');
        var dataToRegister = parseTableData(gridBody); // Função para extrair dados da tabela
        authenticateAndRegister(dataToRegister);
    };
});

// Função para converter os dados da tabela exibida no grid em um array de objetos
function parseTableData(gridBody) {
    var table = gridBody.querySelector('table');
    var rows = table.querySelectorAll('tbody tr');
    var data = [];

    rows.forEach(function(row) {
        var cells = row.querySelectorAll('td');
        var rowData = [];
        cells.forEach(function(cell) {
            rowData.push(cell.textContent.trim());
        });
        data.push(rowData);
    });

    return data;
}

// Função para autenticar e cadastrar os dados extraídos
function authenticateAndRegister(data) {
    console.log('Dados de cliente:', data); // Log para verificar os dados recebidos

    // Faz a autenticação
    fetch(authenticateUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => response.json())
    .then(authData => {
        if (authData.accessToken) {
            console.log('Token recebido:', authData.accessToken); // Log para verificar o token

            // Arrays para armazenar os resultados do cadastro
            let successResults = [];
            let errorResults = [];

            // Se a autenticação for bem-sucedida, envia os dados dos clientes para a API intermediária
            const registerPromises = data.map(cliente => {
                // Mapeamento de maritalStatus
                const maritalStatusMap = {
                    'married': 'C',
                    'single': 'S',
                    'divorced': 'D',
                    'widowed': 'V',
                    'not informed': null // 'null' será enviado como valor nulo
                };

                // Cria um objeto com os dados do cliente
                let clienteObj = {
                    companyId: parseInt(cliente[0]) || null,
                    name: cliente[2] || "Empresa Fake ABC Ltda2",
                    tradeName: cliente[3] || "",
                    pronunciation: cliente[4] || null,
                    fieldOfActivity: cliente[40] || "Indústria",
                    profession: cliente[46] || null,
                    notes: cliente[41] || "Uma empresa que produz droides de batalha, incluindo os Droidekas",
                    cellNumber: cliente[13] || "11988997766",
                    website: cliente[39] || "fakeabc.app",
                    hasLoginAccess: false,
                    automaticallyIssueNfse: "notIssue",
                    notesNfse: cliente[42] || "Teste observações na NFSe",
                    hasIssRetention: true,
                    address: {
                        zipCode: cliente[21] || "13058-111",
                        state: cliente[23] || "SP",
                        city: cliente[22] || "Campinas",
                        street: cliente[17] || "Rua Alziro Arten",
                        number: cliente[18] || "443",
                        neighborhood: cliente[20] || "Conjunto Habitacional Parque da Floresta",
                        additionalDetails: cliente[19] || "Sala 4, Térreo"
                    },
                    phones: cliente[12] ? cliente[12].split(';').map(phone => phone.trim()) : [],
                    emailsMessage: cliente[11] ? cliente[11].split(';').map(email => email.trim()) : [],
                    emailsFinancialMessages: cliente[10] ? cliente[10].split(';').map(email => email.trim()) : [],
                    isNetworkingProfileVisible: true,
                    isBlockedBookingCustomerArea: true,
                    isAllowedBookingOutsideBusinessHours: false,
                    internetPlan: "Plano 20MB",
                    businessPresentation: cliente[42] || "Breve apresentação da empresa",
                    offeredServicesProducts: cliente[43] || "Serviços e produtos oferecidos",
                    receptionOrientations: cliente[45] || "Orientações de atendimento",
                    mailingOrientations: "Orientações de correspondência",
                    mailingAddress: {
                        zipCode: cliente[29] || "13060-008",
                        state: cliente[31] || "SP",
                        city: cliente[30] || "Campinas",
                        street: cliente[25] || "Rua Antônio Menito",
                        number: cliente[26] || "264",
                        neighborhood: cliente[28] || "Jardim Anchieta",
                        additionalDetails: cliente[27] || "Bloco A1"
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

                // Chamada para a API intermediária para cadastrar os dados do cliente
                return fetch(customerUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + authData.accessToken
                    },
                    body: JSON.stringify(clienteObj)
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Erro ao cadastrar cliente: ' + response.statusText);
                    }
                    return response.json();
                })
                .then(registerData => {
                    if (registerData.success) {
                        successResults.push({ id: registerData.id, name: clienteObj.name });
                        console.log('Cliente cadastrado com sucesso! ID: ' + registerData.id);
                    } else {
                        throw new Error(registerData.error || 'Erro ao cadastrar cliente');
                    }
                })
                .catch(error => {
                    errorResults.push({ name: clienteObj.name, error: error.message });
                    console.error('Erro ao cadastrar cliente:', error);
                });
            });

            // Espera todos os cadastros serem tentados e exibe o relatório
            Promise.all(registerPromises)
                .then(() => {
                    displayRegistrationReport(successResults, errorResults);
                });
            
            // Função para formatar a data no formato 'YYYY-MM-DD'
            function formatDate(dateString) {
                const parts = dateString.split('/');
                if (parts.length === 3) {
                    return `${parts[2]}-${parts[1]}-${parts[0]}`; // Retorna no formato 'YYYY-MM-DD'
                }
                return null; // Retorna null se o formato estiver incorreto
            }

        } else {
            throw new Error(authData.error || 'Erro ao autenticar');
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro durante o processo: ' + error.message);
    });
}

// Função para exibir o relatório de cadastro
function displayRegistrationReport(successResults, errorResults) {
    const reportModal = document.getElementById('reportModal');
    const reportBody = document.getElementById('reportBody');
    reportBody.innerHTML = '';

    // Adiciona os resultados de sucesso
    if (successResults.length > 0) {
        reportBody.innerHTML += '<h5>Clientes cadastrados com sucesso:</h5><ul>';
        successResults.forEach(result => {
            reportBody.innerHTML += `<li class="success">ID: ${result.id} - Nome: ${result.name}</li>`;
        });
        reportBody.innerHTML += '</ul>';
    }

    // Adiciona os resultados de erro
    if (errorResults.length > 0) {
        reportBody.innerHTML += '<h5>Erros durante o cadastro:</h5><ul>';
        errorResults.forEach(result => {
            reportBody.innerHTML += `<li class="error">Nome: ${result.name} - Erro: ${result.error}</li>`;
        });
        reportBody.innerHTML += '</ul>';
    }

    // Exibe o modal
    reportModal.style.display = 'block'; // Mostra o modal
}