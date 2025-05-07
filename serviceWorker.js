const staticGreenTea = "grn-tea-site-v1"
const assets = [
    "/",
    "/app/templates/admin_dashboard.html",
    "/app/templates/admin_login.html",
    "/app/templates/admin_register.html",
    "/app/templates/cart.html",
    "/app/templates/contact.html",
    "/app/templates/index.html",
    "/app/templates/items.html",
    "/app/templates/orders.html",
    "/app/templates/shop.html",
    "/app/static/js/admin_login.js",
    "/app/static/js/client.js",
    "/app/static/js/orders.js",
    "/app/static/js/shop.js",
    "/app/static/js/tea-management.js",
    "/app/static/css/style.css",
    "/app/static/images/about-img.jpg",
    "/app/static/images/background.jpg",
    "/app/static/images/delete.jpg",
    "/app/static/images/edit.png",
    "/app/static/images/log.png",
    "/app/static/images/placeholder.jpg",
    "/app/static/images/tea-1.jpg",
    "/app/static/images/tea-2.jpg",
    "/app/static/images/tea-3.jpg",
    "/app/static/images/tea-4.jpg",
    "/app/static/images/tea-5.jpg",
    "/app/static/images/tea-6.jpg",
    "/app/static/images/tea-7.jpg",
    "/app/static/images/tea-8.jpg"

]

self.addEventListener("install", installEvent => {
    installEvent.waitUntil(
        caches.open(staticGreenTea).then(cache => {
            cache.addAll(assets)
        })
    )
})

self.addEventListener("fetch", fetchEvent=> {
    fetchEvent.respondWith(
        caches.match(fetchEvent.request).then(res=>{
            return res || fetch(fetchEvent.request)
        })
    )
})