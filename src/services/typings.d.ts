declare namespace API {
  interface LogListItemData {
    logName: string;
  }

  interface ServiceFormItemData {
    name: string;
    ip: string;
    port: string;
    path: any;
  }

  interface ServiceTableItemData extends ServiceFormItemData {
    status: 1 | 2 | 3;
    id: number | string;
  }

  interface LoginData {
    access_token: string;
    expires_in?: string | null;
    token_type: string;
  }

  interface ResponseData<T = Record<string, unknown> | string | boolean> {
    code: number;
    message: string;
    data: T;
  }
}
