import React from 'react'
import {ConnectionProvider} from "@oyster/common/lib/contexts/connection"
import TweetDecorations from "./TweetDecorations";

export default () => {

  return <ConnectionProvider>
    <TweetDecorations />
  </ConnectionProvider>
}
