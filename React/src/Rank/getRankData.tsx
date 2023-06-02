import CustomAxios from "../Util/CustomAxios";

const getRankData = async () => {
    const res = await CustomAxios.get('/member/ranking');
    return res.data;
}

export default getRankData;