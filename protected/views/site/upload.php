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

<div class="container">
    <h1 class="my-4">Upload de Arquivo CSV</h1>

    <form id="uploadForm" enctype="multipart/form-data" class="mb-4">
        <div class="mb-3">
            <label for="csv_file" class="form-label">Selecione um arquivo CSV:</label>
            <input type="file" name="csv_file" id="csv_file" class="form-control" accept=".csv" required>
        </div>
        <button type="submit" class="btn btn-primary">Enviar</button>
    </form>

    <div id="output" class="table-container"></div>
</div>

<!-- Modal -->
<div class="modal fade" id="myModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-scrollable"> <!-- Classe para permitir rolagem -->
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">Dados a Serem Cadastrados</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body" id="modalBody"></div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                <button type="button" class="btn btn-primary">Concluir Cadastro</button> <!-- Adicione lógica para cadastro -->
            </div>
        </div>
    </div>
</div>

<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script> <!-- Incluindo jQuery -->
<script>
    var uploadUrl = '<?php echo Yii::app()->createUrl("site/upload"); ?>';
</script>
<script src="<?php echo Yii::app()->baseUrl; ?>/protected/js/upload.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
