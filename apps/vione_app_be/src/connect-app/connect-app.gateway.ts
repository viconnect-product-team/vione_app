import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/',
})
export class ConnectAppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ConnectAppGateway.name);
  private readonly onlineUserSockets = new Map<string, Set<string>>();

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    for (const [userId, sockets] of this.onlineUserSockets.entries()) {
      if (sockets.has(client.id)) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.onlineUserSockets.delete(userId);
          if (this.server) {
            this.server.emit('presence:user_offline', { userId });
          }
        }
      }
    }
  }

  isUserOnline(userId: string): boolean {
    if (!userId) return false;
    const sockets = this.onlineUserSockets.get(userId);
    return (sockets?.size ?? 0) > 0;
  }

  @SubscribeMessage('join:room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() room: string,
  ) {
    if (room && typeof room === 'string') {
      client.join(room);
      this.logger.log(`Client ${client.id} joined room ${room}`);

      if (room.startsWith('user:')) {
        const userId = room.replace('user:', '');
        if (userId) {
          if (!this.onlineUserSockets.has(userId)) {
            this.onlineUserSockets.set(userId, new Set());
          }
          this.onlineUserSockets.get(userId)!.add(client.id);
          if (this.server) {
            this.server.emit('presence:user_online', { userId });
          }
        }
      }
      return { ok: true, room };
    }
    return { ok: false };
  }

  @SubscribeMessage('leave:room')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() room: string,
  ) {
    if (room && typeof room === 'string') {
      client.leave(room);
      this.logger.log(`Client ${client.id} left room ${room}`);

      if (room.startsWith('user:')) {
        const userId = room.replace('user:', '');
        if (userId && this.onlineUserSockets.has(userId)) {
          const sockets = this.onlineUserSockets.get(userId)!;
          sockets.delete(client.id);
          if (sockets.size === 0) {
            this.onlineUserSockets.delete(userId);
            if (this.server) {
              this.server.emit('presence:user_offline', { userId });
            }
          }
        }
      }
      return { ok: true, room };
    }
    return { ok: false };
  }

  // ── Moment Events ─────────────────────────────────────────────

  emitMomentCommentAdded(momentId: string, comment: any) {
    if (!this.server) return;
    this.server.to(`moment:${momentId}`).emit('moment:comment_added', {
      momentId,
      comment,
    });
  }

  emitMomentCommentDeleted(momentId: string, commentId: string) {
    if (!this.server) return;
    this.server.to(`moment:${momentId}`).emit('moment:comment_deleted', {
      momentId,
      commentId,
    });
  }

  emitMomentCommentLiked(momentId: string, commentId: string, likesCount: number, userId: string, liked: boolean) {
    if (!this.server) return;
    this.server.to(`moment:${momentId}`).emit('moment:comment_liked', {
      momentId,
      commentId,
      likesCount,
      userId,
      liked,
    });
  }

  emitMomentLiked(momentId: string, likesCount: number, userId: string, liked: boolean) {
    if (!this.server) return;
    this.server.to(`moment:${momentId}`).emit('moment:liked', {
      momentId,
      likesCount,
      userId,
      liked,
    });
    // Also broadcast to general feed room so home feed updates like count in real time
    this.server.emit('moment:feed_liked', {
      momentId,
      likesCount,
    });
  }

  // ── DM Messaging Events ──────────────────────────────────────

  emitDmMessageReceived(threadId: string, recipientUserId: string, message: any, threadSummary: any) {
    if (!this.server) return;
    // Emit to active chat room
    this.server.to(`thread:${threadId}`).emit('dm:message_received', {
      threadId,
      message,
    });
    // Emit to recipient's personal user room for inbox thread list & unread count badge
    this.server.to(`user:${recipientUserId}`).emit('dm:thread_updated', {
      threadId,
      message,
      threadSummary,
    });
  }

  emitDmMessageRetracted(threadId: string, messageId: string) {
    if (!this.server) return;
    this.server.to(`thread:${threadId}`).emit('dm:message_retracted', {
      threadId,
      messageId,
    });
  }

  emitDmReadReceipt(threadId: string, readerUserId: string) {
    if (!this.server) return;
    this.server.to(`thread:${threadId}`).emit('dm:read_receipt', {
      threadId,
      readerUserId,
      readAt: new Date().toISOString(),
    });
  }

  emitDmReaction(threadId: string, messageId: string, reactions: any[]) {
    if (!this.server) return;
    this.server.to(`thread:${threadId}`).emit('dm:reaction_updated', {
      threadId,
      messageId,
      reactions,
    });
  }

  // ── NFC Touch & Connection Events ───────────────────────────

  emitNfcTapped(targetUserId: string, requesterProfile: any, connectionId: string) {
    if (!this.server) return;
    this.server.to(`user:${targetUserId}`).emit('nfc:tapped', {
      requesterProfile,
      connectionId,
      timestamp: new Date().toISOString(),
    });
  }

  emitNotification(userId: string, notification: any) {
    if (!this.server) return;
    this.server.to(`user:${userId}`).emit('notification:new', notification);
  }
}
