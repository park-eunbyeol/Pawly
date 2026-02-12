self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : { title: 'Pawly', body: '새로운 알림이 도착했습니다.' };

    const options = {
        body: data.body,
        icon: '/logo.png', // 로고 경로 확인 필요
        badge: '/logo.png',
        vibrate: [100, 50, 100],
        data: {
            url: data.url || '/'
        }
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});
