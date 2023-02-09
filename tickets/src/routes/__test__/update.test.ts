import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

describe('UPDATE TICKETS', () => {
  it('returns a 404 if the provided id does not exist', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
      .put(`/api/tickets/${id}`)
      .set('Cookie', signin())
      .send({
        title: 'Hey',
        price: 20,
      })
      .expect(404);
  });

  it('returns a 401 if the user is not authenticated', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
      .put(`/api/tickets/${id}`)
      .send({
        title: 'Hey',
        price: 20,
      })
      .expect(401);
  });

  it('returns a 401 if the user does not own the ticket', async () => {
    const title = 'concert';
    const price = 20;
    const response = await request(app)
      .post('/api/tickets')
      .set('Cookie', signin())
      .send({
        title,
        price,
      })
      .expect(201);

    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', signin())
      .send({
        title: 'Hey',
        price: 20,
      })
      .expect(401);

    const ticketResponse = await request(app)
      .get(`/api/tickets/${response.body.id}`)
      .send()
      .expect(200);

    expect(ticketResponse.body.title).toEqual(title);
    expect(ticketResponse.body.price).toEqual(price);
  });

  it('returns a 400 if the user provides an invalid title or price', async () => {
    const cookie = signin();

    const title = 'concert';
    const price = 20;
    const response = await request(app)
      .post('/api/tickets')
      .set('Cookie', cookie)
      .send({
        title,
        price,
      })
      .expect(201);

    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', cookie)
      .send({
        title: '',
        price: 20,
      })
      .expect(400);

    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', cookie)
      .send({
        price: 20,
      })
      .expect(400);

    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', cookie)
      .send({
        title: 'Hey',
        price: -20,
      })
      .expect(400);
  });

  it('updates the ticket provided valid inputs', async () => {
    const cookie = signin();

    const title = 'concert';
    const price = 20;
    const title2 = 'hey';
    const price2 = 200;

    const response = await request(app)
      .post('/api/tickets')
      .set('Cookie', cookie)
      .send({
        title,
        price,
      })
      .expect(201);

    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', cookie)
      .send({
        title: title2,
        price: price2,
      })
      .expect(200);

    const ticketResponse = await request(app)
      .get(`/api/tickets/${response.body.id}`)
      .send()
      .expect(200);

    expect(ticketResponse.body.title).toEqual(title2);
    expect(ticketResponse.body.price).toEqual(price2);
  });

  it('publishes an event', async () => {
    const cookie = signin();

    const title = 'concert';
    const price = 20;
    const title2 = 'hey';
    const price2 = 200;

    const response = await request(app)
      .post('/api/tickets')
      .set('Cookie', cookie)
      .send({
        title,
        price,
      })
      .expect(201);

    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', cookie)
      .send({
        title: title2,
        price: price2,
      })
      .expect(200);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
  });

  it('rejects updates if the ticket is reserved', async () => {
    const cookie = signin();

    const title = 'concert';
    const price = 20;
    const title2 = 'hey';
    const price2 = 200;

    const response = await request(app)
      .post('/api/tickets')
      .set('Cookie', cookie)
      .send({
        title,
        price,
      })
      .expect(201);

    const ticket = await Ticket.findById(response.body.id);
    ticket!.set({
      orderId: new mongoose.Types.ObjectId().toHexString(),
    });
    await ticket!.save();

    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', cookie)
      .send({
        title: title2,
        price: price2,
      })
      .expect(400);
  });
});
