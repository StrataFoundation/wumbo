import React from "react";
import AppContainer from "../common/AppContainer";
import { WalletSelect } from "wumbo-common";
//@ts-ignore
window.react1 = React;
export default React.memo(() => {
    return <AppContainer>
        <WalletSelect />
    </AppContainer>
})