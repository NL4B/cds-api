const axios = require('axios')
const oauth = require('axios-oauth-client')
const xsenv = require('@sap/xsenv')


class scpDestinations {
    constructor(cfServiceName) {
        if (cfServiceName === undefined) {
            throw new Error(`CDSEDC: Destination service is not specified`);
        }
        this.cfServiceName = cfServiceName;
    }

    async readDestinationAsync(cfDestinationName) {
        try {
            const cfDestinationInfo = this.getCFDestinationService().destination
            const token = await this.getTokenForDestinationService(cfDestinationInfo)

            const destination = await axios.get(
                `${cfDestinationInfo.uri}/destination-configuration/v1/destinations/${cfDestinationName}`, {
                headers: {
                    'Authorization': `${token.token_type} ${token.access_token}`
                },
                responseType: 'json'
            }).catch(error => {
                console.log(error)
            })
            return destination
        } catch (error) {
            console.log(error)
        }
    }

    readDestination(cfDestinationName) {
        return new Promise(async (resolve, reject) => {
            const cfDestinationInfo = this.getCFDestinationService().destination
            this.getTokenForDestinationService(cfDestinationInfo)
                .then(token => {
                    return axios.get(
                        `${cfDestinationInfo.uri}/destination-configuration/v1/destinations/${cfDestinationName}`, {
                        headers: {
                            'Authorization': `${token.token_type} ${token.access_token}`
                        },
                        responseType: 'json'
                    })
                })
                .then(destination => {
                    resolve(destination)
                })
                .catch(error => {
                    console.log(error)
                    reject(error)
                })
        })
    }



    readSubAccountDestinationList() {
        return new Promise(async (resolve, reject) => {
            const cfDestinationInfo = this.getCFDestinationService().destination
            this.getTokenForDestinationService(cfDestinationInfo)
                .then(token => {
                    axios.get(
                        `${cfDestinationInfo.uri}/destination-configuration/v1/subaccountDestinations`, {
                        headers: {
                            'Authorization': `${token.token_type} ${token.access_token}`
                        },
                        responseType: 'json'
                    })
                        .then(destinationList => {
                            resolve(destinationList)
                        })
                        .catch(error => {
                            console.log(error)
                            reject(error)
                        })
                })
        })
    }

    async readSubAccountDestinationListAsync() {
        try {
            // const cfDestinationInfo = this.getCFDestinationService().destination
            // const token = await this.getTokenForDestinationService(cfDestinationInfo)

            // const destinationList = await axios.get(
            //     `${cfDestinationInfo.uri}/destination-configuration/v1/subaccountDestinations`, {
            //     headers: {
            //         'Authorization': `${token.token_type} ${token.access_token}`
            //     },
            //     responseType: 'json'
            // }).catch(error => {
            //     console.log(error)
            // })
            // return destinationList
            return await readSubAccountDestinationList()
        } catch (error) {
            console.log(error)
        }
    }


    getCFDestinationService() {
        const cfDestinationInfo = xsenv.getServices({
            destination: {
                tag: this.cfServiceName
            }
        });
        if (!cfDestinationInfo) {
            var error = {
                text: `No destination service '${cfServiceName}' found for CF`
            }
            console.log(error.text)
            throw (error.text)
        }
        return cfDestinationInfo
    }

    getTokenForDestinationService(cfDestinationInfo) {
        return new Promise(async (resolve, reject) => {
            const getToken = oauth.client(axios.create(), {
                url: `${cfDestinationInfo.url}/oauth/token`,
                grant_type: `client_credentials`,
                client_id: cfDestinationInfo.clientid,
                client_secret: cfDestinationInfo.clientsecret
            })
             getToken()
                .then(token => {
                    resolve( token)
                })
                .catch(error => {
                    console.log(error.text)
                    reject(error)
                });
        })
    }

    async getTokenForDestinationServiceAsync(cfDestinationInfo) {
        const getToken = oauth.client(axios.create(), {
            url: `${cfDestinationInfo.url}/oauth/token`,
            grant_type: `client_credentials`,
            client_id: cfDestinationInfo.clientid,
            client_secret: cfDestinationInfo.clientsecret
        })
        return await getToken().catch(error => {
            console.log(error.text)
            throw (error.text)
        });
    }



}

module.exports = scpDestinations;