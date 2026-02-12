
const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), '동물_동물병원.csv');

try {
    const buffer = fs.readFileSync(filePath);
    const decoder = new TextDecoder('euc-kr');
    const content = decoder.decode(buffer);

    const lines = content.split('\n');
    console.log('Header:', lines[0]);
    console.log('First Row:', lines[1]);
    console.log('Second Row:', lines[2]);
} catch (error) {
    console.error('Error reading file:', error);
}
