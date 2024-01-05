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
import type { BarChartReturnModel } from './BarChartReturnModel';
import {
    BarChartReturnModelFromJSON,
    BarChartReturnModelFromJSONTyped,
    BarChartReturnModelToJSON,
} from './BarChartReturnModel';

/**
 * 
 * @export
 * @interface StatisticsVmBase
 */
export interface StatisticsVmBase {
    /**
     * 
     * @type {BarChartReturnModel}
     * @memberof StatisticsVmBase
     */
    rows: BarChartReturnModel;
    /**
     * 
     * @type {string}
     * @memberof StatisticsVmBase
     */
    channelId: string;
    /**
     * 
     * @type {number}
     * @memberof StatisticsVmBase
     */
    year?: number | null;
}

/**
 * Check if a given object implements the StatisticsVmBase interface.
 */
export function instanceOfStatisticsVmBase(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "rows" in value;
    isInstance = isInstance && "channelId" in value;

    return isInstance;
}

export function StatisticsVmBaseFromJSON(json: any): StatisticsVmBase {
    return StatisticsVmBaseFromJSONTyped(json, false);
}

export function StatisticsVmBaseFromJSONTyped(json: any, ignoreDiscriminator: boolean): StatisticsVmBase {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'rows': BarChartReturnModelFromJSON(json['rows']),
        'channelId': json['channelId'],
        'year': !exists(json, 'year') ? undefined : json['year'],
    };
}

export function StatisticsVmBaseToJSON(value?: StatisticsVmBase | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'rows': BarChartReturnModelToJSON(value.rows),
        'channelId': value.channelId,
        'year': value.year,
    };
}

