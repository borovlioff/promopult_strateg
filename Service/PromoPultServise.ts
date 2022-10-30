import axios from "axios";
import { GetProjectsResponse, IKewordsStopResponse, IUser, KeywordStatResponse, TargetResponse } from "../types";


export default class PromoPultService{
    constructor(
        private _user:IUser,
    ){}

    
   
    async getProjects() {
        try {
            const projects = await axios.get<GetProjectsResponse>("https://api.promopult.ru/V0/projects?type=SEO,PPC",{
                headers:{
                    "X-Auth-Token": this._user.token
                }
            });
            return projects.data
        } catch (error) {
            console.log(error)
        }

    }

    async getTargets({ keywordsId, projectId }: { keywordsId: number[], projectId: number, }) {
        try {
            return (await axios.post<TargetResponse>(`https://promopult.ru/ppc/items/${projectId}/getKeywordAchievements`, {
                "from": null,
                "till": null,
                "ids": keywordsId,
                "activeTab": "DIRECT"
            },
                {
                    headers: {
                        Cookie: this._user.session,
                        "Content-Type": "application/json"
                    }
                }
            )).data.data
        } catch (error) {
            console.log(error)
        }
    }

    async getKeywordsStat({ projectId }: { projectId: number }) {
        try {
            return (await axios.post<KeywordStatResponse>(`https://promopult.ru/ppc/Step4/statisticsKeywords/${projectId}`, {
                "market": "DIRECT",
                "source": "SOURCE_ALL",
                "from": null,
                "till": null
            }, {
                headers: {
                    Cookie: this._user.session,
                    "Content-Type": "application/json"
                }
            })).data.data;
        } catch (error) {
            console.log(error)
        }
    }

    async stopKeywords({ projectId, keywordsId }: { projectId: number, keywordsId: number[] }) {
        try {
            return (await axios.post<IKewordsStopResponse>(`https://promopult.ru/ppc/items/${projectId}/step4/groupActions/stop`, {
                "keywords": keywordsId,
                "market": "DIRECT"
            }, {
                headers: {
                    Cookie: this._user.session,
                    "Content-Type": "application/json"
                }
            })).data;
        } catch (error) {
            console.log(error)
        }
    }

    async stopKeywordsByCPA({ projectId, cpa }: { projectId: number, cpa: number }) {
        let keywords = await this.getKeywordsStat({ projectId: projectId });

        let keywordsStop = [];
        if (keywords) {
            let targets = await this.getTargets({
                keywordsId: keywords.map((key) => (key.id)),
                projectId: projectId
            })

            if (targets) {
                for (let i = 0; i < keywords.length; i++) {
                    let keyword = keywords[i];
                    let target = targets[keyword.id];

                    if (keyword.stat.loss > cpa) {

                        if (target.total == 0 || keyword.stat.loss / target.total > cpa) {
                            if (target.total == 0) {
                                keyword.stat.cpa = 0;
                            } else {
                                keyword.stat.cpa = keyword.stat.loss / target.total;
                            }

                            keyword.stat.target = target;
                            keywordsStop.push(keyword);
                        }
                    }

                }
            }
            return await this.stopKeywords({ projectId: projectId, keywordsId: keywordsStop.map(key => (key.id)) });

        }
    }
}