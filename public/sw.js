self.addEventListener('push', function (event) {
  let data = {}
  try {
    data = event.data.json()
  } catch (e) {}
  const title = data.title || 'Book Club'
  const options = {
    body: data.body || '',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
  }
  event.waitUntil(self.registration.showNotification(title, options))
})
