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

                data[0].forEach((header) => {
                    table += '<th>' + header + '</th>';
                });
                table += '</tr></thead><tbody>';

                data.forEach((row, index) => {
                    if (index !== 0) { // Ignora o cabeçalho
                        table += '<tr>';
                        row.forEach((cell) => {
                            table += '<td>' + cell + '</td>';
                        });
                        table += '</tr>';
                    }
                });
                table += '</tbody></table>';

                output.innerHTML = table; // Exibe a tabela
            } else {
                output.innerHTML = '<p>Nenhum dado foi retornado.</p>';
            }
        }
    })
    .catch(error => console.error('Erro:', error));
};
