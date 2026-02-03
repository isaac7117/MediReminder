import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();
const prisma = new PrismaClient();

// Subscribe to push notifications
router.post('/subscribe', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { subscription } = req.body;

    if (!subscription) {
      return res.status(400).json({ message: 'Subscription required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const subscriptions = user.pushSubscriptions || [];
    const subscriptionStr = JSON.stringify(subscription);

    // Check if subscription already exists
    if (!subscriptions.includes(subscriptionStr)) {
      subscriptions.push(subscriptionStr);

      await prisma.user.update({
        where: { id: userId },
        data: {
          pushSubscriptions: subscriptions
        }
      });
    }

    res.json({ message: 'Successfully subscribed to push notifications' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Unsubscribe from push notifications
router.post('/unsubscribe', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { subscription } = req.body;

    if (!subscription) {
      return res.status(400).json({ message: 'Subscription required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const subscriptions = (user.pushSubscriptions || []).filter(
      (sub: any) => sub !== JSON.stringify(subscription)
    );

    await prisma.user.update({
      where: { id: userId },
      data: {
        pushSubscriptions: subscriptions
      }
    });

    res.json({ message: 'Successfully unsubscribed from push notifications' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get VAPID public key
router.get('/vapid-public-key', (req: Request, res: Response) => {
  res.json({
    vapidPublicKey: process.env.VAPID_PUBLIC_KEY || ''
  });
});

// Test push notification - enviar notificación de prueba
router.post('/test', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { sendPushNotification } = await import('../services/notification.service.js');

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const subscriptions = user.pushSubscriptions || [];

    if (subscriptions.length === 0) {
      return res.status(400).json({ 
        message: 'No tienes notificaciones push habilitadas. Activa las notificaciones primero.',
        hasSubscriptions: false
      });
    }

    console.log(`[Notifications] Enviando notificación de prueba a ${subscriptions.length} dispositivos`);

    const results = await Promise.allSettled(
      subscriptions.map((sub: string) => 
        sendPushNotification(sub, {
          title: '🔔 ¡Notificación de Prueba!',
          body: 'Las notificaciones push están funcionando correctamente.',
          tag: 'test-notification',
          data: { type: 'test', timestamp: new Date().toISOString() }
        })
      )
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    // Si hay suscripciones fallidas, limpiarlas
    if (failed > 0) {
      const validSubscriptions: string[] = [];
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          validSubscriptions.push(subscriptions[index]);
        }
      });

      if (validSubscriptions.length !== subscriptions.length) {
        await prisma.user.update({
          where: { id: userId },
          data: { pushSubscriptions: validSubscriptions }
        });
      }
    }

    res.json({ 
      message: `Notificación enviada. Exitosas: ${successful}, Fallidas: ${failed}`,
      successful,
      failed,
      totalSubscriptions: subscriptions.length
    });
  } catch (error: any) {
    console.error('[Notifications] Error en test:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
