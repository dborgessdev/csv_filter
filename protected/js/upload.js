document.getElementById('uploadForm').onsubmit = function(event) {
    event.preventDefault();
    var formData = new FormData(this);
    var uploadUrl = '<?php echo Yii::app()->createUrl("site/upload"); ?>'; // Ajuste conforme necessário

    fetch(uploadUrl, {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        var output = document.getElementById('output');
        output.innerHTML = ''; // Limpa qualquer conteúdo anterior

        if (data.error) {
            output.innerHTML = '<p>' + data.error + '</p>';
        } else {
            // Cria uma tabela para exibir os dados
            var table = '<table border="1" cellpadding="5" cellspacing="0"><thead><tr>';

            // Adiciona cabeçalhos à tabela
            data[0].forEach((header) => {
                table += '<th>' + header + '</th>';
            });
            table += '</tr></thead><tbody>';

            // Adiciona cada linha de dados à tabela
            data.forEach((row, index) => {
                if (index !== 0) { // Ignora o cabeçalho se estiver presente
                    table += '<tr>';
                    row.forEach((cell) => {
                        table += '<td>' + cell + '</td>';
                    });
                    table += '</tr>';
                }
            });
            table += '</tbody></table>';
            output.innerHTML = table; // Exibe a tabela
        }
    })
    .catch(error => console.error('Erro:', error));
};
