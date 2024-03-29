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
 * @interface YearlyStatisticsVmAllOf
 */
export interface YearlyStatisticsVmAllOf {
    /**
     * 
     * @type {string}
     * @memberof YearlyStatisticsVmAllOf
     */
    channel?: string;
}

/**
 * Check if a given object implements the YearlyStatisticsVmAllOf interface.
 */
export function instanceOfYearlyStatisticsVmAllOf(value: object): boolean {
    let isInstance = true;

    return isInstance;
}

export function YearlyStatisticsVmAllOfFromJSON(json: any): YearlyStatisticsVmAllOf {
    return YearlyStatisticsVmAllOfFromJSONTyped(json, false);
}

export function YearlyStatisticsVmAllOfFromJSONTyped(json: any, ignoreDiscriminator: boolean): YearlyStatisticsVmAllOf {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'channel': !exists(json, 'channel') ? undefined : json['channel'],
    };
}

export function YearlyStatisticsVmAllOfToJSON(value?: YearlyStatisticsVmAllOf | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'channel': value.channel,
    };
}

