import {
  OrderCancelledEvent,
  Publisher,
  Subjects,
} from '@cheng-personal/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
