document.getElementById('uploadForm').onsubmit = function(event) {
    event.preventDefault();
    var formData = new FormData(this);
    var output = document.getElementById('output');
    output.innerHTML = '<p>Carregando...</p>'; // Exibe carregando

    fetch(uploadUrl, {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        output.innerHTML = ''; // Limpa qualquer conteúdo anterior

        if (data.error) {
            output.innerHTML = '<p class="text-danger">' + data.error + '</p>';
        } else if (data.errors) {
            output.innerHTML = '<p class="text-danger">' + data.errors.join('<br>') + '</p>';
        } else {
            showModal(data); // Chama a função para mostrar o modal com os dados
        }
    })
    .catch(error => console.error('Erro:', error));
};

// Função para mostrar o modal
function showModal(data) {
    var modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = ''; // Limpa o conteúdo do modal

    var table = '<table class="table table-bordered"><thead><tr>';
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

    modalBody.innerHTML = table; // Adiciona a tabela ao corpo do modal
    $('#myModal').modal('show'); // Mostra o modal
}
