import React from "react";
import Header from "./Header";
import Footer from "./Footer";

export default React.memo(({ children = null as any }) => {
    return <div 
      className="flex flex-col min-h-screen font-sans font-medium bg-white"
    >
      <Header gradient={false} size="sm"/>
      <div className="flex flex-col flex-1 items-center justify-center bg-gray-300 pt-5 sm:py-5">
        <div className="bg-white shadow-xl rounded-lg p-6 overflow-hidden sm:w-card w-full z-10 rounded-b-none sm:rounded-lg">
          {children}
        </div>
      </div>
      
      <div className="bg-gray-300">
        <Footer logoColor="black"/>
      </div>
  </div>
})