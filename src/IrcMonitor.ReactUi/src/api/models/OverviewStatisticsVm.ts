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
 * @interface OverviewStatisticsVm
 */
export interface OverviewStatisticsVm {
    /**
     * 
     * @type {BarChartReturnModel}
     * @memberof OverviewStatisticsVm
     */
    rows: BarChartReturnModel;
    /**
     * 
     * @type {string}
     * @memberof OverviewStatisticsVm
     */
    channelId: string;
    /**
     * 
     * @type {number}
     * @memberof OverviewStatisticsVm
     */
    year?: number | null;
    /**
     * 
     * @type {string}
     * @memberof OverviewStatisticsVm
     */
    channelName: string;
}

/**
 * Check if a given object implements the OverviewStatisticsVm interface.
 */
export function instanceOfOverviewStatisticsVm(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "rows" in value;
    isInstance = isInstance && "channelId" in value;
    isInstance = isInstance && "channelName" in value;

    return isInstance;
}

export function OverviewStatisticsVmFromJSON(json: any): OverviewStatisticsVm {
    return OverviewStatisticsVmFromJSONTyped(json, false);
}

export function OverviewStatisticsVmFromJSONTyped(json: any, ignoreDiscriminator: boolean): OverviewStatisticsVm {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'rows': BarChartReturnModelFromJSON(json['rows']),
        'channelId': json['channelId'],
        'year': !exists(json, 'year') ? undefined : json['year'],
        'channelName': json['channelName'],
    };
}

export function OverviewStatisticsVmToJSON(value?: OverviewStatisticsVm | null): any {
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
        'channelName': value.channelName,
    };
}

