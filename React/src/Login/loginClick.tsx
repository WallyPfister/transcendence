import { NavigateFunction } from 'react-router-dom';
import CustomAxios from '../Util/CustomAxios';

const loginClick = (nav: NavigateFunction) => {
    const token: string | null = localStorage.getItem('token');

    if (token)
        CustomAxios.get('/auth/jwt-verify').then(() => nav('/main'));
    else
        window.location.href = process.env.REACT_APP_42_URL || 'intra.42.fr';
}

export default loginClick;