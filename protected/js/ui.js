// ui.js
class UI {
    static clearOutput() {
        const output = document.getElementById('output');
        output.innerHTML = '';
    }

    static clearGrid() {
        const gridBody = document.getElementById('gridBody');
        gridBody.innerHTML = '';
    }

    static showSuccess(message) {
        alert(message);
    }

    static showError(message) {
        alert(message);
    }

    static showErrors(errors) {
        const output = document.getElementById('output');
        output.innerHTML = ''; 
        output.classList.remove('d-none'); 
        
        let errorList = '<ul>';
        errors.forEach(error => {
            errorList += `<li>${error}</li>`;
        });
        errorList += '</ul>';
        output.innerHTML = errorList;
        output.classList.add('alert', 'alert-danger');
    }

    static updateGrid(data) {
        const gridBody = document.getElementById('gridBody');
        let table = '<table class="table table-striped table-bordered" id="dataGrid"><thead><tr>';
        const headers = [
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
        
        headers.forEach(header => {
            table += '<th>' + header + '</th>';
        });
        table += '</tr></thead><tbody>';

        data.forEach(row => {
            table += '<tr>';
            row.forEach(cell => {
                table += '<td>' + (cell !== undefined ? cell : '') + '</td>';
            });
            table += '</tr>';
        });

        table += '</tbody></table>';
        gridBody.innerHTML = table;
    }

    static displayRegistrationReport(successResults, errorResults) {
        const reportModal = document.getElementById('reportModal');
        const reportBody = document.getElementById('reportBody');
        reportBody.innerHTML = '';


        if (successResults.length > 0) {
            reportBody.innerHTML += '<h5>Clientes cadastrados com sucesso:</h5><ul>';
            successResults.forEach(result => {
                reportBody.innerHTML += `<li class="success">ID: ${result.id} - Nome: ${result.name}</li>`;
            });
            reportBody.innerHTML += '</ul>';
        }


        if (errorResults.length > 0) {
            reportBody.innerHTML += '<h5>Erros durante o cadastro:</h5><ul>';
            errorResults.forEach(result => {
                reportBody.innerHTML += `<li class="error">Linha: ${result.line} - Nome: ${result.name} - Erro: ${result.error}</li>`;
            });
            reportBody.innerHTML += '</ul>';
        }

        reportModal.style.display = 'block'; // Mostra o modal
    }
}
