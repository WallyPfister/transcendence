import { useState, useEffect } from "react";
import CustomAxios from "./CustomAxios";
import { useNavigate } from "react-router-dom";

interface AuthRouteProps {
    component: JSX.Element,
    isSignUp: boolean,
    isVerify: boolean,
}

interface PrivateGameProps {
    component: JSX.Element
}

const AuthRoute = (props: AuthRouteProps) => {
    const [isAllowed, setIsAllowed] = useState(-1);
    const nav = useNavigate();

    useEffect(() => {
        if (props.isSignUp && !props.isVerify && localStorage.getItem('ltoken'))
            setIsAllowed(1);
        else if (props.isVerify && !props.isSignUp &&localStorage.getItem('atoken'))
            setIsAllowed(1);
        else 
            setIsAllowed(0);
    }, [props.isSignUp, props.isVerify]);

    if (isAllowed === 1)
        return (props.component);
    else if (isAllowed === 0)
        nav('/');
    else
        return (<img src="../spinner.gif" alt="img"></img>);
}

const PrivateRoute = ({component}: PrivateGameProps) => {
    const [isAllowed, setIsAllowed] = useState(-1);
    const nav = useNavigate();

    if (localStorage.getItem('token')) {
        CustomAxios.get('/auth/jwt-verify')
        .then(() => {
            setIsAllowed(1);
        });
    } else
        setIsAllowed(0);

    if (isAllowed === 1)
        return (component);
    else if (isAllowed === 0)
        nav('/');
    else
        return (<img src="../spinner.gif" alt="img"></img>);
}

export const CustomRoute = {
    AuthRoute,
    PrivateRoute
};