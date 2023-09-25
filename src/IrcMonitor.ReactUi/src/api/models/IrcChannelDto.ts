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
 * @interface IrcChannelDto
 */
export interface IrcChannelDto {
    /**
     * 
     * @type {number}
     * @memberof IrcChannelDto
     */
    id?: number;
    /**
     * 
     * @type {string}
     * @memberof IrcChannelDto
     */
    guid?: string;
    /**
     * 
     * @type {string}
     * @memberof IrcChannelDto
     */
    name?: string;
    /**
     * 
     * @type {number}
     * @memberof IrcChannelDto
     */
    rowCount?: number;
}

/**
 * Check if a given object implements the IrcChannelDto interface.
 */
export function instanceOfIrcChannelDto(value: object): boolean {
    let isInstance = true;

    return isInstance;
}

export function IrcChannelDtoFromJSON(json: any): IrcChannelDto {
    return IrcChannelDtoFromJSONTyped(json, false);
}

export function IrcChannelDtoFromJSONTyped(json: any, ignoreDiscriminator: boolean): IrcChannelDto {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'id': !exists(json, 'id') ? undefined : json['id'],
        'guid': !exists(json, 'guid') ? undefined : json['guid'],
        'name': !exists(json, 'name') ? undefined : json['name'],
        'rowCount': !exists(json, 'rowCount') ? undefined : json['rowCount'],
    };
}

export function IrcChannelDtoToJSON(value?: IrcChannelDto | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'id': value.id,
        'guid': value.guid,
        'name': value.name,
        'rowCount': value.rowCount,
    };
}

