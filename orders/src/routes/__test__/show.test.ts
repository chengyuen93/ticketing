import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';

describe('SHOW ORDER', () => {
  it('fetches the order', async () => {
    // Create a ticket
    const ticketId = new mongoose.Types.ObjectId().toHexString();
    const ticket = Ticket.build({
      id: ticketId,
      title: 'concert',
      price: 20,
    });
    await ticket.save();

    const user = signin();
    // make a request to build an order with this ticket
    const { body: order } = await request(app)
      .post(`/api/orders`)
      .set('Cookie', user)
      .send({
        ticketId: ticket.id,
      })
      .expect(201);

    // make a request to fetch the order
    const { body: fetchedOrder } = await request(app)
      .get(`/api/orders/${order.id}`)
      .set('Cookie', user)
      .send()
      .expect(200);

    expect(fetchedOrder.id).toEqual(order.id);
  });

  it("returns an errr if one user tries to fetch another user's order", async () => {
    // Create a ticket
    const ticketId = new mongoose.Types.ObjectId().toHexString();

    const ticket = Ticket.build({
      id: ticketId,
      title: 'concert',
      price: 20,
    });
    await ticket.save();

    const user = signin();
    // make a request to build an order with this ticket
    const { body: order } = await request(app)
      .post(`/api/orders`)
      .set('Cookie', user)
      .send({
        ticketId: ticket.id,
      })
      .expect(201);

    // make a request to fetch the order
    await request(app)
      .get(`/api/orders/${order.id}`)
      .set('Cookie', signin())
      .send()
      .expect(401);
  });
});
