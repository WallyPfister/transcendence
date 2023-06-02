export interface AuthRouteProps {
    component: JSX.Element,
    isSignUp: boolean,
    isVerify: boolean,
}

export interface PrivateRouteProps {
    component: JSX.Element
}

export interface ErrorResponse {
    error?: string;
    message?: string;
    statusCode?: number;
}

export interface TimerProps {
    isRunning: boolean,
    setIsRunning: React.Dispatch<React.SetStateAction<boolean>>
}