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
  GetIrcRowsVm,
} from '../models';
import {
    GetIrcRowsVmFromJSON,
    GetIrcRowsVmToJSON,
} from '../models';

export interface IrcGetIrcRowsRequest {
    criteriaFrom?: Date | null;
    criteriaTo?: Date | null;
    criteriaChannelId?: number;
    criteriaPage?: number;
    criteriaPageSize?: number;
    criteriaSortColumn?: string | null;
    criteriaIsAscendingOrder?: boolean;
    criteriaSkipTotalRowCount?: boolean;
}

/**
 * 
 */
export class IrcApi extends runtime.BaseAPI {

    /**
     */
    async ircGetIrcRowsRaw(requestParameters: IrcGetIrcRowsRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<GetIrcRowsVm>> {
        const queryParameters: any = {};

        if (requestParameters.criteriaFrom !== undefined) {
            queryParameters['Criteria.From'] = (requestParameters.criteriaFrom as any).toISOString();
        }

        if (requestParameters.criteriaTo !== undefined) {
            queryParameters['Criteria.To'] = (requestParameters.criteriaTo as any).toISOString();
        }

        if (requestParameters.criteriaChannelId !== undefined) {
            queryParameters['Criteria.ChannelId'] = requestParameters.criteriaChannelId;
        }

        if (requestParameters.criteriaPage !== undefined) {
            queryParameters['Criteria.Page'] = requestParameters.criteriaPage;
        }

        if (requestParameters.criteriaPageSize !== undefined) {
            queryParameters['Criteria.PageSize'] = requestParameters.criteriaPageSize;
        }

        if (requestParameters.criteriaSortColumn !== undefined) {
            queryParameters['Criteria.SortColumn'] = requestParameters.criteriaSortColumn;
        }

        if (requestParameters.criteriaIsAscendingOrder !== undefined) {
            queryParameters['Criteria.IsAscendingOrder'] = requestParameters.criteriaIsAscendingOrder;
        }

        if (requestParameters.criteriaSkipTotalRowCount !== undefined) {
            queryParameters['Criteria.SkipTotalRowCount'] = requestParameters.criteriaSkipTotalRowCount;
        }

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["Authorization"] = this.configuration.apiKey("Authorization"); // JWT authentication
        }

        const response = await this.request({
            path: `/api/Irc/rows`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => GetIrcRowsVmFromJSON(jsonValue));
    }

    /**
     */
    async ircGetIrcRows(requestParameters: IrcGetIrcRowsRequest = {}, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<GetIrcRowsVm> {
        const response = await this.ircGetIrcRowsRaw(requestParameters, initOverrides);
        return await response.value();
    }

}
