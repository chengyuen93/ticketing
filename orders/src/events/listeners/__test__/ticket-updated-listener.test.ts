import { TicketUpdatedEvent } from '@cheng-personal/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';
import { natsWrapper } from '../../../nats-wrapper';
import { TicketUpdatedListener } from '../ticket-updated-listener';

const setup = async () => {
  // create an instance of the listener
  const listener = new TicketUpdatedListener(natsWrapper.client);

  // create and save a ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
    id: new mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();

  // create a fake data event
  const data: TicketUpdatedEvent['data'] = {
    id: ticket.id,
    version: ticket.version + 1,
    title: 'concert',
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };

  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return {
    listener,
    data,
    ticket,
    msg,
  };
};

describe('TICKET UPDATED LISTENER', () => {
  it('finds, updates and saves a ticket', async () => {
    const { listener, msg, data, ticket } = await setup();
    // call the onMessage function with the data object + message object

    await listener.onMessage(data, msg);

    // write assertions to make sure a ticket was updated
    const updatedTicket = await Ticket.findById(ticket.id);
    expect(updatedTicket!.title).toEqual(data.title);
    expect(updatedTicket!.price).toEqual(data.price);
    expect(updatedTicket!.version).toEqual(data.version);
  });

  it('acks the message', async () => {
    const { listener, msg, data } = await setup();
    // call the onMessage function with the data object + message object

    await listener.onMessage(data, msg);
    // write assertions to make sure ack function is called
    expect(msg.ack).toHaveBeenCalled();
  });

  it('does not call ack if the event has a skipped version number', async () => {
    const { listener, msg, data } = await setup();
    // call the onMessage function with the data object + message object
    data.version = 10;
    try {
      await listener.onMessage(data, msg);
    } catch (e) {}
    // write assertions to make sure ack function is not called
    expect(msg.ack).not.toHaveBeenCalled();
  });
});
