import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios';
const username = import.meta.env.VITE_SERVICE_NOW_USERNAME;
const password = import.meta.env.VITE_SERVICE_NOW_PASSWORD;
const authString = `${username}:${password}`; 
class ApiBasicAuthService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await axios(config);
      return response.data;
    } catch (error: any) 
    {
    if(error?.response?.data)
    {
      throw error;
    }
      throw new Error(`Request failed: ${error}`);
    }
  }

  public async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const fullUrl = `${this.baseUrl}${url}`;
    const userName = localStorage.getItem("AuthType");
    const password = localStorage.getItem("Claims");
    const requestConfig: AxiosRequestConfig = {
      ...config,
      method: 'post',
      url: fullUrl,
        data: data,
      headers: { 
        "Authorization": `Basic ${btoa(authString)}` 
     }
    };

    return this.request<T>(requestConfig);
  }
  public async postNormal<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const fullUrl = `${this.baseUrl}${url}`;
    const authType = localStorage.getItem("AuthType");
    const claims = localStorage.getItem("Claims");
    const requestConfig: AxiosRequestConfig = {
      ...config,
      method: 'post',
      url: fullUrl,
        data: data,
      headers: { "Authorization": `Bearer ${localStorage.getItem("token")}`,
      "Authorization-Scheme": authType,
      "Claims" : claims
     }
    };

    return this.request<T>(requestConfig);
  }


}

export default ApiBasicAuthService;
