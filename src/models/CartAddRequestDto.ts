import { type ReorderDto } from "./ReorderDto";

export type CartAddRequestDto = {
  originalOrderId?: string;
  reOrders: ReorderDto | null;
};
