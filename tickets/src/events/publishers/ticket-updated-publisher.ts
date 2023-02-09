import {
  Publisher,
  TicketUpdatedEvent,
  Subjects,
} from '@cheng-personal/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
