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
  const { sub_field_id, day_of_week } = req.query as {
    sub_field_id: string;
    day_of_week: string;
  };

  const pricingRules = await getOwnerPricingRulesByDay(
    ownerId,
    sub_field_id,
    Number(day_of_week)
  );

  return new SuccessResponse({
    message: "Owner pricing rules retrieved successfully",
    data: pricingRules,
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
