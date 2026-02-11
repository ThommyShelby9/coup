export default defineEventHandler(async (event) => {
  // Supprimer le cookie
  deleteCookie(event, 'auth-token')

  return {
    message: 'Déconnexion réussie'
  }
})
