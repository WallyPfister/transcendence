import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import pageLocation from "./pageLocation";

function OAuth() {
    const code = new URL(window.location.href).searchParams.get("code");
    const nav = useNavigate();

    useEffect(() => {
        pageLocation(code, nav);
    }, [code, nav]);

    return (
        <img src="../img/spinner.gif" alt="img"></img>
    )
}

export default OAuth;