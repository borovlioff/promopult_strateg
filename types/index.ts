export interface GetProjectsResponse{response:{
    items: {
    id: number,
        type: "PPC"|"SEO",
        name: string,
        host: string,
        url: string,
        createdDate: Date,
        regionId: number,
        loss: {
            month: number
        }}[]
}};

export  type UpdateTokenResoponse = string;

export interface IUser{
  id?:number;
  session:string;
  token?:string;
  creatDate?:Date;
  updateDate?:Date;
}

export type IUsers = IUser[];


export interface TargetResponse {
    code: string,
    message: string,
    errors: [],
    data: { [key: number]: Target }
  }
  
  export interface Target {
    total: number,
    stats: {
      [key: number]: number
    }
  }
  
  
  export interface KeywordStatResponse {
    code: string;
    message: string;
    errors: [],
    data: IKeywordStat[]
  }
  
  export interface IKeywordStat {
    id: number;
    DIRECT: {
      synced: boolean
    };
    ADWORDS: {
      synced: boolean
    };
    markers: {};
    value: string;
    stat: {
      shows: number;
      clicks: number;
      loss: number;
      visits: number;
      denial: number;
      depth: number;
      time: number;
      cpa?: number;
      target?: Target
    }
  }
  
  
  export interface IKewordsStopResponse {
    code: string,
    message: string,
    errors: [],
    data: {
      error?: {
        code: string,
        message: string
      }
      updated?: {
        id:number
        value:string
      }[];
    }
  }
  

