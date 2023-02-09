import {
  ExpirationCompletedEvent,
  Publisher,
  Subjects,
} from '@cheng-personal/common';

export class ExpirationCompletedPublisher extends Publisher<ExpirationCompletedEvent> {
  readonly subject = Subjects.ExpirationCompleted;
}
