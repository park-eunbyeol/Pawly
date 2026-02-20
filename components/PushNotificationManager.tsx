"use client";

import { useEffect, useState } from "react";

export function usePushNotifications() {
    const [permission, setPermission] = useState<NotificationPermission>("default");
    const [notifications, setNotifications] = useState<any[]>([]);

    useEffect(() => {
        if ("Notification" in window) {
            setPermission(Notification.permission);
        }

        // 로컬 알림 내역 불러오기
        const saved = localStorage.getItem('pawly_notifications');
        if (saved) setNotifications(JSON.parse(saved));

        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register("/sw.js").then((registration) => {
                console.log("Service Worker registered with scope:", registration.scope);
            }).catch((err) => {
                console.error("Service Worker registration failed:", err);
            });
        }
    }, []);

    const saveNotification = (title: string, body: string) => {
        const newNoti = {
            id: Date.now(),
            title,
            body,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            read: false
        };
        const updated = [newNoti, ...notifications].slice(0, 10); // 최근 10개만 유지
        setNotifications(updated);
        localStorage.setItem('pawly_notifications', JSON.stringify(updated));
    };

    const requestPermission = async () => {
        if (!("Notification" in window)) return "default";
        const res = await Notification.requestPermission();
        setPermission(res);
        return res;
    };

    const showLocalNotification = (title: string, body: string, url: string = "/") => {
        // 알림 내역에 저장
        saveNotification(title, body);

        if (Notification.permission === "granted" && "serviceWorker" in navigator) {
            navigator.serviceWorker.ready.then((registration) => {
                registration.showNotification(title, {
                    body,
                    icon: "/logo.png",
                    badge: "/logo.png",
                    data: { url }
                });
            });
        }
    };

    const clearNotifications = () => {
        setNotifications([]);
        localStorage.removeItem('pawly_notifications');
    };

    return { permission, requestPermission, showLocalNotification, notifications, clearNotifications };
}

export default function PushNotificationManager() {
    const { permission, showLocalNotification } = usePushNotifications();

    // 자동 알림 체크 - 평생 딱 한 번 (혹은 매우 드물게) 요약 알림만 발송
    useEffect(() => {
        if (permission === 'granted') {
            const sendDailySummary = () => {
                // 매일 한 번씩 발송되도록 날짜를 키에 포함
                const summaryKey = `pawly_daily_summary_${new Date().toDateString()}`;

                if (localStorage.getItem(summaryKey)) return;

                const title = '🐾 Pawly 건강 브리핑';
                const body = '오늘의 심장사상충 예방(D-2) 등 주요 일정이 있습니다. 확인해 보세요!';

                setTimeout(() => {
                    showLocalNotification(title, body, '/diary');
                    localStorage.setItem(summaryKey, 'true');
                }, 3000);
            };

            sendDailySummary();
        }
    }, [permission, showLocalNotification]);

    return null;
}
