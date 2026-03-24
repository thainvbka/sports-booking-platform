import { ComplexStatus } from "@prisma/client";
import { Request, Response } from "express";
import * as adminService from "../../services/v1/admin.service";
import { SuccessResponse } from "../../utils/success.response";

export const getStats = async (_req: Request, res: Response) => {
  const stats = await adminService.getStats();
  return new SuccessResponse({
    message: "Get stats successfully",
    data: { stats },
  }).send(res);
};

export const getAnalytics = async (_req: Request, res: Response) => {
  const analytics = await adminService.getAnalytics();
  return new SuccessResponse({
    message: "Get analytics successfully",
    data: { analytics },
  }).send(res);
};

export const getUsers = async (req: Request, res: Response) => {
  const { page, limit, search, role, status } = req.query as any;
  const usersData = await adminService.getUsers(
    parseInt(page) || 1,
    parseInt(limit) || 10,
    search,
    role,
    status,
  );
  return new SuccessResponse({
    message: "Get users successfully",
    data: usersData,
  }).send(res);
};

export const updateUserStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role, status } = req.body;
  const updatedAccount = await adminService.updateUserStatus(
    id as string,
    role,
    status,
  );
  return new SuccessResponse({
    message: "Update user status successfully",
    data: { account: updatedAccount },
  }).send(res);
};

export const getComplexes = async (req: Request, res: Response) => {
  const { page, limit, search, status } = req.query as any;
  const complexesData = await adminService.getComplexes(
    parseInt(page) || 1,
    parseInt(limit) || 10,
    search,
    status as ComplexStatus,
  );
  return new SuccessResponse({
    message: "Get complexes successfully",
    data: complexesData,
  }).send(res);
};

export const updateComplexStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const updatedComplex = await adminService.updateComplexStatus(
    id as string,
    status as ComplexStatus,
  );
  return new SuccessResponse({
    message: "Update complex status successfully",
    data: { complex: updatedComplex },
  }).send(res);
};

export const getBookings = async (req: Request, res: Response) => {
  const { page, limit } = req.query as any;
  const bookingsData = await adminService.getBookings(
    parseInt(page) || 1,
    parseInt(limit) || 10,
  );
  return new SuccessResponse({
    message: "Get bookings successfully",
    data: bookingsData,
  }).send(res);
};

export const getPayments = async (req: Request, res: Response) => {
  const { page, limit } = req.query as any;
  const paymentsData = await adminService.getPayments(
    parseInt(page) || 1,
    parseInt(limit) || 10,
  );
  return new SuccessResponse({
    message: "Get payments successfully",
    data: paymentsData,
  }).send(res);
};
