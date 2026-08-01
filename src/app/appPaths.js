export function resolveServiceWorkerUrl(baseUrl = '/', origin = globalThis.location?.origin || '') {
    return new URL(`${baseUrl}sw.js`, origin).toString();
}

export function registerServiceWorker({
    baseUrl = import.meta.env.BASE_URL,
    origin = globalThis.location?.origin,
    serviceWorker = globalThis.navigator?.serviceWorker,
    logger = console,
} = {}) {
    if (!serviceWorker || !origin) return Promise.resolve(null);
    return serviceWorker
        .register(resolveServiceWorkerUrl(baseUrl, origin))
        .catch((err) => {
            logger.warn('Web Games service worker registration failed:', err);
            return null;
        });
}
