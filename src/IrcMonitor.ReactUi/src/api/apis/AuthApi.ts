/* tslint:disable */
/* eslint-disable */
/**
 * IrcMonitor API
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


import * as runtime from '../runtime';
import type {
  HandleGoogleLoginCommand,
  UserVm,
} from '../models';
import {
    HandleGoogleLoginCommandFromJSON,
    HandleGoogleLoginCommandToJSON,
    UserVmFromJSON,
    UserVmToJSON,
} from '../models';

export interface AuthGoogleAuthRequest {
    handleGoogleLoginCommand: HandleGoogleLoginCommand;
}

/**
 * 
 */
export class AuthApi extends runtime.BaseAPI {

    /**
     */
    async authGoogleAuthRaw(requestParameters: AuthGoogleAuthRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<UserVm>> {
        if (requestParameters.handleGoogleLoginCommand === null || requestParameters.handleGoogleLoginCommand === undefined) {
            throw new runtime.RequiredError('handleGoogleLoginCommand','Required parameter requestParameters.handleGoogleLoginCommand was null or undefined when calling authGoogleAuth.');
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["Authorization"] = this.configuration.apiKey("Authorization"); // JWT authentication
        }

        const response = await this.request({
            path: `/api/Auth/google`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: HandleGoogleLoginCommandToJSON(requestParameters.handleGoogleLoginCommand),
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => UserVmFromJSON(jsonValue));
    }

    /**
     */
    async authGoogleAuth(requestParameters: AuthGoogleAuthRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<UserVm> {
        const response = await this.authGoogleAuthRaw(requestParameters, initOverrides);
        return await response.value();
    }

}
