import * as XLSX from 'xlsx';

try {
    console.log('Testing json_to_sheet with empty array...');
    const ws = XLSX.utils.json_to_sheet([]);
    console.log('Success!', ws);
} catch (e) {
    console.error('Failed with error:', e);
}
