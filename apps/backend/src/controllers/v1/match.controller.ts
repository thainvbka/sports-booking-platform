import { Request, Response } from "express";
import {
  acceptMatchParticipant,
  cancelMatch,
  closeMatch,
  createMatch,
  getMatchByIdForPlayer,
  getMatchParticipants,
  getMyMatches,
  getPublicMatchById,
  getPublicMatches,
  joinMatch,
  leaveMatch,
  rejectMatchParticipant,
  reopenMatch,
} from "../../services/v1/match.service";
import { SuccessResponse } from "../../utils/success.response";
import {
  CreateMatchInput,
  JoinMatchInput,
  MatchParticipantsQuery,
  MyMatchesQuery,
  PublicMatchesQuery,
} from "../../validations";

export const getPublicMatchesController = async (
  req: Request,
  res: Response,
) => {
  const result = await getPublicMatches(
    req.query as unknown as PublicMatchesQuery,
  );

  return new SuccessResponse({
    message: "Matches retrieved successfully",
    data: result,
  }).send(res);
};

export const getPublicMatchByIdController = async (
  req: Request,
  res: Response,
) => {
  const match = await getPublicMatchById(req.params.id as string);

  return new SuccessResponse({
    message: "Match detail retrieved successfully",
    data: { match },
  }).send(res);
};

export const getMatchByIdForPlayerController = async (
  req: Request,
  res: Response,
) => {
  const playerId = req.user?.profiles.playerId as string;
  const match = await getMatchByIdForPlayer(playerId, req.params.id as string);

  return new SuccessResponse({
    message: "Match detail retrieved successfully",
    data: { match },
  }).send(res);
};

export const createMatchController = async (req: Request, res: Response) => {
  const playerId = req.user?.profiles.playerId as string;
  const match = await createMatch(playerId, req.body as CreateMatchInput);

  return new SuccessResponse({
    message: "Match created successfully",
    data: { match },
  }).send(res);
};

export const joinMatchController = async (req: Request, res: Response) => {
  const playerId = req.user?.profiles.playerId as string;
  const body = req.body as JoinMatchInput;
  const participant = await joinMatch(
    playerId,
    req.params.id as string,
    body.introduction,
  );

  return new SuccessResponse({
    message: "Join request submitted successfully",
    data: { participant },
  }).send(res);
};

export const leaveMatchController = async (req: Request, res: Response) => {
  const playerId = req.user?.profiles.playerId as string;
  const participant = await leaveMatch(playerId, req.params.id as string);

  return new SuccessResponse({
    message: "Left match successfully",
    data: { participant },
  }).send(res);
};

export const getMyMatchesController = async (req: Request, res: Response) => {
  const playerId = req.user?.profiles.playerId as string;
  const result = await getMyMatches(
    playerId,
    req.query as unknown as MyMatchesQuery,
  );

  return new SuccessResponse({
    message: "My matches retrieved successfully",
    data: result,
  }).send(res);
};

export const getMatchParticipantsController = async (
  req: Request,
  res: Response,
) => {
  const creatorId = req.user?.profiles.playerId as string;
  const result = await getMatchParticipants(
    creatorId,
    req.params.id as string,
    req.query as unknown as MatchParticipantsQuery,
  );

  return new SuccessResponse({
    message: "Match participants retrieved successfully",
    data: result,
  }).send(res);
};

export const acceptMatchParticipantController = async (
  req: Request,
  res: Response,
) => {
  const creatorId = req.user?.profiles.playerId as string;
  const participant = await acceptMatchParticipant(
    creatorId,
    req.params.id as string,
    req.params.participantId as string,
  );

  return new SuccessResponse({
    message: "Participant accepted successfully",
    data: { participant },
  }).send(res);
};

export const rejectMatchParticipantController = async (
  req: Request,
  res: Response,
) => {
  const creatorId = req.user?.profiles.playerId as string;
  const participant = await rejectMatchParticipant(
    creatorId,
    req.params.id as string,
    req.params.participantId as string,
  );

  return new SuccessResponse({
    message: "Participant rejected successfully",
    data: { participant },
  }).send(res);
};

export const closeMatchController = async (req: Request, res: Response) => {
  const creatorId = req.user?.profiles.playerId as string;
  const match = await closeMatch(creatorId, req.params.id as string);

  return new SuccessResponse({
    message: "Match closed successfully",
    data: { match },
  }).send(res);
};

export const reopenMatchController = async (req: Request, res: Response) => {
  const creatorId = req.user?.profiles.playerId as string;
  const match = await reopenMatch(creatorId, req.params.id as string);

  return new SuccessResponse({
    message: "Match reopened successfully",
    data: { match },
  }).send(res);
};

export const cancelMatchController = async (req: Request, res: Response) => {
  const creatorId = req.user?.profiles.playerId as string;
  const match = await cancelMatch(creatorId, req.params.id as string);

  return new SuccessResponse({
    message: "Match canceled successfully",
    data: { match },
  }).send(res);
};
