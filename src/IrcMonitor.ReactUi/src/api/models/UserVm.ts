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

import { exists, mapValues } from '../runtime';
/**
 * 
 * @export
 * @interface UserVm
 */
export interface UserVm {
    /**
     * 
     * @type {string}
     * @memberof UserVm
     */
    email: string;
    /**
     * 
     * @type {string}
     * @memberof UserVm
     */
    accessToken: string;
}

/**
 * Check if a given object implements the UserVm interface.
 */
export function instanceOfUserVm(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "email" in value;
    isInstance = isInstance && "accessToken" in value;

    return isInstance;
}

export function UserVmFromJSON(json: any): UserVm {
    return UserVmFromJSONTyped(json, false);
}

export function UserVmFromJSONTyped(json: any, ignoreDiscriminator: boolean): UserVm {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'email': json['email'],
        'accessToken': json['accessToken'],
    };
}

export function UserVmToJSON(value?: UserVm | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'email': value.email,
        'accessToken': value.accessToken,
    };
}

