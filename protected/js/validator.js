class Validator { 
    static parseTableData(gridBody) { 
        const table = gridBody.querySelector('table');
        const rows = table.querySelectorAll('tbody tr');
        const data = [];

        rows.forEach(row => { 
            const cells = row.querySelectorAll('td'); 
            const rowData = [];
            cells.forEach(cell => {
                rowData.push(cell.textContent.trim()); 
            });
            data.push(rowData);
        });

        return data;
    }
}
