import { OrderCreatedEvent, OrderStatus } from '@cheng-personal/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCreatedListener } from '../order-created-listener';

const setup = async () => {
  // create an instance of the listener
  const listener = new OrderCreatedListener(natsWrapper.client);

  // create and save a ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 99,
    userId: 'acc',
  });
  await ticket.save();

  // create a fake data event
  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: 'bbc',
    expiresAt: 'asdasd',
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  };

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return {
    listener,
    msg,
    data,
    ticket,
  };
};

describe('ORDER CREATED LISTENER', () => {
  it('sets the orderId of the ticket', async () => {
    const { listener, ticket, data, msg } = await setup();
    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.orderId).toEqual(data.id);
  });

  it('acks the message', async () => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
  });

  it('publishes a ticket updated event', async () => {
    const { listener, data, msg, ticket } = await setup();
    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();

    const ticketUpdatedJSON = JSON.parse(
      (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
    );

    expect(data.id).toEqual(ticketUpdatedJSON.orderId);
  });
});
