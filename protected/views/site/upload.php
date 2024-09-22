<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Upload de Arquivo CSV</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="/css/style.css"> 
</head>
<body>

    <h1>Upload de Arquivo CSV</h1>
    
    <form id="uploadForm" enctype="multipart/form-data">
        <label for="csv_file">Selecione um arquivo CSV:</label>
        <input type="file" name="csv_file" id="csv_file" accept=".csv" required>
        <br><br>
        <button type="submit">Enviar</button>
    </form>

    <div id="output" class="table-container"></div>

    <script>
        var uploadUrl = '<?php echo Yii::app()->createUrl("site/upload"); ?>'; // URL do endpoint
    </script>
    <script src="<?php echo Yii::app()->baseUrl; ?>/protected/js/upload.js"></script> <!-- Corrigido aqui -->
    
</body>
</html>
