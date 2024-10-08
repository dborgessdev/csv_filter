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
        <button type="submit" class="btn btn-secondary">
            <i class="fas fa-paper-plane"></i> Enviar
        </button>
    </form>
</div>

<!-- Div para exibir mensagens de erro -->
<div id="errorMessages" class="alert alert-danger d-none"></div>

<!-- Modal de Login -->
<div id="loginModal" class="modal">
    <div class="modal-content">
        <div class="modal-header">
            <span class="close-button" onclick="document.getElementById('loginModal').style.display='none'">&times;</span>
            <h4>Login para Autenticação</h4>
        </div>
        <div class="modal-body">
            <form id="loginForm">
                <div class="mb-3">
                    <label for="username" class="form-label">Username</label>
                    <input type="text" class="form-control" id="username" required>
                </div>
                <div class="mb-3">
                    <label for="password" class="form-label">Senha</label>
                    <input type="password" class="form-control" id="password" required>
                </div>
                <button type="submit" class="btn btn-primary">Autenticar</button>
            </form>
        </div>
    </div>
</div>

<!-- Div para exibir os dados da tabela  + form com buttom para-->
<div id="output" class="table-container mb-4"></div>
<div class="table-container"> 
    <div id="gridBody" class="mt-4"></div> <!-- Conteúdo do grid -->
</div>
<button id="finalizeRegistration" type="button" class="btn btn-warning mt-2 d-none"> <!-- Botão oculto inicialmente -->
    <i class="fas fa-check"></i> Concluir Cadastro
</button>

<!-- Progressbar -->
<div id="progressBarContainer" class="progress" style="display: none;">
  <div id="progressBar" class="progress-bar" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">0%</div>
</div>

<!-- Modal para exibir o relatório de cadastro -->
<div id="reportModal" class="modal">
    <div class="modal-content">
        <div class="modal-header">
            <span class="close-button" onclick="document.getElementById('reportModal').style.display='none'">&times;</span>
            <h4>Relatório de Cadastro</h4>
        </div>
        <div class="modal-body" id="reportBody"></div>
        <div class="modal-footer">
            <a href="http://localhost:8080/" class="btn btn-primary">Início</a>
        </div>
    </div>
</div>

<!-- Inclui jQuery -->
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js"></script>

<!-- Define variáveis globais para uso no upload.js -->
<script>
    window.uploadUrl = '<?php echo Yii::app()->createUrl("site/upload"); ?>';
    window.authenticateUrl = '<?php echo Yii::app()->createUrl("api/authenticate"); ?>';
    window.customerUrl = '<?php echo Yii::app()->createUrl("api/customer"); ?>';
</script>

<!-- Inclui o script para o upload -->
<script src="<?php echo Yii::app()->baseUrl; ?>/protected/js/upload.js"></script>
<script src="protected/js/api.js"></script>
<script src="protected/js/ui.js"></script>
<script src="protected/js/validator.js"></script>

</body>
</html>
