const sendSignedRequest = require('../sendSignedRequest')
const config = require('../../../config')
const toAgreement = require('../toAgreement')

const sendRefresh = (registration) =>
  sendSignedRequest({
    resource: 'reg',
    agreement: registration.agreement
  }, registration.keypair, registration.location)

const checkRefresh = (registration) => (data) => {
  const refreshedAgreement = toAgreement(data.header['link'])
  return ((registration.agreement !== refreshedAgreement.agreement)
    ? refreshRegistration({
      keypair: registration.keypair,
      location: registration.location,
      agreement: refreshedAgreement.agreement
    })
    : Promise.resolve({
      keypair: registration.keypair,
      location: registration.location,
      agreement: registration.agreement
    }))
}

const refreshRegistration = (registration) => //NOSONAR
  sendRefresh(registration)
  .then(checkRefresh(registration))

const register = regUrl => keypair =>
  sendSignedRequest({
    resource: 'new-reg',
    contact: [ `mailto:${config['acme-account-email']}` ]
  }, keypair, regUrl)
  .then(data =>
    refreshRegistration(
      Object.assign({
        keypair: keypair,
        location: data.header['location']
      },
      toAgreement(data.header['link']))
    )
  )

module.exports = register
