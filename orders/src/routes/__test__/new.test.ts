import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

describe('CREATE ORDERS', () => {
  it('returns an error if the ticket does not exist', async () => {
    const ticketId = new mongoose.Types.ObjectId();
    await request(app)
      .post('/api/orders')
      .set('Cookie', signin())
      .send({ ticketId })
      .expect(404);
  });

  it('returns an error if the ticket is already reserved', async () => {
    const ticketId = new mongoose.Types.ObjectId().toHexString();

    const ticket = Ticket.build({
      id: ticketId,
      title: 'concert',
      price: 20,
    });
    await ticket.save();
    const order = Order.build({
      ticket,
      status: OrderStatus.Created,
      userId: 'abc123',
      expiresAt: new Date(),
    });
    await order.save();

    await request(app)
      .post('/api/orders')
      .set('Cookie', signin())
      .send({ ticketId: ticket.id })
      .expect(400);
  });

  it('reserves a ticket', async () => {
    const ticketId = new mongoose.Types.ObjectId().toHexString();

    const ticket = Ticket.build({
      id: ticketId,
      title: 'concert',
      price: 20,
    });
    await ticket.save();

    await request(app)
      .post('/api/orders')
      .set('Cookie', signin())
      .send({ ticketId: ticket.id })
      .expect(201);
  });

  it('emits an order created event', async () => {
    const ticketId = new mongoose.Types.ObjectId().toHexString();

    const ticket = Ticket.build({
      id: ticketId,
      title: 'concert',
      price: 20,
    });
    await ticket.save();

    await request(app)
      .post('/api/orders')
      .set('Cookie', signin())
      .send({ ticketId: ticket.id })
      .expect(201);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
  });
});
