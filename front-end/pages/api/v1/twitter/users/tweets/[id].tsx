import type { NextApiRequest, NextApiResponse } from "next";
import { http } from "../../../../../../lib/http";

const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN || "";

type ApiResponse = {
  userName: string;
  userId: string;
};

type ApiError = {
  statusCode: number;
  details: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse | ApiError>
) {
  const { method } = req;

  if (method === "GET") {
    const { id } = req.query;
    if (!id) {
      return res
        .status(400)
        .json({ statusCode: 400, details: "id is required" });
    }

    try {
      const data = await http(
        `https://api.twitter.com/2/tweets/${id}?expansions=author_id`,
        {
          method: "GET",
          headers: new Headers({
            Authorization: `Bearer ${TWITTER_BEARER_TOKEN}`,
          }),
        }
      );

      const userId = data.includes.users[0].id;
      const userName = data.includes.users[0].username;

      return res.status(200).json({ userId, userName });
    } catch (e) {
      console.log("request error", e);
      return res
        .status(500)
        .json({ statusCode: 500, details: "internal server error" });
    }
  }

  return res.status(405).end();
}
