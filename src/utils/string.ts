/**
 * Build a Url removing multiple slashes and trailing slash.
 *
 * @example
 * buildUrl('http://localhost:3000', 'api', 'v1', 'users', '1') // http://localhost:3000/api/v1/users/1
 * buildUrl('http://localhost:3000/', '//api/', '/v1/', '///users///', '//1////') // http://localhost:3000/api/v1/users/1
 *
 * buildUrl('google.com', 'searchText') // google.com/searchText
 * buildUrl('google.com', '/searchText') // google.com/searchText
 * buildUrl('google.com/', '/searchText') // google.com/searchText
 * buildUrl('//google.com/', '/searchText') // //google.com/searchText
 * buildUrl('https://google.com/', '/searchText') //  https://google.com/searchText
 * buildUrl('http://google.com/', '/searchText') // http://google.com/searchText
 * buildUrl("http://google.com/", "/searchText?redirectUrl=https://google.com"); // http://google.com/searchText?redirectUrl=https://google.com
 */
export const buildUrl = (...routes: Array<string>) => {
  return routes
    .join("/")
    .replace(/(https?:\/\/|^\/\/)|(\/)+/g, "$1$2") // remove double slashes
    .replace(/\/+$/, ""); // remove trailing slash
};
