import {
  Publisher,
  TicketCreatedEvent,
  Subjects,
} from '@cheng-personal/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
