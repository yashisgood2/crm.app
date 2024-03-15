//convert javascript object to url query string
export function objectToQueryString(obj: any) {
    const queryParams = [];
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((item) => {
              queryParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(item)}`);
            });
          } else {
            queryParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
          }
        }
      }
    }
    return queryParams.join('&');
    }