// import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
// import { Server } from 'socket.io';
// import Redis from 'ioredis';

// const redis = new Redis();

// @WebSocketGateway({ cors: true })
// export class FriendsGateway {
//   @WebSocketServer()
//   server: Server;

//   async handleConnection(client) {
//     const userId = client.handshake.query.userId;
//     if (userId) await redis.set(`user:online:${userId}`, 'true');
//   }

//   async handleDisconnect(client) {
//     const userId = client.handshake.query.userId;
//     if (userId) await redis.del(`user:online:${userId}`);
//   }
// }
