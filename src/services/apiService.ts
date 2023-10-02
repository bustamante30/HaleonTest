import axios, { type AxiosRequestConfig, type AxiosResponse, type CancelTokenSource } from 'axios';

class ApiService {
  private baseUrl: string;
  private cancelTokenSource: CancelTokenSource | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(config: AxiosRequestConfig, cancelRequest: boolean = false): Promise<T> {
    try {
      if (cancelRequest) {
        // Cancel the previous request if it's in progress
        if (this.cancelTokenSource) {
          this.cancelTokenSource.cancel('Request canceled by the user');
        }
      }
      // Create a new cancel token source
      this.cancelTokenSource = axios.CancelToken.source();
      // Attach the cancel token to the request configuration
      config.cancelToken = this.cancelTokenSource.token;

      const response: AxiosResponse<T> = await axios(config);
      return response?.data;
    } catch (error: any) {
      if (axios.isCancel(error)) {
        console.log('Request canceled:', error.message);
        return Promise.reject('Request canceled by the user');
      } else if (error?.response?.data) {
        throw error;
      } else {
        throw new Error(`Request failed: ${error}`);
      }
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
    config?: AxiosRequestConfig,
    cancelRequest: boolean = false
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

    return this.request<T>(requestConfig, cancelRequest);
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
