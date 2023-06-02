import CustomAxios from "../Util/CustomAxios";
import { ProfileData } from "./ProfileInterface";

const getProfileData = (user: string) => {
    return new Promise<ProfileData> (async (resolve, reject) => {
            try {
                const res = await CustomAxios.get('/member/profile', {params: {userName: user}});
                const status = res.data.status === 0 ? 'OFFLINE' : (res.data.status === 1 ? 'ONLINE' : (res.data.status === 2 ? 'WAIT' : 'IN-GAME'));
                const achieve = calcAchieve(res.data.achieve);
                const who = res.data.whois === 0 ? 'me' : (res.data.whois === 1 ? 'del' : 'add');
                const level = res.data.level > 5 ? 5 : res.data.level;
                const data = {
                    "name": res.data.name,
                    "avatar": res.data.avatar,
                    "status": status,
                    "win": res.data.win,
                    "lose": res.data.lose,
                    "level": level,
                    "score": res.data.score,
                    "achieve1": achieve[3] === 0 ? false : true,
                    "achieve2": achieve[2] === 0 ? false : true,
                    "achieve3": achieve[1] === 0 ? false : true,
                    "achieve4": achieve[0] === 0 ? false : true,
                    "whois": who
                };
                resolve(data);
            } catch (err) {
                reject(err);
            }
        }
    );
}

const getHistory = async (user: string) => {
    const res = await CustomAxios.get('/member/history', {params: {name: user}});
    return res.data;
}

const calcAchieve = (achieve: number) => {
    let bit = 1;
    let arr = [0, 0, 0, 0];

    for (let i = 0; i < 4; i++) {
        if ((achieve & bit) === bit)
            arr[i] = 1;
        else
            arr[i] = 0;
        bit = bit << 1;
    }
    return arr;
}

export const GetData = {
    getProfileData,
    getHistory,
}