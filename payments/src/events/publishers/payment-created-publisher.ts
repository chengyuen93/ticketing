import {
  PaymentCreatedEvent,
  Publisher,
  Subjects,
} from '@cheng-personal/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
