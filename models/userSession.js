class UserSession {
  constructor(oldUserSession) {
    this.email = oldUserSession.email || {}
    this.country = oldUserSession.country || {}
    this.firstName = oldUserSession.firstName || {}
    this.lastName = oldUserSession.lastName || {}
    this.company = oldUserSession.company || {}
    this.street = oldUserSession.street || {}
    this.apt = oldUserSession.apt || {}
    this.postalcode = oldUserSession.postalcode || {}
    this.check_sign_in = oldUserSession.check_sign_in || {}
    this.phone = oldUserSession.phone || {}
  }
}

module.exports = {
  UserSession,
}
