import { Request, Response } from "express";
import { SuccessResponse } from "../../utils/success.response";

import {
  createPricingRule,
  getOwnerPricingRulesByDay,
  updatePricingRule,
  deletePricingRule,
} from "../../services/v1/pricing_rule.service";

export const createPricingRuleController = async (
  req: Request,
  res: Response
) => {
  const ownerId = req.user?.profiles.ownerId as string;
  const data = req.body;
  const newPricingRules = await createPricingRule(ownerId, data);

  return new SuccessResponse({
    message: "Pricing rule created successfully",
    data: { pricingRules: newPricingRules },
  }).send(res);
};

export const getOwnerPricingRulesByDayController = async (
  req: Request,
  res: Response
) => {
  const ownerId = req.user?.profiles.ownerId as string;
  const { subFieldId, dayOfWeek } = req.query as {
    subFieldId: string;
    dayOfWeek: string;
  };

  const pricingRules = await getOwnerPricingRulesByDay(
    ownerId,
    subFieldId,
    Number(dayOfWeek)
  );

  return new SuccessResponse({
    message: "Owner pricing rules retrieved successfully",
    data: { pricingRules },
  }).send(res);
};

export const updatePricingRuleController = async (
  req: Request,
  res: Response
) => {
  const ownerId = req.user?.profiles.ownerId as string;
  const pricingRuleId = req.params.id;
  const data = req.body;

  const updatedPricingRule = await updatePricingRule(
    ownerId,
    pricingRuleId,
    data
  );

  return new SuccessResponse({
    message: "Pricing rule updated successfully",
    data: { pricingRule: updatedPricingRule },
  }).send(res);
};

export const deletePricingRuleController = async (
  req: Request,
  res: Response
) => {
  const ownerId = req.user?.profiles.ownerId as string;
  const pricingRuleId = req.params.id;

  await deletePricingRule(ownerId, pricingRuleId);

  return new SuccessResponse({
    message: "Pricing rule deleted successfully",
    data: {},
  }).send(res);
};
