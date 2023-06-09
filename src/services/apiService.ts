import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { useAuthStore } from "../stores/auth";

class ApiService {
  private baseUrl: string;
  private authStore;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await axios(config);
      return response.data;
    } catch (error) {
      throw new Error(`Request failed: ${error.message}`);
    }
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {

    const fullUrl = `${this.baseUrl}${url}`;
    const requestConfig: AxiosRequestConfig = {
      ...config,
      method: 'get',
      url: fullUrl,
     // headers: {"Authorization" : `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Ii1LSTNROW5OUjdiUm9meG1lWm9YcWJIWkdldyIsImtpZCI6Ii1LSTNROW5OUjdiUm9meG1lWm9YcWJIWkdldyJ9.eyJhdWQiOiJhcGk6Ly9hZGQwYzVjZC1jM2E4LTQ0ZmEtODE2MS1hYzYyNTBlN2ExOWEiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC84NzE0YTIxNi0wNDQ1LTQyNjktYjk2Yi03ZDg0YmRkYjZkYTEvIiwiaWF0IjoxNjg2MjQ2MDU1LCJuYmYiOjE2ODYyNDYwNTUsImV4cCI6MTY4NjI1MDc2MCwiYWNyIjoiMSIsImFpbyI6IkFWUUFxLzhUQUFBQTArUEZ2aXJJR2hFdE9CSlRIQU5mb1ZXUEYvbXVNTnB2Q0VsTWJhM0NjVFFCNGdDRzVNaHBaK1dTUGIrc3psMGptb3NnT2N1bmVRVUFyYkM0V1NUUEVFcjgrMzN4eG43cGhVRFI3blpSRnNrPSIsImFtciI6WyJwd2QiLCJtZmEiXSwiYXBwaWQiOiJhYzQ1Yjc0YS0yY2QxLTQ5ZjktYjE5Mi1lOTY1ZTVkM2ViZmEiLCJhcHBpZGFjciI6IjAiLCJmYW1pbHlfbmFtZSI6IlNoYW5iYWdoIiwiZ2l2ZW5fbmFtZSI6Ikt1bmFsIiwiaXBhZGRyIjoiMTU0LjgxLjIxNi40NCIsIm5hbWUiOiJLdW5hbCBTaGFuYmFnaCAtIENvbnRyYWN0b3IiLCJvaWQiOiJhNzNiYzZkZC0yMDM3LTQxZTMtYTc3Yi0zYThiNzllZWRmYWIiLCJvbnByZW1fc2lkIjoiUy0xLTUtMjEtMzU1MTM4MTcwLTE2OTk0ODU1MzUtMjc4MTE5MDU5OS0xMDg3MTciLCJyaCI6IjAuQVVZQUZxSVVoMFVFYVVLNWEzMkV2ZHR0b2MzRjBLMm93X3BFZ1dHc1lsRG5vWnE4QU4wLiIsInNjcCI6ImFjY2Vzc19hc191c2VyIiwic3ViIjoiaFFwRHUtSXlNRUVzdlZOemNoSWNVZy1rbW5iVFFyTmhyMDRlYUxpamZwbyIsInRpZCI6Ijg3MTRhMjE2LTA0NDUtNDI2OS1iOTZiLTdkODRiZGRiNmRhMSIsInVuaXF1ZV9uYW1lIjoia3VuYWwuc2hhbmJhZ2gtQ09OVFJBQ1RPUkBzZ3Njby5jb20iLCJ1cG4iOiJrdW5hbC5zaGFuYmFnaC1DT05UUkFDVE9SQHNnc2NvLmNvbSIsInV0aSI6IkY0NjJ2WTFtM2tLbnVWd0hYek1kQUEiLCJ2ZXIiOiIxLjAifQ.ervGuUvpFRMYFnXX-TE4p_5B_8WIlQK4EYWqMVhTPikLLJlkLQkBSl6rJW649gB6A-HS6lrJXajt6S4jthr6eLQBsugmBaO-sRdvwqWILIuE4kLrEfOO7jGk0vayu61Cud1vYtheQLRJ_r2cnMNvbSEaV7h6kQ-5jfHy8zxum4_ufC8y1VaMPIwha14_eB6uCgEdXNjaKAlvXEwoh6nk62dp9UfgcnVOpkED_UXiLHHyCi1nqtFm7NXFpEMCcfmHsdOZvyLuZvciUDGJKYS_rssnF4dIMLK1BAcO9KcTUL8HIPkt8C4w1O_b2BdHZ1FVlfHTTH3gdBsdY3H_lboA8A`}
      
      headers: {"Authorization" : `Bearer ${localStorage.getItem("token")}`}
    };

    return this.request<T>(requestConfig);
  }

  public async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const fullUrl = `${this.baseUrl}${url}`;
    const requestConfig: AxiosRequestConfig = {
      ...config,
      method: 'post',
      url: fullUrl,
      data: data,
    };

    return this.request<T>(requestConfig);
  }

}

export default ApiService;
