
const fs = require('fs');
const path = require('path');
const proj4 = require('proj4');

// EPSG:2097 Definition
proj4.defs("EPSG:2097", "+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=500000 +ellps=bessel +units=m +no_defs +towgs84=-115.80,474.99,674.11,1.16,-2.31,-1.63,6.43");
const wgs84 = "EPSG:4326";

const inputPath = path.join(process.cwd(), '동물_동물병원.csv');
const outputDir = path.join(process.cwd(), 'public', 'data');
const outputPath = path.join(outputDir, 'hospitals.json');

// Ensure output dir
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Memory-efficient line reader not needed for just 2MB, readAll is fine.
try {
    const buffer = fs.readFileSync(inputPath);
    const decoder = new TextDecoder('euc-kr');
    const content = decoder.decode(buffer);

    // Split lines
    const lines = content.split(/\r?\n/);

    // Header is line 0
    // We determined columns from inspection:
    // Name: idx 12 (사업장명) - check header again to be sure
    // Status: idx 4 (영업상태명), idx 17 (상세영업상태명) - Header says 4=영업상태명, 17=상세영업상태명
    // Phone: idx 20 (전화번호)
    // Address: idx 16 (도로명주소), idx 23 (지번주소)
    // Coord X: idx 21
    // Coord Y: idx 22

    const header = lines[0].split(',');
    // Simple CSV parser for lines (handles quoted commas)
    const parseCSVLine = (line) => {
        const result = [];
        let start = 0;
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            if (line[i] === '"') {
                inQuotes = !inQuotes;
            } else if (line[i] === ',' && !inQuotes) {
                let field = line.substring(start, i);
                if (field.startsWith('"') && field.endsWith('"')) {
                    field = field.slice(1, -1).replace(/""/g, '"');
                }
                result.push(field);
                start = i + 1;
            }
        }
        let lastField = line.substring(start);
        if (lastField.startsWith('"') && lastField.endsWith('"')) {
            lastField = lastField.slice(1, -1).replace(/""/g, '"');
        }
        result.push(lastField);
        return result;
    };

    const hospitals = [];

    // Skip header
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const cols = parseCSVLine(line);

        // Safety check
        if (cols.length < 22) continue;

        // Status Check
        // 영업상태명(4): "영업/정상"
        // 상세영업상태명(17): "정상"
        const statusDetails = cols[17];
        const statusMain = cols[4];

        if (statusDetails !== '정상' && statusMain !== '영업/정상') {
            continue;
        }

        const name = cols[12];
        const phone = cols[20];
        const address = cols[16] || cols[23]; // Road or Jibun
        const x = parseFloat(cols[21]);
        const y = parseFloat(cols[22]);

        if (isNaN(x) || isNaN(y)) continue;

        try {
            const [lng, lat] = proj4("EPSG:2097", wgs84, [x, y]);

            // Basic validation for Korea bounds
            if (lat < 33 || lat > 39 || lng < 124 || lng > 132) continue;

            // Check for special animal keywords in the name
            const specialKeywords = ['특수', '소동물', '이색', '조류', '파충류', '토끼', '햄스터', '고슴도치', '앵무새', '거북이'];
            const isSpecial = specialKeywords.some(keyword => name.includes(keyword));

            hospitals.push({
                name,
                phone: phone || '',
                address: address || '',
                lat,
                lng,
                category: isSpecial ? '특수동물병원' : '동물병원',
                isSpecial
            });
        } catch (e) {
            // Conversion error
        }
    }

    console.log(`Processed ${lines.length} lines.`);
    console.log(`Valid hospitals found: ${hospitals.length}`);

    fs.writeFileSync(outputPath, JSON.stringify(hospitals, null, 2), 'utf8');
    console.log(`Saved to ${outputPath}`);

} catch (error) {
    console.error('Error:', error);
}
