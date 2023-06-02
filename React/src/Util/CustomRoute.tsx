import { useState, useEffect } from "react";
import CustomAxios from "./CustomAxios";
import { useNavigate } from "react-router-dom";
import { AuthRouteProps, PrivateRouteProps } from "./UtilInterface";

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

    useEffect(() => {
        if (isAllowed === 0)
            nav('/');
    }, [isAllowed, nav]);

    return (
        <>
        { isAllowed === 1 ? props.component : null }
        </>
    );
}

const PrivateRoute = ({component}: PrivateRouteProps) => {
    const [isAllowed, setIsAllowed] = useState(-1);
    const nav = useNavigate();

    useEffect(() => {
        if (localStorage.getItem('token')) {
            CustomAxios.get('/auth/jwt-verify')
            .then(() => {
                setIsAllowed(1);
            });
        } else
            setIsAllowed(0);
    }, []);

    useEffect(() => {
        if (isAllowed === 0)
            nav('/');
    }, [isAllowed, nav]);

    return (
        <>
        { isAllowed === 1 ? component : null }
        </>
    );
}

export const CustomRoute = {
    AuthRoute,
    PrivateRoute
};