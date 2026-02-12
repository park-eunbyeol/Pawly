import { NextResponse } from 'next/server';
import proj4 from 'proj4';

// EPSG:5174 definition (Bessel 1841 Middle - widely used in Korean gov data)
const EPSG_5174 = "+proj=tmerc +lat_0=38 +lon_0=127.0028902777778 +k=1 +x_0=200000 +y_0=500000 +ellps=bessel +units=m +no_defs";
const EPSG_4326 = "EPSG:4326"; // WGS84 (Lat/Lon)

// ✅ 기존 GET 핸들러 (공공데이터 병원 목록) - 그대로 유지
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const pageNo = searchParams.get('pageNo') || '1';
    const numOfRows = searchParams.get('numOfRows') || '100';

    const serviceKey = process.env.DATA_GO_KR_API_KEY;

    if (!serviceKey) {
        return NextResponse.json({ error: 'API Key is missing in server .env' }, { status: 500 });
    }

    const apiUrl = `http://apis.data.go.kr/1741000/AnimalHosptlServiceV2/getAnimalHosptlList?serviceKey=${encodeURIComponent(serviceKey)}&numOfRows=${numOfRows}&pageNo=${pageNo}&type=json`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Public API failed with status ${response.status}`);
        }

        const data = await response.json();
        const items = data?.response?.body?.items?.item || [];

        const validItems = Array.isArray(items) ? items : [items];

        const hospitals = validItems
            .filter((item: any) => item.opnSvcSttsStusId === '01')
            .map((item: any) => {
                let lat = null;
                let lng = null;

                if (item.x && item.y) {
                    try {
                        const x = parseFloat(item.x);
                        const y = parseFloat(item.y);
                        if (!isNaN(x) && !isNaN(y)) {
                            const [convertedLng, convertedLat] = proj4(EPSG_5174, EPSG_4326, [x, y]);
                            lng = convertedLng;
                            lat = convertedLat;
                        }
                    } catch (e) {
                        console.error("Coordinate conversion failed for:", item.bplcNm, e);
                    }
                }

                return {
                    name: item.bplcNm,
                    address: item.rdnWhlAddr || item.lnmWhlAddr,
                    phone: item.siteTel,
                    state: item.opnSvcSttsStusSeNm,
                    lat: lat,
                    lng: lng,
                    licenseDate: item.apvPermYmd,
                    x: item.x,
                    y: item.y
                };
            })
            .filter((h: any) => h.lat !== null && h.lng !== null);

        return NextResponse.json({
            hospitals,
            totalCount: data?.response?.body?.totalCount,
            pageNo: data?.response?.body?.pageNo
        });

    } catch (error) {
        console.error("Failed to fetch/parse public data:", error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}

// ✅ 새로 추가: LLM 증상 분석 POST 핸들러 (Google Gemini)
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

export async function POST(request: Request) {
    const body = await request.json();
    console.log("API Request Body:", body);
    const { symptoms, description, pet, hospitalNames } = body;

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: 'Google API Key missing' }, { status: 500 });
    }

    const petLabel = pet === 'dog' ? '강아지' : pet === 'cat' ? '고양이' : '특수동물';
    const symptomList = symptoms?.length > 0 ? symptoms.join(', ') : '없음';
    const additionalDesc = description || '없음';

    // ✅ 병원 이름 목록이 있으면 특수동물 가능 여부도 같이 판단
    const hospitalSection = hospitalNames?.length > 0
        ? `\n\n[주변 병원 목록]\n${hospitalNames.map((n: string, i: number) => `${i + 1}. ${n}`).join('\n')}\n위 병원들이 특수동물 진료가 가능한지 병원 이름을 기반으로 판단해서 "specialAvailable" 배열에 true/false로 응답해주세요.`
        : '';

    const prompt = `당신은 수의학 전문 AI입니다. 반려동물 증상을 분석하고 응급 여부를 판단해주세요.

[반려동물 종류] ${petLabel}
[선택된 증상] ${symptomList}
[보호자 추가 설명] ${additionalDesc}${hospitalSection}

아래 JSON 형식으로만 응답하세요. 다른 텍스트는 절대 포함하지 마세요 (JSON 코드 블록 없이 순수 JSON만 출력):
{
  "level": "매우 위험 (응급)" | "주의 요망" | "관찰 필요",
  "color": "#EF4444" | "#F59E0B" | "#3B82F6",
  "icon": "🚨" | "⚠️" | "ℹ️",
  "isEmergency": true | false,
  "reason": "판단 근거 2~3문장",
  "steps": ["조치사항 1", "조치사항 2", "조치사항 3"],
  "specialAvailable": [true, false, ...]
}

판단 기준:
- 매우 위험 (응급): 호흡곤란, 경련, 심한 출혈, 의식 저하 → isEmergency: true
- 주의 요망: 구토, 설사, 기력저하 등 → isEmergency: false
- 관찰 필요: 경미한 증상 → isEmergency: false
- specialAvailable: 병원 이름에 '특수', '조류', '파충류', '토끼', 'exotic' 포함 시 true, 그 외 false`;

    try {
        const model = new ChatGoogleGenerativeAI({
            model: "gemini-1.5-flash",
            maxOutputTokens: 512,
            apiKey: apiKey
        });

        const response = await model.invoke(prompt);
        const text = response.content.toString();

        // JSON 파싱 (코드 블록 제거)
        const clean = text.replace(/```json|```/g, '').trim();
        const result = JSON.parse(clean);

        return NextResponse.json(result);

    } catch (err) {
        console.error('LLM analysis error:', err);
        return NextResponse.json({
            level: '관찰 필요',
            color: '#3B82F6',
            icon: 'ℹ️',
            isEmergency: false,
            reason: '분석 중 오류가 발생했습니다. 증상이 심각하다면 즉시 병원을 방문하세요.',
            steps: [
                '반려동물의 상태를 주의 깊게 관찰하세요.',
                '증상이 악화되면 즉시 병원을 방문하세요.',
                '궁금한 점은 가까운 동물병원에 문의하세요.'
            ],
            specialAvailable: hospitalNames?.map(() => false) || []
        });
    }
}