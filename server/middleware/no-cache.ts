/**
 * Middleware global pour désactiver TOUT cache sur les requêtes API
 */
export default defineEventHandler((event) => {
  const path = event.path || event.node.req.url

  // Appliquer no-cache à toutes les routes API
  if (path?.startsWith('/api/')) {
    setHeaders(event, {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store'
    })
  }
})
