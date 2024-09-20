<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Upload de Arquivo CSV</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
    <link rel="stylesheet" href="/css/style.css"> 
    <!-- Ajuste este caminho conforme necessário -->
    <style>
        /* Estilização básica da tabela */
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        table, th, td {
            border: 1px solid #ddd;
        }
        th, td {
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
        }

        /* Adicionando rolagem horizontal dentro do div se necessário */
        .table-container {
            width: 100%;
            overflow-x: auto; /* Ativa rolagem horizontal dentro do div */
            margin-top: 20px;
        }
    </style>
</head>
<body>

    <h1>Upload de Arquivo CSV</h1>
    
    <form id="uploadForm" enctype="multipart/form-data">
        <label for="csv_file">Selecione um arquivo CSV:</label>
        <input type="file" name="csv_file" id="csv_file" accept=".csv" required>
        <br><br>
        <button type="submit">Enviar</button>
    </form>

    <!-- Container para a tabela, com rolagem horizontal -->
    <div id="output" class="table-container"></div>

    <!-- Scripts -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    
    <script>
        // Define a URL da ação 'upload' no PHP
        var uploadUrl = '<?php echo Yii::app()->createUrl("site/upload"); ?>';

        $(document).ready(function() {
            $('#uploadForm').on('submit', function(e) {
                e.preventDefault(); // Impede o envio padrão do formulário

                var formData = new FormData(this); // Coleta os dados do formulário

                $.ajax({
                    url: uploadUrl, // URL da ação de upload
                    type: 'POST',
                    data: formData,
                    contentType: false,
                    processData: false,
                    success: function(response) {
                        if (response.error) {
                            $('#output').html('<p>' + response.error + '</p>');
                        } else {
                            // Cria a tabela com os dados do CSV
                            var table = '<table>';
                            table += '<thead><tr>';

                            // Adiciona os cabeçalhos da tabela (primeira linha do CSV)
                            response[0].forEach(function(header) {
                                table += '<th>' + header + '</th>';
                            });

                            table += '</tr></thead><tbody>';

                            // Adiciona as demais linhas (dados)
                            for (var i = 1; i < response.length; i++) {
                                table += '<tr>';
                                response[i].forEach(function(cell) {
                                    table += '<td>' + cell + '</td>';
                                });
                                table += '</tr>';
                            }

                            table += '</tbody></table>';

                            // Exibe a tabela no div 'output'
                            $('#output').html(table);
                        }
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        $('#output').html('Erro: ' + errorThrown);
                    }
                });
            });
        });
    </script>
    
</body>
</html>
