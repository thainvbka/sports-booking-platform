import { Request, Response } from "express";
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../../services/v1/notification.service";
import { SuccessResponse } from "../../utils/success.response";
import { NotificationListQuery, NotificationRoleFilterQuery } from "../../validations";

export const getNotificationsController = async (req: Request, res: Response) => {
  const accountId = req.user?.accountId as string;
  const result = await getNotifications(
    accountId,
    req.query as unknown as NotificationListQuery,
  );

  return new SuccessResponse({
    message: "Notifications retrieved successfully",
    data: result,
  }).send(res);
};

export const getUnreadNotificationCountController = async (
  req: Request,
  res: Response,
) => {
  const accountId = req.user?.accountId as string;
  const result = await getUnreadNotificationCount(
    accountId,
    req.query as unknown as NotificationRoleFilterQuery,
  );

  return new SuccessResponse({
    message: "Unread notification count retrieved successfully",
    data: result,
  }).send(res);
};

export const markNotificationAsReadController = async (
  req: Request,
  res: Response,
) => {
  const accountId = req.user?.accountId as string;
  const result = await markNotificationAsRead(accountId, req.params.id as string);

  return new SuccessResponse({
    message: "Notification marked as read",
    data: result,
  }).send(res);
};

export const markAllNotificationsAsReadController = async (
  req: Request,
  res: Response,
) => {
  const accountId = req.user?.accountId as string;
  const result = await markAllNotificationsAsRead(
    accountId,
    req.query as unknown as NotificationRoleFilterQuery,
  );

  return new SuccessResponse({
    message: "All notifications marked as read",
    data: result,
  }).send(res);
};

