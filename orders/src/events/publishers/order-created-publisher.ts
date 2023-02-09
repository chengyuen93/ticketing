import { OrderCreatedEvent, Publisher, Subjects } from '@cheng-personal/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}
