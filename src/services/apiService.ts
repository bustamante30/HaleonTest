import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios';

class ApiService {
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

    public async get<T>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> {

    const fullUrl = `${this.baseUrl}${url}`;
    const authType = localStorage.getItem("AuthType");
    const claims = localStorage.getItem("Claims");
    const requestConfig: AxiosRequestConfig = {
      ...config,
      method: 'get',
      url: fullUrl,   
      headers: {"Authorization" : `Bearer ${localStorage.getItem("token")}`,
      "Authorization-Scheme": authType,
      "Claims" : claims
    }
    };
      if (params) {
          requestConfig.params = params
        }
    return this.request<T>(requestConfig);
  }

  public async post<T>(
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

  public async delete<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const fullUrl = `${this.baseUrl}${url}`;
    const authType = localStorage.getItem("AuthType");
    const claims = localStorage.getItem("Claims");
    const requestConfig: AxiosRequestConfig = {
      ...config,
      method: 'delete',
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

export default ApiService;
