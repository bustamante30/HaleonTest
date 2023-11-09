import ApiService from "../services/apiService";
import * as Constants from "./Constants";

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? Constants.API_LOCAL_URL;

const httpService = new ApiService(baseUrl);

export type FileUploadResponse = {
  status: string;
  uri: string;
};

export type FileDelete = {
  isSendToPm?: boolean;
  isRedorder?: boolean;
  uri: string;
};
export class FileUploadService {
  public static uploadFile(formdata: FormData) {
    return httpService
      .post<FileUploadResponse>("v1/FileUpload", formdata, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response: FileUploadResponse) => {
        return response;
      })
      .catch((error) => {
        console.error("[Error submitting files]:", error);
        return { status: "Failed", uri: "" };
      });
  }

  public static deleteFilesToBlobStorage(deleteRequest: FileDelete) {
    return httpService
      .delete<boolean>("v1/FileDelete", deleteRequest)
      .then((response: boolean) => {
        return response;
      })
      .catch((error) => {
        console.error("[Error deleting files]:", error);
        return false;
      });
  }

  public static getDemoVideo() {
    return httpService
      .get("v1/GetDemoVideo")
      .then((response) => {
        return response;
      })
      .catch((error) => {
        console.error("[Error in getting files]:", error);
        return false;
      });
  }
}
