import {useLogin} from "../utils/action";
import {useEffect} from "react";

export default () => {
  const { login, logout } = useLogin()
  useEffect(() => {
    function listener(msg: any, sender: any, sendResponse: any) {
      if (msg.type == 'LOGIN') {
        login().then(account => sendResponse({ account }))
      }

      if (msg.type == 'LOGOUT') {
        logout()
      }
    }
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener)
  }, [login])

  return null
}