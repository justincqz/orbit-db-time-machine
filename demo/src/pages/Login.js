import React, {useState} from 'react';
import LoginStyles from "./Login.module.css";

const Login = (props) => {
    const [userText, setUserText] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        props.setUser(userText);
    };

    return (
        <div className = {LoginStyles.loginContainer}>
            <div className={LoginStyles.titleContainer}>
                <div className={LoginStyles.title_2}>
                    Demo_
                </div>
                <div className={LoginStyles.title}>
                    Chat
                </div>
                <div className={LoginStyles.title_2}>
                App
                </div>
            </div>
            <form onSubmit={handleSubmit} noValidate autoComplete="off">
                <input
                    className={LoginStyles.inputBox}
                    type="text"
                    value={userText}
                    placeholder="Login ID"
                    onChange={(e) => {
                        setUserText(e.target.value);
                    }}>
                </input>
            </form>
        </div>
    );

};

export default Login
