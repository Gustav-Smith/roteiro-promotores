import * as XLSX from 'xlsx';

try {
    console.log('Testing full workbook with one empty sheet and two populated sheets...');
    const wb = XLSX.utils.book_new();

    // 1. Empty sheet
    const ws1 = XLSX.utils.json_to_sheet([]);
    XLSX.utils.book_append_sheet(wb, ws1, "Empty Sheet");

    // 2. Populated sheet
    const ws2 = XLSX.utils.json_to_sheet([{ Name: "John Doe", Role: "Promoter" }]);
    XLSX.utils.book_append_sheet(wb, ws2, "Populated Sheet");

    // Write to array
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    console.log('Success! Array size:', wbout.byteLength);
} catch (e) {
    console.error('Failed with error:', e);
}
