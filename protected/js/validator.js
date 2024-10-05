// validator.js
class Validator { 
    static parseTableData(gridBody) { // realizar o parse dos dados da tabela
        const table = gridBody.querySelector('table');
        const rows = table.querySelectorAll('tbody tr');
        const data = [];

        rows.forEach(row => { // percorrer as linhas
            const cells = row.querySelectorAll('td'); 
            const rowData = [];
            cells.forEach(cell => {
                rowData.push(cell.textContent.trim()); 
            });
            data.push(rowData); // adiciona os dados
        });

        return data; // retorna os dados
    }
}
