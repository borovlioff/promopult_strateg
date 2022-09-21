import { launch, Page, Protocol } from 'puppeteer';
import axios from 'axios';

const projects = [
  11617647,
  11617666,
  11668785,
  11684019,
  11689733,
  11690427
];



(async () => {
  const browser = await launch({ headless: true });
  const page = await browser.newPage();



  let cookies = cookieJsonToString(await sigin({ login: "", password: "", page: page }));

  for(let projectID of projects){
    await stopKeywordsByCPA({projectId:projectID, cookies:cookies, cpa:300});
  }
  

  console.log("End")
})();

async function sigin({ page, login, password }: { login: string, password: string, page: Page }) {
  await page.goto('https://promopult.ru/user.html');
  await page.waitForSelector('input[name="uname"]');
  await page.type('input[name=uname]', login);
  await page.type('input[name=pass]', password);
  await page.click(`#user_form input[type=submit]`);
  await page.waitForNavigation();
  return page.cookies();
}

function cookieJsonToString(cookies: Protocol.Network.Cookie[]) {
  return cookies.map(cookie => (`${cookie.name}=${cookie.value}`)).join("; ");
}

interface TargetResponse {
  code: string,
  message: string,
  errors: [],
  data: {[key:number]:Target}
}

interface Target {
    total: number,
    stats: {
      [key: number]: number
    }
}

async function getTargets({ keywordsId, projectId, cookies }: { keywordsId: number[], projectId: number, cookies: string }) {
  try {
    return (await axios.post<TargetResponse>(`https://promopult.ru/ppc/items/${projectId}/getKeywordAchievements`, {
      "from": null,
      "till": null,
      "ids": keywordsId,
      "activeTab": "DIRECT"
    },
      {
        headers: {
          Cookie: cookies,
          "Content-Type": "application/json"
        }
      }
    )).data.data
  } catch (error) {
    console.log(error)
  }
}

interface KeywordStatResponse {
  code: string;
  message: string;
  errors: [],
  data: IKeywordStat[]
}

interface IKeywordStat {
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

async function getKeywordsStat({ projectId, cookies }: { projectId: number, cookies: string }) {
  try {
    return (await axios.post<KeywordStatResponse>(`https://promopult.ru/ppc/Step4/statisticsKeywords/${projectId}`, {
      "market": "DIRECT",
      "source": "SOURCE_ALL",
      "from": null,
      "till": null
    }, {
      headers: {
        Cookie: cookies,
        "Content-Type": "application/json"
      }
    })).data.data;
  } catch (error) {
    console.log(error)
  }
}

async function stopKeywords({ projectId, cookies, keywordsId }: { projectId: number, cookies: string, keywordsId:number[] }){
  try {
    return (await axios.post(`https://promopult.ru/ppc/items/${projectId}/step4/groupActions/stop`, {
      "keywords": keywordsId,
      "market": "DIRECT"
  }, {
      headers: {
        Cookie: cookies,
        "Content-Type": "application/json"
      }
    })).data.data;
  } catch (error) {
    console.log(error)
  }
}

async function stopKeywordsByCPA({ projectId, cookies, cpa }: { projectId: number, cookies: string, cpa:number }){
  let keywords = await getKeywordsStat({ projectId: projectId, cookies: cookies });
  //console.log(keywords);

  let keywordsStop = [];
  if (keywords) {
    let targets = await getTargets({
      keywordsId: keywords.map((key) => (key.id)),
      cookies: cookies,
      projectId: projectId
    })

    if (targets) {
      for (let i = 0; i < keywords.length; i++) {
        let keyword = keywords[i];
        let target = targets[keyword.id];

        if(keyword.stat.loss > cpa){
          
          if(target.total == 0 || keyword.stat.loss / target.total > cpa){
            if(target.total == 0){
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
    await stopKeywords({projectId:projectId, cookies:cookies, keywordsId: keywordsStop.map(key => (key.id))})
    
  }
}