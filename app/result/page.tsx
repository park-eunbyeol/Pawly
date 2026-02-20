"use client";

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState, Suspense } from 'react';

declare global {
    interface Window {
        kakao: any;
    }
}

interface Hospital {
    name: string;
    distance: string;
    address: string;
    phone: string;
    tags: string[];
    recommend?: boolean;
    primary?: boolean;
    lat: string;
    lng: string;
    placeUrl: string;
    category: string;
    rating: string;
    reviewCount: number;
    operatingStatus: string;
    statusColor: string;
    isOpen: boolean;
}

interface SeverityResult {
    level: string;
    color: string;
    icon: string;
    isEmergency: boolean;
    reason: string;
    steps: string[];
}

function ResultContent() {
    const searchParams = useSearchParams();
    const pet = searchParams.get('pet');
    const symptomsStr = searchParams.get('symptoms') || '';
    const description = searchParams.get('description') || '';
    const selectedSymptoms = symptomsStr ? symptomsStr.split(',') : [];

    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [isLoadingHospitals, setIsLoadingHospitals] = useState(true);
    const [mapError, setMapError] = useState<string | null>(null);

    const [severity, setSeverity] = useState<SeverityResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(true);
    const [showEmergencyAlert, setShowEmergencyAlert] = useState(false);
    const [locationStatus, setLocationStatus] = useState<'detecting' | 'success' | 'failed' | 'search'>('detecting');
    const [searchQuery, setSearchQuery] = useState('');
    const mapRef = React.useRef<any>(null);
    const markersRef = React.useRef<any[]>([]);
    const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
    const [currentAddress, setCurrentAddress] = useState('위치 확인 중...');
    const [showReSearchButton, setShowReSearchButton] = useState(false);
    const [currentMapCenter, setCurrentMapCenter] = useState<{ lat: number, lng: number } | null>(null);

    // ✅ 주소 입력 모달 상태 (daum 팝업 대신 인앱 모달 사용)
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [addressInput, setAddressInput] = useState('');
    const [addressSearchResults, setAddressSearchResults] = useState<any[]>([]);
    const [isSearchingAddress, setIsSearchingAddress] = useState(false);

    const getAddress = (lat: number, lng: number) => {
        if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) return;
        const geocoder = new window.kakao.maps.services.Geocoder();
        const callback = (result: any, status: any) => {
            if (status === window.kakao.maps.services.Status.OK) {
                const addr = result[0].road_address
                    ? result[0].road_address.address_name
                    : result[0].address.address_name;
                setCurrentAddress(addr);
            }
        };
        geocoder.coord2Address(lng, lat, callback);
    };

    const handleReSearch = () => {
        if (currentMapCenter) {
            setLocationStatus('search');
            setIsLoadingHospitals(true);
            createMap(currentMapCenter.lat, currentMapCenter.lng);
            setShowReSearchButton(false);
        }
    };

    useEffect(() => {
        const analyze = async () => {
            setIsAnalyzing(true);
            try {
                const res = await fetch('/api/hospitals', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ symptoms: selectedSymptoms, description, pet })
                });
                if (!res.ok) throw new Error('API 호출 실패');
                const data: SeverityResult = await res.json();
                setSeverity(data);
                if (data.isEmergency) setShowEmergencyAlert(true);
            } catch (err) {
                console.error(err);
                setSeverity({
                    level: '관찰 필요',
                    color: '#3B82F6',
                    icon: 'ℹ️',
                    isEmergency: false,
                    reason: '분석 중 오류가 발생했습니다. 증상이 심각하다면 즉시 병원을 방문하세요.',
                    steps: [
                        '반려동물의 상태를 주의 깊게 관찰하세요.',
                        '증상이 악화되면 즉시 병원을 방문하세요.',
                        '궁금한 점은 가까운 동물병원에 문의하세요.'
                    ]
                });
            } finally {
                setIsAnalyzing(false);
            }
        };
        analyze();
    }, []);

    const createMap = React.useCallback((centerLat: number, centerLng: number) => {
        if (!window.kakao || !window.kakao.maps) return;

        window.kakao.maps.load(() => {
            getAddress(centerLat, centerLng);

            const container = document.getElementById('kakao-map');
            if (!container) return;

            let map = mapRef.current;
            if (!map) {
                const options = {
                    center: new window.kakao.maps.LatLng(centerLat, centerLng),
                    level: 4
                };
                map = new window.kakao.maps.Map(container, options);
                mapRef.current = map;
            } else {
                map.setCenter(new window.kakao.maps.LatLng(centerLat, centerLng));
            }

            setShowReSearchButton(false);

            if (!map.hasDragListener) {
                window.kakao.maps.event.addListener(map, 'dragend', () => {
                    const center = map.getCenter();
                    setCurrentMapCenter({ lat: center.getLat(), lng: center.getLng() });
                    setShowReSearchButton(true);
                });
                map.hasDragListener = true;
            }

            const ps = new window.kakao.maps.services.Places();
            const isGeneral = pet === 'dog' || pet === 'cat';
            const keyword = isGeneral ? "동물병원" : "특수 동물병원";

            const searchOptions = {
                location: new window.kakao.maps.LatLng(centerLat, centerLng),
                radius: 10000,
                sort: window.kakao.maps.services.SortBy.DISTANCE
            };

            const searchCallback = (data: any, status: any) => {
                if (status === window.kakao.maps.services.Status.OK) {
                    markersRef.current.forEach(m => m.setMap(null));
                    markersRef.current = [];

                    const bounds = new window.kakao.maps.LatLngBounds();
                    const hospitalData = data.slice(0, 10).map((place: any, idx: number) => {
                        const name = place.place_name;
                        const is24h = name.includes('24') || name.includes('심야') || name.includes('야간') || name.includes('응급');
                        const isExotic = name.includes('특수') || name.includes('조류') || name.includes('exotic') || !isGeneral;

                        const primaryTag = is24h ? '24시간 진료' : '일반진료';
                        const specialtyTag = isExotic ? '특수동물 진료' : '일반 진료';

                        const now = new Date();
                        const day = now.getDay();
                        const hour = now.getHours();

                        let operatingStatus = "진료 종료";
                        let statusColor = "text-slate-400 bg-slate-100";
                        let isOpen = false;

                        if (is24h) {
                            operatingStatus = "24시간 영업 중";
                            statusColor = "text-blue-600 bg-blue-50";
                            isOpen = true;
                        } else if (day === 0) {
                            operatingStatus = "오늘 휴무";
                            statusColor = "text-red-500 bg-red-50";
                            isOpen = false;
                        } else if (day === 6) {
                            if (hour >= 9 && hour < 15) {
                                operatingStatus = "영업 중";
                                statusColor = "text-green-700 bg-gray-100";
                                isOpen = true;
                            } else {
                                operatingStatus = "진료 종료";
                                statusColor = "text-slate-500 bg-slate-100";
                                isOpen = false;
                            }
                        } else {
                            if (hour >= 9 && hour < 19) {
                                operatingStatus = "영업 중";
                                statusColor = "text-green-700 bg-gray-100";
                                isOpen = true;
                            } else {
                                operatingStatus = "진료 종료";
                                statusColor = "text-slate-500 bg-slate-100";
                                isOpen = false;
                            }
                        }

                        const tags = isGeneral ? [primaryTag, specialtyTag] : [specialtyTag, primaryTag];
                        const mockRating = (Math.random() * (5.0 - 3.8) + 3.8).toFixed(1);
                        const mockReviews = Math.floor(Math.random() * 200) + 10;

                        return {
                            name,
                            distance: place.distance ? (parseInt(place.distance) > 1000 ? `${(parseInt(place.distance) / 1000).toFixed(1)}km` : `${place.distance}m`) : '거리 확인 불가',
                            address: place.address_name,
                            phone: place.phone || '번호 없음',
                            tags,
                            recommend: idx === 0,
                            primary: idx === 0,
                            lat: place.y,
                            lng: place.x,
                            placeUrl: place.place_url,
                            category: place.category_name,
                            rating: mockRating,
                            reviewCount: mockReviews,
                            operatingStatus,
                            statusColor,
                            isOpen
                        };
                    });

                    setHospitals(hospitalData);
                    setIsLoadingHospitals(false);
                    setMapError(null);

                    const centerMarker = new window.kakao.maps.Marker({
                        position: new window.kakao.maps.LatLng(centerLat, centerLng),
                        map: map,
                        image: new window.kakao.maps.MarkerImage(
                            'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
                            new window.kakao.maps.Size(24, 35)
                        )
                    });
                    markersRef.current.push(centerMarker);

                    hospitalData.forEach((h: Hospital) => {
                        const markerPosition = new window.kakao.maps.LatLng(h.lat, h.lng);
                        const marker = new window.kakao.maps.Marker({ position: markerPosition, map });
                        const infowindow = new window.kakao.maps.InfoWindow({
                            content: `<div style="padding:10px;font-size:12px;color:#333;font-weight:700;">${h.name}</div>`
                        });
                        window.kakao.maps.event.addListener(marker, 'click', () => {
                            infowindow.open(map, marker);
                        });
                        bounds.extend(markerPosition);
                        markersRef.current.push(marker);
                    });
                    bounds.extend(new window.kakao.maps.LatLng(centerLat, centerLng));
                    if (hospitalData.length > 0) map.setBounds(bounds);

                } else if (status === window.kakao.maps.services.Status.ZERO_RESULT && keyword !== "동물병원") {
                    ps.keywordSearch("동물병원", searchCallback, searchOptions);
                } else {
                    const errorMsg = status === window.kakao.maps.services.Status.ZERO_RESULT
                        ? "주변에 동물병원이 없습니다."
                        : `지도 정보를 불러올 수 없습니다. (에러코드: ${status})`;
                    setMapError(errorMsg);
                    setHospitals([]);
                    setIsLoadingHospitals(false);
                }
            };

            ps.keywordSearch(keyword, searchCallback, searchOptions);
        });
    }, [pet]);

    const initMap = React.useCallback(() => {
        if (!window.kakao || !window.kakao.maps) {
            setMapError("Kakao Maps SDK failed to load");
            return;
        }
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocationStatus('success');
                    createMap(position.coords.latitude, position.coords.longitude);
                },
                () => {
                    setLocationStatus('failed');
                    createMap(37.5665, 126.9780);
                },
                { enableHighAccuracy: true, timeout: 7000, maximumAge: 0 }
            );
        } else {
            setLocationStatus('failed');
            createMap(37.5665, 126.9780);
        }
    }, [createMap]);

    useEffect(() => {
        if (isAnalyzing) return;

        const scriptId = 'kakao-map-sdk';
        const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY;

        if (!apiKey) {
            setMapError("환경 변수(API KEY)가 없습니다. Vercel 설정을 확인해주세요.");
            setIsLoadingHospitals(false);
            return;
        }

        if (window.kakao && window.kakao.maps) {
            initMap();
        } else if (document.getElementById(scriptId)) {
            let retryCount = 0;
            const checkSdk = setInterval(() => {
                retryCount++;
                if (window.kakao && window.kakao.maps) {
                    clearInterval(checkSdk);
                    initMap();
                } else if (retryCount > 50) {
                    clearInterval(checkSdk);
                    setMapError("Kakao SDK ready timeout");
                    setIsLoadingHospitals(false);
                }
            }, 100);
        } else {
            const script = document.createElement('script');
            script.id = scriptId;
            script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&libraries=services&autoload=false`;
            script.async = true;
            script.onload = () => {
                let retryCount = 0;
                const checkSdk = setInterval(() => {
                    retryCount++;
                    if (window.kakao && window.kakao.maps) {
                        clearInterval(checkSdk);
                        initMap();
                    } else if (retryCount > 30) {
                        clearInterval(checkSdk);
                        setMapError("Kakao SDK init failed");
                        setIsLoadingHospitals(false);
                    }
                }, 100);
            };
            script.onerror = (e) => {
                console.error("Kakao Map Script Load Error:", e);
                setMapError("지도를 불러올 수 없습니다. Vercel 환경변수(NEXT_PUBLIC_KAKAO_MAP_APP_KEY) 또는 Kakao 도메인 등록을 확인해주세요.");
                setIsLoadingHospitals(false);
            };
            document.head.appendChild(script);
        }
    }, [isAnalyzing, initMap]);

    // ✅ 인앱 주소 검색 함수 (daum 팝업 대신)
    const handleAddressSearch = () => {
        if (!addressInput.trim() || !window.kakao || !window.kakao.maps) return;
        setIsSearchingAddress(true);

        const ps = new window.kakao.maps.services.Places();
        ps.keywordSearch(addressInput, (data: any, status: any) => {
            setIsSearchingAddress(false);
            if (status === window.kakao.maps.services.Status.OK) {
                setAddressSearchResults(data.slice(0, 5));
            } else {
                setAddressSearchResults([]);
            }
        });
    };

    // ✅ 검색 결과 선택 시 지도 이동
    const handleSelectAddress = (place: any) => {
        const lat = parseFloat(place.y);
        const lng = parseFloat(place.x);
        setCurrentAddress(place.address_name || place.place_name);
        setLocationStatus('search');
        setIsLoadingHospitals(true);
        createMap(lat, lng);
        setShowAddressModal(false);
        setAddressInput('');
        setAddressSearchResults([]);
    };

    const handleMyLocation = () => {
        if (navigator.geolocation) {
            setLocationStatus('detecting');
            setIsLoadingHospitals(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocationStatus('success');
                    createMap(position.coords.latitude, position.coords.longitude);
                },
                () => {
                    setLocationStatus('failed');
                    createMap(37.5665, 126.9780);
                }
            );
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim() || !window.kakao || !window.kakao.maps) return;

        const ps = new window.kakao.maps.services.Places();
        const refinedQuery = searchQuery.includes('병원') ? searchQuery : `${searchQuery} 동물병원`;

        ps.keywordSearch(refinedQuery, (data: any, status: any) => {
            if (status === window.kakao.maps.services.Status.OK) {
                const first = data[0];
                setLocationStatus('search');
                setIsLoadingHospitals(true);
                createMap(parseFloat(first.y), parseFloat(first.x));
            } else {
                ps.keywordSearch(searchQuery, (data2: any, status2: any) => {
                    if (status2 === window.kakao.maps.services.Status.OK) {
                        const first = data2[0];
                        setLocationStatus('search');
                        setIsLoadingHospitals(true);
                        createMap(parseFloat(first.y), parseFloat(first.x));
                    } else {
                        alert("장소를 찾을 수 없습니다.");
                    }
                });
            }
        });
    };

    if (isAnalyzing) {
        return (
            <div className="w-full h-screen bg-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-6">
                    <div className="w-16 h-16 border-2 border-[#4A90E2] border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">AI 증상 분석 중...</p>
                </div>
            </div>
        );
    }

    if (!severity) {
        return (
            <div className="w-full h-screen bg-white flex flex-col items-center justify-center gap-4 p-8">
                <div className="text-4xl">⚠️</div>
                <h2 className="text-xl font-bold text-slate-900">분석 결과를 불러오지 못했습니다.</h2>
                <p className="text-sm text-slate-500 text-center">일시적인 오류일 수 있습니다.<br />잠시 후 다시 시도해주세요.</p>
                <Link href="/"><button className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm">홈으로 돌아가기</button></Link>
            </div>
        );
    }

    return (
        <div className="w-full h-screen bg-white font-sans text-slate-900 flex flex-col relative overflow-hidden">

            {/* ✅ 인앱 주소 입력 모달 (daum 팝업 완전 대체) */}
            {showAddressModal && (
                <div className="absolute inset-0 z-[80] bg-black/40 flex flex-col justify-end animate-in fade-in duration-200">
                    <div className="bg-white rounded-t-[40px] p-6 space-y-4 animate-in slide-in-from-bottom-8 duration-300">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-black text-slate-900">위치 직접 입력</h3>
                            <button onClick={() => { setShowAddressModal(false); setAddressSearchResults([]); setAddressInput(''); }} className="text-slate-400 text-2xl leading-none">✕</button>
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={addressInput}
                                onChange={(e) => setAddressInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleAddressSearch(); }}
                                placeholder="동네, 주소, 병원명 입력"
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-blue-300"
                                autoFocus
                            />
                            <button
                                onClick={handleAddressSearch}
                                className="px-5 py-3 bg-slate-900 text-white rounded-2xl text-sm font-black"
                            >
                                {isSearchingAddress ? '...' : '검색'}
                            </button>
                        </div>

                        {addressSearchResults.length > 0 && (
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {addressSearchResults.map((place, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleSelectAddress(place)}
                                        className="w-full text-left p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                                    >
                                        <p className="text-sm font-black text-slate-900">{place.place_name}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">{place.address_name}</p>
                                    </button>
                                ))}
                            </div>
                        )}

                        {addressSearchResults.length === 0 && addressInput && !isSearchingAddress && (
                            <p className="text-sm text-slate-400 text-center py-4">검색 결과가 없습니다.</p>
                        )}
                    </div>
                </div>
            )}

            {/* Emergency Alert Overlay */}
            {showEmergencyAlert && (
                <div className="absolute inset-0 z-[60] bg-white flex flex-col animate-in fade-in duration-300">
                    <div className="px-6 h-16 flex items-center justify-between">
                        <Link href={`/emergency?pet=${pet}`} className="p-2 -ml-2">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
                            </svg>
                        </Link>
                        <h1 className="text-xl font-bold text-slate-900">응급 상황 안내</h1>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center px-8 space-y-12">
                        <div className="w-full bg-gray-200 rounded-[32px] p-10 flex flex-col items-center justify-center text-center space-y-4 shadow-inner">
                            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-3xl animate-pulse mb-2 shadow-lg shadow-red-500/30">🚨</div>
                            <h2 className="text-2xl font-black text-slate-900">응급 상태입니다!</h2>
                            <p className="text-sm font-bold text-slate-600 leading-relaxed">즉시 가까운 동물병원으로 가세요!</p>
                            <p className="text-xs text-slate-500 leading-relaxed mt-2">{severity.reason}</p>
                        </div>
                        <div className="w-full space-y-4">
                            <button onClick={() => setShowEmergencyAlert(false)} className="w-full py-5 px-8 bg-gray-200 hover:bg-gray-300 rounded-[20px] flex items-center gap-4 transition-colors font-bold text-slate-700">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5l7 7-7 7" /></svg>
                                <span>가까운 병원 찾기</span>
                            </button>
                            <a href="tel:119" className="block w-full">
                                <button className="w-full py-5 px-8 bg-gray-200 hover:bg-gray-300 rounded-[20px] flex items-center gap-4 transition-colors font-bold text-slate-700">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5l7 7-7 7" /></svg>
                                    <span>병원에 전화하기</span>
                                </button>
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* Map Section */}
            <section className="absolute inset-0 w-full h-full z-0 bg-slate-100">
                <div id="kakao-map" className="w-full h-full min-h-[300px]" style={{ background: '#f8fafc' }} />

                <div className="absolute top-4 left-6 right-6 z-10 flex flex-col gap-3">
                    <div className="flex items-center justify-between bg-white/90 backdrop-blur-xl px-5 py-3 rounded-2xl border border-slate-100 shadow-xl animate-in slide-in-from-top-4 duration-700">
                        <div
                            onClick={() => setShowAddressModal(true)}
                            className="flex items-center gap-3 cursor-pointer active:scale-95 transition-transform"
                        >
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-lg border border-blue-100">📍</div>
                            <div className="flex flex-col">
                                <p className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-1">
                                    주변 응급 검색 결과
                                    <svg className="text-slate-300" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                </p>
                                <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                                    {locationStatus === 'detecting' ? '📡 위치 확인 중...' :
                                        <>📍 <span className="text-slate-600">{currentAddress}</span> 기준</>}
                                </p>
                            </div>
                        </div>
                        <button onClick={handleMyLocation} className="p-2 bg-slate-50 border border-slate-100 rounded-lg hover:bg-white transition-colors">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600">
                                <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" />
                                <line x1="12" y1="2" x2="12" y2="5" /><line x1="12" y1="19" x2="12" y2="22" />
                                <line x1="2" y1="12" x2="5" y2="12" /><line x1="19" y1="12" x2="22" y2="12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSearch} className="relative shadow-xl">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="다른 동네 병원 검색 (예: 강남역)"
                            className="w-full bg-white/95 backdrop-blur-xl px-12 py-3.5 rounded-2xl border border-slate-100 text-sm font-bold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                        />
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                        </svg>
                        <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-600">Search</button>
                    </form>
                </div>

                {mapError && (
                    <div className="absolute top-20 left-6 right-6 z-20 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
                        <strong className="font-bold">지도 오류: </strong>
                        <span>{mapError}</span>
                    </div>
                )}

                {isLoadingHospitals && (
                    <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center z-20">
                        <div className="flex flex-col items-center gap-4 p-8 bg-white/90 backdrop-blur-3xl border border-white/50 rounded-[40px] shadow-2xl">
                            <div className="w-12 h-12 border-4 border-[#4A90E2] border-t-transparent rounded-full animate-spin" />
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] animate-pulse">Location Scan</p>
                        </div>
                    </div>
                )}
            </section>

            {/* Bottom Sheet */}
            <aside className="absolute bottom-0 left-0 right-0 h-[65vh] bg-white rounded-t-[48px] shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.15)] z-30 flex flex-col animate-in slide-in-from-bottom-full duration-1000">
                <div className="w-full flex justify-center py-4 shrink-0">
                    <div className="w-12 h-1.5 bg-slate-100 rounded-full" />
                </div>

                <div className="flex-1 overflow-y-auto px-6 sm:px-10 space-y-12 pb-24">
                    <div className="space-y-12">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-[#4A90E2] uppercase tracking-[0.2em]">AI Medical Diagnostic</p>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tighter">분석 결과 리포트</h2>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl">📋</div>
                        </div>

                        <div className="p-10 bg-slate-50 border border-slate-100 rounded-[48px] relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-2 h-full" style={{ backgroundColor: severity.color }} />
                            <div className="flex items-center gap-8 mb-8">
                                <div className="w-20 h-20 rounded-[32px] flex items-center justify-center text-4xl shadow-xl bg-white" style={{ color: severity.color }}>
                                    {severity.icon}
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Severity</p>
                                    <h3 className="text-3xl font-black tracking-tighter" style={{ color: severity.color }}>{severity.level}</h3>
                                </div>
                            </div>
                            <p className="text-lg font-bold text-slate-500 leading-relaxed break-keep">{severity.reason}</p>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Core Protocol</span>
                                <div className="flex-1 h-[1.5px] bg-slate-50" />
                            </div>
                            <div className="space-y-4">
                                {severity.steps.map((step, idx) => (
                                    <div key={idx} className="flex gap-6 p-6 bg-white border border-slate-100 rounded-3xl items-center active:bg-slate-50 transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-[10px] font-black text-slate-400 border border-slate-100 shrink-0">{idx + 1}</div>
                                        <p className="text-base font-bold text-slate-600 leading-tight">{step}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-8">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">주변 동물병원 리스트</p>
                            <div className="grid gap-5">
                                {hospitals.length > 0 ? (
                                    hospitals.map((h, idx) => (
                                        <div key={idx} onClick={() => setSelectedHospital(h)} className="p-8 bg-white border border-slate-100 rounded-[40px] shadow-sm active:scale-95 transition-all cursor-pointer group">
                                            <div className="flex justify-between items-start mb-4">
                                                <h4 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">{h.name}</h4>
                                                <div className="flex flex-col items-end gap-1.5">
                                                    <span className="text-[10px] font-black px-3 py-1 bg-blue-50 text-[#4A90E2] rounded-full">{h.distance}</span>
                                                    <span className={`text-[11px] font-black px-3 py-1 rounded-full border border-current/10 flex items-center gap-1.5 shadow-sm ${h.statusColor}`}>
                                                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                                        {h.operatingStatus}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-400 font-bold mb-6">{h.address}</p>
                                            <div className="flex flex-wrap gap-2 mb-6">
                                                {h.tags.map((tag, tIdx) => (
                                                    <span key={tIdx} className={`text-[9px] font-black px-3 py-1.5 rounded-xl border ${tag.includes('특수') ? 'bg-green-50 border-green-200 text-green-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>{tag}</span>
                                                ))}
                                            </div>
                                            <button className="w-full py-3 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all">상세보기</button>
                                        </div>
                                    ))
                                ) : !isLoadingHospitals && (
                                    <div className="p-16 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[48px]">
                                        <p className="text-sm font-black text-slate-300 uppercase tracking-widest">No matching results</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-8 space-y-6">
                            <Link href="/"><button className="w-full py-8 rounded-[36px] bg-slate-900 text-white text-xl font-black uppercase tracking-[0.2em] shadow-2xl active:scale-[0.98] transition-all">상담 종료하기</button></Link>
                            <p className="text-[9px] font-bold text-slate-300 leading-relaxed uppercase tracking-widest text-center px-12 pb-12">* AI 분석 데이터는 참고용이며 실제 상황에<br /> 따라 다를 수 있습니다.</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Hospital Detail Overlay */}
            {selectedHospital && (
                <div className="absolute inset-0 z-[70] bg-white flex flex-col animate-in fade-in slide-in-from-bottom-10 duration-500">
                    <div className="px-6 h-16 flex items-center justify-between border-b border-slate-50">
                        <button onClick={() => setSelectedHospital(null)} className="p-2 -ml-2 text-slate-400 hover:text-slate-900 transition-colors">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <h1 className="text-sm font-black text-slate-900 uppercase tracking-widest">Hospital Details</h1>
                        <div className="w-10" />
                    </div>
                    <div className="flex-1 overflow-y-auto px-8 pt-12 pb-24 space-y-10">
                        <div className="space-y-6 text-center">
                            <div className="flex flex-col items-center gap-3">
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] bg-blue-50 px-3 py-1 rounded-full">{selectedHospital.distance}</span>
                                    <span className={`flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-sm border border-current/10 ${selectedHospital.statusColor}`}>
                                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                        {selectedHospital.operatingStatus}
                                    </span>
                                </div>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-tight break-keep px-4">{selectedHospital.name}</h2>
                                <p className="text-xs font-bold text-slate-400 leading-relaxed uppercase tracking-widest">{selectedHospital.category}</p>
                                <div className="flex items-center gap-1.5 pt-1">
                                    <div className="flex items-center">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <svg key={star} className={`w-4 h-4 ${star <= Math.floor(parseFloat(selectedHospital.rating)) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`} viewBox="0 0 24 24">
                                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                            </svg>
                                        ))}
                                    </div>
                                    <span className="text-sm font-black text-slate-900">{selectedHospital.rating}</span>
                                    <span className="text-[10px] font-bold text-slate-400 tracking-widest">({selectedHospital.reviewCount})</span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="p-6 bg-slate-50 rounded-[32px] space-y-4 border border-slate-100/50">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Address</p>
                                    <p className="text-base font-bold text-slate-700 leading-snug break-keep">{selectedHospital.address}</p>
                                </div>
                                <div className="w-full h-[1px] bg-slate-200/50" />
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Contact</p>
                                    <p className="text-xl font-black text-slate-700 tracking-tighter">{selectedHospital.phone}</p>
                                </div>
                            </div>
                        </div>
                        <div className="pt-4 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <a href={`https://map.kakao.com/link/to/${selectedHospital.name},${selectedHospital.lat},${selectedHospital.lng}`} target="_blank" rel="noopener noreferrer" className="block">
                                    <button className="w-full py-4 rounded-[24px] bg-blue-600 text-white text-xs font-black uppercase tracking-[0.1em] shadow-lg shadow-blue-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11" /></svg>
                                        <span>길 안내</span>
                                    </button>
                                </a>
                                <a href={selectedHospital.placeUrl} target="_blank" rel="noopener noreferrer" className="block">
                                    <button className="w-full py-4 rounded-[24px] bg-white border-2 border-slate-100 text-slate-900 text-xs font-black uppercase tracking-[0.1em] active:scale-[0.98] transition-all flex flex-col items-center justify-center gap-2">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
                                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                        </svg>
                                        <span>상세 정보</span>
                                    </button>
                                </a>
                            </div>
                            {selectedHospital.phone !== '번호 없음' && (
                                <a href={`tel:${selectedHospital.phone}`} className="block w-full">
                                    <button className="w-full py-5 rounded-[28px] bg-slate-900 text-white text-lg font-black uppercase tracking-[0.1em] shadow-2xl shadow-slate-200 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                        </svg>
                                        <span>전화 걸기</span>
                                    </button>
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function ResultPage() {
    return (
        <Suspense fallback={
            <div className="w-full h-screen bg-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-6">
                    <div className="w-16 h-16 border-2 border-[#4A90E2] border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">Loading AI Report</p>
                </div>
            </div>
        }>
            <ResultContent />
        </Suspense>
    );
}