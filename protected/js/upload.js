document.getElementById('uploadForm').onsubmit = function(event) {
    event.preventDefault();
    var formData = new FormData(this);
    
    fetch(uploadUrl, { // URL do endpoint para upload
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        console.log(data); // Verifique a resposta do servidor
        var output = document.getElementById('output');
        output.innerHTML = ''; // Limpa qualquer conteúdo anterior

        if (data.error) {
            alert(data.error); // Alerta para erro geral
            output.innerHTML = '<p>' + data.error + '</p>';
        } else if (data.errors) {
            alert("Erros encontrados: " + data.errors.join(', ')); // Alerta para erros na planilha
            output.innerHTML = '<p>' + data.errors.join('<br>') + '</p>';
        } else {
            if (Array.isArray(data) && data.length > 0) {
                var table = '<table border="1" cellpadding="5" cellspacing="0"><thead><tr>';

                // Lista atualizada de cabeçalhos
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

                // Preenche o cabeçalho (TH) com os títulos
                headers.forEach((header) => {
                    table += '<th>' + header + '</th>';
                });

                table += '</tr></thead><tbody>';

                // Itera sobre cada linha, começando da primeira linha de dados
                data.forEach((row) => {
                    table += '<tr>'; // Inicia uma nova linha da tabela
                    row.forEach((cell) => {
                        table += '<td>' + (cell !== undefined ? cell : '') + '</td>'; // Popula os dados (TD)
                    });
                    table += '</tr>'; // Fecha a linha da tabela
                });
                
                table += '</tbody></table>';

                // Insere a tabela no modal
                var modalBody = document.getElementById('modalBody');
                modalBody.innerHTML = table; // Exibe a tabela no modal
                var myModal = new bootstrap.Modal(document.getElementById('myModal'));
                myModal.show(); // Exibe o modal

                // Adiciona a lógica de cadastro de clientes após o upload
                document.getElementById('finalizeRegistration').onclick = function() {
                    var modalBody = document.getElementById('modalBody');
                    var dataToRegister = parseTableData(modalBody); // Função para extrair dados da tabela

                    // Autentica na API intermediária e, em seguida, cadastra os dados
                    authenticateAndRegister(dataToRegister);
                };

            } else {
                output.innerHTML = '<p>Nenhum dado foi retornado.</p>';
            }
        }
    })
    .catch(error => console.error('Erro:', error));
};

// Função para converter os dados da tabela exibida no modal em um array de objetos
function parseTableData(modalBody) {
    var table = modalBody.querySelector('table');
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

function authenticateAndRegister(data) {
    console.log('Dados de cliente:', data); // Adicione este log para verificar os dados
    // Faz a autenticação
    fetch(authenticateUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => response.json())
    .then(authData => {
        if (authData.accessToken) {
            console.log('Token recebido:', authData.accessToken); // log para verificar o token

            // Se a autenticação for bem-sucedida, envia os dados dos clientes para a API intermediária
            data.forEach(cliente => {
                // Mapeamento de maritalStatus
                const maritalStatusMap = {
                    'married': 'C',
                    'single': 'S',
                    'divorced': 'D',
                    'widowed': 'V',
                    'not informed': null // 'null' será enviado como valor nulo
                };
            
                // Converte o companyId para inteiro
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
                    phones: cliente[12].split(';').map(phone => phone.trim()) || [],
                    emailsMessage: cliente[11].split(';').map(email => email.trim()) || [],
                    emailsFinancialMessages: cliente[10].split(';').map(email => email.trim()) || [],
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
            
                // Verifica se o cliente é pessoa jurídica ou natural
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
            
                // Chamada para a API intermediária
                fetch(customerUrl, {
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
                        alert('Cadastro concluído com sucesso! ID: ' + registerData.id);
                        location.reload(); // Recarrega a página após sucesso
                    } else {
                        throw new Error(registerData.error || 'Erro ao cadastrar cliente');
                    }
                })
                .catch(error => {
                    console.error('Erro ao cadastrar cliente:', error);
                    alert('Erro ao cadastrar cliente: ' + error.message);
                });
            });
            
            // Função para formatar a data
            function formatDate(dateString) {
                // Supondo que a data de entrada seja no formato 'DD/MM/YYYY'
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
