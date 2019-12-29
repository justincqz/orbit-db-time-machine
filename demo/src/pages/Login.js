import React, {useState} from 'react';
import LoginStyles from "./Login.module.css";

const Login = (props) => {
    const [userText, setUserText] = useState("id");

    const handleSubmit = (e) => {
        e.preventDefault();
        props.setUser(userText);
    };

    return (
        <div className = {LoginStyles.loginContainer}>
            <form onSubmit={handleSubmit} noValidate autoComplete="off">
                <input
                    type="text"
                    value={userText}
                    onChange={(e) => {
                        setUserText(e.target.value);
                    }}>
                </input>
                <button type='submit'/>
            </form>
        </div>
    );

};

export default Login
