import type { NextApiRequest, NextApiResponse } from "next";
import supabase from "../../../../lib/supabase";

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
  res: NextApiResponse
) {
  const { method } = req;

  if (method === "GET") {

    const session = supabase.auth.session();
    res.status(200).json({session});
  }

  return res.status(405).end();
}
