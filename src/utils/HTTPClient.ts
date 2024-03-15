import APiUtility from "./ApiUtility";
import { objectToQueryString } from "./utils";

    export const HTTPClient = {
        get : async (url: string, queryObject: any = {}) => await APiUtility.get(Object.keys(queryObject).length > 0 ?
            url + "?" + objectToQueryString(queryObject)
            : url),
        post : async (url: string, body: any, queryObject: any = {}) => await APiUtility.post(Object.keys(queryObject).length > 0 ?
            url + "?" + objectToQueryString(queryObject)
            : url, body) 
    }