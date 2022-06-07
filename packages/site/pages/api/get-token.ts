import { Base64 } from "js-base64";
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import Cors from "cors";
import initMiddleware from "../../utils/initMiddleware";

 const domain =
   process.env.NODE_ENV === "development"
     ? "localhost:.*$"
     : "https://.*.wum.bo$";
// Initialize the cors middleware
const cors = initMiddleware(
  // You can read more about the available options here: https://github.com/expressjs/cors#configuration-options

  Cors({
    // Only allow requests with GET
    methods: ["GET"],
    origin: [
      "https://twitter.com",
      new RegExp(`\.${domain}`),
      new RegExp(domain),
    ],
  })
);

type Data = {
  access_token: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  // Run cors
  await cors(req, res);

  try {
    res.status(200).json({ access_token: "" });
  } catch (e) {
    console.log(e);
    res.status(500);
  }
}
