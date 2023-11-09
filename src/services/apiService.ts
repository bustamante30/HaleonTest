/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, {
  type AxiosRequestConfig,
  type AxiosResponse,
  type CancelTokenSource,
} from "axios";

interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  headers: any;
}

class ApiService {
  private baseUrl: string;
  private cancelTokenSource: CancelTokenSource | null = null;
  private previousRequestConfig: AxiosRequestConfig | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.initializeInterceptors();
  }

  private initializeInterceptors() {
    axios.interceptors.request.use((config: ExtendedAxiosRequestConfig) => {
      const authType = localStorage.getItem("AuthType");
      const claims = localStorage.getItem("Claims");
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Authorization-Scheme": authType,
        Claims: claims,
      };
      return config;
    });

    axios.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        return Promise.reject(error);
      },
    );
  }

  private async request<T>(
    config: AxiosRequestConfig,
    cancelRequest = false,
  ): Promise<T> {
    try {
      if (cancelRequest && this.previousRequestConfig) {
        const { method: previousMethod, url: previousUrl } =
          this.previousRequestConfig;
        const { method, url } = config;
        if (
          this.cancelTokenSource &&
          previousMethod === method &&
          previousUrl === url
        ) {
          this.cancelTokenSource.cancel("Request canceled by the user");
        }
      }
      this.cancelTokenSource = axios.CancelToken.source();
      config.cancelToken = this.cancelTokenSource.token;
      this.previousRequestConfig = config;
      const response: AxiosResponse<T> = await axios(config);
      return response?.data;
    } catch (error: any) {
      if (axios.isCancel(error)) {
        console.log("Request canceled:", error.message);
        return Promise.reject("Request canceled by the user");
      } else if (error?.response?.data) {
        return error?.response?.data;
      } else {
        throw new Error(`Request failed: ${error}`);
      }
    }
  }

  public async get<T>(
    url: string,
    params?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const fullUrl = `${this.baseUrl}${url}`;
    const requestConfig: AxiosRequestConfig = {
      ...config,
      method: "get",
      url: fullUrl,
      params: params,
    };
    return this.request<T>(requestConfig);
  }

  public async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
    cancelRequest = false,
  ): Promise<T> {
    const fullUrl = `${this.baseUrl}${url}`;
    const requestConfig: AxiosRequestConfig = {
      ...config,
      method: "post",
      url: fullUrl,
      data: data,
    };

    return this.request<T>(requestConfig, cancelRequest);
  }

  public async delete<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const fullUrl = `${this.baseUrl}${url}`;
    const requestConfig: AxiosRequestConfig = {
      ...config,
      method: "delete",
      url: fullUrl,
      data: data,
    };

    return this.request<T>(requestConfig);
  }
}

export default ApiService;
