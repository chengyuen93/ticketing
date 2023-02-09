import { Message } from 'node-nats-streaming';
import { Listener } from '@cheng-personal/common';
import { OrderCreatedEvent } from '@cheng-personal/common/build/events/order-created-event';
import { Subjects } from '@cheng-personal/common/build/events/subjects';
import { queueGroupName } from './queueGroupName';
import { expirationQueue } from '../../queues/expiration-queue';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
    console.log('Waiting this many ms to process the job: ', delay);
    await expirationQueue.add(
      {
        orderId: data.id,
      },
      {
        delay,
      }
    );

    msg.ack();
  }
}
