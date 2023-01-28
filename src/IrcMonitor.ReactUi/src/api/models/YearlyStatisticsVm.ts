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
import type { BarChartRow } from './BarChartRow';
import {
    BarChartRowFromJSON,
    BarChartRowFromJSONTyped,
    BarChartRowToJSON,
} from './BarChartRow';

/**
 * 
 * @export
 * @interface YearlyStatisticsVm
 */
export interface YearlyStatisticsVm {
    /**
     * 
     * @type {Array<BarChartRow>}
     * @memberof YearlyStatisticsVm
     */
    monthlyRows?: Array<BarChartRow>;
    /**
     * 
     * @type {Array<BarChartRow>}
     * @memberof YearlyStatisticsVm
     */
    hourlyRows?: Array<BarChartRow>;
    /**
     * 
     * @type {string}
     * @memberof YearlyStatisticsVm
     */
    channel?: string;
    /**
     * 
     * @type {number}
     * @memberof YearlyStatisticsVm
     */
    year?: number;
}

/**
 * Check if a given object implements the YearlyStatisticsVm interface.
 */
export function instanceOfYearlyStatisticsVm(value: object): boolean {
    let isInstance = true;

    return isInstance;
}

export function YearlyStatisticsVmFromJSON(json: any): YearlyStatisticsVm {
    return YearlyStatisticsVmFromJSONTyped(json, false);
}

export function YearlyStatisticsVmFromJSONTyped(json: any, ignoreDiscriminator: boolean): YearlyStatisticsVm {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'monthlyRows': !exists(json, 'monthlyRows') ? undefined : ((json['monthlyRows'] as Array<any>).map(BarChartRowFromJSON)),
        'hourlyRows': !exists(json, 'hourlyRows') ? undefined : ((json['hourlyRows'] as Array<any>).map(BarChartRowFromJSON)),
        'channel': !exists(json, 'channel') ? undefined : json['channel'],
        'year': !exists(json, 'year') ? undefined : json['year'],
    };
}

export function YearlyStatisticsVmToJSON(value?: YearlyStatisticsVm | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'monthlyRows': value.monthlyRows === undefined ? undefined : ((value.monthlyRows as Array<any>).map(BarChartRowToJSON)),
        'hourlyRows': value.hourlyRows === undefined ? undefined : ((value.hourlyRows as Array<any>).map(BarChartRowToJSON)),
        'channel': value.channel,
        'year': value.year,
    };
}
