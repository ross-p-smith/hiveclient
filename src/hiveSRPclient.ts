import axios from 'axios';

/// <reference path="amazon-user-pool-srp-client.d.ts" />
import { SRPClient, calculateSignature, getNowString } from 'amazon-user-pool-srp-client';
import { getMFACode } from './utils/question.js';

export type AuthenticationResult = {
    IdToken: string,
    RefreshToken: string,
    AccessToken: string
}

type AuthenticationConfiguration = {
    ChallengeName: string,
    ChallengeParameters: any,
    Session: any
}

//https://github.com/borisirota/amazon-user-pool-srp-client

export interface IAuthenticationService {
    login(email: string, password: string) : Promise<AuthenticationResult>;
    loginWithMFA(email: string, password: string) : Promise<AuthenticationResult>;
}
    
export class hiveSRPclient implements IAuthenticationService {
    CognitoUserPoolId: string = "SamNfoWtf";
    CognitoUserPoolUsers: string = "eu-west-1_SamNfoWtf";
    CognitoUserPoolClientWeb: string = "3rl4i0ajrmtdm8sbre54p9dvd9";
    CognitoIDP: string = "https://cognito-idp.eu-west-1.amazonaws.com";
    AuthenticationResult: AuthenticationResult = {} as AuthenticationResult;
    SRPClient: SRPClient = new SRPClient(this.CognitoUserPoolId);

    private async call(action: string, body: object) {
        const request = {
            url: this.CognitoIDP,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-amz-json-1.1',
                'X-Amz-Target': action
            },
            data: JSON.stringify(body),
            transformResponse: (data: any) => data
        }
    
        return axios(request)
        .then((result) => JSON.parse(result.data))
        .catch((error) => {
        const _err = JSON.parse(error.response.data)
        const err = new Error()
        err.message = _err.message
        return Promise.reject(err)
        })
    }

    private async initateAuth(email: string) {
        const SRP_A = this.SRPClient.calculateA()
        
        return this.call(`AWSCognitoIdentityProviderService.InitiateAuth`, {
            ClientId: this.CognitoUserPoolClientWeb,
            AuthFlow: 'USER_SRP_AUTH',
            AuthParameters: {
                USERNAME: email,
                SRP_A
            }
        })
    }

    private async VerifyPassword(password: string, authConfig: AuthenticationConfiguration) {
        const hkdf = this.SRPClient.getPasswordAuthenticationKey(
            authConfig.ChallengeParameters.USER_ID_FOR_SRP,
            password,
            authConfig.ChallengeParameters.SRP_B,
            authConfig.ChallengeParameters.SALT)
        const dateNow = getNowString()
        const signatureString = calculateSignature(hkdf,
            this.CognitoUserPoolId,
            authConfig.ChallengeParameters.USER_ID_FOR_SRP,
            authConfig.ChallengeParameters.SECRET_BLOCK,
            dateNow)

        return this.call('AWSCognitoIdentityProviderService.RespondToAuthChallenge', {
            ClientId: this.CognitoUserPoolClientWeb,
            ChallengeName: authConfig.ChallengeName,
            ChallengeResponses: {
                PASSWORD_CLAIM_SIGNATURE: signatureString,
                PASSWORD_CLAIM_SECRET_BLOCK: authConfig.ChallengeParameters.SECRET_BLOCK,
                TIMESTAMP: dateNow,
                USERNAME: authConfig.ChallengeParameters.USER_ID_FOR_SRP
            },
            Session: authConfig.Session
        })
    }

    private async CheckMFACode(email: string, Session: any) {
        let mfaCode = await getMFACode();
        if (mfaCode == null)
        {
            throw new Error("Error: Unable to get MFA code");
        }
        return this.call('AWSCognitoIdentityProviderService.RespondToAuthChallenge', {
            ClientId: this.CognitoUserPoolClientWeb,
            ChallengeName: 'SMS_MFA',
            ChallengeResponses: {
                USERNAME: email,
                SMS_MFA_CODE: mfaCode
            },
            Session
        })
    }

    public async loginWithMFA(email: string, password: string) : Promise<AuthenticationResult> {
        
        if (this.AuthenticationResult.IdToken != null) {
            return this.AuthenticationResult;
        }

        return this.initateAuth(email)
            .then(({ ChallengeName, ChallengeParameters, Session }) => {

                const authConfig: AuthenticationConfiguration = {
                    ChallengeName,
                    ChallengeParameters,
                    Session
                }

                if (ChallengeName === 'PASSWORD_VERIFIER') {
                    return this.VerifyPassword(password, authConfig)
                        .then(({ ChallengeName, ChallengeParameters, Session }) => {

                            return this.CheckMFACode(email, Session)
                                .then(({ AuthenticationResult }) => {
                                    this.AuthenticationResult = AuthenticationResult;
                                    return AuthenticationResult;
                                })
    
                        })
                }

                return null;
            })
    }

    public async login(email: string, password: string) : Promise<AuthenticationResult> {
        const userPoolId = this.CognitoUserPoolUsers.split('_')[1]
        const srp = new SRPClient(userPoolId)
        const SRP_A = srp.calculateA()
        
        const result = this.call(`AWSCognitoIdentityProviderService.InitiateAuth`, {
        ClientId: this.CognitoUserPoolClientWeb,
        AuthFlow: 'USER_SRP_AUTH',
        AuthParameters: {
            USERNAME: email,
            SRP_A
        }
        })
        .then(({ ChallengeName, ChallengeParameters, Session }) => {
        const hkdf = srp.getPasswordAuthenticationKey(ChallengeParameters.USER_ID_FOR_SRP, password, ChallengeParameters.SRP_B, ChallengeParameters.SALT)
        const dateNow = getNowString()
        const signatureString = calculateSignature(hkdf, userPoolId, ChallengeParameters.USER_ID_FOR_SRP, ChallengeParameters.SECRET_BLOCK, dateNow)
        return this.call('AWSCognitoIdentityProviderService.RespondToAuthChallenge', {
            ClientId: this.CognitoUserPoolClientWeb,
            ChallengeName,
            ChallengeResponses: {
                PASSWORD_CLAIM_SIGNATURE: signatureString,
                PASSWORD_CLAIM_SECRET_BLOCK: ChallengeParameters.SECRET_BLOCK,
                TIMESTAMP: dateNow,
                USERNAME: ChallengeParameters.USER_ID_FOR_SRP
            },
            Session
        })
            .then(({ AuthenticationResult }) => {
                    return AuthenticationResult;
                    })
        })

        return result;
    }  
}

const authClient: IAuthenticationService = new hiveSRPclient();
export default authClient;