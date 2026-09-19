export const API_URL = process.env.NEXT_PUBLIC_APIURL;
if (!API_URL) {
    throw new Error("NEXT_PUBLIC_APIURL is not defined");

}
export const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_APIURL || 'http://localhost:3001';