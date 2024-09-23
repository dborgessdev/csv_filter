<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Upload de Arquivo CSV</title>
    
    <!-- Inclui o Bootstrap para estilização -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
    
    <!-- Inclui a fonte Roboto do Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet"> 
    
    <!-- Inclui o CSS personalizado -->
    <link rel="stylesheet" href="/css/style.css">
    
    <!-- Inclui Font Awesome para ícones -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
</head>
<body>

<div class="container">
    <h1 class="my-4"><i class="fas fa-upload"></i> Upload de Arquivo CSV</h1>

    <!-- Formulário para upload de arquivo -->
    <form id="uploadForm" enctype="multipart/form-data" class="mb-4">
        <div class="mb-3">
            <label for="csv_file" class="form-label"><i class="fas fa-file-csv"></i> Selecione um arquivo CSV:</label>
            <input type="file" name="csv_file" id="csv_file" class="form-control" accept=".csv" required>
        </div>
        <button type="submit" class="btn btn-primary"><i class="fas fa-paper-plane"></i> Enviar</button>
    </form>

    <!-- Div para exibir os dados da tabela -->
    <div id="output" class="table-container"></div>
</div>

<!-- Modal para exibir dados a serem cadastrados -->
<div class="modal fade" id="myModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-scrollable"> <!-- Permite rolagem no modal -->
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel"><i class="fas fa-check-circle"></i> Dados a Serem Cadastrados</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body" id="modalBody"></div> <!-- Conteúdo do modal -->
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal"><i class="fas fa-times"></i> Fechar</button>
                <button type="button" class="btn btn-primary"><i class="fas fa-check"></i> Concluir Cadastro</button> <!-- Lógica para cadastro deve ser adicionada -->
            </div>
        </div>
    </div>
</div>

<!-- Inclui jQuery -->
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>

<!-- Define a URL do endpoint para o upload -->
<script>
    var uploadUrl = '<?php echo Yii::app()->createUrl("site/upload"); ?>';
</script>

<!-- Inclui o script para o upload -->
<script src="<?php echo Yii::app()->baseUrl; ?>/protected/js/upload.js"></script>

<!-- Inclui o Bootstrap JS para funcionalidade do modal -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
