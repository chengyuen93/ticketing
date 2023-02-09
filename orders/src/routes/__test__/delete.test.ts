import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

describe('CANCEL ORDERS', () => {
  it('marks an order as cancelled', async () => {
    // create a ticket
    const ticketId = new mongoose.Types.ObjectId().toHexString();

    const ticket = Ticket.build({
      title: 'concert',
      price: 20,
      id: ticketId,
    });
    await ticket.save();

    const user = signin();
    // make a request to create an order
    const { body: order } = await request(app)
      .post(`/api/orders`)
      .set('Cookie', user)
      .send({
        ticketId: ticket.id,
      })
      .expect(201);

    // make a request to cancel the order from another user
    await request(app)
      .delete(`/api/orders/${order.id}`)
      .set('Cookie', signin())
      .send()
      .expect(401);

    // make a request to cancel the order
    await request(app)
      .delete(`/api/orders/${order.id}`)
      .set('Cookie', user)
      .send()
      .expect(204);

    // expectation to make sure the thing is cancelled
    const updatedOrder = await Order.findById(order.id);

    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
  });

  it('emit an order cancelled event', async () => {
    // create a ticket
    const ticketId = new mongoose.Types.ObjectId().toHexString();

    const ticket = Ticket.build({
      title: 'concert',
      price: 20,
      id: ticketId,
    });
    await ticket.save();

    const user = signin();
    // make a request to create an order
    const { body: order } = await request(app)
      .post(`/api/orders`)
      .set('Cookie', user)
      .send({
        ticketId: ticket.id,
      })
      .expect(201);

    // make a request to cancel the order from another user
    await request(app)
      .delete(`/api/orders/${order.id}`)
      .set('Cookie', signin())
      .send()
      .expect(401);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
  });
});
