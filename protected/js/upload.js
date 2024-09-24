document.getElementById('uploadForm').onsubmit = function(event) {
    event.preventDefault();
    var formData = new FormData(this);
    
    fetch(uploadUrl, { // URL do endpoint
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
            } else {
                output.innerHTML = '<p>Nenhum dado foi retornado.</p>';
            }
        }
    })
    .catch(error => console.error('Erro:', error));
};
